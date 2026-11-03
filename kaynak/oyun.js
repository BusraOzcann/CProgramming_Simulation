/* Oyun motoru: ekranlar, görev tipleri, kayıt, ses. */
document.documentElement.lang = "tr";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const norm = (s) => String(s).split("\n").map((l) => l.trimEnd()).join("\n").trim();
const app = $("#app");

/* ---------- Kayıt ---------- */
const KEY = "cpu-stajyeri-v1";
const S = Object.assign({ xp: 0, done: {}, unlock: false, sound: true, name: "", overheats: 0, sel: null }, (() => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
})());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* kayıt yoksa da oyun çalışır */ } };

const ALL = [];
SECTORS.forEach((s) => s.missions.forEach((m, i) => { m.sector = s; m.idx = i; m.n = ALL.length; ALL.push(m); }));
const isOpen = (m) => S.unlock || m.n === 0 || !!S.done[ALL[m.n - 1].id];
const nextMission = () => ALL.find((m) => !S.done[m.id]) || null;
const rankOf = (xp) => { let r = RANKS[0][1]; RANKS.forEach(([x, n]) => { if (xp >= x) r = n; }); return r; };
const TAGS = { bits: "Anahtar", addr: "Kurye", exec: "Elle çalıştır", predict: "Kafadan hesap", parsons: "Sırala", arcade: "Hız", place: "Yerleştir", fill: "Ayarla", bugfix: "Arıza", write: "Kod yaz", order: "Sırayı bul", tours: "Tur say" };

/* ---------- Ses ---------- */
const Snd = {
  ctx: null,
  tone(f, d, t = "square", v = 0.025, at = 0) {
    if (!S.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      const t0 = this.ctx.currentTime + at;
      o.type = t; o.frequency.value = f;
      g.gain.setValueAtTime(v, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t0); o.stop(t0 + d);
    } catch (e) { /* ses açılamazsa sessiz devam */ }
  },
  ok() { this.tone(660, 0.07); this.tone(990, 0.1, "square", 0.025, 0.07); },
  bad() { this.tone(140, 0.22, "sawtooth", 0.04); },
  tick() { this.tone(1200, 0.02, "square", 0.012); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, "square", 0.03, i * 0.1)); },
  post() { this.tone(1000, 0.25, "square", 0.04); },
};

/* ---------- Görev çalışma durumu ---------- */
let Run = { token: 0 };
const later = (fn, ms) => { const t = Run.token; return setTimeout(() => { if (t === Run.token) fn(); }, ms); };
const FACES = { calm: "[-_-]", good: "[^_^]", bad: "[>_<]", shock: "[O_O]", dead: "[x_x]" };
function abi(html, mood = "calm") {
  const el = $("#abi");
  if (!el) return;
  el.className = `abi say-in ${mood}`;
  el.innerHTML = `<div class="abi-face"><b>${FACES[mood] || FACES.calm}</b><span>GCC ABİ</span></div><div class="abi-text">${html}</div>`;
  void el.offsetWidth;
}
function drawHeat() {
  const el = $("#heat");
  if (!el) return;
  const h = Run.heat;
  const col = h < 60 ? "var(--led-g)" : h < 82 ? "var(--led-a)" : "var(--led-r)";
  el.innerHTML = `<svg class="fan ${h >= 75 ? "fast" : ""}" viewBox="0 0 20 20" aria-hidden="true"><g fill="#b9ccbe"><path d="M10 10C8 5 9 1 12 1c2 0 2 4-2 9z"/><path d="M10 10c5-2 9-1 9 2 0 2-4 2-9-2z"/><path d="M10 10c2 5 1 9-2 9-2 0-2-4 2-9z"/><path d="M10 10C5 12 1 11 1 8c0-2 4-2 9 2z"/></g></svg>
    <span>${Math.round(h)}°C</span><span class="bar"><i style="width:${h}%;background:${col}"></i></span>`;
  $("#combo").textContent = Run.streak >= 3 ? `SERİ x${Run.streak}` : "";
}
function oops(html, mood = "bad", heat = 10) {
  Run.errs++;
  Run.streak = 0;
  Run.heat = Math.min(100, Run.heat + heat);
  abi(html, mood);
  Snd.bad();
  drawHeat();
  const el = $("#heat");
  if (el) { el.classList.remove("hot"); void el.offsetWidth; el.classList.add("hot"); }
  if (Run.heat >= 100) thermal();
}
function nice(html) {
  Run.streak++;
  Run.heat = Math.max(30, Run.heat - 2);
  abi(html || pick(ABI.good), "good");
  Snd.ok();
  drawHeat();
}
function thermal() {
  S.overheats++;
  save();
  Run.token++;
  const m = Run.m;
  const o = document.createElement("div");
  o.className = "overlay";
  o.innerHTML = `<div><h2>TERMAL KAPANMA</h2><p>Çekirdek 100°C'yi gördü, sistem kendini korumak için kapandı. Görev baştan başlıyor.</p>
    <p class="silk">GCC ABİ: Sakin. Kağıt kalem al, her satırdan sonra kutuları yaz. Hata yapmak serbest, aynı hatayı yapmak değil.</p>
    <div class="row"><button class="btn gold" id="again">Soğudu, tekrar dene</button><button class="btn" id="tomap">Anakarta dön</button></div></div>`;
  document.body.appendChild(o);
  $("#again", o).onclick = () => { o.remove(); openMission(m.id, true); };
  $("#tomap", o).onclick = () => { o.remove(); home(); };
  $("#again", o).focus();
}

/* ---------- Kod görünümü ---------- */
function classify(src) {
  const cls = new Array(src.length).fill("");
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|^\s*#[^\n]*)|("(?:\\.|[^"\\\n])*")|('(?:\\.|[^'\\\n])*')|\b(int|float|double|char|long|short|unsigned|signed|const|void|if|else|for|while|do|return|break|continue|sizeof)\b|\b(printf|scanf|puts|putchar|main|sqrt|pow|abs|fabs)\b|\b(\d+\.?\d*)\b/gm;
  let m;
  while ((m = re.exec(src))) {
    const c = m[1] ? "cc" : m[2] || m[3] ? "cs" : m[4] ? "ck" : m[5] ? "cf" : "cn";
    for (let i = m.index; i < m.index + m[0].length; i++) cls[i] = c;
  }
  return cls;
}
function codeHTML(src, o = {}) {
  const cls = classify(src);
  const from = o.from === undefined ? -1 : o.from, to = o.to === undefined ? -1 : o.to;
  let off = 0, html = "";
  src.split("\n").forEach((ln, idx) => {
    const n = idx + 1;
    let inner = "", i = 0;
    while (i < ln.length) {
      const ab = off + i;
      const c = cls[ab], h = ab >= from && ab < to;
      let j = i + 1;
      while (j < ln.length && cls[off + j] === c && (off + j >= from && off + j < to) === h) j++;
      const k = [c, h ? "hl" : ""].filter(Boolean).join(" ");
      const t = esc(ln.slice(i, j));
      inner += k ? `<span class="${k}">${t}</span>` : t;
      i = j;
    }
    const lc = ["cl", o.pc === n ? "pc" : "", o.pick ? "pick" : "", o.bad === n ? "badl" : "", o.good === n ? "goodl" : ""].filter(Boolean).join(" ");
    html += `<div class="${lc}" data-line="${n}"><span class="gut">${o.pc === n ? "▶ " : ""}${n}</span><code>${inner || " "}</code></div>`;
    off += ln.length + 1;
  });
  return html;
}

