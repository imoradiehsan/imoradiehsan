# Bundles dist/ into one self-contained HTML (font + logo inlined) for sharing.
import base64, glob, re, sys
d = 'dist/assets/'
css = open(glob.glob(d + '*.css')[0]).read(); js = open(glob.glob(d + '*.js')[0]).read()
font = 'data:font/woff2;base64,' + base64.b64encode(open('public/fonts/IRANYekanX.woff2', 'rb').read()).decode()
logo = 'data:image/png;base64,' + base64.b64encode(open('public/logo.png', 'rb').read()).decode()
css = re.sub(r'url\([^)]*IRANYekanX[^)]*\.woff2\)', 'url(' + font + ')', css); assert font in css
js = js.replace('./logo.png', logo).replace('</script', '<\\/script')
html = f'''<title>تحلیلگر بورس</title>
<style>{css}
:root{{color-scheme:dark}} html:not(.dark){{color-scheme:light}}
</style>
<script>document.documentElement.lang='fa';document.documentElement.dir='rtl';document.documentElement.classList.add('dark')</script>
<div id="root"></div>
<script type="module">{js}</script>
'''
open(sys.argv[1], 'w').write(html)
