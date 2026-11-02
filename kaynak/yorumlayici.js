/* Küçük C yorumlayıcısı.
   Kodu baştan sona çalıştırır ve her adımın kaydını (bellek, ekran, açıklama) döndürür.
   Oyundaki tüm görevler ve Laboratuvar bu kayıtları oynatır. */
const C = (() => {
  const SIZES = { char: 1, short: 2, int: 4, long: 8, float: 4, double: 8 };
  const BASE = 0x1000;
  const KEYWORDS = new Set("auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while".split(" "));
  const TYPEWORDS = new Set(["int", "char", "float", "double", "long", "short", "unsigned", "signed", "const", "void"]);
  const CALLS = new Set(["printf", "scanf", "puts", "putchar", "sqrt", "pow", "abs", "fabs", "floor", "ceil", "round"]);
  const OPS = ["==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "(", ")", "{", "}", "[", "]", ";", ",", "?", ":"];
  const ASSIGN = new Set(["=", "+=", "-=", "*=", "/=", "%="]);
  const PREC = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
  const ESC = { n: "\n", t: "\t", "\\": "\\", '"': '"', "'": "'", 0: "\0", r: "\r", a: "\x07", b: "\b" };

  class CError extends Error {
    constructor(msg, tok, kind = "compile") {
      super(msg);
      this.line = tok ? tok.line : 0;
      this.pos = tok ? tok.pos : -1;
      this.end = tok ? tok.end : -1;
      this.kind = kind;
    }
  }

  /* ---------- Sözcük çözümleme ---------- */
  function lex(src) {
    const toks = [];
    let i = 0, line = 1;
    const fail = (msg, pos, end) => { throw new CError(msg, { line, pos, end }); };
    while (i < src.length) {
      const c = src[i];
      if (c === "\n") { line++; i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") {
        const e = src.indexOf("*/", i + 2);
        if (e < 0) fail("Açtığın /* yorumu hiç kapanmıyor. Sonuna */ ekle.", i, i + 2);
        for (let k = i; k < e; k++) if (src[k] === "\n") line++;
        i = e + 2;
        continue;
      }
      if (c === "#") { while (i < src.length && src[i] !== "\n") i++; continue; }
      const start = i;
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] || ""))) {
        const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i, i + 40));
        i += m[0].length;
        const isF = /[.eE]/.test(m[0]);
        let ty = isF ? "double" : "int";
        if (isF && /[fF]/.test(src[i] || "")) { ty = "float"; i++; }
        else if (/[lL]/.test(src[i] || "")) { if (!isF) ty = "long"; i++; }
        if (/[A-Za-z_]/.test(src[i] || "")) {
          let e = i;
          while (/[A-Za-z0-9_]/.test(src[e] || "")) e++;
          fail(`'${src.slice(start, e)}' geçersiz. Değişken adı rakamla başlayamaz.`, start, e);
        }
        toks.push({ t: "num", v: Number(m[0]), ty, text: src.slice(start, i), pos: start, end: i, line });
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        while (/[A-Za-z0-9_]/.test(src[i] || "")) i++;
        const w = src.slice(start, i);
        if (src[i] && /[^\x00-\x7F]/.test(src[i])) fail(`'${w}${src[i]}...': değişken adında Türkçe karakter kullanma. Sadece a-z, A-Z, 0-9 ve _ güvenli.`, start, i + 1);
        toks.push({ t: KEYWORDS.has(w) ? "kw" : "id", v: w, pos: start, end: i, line });
        continue;
      }
      if (c === '"') {
        let v = "";
        i++;
        while (i < src.length && src[i] !== '"') {
          if (src[i] === "\n") fail('Tırnağı açtın ama aynı satırda kapatmadın. Sonuna " ekle.', start, i);
          if (src[i] === "\\") { i++; v += ESC[src[i]] !== undefined ? ESC[src[i]] : src[i]; i++; }
          else v += src[i++];
        }
        if (i >= src.length) fail('Tırnağı açtın ama kapatmadın. Sonuna " ekle.', start, i);
        i++;
        toks.push({ t: "str", v, pos: start, end: i, line, text: src.slice(start, i) });
        continue;
      }
      if (c === "'") {
        i++;
        let ch;
        if (src[i] === "\\") { i++; ch = ESC[src[i]] !== undefined ? ESC[src[i]] : src[i]; i++; }
        else ch = src[i++];
        if (src[i] !== "'") {
          fail("Tek tırnak içine tek karakter girer: 'A' olur, 'AB' olmaz. Metin için çift tırnak kullanılır.", start, i);
        }
        i++;
        toks.push({ t: "chr", v: ch.charCodeAt(0), pos: start, end: i, line, text: src.slice(start, i) });
        continue;
      }
      const op = OPS.find((o) => src.startsWith(o, i));
      if (!op) {
        if (/[^\x00-\x7F]/.test(c)) fail(`'${c}' harfini tırnak dışında kullanamazsın. Değişken adlarında Türkçe karakter olmaz.`, i, i + 1);
        fail(`'${c}' işaretini tanımıyorum.`, i, i + 1);
      }
      i += op.length;
      toks.push({ t: "op", v: op, pos: start, end: i, line });
    }
    toks.push({ t: "eof", v: "dosya sonu", pos: src.length, end: src.length, line });
    return toks;
  }

  /* ---------- Sözdizim çözümleme ---------- */
  function parse(src) {
    const toks = lex(src);
    const warnings = [];
    let p = 0;
    const scopes = [new Map()];
    const tk = () => toks[p];
    const at = (v) => { const t = toks[p]; return (t.t === "op" || t.t === "kw") && t.v === v; };
    const eat = (v) => (at(v) ? toks[p++] : null);
    const prev = () => toks[Math.max(0, p - 1)];
    const tokName = (t) => (t.t === "eof" ? "dosya sonu" : `'${t.text || t.v}'`);
    function need(v) {
      if (at(v)) return toks[p++];
      if (v === ";") throw new CError(`Bu satırın sonunda ';' eksik. C'de her komut noktalı virgülle biter.`, prev());
      if (v === "}") throw new CError(`'}' eksik. Açtığın her süslü parantezi kapatmalısın.`, prev());
      if (v === ")") throw new CError(`')' eksik. Açtığın parantezi kapatmadın.`, prev());
      throw new CError(`Burada '${v}' bekliyordum, ${tokName(tk())} geldi.`, tk());
    }
    const isType = () => tk().t === "kw" && TYPEWORDS.has(tk().v);
    function parseType() {
      const words = [];
      const first = tk();
      while (isType()) words.push(toks[p++].v);
      const isConst = words.includes("const");
      let base = "int";
      if (words.includes("double")) base = "double";
      else if (words.includes("float")) base = "float";
      else if (words.includes("char")) base = "char";
      else if (words.includes("short")) base = "short";
      else if (words.includes("long")) base = "long";
      else if (words.includes("void")) base = "void";
      return { base, isConst, tok: first };
    }
    function findVar(name) {
      for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return scopes[i].get(name);
      return null;
    }
    function parseDecl(wantSemi) {
      const start = tk();
      const ty = parseType();
      if (ty.base === "void") throw new CError("void tipinde değişken olmaz. İçine bir şey koyamazsın.", start);
      const items = [];
      for (;;) {
        const id = tk();
        if (id.t === "num") throw new CError(`Değişken adı rakamla başlayamaz. ${id.text} geçersiz.`, id);
        if (id.t === "kw") throw new CError(`'${id.v}' C'nin kendi kelimesi. Değişken adı olarak kullanamazsın.`, id);
        if (id.t !== "id") throw new CError(`Tipten sonra bir değişken adı bekliyordum, ${tokName(id)} geldi.`, id);
        p++;
        if (at("[")) throw new CError("Diziler bu oyunda henüz yok. Sıradaki konun olacak, sabret.", tk());
        if (at("(")) throw new CError("Kendi fonksiyonunu yazmak bu oyunda henüz yok.", id);
        if (scopes[scopes.length - 1].has(id.v)) throw new CError(`'${id.v}' zaten tanımlı. Aynı isimle ikinci kutu açamazsın. Değerini değiştireceksen başına tip yazma.`, id);
        let init = null;
        if (eat("=")) init = parseAssign();
        scopes[scopes.length - 1].set(id.v, { type: ty.base, isConst: ty.isConst });
        items.push({ type: ty.base, name: id.v, init, pos: id.pos, end: prev().end, line: id.line });
        if (!eat(",")) break;
        if (tk().t === "num") throw new CError("Ondalık sayılarda virgül değil nokta kullanılır: 2,5 değil 2.5", tk());
      }
      if (tk().t === "id" && tk().line === prev().line) throw new CError(`Değişken adında boşluk olmaz. Bitişik yaz ya da _ kullan: ${items[items.length - 1].name}_${tk().v}`, tk());
      let semi = null;
      if (wantSemi) semi = need(";");
      const node = { k: "decl", items, pos: start.pos, end: semi ? semi.end : prev().end, line: start.line };
      return node;
    }
    function parseBlock() {
      const open = need("{");
      scopes.push(new Map());
      const body = [];
      while (!at("}")) {
        if (tk().t === "eof") throw new CError("'}' eksik. Açtığın süslü parantez kapanmadı.", prev());
        body.push(parseStmt());
      }
      const close = toks[p++];
      scopes.pop();
      return { k: "block", body, pos: open.pos, end: close.end, line: open.line, endLine: close.line, endPos: close.pos };
    }
    function parseStmt() {
      const t = tk();
      if (at("{")) return parseBlock();
      if (at(";")) { p++; return { k: "empty", pos: t.pos, end: t.end, line: t.line }; }
      if (isType()) return parseDecl(true);
      if (at("if")) {
        p++;
        need("(");
        const c = parseExpr();
        need(")");
        if (c.k === "assign" && c.op === "=") warnings.push({ line: t.line, msg: `if içinde tek '=' var. Bu karşılaştırma değil atama. '==' mi demek istedin?` });
        if (at(";")) warnings.push({ line: t.line, msg: "if satırının sonunda ';' var. Koşulun gövdesi boş kaldı." });
        const a = parseStmt();
        let b = null;
        if (eat("else")) b = parseStmt();
        return { k: "if", c, a, b, pos: t.pos, end: prev().end, line: t.line };
      }
      if (at("while")) {
        p++;
        need("(");
        const c = parseExpr();
        need(")");
        if (at(";")) warnings.push({ line: t.line, msg: "while satırının sonunda ';' var. Döngünün gövdesi boş kaldı." });
        const body = parseStmt();
        return { k: "while", c, body, pos: t.pos, end: prev().end, line: t.line };
      }
      if (at("do")) {
        p++;
        const body = parseStmt();
        need("while");
        need("(");
        const c = parseExpr();
        need(")");
        need(";");
        return { k: "do", c, body, pos: t.pos, end: prev().end, line: t.line };
      }
      if (at("for")) {
        p++;
        need("(");
        scopes.push(new Map());
        let init = null, c = null, u = null;
        if (!at(";")) {
          if (isType()) { init = parseDecl(false); }
          else { const e = parseExpr(); init = { k: "expr", e, pos: e.pos, end: e.end, line: e.line }; }
        }
        if (!at(";")) throw new CError("for parantezinde iki tane ';' olmalı: for (başlangıç; koşul; artış)", tk());
        p++;
        if (!at(";")) c = parseExpr();
        if (!at(";")) throw new CError("for parantezinde iki tane ';' olmalı: for (başlangıç; koşul; artış)", tk());
        p++;
        if (!at(")")) u = parseExpr();
        need(")");
        if (at(";")) warnings.push({ line: t.line, msg: "for satırının sonunda ';' var. Döngü boş gövdeyle dönüyor, alttaki blok döngüye dahil değil." });
        const body = parseStmt();
        scopes.pop();
        return { k: "for", init, c, u, body, pos: t.pos, end: prev().end, line: t.line };
      }
      if (at("break") || at("continue")) {
        const kw = toks[p++];
        const s = need(";");
        return { k: kw.v, pos: t.pos, end: s.end, line: t.line };
      }
      if (at("return")) {
        p++;
        let e = null;
        if (!at(";")) e = parseExpr();
        const s = need(";");
        return { k: "return", e, pos: t.pos, end: s.end, line: t.line };
      }
      if (at("switch")) throw new CError("switch bu oyunda henüz yok. if ve else ile çözebilirsin.", t);
      if (at("else")) throw new CError("Bu else'in if'i yok. Önündeki if'ten sonra fazladan ';' olabilir.", t);
      const e = parseExpr();
      const s = need(";");
      return { k: "expr", e, pos: t.pos, end: s.end, line: t.line };
    }
    const parseExpr = () => parseAssign();
    function parseAssign() {
      const l = parseCond();
      if (tk().t === "op" && ASSIGN.has(tk().v)) {
        const op = toks[p++];
        if (l.k !== "var") throw new CError(`'=' işaretinin solunda değişken olmalı. Değer sağdan sola akar: 5 = x değil, x = 5.`, op);
        const info = findVar(l.name);
        if (info && info.isConst) throw new CError(`'${l.name}' const. Sabit kutunun içi değiştirilemez.`, op);
        const r = parseAssign();
        return { k: "assign", op: op.v, l, r, pos: l.pos, end: r.end, line: l.line };
      }
      return l;
    }
    function parseCond() {
      const c = parseBin(1);
      if (eat("?")) {
        const a = parseAssign();
        need(":");
        const b = parseCond();
        return { k: "ter", c, a, b, pos: c.pos, end: b.end, line: c.line };
      }
      return c;
    }
    function parseBin(min) {
      let a = parseUnary();
      for (;;) {
        const t = tk();
        const pr = t.t === "op" ? PREC[t.v] : 0;
        if (!pr || pr < min) return a;
        p++;
        const b = parseBin(pr + 1);
        a = { k: "bin", op: t.v, a, b, pos: a.pos, end: b.end, line: a.line };
      }
    }
    function parseUnary() {
      const t = tk();
      if (t.t === "op") {
        if (t.v === "-" || t.v === "+" || t.v === "!") {
          p++;
          const a = parseUnary();
          return { k: "un", op: t.v, a, pos: t.pos, end: a.end, line: t.line };
        }
        if (t.v === "&") {
          p++;
          const a = parseUnary();
          if (a.k !== "var") throw new CError("& sadece bir değişkenin önüne gelir: &x gibi.", t);
          return { k: "addr", a, pos: t.pos, end: a.end, line: t.line };
        }
        if (t.v === "++" || t.v === "--") {
          p++;
          const a = parseUnary();
          if (a.k !== "var") throw new CError(`${t.v} sadece değişkene uygulanır.`, t);
          return { k: "inc", op: t.v, pre: true, a, pos: t.pos, end: a.end, line: t.line };
        }
        if (t.v === "(" && toks[p + 1].t === "kw" && TYPEWORDS.has(toks[p + 1].v)) {
          p++;
          const ty = parseType();
          need(")");
          const a = parseUnary();
          return { k: "cast", ty: ty.base, a, pos: t.pos, end: a.end, line: t.line };
        }
      }
      if (at("sizeof")) {
        p++;
        need("(");
        let of;
        if (isType()) of = { type: parseType().base };
        else of = { expr: parseExpr() };
        const cl = need(")");
        return { k: "sizeof", of, pos: t.pos, end: cl.end, line: t.line };
      }
      return parsePostfix();
    }
    function parsePostfix() {
      let a = parsePrimary();
      while (at("++") || at("--")) {
        const t = toks[p++];
        if (a.k !== "var") throw new CError(`${t.v} sadece değişkene uygulanır.`, t);
        a = { k: "inc", op: t.v, pre: false, a, pos: a.pos, end: t.end, line: a.line };
      }
      return a;
    }
    function parsePrimary() {
      const t = tk();
      if (t.t === "num") { p++; return { k: "num", v: t.v, ty: t.ty, text: t.text, pos: t.pos, end: t.end, line: t.line }; }
      if (t.t === "chr") { p++; return { k: "chr", v: t.v, text: t.text, pos: t.pos, end: t.end, line: t.line }; }
      if (t.t === "str") { p++; return { k: "str", v: t.v, text: t.text, pos: t.pos, end: t.end, line: t.line }; }
      if (t.t === "id") {
        p++;
        if (at("(")) {
          if (!CALLS.has(t.v)) {
            const low = t.v.toLowerCase();
            if (CALLS.has(low)) throw new CError(`'${t.v}' değil '${low}'. C büyük-küçük harf ayırır.`, t);
            throw new CError(`'${t.v}' diye bir fonksiyon tanımıyorum. Yazımını kontrol et.`, t);
          }
          p++;
          const args = [];
          if (!at(")")) {
            do args.push(parseAssign()); while (eat(","));
          }
          const cl = need(")");
          if (t.v === "scanf") {
            args.slice(1).forEach((x) => {
              if (x.k !== "addr") warnings.push({ line: t.line, msg: `scanf'te '${x.text || x.name || "argüman"}' başında & yok. scanf değeri değil, adresi ister.` });
            });
          }
          return { k: "call", name: t.v, args, pos: t.pos, end: cl.end, line: t.line };
        }
        const info = findVar(t.v);
        if (!info) {
          const low = t.v.toLowerCase();
          if (KEYWORDS.has(low)) throw new CError(`'${t.v}' değil '${low}'. C büyük-küçük harf ayırır.`, t);
          throw new CError(`'${t.v}' diye bir değişken tanımlamadın. Kullanmadan önce tipiyle tanımlamalısın, örneğin: int ${t.v};`, t);
        }
        return { k: "var", name: t.v, pos: t.pos, end: t.end, line: t.line };
      }
      if (at("(")) {
        p++;
        const e = parseExpr();
        const cl = need(")");
        return Object.assign({}, e, { paren: true, pos: t.pos, end: cl.end });
      }
      if (t.t === "eof") throw new CError("Kod yarıda bitti. Bir şeyler eksik kalmış.", prev());
      if (at("[")) throw new CError("Diziler bu oyunda henüz yok.", t);
      if (at(";")) throw new CError("Burada bir değer ya da değişken olmalıydı, ';' geldi. Eşittirin sağı boş kalmış olabilir.", t);
      throw new CError(`Burada bir değer bekliyordum, ${tokName(t)} geldi.`, t);
    }
    /* Program: ya tam main() ya da düz komut listesi */
    function parseProgram() {
      const body = [];
      while (tk().t !== "eof") {
        if (isType()) {
          const save = p;
          parseType();
          if (tk().t === "id" && toks[p + 1].t === "op" && toks[p + 1].v === "(") {
            if (tk().v !== "main") throw new CError("Kendi fonksiyonunu yazmak bu oyunda henüz yok.", tk());
            p += 2;
            while (!at(")")) {
              if (tk().t === "eof") throw new CError("main parantezi kapanmadı.", prev());
              p++;
            }
            p++;
            need("{");
            while (!at("}")) {
              if (tk().t === "eof") throw new CError("'}' eksik. main'in süslü parantezi kapanmadı.", prev());
              body.push(parseStmt());
            }
            p++;
            if (tk().t !== "eof") throw new CError("main bittikten sonra fazladan kod var.", tk());
            return body;
          }
          p = save;
        }
        if (at("}")) throw new CError("Fazladan '}' var. Bunun açılan eşi yok.", tk());
        body.push(parseStmt());
      }
      return body;
    }
    const body = parseProgram();
    return { body, warnings };
  }

  /* ---------- Görüntüleme yardımcıları ---------- */
  function showVal(type, v, g) {
    if (g && type === "char") return "?";
    if (type === "char") {
      if (v >= 32 && v < 127) return `'${String.fromCharCode(v)}'`;
      return String(v);
    }
    if (type === "float" || type === "double") {
      if (!isFinite(v)) return v > 0 ? "inf" : v < 0 ? "-inf" : "nan";
      const s = String(+v.toPrecision(type === "float" ? 7 : 15));
      return /[.e]/.test(s) ? s : s + ".0";
    }
    return String(v);
  }
  const hex = (a) => "0x" + a.toString(16);
  const garbage = (type) => {
    if (type === "char") return Math.floor(Math.random() * 90) + 33;
    if (type === "float" || type === "double") return +(Math.random() * 1e6 - 5e5).toFixed(3);
    return Math.floor(Math.random() * 65000) * (Math.random() < 0.5 ? -1 : 1) + 3;
  };
  function conv(t, v) {
    if (t === "double") return v;
    if (t === "float") return Math.fround(v);
    if (!isFinite(v)) return -2147483648;
    const n = Math.trunc(v);
    if (t === "char") return (n << 24) >> 24;
    if (t === "short") return (n << 16) >> 16;
    if (t === "long") return n;
    return n | 0;
  }

  /* ---------- Çalıştırma ---------- */
  const STOP = { stop: true };
  function run(src, opts = {}) {
    const maxSteps = opts.maxSteps || 3000;
    let parsed;
    try {
      parsed = parse(src);
    } catch (e) {
      if (!(e instanceof CError)) throw e;
      return { ok: false, phase: "compile", error: { msg: e.message, line: e.line, pos: e.pos, end: e.end, kind: "compile" }, steps: [], out: "", warnings: [], vars: {} };
    }
    const warnings = parsed.warnings.slice();
    const warned = new Set();
    const warn = (line, msg) => { if (!warned.has(msg)) { warned.add(msg); warnings.push({ line, msg }); } };
    const live = [];
    let sp = BASE;
    const scopes = [{ map: new Map(), sp: BASE }];
    let out = "";
    const steps = [];
    let stdin = opts.stdin || "";
    let sip = 0;
    let fx = null;
    let role = null;
    const fresh = () => ({ writes: [], prints: "", scans: [], notes: [] });

    const lookup = (n) => {
      for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].map.has(n)) return scopes[i].map.get(n);
      return null;
    };
    const snap = () => live.map((v) => ({ name: v.name, type: v.type, addr: v.addr, size: v.size, v: v.v, g: v.g }));
    function push(st) {
      if (role && !st.role) st.role = role;
      st.mem = snap();
      st.out = out;
      steps.push(st);
      if (steps.length >= maxSteps) throw STOP;
    }
    function alloc(type, name) {
      const size = SIZES[type];
      const al = Math.min(size, 8);
      const addr = Math.ceil(sp / al) * al;
      sp = addr + size;
      const v = { name, type, addr, size, v: garbage(type), g: true };
      scopes[scopes.length - 1].map.set(name, v);
      live.push(v);
      return v;
    }
    function pushScope() { scopes.push({ map: new Map(), sp }); }
    function popScope(line, pos, end) {
      const s = scopes.pop();
      const names = [...s.map.keys()];
      s.map.forEach((v) => live.splice(live.indexOf(v), 1));
      sp = s.sp;
      if (names.length) push({ kind: "free", names, line, from: pos, to: end });
    }
    const valStr = (x) => (x.g ? "???" : showVal(x.type, x.v, false));
    function sub(n) {
      let s;
      switch (n.k) {
        case "num": case "chr": case "str": s = n.text; break;
        case "var": s = valStr(lookup(n.name)); break;
        case "bin": s = `${sub(n.a)} ${n.op} ${sub(n.b)}`; break;
        case "un": s = n.op + sub(n.a); break;
        case "cast": s = `(${n.ty})${sub(n.a)}`; break;
        case "addr": s = hex(lookup(n.a.name).addr); break;
        case "inc": s = valStr(lookup(n.a.name)); break;
        case "assign": s = sub(n.r); break;
        case "ter": s = `${sub(n.c)} ? ${sub(n.a)} : ${sub(n.b)}`; break;
        case "sizeof": s = "sizeof(...)"; break;
        case "call": s = `${n.name}(...)`; break;
        default: s = "?";
      }
      return n.paren ? `(${s})` : s;
    }
    const typeRank = { char: 1, short: 1, int: 1, long: 2, float: 3, double: 4 };
    function common(a, b) {
      const r = Math.max(typeRank[a], typeRank[b]);
      return r === 4 ? "double" : r === 3 ? "float" : r === 2 ? "long" : "int";
    }
    function binop(op, a, b, tok) {
      const g = !!(a.g || b.g);
      const t = common(a.t, b.t);
      const isInt = t === "int" || t === "long";
      let v;
      switch (op) {
        case "+": v = a.v + b.v; break;
        case "-": v = a.v - b.v; break;
        case "*": v = t === "int" ? Math.imul(a.v, b.v) : a.v * b.v; break;
        case "/":
          if (isInt) {
            if (b.v === 0) throw new CError("Sıfıra bölme! Tam sayıyı 0'a bölmek programı öldürür (Floating point exception).", tok, "crash");
            v = Math.trunc(a.v / b.v);
            if (a.v % b.v !== 0 && !g) fx.notes.push(`${a.v} / ${b.v} iki tam sayı. Sonuç da tam sayı olur, ondalık kısmı atılır: ${v}`);
          } else v = a.v / b.v;
          break;
        case "%":
          if (!isInt) throw new CError("% sadece tam sayılarla çalışır. float veya double ile olmaz.", tok);
          if (b.v === 0) throw new CError("Sıfıra göre kalan olmaz! Program burada ölür (Floating point exception).", tok, "crash");
          v = a.v % b.v;
          break;
        default: throw new CError(`'${op}' işlemini bilmiyorum.`, tok);
      }
      return { t, v: conv(t, v), g };
    }
    function store(x, r, tok) {
      if (r.t === "str" || r.t === "ptr") throw new CError(`'${x.name}' kutusuna ${r.t === "str" ? "metin" : "adres"} koyamazsın. Bu kutu ${x.type} tutar.`, tok);
      const old = x.v, oldG = x.g;
      const nv = conv(x.type, r.v);
      if (!r.g && (x.type === "int" || x.type === "char" || x.type === "short" || x.type === "long") && nv !== r.v && Math.trunc(r.v) !== r.v) {
        fx.notes.push(`${x.type} kutusu ondalık tutamaz. ${showVal("double", r.v)} kırpıldı ve ${nv} oldu. Yuvarlama yok.`);
      }
      x.v = nv;
      x.g = !!r.g;
      fx.writes.push({ name: x.name, type: x.type, old, oldG, v: x.v, g: x.g, addr: x.addr });
      return { t: x.type, v: x.v, g: x.g };
    }
    function ev(n) {
      switch (n.k) {
        case "num": return { t: n.ty, v: n.v, g: false };
        case "chr": return { t: "int", v: n.v, g: false };
        case "str": return { t: "str", v: n.v };
        case "var": {
          const x = lookup(n.name);
          if (x.g) warn(n.line, `'${n.name}' değişkenine hiç değer vermeden okudun. İçindeki çöp sayı kullanıldı.`);
          return { t: x.type, v: x.v, g: x.g };
        }
        case "bin": {
          if (n.op === "&&" || n.op === "||") {
            const a = ev(n.a);
            const av = a.v !== 0;
            if (n.op === "&&" && !av) return { t: "int", v: 0, g: a.g };
            if (n.op === "||" && av) return { t: "int", v: 1, g: a.g };
            const b = ev(n.b);
            return { t: "int", v: b.v !== 0 ? 1 : 0, g: a.g || b.g };
          }
          const a = ev(n.a), b = ev(n.b);
          if (a.t === "str" || b.t === "str") throw new CError("Metinlerle aritmetik yapılmaz.", n);
          const g = !!(a.g || b.g);
          switch (n.op) {
            case "==": return { t: "int", v: a.v === b.v ? 1 : 0, g };
            case "!=": return { t: "int", v: a.v !== b.v ? 1 : 0, g };
            case "<": return { t: "int", v: a.v < b.v ? 1 : 0, g };
            case ">": return { t: "int", v: a.v > b.v ? 1 : 0, g };
            case "<=": return { t: "int", v: a.v <= b.v ? 1 : 0, g };
            case ">=": return { t: "int", v: a.v >= b.v ? 1 : 0, g };
          }
          return binop(n.op, a, b, n);
        }
        case "un": {
          const a = ev(n.a);
          if (n.op === "-") return { t: typeRank[a.t] === 1 ? "int" : a.t, v: -a.v, g: a.g };
          if (n.op === "+") return a;
          return { t: "int", v: a.v === 0 ? 1 : 0, g: a.g };
        }
        case "cast": {
          const a = ev(n.a);
          return { t: n.ty, v: conv(n.ty, a.v), g: a.g };
        }
        case "addr": {
          const x = lookup(n.a.name);
          return { t: "ptr", v: x.addr, target: x };
        }
        case "assign": {
          const x = lookup(n.l.name);
          if (n.op === "=") return store(x, ev(n.r), n);
          if (x.g) warn(n.line, `'${n.l.name}' değişkenine hiç değer vermeden okudun. İçindeki çöp sayı kullanıldı.`);
          const r = ev(n.r);
          return store(x, binop(n.op[0], { t: x.type, v: x.v, g: x.g }, r, n), n);
        }
        case "inc": {
          const x = lookup(n.a.name);
          const before = { t: x.type, v: x.v, g: x.g };
          const after = store(x, binop(n.op[0], before, { t: "int", v: 1, g: false }, n), n);
          return n.pre ? after : before;
        }
        case "ter": return ev(n.c).v !== 0 ? ev(n.a) : ev(n.b);
        case "sizeof": {
          if (n.of.type) return { t: "int", v: SIZES[n.of.type], g: false };
          const a = ev(n.of.expr);
          return { t: "int", v: SIZES[a.t] || 8, g: false };
        }
        case "call": return call(n);
      }
      throw new CError("Bu ifadeyi çözemedim.", n);
    }
    function pad(s, flags, width) {
      if (!width || s.length >= width) return s;
      if (flags.includes("-")) return s.padEnd(width);
      if (flags.includes("0") && /^[-+]?[\d.]/.test(s)) {
        const neg = /^[-+]/.test(s) ? s[0] : "";
        return neg + s.slice(neg.length).padStart(width - neg.length, "0");
      }
      return s.padStart(width);
    }
    function doPrintf(n) {
      if (!n.args.length || n.args[0].k !== "str") throw new CError('printf\'in ilk argümanı çift tırnaklı bir metin olmalı: printf("%d", x)', n);
      const f = n.args[0].v;
      let ai = 1, res = "";
      const re = /%([-+0 #]*)(\d*)(?:\.(\d+))?(hh|h|ll|l|L)?([a-zA-Z%])/g;
      let last = 0, m;
      while ((m = re.exec(f))) {
        res += f.slice(last, m.index);
        last = re.lastIndex;
        const [, flags, w, prec, , conv2] = m;
        if (conv2 === "%") { res += "%"; continue; }
        if (ai >= n.args.length) {
          warn(n.line, `printf'te %${conv2} için değişken vermemişsin. Ekrana rastgele bir şey çıkar.`);
          res += pad(String(garbage("int")), flags, +w);
          continue;
        }
        const a = ev(n.args[ai++]);
        const isFl = a.t === "float" || a.t === "double";
        let s;
        switch (conv2) {
          case "d": case "i": case "u":
            if (isFl) { warn(n.line, `%d tam sayı ister ama ${a.t} verdin. Doğrusu %f. Ekrana anlamsız bir sayı çıkar.`); s = String((Math.abs(a.v * 1048576.37) | 0) || 1074266112); }
            else if (a.t === "str" || a.t === "ptr") { warn(n.line, `%${conv2} sayı ister.`); s = String(a.v) === "NaN" ? "0" : String(a.v); }
            else s = String(conv2 === "u" ? a.v >>> 0 : a.v);
            if (flags.includes("+") && a.v >= 0) s = "+" + s;
            break;
          case "f": case "F": case "e": case "g":
            if (!isFl) { warn(n.line, `%f ondalıklı sayı ister ama ${a.t} verdin. Doğrusu %d. Ekrana 0.000000 gibi yanlış bir şey çıkar.`); s = (0).toFixed(prec === undefined ? 6 : +prec); }
            else if (conv2 === "e") s = a.v.toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, "e$10$2");
            else if (conv2 === "g") s = String(+a.v.toPrecision(prec === undefined ? 6 : +prec || 1));
            else s = a.v.toFixed(prec === undefined ? 6 : +prec);
            if (flags.includes("+") && a.v >= 0) s = "+" + s;
            break;
          case "c":
            if (isFl) warn(n.line, `%c karakter ister ama ${a.t} verdin.`);
            s = String.fromCharCode(a.v & 255);
            break;
          case "s":
            if (a.t !== "str") throw new CError("%s metin ister. Sayıyı metin diye okumaya çalışınca program çöktü (Segmentation fault).", n, "crash");
            s = a.v;
            break;
          case "p": s = hex(a.v); break;
          case "x": s = (a.v >>> 0).toString(16); break;
          case "X": s = (a.v >>> 0).toString(16).toUpperCase(); break;
          default: throw new CError(`%${conv2} diye bir biçim tanımıyorum.`, n);
        }
        res += pad(s, flags, +w);
      }
      res += f.slice(last);
      if (ai < n.args.length) warn(n.line, "printf'e fazladan değişken verdin, formatta bunun yeri yok.");
      out += res;
      fx.prints += res;
      return { t: "int", v: res.length, g: false };
    }
    function doScanf(n) {
      if (!n.args.length || n.args[0].k !== "str") throw new CError('scanf\'in ilk argümanı format metni olmalı: scanf("%d", &x)', n);
      const f = n.args[0].v;
      let ai = 1, count = 0;
      const re = /%(\d*)(hh|h|ll|l|L)?([a-zA-Z])|(\s+)|([^%\s]+)/g;
      let m;
      while ((m = re.exec(f))) {
        if (m[4]) { while (sip < stdin.length && /\s/.test(stdin[sip])) sip++; continue; }
        if (m[5]) {
          while (sip < stdin.length && /\s/.test(stdin[sip])) sip++;
          if (stdin.startsWith(m[5], sip)) sip += m[5].length;
          continue;
        }
        const sp2 = m[3];
        const lng = m[2];
        if (ai >= n.args.length) {
          throw new CError(`scanf'te %${sp2} için adres vermemişsin. Program çöktü (Segmentation fault).`, n, "crash");
        }
        const argN = n.args[ai++];
        if (argN.k !== "addr") {
          const nm = argN.name || argN.text || "o değer";
          const curVal = argN.k === "var" ? valStr(lookup(argN.name)) : nm;
          throw new CError(`scanf'e adres yerine değer verdin. Klavyeden gelen sayıyı "${curVal}" numaralı adrese yazmaya çalıştı, o adres sana ait değil. Segmentation fault! Doğrusu: &${nm}`, n, "crash");
        }
        const x = lookup(argN.a.name);
        if (sp2 !== "c") while (sip < stdin.length && /\s/.test(stdin[sip])) sip++;
        if (sip >= stdin.length) { throw new CError("Program klavyeden değer bekliyor.", n, "wait"); }
        let v;
        if (sp2 === "c") {
          v = stdin.charCodeAt(sip++);
          if (x.type !== "char") warn(n.line, `%c char ister ama '${x.name}' ${x.type}.`);
        } else if (sp2 === "d" || sp2 === "i" || sp2 === "u") {
          const mm = /^[-+]?\d+/.exec(stdin.slice(sip));
          if (!mm) break;
          sip += mm[0].length;
          v = Number(mm[0]);
          if (x.type === "float" || x.type === "double") warn(n.line, `%d tam sayı okur ama '${x.name}' ${x.type}. Doğrusu ${x.type === "float" ? "%f" : "%lf"}.`);
        } else if (sp2 === "f" || sp2 === "e" || sp2 === "g") {
          const mm = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/.exec(stdin.slice(sip));
          if (!mm) break;
          sip += mm[0].length;
          v = Number(mm[0]);
          if (x.type === "int" || x.type === "char") warn(n.line, `%f ondalıklı okur ama '${x.name}' ${x.type}. Doğrusu %d.`);
          if (x.type === "double" && lng !== "l") warn(n.line, `double okumak için %f değil %lf kullanılır.`);
          if (x.type === "float" && lng === "l") warn(n.line, `float okumak için %lf değil %f kullanılır.`);
        } else throw new CError(`scanf'te %${sp2} desteklenmiyor.`, n);
        const wrongFmt = ((sp2 === "d" || sp2 === "i") && (x.type === "float" || x.type === "double")) || (sp2 === "f" && (x.type === "int" || x.type === "char"));
        const w = store(x, { t: "double", v, g: wrongFmt }, n);
        fx.scans.push({ name: x.name, addr: x.addr, v: w.v, type: x.type, g: wrongFmt });
        count++;
      }
      return { t: "int", v: count, g: false };
    }
    function call(n) {
      switch (n.name) {
        case "printf": return doPrintf(n);
        case "scanf": return doScanf(n);
        case "puts": { const a = ev(n.args[0]); out += a.v + "\n"; fx.prints += a.v + "\n"; return { t: "int", v: 1, g: false }; }
        case "putchar": { const a = ev(n.args[0]); const c = String.fromCharCode(a.v & 255); out += c; fx.prints += c; return { t: "int", v: a.v, g: false }; }
      }
      const a = n.args.map(ev);
      const g = a.some((x) => x.g);
      const v0 = a[0] ? a[0].v : 0;
      switch (n.name) {
        case "sqrt": return { t: "double", v: Math.sqrt(v0), g };
        case "pow": return { t: "double", v: Math.pow(v0, a[1] ? a[1].v : 0), g };
        case "abs": return { t: "int", v: Math.abs(v0) | 0, g };
        case "fabs": return { t: "double", v: Math.abs(v0), g };
        case "floor": return { t: "double", v: Math.floor(v0), g };
        case "ceil": return { t: "double", v: Math.ceil(v0), g };
        case "round": return { t: "double", v: Math.round(v0), g };
      }
      throw new CError("Bilinmeyen fonksiyon.", n);
    }
    function exprStep(e, loc, stepRole) {
      fx = fresh();
      let subTxt = "";
      if (e.k === "assign") {
        const nm = e.l.name;
        subTxt = e.op === "=" ? `${nm} = ${sub(e.r)}` : `${nm} = ${valStr(lookup(nm))} ${e.op[0]} ${sub(e.r)}`;
      } else if (e.k === "inc") {
        subTxt = `${e.a.name} = ${valStr(lookup(e.a.name))} ${e.op[0]} 1`;
      }
      ev(e);
      const st = { from: loc.pos, to: loc.end, line: loc.line, note: fx.notes.join(" "), role: stepRole };
      if (fx.scans.length) {
        st.kind = "scan";
        st.scans = fx.scans;
        st.writes = fx.writes;
      } else if (fx.prints) {
        st.kind = "print";
        st.text = fx.prints;
      } else if (fx.writes.length) {
        st.kind = "write";
        st.writes = fx.writes;
        const w = fx.writes[fx.writes.length - 1];
        const vs = w.g ? "???" : showVal(w.type, w.v, false);
        const tail = subTxt.split(" = ").slice(1).join(" = ");
        st.sub = subTxt && tail !== vs ? `${subTxt} = ${vs}` : subTxt;
      } else {
        st.kind = "expr";
      }
      push(st);
    }
    function condStep(c, ctx, stepRole) {
      fx = fresh();
      const s = sub(c);
      const r = ev(c);
      const b = r.v !== 0;
      push({ kind: "cond", ctx, value: b, g: r.g, sub: `${s} → ${b ? "DOĞRU" : "YANLIŞ"}`, from: c.pos, to: c.end, line: c.line, role: stepRole, writes: fx.writes });
      return b;
    }
    function declStmt(n, stepRole) {
      for (const it of n.items) {
        fx = fresh();
        const s = it.init ? sub(it.init) : "";
        const r = it.init ? ev(it.init) : null;
        const x = alloc(it.type, it.name);
        if (r) {
          store(x, r, it);
          fx.writes.length = 0;
        }
        const vs = x.g ? "???" : showVal(x.type, x.v, false);
        const single = n.items.length === 1;
        push({
          kind: "decl", name: it.name, vtype: it.type, addr: x.addr, size: x.size, value: x.v, g: x.g, hasInit: !!it.init,
          sub: it.init ? (s !== vs ? `${it.name} = ${s} = ${vs}` : `${it.name} = ${vs}`) : "",
          note: fx.notes.join(" "), from: single ? n.pos : it.pos, to: single ? n.end : it.end, line: it.line, role: stepRole,
        });
      }
    }
    function exec(n) {
      switch (n.k) {
        case "empty": return;
        case "decl": declStmt(n); return;
        case "expr": exprStep(n.e, n); return;
        case "block": {
          pushScope();
          let sig;
          for (const s of n.body) {
            sig = exec(s);
            if (sig) break;
          }
          popScope(n.endLine, n.endPos, n.end);
          return sig;
        }
        case "if": {
          const b = condStep(n.c, "if");
          if (b) return exec(n.a);
          if (n.b) return exec(n.b);
          return;
        }
        case "while": {
          const old = role;
          for (;;) {
            role = old;
            if (!condStep(n.c, "while", old ? undefined : "cond")) break;
            role = old || "body";
            const sig = exec(n.body);
            if (sig === "break") break;
            if (sig === "return") { role = old; return sig; }
          }
          role = old;
          return;
        }
        case "do": {
          const old = role;
          for (;;) {
            role = old || "body";
            const sig = exec(n.body);
            if (sig === "break") break;
            if (sig === "return") { role = old; return sig; }
            role = old;
            if (!condStep(n.c, "while", old ? undefined : "cond")) break;
          }
          role = old;
          return;
        }
        case "for": {
          const old = role;
          pushScope();
          let ret;
          if (n.init) {
            if (n.init.k === "decl") declStmt(n.init, old ? undefined : "init");
            else exprStep(n.init.e, n.init, old ? undefined : "init");
          }
          for (;;) {
            role = old;
            if (n.c && !condStep(n.c, "for", old ? undefined : "cond")) break;
            role = old || "body";
            const sig = exec(n.body);
            if (sig === "break") break;
            if (sig === "return") { ret = sig; break; }
            role = old;
            if (n.u) exprStep(n.u, n.u, old ? undefined : "upd");
          }
          role = old;
          popScope(n.line, n.pos, n.pos + 3);
          return ret;
        }
        case "break": push({ kind: "flow", text: "break: döngüden çıkılıyor.", from: n.pos, to: n.end, line: n.line }); return "break";
        case "continue": push({ kind: "flow", text: "continue: bu tur kesildi, sıradaki tura geçiliyor.", from: n.pos, to: n.end, line: n.line }); return "continue";
        case "return":
          fx = fresh();
          if (n.e) ev(n.e);
          push({ kind: "flow", text: "return: main burada bitiyor.", from: n.pos, to: n.end, line: n.line });
          return "return";
      }
    }
    let error = null, hitLimit = false, waiting = false;
    try {
      for (const s of parsed.body) {
        const sig = exec(s);
        if (sig === "return") break;
      }
      role = null;
      push({ kind: "end", line: 0, from: -1, to: -1 });
    } catch (e) {
      if (e === STOP) hitLimit = true;
      else if (e instanceof CError) {
        if (e.kind === "wait") {
          waiting = true;
          error = { msg: e.message, line: e.line, pos: e.pos, end: e.end, kind: "wait" };
        } else {
          error = { msg: e.message, line: e.line, pos: e.pos, end: e.end, kind: e.kind };
        }
        steps.push({ kind: e.kind === "wait" ? "wait" : "crash", msg: e.message, line: e.line, from: e.pos, to: e.end, mem: snap(), out });
      } else throw e;
    }
    const vars = {};
    live.forEach((v) => { vars[v.name] = { t: v.type, v: v.v, g: v.g, addr: v.addr, size: v.size }; });
    return { ok: !error && !hitLimit, phase: "run", error, steps, out, warnings, vars, hitLimit, waiting };
  }

  return { run, showVal, hex, SIZES, BASE };
})();