/* ---------- RAM görünümü ---------- */
function renderRam(el, mem, o = {}) {
  const B = C.BASE;
  let top = B + 8 * (o.rows || 3);
  mem.forEach((v) => { top = Math.max(top, v.addr + v.size); });
  if (o.pulse) top = Math.max(top, o.pulse.addr + o.pulse.size);
  const rows = Math.ceil((top - B) / 8);
  const flash = o.flash || [];
  let h = `<div class="ramhead"><span></span><div class="off">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<span>+${i}</span>`).join("")}</div></div>`;
  for (let r = 0; r < rows; r++) {
    const start = B + r * 8;
    let a = start, cells = "";
    while (a < start + 8) {
      const v = mem.find((x) => x.addr === a);
      if (v) {
        const val = o.noVal ? "" : v.v === null ? "?" : C.showVal(v.type, v.v, v.g);
        const cl = ["vbox", `t-${v.type}`, `sz${v.size}`, o.pick ? "pick" : "", flash.includes(v.name) ? "flash" : "", v.g && !o.noVal ? "gb" : ""].filter(Boolean).join(" ");
        const nm = v.size === 1 ? v.name : `${v.type} ${v.name}`;
        cells += `<button type="button" class="${cl}" style="grid-column:span ${v.size}" data-name="${esc(v.name)}" data-addr="${v.addr}" ${o.pick ? "" : 'tabindex="-1"'}>
          <span class="nm">${esc(nm)}</span><span class="vl">${esc(val)}</span><span class="ad2">${C.hex(v.addr)}</span></button>`;
        a += v.size;
      } else {
        const pul = o.pulse && a >= o.pulse.addr && a < o.pulse.addr + o.pulse.size;
        cells += `<i class="byte${pul ? " pulse" : ""}${o.free ? " free" : ""}" data-a="${a}" title="${C.hex(a)}"></i>`;
        a++;
      }
    }
    h += `<div class="ramrow"><span class="ad">${C.hex(start)}</span><div class="cells">${cells}</div></div>`;
  }
  el.innerHTML = h;
}
function ghostAt(target, text) {
  const r = target.getBoundingClientRect();
  const g = document.createElement("div");
  g.className = "ghost";
  g.textContent = text;
  g.style.left = r.left + 6 + "px";
  g.style.top = r.top + r.height / 2 - 10 + "px";
  document.body.appendChild(g);
  setTimeout(() => g.remove(), 950);
}
function flyTo(fromEl, toEl, text) {
  if (!fromEl || !toEl || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  const t = document.createElement("div");
  t.className = "fly";
  t.textContent = text;
  t.style.left = a.left + "px";
  t.style.top = a.top + "px";
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.transform = `translate(${b.left - a.left + 6}px, ${b.top - a.top + 8}px)`; }));
  setTimeout(() => t.remove(), 460);
}
function stepText(st) {
  if (!st) return `<em>Hazır. İleri düğmesine bas.</em>`;
  const note = st.note ? `<em>${esc(st.note)}</em>` : "";
  switch (st.kind) {
    case "decl": return `<code>${st.vtype} ${esc(st.name)}</code> için ${st.size} bayt ayrıldı, adresi ${C.hex(st.addr)}. ${st.hasInit ? `<code>${esc(st.sub)}</code>` : `<em>İlk değer verilmedi. İçinde önceden kalan çöp var.</em>`}${note}`;
    case "write": return `<code>${esc(st.sub || "")}</code>${note}`;
    case "print": return `Ekrana yazıldı: <code>${esc(st.text.replace(/\n/g, "\\n"))}</code>`;
    case "cond": return `Koşul: <code>${esc(st.sub)}</code>`;
    case "scan": return st.scans.map((s) => `Klavyeden <code>${esc(C.showVal(s.type, s.v, false))}</code> okundu, <code>&amp;${esc(s.name)} = ${C.hex(s.addr)}</code> adresine yazıldı.`).join(" ");
    case "free": return `Blok bitti. <code>${esc(st.names.join(", "))}</code> RAM'den kalktı, o baytlar artık boş.`;
    case "flow": return esc(st.text);
    case "end": return `Program bitti.`;
    case "crash": return `<code>ÇÖKTÜ</code> ${esc(st.msg)}`;
    case "wait": return `Program klavyeden değer bekliyor. Girdi kutusuna yaz ve yeniden çalıştır.`;
  }
  return "İfade hesaplandı, kimseye yazılmadı.";
}
const changedOf = (st) => {
  if (!st) return [];
  if (st.kind === "decl") return [st.name];
  return (st.writes || []).map((w) => w.name);
};
function traceHTML(steps, upto) {
  const names = [];
  const rows = [];
  const cur = {};
  for (let i = 0; i <= upto && i < steps.length; i++) {
    const st = steps[i];
    if (!st) continue;
    const ch = [];
    if (st.kind === "decl") { if (!names.includes(st.name)) names.push(st.name); cur[st.name] = st.g ? "???" : C.showVal(st.vtype, st.value, false); ch.push(st.name); }
    (st.writes || []).forEach((w) => { if (!names.includes(w.name)) names.push(w.name); cur[w.name] = w.g ? "???" : C.showVal(w.type, w.v, false); ch.push(w.name); });
    if (ch.length) rows.push({ line: st.line, vals: Object.assign({}, cur), ch });
  }
  if (!names.length) return `<p class="why">Henüz bir kutuya yazılmadı.</p>`;
  return `<table><thead><tr><th>satır</th>${names.map((n) => `<th>${esc(n)}</th>`).join("")}</tr></thead><tbody>${rows.slice(-9).map((r) => `<tr><td>${r.line}</td>${names.map((n) => `<td class="${r.ch.includes(n) ? "c" : ""}">${esc(r.vals[n] === undefined ? "" : r.vals[n])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/* ---------- Adım oynatıcı ---------- */
function makePlayer(o) {
  let i = -1, t = null;
  const steps = o.steps;
  const draw = () => {
    const st = steps[i];
    o.codeEl.innerHTML = codeHTML(o.src, st ? { from: st.from, to: st.to, pc: st.line } : {});
    renderRam(o.ramEl, st ? st.mem : [], { flash: changedOf(st) });
    if (st && st.writes && st.writes.length && st.kind !== "scan") {
      const w = st.writes[st.writes.length - 1];
      const box = $(`.vbox[data-name="${w.name}"] .vl`, o.ramEl);
      if (box && !w.oldG && o.ghost !== false) ghostAt(box, C.showVal(w.type, w.old, false));
    }
    const crash = st && st.kind === "crash";
    o.lcdEl.classList.toggle("err", !!crash);
    o.lcdEl.textContent = (st ? st.out : "") + (crash ? `\n*** PROGRAM ÇÖKTÜ ***` : "");
    if (o.noteEl) o.noteEl.innerHTML = stepText(st);
    if (o.traceEl) o.traceEl.innerHTML = traceHTML(steps, i);
    if (o.posEl) o.posEl.textContent = `adım ${Math.max(0, i + 1)} / ${steps.length}`;
    if (o.onDraw) o.onDraw(i);
  };
  const api = {
    get i() { return i; },
    stop() { if (t) clearInterval(t); t = null; if (o.onStop) o.onStop(); },
    go(n) { i = Math.max(-1, Math.min(steps.length - 1, n)); draw(); },
    next() { if (i < steps.length - 1) { i++; draw(); Snd.tick(); return true; } api.stop(); if (o.onEnd) o.onEnd(); return false; },
    prev() { api.stop(); api.go(i - 1); },
    last() { api.stop(); api.go(steps.length - 1); },
    first() { api.stop(); api.go(-1); },
    get playing() { return !!t; },
    play(ms) { api.stop(); const tk = Run.token; t = setInterval(() => { if (tk !== Run.token) { clearInterval(t); t = null; return; } api.next(); }, ms); },
  };
  draw();
  return api;
}

/* ---------- Ortak değer denetimi ---------- */
function checkVal(type, value, g, raw) {
  const txt = String(raw).trim();
  if (g) return { ok: txt === "???" || txt === "?", code: "needgarbage" };
  if (txt === "???" || txt === "?") return { ok: false, code: "notgarbage" };
  if (txt === "") return { ok: false, code: "empty" };
  if (type === "char") {
    const m = /^'?(.)'?$/.exec(txt);
    if (/^-?\d+$/.test(txt) && Number(txt) === value) return { ok: true };
    if (m && m[1].charCodeAt(0) === value) return { ok: true };
    return { ok: false, code: "wrong" };
  }
  const n = Number(txt.replace(",", "."));
  if (Number.isNaN(n)) return { ok: false, code: "nan" };
  if (type === "float" || type === "double") return { ok: Math.abs(n - value) < 0.0015, code: "wrong" };
  if (!Number.isInteger(n)) return { ok: false, code: "intdec" };
  return { ok: n === value, code: "wrong" };
}
const VAL_MSG = {
  needgarbage: "O sayıyı nereden buldun? Bu kutuya kimse temiz bir değer yazmadı. Doğru cevap ??? düğmesi.",
  notgarbage: "Hayır, bu değer belli. RAM'e bak ve hesapla.",
  empty: "Boş bırakma, bir değer yaz.",
  nan: "Sayı ya da karakter yazmalısın.",
  intdec: "Bu kutu int. Ondalık tutamaz.",
};

/* ---------- Görev tipleri ---------- */
const TYPES = {};

function benchHTML(o = {}) {
  return `<div class="bench">
    <div class="col">
      <div class="pane"><div class="silk"><span>U1 · PROGRAM</span><span>main()</span></div><div class="codebox" id="code"></div></div>
      <div class="cmd" id="cmd"></div>
    </div>
    <div class="col">
      <div class="pane ram-pane"><div class="silk"><span>RAM0 · BELLEK</span><span>1 kare = 1 bayt</span></div><div class="ram" id="ram"></div></div>
      <div class="lcdwrap"><span class="silk">EKRAN · STDOUT</span><div class="lcd" id="lcd"></div></div>
      ${o.trace ? `<div class="pane"><div class="silk"><span>İZ TABLOSU</span><span>RAM'de geçmiş yok, bu senin notun</span></div><div class="trace" id="trace"></div></div>` : ""}
    </div>
  </div>`;
}

/* Satır sonu soruları */
function runAfter(list, cmd, done) {
  const qs = (list || []).slice();
  const nextQ = () => {
    const q = qs.shift();
    if (!q) return done();
    const opts = shuffle(q.opts.map((t, i) => ({ t, ok: i === q.a })));
    cmd.innerHTML = `<div class="q">${q.q}</div><div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.t)}</button>`).join("")}</div><div class="why" id="why"></div>`;
    $$(".opt", cmd).forEach((b) => {
      b.onclick = () => {
        const o = opts[+b.dataset.i];
        if (o.ok) {
          b.classList.add("ok");
          $$(".opt", cmd).forEach((x) => { x.disabled = true; });
          nice();
          $("#why", cmd).innerHTML = `<p>${q.why}</p><div class="row" style="margin-top:8px"><button class="btn gold" id="goon">Devam</button></div>`;
          $("#goon", cmd).onclick = nextQ;
          $("#goon", cmd).focus();
        } else {
          b.classList.add("no");
          b.disabled = true;
          oops(pick(ABI.bad));
        }
      };
    });
  };
  nextQ();
}

