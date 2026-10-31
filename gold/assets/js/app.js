(function () {
  var D = window.GOLD_DATA, P = D.platforms;
  var $ = function (id) { return document.getElementById(id); };
  var fa = new Intl.NumberFormat("fa-IR");
  var NA = '<span class="na">نامشخص</span>';
  function num(s) { return Number(String(s).replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); })) || 0; }
  function toman(n) {
    if (n == null) return NA;
    if (n >= 1e9) return fa.format(+(n / 1e9).toFixed(2)) + " میلیارد";
    return fa.format(Math.round(n / 1e6)) + " میلیون";
  }
  function flag(p, key) { return p.check && p.check.some(function (c) { return c.indexOf(key) > -1; }) ? '<span class="flag">تأیید نشده</span>' : ""; }
  function yn(v, yes, no, badIfTrue) { if (v == null) return NA; var good = badIfTrue ? !v : v; return '<span class="' + (good ? "yes" : "no") + '">' + (v ? yes : no) + "</span>"; }
  function periods(p) { return p.periods.length ? p.periods.map(function (m) { return fa.format(m); }).join("، ") + " ماه" : NA; }

  $("stamp").textContent = "آخرین به‌روزرسانی داده‌ها: " + D.updated;
  var fm = $("f-model");
  Object.keys(D.models).forEach(function (k) { fm.insertAdjacentHTML("beforeend", '<option value="' + k + '">' + D.models[k] + "</option>"); });

  function list() {
    var m = fm.value, amt = num($("f-amount").value), nolock = $("f-nolock").checked, s = $("f-sort").value;
    var r = P.filter(function (p) {
      if (m && p.model !== m) return false;
      if (amt && p.maxAmount && amt > p.maxAmount) return false;
      if (amt && p.minAmount && amt < p.minAmount) return false;
      if (nolock && p.sellLocked !== false) return false;
      return true;
    });
    var key = { max: function (p) { return -(p.maxAmount || 0); }, down: function (p) { return p.downPct == null ? 999 : p.downPct; }, periods: function (p) { return -Math.max.apply(null, [0].concat(p.periods)); } }[s];
    r.sort(key ? function (a, b) { return key(a) - key(b); } : function (a, b) { return a.name.localeCompare(b.name, "fa"); });
    return r;
  }

  function render() {
    var r = list();
    $("empty").hidden = r.length > 0;
    $("rows").innerHTML = r.map(function (p) {
      return "<tr>" +
        '<td><button class="pname" data-id="' + p.id + '">' + p.name + '</button><span class="sub">' + p.tagline + "</span></td>" +
        '<td><span class="tag ' + p.model + '">' + D.models[p.model] + "</span></td>" +
        "<td>" + (p.downPct == null ? NA : fa.format(p.downPct) + "٪") + flag(p, "پیش‌پرداخت") + "</td>" +
        "<td>" + toman(p.maxAmount) + flag(p, "سقف") + (p.minAmount ? '<span class="sub">حداقل ' + toman(p.minAmount) + "</span>" : "") + "</td>" +
        "<td>" + periods(p) + flag(p, "تعداد اقساط") + "</td>" +
        "<td>" + (p.graceDays ? fa.format(p.graceDays) + " روز مهلت" : NA) + '<span class="sub">' + (p.latePenalty || "") + "</span></td>" +
        "<td>" + (p.defaultRule || NA) + "</td>" +
        "<td>" + yn(p.sellLocked, "قفل می‌شود", "آزاد", true) + flag(p, "قفل") + "</td>" +
        "<td>" + yn(p.guarantor, "لازم است", "لازم نیست", true) + "</td></tr>";
    }).join("");
  }
  ["f-model", "f-sort", "f-amount", "f-nolock"].forEach(function (id) { $(id).addEventListener("input", render); });

  // modal
  var modal = $("modal");
  $("rows").addEventListener("click", function (e) {
    var b = e.target.closest(".pname"); if (!b) return;
    var p = P.filter(function (x) { return x.id === b.dataset.id; })[0];
    $("m-body").innerHTML = "<h3 id='m-title'>" + p.name + "</h3><p>" + p.tagline + "</p><dl>" +
      "<dt>کارمزد/هزینه</dt><dd>" + (p.feeInfo || NA) + "</dd>" +
      "<dt>یادداشت</dt><dd>" + (p.note || NA) + "</dd>" +
      "<dt>نیاز به تأیید</dt><dd>" + (p.check && p.check.length ? p.check.join("، ") : "—") + "</dd></dl>" +
      '<div class="srcs"><b>منابع:</b><ul>' + p.sources.map(function (s) { return '<li><a href="' + s[1] + '" target="_blank" rel="noopener">' + s[0] + "</a></li>"; }).join("") + "</ul></div>";
    modal.hidden = false; $("m-close").focus();
  });
  function close() { modal.hidden = true; }
  $("m-close").onclick = close;
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  // calculator
  var cp = $("c-plat");
  cp.innerHTML = P.map(function (p) { return '<option value="' + p.id + '">' + p.name + "</option>"; }).join("");
  function cur() { return P.filter(function (x) { return x.id === cp.value; })[0]; }
  function syncPlat() {
    var p = cur();
    var ms = p.periods.length ? p.periods : [3, 4, 6, 12];
    $("c-months").innerHTML = ms.map(function (m) { return '<option value="' + m + '">' + fa.format(m) + " ماه</option>"; }).join("");
    if (p.downPct != null) $("c-down").value = p.downPct;
    calc();
  }
  function calc() {
    var p = cur(), amt = num($("c-amount").value), price = num($("c-price").value) || 1,
      n = Math.max(1, +$("c-months").value), down = Math.min(100, Math.max(0, num($("c-down").value))),
      miss = Math.min(n, Math.max(0, +$("c-miss").value || 0));
    var warn = "";
    if (p.maxAmount && amt > p.maxAmount) warn = "مبلغ از سقف این پلتفرم (" + toman(p.maxAmount) + ") بیشتر است.";
    else if (p.minAmount && amt < p.minAmount) warn = "مبلغ کمتر از حداقل خرید این پلتفرم است.";
    var downAmt = amt * down / 100, rest = amt - downAmt, inst = rest / n, grams = amt / price;
    var lost = inst * miss / price;
    function st(l, v, c) { return '<div class="stat ' + (c || "") + '"><small>' + l + "</small><b>" + v + "</b></div>"; }
    var h = st("مقدار طلای خریداری‌شده", fa.format(+grams.toFixed(2)) + " گرم") +
      st("پیش‌پرداخت", toman(downAmt) + " تومان") +
      st("هر قسط (بدون کارمزد)", toman(inst) + " تومان");
    if (p.model === "lock") h += st("طلای کسر‌شده برای " + fa.format(miss) + " قسط پرداخت‌نشده", fa.format(+lost.toFixed(3)) + " گرم", miss ? "bad" : "") +
      st("طلای باقی‌مانده", fa.format(+(grams - lost).toFixed(2)) + " گرم");
    else h += st("وضعیت دیرکرد", p.latePenalty || "طبق قرارداد", miss ? "bad" : "");
    if (warn) h = '<div class="stat bad" style="grid-column:1/-1"><b>' + warn + "</b></div>" + h;
    $("result").innerHTML = h;
  }
  cp.addEventListener("change", syncPlat);
  ["c-amount", "c-months", "c-price", "c-down", "c-miss"].forEach(function (id) { $(id).addEventListener("input", calc); });
  ["c-amount", "c-price"].forEach(function (id) { $(id).addEventListener("blur", function () { this.value = new Intl.NumberFormat("en-US").format(num(this.value)); }); });
  cp.value = "charisma"; render(); syncPlat();
})();
