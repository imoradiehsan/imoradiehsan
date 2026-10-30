#!/usr/bin/env python3
"""ورق — ساخت روایت صوتی با زمان‌بندی کلمه‌ها.
Usage: python3 tools/narrate.py <book-id> [--engine edge|eleven] [--voice VOICE]
Writes assets/audio/<id>.mp3 and assets/audio/<id>.json ({words:[[start,end],...]}) — one entry per
whitespace-separated word of every h / p / quote block, in book order (the same tokenization app.js uses).

Engines:
  edge   (default) Microsoft Edge neural voices via the edge-tts package, free; Persian: fa-IR-DilaraNeural, fa-IR-FaridNeural
  eleven ElevenLabs /with-timestamps; needs ELEVENLABS_API_KEY unless a proxy adds it. Default voice: Mitra (Persian storyteller)
Set CA_BUNDLE to a PEM file when HTTPS goes through an intercepting proxy.
"""
import argparse, asyncio, base64, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('book'); ap.add_argument('--engine', default='edge', choices=['edge', 'eleven']); ap.add_argument('--voice'); ap.add_argument('--rate', default='-5%')
A = ap.parse_args()
VOICE = A.voice or ('fa-IR-DilaraNeural' if A.engine == 'edge' else '01Hje9fLgarTAqnLKNEK')
GAP = {'h': 0.9, 'p': 0.55, 'quote': 0.7}   # silence after each block, seconds
PUNCT = re.compile(r'^[\W_‌]+|[\W_‌]+$')

JS = """
const fs=require('fs'); const src=fs.readFileSync(process.argv[1]+'/assets/js/books.js','utf8');
const BOOKS=new Function(src+';return BOOKS;')(); const b=BOOKS.find(x=>x.id===process.argv[2]);
if(!b) throw new Error('book not found'); console.log(JSON.stringify(b.blocks.filter(x=>['h','p','quote'].includes(x.t)).map(x=>({t:x.t,text:x.text}))));
"""
blocks = json.loads(subprocess.check_output(['node', '-e', JS, ROOT, A.book]))

def run(cmd, **kw): return subprocess.check_output(cmd, **kw)
def dur(p): return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).strip())

# ---------- engines: return (mp3 bytes, [(start, end, text)]) ----------
def tts_edge(text):
    if os.environ.get('CA_BUNDLE'):
        import certifi; certifi.where = lambda: os.environ['CA_BUNDLE']
    import edge_tts
    async def go():
        c = edge_tts.Communicate(text, VOICE, rate=A.rate, boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
        audio, words = bytearray(), []
        async for ch in c.stream():
            if ch['type'] == 'audio': audio += ch['data']
            elif ch['type'] == 'WordBoundary': words.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']))
        return bytes(audio), words
    return asyncio.run(go())

def tts_eleven(text):
    hdr = ['-H', 'content-type: application/json']
    if os.environ.get('ELEVENLABS_API_KEY'): hdr += ['-H', 'xi-api-key: ' + os.environ['ELEVENLABS_API_KEY']]
    out = run(['curl', '-sS', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_64', *hdr,
               '-d', json.dumps({'text': text, 'model_id': 'eleven_v4'}, ensure_ascii=False)])
    d = json.loads(out)
    if 'audio_base64' not in d: raise SystemExit(f'TTS failed: {out[:300]}')
    al = d['alignment']; words, cur = [], None
    for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if c.isspace():
            if cur: words.append(cur); cur = None
        else: cur = [s, e, c] if cur is None else [cur[0], e, cur[2] + c]
    if cur: words.append(cur)
    return base64.b64decode(d['audio_base64']), [tuple(w) for w in words]

def align(tokens, spoken, total):
    """Map the engine's word events onto our whitespace tokens. Punctuation-only tokens borrow the previous word's end."""
    out, j, last = [], 0, 0.0
    for tok in tokens:
        core = PUNCT.sub('', tok)
        if not core: out.append([last, last]); continue
        if j < len(spoken):
            s, e, _ = spoken[j]; j += 1
        else: s, e = last, last
        out.append([s, e]); last = e
    if j != len(spoken): # engine split or merged words differently: spread the block's time evenly instead
        print(f'  ! {len(spoken)} spoken vs {len(tokens)} tokens — spaced evenly', file=sys.stderr)
        n = len(tokens); out = [[total * i / n, total * (i + 1) / n] for i in range(n)]
    return out

tmp = tempfile.mkdtemp(); segs, all_words, offset = [], [], 0.0
for i, bl in enumerate(blocks):
    tokens = bl['text'].split(); text = ' '.join(tokens)
    print(f'[{i + 1}/{len(blocks)}] {bl["t"]}: {text[:48]}…', file=sys.stderr)
    audio, spoken = (tts_edge if A.engine == 'edge' else tts_eleven)(text)
    seg = os.path.join(tmp, f's{i:03}.mp3'); open(seg, 'wb').write(audio)
    d = dur(seg)
    for s, e in align(tokens, spoken, d): all_words.append([round(offset + s, 3), round(offset + min(e, d), 3)])
    gap = GAP[bl['t']]; sil = os.path.join(tmp, f'g{i:03}.mp3')
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', str(gap), '-c:a', 'libmp3lame', '-b:a', '48k', sil])
    segs += [seg, sil]; offset += d + gap
lst = os.path.join(tmp, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in segs))
os.makedirs(os.path.join(ROOT, 'assets', 'audio'), exist_ok=True)
out_mp3 = os.path.join(ROOT, 'assets', 'audio', f'{A.book}.mp3')
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'libmp3lame', '-b:a', '48k', '-ar', '24000', '-ac', '1', out_mp3])
json.dump({'engine': A.engine, 'voice': VOICE, 'duration': round(offset, 2), 'words': all_words},
          open(os.path.join(ROOT, 'assets', 'audio', f'{A.book}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
shutil.rmtree(tmp)
print(f'done: {len(all_words)} words, {offset:.1f}s → {out_mp3}', file=sys.stderr)