TYPES.exec = (m, stage) => {
  const steps = C.run(m.code, { stdin: m.stdin || "" }).steps;
  stage.innerHTML = benchHTML({ trace: m.showTrace });
  const codeEl = $("#code"), ramEl = $("#ram"), lcdEl = $("#lcd"), cmd = $("#cmd"), traceEl = $("#trace");
  let i = 0, mem = [], last = "";
  renderRam(ramEl, mem);
  lcdEl.textContent = "";
  if (traceEl) traceEl.innerHTML = traceHTML(steps, -1);
  const lastHTML = () => (last ? `<div class="lastop">${last}</div>` : "");
  function commit(st, then) {
    const hl = $(".hl", codeEl) || $(".cl.pc", codeEl);
    mem = st.mem;
    const ch = changedOf(st);
    const prevBox = st.writes && st.writes[0] ? $(`.vbox[data-name="${st.writes[0].name}"] .vl`, ramEl) : null;
    let ghost = null;
    if (prevBox && st.writes[0] && !st.writes[0].oldG && st.kind !== "scan") ghost = C.showVal(st.writes[0].type, st.writes[0].old, false);
    renderRam(ramEl, mem, { flash: ch });
    lcdEl.textContent = st.out;
    if (traceEl) traceEl.innerHTML = traceHTML(steps, i);
    if (ch[0]) {
      const box = $(`.vbox[data-name="${ch[0]}"]`, ramEl);
      const val = st.kind === "decl" ? (st.g ? "???" : C.showVal(st.vtype, st.value, false)) : st.writes && st.writes[0] ? (st.writes[0].g ? "???" : C.showVal(st.writes[0].type, st.writes[0].v, false)) : "";
      flyTo(hl, box, val);
      if (ghost !== null && box) ghostAt($(".vl", box), ghost);
    }
    last = stepText(st);
    i++;
    (then || next)();
  }
  function askValue(st, title, type, value, g, name, hint, onOk) {
    let tries = 0;
    const isNum = type !== "char";
    cmd.innerHTML = `${lastHTML()}<div class="prompt">${title}</div>
      <div class="row"><input class="tin" id="val" autocomplete="off" autocapitalize="off" spellcheck="false" ${isNum ? 'inputmode="text"' : ""} aria-label="Değer">
      <button class="btn gold" id="okb">YAZ</button><button class="btn" id="unk">??? belirsiz</button></div><div class="reveal" id="rev"></div>`;
    const inp = $("#val", cmd);
    inp.focus({ preventScroll: true });
    const go = (txt) => {
      const r = checkVal(type, value, g, txt);
      if (r.ok) { nice(st.g ? "Evet. İçinde ne olduğunu kimse bilmiyor. Ben bile." : undefined); onOk(); return; }
      tries++;
      const trap = m.trapText && m.trapText[`${name}:${String(txt).trim().replace(",", ".")}`];
      const msg = trap || VAL_MSG[r.code] || pick(ABI.bad);
      if (tries <= 3) oops(msg); else abi("Cevap altta yazıyor stajyer, onu yaz da devam edelim.", "calm");
      if (tries === 2 && hint) $("#rev", cmd).textContent = `Şöyle düşün: ${hint}`;
      if (tries >= 3) $("#rev", cmd).textContent = `Doğrusu: ${g ? "???" : C.showVal(type, value, false)}. Yaz, geçelim.`;
      inp.select();
    };
    $("#okb", cmd).onclick = () => go(inp.value);
    $("#unk", cmd).onclick = () => go("???");
    inp.onkeydown = (e) => { if (e.key === "Enter") go(inp.value); };
  }
  function pickBox(st, title, want, wrongMsg, onOk) {
    cmd.innerHTML = `${lastHTML()}<div class="prompt">${title}</div><div class="why">RAM modülünde doğru kutuya dokun.</div>`;
    renderRam(ramEl, mem, { pick: true });
    ramEl.onclick = (e) => {
      const b = e.target.closest(".vbox");
      if (!b) return;
      if (b.dataset.name === want) { ramEl.onclick = null; onOk(); } else { b.classList.add("wrong"); oops(wrongMsg || pick(ABI.cell)); }
    };
  }
  function next() {
    const st = steps[i];
    if (!st || st.kind === "end") {
      codeEl.innerHTML = codeHTML(m.code);
      runAfter(m.after, cmd, () => finishMission());
      return;
    }
    codeEl.innerHTML = codeHTML(m.code, { from: st.from, to: st.to, pc: st.line });
    switch (st.kind) {
      case "decl": {
        const doOpen = () => {
          cmd.innerHTML = `${lastHTML()}<div class="prompt"><code>${st.vtype} ${esc(st.name)}</code> doğuyor. RAM'de ${st.size} bayt yer aç.</div><div class="row"><button class="btn gold" id="alloc">YER AÇ</button><span class="why">ya da yanıp sönen baytlara dokun</span></div>`;
          renderRam(ramEl, mem, { pulse: { addr: st.addr, size: st.size } });
          const opened = () => {
            ramEl.onclick = null;
            Snd.tick();
            const fake = mem.concat([{ name: st.name, type: st.vtype, addr: st.addr, size: st.size, v: null, g: true }]).sort((a, b) => a.addr - b.addr);
            renderRam(ramEl, fake);
            if (!st.hasInit) {
              askValue(st, `Eşittir yok. Bu kutunun içinde şu an ne var?`, st.vtype, st.value, true, st.name, null, () => commit(st));
            } else {
              const raw = st.sub.split(" = ");
              const hint = raw.length > 2 ? raw.slice(0, 2).join(" = ") : "";
              askValue(st, `<code>${esc(st.name)}</code> kutusuna hangi değer yazılır?`, st.vtype, st.value, st.g, st.name, hint, () => commit(st));
            }
          };
          $("#alloc", cmd).onclick = opened;
          $("#alloc", cmd).focus({ preventScroll: true });
          ramEl.onclick = (e) => { if (e.target.closest(".pulse")) opened(); };
        };
        if (m.askSize) {
          cmd.innerHTML = `${lastHTML()}<div class="prompt"><code>${st.vtype}</code> kaç bayt kaplar?</div><div class="row">${[1, 2, 4, 8].map((n) => `<button class="btn" data-n="${n}">${n} bayt</button>`).join("")}</div>`;
          $$("[data-n]", cmd).forEach((b) => { b.onclick = () => { if (+b.dataset.n === st.size) { nice(); doOpen(); } else { oops("Yanlış boyut. Bilgi kartındaki tabloyu hatırla."); b.disabled = true; } }; });
        } else doOpen();
        break;
      }
      case "write": {
        const w = st.writes[0];
        const raw = (st.sub || "").split(" = ");
        const hint = raw.length > 2 ? raw.slice(0, 2).join(" = ") : "";
        pickBox(st, `Bu satır hangi kutunun içini değiştirir?`, w.name, null, () => {
          Snd.tick();
          renderRam(ramEl, mem);
          askValue(st, `<code>${esc(w.name)}</code> kutusunun yeni değeri ne?`, w.type, w.v, w.g, w.name, hint, () => commit(st));
        });
        break;
      }
      case "scan": {
        const sc = st.scans[0];
        pickBox(st, `Klavyeden <code>${esc(C.showVal(sc.type, sc.v, false))}</code> geldi. Kurye bunu hangi adrese bırakır?`, sc.name, "Parantezdeki &amp; işaretinin yanına bak. Kuryeye verilen adres o.", () => {
          nice(`Kurye <code>${C.hex(sc.addr)}</code> adresine teslim etti.`);
          commit(st);
        });
        break;
      }
      case "print": {
        let tries = 0;
        const want = norm(st.text);
        cmd.innerHTML = `${lastHTML()}<div class="prompt">Ekrana tam olarak ne çıkar?</div><div class="row"><input class="tin wide" id="val" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Çıktı"><button class="btn gold" id="okb">YAZ</button></div><div class="reveal" id="rev"></div>`;
        const inp = $("#val", cmd);
        inp.focus({ preventScroll: true });
        const go = () => {
          let t = inp.value.trim().replace(/\\n$/, "").replace(/^"(.*)"$/, "$1").trim();
          if (t.replace(/\s+/g, " ") === want.replace(/\s+/g, " ")) { nice(); commit(st); return; }
          tries++;
          if (tries <= 3) oops("Tırnak içini harfi harfine yaz. %d, %f, %c yerine ise değişkenin DEĞERİNİ koy.");
          if (tries >= 3) $("#rev", cmd).textContent = `Doğrusu: ${want}. Yaz, geçelim.`;
          inp.select();
        };
        $("#okb", cmd).onclick = go;
        inp.onkeydown = (e) => { if (e.key === "Enter") go(); };
        break;
      }
      case "cond": {
        cmd.innerHTML = `${lastHTML()}<div class="prompt">Koşul doğru mu, yanlış mı? RAM'deki değerlere bak.</div><div class="row"><button class="btn" data-b="1">DOĞRU</button><button class="btn" data-b="0">YANLIŞ</button></div><div class="reveal" id="rev"></div>`;
        $$("[data-b]", cmd).forEach((b) => {
          b.onclick = () => {
            if ((b.dataset.b === "1") === st.value) { nice(); commit(st); }
            else {
              oops("Değişkenin şu anki değerini koy ve tekrar oku.");
              b.disabled = true;
              $("#rev", cmd).textContent = st.sub.split(" → ")[0];
            }
          };
        });
        break;
      }
      default: {
        cmd.innerHTML = `${lastHTML()}<div class="prompt">${stepText(st)}</div><div class="row"><button class="btn gold" id="cont">Devam</button></div>`;
        mem = st.mem;
        renderRam(ramEl, mem);
        $("#cont", cmd).onclick = () => { last = ""; i++; next(); };
        $("#cont", cmd).focus({ preventScroll: true });
      }
    }
  }
  next();
};

TYPES.order = (m, stage) => {
  const steps = C.run(m.code).steps;
  stage.innerHTML = benchHTML({ trace: true });
  const codeEl = $("#code"), ramEl = $("#ram"), lcdEl = $("#lcd"), cmd = $("#cmd"), traceEl = $("#trace");
  const labels = {};
  steps.forEach((st) => { if (st.role && !labels[st.role]) labels[st.role] = m.code.slice(st.from, st.to); });
  const bodyAt = steps.findIndex((st) => st.role === "body");
  if (bodyAt >= 0) {
    let e = bodyAt;
    while (steps[e + 1] && steps[e + 1].role === "body") e++;
    labels.body = m.code.slice(steps[bodyAt].from, steps[e].to).replace(/\s+/g, " ");
  }
  const names = { init: "başlangıç", cond: "koşul", body: "gövde", upd: "artış", exit: "döngüden çık" };
  const order = ["init", "cond", "body", "upd", "exit"].filter((r) => r === "exit" || labels[r]);
  const mistakes = { init: "Başlangıç en başta, sadece bir kez.", cond: "Her turun başında önce koşul sorulur.", body: "Koşul doğruysa sıra gövdede.", upd: "Gövde bitti, şimdi i ilerlemeli.", exit: "Koşul yanlış çıktıysa döngü biter.", ...m.mistakes };
  let i = 0, last = "";
  renderRam(ramEl, []);
  lcdEl.textContent = "";
  traceEl.innerHTML = traceHTML(steps, -1);
  const apply = (st) => {
    codeEl.innerHTML = codeHTML(m.code, { from: st.from, to: st.to, pc: st.line });
    renderRam(ramEl, st.mem, { flash: changedOf(st) });
    lcdEl.textContent = st.out;
    traceEl.innerHTML = traceHTML(steps, i);
    last = stepText(st);
    i++;
  };
  function next() {
    const st = steps[i];
    const want = st && st.kind !== "end" ? st.role : "exit";
    if (st && st.kind !== "end" && !st.role) { apply(st); return next(); }
    cmd.innerHTML = `${last ? `<div class="lastop">${last}</div>` : ""}<div class="prompt">Sırada hangi parça çalışır?</div>
      <div class="opts">${order.map((r) => `<button class="opt mono" data-r="${r}"><b>${names[r]}</b>${labels[r] ? ` · ${esc(labels[r])}` : ""}</button>`).join("")}</div>`;
    $$("[data-r]", cmd).forEach((b) => {
      b.onclick = () => {
        if (b.dataset.r === want) {
          nice();
          if (want === "exit") {
            codeEl.innerHTML = codeHTML(m.code);
            runAfter(m.after, cmd, () => finishMission());
            return;
          }
          apply(st);
          if (want === "body") {
            const parts = [last];
            while (steps[i] && steps[i].role === "body") { apply(steps[i]); parts.push(last); }
            last = parts.join("<br>");
          }
          next();
        } else {
          b.classList.add("no");
          b.disabled = true;
          oops(mistakes[want]);
        }
      };
    });
  }
  codeEl.innerHTML = codeHTML(m.code);
  next();
};

TYPES.predict = (m, stage) => {
  const res = C.run(m.code, { stdin: m.stdin || "" });
  stage.innerHTML = benchHTML({ trace: true });
  const codeEl = $("#code"), ramEl = $("#ram"), lcdEl = $("#lcd"), cmd = $("#cmd"), traceEl = $("#trace");
  codeEl.innerHTML = codeHTML(m.code);
  renderRam(ramEl, []);
  lcdEl.textContent = "";
  traceEl.innerHTML = `<p class="why">Burası cevabından sonra dolacak. Şimdilik kağıt kalem senin iz tablon.</p>`;
  let tries = 0;
  cmd.innerHTML = `<div class="prompt">Program bitince kutularda ne kalır? Kafanda çalıştır.</div>
    <div class="row">${m.ask.map((n) => `<label class="row mono" style="gap:6px"><b>${esc(n)} =</b> <input class="tin" style="width:92px" id="p-${esc(n)}" autocomplete="off" aria-label="${esc(n)} değeri"></label>`).join("")}<button class="btn gold" id="okb">KONTROL ET</button></div><div class="reveal" id="rev"></div>`;
  $("#p-" + m.ask[0]).focus({ preventScroll: true });
  const replay = () => {
    cmd.innerHTML = `<div class="prompt">Şimdi işlemci sırayla gösteriyor. Sen de kendi hesabınla karşılaştır.</div><div class="note" id="note" style="border:0;padding:0"></div><div class="row"><button class="btn" id="skip">Sona atla</button></div>`;
    const finishRow = () => {
      if ($("#skip")) $("#skip").remove();
      if ($("#fin")) return;
      const r = document.createElement("div");
      r.className = "row";
      r.innerHTML = `<button class="btn gold" id="fin">Görevi bitir</button>`;
      cmd.appendChild(r);
      $("#fin").onclick = () => finishMission();
      $("#fin").focus({ preventScroll: true });
    };
    const pl = makePlayer({ src: m.code, steps: res.steps, codeEl, ramEl, lcdEl, noteEl: $("#note"), traceEl, onEnd: finishRow });
    pl.play(900);
    $("#skip").onclick = () => { pl.last(); finishRow(); };
  };
  const go = () => {
    let allOk = true;
    m.ask.forEach((n) => {
      const v = res.vars[n];
      const inp = $("#p-" + n);
      const r = checkVal(v.t, v.v, v.g, inp.value);
      inp.style.borderColor = r.ok ? "var(--led-g)" : "var(--led-r)";
      if (!r.ok) allOk = false;
    });
    if (allOk) { nice("Tamamı doğru. Kafandaki işlemci sağlam."); replay(); return; }
    tries++;
    if (tries < 3) oops(tries === 1 ? "Kırmızı kutular yanlış. Her satırdan sonra değerleri kağıda yaz, tekrar dene." : "Hala yok. Son bir hakkın var. Baştan, satır satır.");
    else { oops("Peki. Bir de işlemciyle birlikte bakalım, nerede ayrıldığını gör."); replay(); }
  };
  $("#okb").onclick = go;
  $$(".tin", cmd).forEach((x) => { x.onkeydown = (e) => { if (e.key === "Enter") go(); }; });
};

TYPES.bits = (m, stage) => {
  const w = [128, 64, 32, 16, 8, 4, 2, 1];
  const on = new Array(8).fill(false);
  let idx = 0, lock = false;
  stage.innerHTML = `<div class="bitbox"><div class="rounds" id="rd"></div><div class="switches" id="sws"></div><div class="bitread" id="read"></div></div>`;
  const val = () => on.reduce((s, b, i) => s + (b ? w[i] : 0), 0);
  const draw = () => {
    const v = val();
    const t = m.targets[idx];
    $("#rd").innerHTML = m.targets.map((_, i) => `<span class="led ${i < idx ? "on" : i === idx ? "amber" : ""}"></span>`).join("");
    $("#sws").innerHTML = w.map((x, i) => `<button class="sw ${on[i] ? "on" : ""}" data-i="${i}" aria-pressed="${on[i]}" aria-label="${x} ağırlıklı anahtar"><span class="wt">${x}</span><span class="track"><i></i></span><span class="bv">${on[i] ? 1 : 0}</span></button>`).join("");
    $("#read").innerHTML = `<div class="target"><span>HEDEF</span><b>${t.v}</b></div><div><span>SAYI OLARAK</span><b>${v}</b></div>${t.reveal ? `<div><span>KARAKTER OLARAK</span><b>${v >= 32 && v < 127 ? `'${esc(String.fromCharCode(v))}'` : "-"}</b></div>` : ""}<div><span>BAYT</span><b class="mono" style="font-size:20px;font-family:var(--f-m)">${on.map((b) => (b ? 1 : 0)).join("")}</b></div>`;
    $$(".sw").forEach((b) => {
      b.onclick = () => {
        if (lock) return;
        on[+b.dataset.i] = !on[+b.dataset.i];
        Snd.tick();
        draw();
        if (val() === m.targets[idx].v) {
          lock = true;
          nice();
          later(() => {
            idx++;
            lock = false;
            if (idx >= m.targets.length) return finishMission();
            on.fill(false);
            abi(m.targets[idx].say);
            draw();
          }, 900);
        }
      };
    });
  };
  abi(m.targets[0].say);
  draw();
};

TYPES.addr = (m, stage) => {
  const addrs = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => 0x1000 + i);
  const cells = {};
  let idx = 0, hold = null;
  stage.innerHTML = `<div class="col"><div class="pane ram-pane"><div class="silk"><span>RAM0 · BELLEK SOKAĞI</span><span>her kapı 1 bayt</span></div><div class="ram"><div class="street" id="street"></div></div></div><div class="cmd" id="cmd"></div></div>`;
  const drawStreet = (fl) => {
    $("#street").innerHTML = addrs.map((a) => `<button class="door ${hold === a ? "src" : ""} ${fl === a ? "flash" : ""}" data-a="${a}"><b>${cells[a] === undefined ? "" : cells[a]}</b><span>${C.hex(a)}</span></button>`).join("");
  };
  const cmd = $("#cmd");
  const task = () => {
    const t = m.tasks[idx];
    if (!t) return runAfter(m.after, cmd, () => finishMission());
    hold = null;
    cmd.innerHTML = `<div class="prompt">${t.text}</div>${t.op === "put" ? `<div class="row"><span class="why">Kargon:</span><span class="parcel">${t.val}</span></div>` : ""}<div id="sub"></div>`;
    drawStreet();
    wire(t);
  };
  const doneTask = (fl) => { nice(); idx++; drawStreet(fl); later(task, 500); };
  const wire = (t) => {
    $("#street").onclick = (e) => {
      const b = e.target.closest(".door");
      if (!b) return;
      const a = +b.dataset.a;
      if (t.op === "put") {
        if (a === t.addr) { cells[a] = t.val; doneTask(a); }
        else oops(`O kapının numarası ${C.hex(a)}. Sen ${C.hex(t.addr)} arıyorsun.`);
      } else if (t.op === "copy") {
        if (hold === null) {
          if (a === t.from) { hold = a; Snd.tick(); drawStreet(); $("#sub", cmd).innerHTML = `<div class="row"><span class="why">Elinde değerin kopyası var:</span><span class="parcel">${cells[a]}</span></div>`; }
          else oops(`Önce kaynağa git: ${C.hex(t.from)}.`);
        } else if (a === t.to) { cells[a] = cells[t.from]; doneTask(a); }
        else oops(`Hedef ${C.hex(t.to)}. O kapıya bırakma.`);
      } else if (t.op === "read") {
        if (a !== t.addr) { oops(`O kapının numarası ${C.hex(a)}. Sen ${C.hex(t.addr)} arıyorsun.`); return; }
        $("#street").onclick = null;
        $("#sub", cmd).innerHTML = `<div class="row"><input class="tin" id="val" autocomplete="off" aria-label="Değer"><button class="btn gold" id="okb">YAZ</button></div>`;
        const inp = $("#val", cmd);
        inp.focus({ preventScroll: true });
        const go = () => {
          if (Number(inp.value.trim()) === cells[t.addr] && inp.value.trim() !== "") doneTask(t.addr);
          else { if (inp.value.trim() === C.hex(t.addr)) oops("Bu adres. Ben kutunun İÇİNDEKİ değeri soruyorum."); else oops("Kapının içine bak. Üstünde büyük yazan şey değer."); inp.select(); }
        };
        $("#okb", cmd).onclick = go;
        inp.onkeydown = (e) => { if (e.key === "Enter") go(); };
      }
    };
  };
  task();
};

TYPES.place = (m, stage) => {
  const ROWS = (r) => r.rows;
  let ri = 0;
  stage.innerHTML = `<div class="placewrap"><div class="col"><div class="pane"><div class="silk"><span>YERLEŞTİRİLECEKLER</span><span id="rd" class="rounds"></span></div><div class="plist" id="items"></div></div><div class="cmd" id="cmd"></div></div>
    <div class="pane ram-pane"><div class="silk"><span>RAM0 · BELLEK</span><span>1 kare = 1 bayt</span></div><div class="ram" id="ram"></div></div></div>`;
  const ramEl = $("#ram"), cmd = $("#cmd");
  const round = () => {
    const r = m.rounds[ri];
    if (!r) return finishMission();
    const items = r.items.map(([type, name], i) => ({ type, name, i, addr: null }));
    let sel = 0;
    const mem = () => items.filter((x) => x.addr !== null).map((x) => ({ name: x.name, type: x.type, addr: x.addr, size: C.SIZES[x.type], v: 0, g: false }));
    const isFree = (a, sz) => {
      const end = C.BASE + ROWS(r) * 8;
      if (a + sz > end) return false;
      return !items.some((x) => x.addr !== null && a < x.addr + C.SIZES[x.type] && x.addr < a + sz);
    };
    const draw = () => {
      $("#rd").innerHTML = m.rounds.map((_, i) => `<span class="led ${i < ri ? "on" : i === ri ? "amber" : ""}"></span>`).join("");
      $("#items").innerHTML = `<div class="placeitems">${items.map((x) => `<button class="pitem t-${x.type} ${x.i === sel && x.addr === null ? "sel" : ""}" data-i="${x.i}" ${x.addr !== null ? "disabled" : ""}>${x.type} ${esc(x.name)}${r.showSize ? ` · ${C.SIZES[x.type]} bayt` : ""}</button>`).join("")}</div>`;
      renderRam(ramEl, mem(), { rows: ROWS(r), free: true, noVal: true, pick: true });
      $$(".pitem").forEach((b) => { b.onclick = () => { sel = +b.dataset.i; draw(); }; });
      const remaining = items.filter((x) => x.addr === null).length;
      if (remaining) cmd.innerHTML = `<div class="prompt"><code>${items[sel].type} ${esc(items[sel].name)}</code> nereye oturacak? RAM'de başlangıç baytına dokun.</div>`;
    };
    const preview = (a, on) => {
      $$(".byte", ramEl).forEach((b) => b.classList.remove("prev", "badprev"));
      if (!on || items[sel].addr !== null) return;
      const sz = C.SIZES[items[sel].type];
      const ok = isFree(a, sz) && a % Math.min(sz, 8) === 0;
      for (let k = a; k < a + sz; k++) { const b = $(`.byte[data-a="${k}"]`, ramEl); if (b) b.classList.add(ok ? "prev" : "badprev"); }
    };
    ramEl.onmouseover = (e) => { const b = e.target.closest(".byte"); if (b) preview(+b.dataset.a, true); };
    ramEl.onmouseleave = () => preview(0, false);
    ramEl.onclick = (e) => {
      const v = e.target.closest(".vbox");
      if (v) {
        const it = items.find((x) => x.name === v.dataset.name);
        it.addr = null;
        sel = it.i;
        Snd.tick();
        draw();
        return;
      }
      const b = e.target.closest(".byte");
      if (!b) return;
      const it = items[sel];
      if (it.addr !== null) return;
      const a = +b.dataset.a, sz = C.SIZES[it.type];
      if (a % Math.min(sz, 8) !== 0) { abi(`${it.type} sadece ${sz}'${sz === 8 ? "in" : "ün"} katı adreslere oturur. ${C.hex(a)} olmaz. Üstteki +0, +4 işaretlerine bak.`, "shock"); Snd.bad(); return; }
      if (!isFree(a, sz)) { abi(`Sığmadı. ${it.type} ${sz} bayt ister, orada o kadar boş yer yok. Gerekirse koyduğun kutuya dokunup kaldır.`, "shock"); Snd.bad(); return; }
      it.addr = a;
      Snd.ok();
      const nx = items.find((x) => x.addr === null);
      if (nx) { sel = nx.i; draw(); return; }
      draw();
      ask(r, items);
    };
    draw();
  };
  const ask = (r, items) => {
    ramEl.onclick = null;
    ramEl.onmouseover = null;
    const it = items.find((x) => x.name === r.ask);
    const pool = [...new Set([it.addr, ...items.map((x) => x.addr), C.BASE, C.BASE + 4, C.BASE + 8, C.BASE + 12])].filter((a) => a !== it.addr).slice(0, 2);
    const opts = shuffle([it.addr, ...pool]);
    cmd.innerHTML = `<div class="prompt">Hepsi sığdı. Şimdi söyle: <code>&amp;${esc(r.ask)}</code> nedir, yani <code>${esc(r.ask)}</code> hangi adreste başlıyor?</div><div class="row">${opts.map((a) => `<button class="btn" data-a="${a}">${C.hex(a)}</button>`).join("")}</div>`;
    $$("[data-a]", cmd).forEach((b) => {
      b.onclick = () => {
        if (+b.dataset.a === it.addr) {
          nice();
          ri++;
          later(round, 500);
        } else {
          b.disabled = true;
          oops("Satırın solundaki adrese sütunun +n değerini ekle.");
        }
      };
    });
  };
  round();
};

TYPES.arcade = (m, stage) => {
  const items = shuffle(m.items);
  let idx = 0, right = 0, timer = null;
  stage.innerHTML = `<div class="col"><div class="pane" style="padding:14px;display:flex;flex-direction:column;gap:12px"><div class="row" style="justify-content:space-between"><span class="silk" id="cnt"></span><span class="silk" id="score"></span></div><div class="timer"><i id="tbar"></i></div><div class="bigq" id="bigq"></div><div class="arcopts" id="arc"></div><div class="why" id="why"></div></div></div>`;
  const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
  const ask = () => {
    clear();
    const it = items[idx];
    if (!it) { abi(`${items.length} sorudan ${right} doğru.`, "good"); return finishMission(); }
    $("#cnt").textContent = `SORU ${idx + 1} / ${items.length}`;
    $("#score").textContent = `DOĞRU: ${right}`;
    const q = $("#bigq");
    q.textContent = it.q;
    q.className = "bigq" + (it.code ? "" : " text");
    $("#why").innerHTML = "";
    $("#arc").innerHTML = m.options.map((o, i) => `<button class="btn" data-i="${i}">${esc(o)}</button>`).join("");
    const bar = $("#tbar");
    bar.style.transition = "none";
    bar.style.width = "100%";
    void bar.offsetWidth;
    bar.style.transition = `width ${m.seconds}s linear`;
    bar.style.width = "0%";
    const answer = (i) => {
      clear();
      bar.style.transition = "none";
      const acc = Array.isArray(it.a) ? it.a : [it.a];
      const ok = i !== null && acc.includes(i);
      $$("#arc .btn").forEach((b) => {
        b.disabled = true;
        if (acc.includes(+b.dataset.i)) b.classList.add("ok");
        else if (+b.dataset.i === i) b.classList.add("no");
      });
      if (ok) {
        right++;
        nice(it.why);
        idx++;
        later(ask, 900);
      } else {
        oops(i === null ? `Süre doldu. ${it.why}` : it.why);
        if (Run.heat < 100) {
          $("#why").innerHTML = `<button class="btn gold" id="goon">Sonraki</button>`;
          $("#goon").onclick = () => { idx++; ask(); };
          $("#goon").focus({ preventScroll: true });
        }
      }
    };
    $$("#arc .btn").forEach((b) => { b.onclick = () => answer(+b.dataset.i); });
    const t = Run.token;
    timer = setTimeout(() => { if (t === Run.token) answer(null); }, m.seconds * 1000);
  };
  ask();
};

function codeFrom(lines) {
  let d = 0;
  return lines.map((l) => {
    if (l.trim().startsWith("}")) d = Math.max(0, d - 1);
    const s = "    ".repeat(d) + l;
    if (l.trim().endsWith("{")) d++;
    return s;
  });
}

TYPES.parsons = (m, stage) => {
  const pool = shuffle(m.lines.map((t, i) => ({ t, i })));
  const prog = [];
  stage.innerHTML = `<div class="col"><div class="goal"><b class="h">HEDEF</b>${m.goal}</div>
    <div class="parsons">
      <div class="pane"><div class="silk"><span>PARÇALAR</span><span>dokun, ekle</span></div><div class="plist" id="pool"></div></div>
      <div class="pane"><div class="silk"><span>U1 · PROGRAM</span><span>dokun, çıkar</span></div><div class="plist" id="prog"></div><div class="row" style="padding:0 10px 12px"><button class="btn gold" id="runb">ÇALIŞTIR</button></div></div>
    </div>
    <div class="bench"><div class="pane ram-pane"><div class="silk"><span>RAM0 · BELLEK</span><span>1 kare = 1 bayt</span></div><div class="ram" id="ram"></div></div><div class="lcdwrap"><span class="silk">EKRAN · STDOUT</span><div class="lcd" id="lcd"></div></div></div>
    <div id="fin"></div></div>`;
  renderRam($("#ram"), []);
  const draw = () => {
    $("#pool").innerHTML = pool.map((x, k) => `<button class="pline" data-k="${k}">${esc(x.t)}</button>`).join("") || `<p class="why">Parça kalmadı.</p>`;
    const given = (m.given || []).map((t) => `<div class="pline fixed">${esc(t)}</div>`).join("");
    const indented = codeFrom(prog.map((x) => x.t));
    $("#prog").innerHTML = given + (prog.map((x, k) => `<button class="pline" data-k="${k}">${esc(indented[k])}</button>`).join("") || `<p class="why">Parçalara dokunarak programı kur.</p>`);
    $$("#pool .pline").forEach((b) => { b.onclick = () => { prog.push(pool.splice(+b.dataset.k, 1)[0]); Snd.tick(); draw(); }; });
    $$("#prog button.pline").forEach((b) => { b.onclick = () => { pool.push(prog.splice(+b.dataset.k, 1)[0]); Snd.tick(); draw(); }; });
  };
  draw();
  $("#runb").onclick = () => {
    if (!prog.length) return abi("Boş programı ben de çalıştırırım ama bir şey olmaz.", "shock");
    const src = [...(m.given || []), ...prog.map((x) => x.t)].join("\n");
    const r = C.run(src, { maxSteps: 2000 });
    const lastSt = r.steps[r.steps.length - 1];
    renderRam($("#ram"), lastSt ? lastSt.mem : []);
    $("#lcd").textContent = r.out;
    if (r.phase === "compile") return oops(esc(r.error.msg));
    if (!r.ok) return oops(r.hitLimit ? "Sonsuz döngü. Fan kalkıp gidecek." : esc(r.error.msg));
    let pass = true;
    if (m.expect !== undefined && norm(r.out) !== norm(m.expect)) pass = false;
    if (m.expectVars) for (const k in m.expectVars) if (!r.vars[k] || r.vars[k].v !== m.expectVars[k]) pass = false;
    if (pass) {
      nice();
      $("#runb").disabled = true;
      $("#fin").innerHTML = `<button class="btn gold" id="done">Görevi bitir</button>`;
      $("#done").onclick = () => finishMission();
      $("#done").focus({ preventScroll: true });
    } else {
      const summary = m.expectVars ? Object.keys(m.expectVars).map((k) => `${k} = ${r.vars[k] ? C.showVal(r.vars[k].t, r.vars[k].v, r.vars[k].g) : "yok"}`).join(", ") : `çıktı "${norm(r.out)}"`;
      oops(`Derlendi ama sonuç yanlış: ${esc(summary)}. RAM'e bak, nerede kaybettin?`);
    }
  };
};

TYPES.fill = (m, stage) => {
  let ri = 0;
  const round = () => {
    const r = m.rounds[ri];
    if (!r) return finishMission();
    abi(r.say);
    const parts = r.template.split(/\{\{(\d+)\}\}/);
    let code = "";
    parts.forEach((p, i) => {
      if (i % 2 === 0) code += esc(p);
      else {
        const k = +p;
        code += `<select id="slot${k}" aria-label="Seçenek ${k + 1}">${r.slots[k].map((o, j) => `<option value="${j}" ${j === r.start[k] ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
      }
    });
    stage.innerHTML = `<div class="bench"><div class="col"><div class="goal"><b class="h">HEDEF ÇIKTI</b><span class="target">${esc(r.target)}</span></div><div class="pane"><div class="silk"><span>AYAR MASASI</span><span class="rounds">${m.rounds.map((_, i) => `<span class="led ${i < ri ? "on" : i === ri ? "amber" : ""}"></span>`).join("")}</span></div><div class="fillcode">${code}</div></div></div>
      <div class="col"><div class="lcdwrap" id="lw"><span class="silk">EKRAN · STDOUT</span><div class="lcd" id="lcd"></div></div>${m.live ? `<div class="pane"><div class="silk"><span>i DEĞERLERİ</span><span id="turn"></span></div><div class="tape" style="padding:8px 12px" id="tape"></div></div>` : ""}<div class="why" id="warn"></div></div></div>`;
    let solved = false;
    const update = () => {
      if (solved) return;
      let src = r.template;
      r.slots.forEach((opts, k) => { src = src.replace(`{{${k}}}`, opts[+$(`#slot${k}`).value]); });
      const res = C.run(src, { maxSteps: 400 });
      const lw = $("#lw");
      lw.classList.toggle("meltdown", !!res.hitLimit);
      const fan = $("#heat .fan");
      if (fan) fan.classList.toggle("fast", !!res.hitLimit || Run.heat >= 75);
      if (res.hitLimit) {
        $("#lcd").textContent = res.out.slice(0, 60) + "...\n";
        $("#warn").innerHTML = `<span class="alarm">SONSUZ DÖNGÜ!</span> Koşul hiç yanlış olmuyor. Fan isyan ediyor.`;
        if ($("#tape")) { $("#tape").innerHTML = ""; $("#turn").textContent = "bitmiyor"; }
        Snd.bad();
        return;
      }
      $("#lcd").textContent = res.out;
      $("#warn").innerHTML = res.warnings.length ? esc(res.warnings[0].msg) : "";
      if ($("#tape")) {
        const toks = res.out.trim() ? res.out.trim().split(/\s+/) : [];
        $("#tape").innerHTML = toks.map((t) => `<span>${esc(t)}</span>`).join("") || `<em class="why">Hiç dönmedi. Koşul baştan yanlış.</em>`;
        $("#turn").textContent = `${toks.length} tur`;
      }
      if (res.ok && norm(res.out) === norm(r.target)) {
        solved = true;
        nice();
        $$("select", stage).forEach((s) => { s.disabled = true; });
        ri++;
        later(round, 1300);
      }
    };
    $$("select", stage).forEach((s) => { s.onchange = () => { Snd.tick(); update(); }; });
    update();
  };
  round();
};

TYPES.tours = (m, stage) => {
  let idx = 0;
  stage.innerHTML = `<div class="bench"><div class="col"><div class="pane"><div class="silk"><span>U1 · PROGRAM</span><span id="cnt"></span></div><div class="codebox" id="code"></div></div></div><div class="col"><div class="cmd" id="cmd"></div><div class="pane"><div class="silk"><span>i DEĞERLERİ</span><span id="turn"></span></div><div class="tape" style="padding:8px 12px" id="tape"></div></div></div></div>`;
  const cmd = $("#cmd");
  const ask = () => {
    const h = m.loops[idx];
    if (!h) return finishMission();
    const src = m.full
      ? `int tur = 0;\n${h.replace("{", '{\n    tur++;\n    printf("%d ", i);')}`
      : `int i;\nint tur = 0;\nfor (${h}) {\n    tur++;\n    printf("%d ", i);\n}`;
    const res = C.run(src);
    const shown = m.full ? h : `for (${h}) {\n    // gövde\n}`;
    $("#code").innerHTML = codeHTML(shown);
    $("#cnt").textContent = `${idx + 1} / ${m.loops.length}`;
    $("#tape").innerHTML = "";
    $("#turn").textContent = "";
    let tries = 0;
    cmd.innerHTML = `<div class="prompt">Gövde kaç kez çalışır? Döngü bitince <code>i</code> kaç olur?</div>
      <div class="row"><label class="row" style="gap:6px"><b>Tur</b><input class="tin" style="width:80px" id="t1" autocomplete="off" inputmode="numeric"></label><label class="row" style="gap:6px"><b>i</b><input class="tin" style="width:80px" id="t2" autocomplete="off" inputmode="text"></label><button class="btn gold" id="okb">KONTROL ET</button></div><div class="reveal" id="rev"></div>`;
    $("#t1").focus({ preventScroll: true });
    const show = () => {
      const toks = res.out.trim() ? res.out.trim().split(/\s+/) : [];
      $("#tape").innerHTML = (toks.map((t) => `<span>${esc(t)}</span>`).join("") || `<em class="why">Gövde hiç çalışmadı.</em>`);
      $("#turn").textContent = `${toks.length} tur, sonra i = ${res.vars.i.v}`;
      cmd.innerHTML = `<div class="prompt">Her kutu bir tur. ${m.full ? "Son turda i değişti, koşul yanlış çıktı ve döngü bitti" : "Son turdan sonra artış bir kez daha çalıştı, koşul yanlış çıktı"}: <code>i = ${res.vars.i.v}</code></div><div class="row"><button class="btn gold" id="goon">Sonraki döngü</button></div>`;
      $("#goon").onclick = () => { idx++; ask(); };
      $("#goon").focus({ preventScroll: true });
    };
    const go = () => {
      const a = $("#t1").value.trim(), b = $("#t2").value.trim();
      if (Number(a) === res.vars.tur.v && Number(b) === res.vars.i.v && a !== "" && b !== "") { nice(); show(); return; }
      tries++;
      const whichWrong = Number(a) !== res.vars.tur.v ? "Tur sayısı tutmuyor." : (m.full ? "Tur sayısı doğru ama i tutmuyor. Son turun içinde i'ye ne yazıldığına bak." : "Tur sayısı doğru ama i tutmuyor. Son turdan sonra artış bir kez daha çalışır.");
      oops(whichWrong);
      if (tries >= 2) { show(); }
    };
    $("#okb").onclick = go;
    ["#t1", "#t2"].forEach((q) => { $(q).onkeydown = (e) => { if (e.key === "Enter") go(); }; });
  };
  ask();
};

TYPES.bugfix = (m, stage) => {
  const before = C.run(m.code, { stdin: m.stdin || "", maxSteps: 300 });
  const outText = (r) => {
    if (r.phase === "compile") return `DERLEME HATASI\n${r.error.msg}`;
    if (r.hitLimit) return r.out.slice(0, 44) + "...\n(bitmiyor, sonsuz döngü)";
    if (r.error) return `${r.out}*** PROGRAM ÇÖKTÜ ***\n${r.error.msg}`;
    return r.out;
  };
  stage.innerHTML = `<div class="bench"><div class="col">
      <div class="pane"><div class="silk"><span>U1 · ARIZALI PROGRAM</span><span>bozuk satıra dokun</span></div><div class="codebox" id="code"></div></div>
      <div class="cmd" id="cmd"></div></div>
    <div class="col">
      <div class="lcdwrap"><span class="silk">OLMASI GEREKEN</span><div class="lcd" id="exp"></div></div>
      <div class="lcdwrap"><span class="silk">ŞU ANKİ ÇIKTI${m.stdin ? ` · klavye: ${esc(m.stdin)}` : ""}</span><div class="lcd err" id="got"></div></div>
      <div class="why" id="warn"></div>
    </div></div>`;
  $("#exp").textContent = m.expect;
  $("#got").textContent = outText(before);
  const cmd = $("#cmd");
  cmd.innerHTML = `<div class="prompt">Hangi satır bozuk? Çıktıları karşılaştır, sonra koda dokun.</div>`;
  const codeEl = $("#code");
  let lineTries = 0;
  const fan = $("#heat .fan");
  if (before.hitLimit && fan) fan.classList.add("fast");
  const drawCode = (o) => { codeEl.innerHTML = codeHTML(m.code, Object.assign({ pick: true }, o)); };
  drawCode({});
  codeEl.onclick = (e) => {
    const l = e.target.closest(".cl");
    if (!l) return;
    const n = +l.dataset.line;
    if (n !== m.bugLine) {
      lineTries++;
      oops("O satır masum. Çıktıya bak, bu farkı kim yaratabilir?");
      if (lineTries >= 2 && before.warnings.length) $("#warn").innerHTML = `Derleyici uyarısı, satır ${before.warnings[0].line}: ${esc(before.warnings[0].msg)}`;
      else if (lineTries >= 3) $("#warn").innerHTML = `İpucu: bozuk satır ${m.bugLine}.`;
      return;
    }
    codeEl.onclick = null;
    nice("Yakaladın. Şimdi nasıl düzelir?");
    codeEl.innerHTML = codeHTML(m.code, { bad: n });
    const opts = shuffle(m.options);
    cmd.innerHTML = `<div class="prompt">Bu satırın yerine ne gelmeli?</div><div class="opts">${opts.map((o, i) => `<button class="opt mono" data-i="${i}">${esc(o.text)}</button>`).join("")}</div><div class="why" id="why"></div>`;
    $$(".opt", cmd).forEach((b) => {
      b.onclick = () => {
        const o = opts[+b.dataset.i];
        if (!o.ok) {
          b.classList.add("no");
          b.disabled = true;
          oops(esc(o.why));
          return;
        }
        b.classList.add("ok");
        $$(".opt", cmd).forEach((x) => { x.disabled = true; });
        nice(esc(o.why));
        const lines = m.code.split("\n");
        lines[m.bugLine - 1] = o.text;
        const fixed = lines.join("\n");
        codeEl.innerHTML = codeHTML(fixed, { good: m.bugLine });
        const r = C.run(fixed, { stdin: m.stdin || "", maxSteps: 300 });
        const got = $("#got");
        got.classList.remove("err");
        got.textContent = outText(r);
        if (fan) fan.classList.toggle("fast", Run.heat >= 75);
        $("#warn").innerHTML = "";
        $("#why", cmd).innerHTML = `<div class="row"><button class="btn gold" id="done">Görevi bitir</button></div>`;
        $("#done").onclick = () => finishMission();
        $("#done").focus({ preventScroll: true });
      };
    });
  };
};

/* ---------- Kod yazma tezgahı (Yazma görevleri ve Laboratuvar) ---------- */
function makeBench(stage, o) {
  stage.innerHTML = `<div class="col">
    ${o.goal ? `<div class="goal"><b class="h">GÖREV</b>${o.goal}<div id="hintbox"></div></div>` : ""}
    <div class="bench">
      <div class="col">
        <div class="pane"><div class="silk"><span id="edlabel">U1 · KOD EDİTÖRÜ</span><span>Ctrl + Enter çalıştırır</span></div>
          <div class="ed" id="edwrap"><pre class="ed-gut" id="gut"></pre><textarea id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="C kodu"></textarea></div>
          <div class="codebox" id="code" hidden></div>
          <div class="note" id="note" hidden></div>
          <div class="stepper" id="stepper" hidden>
            <button class="btn small" id="s-first" aria-label="Başa dön">|◀</button>
            <button class="btn small" id="s-prev" aria-label="Geri">◀ Geri</button>
            <button class="btn small gold" id="s-next" aria-label="İleri">İleri ▶</button>
            <button class="btn small" id="s-play">Otomatik</button>
            <button class="btn small" id="s-last" aria-label="Sona git">▶|</button>
            <span class="pos" id="s-pos"></span>
          </div>
        </div>
        ${o.lab ? `<div class="goal"><label for="stdin"><b class="h">KLAVYE GİRDİSİ (scanf buradan okur)</b></label><input class="tin wide" style="width:100%" id="stdin" autocomplete="off" spellcheck="false" placeholder="Örnek: 3 4"></div>` : ""}
        <div class="row">
          <button class="btn gold" id="runb">${o.tests ? "ÇALIŞTIR VE TEST ET" : "ÇALIŞTIR"}</button>
          <button class="btn" id="stepb">ADIM ADIM İZLE</button>
          <button class="btn" id="editb" hidden>Kodu düzenle</button>
          ${o.hints ? `<button class="btn" id="hintb">İpucu</button>` : ""}
          <span id="donewrap"></span>
        </div>
      </div>
      <div class="col">
        <div class="pane ram-pane"><div class="silk"><span>RAM0 · BELLEK</span><span>1 kare = 1 bayt</span></div><div class="ram" id="ram"></div></div>
        <div class="lcdwrap"><span class="silk">EKRAN · STDOUT</span><div class="lcd" id="lcd"></div></div>
        <div class="warnbox" id="warns"></div>
        ${o.tests ? `<div class="pane" id="testp" hidden><div class="silk"><span>TESTLER</span></div><div class="tests" id="tests"></div></div>` : ""}
        <div class="pane"><div class="silk"><span>İZ TABLOSU</span><span>adım adım izlerken dolar</span></div><div class="trace" id="trace"></div></div>
      </div>
    </div></div>`;
  const ta = $("#editor"), gut = $("#gut"), codeEl = $("#code"), noteEl = $("#note"), stepper = $("#stepper"), ramEl = $("#ram"), lcdEl = $("#lcd"), traceEl = $("#trace"), warnsEl = $("#warns");
  let errLine = 0, player = null;
  ta.value = o.code || "";
  if (o.stdin && $("#stdin")) $("#stdin").value = o.stdin;
  const drawGut = () => {
    const n = ta.value.split("\n").length;
    gut.innerHTML = Array.from({ length: n }, (_, i) => (i + 1 === errLine ? `<span class="e">${i + 1}</span>` : i + 1)).join("\n");
    ta.rows = Math.max(12, n + 2);
    gut.scrollTop = ta.scrollTop;
  };
  ta.oninput = () => { errLine = 0; drawGut(); };
  ta.onscroll = () => { gut.scrollTop = ta.scrollTop; };
  ta.onkeydown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = ta.selectionStart;
      ta.setRangeText("    ", s, ta.selectionEnd, "end");
      drawGut();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      $("#runb").click();
    } else if (e.key === "Enter") {
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
      const ind = /^\s*/.exec(ta.value.slice(lineStart, s))[0] + (ta.value[s - 1] === "{" ? "    " : "");
      e.preventDefault();
      ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end");
      drawGut();
    }
  };
  drawGut();
  renderRam(ramEl, []);
  traceEl.innerHTML = traceHTML([], -1);
  const setMode = (stepping) => {
    $("#edwrap").hidden = stepping;
    codeEl.hidden = !stepping;
    noteEl.hidden = !stepping;
    stepper.hidden = !stepping;
    $("#editb").hidden = !stepping;
    $("#edlabel").textContent = stepping ? "U1 · PROGRAM (salt okunur)" : "U1 · KOD EDİTÖRÜ";
    if (!stepping && player) { player.stop(); player = null; }
  };
  const stdin = (t) => (t && t.stdin !== undefined ? t.stdin : $("#stdin") ? $("#stdin").value : "");
  const showWarns = (r) => { warnsEl.innerHTML = r.warnings.slice(0, 4).map((w) => `<div>Uyarı, satır ${w.line}: ${esc(w.msg)}</div>`).join(""); };
  const compileFail = (r) => {
    errLine = r.error.line;
    drawGut();
    setMode(false);
    lcdEl.classList.add("err");
    lcdEl.textContent = `derleme hatası, satır ${r.error.line}\n${r.error.msg}`;
    warnsEl.innerHTML = "";
    renderRam(ramEl, []);
    abi(`Satır ${r.error.line}: ${esc(r.error.msg)}`, "bad");
    Snd.bad();
  };
  const finalShow = (r) => {
    const st = r.steps[r.steps.length - 1];
    renderRam(ramEl, st ? st.mem : []);
    lcdEl.classList.toggle("err", !!(r.error && r.error.kind === "crash"));
    lcdEl.textContent = r.out + (r.error && r.error.kind === "crash" ? `\n*** PROGRAM ÇÖKTÜ ***\n${r.error.msg}` : "") + (r.hitLimit ? "\n...\n(bitmiyor, sonsuz döngü)" : "");
    traceEl.innerHTML = traceHTML(r.steps, r.steps.length - 1);
    showWarns(r);
  };
  const reportRun = (r) => {
    if (r.hitLimit) abi("Sonsuz döngü! Koşul hiç yanlış olmadı, ben de 3000 adımda fişi çektim.", "shock");
    else if (r.waiting) abi("Program scanf'te klavye bekliyor ama girdi kalmadı. Girdi kutusuna değer yaz, yeniden çalıştır.", "shock");
    else if (r.error) abi(esc(r.error.msg), "dead");
  };
  const startStepping = (src, r) => {
    setMode(true);
    let playing = false;
    player = makePlayer({
      src, steps: r.steps, codeEl, ramEl, lcdEl, noteEl, traceEl, posEl: $("#s-pos"),
      onStop: () => { playing = false; $("#s-play").textContent = "Otomatik"; },
    });
    $("#s-next").onclick = () => player.next();
    $("#s-prev").onclick = () => player.prev();
    $("#s-first").onclick = () => player.first();
    $("#s-last").onclick = () => player.last();
    $("#s-play").onclick = () => {
      if (playing) { player.stop(); return; }
      player.play(650);
      playing = true;
      $("#s-play").textContent = "Durdur";
    };
    showWarns(r);
    $("#s-next").focus({ preventScroll: true });
  };
  $("#editb").onclick = () => { setMode(false); ta.focus({ preventScroll: true }); };
  $("#stepb").onclick = () => {
    const src = ta.value;
    const firstT = o.tests ? (o.lastFail || o.tests[0]) : null;
    const r = C.run(src, { stdin: stdin(firstT) });
    if (r.phase === "compile") return compileFail(r);
    lcdEl.classList.remove("err");
    reportRun(r);
    startStepping(src, r);
  };
  $("#runb").onclick = () => {
    const src = ta.value;
    setMode(false);
    lcdEl.classList.remove("err");
    if (!o.tests) {
      const r = C.run(src, { stdin: stdin(null) });
      if (r.phase === "compile") return compileFail(r);
      finalShow(r);
      if (r.ok) { abi(r.warnings.length ? "Çalıştı ama uyarılar var. Oku onları, boşuna yazmıyorum." : "Temiz çalıştı. Nasıl çalıştığını görmek için ADIM ADIM İZLE.", "good"); Snd.ok(); } else { reportRun(r); Snd.bad(); }
      return;
    }
    const results = o.tests.map((t) => {
      const r = C.run(src, { stdin: t.stdin || "" });
      let pass = r.ok;
      if (pass && t.expect !== undefined) pass = norm(r.out) === norm(t.expect);
      if (pass && t.expectVars) {
        for (const k in t.expectVars) {
          const v = r.vars[k];
          if (!v || v.g || Math.abs(v.v - t.expectVars[k]) > (t.approx || 1e-9)) pass = false;
        }
      }
      return { t, r, pass };
    });
    if (results[0].r.phase === "compile") return compileFail(results[0].r);
    const failed = results.find((x) => !x.pass);
    o.lastFail = failed ? failed.t : null;
    finalShow((failed || results[0]).r);
    $("#testp").hidden = false;
    const varsText = (x) => Object.keys(x.t.expectVars).map((k) => { const v = x.r.vars[k]; return `${k} = ${v ? C.showVal(v.t, v.v, v.g) : "tanımlı değil"}`; }).join(", ");
    $("#tests").innerHTML = results.map((x, i) => `<div class="tst"><span class="led ${x.pass ? "on" : "red"}"></span><b>Test ${i + 1}</b>${x.t.stdin ? `<em>klavye: ${esc(x.t.stdin)}</em>` : ""}${x.pass ? "" : x.t.expect !== undefined ? `<span class="x"><em>beklenen:</em> ${esc(norm(x.t.expect))}</span><span class="x"><em>senin:</em> ${esc(norm(x.r.out)) || "(boş)"}</span>` : `<span class="x"><em>senin:</em> ${esc(varsText(x))}</span>`}</div>`).join("");
    const chk = o.check ? o.check(src) : null;
    if (failed) {
      if (failed.r.hitLimit || failed.r.error) reportRun(failed.r);
      else abi(`${results.filter((x) => x.pass).length} / ${results.length} test geçti. ADIM ADIM İZLE ile ilk başarısız testi izleyebilirsin.`, "shock");
      Snd.bad();
      return;
    }
    if (chk) { abi(esc(chk), "shock"); Snd.bad(); return; }
    abi("Bütün testler geçti. Bu kodu ben yazmış olabilirdim. Yazmazdım ama olabilirdim.", "good");
    Snd.win();
    $("#donewrap").innerHTML = `<button class="btn gold" id="fin">Görevi bitir</button>`;
    $("#fin").onclick = () => o.onPass && o.onPass();
    $("#fin").focus({ preventScroll: true });
  };
  if (o.hints) {
    let hi = 0;
    $("#hintb").onclick = () => {
      if (hi >= o.hints.length) return;
      Run.hints = (Run.hints || 0) + 1;
      $("#hintbox").insertAdjacentHTML("beforeend", `<p class="why" style="margin-top:6px"><b>İpucu ${hi + 1}:</b> ${esc(o.hints[hi])}</p>`);
      hi++;
      $("#hintb").textContent = hi >= o.hints.length ? "İpucu bitti" : "Bir ipucu daha";
      $("#hintb").disabled = hi >= o.hints.length;
    };
  }
  return { ta };
}

TYPES.write = (m, stage) => {
  makeBench(stage, { code: m.code, goal: m.goal, tests: m.tests, check: m.check, hints: m.hints, onPass: () => finishMission() });
};

/* ---------- Görev kabuğu ---------- */
function openMission(id, skipCard) {
  const m = ALL.find((x) => x.id === id);
  Run = { token: Run.token + 1, m, errs: 0, heat: 35, streak: 0, hints: 0 };
  $$(".overlay").forEach((o) => o.remove());
  window.scrollTo(0, 0);
  app.innerHTML = `<div class="wrap">
    <div class="hud">
      <button class="btn small" id="back">◀ Anakart</button>
      <div class="title"><div class="sec">${esc(m.sector.code)} · GÖREV ${m.idx + 1}/${m.sector.missions.length} · ${esc(TAGS[m.type]).toLocaleUpperCase("tr")}</div><h2>${esc(m.title)}</h2></div>
      <div class="combo" id="combo"></div>
      <div class="heat" id="heat" title="Her hatada çekirdek ısınır. 100°C olursa görev baştan başlar."></div>
    </div>
    <div class="abi" id="abi"></div>
    <details class="cardbox" id="cardbox" ${skipCard ? "" : "open"}><summary>BİLGİ KARTI</summary><div class="card-text">${m.card || ""}</div>${skipCard ? "" : `<div class="card-go"><button class="btn gold" id="go">Anladım, başla</button></div>`}</details>
    <div id="stage"></div>
  </div>`;
  drawHeat();
  abi(m.say);
  $("#back").onclick = home;
  const stage = $("#stage");
  const start = () => {
    const go = $("#go");
    if (go) go.parentElement.remove();
    $("#cardbox").open = false;
    TYPES[m.type](m, stage);
  };
  if (skipCard) start();
  else { $("#go").onclick = start; $("#go").focus({ preventScroll: true }); }
}

function finishMission() {
  const m = Run.m;
  const { errs, hints } = Run;
  const stars = errs === 0 && hints === 0 ? 3 : errs <= 3 && hints <= 1 ? 2 : 1;
  const base = m.boss ? 200 : 100;
  const earn = Math.round(base * (stars === 3 ? 1 : stars === 2 ? 0.8 : 0.6));
  const prev = S.done[m.id];
  const gain = prev ? Math.max(0, earn - prev.xp) : earn;
  S.done[m.id] = { stars: Math.max(stars, prev ? prev.stars : 0), xp: Math.max(earn, prev ? prev.xp : 0) };
  S.xp += gain;
  const secDone = m.sector.missions.every((x) => S.done[x.id]);
  save();
  Snd.win();
  if (m.final && !prev) return boot(m);
  const nx = ALL[m.n + 1];
  const title = stars === 3 ? "KUSURSUZ ÇEVRİM" : stars === 2 ? "DEVRE ÇALIŞIYOR" : "ZOR DA OLSA ÇALIŞTI";
  abi(m.win, "good");
  $("#stage").innerHTML = `<div class="result"><h2>${title}</h2>
    <div class="bigstars">${[1, 2, 3].map((i) => `<span class="led ${i <= stars ? "on" : ""}"></span>`).join("")}</div>
    <div class="reslines"><span>Kazanılan: <b>+${gain} XP</b></span><span>Hata: <b>${errs}</b></span>${hints ? `<span>İpucu: <b>${hints}</b></span>` : ""}<span>Rütbe: <b>${rankOf(S.xp)}</b></span></div>
    ${secDone && m.idx === m.sector.missions.length - 1 ? `<p class="res-text"><b>${esc(m.sector.name)}</b> onarıldı. Anakartta bir sonraki devreye akım gidiyor.</p>` : ""}
    <div class="row">${nx ? `<button class="btn gold" id="nx">Sıradaki: ${esc(nx.title)}</button>` : `<button class="btn gold" id="bootb">Boot ekranını gör</button>`}<button class="btn" id="re">Tekrar oyna</button><button class="btn" id="mp">Anakart</button></div></div>`;
  $("#cardbox").hidden = true;
  if (nx) { $("#nx").onclick = () => openMission(nx.id); $("#nx").focus({ preventScroll: true }); } else $("#bootb").onclick = () => boot(m);
  $("#re").onclick = () => openMission(m.id);
  $("#mp").onclick = home;
  window.scrollTo({ top: 0 });
}

/* ---------- Boot ekranı ---------- */
function boot() {
  Run = { token: Run.token + 1 };
  window.scrollTo(0, 0);
  app.innerHTML = `<div class="wrap"><div class="bootscreen" id="bs" role="log"></div><div id="cert"></div></div>`;
  const bs = $("#bs");
  const totalStars = Object.values(S.done).reduce((s, d) => s + d.stars, 0);
  const lines = [
    `<span class="am">CPU-STAJYERİ BIOS v1.0</span>`, `Copyright (c) GCC Abi ve Stajyerler A.Ş.`, ``,
    `Güç devresi kontrol ediliyor .......... <span class="ok">TAMAM</span>`,
    `Bellek sayılıyor ...................... <span class="ok">8192 MB TAMAM</span>`,
    `Tip çözücü (char int float double) .... <span class="ok">TAMAM</span>`,
    `Giriş / çıkış kapıları ................ <span class="ok">TAMAM</span>`,
    `Karar birimi .......................... <span class="ok">TAMAM</span>`,
    `Saat devresi .......................... <span class="ok">TIK TAK TAMAM</span>`,
    `Bekçi devresi ......................... <span class="ok">NÖBETTE</span>`,
    `Ana işlemci ........................... <span class="am">STAJYER (yeterli)</span>`, ``,
    `$ gcc merhaba.c -o merhaba`, `$ ./merhaba`, `<b class="ok">Merhaba, dunya!</b>`, ``,
    `GCC Abi: Sistem açıldı. Fena değilsin stajyer. Değişken nedir bilen birini görmek güzel.`,
  ];
  let i = 0;
  Snd.post();
  const tick = () => {
    if (i >= lines.length) return cert();
    bs.innerHTML += lines[i++] + "\n";
    Snd.tick();
    later(tick, i < 3 ? 200 : 340);
  };
  const cert = () => {
    Snd.win();
    $("#cert").innerHTML = `<div class="cert">
      <span class="silk" style="color:#345">BU MAKİNEYİ ELLE BOOT EDEN</span>
      <div class="who" id="who">${esc(S.name || "Adını yaz")}</div>
      <input id="nameinp" value="${esc(S.name)}" placeholder="Adın Soyadın" aria-label="Ad soyad" autocomplete="off">
      <h2>${esc(rankOf(S.xp))}</h2>
      <p class="nums">${S.xp} XP · ${totalStars} / ${ALL.length * 3} LED · ${S.overheats} termal kapanma</p>
      <p style="color:#345">Ekran görüntüsünü alıp hocana gönderebilirsin.</p>
      <div class="row" style="justify-content:center"><button class="btn gold" id="lb">Laboratuvara git</button><button class="btn" id="hm">Anakarta dön</button></div>
    </div>`;
    const ni = $("#nameinp");
    ni.oninput = () => { S.name = ni.value; save(); $("#who").textContent = ni.value || "Adını yaz"; };
    $("#lb").onclick = lab;
    $("#hm").onclick = home;
  };
  tick();
}

/* ---------- Laboratuvar ---------- */
function lab() {
  Run = { token: Run.token + 1, m: null, errs: 0, heat: 35, streak: 0, hints: 0 };
  window.scrollTo(0, 0);
  app.innerHTML = `<div class="wrap">
    <div class="hud"><button class="btn small" id="back">◀ Anakart</button><div class="title"><div class="sec">SERBEST ÇALIŞMA</div><h2>Laboratuvar</h2></div><div class="combo" id="combo"></div><div class="heat" id="heat" hidden></div></div>
    <div class="abi" id="abi"></div>
    <div class="exsel" id="ex"></div>
    <div id="stage"></div></div>`;
  abi("Burada puan yok, ısı yok, ben de sadece izliyorum. Kendi kodunu yaz, ADIM ADIM İZLE'ye bas. Derste çözdüğünüz kodu da buraya yapıştırabilirsin.");
  $("#back").onclick = home;
  const load = (e) => { makeBench($("#stage"), { lab: true, code: e.code, stdin: e.stdin || "" }); };
  $("#ex").innerHTML = LAB_EXAMPLES.map((e, i) => `<button class="btn small" data-i="${i}">${esc(e.name)}</button>`).join("");
  $$("#ex .btn").forEach((b) => { b.onclick = () => load(LAB_EXAMPLES[+b.dataset.i]); });
  load(LAB_EXAMPLES[0]);
}

/* ---------- Anakart (ana ekran) ---------- */
const CHIP_POS = {
  pwr: { x: 40, y: 40, w: 180, h: 110 },
  ram: { x: 280, y: 30, w: 320, h: 130 },
  type: { x: 670, y: 40, w: 190, h: 110 },
  io: { x: 670, y: 240, w: 190, h: 110 },
  alu: { x: 370, y: 240, w: 190, h: 110 },
  clk: { x: 70, y: 240, w: 190, h: 110 },
  wdt: { x: 60, y: 420, w: 190, h: 110 },
  cpu: { x: 330, y: 420, w: 240, h: 130 },
};
const TRACES = [
  ["pwr", [[220, 85], [280, 85]], [[220, 105], [280, 105]]],
  ["ram", [[600, 85], [670, 85]], [[600, 105], [670, 105]]],
  ["type", [[755, 150], [755, 240]], [[775, 150], [775, 240]]],
  ["io", [[670, 285], [560, 285]], [[670, 305], [560, 305]]],
  ["alu", [[370, 285], [260, 285]], [[370, 305], [260, 305]]],
  ["clk", [[155, 350], [155, 420]], [[175, 350], [175, 420]]],
  ["wdt", [[250, 465], [330, 465]], [[250, 485], [330, 485]]],
];
function mapSVG(selId) {
  const secDone = (s) => s.missions.every((m) => S.done[m.id]);
  const secOpen = (s) => S.unlock || s.missions.some((m) => isOpen(m));
  const pathD = (pts) => "M" + pts.map((p) => p.join(" ")).join("L");
  let tr = "";
  TRACES.forEach(([id, ...paths]) => {
    const s = SECTORS.find((x) => x.id === id);
    paths.forEach((p) => { tr += `<path class="tr ${secDone(s) ? "live" : ""}" d="${pathD(p)}"/>`; });
  });
  let chips = "";
  SECTORS.forEach((s) => {
    const p = CHIP_POS[s.id];
    const n = s.missions.filter((m) => S.done[m.id]).length;
    const done = n === s.missions.length, open = secOpen(s);
    const pins = [];
    const count = Math.floor(p.w / 22);
    for (let i = 0; i < count; i++) {
      const px = p.x + 12 + i * ((p.w - 24) / Math.max(1, count - 1)) - 3;
      pins.push(`<rect class="pin" x="${px}" y="${p.y - 7}" width="6" height="7"/><rect class="pin" x="${px}" y="${p.y + p.h}" width="6" height="7"/>`);
    }
    const ledC = done ? "var(--led-g)" : n > 0 || (open && !done) ? "var(--led-a)" : "#2a3532";
    chips += `<g class="chip ${done ? "done" : ""} ${open ? "" : "locked"} ${selId === s.id ? "sel" : ""}" data-sec="${s.id}" tabindex="0" role="button" aria-label="${esc(s.name)}, ${n} / ${s.missions.length} görev">
      ${pins.join("")}
      <rect class="body" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3"/>
      <circle cx="${p.x + 14}" cy="${p.y + 14}" r="5" fill="${ledC}" ${done || open ? `style="filter:drop-shadow(0 0 4px ${ledC})"` : ""}/>
      <text class="code" x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + 4}" text-anchor="middle">${esc(s.code)}</text>
      <text class="sub" x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + 28}" text-anchor="middle">${esc(s.name)}</text>
      <text class="prog" x="${p.x + p.w - 10}" y="${p.y + 20}" text-anchor="end">${n}/${s.missions.length}</text>
    </g>`;
  });
  const deco = [[250, 60], [640, 60], [630, 200], [320, 200], [40, 200], [870, 200], [620, 450], [640, 500], [30, 500], [30, 410], [760, 450], [800, 520]]
    .map(([x, y]) => `<circle class="via" cx="${x}" cy="${y}" r="4"/>`).join("");
  const caps = [[620, 400], [660, 400], [700, 400], [262, 505], [294, 505]].map(([x, y]) => `<rect class="deco" x="${x}" y="${y}" width="26" height="46" rx="3"/>`).join("");
  return `<svg viewBox="0 0 900 570" role="img" aria-label="Anakart haritası">${tr}${deco}${caps}${chips}
    <text class="silkt" x="620" y="540">CPU-STAJYERI REV 1.0</text>
    <text class="silkt" x="40" y="550">C1 C2 · GCC ABI ONAYLI</text></svg>`;
}

function home() {
  Run = { token: Run.token + 1 };
  $$(".overlay").forEach((o) => o.remove());
  const nx = nextMission();
  const doneN = Object.keys(S.done).filter((k) => ALL.some((m) => m.id === k)).length;
  const sel = SECTORS.find((s) => s.id === S.sel) || (nx ? nx.sector : SECTORS[0]);
  S.sel = sel.id;
  const pct = Math.round((doneN / ALL.length) * 100);
  const firstTime = !doneN;
  const say = firstTime
    ? "Bak stajyer. Bu makinenin işlemcisi yandı. Yenisi üç haftaya gelir. O zamana kadar işlemci sensin: kodu sen okuyacaksın, RAM'e sen yazacaksın. Hadi, Güç Devresi'nden başla."
    : nx ? `Dönmüşsün. Sırada <b>${esc(nx.title)}</b> var. Değişkenler seni bekliyor, onlar kendi kendilerine değer almaz.`
      : "Makine açıldı, her şey çalışıyor. Artık Laboratuvar'da kendi kodlarını izleyebilirsin.";
  app.innerHTML = `<div class="wrap">
    <div class="hero">
      <div><div class="rev">C DİLİ · DEĞİŞKENDEN DÖNGÜLERE</div><h1>CPU <em>STAJYERİ</em></h1>
      <p>Bilgisayarın işlemcisi yandı, yerine seni aldılar. C kodunu satır satır sen çalıştır, belleğe sen yaz, makineyi sen aç.</p></div>
      <div class="stats">
        <div class="rank"><span>Rütbe</span><b>${esc(rankOf(S.xp))}</b></div>
        <div><span>Deneyim</span><b>${S.xp} XP</b></div>
        <div><span>Görev</span><b>${doneN} / ${ALL.length}</b></div>
        <div class="silk" style="justify-content:space-between"><span>BOOT</span><span>%${pct}</span></div>
        <div class="bootbar"><i style="width:${pct}%"></i></div>
      </div>
    </div>
    <div class="abi" id="abi"></div>
    <div class="home-actions">
      ${nx ? `<button class="btn gold" id="cont">${firstTime ? "İşe başla" : "Devam et"}: ${esc(nx.title)}</button>` : `<button class="btn gold" id="bootb">Boot ekranını gör</button>`}
      <button class="btn" id="labb">Laboratuvar</button>
      <button class="btn line small" id="snd" aria-pressed="${S.sound}">Ses: ${S.sound ? "açık" : "kapalı"}</button>
    </div>
    <div class="board">
      <div class="map" id="map">${mapSVG(sel.id)}</div>
      <div class="secpanel">
        <h2><span>${esc(sel.code)}</span> ${esc(sel.name)}</h2>
        <p>${esc(sel.topic)}</p>
        <div class="mlist">${sel.missions.map((m) => {
          const d = S.done[m.id];
          const open = isOpen(m);
          return `<button class="mrow ${m.boss ? "boss" : ""} ${nx && nx.id === m.id ? "next" : ""}" data-m="${m.id}" ${open ? "" : "disabled"}>
            <span class="num">${String(m.n + 1).padStart(2, "0")}</span>
            <span><span class="t">${esc(m.title)}</span><span class="k">${esc(TAGS[m.type])}${m.boss ? " · devre sonu" : ""}${open ? "" : " · kilitli"}</span></span>
            <span class="stars">${[1, 2, 3].map((i) => `<span class="led ${d && i <= d.stars ? "on" : ""}"></span>`).join("")}</span></button>`;
        }).join("")}</div>
      </div>
    </div>
    <div class="foot">
      <span>İlerlemen bu tarayıcıda saklanır.</span>
      <span class="row">
        <button class="btn line small" id="unl" aria-pressed="${S.unlock}">Öğretmen modu: ${S.unlock ? "tüm görevler açık" : "kapalı"}</button>
        <span id="rst"><button class="btn line small" id="rstb">İlerlemeyi sıfırla</button></span>
      </span>
    </div>
  </div>`;
  abi(say, firstTime ? "calm" : "calm");
  save();
  if (nx) $("#cont").onclick = () => openMission(nx.id);
  else $("#bootb").onclick = () => boot();
  $("#labb").onclick = lab;
  $("#snd").onclick = () => { S.sound = !S.sound; save(); home(); };
  $("#unl").onclick = () => { S.unlock = !S.unlock; save(); home(); };
  $("#rstb").onclick = () => {
    $("#rst").innerHTML = `<span class="confirm">Bütün ilerleme silinsin mi? <button class="btn danger small" id="yes">Evet, sil</button><button class="btn small" id="no">Vazgeç</button></span>`;
    $("#yes").onclick = () => { Object.assign(S, { xp: 0, done: {}, overheats: 0, sel: null, name: "" }); save(); home(); };
    $("#no").onclick = home;
  };
  $$(".mrow").forEach((b) => { b.onclick = () => openMission(b.dataset.m); });
  const choose = (el) => { S.sel = el.dataset.sec; home(); };
  $$(".chip").forEach((c) => {
    c.onclick = () => choose(c);
    c.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(c); } };
  });
}

if (location.hash === "#lab" || location.hash === "#laboratuvar") lab();
else home();
