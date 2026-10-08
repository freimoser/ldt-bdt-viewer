/**
 * Lesen, Erkennen und Prüfen von LDT- und BDT-Dateien.
 *
 * Zeilenaufbau (alle drei Spezifikationen gleich):
 *   3 Bytes Länge, 4 Bytes Feldkennung, Inhalt, CR LF; Länge = Inhalt + 9.
 *   Quellen: KBV LDT 5.12 Kap. 2.4.1, KBV LDT 3.2.20 Kap. 6.4.1, QMS BDT 3.0 Kap. 3.3/3.7.4.
 *
 * Alles arbeitet auf Bytes, damit Längen unabhängig vom Zeichensatz stimmen.
 */
import { decode, decodeAll, isSingleByte, byteStats, detectCharset, looksBroken, CHARSETS } from "./charsets.js";
import * as S from "./spec.js";
import { sha1Hex } from "./sha1.js";

const MAX_ISSUES_PER_CODE = 300;
const MAX_ISSUES = 5000;

/* ---------------------------------------------------------------- Zeilen */

export function scanLines(bytes) {
  let lf = 0, cr = 0, crlf = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 10) { lf++; if (i > 0 && bytes[i - 1] === 13) crlf++; }
    else if (b === 13) cr++;
  }
  const crOnly = lf === 0 && cr > 0;
  const sep = crOnly ? 13 : 10;
  const max = (crOnly ? cr : lf) + 1;
  const start = new Uint32Array(max), end = new Uint32Array(max), eol = new Uint8Array(max);
  let n = 0, s = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== sep) continue;
    let e = i, kind = crOnly ? 3 : 1;
    if (!crOnly && i > s && bytes[i - 1] === 13) { e = i - 1; kind = 2; }
    start[n] = s; end[n] = e; eol[n] = kind; n++;
    s = i + 1;
  }
  if (s < bytes.length) { start[n] = s; end[n] = bytes.length; eol[n] = 0; n++; }
  return {
    n, start: start.subarray(0, n), end: end.subarray(0, n), eol: eol.subarray(0, n),
    stats: { lf, cr: cr - crlf, crlf, lfOnly: lf - crlf, crOnly },
  };
}

function digits(bytes, from, count) {
  let v = 0;
  for (let i = from; i < from + count; i++) {
    const b = bytes[i];
    if (b < 48 || b > 57) return -1;
    v = v * 10 + (b - 48);
  }
  return v;
}

export function fkString(fk) {
  return fk < 0 ? "" : String(fk).padStart(4, "0");
}

/* ----------------------------------------------------------- Erkennung */

function asciiContent(bytes, ln, i, max = 40) {
  const a = ln.start[i] + 7, b = Math.min(ln.end[i], a + max);
  let s = "";
  for (let k = a; k < b; k++) s += String.fromCharCode(bytes[k]);
  return s.trim();
}

/**
 * Bestimmt Format und Version anhand der ersten Zeilen.
 * GDT: Satzarten 6300–6399 mit Feld 9218 (GDT-Version), vgl. QMS GDT 2.1.
 */
export function detectFormat(bytes, ln, fk) {
  const limit = Math.min(ln.n, 4000);
  const satzarten = new Set();
  const seen = new Set();
  let v0001 = null, v9212 = null, v9218 = null, has8202asEnd = false, has8100 = false, has8002 = false, v9904 = null;
  let prevFk = -1;
  for (let i = 0; i < limit; i++) {
    const f = fk[i];
    if (f < 0) continue;
    seen.add(f);
    if (f === 8000) satzarten.add(asciiContent(bytes, ln, i, 8));
    else if (f === 1 && v0001 === null) v0001 = asciiContent(bytes, ln, i, 20);
    else if (f === 9212 && v9212 === null) v9212 = asciiContent(bytes, ln, i, 20);
    else if (f === 9218 && v9218 === null) v9218 = asciiContent(bytes, ln, i, 20);
    else if (f === 9904 && v9904 === null) v9904 = asciiContent(bytes, ln, i, 20);
    else if (f === 8002) has8002 = true;
    if (f === 8100 && prevFk === 8000) has8100 = true;
    if (f === 8000 && prevFk === 8202) has8202asEnd = true;
    prevFk = f;
  }
  if (prevFk === 8202) has8202asEnd = true;
  const sa = [...satzarten];
  const anyOf = (list) => list.some((x) => satzarten.has(x));

  if (sa.some((x) => /^63\d\d$/.test(x)) && (v9218 || !anyOf(["8220", "8230", "6100", "6200"]))) {
    return { format: "gdt", version: v9218 || "", satzarten: sa };
  }
  if ((v0001 && /^LDT3/i.test(v0001)) || anyOf(["8205", "8215"]) || (anyOf(["8220", "8230"]) && has8002)) {
    return { format: "ldt3", version: v0001 || "", satzarten: sa };
  }
  if ((v9212 && /^LDT/i.test(v9212)) || anyOf(["8201", "8202", "8203", "8204", "8218", "8219"]) || (anyOf(["8220", "8230"]) && has8100)) {
    return { format: "ldt2", version: v9212 || "", satzarten: sa };
  }
  if (anyOf(["6100", "6200", "0010", "adrs", "term", "iden", "spec", "0001"]) || (satzarten.has("0020") && !anyOf(["8220", "8230"]))) {
    const variant = has8202asEnd && !has8100 ? "3.0" : "klassisch";
    return { format: "bdt", version: variant === "3.0" ? `BDT 3.0${v9904 ? " (Version " + v9904 + ")" : ""}` : "", variant, satzarten: sa };
  }
  return { format: "unknown", version: "", satzarten: sa };
}

function dictKey(format) {
  return format === "ldt2" ? "ldt2" : format === "ldt3" ? "ldt3" : format === "bdt" ? "bdt" : null;
}

/* ------------------------------------------------------------- Öffnen */

/**
 * Öffnet eine Datei.
 * dict: Feldtabellen { ldt2, ldt3, bdt, rules }
 * opts.charset: erzwungener Zeichensatz (Umschalter in der Oberfläche)
 * opts.onProgress(text, anteil)
 */
export function openFile(bytes, name, dict, opts = {}) {
  const progress = opts.onProgress || (() => {});
  const m = {
    name: name || "datei", size: bytes.length, bytes, dict,
    issues: [], issueCounts: { fehler: 0, warnung: 0, hinweis: 0 }, codeCounts: {}, truncated: false,
  };
  if (bytes.length === 0) {
    m.format = "unknown"; m.version = ""; m.empty = true;
    m.lines = scanLines(bytes);
    m.records = []; m.objects = [];
    m.charset = { charset: "iso-8859-15", source: "leere Datei", confidence: "hoch", candidates: ["iso-8859-15"] };
    addIssue(m, null, "fehler", "EMPTY", "Die Datei ist leer.", "Es gibt nichts anzuzeigen. Oft wurde der Export abgebrochen oder die Datei beim Kopieren beschädigt. Lassen Sie die Datei erneut erzeugen.");
    m.summary = buildSummary(m);
    return m;
  }
  progress("Zeilen werden gelesen", 0.05);
  const ln = scanLines(bytes);
  m.lines = ln;
  const fk = new Int16Array(ln.n), len = new Int16Array(ln.n);
  for (let i = 0; i < ln.n; i++) {
    const s = ln.start[i];
    if (ln.end[i] - s >= 7) {
      len[i] = digits(bytes, s, 3);
      fk[i] = digits(bytes, s + 3, 4);
    } else { len[i] = -1; fk[i] = -1; }
  }
  m.fk = fk; m.len = len;

  progress("Format wird erkannt", 0.2);
  const det = detectFormat(bytes, ln, fk);
  m.format = det.format; m.version = det.version; m.bdtVariant = det.variant || null;
  m.key = dictKey(m.format);

  // Zeichensatz
  const stats = byteStats(bytes);
  let declared = null, declaredBy = null;
  const i9106 = findFirst(fk, 9106, 2000);
  if (i9106 >= 0) {
    const v = asciiContent(bytes, ln, i9106, 2);
    const map = m.format === "ldt2" ? S.CHARSET_9106.ldt2 : m.format === "bdt" && m.bdtVariant === "3.0" ? S.CHARSET_9106.bdt3 : null;
    if (map && map[v]) { declared = map[v]; declaredBy = `Feld 9106 = ${v}`; }
  }
  if (!declared && m.format === "ldt2") {
    const mm = /^([XSAZ])\d\d/i.exec(m.name.split(/[\\/]/).pop());
    if (mm && /\.ldt$/i.test(m.name)) { declared = S.LDT2_FILENAME_CHARSET[mm[1].toUpperCase()]; declaredBy = `Dateiname beginnt mit „${mm[1].toUpperCase()}“`; }
  }
  const fallback = m.format === "ldt2" ? "iso-8859-15" : "iso-8859-15";
  const cs = detectCharset(stats, declared, fallback);
  cs.declared = declared; cs.declaredBy = declaredBy; cs.stats = stats;
  if (declaredBy && cs.source === "Angabe in der Datei") cs.source = `Angabe in der Datei (${declaredBy})`;
  const mandated = m.format === "ldt3" || (m.format === "bdt" && m.bdtVariant === "3.0");
  if (!declared && mandated && cs.charset === "iso-8859-15") {
    cs.source = stats.high ? "Vorgabe der Spezifikation (ISO 8859-15), passt zu den Umlauten in der Datei" : "Vorgabe der Spezifikation (ISO 8859-15)";
    cs.confidence = "hoch";
  }
  if (opts.charset && CHARSETS[opts.charset]) {
    cs.auto = cs.charset; cs.charset = opts.charset; cs.source = "von Ihnen gewählt"; cs.confidence = "hoch";
  }
  if (!cs.candidates.includes(cs.charset)) cs.candidates.unshift(cs.charset);
  m.charset = cs;
  if (isSingleByte(cs.charset)) m.text = decodeAll(bytes, cs.charset);

  progress("Struktur wird aufgebaut", 0.35);
  buildStructure(m, progress);
  progress("Datei wird geprüft", 0.6);
  validate(m, progress);
  progress("Befunde werden zusammengestellt", 0.85);
  m.befunde = extractBefunde(m);
  m.summary = buildSummary(m);
  progress("Fertig", 1);
  return m;
}

function findFirst(fk, value, limit) {
  const n = Math.min(fk.length, limit);
  for (let i = 0; i < n; i++) if (fk[i] === value) return i;
  return -1;
}

/* ------------------------------------------------------------ Inhalte */

export function content(m, i) {
  if (m.text !== undefined) {
    const a = m.lines.start[i], e = m.lines.end[i];
    return e - a < 7 ? m.text.slice(a, e) : m.text.slice(a + 7, e);
  }
  const s = m.lines.start[i] + 7, e = m.lines.end[i];
  if (m.lines.end[i] - m.lines.start[i] < 7) return decode(m.bytes, m.lines.start[i], e, m.charset.charset);
  return decode(m.bytes, s, e, m.charset.charset);
}

export function rawLine(m, i) {
  if (m.text !== undefined) return m.text.slice(m.lines.start[i], m.lines.end[i]);
  return decode(m.bytes, m.lines.start[i], m.lines.end[i], m.charset.charset);
}

function contentBytes(m, i) {
  return Math.max(0, m.lines.end[i] - m.lines.start[i] - 7);
}

/** Feldbeschreibung für die Feldkennung im erkannten Format. */
export function fieldDef(m, fk) {
  const key = m.key;
  const f = fkString(fk);
  if (!key || !m.dict) return null;
  return m.dict[key]?.[f] || null;
}

export function fieldLabel(m, fk) {
  if (fk < 0) return "keine gültige Feldkennung";
  const d = fieldDef(m, fk);
  if (d) return d.n || "(ohne Bezeichnung)";
  const other = foreignDef(m, fk);
  return other ? `unbekannt (in ${other.where}: ${other.def.n})` : "unbekannt";
}

function foreignDef(m, fk) {
  const f = fkString(fk);
  const order = [["ldt3", "LDT 3"], ["ldt2", "LDT 2"], ["bdt", "BDT 3.0"]];
  for (const [k, where] of order) {
    if (k === m.key) continue;
    const d = m.dict?.[k]?.[f];
    if (d && d.n) return { where, def: d };
  }
  return null;
}

/* ---------------------------------------------------------- Struktur */

function buildStructure(m, progress) {
  const { fk } = m, ln = m.lines, n = ln.n;
  const records = [];
  const lineRec = new Int32Array(n).fill(-1);
  const lineObj = new Int32Array(n).fill(-1);
  const objects = [];
  let cur = null;
  const stack = [];
  let pendingAttr = -1;
  const isLdt3 = m.format === "ldt3";
  for (let i = 0; i < n; i++) {
    const f = fk[i];
    if (f === 8000) {
      if (cur) closeRecord(m, cur, i - 1, stack, objects);
      cur = { type: asciiContent(m.bytes, ln, i, 8), start: i, end: i, index: records.length, objects: [] };
      records.push(cur);
      stack.length = 0; pendingAttr = -1;
    }
    if (cur) {
      lineRec[i] = cur.index;
      cur.end = i;
      if (isLdt3) {
        if (f >= 8100 && f <= 8299) pendingAttr = i;
        if (f === 8002) {
          const id = asciiContent(m.bytes, ln, i, 12);
          const obj = {
            index: objects.length, id, name: S.LDT3_OBJECTS[id] || "unbekanntes Objekt",
            attrLine: pendingAttr === i - 1 ? pendingAttr : -1,
            start: i, end: -1, parent: stack.length ? stack[stack.length - 1] : -1,
            depth: stack.length, record: cur.index,
          };
          if (obj.attrLine >= 0) obj.attr = content(m, obj.attrLine);
          objects.push(obj);
          if (obj.parent < 0) cur.objects.push(obj.index);
          stack.push(obj.index);
          pendingAttr = -1;
        }
        lineObj[i] = stack.length ? stack[stack.length - 1] : -1;
        if (f === 8003) {
          const id = asciiContent(m.bytes, ln, i, 12);
          const top = stack.length ? objects[stack[stack.length - 1]] : null;
          if (!top) {
            addIssue(m, i, "fehler", "OBJ_END_ORPHAN", `Zeile ${i + 1}: Objektende ${id} ohne passenden Objektanfang (8002).`, "Die Verschachtelung der Objekte ist kaputt. Das Praxisprogramm kann die Werte danach oft nicht mehr zuordnen. Die Datei muss vom Labor neu erzeugt werden.");
          } else if (top.id !== id) {
            addIssue(m, i, "fehler", "OBJ_END_MISMATCH", `Zeile ${i + 1}: Objektende ${id} passt nicht zum offenen Objekt ${top.id} (begonnen in Zeile ${top.start + 1}).`, "Objekte müssen in umgekehrter Reihenfolge geschlossen werden, in der sie geöffnet wurden (KBV LDT 3.2.20, Kap. 6.3). Sonst landen Angaben im falschen Zusammenhang.");
            const pos = stack.lastIndexOf(stack.find((x) => objects[x].id === id));
            if (pos >= 0) { for (let k = stack.length - 1; k >= pos; k--) objects[stack[k]].end = i; stack.length = pos; }
          } else {
            top.end = i;
            stack.pop();
          }
        }
        if (pendingAttr >= 0 && pendingAttr < i && f !== 8002 && !(f >= 8100 && f <= 8299)) {
          // Attribut ohne folgendes Objekt
          pendingAttr = -1;
        }
      }
    }
    if ((i & 0xffff) === 0 && progress) progress("Struktur wird aufgebaut", 0.35 + 0.2 * (i / n));
  }
  if (cur) closeRecord(m, cur, n - 1, stack, objects);
  m.records = records; m.objects = objects; m.lineRec = lineRec; m.lineObj = lineObj;
}

function closeRecord(m, rec, last, stack, objects) {
  // Leere Zeilen am Ende nicht zum Satz zählen
  let e = last;
  while (e > rec.start && m.lines.end[e] === m.lines.start[e]) e--;
  rec.end = e;
  if (stack.length) {
    for (const oi of stack) {
      const o = objects[oi];
      o.end = e;
      addIssue(m, o.start, "fehler", "OBJ_OPEN", `Zeile ${o.start + 1}: Objekt ${o.id} (${o.name}) wird nicht mit 8003 abgeschlossen.`, "Jedes Objekt beginnt mit 8002 und endet mit 8003 mit derselben Objekt-ID (KBV LDT 3.2.20, Kap. 6.3). Fehlt das Ende, ist die Datei unvollständig, etwa durch einen abgebrochenen Export.");
    }
    stack.length = 0;
  }
}

/* -------------------------------------------------------------- Prüfen */

function addIssue(m, line, sev, code, text, why) {
  m.issueCounts[sev] = (m.issueCounts[sev] || 0) + 1;
  m.codeCounts[code] = (m.codeCounts[code] || 0) + 1;
  if (line !== null && line !== undefined && m.lineSev) {
    const v = sev === "fehler" ? 3 : sev === "warnung" ? 2 : 1;
    if (m.lineSev[line] < v) m.lineSev[line] = v;
  }
  if (m.codeCounts[code] > MAX_ISSUES_PER_CODE || m.issues.length >= MAX_ISSUES) { m.truncated = true; return; }
  m.issues.push({ line: line === null || line === undefined ? null : line + 1, sev, code, text, why });
}

const WHY = {
  LEN: "Die ersten drei Ziffern jeder Zeile geben an, wie lang die Zeile ist (Inhalt + 9 Bytes). Stimmt das nicht, lehnen viele Praxisprogramme die Datei ab oder lesen ab hier falsch weiter. Häufige Ursachen: falscher Zeichensatz (ein Umlaut belegt dann zwei Bytes) oder die Datei wurde nachträglich von Hand bearbeitet.",
  SYNTAX: "Jede Zeile muss mit 3 Ziffern Länge und 4 Ziffern Feldkennung beginnen. Diese Zeile kann das Praxisprogramm nicht zuordnen. Oft ist das ein Zeilenumbruch mitten im Inhalt oder eine fremde Datei.",
  EMPTY_FIELD: "Felder ohne Inhalt oder nur mit Leerzeichen sind laut Spezifikation nicht zulässig. Meist stört das nicht, einige Prüfmodule melden es aber als Fehler.",
  UNKNOWN: "Diese Feldkennung steht nicht in der Feldtabelle der erkannten Version. Das empfangende Programm ignoriert das Feld meist oder meldet einen Fehler. Häufige Ursachen: herstellereigene Erweiterung, andere Version oder ein Tippfehler in der Schnittstelle.",
  REQUIRED: "Ein Pflichtfeld fehlt. Je nach Praxisprogramm wird der ganze Befund abgelehnt oder ohne diese Angabe übernommen. Das Labor bzw. der Hersteller der sendenden Software muss den Export korrigieren.",
  RECLEN: "Feld 8100 enthält die Summe aller Zeilenlängen des Satzes. Stimmt sie nicht, kann das Praxisprogramm den Satz ablehnen. Oft wurde die Datei nach dem Erzeugen verändert.",
  FORMAT: "Der Inhalt hat nicht das Format, das die Feldtabelle vorgibt (z. B. Datum, Zahl, Länge). Viele Programme übernehmen den Wert trotzdem, manche verwerfen ihn.",
  VALUE: "Der Wert gehört nicht zu den erlaubten Inhalten dieses Feldes. Das Praxisprogramm kann ihn dann nicht deuten, z. B. eine Markierung „auffällig“.",
};

function sevLabel(sev) { return sev; }

function parseLenRule(spec) {
  if (!spec) return null;
  const s = String(spec).replace(/\s+/g, "");
  let m;
  if (/^var/.test(s)) return null;
  if ((m = /^≤(\d+)$/.exec(s))) return { max: +m[1] };
  if ((m = /^(\d+)$/.exec(s))) return { exact: [+m[1]] };
  if ((m = /^(\d+)[-–](\d+)$/.exec(s))) return { min: +m[1], max: +m[2] };
  if ((m = /^(\d+(?:,\d+)+)$/.exec(s))) return { exact: m[1].split(",").map(Number) };
  return null;
}

const enumCache = new Map();
function allowedValues(m, fk, def) {
  const ck = m.key + fk;
  if (enumCache.has(ck)) return enumCache.get(ck);
  let set = null;
  if (m.key === "ldt2" && def.v) {
    const lr = parseLenRule(def.l);
    const small = lr && ((lr.max && lr.max <= 3) || (lr.exact && Math.max(...lr.exact) <= 3));
    if (small) {
      const codes = [...def.v.matchAll(/(?:^|\s)([^\s=]{1,3}) = /g)].map((x) => x[1]);
      if (codes.length >= 2) set = new Set(codes);
    }
  } else if (m.key === "ldt3" && def.r && m.dict.rules) {
    for (const r of def.r.split(/\s+/)) {
      if (!/^E\d{3}$/.test(r)) continue;
      const rule = m.dict.rules[r];
      if (!rule || !rule.c) continue;
      const txt = rule.c.replace(/Bei (nicht )?numerischen Werten:/g, ",").replace(/\s+oder\s+/g, ",");
      const tokens = txt.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
      if (tokens.length >= 1 && tokens.every((t) => /^[A-Za-z0-9!+\-–]{1,4}$/.test(t))) {
        set = set || new Set();
        tokens.forEach((t) => set.add(t.replace("–", "--")));
      } else { set = null; break; }
    }
  } else if (m.key === "bdt" && def.v) {
    const toks = [...def.v.matchAll(/„\s*([^“]*?)\s*“/g)].map((x) => x[1]).filter(Boolean);
    if (toks.length >= 2 && toks.every((t) => t.length <= 4) && /^\[\d{4}\]\s*=/.test(def.v)) set = new Set(toks);
  }
  enumCache.set(ck, set);
  return set;
}

function validDate(v, order) {
  if (!/^\d{8}$/.test(v)) return false;
  let y, mo, d;
  if (order === "TTMMJJJJ") { d = +v.slice(0, 2); mo = +v.slice(2, 4); y = +v.slice(4); }
  else { y = +v.slice(0, 4); mo = +v.slice(4, 6); d = +v.slice(6); }
  if (y < 1 || mo < 1 || mo > 12 || d < 1) return false;
  const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return d <= dim;
}

function validate(m, progress) {
  const ln = m.lines, n = ln.n, fk = m.fk, len = m.len, bytes = m.bytes;
  m.lineSev = new Uint8Array(n);
  // Probleme, die beim Strukturaufbau gefunden wurden, nachtragen
  for (const is of m.issues) if (is.line) m.lineSev[is.line - 1] = Math.max(m.lineSev[is.line - 1], is.sev === "fehler" ? 3 : is.sev === "warnung" ? 2 : 1);

  const fmtName = m.format === "ldt2" ? "LDT-2-Feldtabelle (KBV LDT 5.12)" : m.format === "ldt3" ? "LDT-3.2.20-Feldtabelle" : m.format === "bdt" ? "BDT-3.0-Feldtabelle (QMS)" : "Feldtabelle";
  const dateOrder = m.format === "bdt" ? "TTMMJJJJ" : "JJJJMMTT";
  let lenDiffMinus1 = 0, lenErrors = 0, firstRecord = -1;
  const unknownSeen = new Map();

  for (let i = 0; i < n; i++) {
    const L = ln.end[i] - ln.start[i];
    if (L === 0) {
      if (i !== n - 1) addIssue(m, i, "warnung", "BLANK", `Zeile ${i + 1}: Leere Zeile.`, "Leere Zeilen sind im xDT-Format nicht vorgesehen. Viele Programme überspringen sie, manche brechen den Import ab.");
      continue;
    }
    if (fk[i] < 0 || len[i] < 0) {
      addIssue(m, i, "fehler", "SYNTAX", `Zeile ${i + 1}: Die Zeile beginnt nicht mit 3 Ziffern Länge und 4 Ziffern Feldkennung.`, WHY.SYNTAX);
      continue;
    }
    if (firstRecord < 0 && fk[i] !== 8000 && m.format !== "unknown") {
      addIssue(m, i, "fehler", "BEFORE_RECORD", `Zeile ${i + 1}: Diese Zeile steht vor dem ersten Satzbeginn (Feld 8000).`, "Jeder Satz beginnt mit Feld 8000 (Satzart). Zeilen davor gehören zu keinem Satz und werden meist ignoriert. Möglicherweise fehlt der Anfang der Datei.");
    }
    if (fk[i] === 8000 && firstRecord < 0) firstRecord = i;
    const cb = contentBytes(m, i);
    const expected = cb + 9;
    if (len[i] !== expected) {
      lenErrors++;
      if (len[i] - expected === -1) lenDiffMinus1++;
      addIssue(m, i, "fehler", "LEN", `Zeile ${i + 1}: Die Längenangabe passt nicht zum Inhalt (angegeben ${String(len[i]).padStart(3, "0")}, richtig wäre ${String(expected).padStart(3, "0")}).`, WHY.LEN);
    }
    if (ln.eol[i] === 1 || ln.eol[i] === 3) { /* zusammengefasst unten */ }
    const c = content(m, i);
    if (!c.trim()) {
      if (emptyAllowed(m, fk[i])) continue;
      addIssue(m, i, "warnung", "EMPTY_FIELD", `Zeile ${i + 1}: Feld ${fkString(fk[i])} hat keinen Inhalt.`, WHY.EMPTY_FIELD);
      continue;
    }
    if (!m.key) continue;
    const def = fieldDef(m, fk[i]);
    if (!def) {
      const f = fkString(fk[i]);
      const other = foreignDef(m, fk[i]);
      unknownSeen.set(f, (unknownSeen.get(f) || 0) + 1);
      addIssue(m, i, "warnung", "UNKNOWN", `Zeile ${i + 1}: Feldkennung ${f} ist in der ${fmtName} nicht bekannt${other ? ` (in ${other.where} bedeutet sie „${other.def.n}“)` : ""}.`, WHY.UNKNOWN);
      continue;
    }
    // Inhaltsprüfungen
    if (c !== c.trim() && def.t && /^(a|alnum|s)$/.test(def.t)) {
      addIssue(m, i, "hinweis", "SPACES", `Zeile ${i + 1}: Feld ${fkString(fk[i])} beginnt oder endet mit Leerzeichen.`, "Führende oder nachfolgende Leerzeichen sind laut Spezifikation nicht erlaubt. Bei Namen kann das zu Dubletten im Praxisprogramm führen.");
    }
    const lr = parseLenRule(def.l);
    const clen = [...c].length;
    if (lr && fk[i] !== 8000) {
      const bad = (lr.max !== undefined && clen > lr.max) || (lr.min !== undefined && clen < lr.min) || (lr.exact && !lr.exact.includes(clen));
      if (bad) addIssue(m, i, "warnung", "FLEN", `Zeile ${i + 1}: Feld ${fkString(fk[i])} (${def.n}) hat ${clen} Zeichen, erlaubt sind ${def.l}.`, WHY.FORMAT);
    }
    const allowed = allowedValues(m, fk[i], def);
    const enumOk = allowed && allowed.has(c.trim());
    const t = enumOk ? "" : def.t;
    if ((t === "num" || t === "n") && !/^\d+$/.test(c)) {
      addIssue(m, i, "warnung", "TYPE_NUM", `Zeile ${i + 1}: Feld ${fkString(fk[i])} (${def.n}) muss nur aus Ziffern bestehen, enthält aber „${short(c)}“.`, WHY.FORMAT);
    } else if ((t === "date" || t === "d") && !validDate(c, m.format === "bdt" ? "TTMMJJJJ" : "JJJJMMTT")) {
      addIssue(m, i, "warnung", "TYPE_DATE", `Zeile ${i + 1}: Feld ${fkString(fk[i])} (${def.n}) ist kein gültiges Datum im Format ${dateOrder}: „${short(c)}“.`, "Ein ungültiges Datum wird oft als leer oder als falscher Tag übernommen. Prüfen Sie, ob Tag und Monat vertauscht sind.");
    } else if (t === "d0" && !(/^\d{8}$/.test(c))) {
      addIssue(m, i, "warnung", "TYPE_DATE", `Zeile ${i + 1}: Feld ${fkString(fk[i])} (${def.n}) ist kein Datum im Format TTMMJJJJ: „${short(c)}“.`, "Ein ungültiges Datum wird oft als leer oder als falscher Tag übernommen.");
    } else if (t === "f" && !/^[+-]?\d+(\.\d+)?$/.test(c)) {
      addIssue(m, i, "hinweis", "TYPE_FLOAT", `Zeile ${i + 1}: Feld ${fkString(fk[i])} (${def.n}) soll eine Zahl mit Punkt als Dezimaltrennzeichen sein, enthält aber „${short(c)}“.`, "Laut Feldtabelle ist hier eine Zahl vorgesehen (z. B. 15.1). Texte wie „<5“ oder ein Komma als Dezimaltrennzeichen können beim Einlesen falsch übernommen werden.");
    }
    if (allowed && !enumOk) {
      addIssue(m, i, "warnung", "VALUE", `Zeile ${i + 1}: „${short(c)}“ ist in Feld ${fkString(fk[i])} (${def.n}) kein erlaubter Wert. Erlaubt: ${[...allowed].join(", ")}.`, WHY.VALUE);
    }
    if ((i & 0x3fff) === 0 && progress) progress("Datei wird geprüft", 0.6 + 0.2 * (i / n));
  }

  // Zeilenenden
  const st = ln.stats;
  if (st.crOnly) addIssue(m, null, "fehler", "EOL_CR", "Die Zeilen enden nur mit CR (alter Mac-Stil) statt mit CR LF.", "Laut Spezifikation endet jedes Feld mit CR LF. Viele Programme erkennen dann gar keine Zeilen.");
  else if (st.lfOnly > 0) addIssue(m, null, "warnung", "EOL_LF", `${st.lfOnly.toLocaleString("de-DE")} Zeilen enden nur mit LF statt mit CR LF.`, "Laut Spezifikation endet jedes Feld mit CR LF (Wagenrücklauf und Zeilenvorschub). Viele Windows-Praxisprogramme lesen solche Dateien trotzdem, manche nicht. Oft passiert das, wenn eine Datei über ein Linux-System, per Git oder mit einem Texteditor gespeichert wurde.");
  if (lenErrors > 5 && lenDiffMinus1 / lenErrors > 0.9) {
    addIssue(m, null, "hinweis", "LEN_PATTERN", "Fast alle falschen Längenangaben sind genau um 1 zu klein.", "Vermutlich hat das erzeugende Programm nur 1 Byte für das Zeilenende gezählt (LF statt CR LF). Richtig ist: Länge = Inhalt + 9.");
  }
  if (m.charset.charset === "utf-8" && lenErrors > 0) {
    addIssue(m, null, "hinweis", "LEN_UTF8", "Die Längenfehler treten in Zeilen mit Umlauten auf.", "In UTF-8 belegt ein Umlaut 2 Bytes. Die Länge muss in Bytes des vorgeschriebenen Zeichensatzes gezählt werden. Die Datei sollte in ISO 8859-15 erzeugt werden.");
  }

  checkCharset(m);
  if (m.format === "unknown") {
    if (firstRecord < 0 && n > 0) addIssue(m, null, "fehler", "NOT_XDT", "In der Datei wurde kein Satzbeginn (Feld 8000) gefunden. Es ist vermutlich keine LDT- oder BDT-Datei.", "Prüfen Sie, ob Sie die richtige Datei gewählt haben. LDT-Dateien enden meist auf .ldt, BDT-Dateien auf .bdt oder .dat.");
    else addIssue(m, null, "warnung", "FORMAT_UNKNOWN", "Das Format konnte nicht sicher als LDT oder BDT erkannt werden.", "Die Zeilen werden trotzdem angezeigt. Die Feldbedeutungen fehlen, weil unklar ist, welche Feldtabelle gilt.");
  }
  checkRecords(m);
  checkVersion(m);
  checkFilename(m);
}

function emptyAllowed(m, fk) {
  if (m.key !== "ldt3") return false;
  const def = fieldDef(m, fk);
  if (!def || !def.r || !m.dict.rules) return false;
  // KBV LDT 3.2.20, Regel E036: „Feld kann ohne Inhalt übertragen werden“
  return def.r.split(/\s+/).some((r) => /ohne Inhalt/.test(m.dict.rules[r]?.c || ""));
}

function short(s) { return s.length > 40 ? s.slice(0, 37) + "…" : s; }

function checkCharset(m) {
  const cs = m.charset;
  const label = (id) => CHARSETS[id]?.short || id;
  if (cs.conflict) {
    addIssue(m, null, "warnung", "CHARSET_CONFLICT", `Die Datei gibt ${label(cs.conflict.declared)} an (${cs.declaredBy}), die Umlaute passen aber eher zu ${label(cs.conflict.detected)}.`, "Wenn Angabe und tatsächlicher Zeichensatz nicht übereinstimmen, erscheinen Umlaute im Praxisprogramm als Sonderzeichen (z. B. „M�ller“). Oben können Sie den Zeichensatz umschalten und vergleichen.");
  }
  const used = cs.charset;
  if ((m.format === "ldt3" || (m.format === "bdt" && m.bdtVariant === "3.0")) && cs.stats.high > 0 && used !== "iso-8859-15" && used !== "iso-8859-1") {
    addIssue(m, null, "fehler", "CHARSET_WRONG", `Die Datei scheint ${label(used)} zu verwenden. Vorgeschrieben ist ISO 8859-15.`, m.format === "ldt3" ? "KBV LDT 3.2.20, Kap. 6.6: „Es darf nur der Zeichencode ISO 8859-15 verwendet werden.“ Umlaute werden sonst falsch übernommen und Längenangaben stimmen nicht." : "QMS BDT 3.0, Kap. 3.7.5: Feldinhalte im Zeichencode ISO/IEC 8859-15. Umlaute werden sonst falsch übernommen.");
  }
  if (m.format === "ldt2" && (used === "utf-8" || used === "windows-1252") && cs.stats.high > 0) {
    addIssue(m, null, "fehler", "CHARSET_WRONG", `Die Datei scheint ${label(used)} zu verwenden. LDT 2 erlaubt nur 7-Bit-Code, IBM-Codepage 437, ISO 8859-1 oder ISO 8859-15.`, "KBV LDT 5.12, Kap. 2.6 und Feld 9106. Umlaute werden sonst im Praxisprogramm falsch angezeigt.");
  }
  // Stichprobe auf kaputte Umlaute
  const sample = Math.min(m.lines.n, 3000);
  for (let i = 0; i < sample; i++) {
    if (m.fk[i] < 0) continue;
    const c = content(m, i);
    if (looksBroken(c)) {
      addIssue(m, i, "warnung", "MOJIBAKE", `Zeile ${i + 1}: Umlaute sehen beschädigt aus („${short(c)}“).`, "Die Datei wurde vermutlich irgendwann mit dem falschen Zeichensatz gespeichert, etwa als UTF-8 statt ISO 8859-15. Probieren Sie oben einen anderen Zeichensatz. Hilft das nicht, ist die Datei selbst beschädigt.");
      break;
    }
  }
}

function recLength(m, rec) {
  let sum = 0;
  for (let i = rec.start; i <= rec.end; i++) sum += contentBytes(m, i) + 9;
  return sum;
}

function checkRecords(m) {
  const { records } = m;
  const fmt = m.format;
  if (fmt === "unknown" || fmt === "gdt") return;
  const satzNames = fmt === "ldt2" ? S.SATZARTEN.ldt2 : fmt === "ldt3" ? S.SATZARTEN.ldt3 : S.SATZARTEN.bdt;
  const req = fmt === "ldt2" ? S.REQUIRED.ldt2 : fmt === "ldt3" ? S.REQUIRED.ldt3 : m.bdtVariant === "3.0" ? S.REQUIRED.bdt3 : {};
  const classic = fmt === "ldt2" || (fmt === "bdt" && m.bdtVariant !== "3.0");
  for (const rec of records) {
    rec.label = satzNames[rec.type] || (fmt === "bdt" && /^\d{4}$/.test(rec.type) ? "Satzart (nicht in der BDT-3.0-Satzartenliste)" : "unbekannte Satzart");
    const where = `Satz ab Zeile ${rec.start + 1} (Satzart ${rec.type}${satzNames[rec.type] ? " " + satzNames[rec.type] : ""})`;
    if (!satzNames[rec.type] && !(fmt === "bdt")) {
      addIssue(m, rec.start, "warnung", "SATZART_UNKNOWN", `${where}: Diese Satzart ist im ${S.FORMAT_LABEL[fmt]} nicht definiert.`, "Das Praxisprogramm weiß nicht, wie es diesen Satz verarbeiten soll, und überspringt ihn meist.");
    }
    // Pflichtfelder
    const need = req[rec.type];
    if (need) {
      const present = new Set();
      for (let i = rec.start; i <= rec.end; i++) {
        if (fmt === "ldt3" && m.lineObj[i] !== -1) continue;
        present.add(fkString(m.fk[i]));
      }
      for (const f of need) {
        if (!present.has(f)) {
          const d = fieldDef(m, Number(f));
          addIssue(m, rec.start, "fehler", "REQUIRED", `${where}: Pflichtfeld ${f}${d ? " (" + d.n + ")" : ""} fehlt.`, WHY.REQUIRED);
        }
      }
    }
    if (classic) {
      const second = rec.start + 1 <= rec.end ? rec.start + 1 : -1;
      if (second < 0 || m.fk[second] !== 8100) {
        addIssue(m, rec.start, fmt === "ldt2" ? "fehler" : "warnung", "RECLEN_MISSING", `${where}: Das zweite Feld ist nicht die Satzlänge (8100).`, fmt === "ldt2" ? "KBV LDT 5.12, Kap. 2.3.3: Das erste Feld enthält die Satzart, das zweite die Satzlänge." : "Im klassischen BDT-Aufbau enthält das zweite Feld eines Satzes die Satzlänge (Uni Gießen, Beschreibung des BDT-Formats).");
      } else {
        const declared = parseInt(content(m, second), 10);
        const actual = recLength(m, rec);
        rec.length = actual;
        if (declared !== actual) {
          addIssue(m, second, "fehler", "RECLEN", `Zeile ${second + 1}: Die Satzlänge in Feld 8100 (${content(m, second)}) stimmt nicht mit der tatsächlichen Länge des Satzes überein (${String(actual).padStart(5, "0")} Bytes).`, WHY.RECLEN);
        }
      }
    }
    if (fmt === "ldt3") {
      const last = rec.end;
      if (m.fk[last] !== 8001) {
        addIssue(m, rec.start, "fehler", "RECEND_MISSING", `${where}: Das Satzende (Feld 8001) fehlt.`, "In LDT 3 endet jeder Satz mit Feld 8001, das die Satzart wiederholt (KBV LDT 3.2.20, Kap. 6.3). Fehlt es, ist die Datei oft abgeschnitten.");
      } else if (content(m, last) !== rec.type) {
        addIssue(m, last, "fehler", "RECEND_MISMATCH", `Zeile ${last + 1}: Satzende 8001 enthält „${content(m, last)}“, erwartet wird „${rec.type}“.`, "Satzbeginn (8000) und Satzende (8001) müssen dieselbe Satzart nennen. Sonst ist die Satzstruktur durcheinander.");
      }
    }
    if (fmt === "bdt" && m.bdtVariant === "3.0") {
      const last = rec.end;
      if (m.fk[last] !== 8202) {
        addIssue(m, rec.start, "fehler", "RECEND_MISSING", `${where}: Das Satzende (Feld 8202) fehlt.`, "In BDT 3.0 endet jeder Satz mit Feld 8202, das die Anzahl der Felder des Satzes enthält (QMS BDT 3.0, Kap. 3.4.1).");
      } else {
        const count = rec.end - rec.start + 1;
        const declared = parseInt(content(m, last), 10);
        if (declared !== count) addIssue(m, last, "fehler", "FIELDCOUNT", `Zeile ${last + 1}: Feld 8202 nennt ${content(m, last)} Felder, der Satz hat aber ${count}.`, "Feld 8202 zählt alle Felder des Satzes einschließlich 8000 und 8202 (QMS BDT 3.0, Kap. 3.4.1). Eine Abweichung deutet auf fehlende oder zusätzliche Zeilen hin.");
      }
    }
  }
  if (fmt === "ldt2" || fmt === "ldt3") checkPackage(m);
}

function checkPackage(m) {
  const recs = m.records.filter((r) => r.type !== "0020" && r.type !== "0021");
  if (!recs.length) return;
  const first = recs[0], last = recs[recs.length - 1];
  const header = first.type;
  const trailer = header === "8220" ? "8221" : header === "8230" ? "8231" : null;
  const content2 = m.format === "ldt2" ? { "8220": ["8201", "8202", "8203", "8204"], "8230": ["8218", "8219"] } : { "8220": ["8205"], "8230": ["8215"] };
  const src = m.format === "ldt2" ? "KBV LDT 5.12, Kap. 2.3.2" : "KBV LDT 3.2.20, Kap. 6.2";
  if (!trailer) {
    addIssue(m, first.start, "fehler", "ORDER_HEADER", `Der erste Satz ist ${first.type}, erwartet wird der Datenpaket-Header 8220 (Befund vom Labor) oder 8230 (Auftrag aus der Praxis).`, `Jede Datei beginnt mit genau einem Header-Satz (${src}). Ohne ihn erkennt das Praxisprogramm Absender und Version nicht.`);
    return;
  }
  if (last.type !== trailer) {
    addIssue(m, last.start, "fehler", "ORDER_TRAILER", `Der letzte Satz ist ${last.type}, erwartet wird der Abschluss-Satz ${trailer}.`, `Jede Datei endet mit genau einem Abschluss-Satz (${src}). Fehlt er, ist die Datei meist unvollständig übertragen worden.`);
  }
  let headers = 0;
  for (const r of recs) {
    if (r === first || r === last) continue;
    if (r.type === "8220" || r.type === "8230" || r.type === "8221" || r.type === "8231") headers++;
    else if (!content2[header].includes(r.type)) {
      addIssue(m, r.start, "warnung", "ORDER_CONTENT", `Satz ab Zeile ${r.start + 1}: Satzart ${r.type} gehört nicht in ein Datenpaket mit Header ${header}.`, `Zulässig sind hier nur die Satzarten ${content2[header].join(", ")} (${src}).`);
    }
  }
  if (headers) addIssue(m, null, "fehler", "ORDER_MULTI", "Die Datei enthält mehrere Datenpaket-Header oder -Abschlüsse.", `Pro Datei ist genau ein Datenpaket erlaubt („Jede Datei muss separat erzeugt und eingelesen werden“, ${src}).`);

  if (m.format === "ldt2" && last.type === trailer) {
    let i9202 = -1;
    for (let i = last.start; i <= last.end; i++) if (m.fk[i] === 9202) i9202 = i;
    if (i9202 >= 0) {
      let total = 0;
      for (const r of recs) total += r.length ?? recLength(m, r);
      const declared = parseInt(content(m, i9202), 10);
      const withoutTrailer = total - (last.length ?? recLength(m, last));
      if (declared !== total) {
        if (declared === withoutTrailer) {
          addIssue(m, i9202, "hinweis", "TOTAL_EXCL", `Zeile ${i9202 + 1}: Die Gesamtlänge in 9202 (${declared}) enthält den Abschluss-Satz nicht mit.`, "Die KBV beschreibt 9202 als „Summe aller Satzlängen des Datenpaketes“. Ob der Abschluss-Satz mitzählt, ist dort nicht ausdrücklich geregelt. Manche Programme rechnen ihn mit (Ergebnis hier: " + total + ").");
        } else {
          addIssue(m, i9202, "fehler", "TOTAL", `Zeile ${i9202 + 1}: Die Gesamtlänge des Datenpakets in Feld 9202 (${declared}) passt nicht zur Summe der Satzlängen (${total}).`, "Das Praxisprogramm kann daran erkennen, dass die Datei unvollständig oder verändert ist, und lehnt sie dann ab.");
        }
      }
    }
  }
  if (m.format === "ldt3" && last.type === trailer) {
    let i9300 = -1;
    for (let i = last.start; i <= last.end; i++) if (m.fk[i] === 9300) i9300 = i;
    if (i9300 >= 0) {
      const expected = sha1Hex(m.bytes, m.lines.start[i9300]);
      const declared = content(m, i9300).trim();
      m.checksum = { declared, expected, ok: declared.toLowerCase() === expected };
      if (!m.checksum.ok) {
        addIssue(m, i9300, "fehler", "CHECKSUM", `Zeile ${i9300 + 1}: Die Prüfsumme in Feld 9300 passt nicht zum Dateiinhalt.`, "Feld 9300 enthält einen SHA-1-Wert über alle Zeichen vor dieser Zeile (KBV LDT 3.2.20, Regel E157). Weicht er ab, wurde die Datei nach dem Erzeugen verändert oder unvollständig übertragen. Das Prüfmodul der KBV meldet das als Fehler.");
      }
    }
  }
}

function checkVersion(m) {
  if (m.format === "ldt2") {
    const v = m.version;
    if (!v) addIssue(m, null, "warnung", "VERSION_MISSING", "Die Version der Satzbeschreibung (Feld 9212) fehlt.", "Ohne Versionsangabe kann das Praxisprogramm nicht sicher erkennen, wie es die Datei lesen soll.");
    else if (v !== S.VERSION.ldt2.expected) addIssue(m, null, "hinweis", "VERSION_OTHER", `Die Datei nennt die Version ${v}. Die letzte von der KBV beschriebene LDT-2-Version ist ${S.VERSION.ldt2.expected}.`, "Ältere LDT-2-Versionen unterscheiden sich in einzelnen Feldern. Die Prüfung hier richtet sich nach LDT1014.01 (KBV-Datensatzbeschreibung LDT, Version 5.12).");
  }
  if (m.format === "ldt3") {
    const v = m.version;
    if (!v) addIssue(m, null, "fehler", "VERSION_MISSING", "Die Version (Feld 0001 in den Kopfdaten) fehlt.", "LDT 3 verlangt die Versionsangabe in Obj_0032 (Kopfdaten).");
    else if (v !== S.VERSION.ldt3.expected) addIssue(m, null, "warnung", "VERSION_OTHER", `Die Datei wurde nach ${v} erstellt. Aktuell gültig ist ${S.VERSION.ldt3.expected} (in Kraft seit ${S.VERSION.ldt3.validFrom}).`, "Regel E001 der KBV erlaubt in Feld 0001 nur die aktuelle Version und meldet sonst eine Warnung. Ältere Versionen werden von vielen Praxisprogrammen trotzdem gelesen.");
  }
}

function checkFilename(m) {
  const base = m.name.split(/[\\/]/).pop();
  if (m.format === "ldt3" && !/^Z01[A-Z0-9_]*\.ldt$/i.test(base)) {
    addIssue(m, null, "hinweis", "FILENAME", `Der Dateiname „${base}“ folgt nicht der LDT-3-Namensregel (Z01…​.ldt).`, "KBV LDT 3.2.20, Kap. 6.7: Der Name beginnt mit „Z01“, danach folgen Buchstaben, Ziffern oder Unterstrich, Endung .ldt. Für die Anzeige hier spielt das keine Rolle, manche Praxisprogramme holen aber nur passende Dateien ab.");
  }
  if (m.format === "ldt2" && !/^[XSAZ]\d\d.{0,5}\.ldt$/i.test(base)) {
    addIssue(m, null, "hinweis", "FILENAME", `Der Dateiname „${base}“ folgt nicht der LDT-2-Namensregel (z. B. X01L0505.LDT).`, "KBV LDT 5.12, Kap. 2.7.3: Der erste Buchstabe nennt den Zeichensatz (X = IBM-Code, S = 7-Bit, A = ISO 8859-1, Z = ISO 8859-15). Manche Praxisprogramme holen nur passende Dateien ab.");
  }
}

/* ------------------------------------------------------------ Befunde */

function fmtDate(v, order) {
  if (!v) return "";
  if (!/^\d{8}$/.test(v)) return v;
  if (order === "TTMMJJJJ") return `${v.slice(0, 2)}.${v.slice(2, 4)}.${v.slice(4)}`;
  return `${v.slice(6, 8)}.${v.slice(4, 6)}.${v.slice(0, 4)}`;
}
export { fmtDate };

function objectPath(m, i) {
  const path = [];
  let o = m.lineObj ? m.lineObj[i] : -1;
  while (o >= 0) { path.push(m.objects[o]); o = m.objects[o].parent; }
  return path; // innerstes zuerst
}

export function inPatientContext(m, i) {
  if (m.format !== "ldt3") return true;
  return objectPath(m, i).some((o) => o.id === "Obj_0045" || o.id === "Obj_0048");
}

const BEFUND_FK = new Set([3101, 3102, 3103, 3110, 3000, 8310, 8311, 8301, 8302, 6200, 8401, 8410, 8411, 8418, 8420, 8421, 8460, 8461, 8462, 8422, 8480, 8470, 3564, 8490]);
const PATH_FK = new Set([3101, 3102, 3103, 3110, 3000, 8421, 3564]);
const RESULT_OBJECTS = new Set(["Obj_0060", "Obj_0061", "Obj_0062", "Obj_0063", "Obj_0073"]);

export function extractBefunde(m) {
  const out = [];
  if (m.format !== "ldt2" && m.format !== "ldt3" && m.format !== "bdt") return out;
  const order = m.format === "bdt" ? "TTMMJJJJ" : "JJJJMMTT";
  const indicator = m.format === "ldt2" ? S.INDICATOR.ldt2 : S.INDICATOR.ldt3;
  const statusMap = S.REPORT_STATUS[m.format] || {};
  const sexMap = S.SEX[m.format] || {};
  // BDT: Stammdaten aus Satzart 6100 über die Patientennummer 3000 zuordnen
  const stamm = new Map();
  if (m.format === "bdt") {
    for (const rec of m.records) {
      if (rec.type !== "6100") continue;
      const p = {};
      for (let i = rec.start; i <= rec.end; i++) {
        const f = m.fk[i];
        if (f === 3000) p.id = content(m, i).trim();
        else if (f === 3101) p.last = content(m, i).trim();
        else if (f === 3102) p.first = content(m, i).trim();
        else if (f === 3103) p.birth = fmtDate(content(m, i).trim(), order);
        else if (f === 3110) p.sex = content(m, i).trim();
      }
      if (p.id) stamm.set(p.id, p);
    }
  }
  for (const rec of m.records) {
    const isResult = m.format === "bdt" ? rec.type !== "6100" : S.RESULT_RECORDS[m.format].has(rec.type);
    if (!isResult) continue;
    const r = { record: rec.index, line: rec.start + 1, satzart: rec.type, satzLabel: rec.label, patient: {}, tests: [], notes: [] };
    let test = null, res = null, fresh = false, cur = 0;
    const newResult = () => { res = { value: "", unit: "", low: "", high: "", range: "", flag: "", flagText: "", text: [], line: cur + 1 }; test.results.push(res); return res; };
    for (let i = rec.start; i <= rec.end; i++) {
      const f = m.fk[i];
      cur = i;
      if (f < 0) continue;
      if (f === 8002 && m.format === "ldt3") {
        const id = content(m, i).trim();
        if (RESULT_OBJECTS.has(id)) {
          test = { line: i + 1, id: "", name: "", kind: S.LDT3_OBJECTS[id], status: "", results: [], notes: [] };
          r.tests.push(test); res = null; fresh = true;
        }
        continue;
      }
      if (!BEFUND_FK.has(f)) continue;
      const v = content(m, i).trim();
      const path = m.format === "ldt3" && PATH_FK.has(f) ? objectPath(m, i) : [];
      const inObj = (id) => path.some((o) => o.id === id);
      const patientCtx = m.format !== "ldt3" || inObj("Obj_0045");
      switch (f) {
        case 3101: if (patientCtx && !r.patient.last) r.patient.last = v; break;
        case 3102: if (patientCtx && !r.patient.first) r.patient.first = v; break;
        case 3103: if (patientCtx && !r.patient.birth) r.patient.birth = fmtDate(v, order); break;
        case 3110: if (patientCtx && !r.patient.sex) r.patient.sex = v; break;
        case 3000: if (patientCtx && !r.patient.id) r.patient.id = v; break;
        case 8310: if (!r.order) r.order = v; break;
        case 8311: if (!r.labOrder) r.labOrder = v; break;
        case 8301: r.received = fmtDate(v, order); break;
        case 8302: r.reported = fmtDate(v, order); break;
        case 6200: if (m.format === "bdt") r.reported = fmtDate(v, order); break;
        case 8401: r.status = v; break;
        case 8410:
          if (test && fresh && !test.id) { test.id = v; fresh = false; break; }
          test = { line: i + 1, id: v, name: "", status: "", results: [], notes: [] };
          r.tests.push(test); res = null; fresh = false;
          break;
        case 8411: if (test) test.name = v; break;
        case 8418: if (test) test.status = v; break;
        case 8420:
          if (!test) { test = { line: i + 1, id: "", name: "", status: "", results: [], notes: [] }; r.tests.push(test); }
          newResult(); res.value = v; res.line = i + 1;
          break;
        case 8421:
          if (!test) break;
          if (m.format === "ldt3" && inObj("Obj_0042")) { if (res && !res.unit) res.unit = v; }
          else { if (!res || res.unit) newResult(); res.unit = v; }
          break;
        case 8460: if (test) { (res || newResult()); res.range = res.range ? res.range + " " + v : v; } break;
        case 8461: if (test) { (res || newResult()); res.low = v; } break;
        case 8462: if (test) { (res || newResult()); res.high = v; } break;
        case 8422: if (test) { (res || newResult()); res.flag = v; res.flagText = indicator[v] || "laut Datei markiert"; } break;
        case 8480: if (test) { (res || newResult()); res.text.push(v); } break;
        case 8470: if (test) test.notes.push(v); break;
        case 3564: {
          const ft = path.find((o) => o.id === "Obj_0068");
          const isResultText = ft && ft.attrLine >= 0 && m.fk[ft.attrLine] === 8237;
          if (test && isResultText) { (res || newResult()); res.text.push(v); }
          else if (v) (test ? test.notes : r.notes).push(v);
          break;
        }
        case 8490: r.notes.push(v); break;
        default: break;
      }
    }
    if (m.format === "bdt" && r.patient.id && stamm.has(r.patient.id)) r.patient = { ...stamm.get(r.patient.id), ...Object.fromEntries(Object.entries(r.patient).filter(([, v]) => v)) };
    if (r.patient.sex) r.patient.sexText = sexMap[r.patient.sex] || r.patient.sex;
    if (r.status) r.statusText = statusMap[r.status] || r.status;
    r.tests = r.tests.filter((t) => t.id || t.name || t.results.length);
    for (const t of r.tests) if (!t.name && t.kind && !t.id) t.name = t.kind;
    for (const t of r.tests) if (!t.results.length) t.results.push({ value: "", unit: "", low: "", high: "", range: "", flag: "", flagText: "", text: [], line: t.line });
    if (r.tests.length || m.format !== "bdt") out.push(r);
  }
  return out;
}

/* --------------------------------------------------------- Zusammenfassung */

function firstContent(m, f, from = 0, to = m.lines.n - 1, filter) {
  for (let i = from; i <= to && i < m.lines.n; i++) if (m.fk[i] === f && (!filter || filter(i))) return content(m, i).trim();
  return "";
}

function buildSummary(m) {
  const s = {
    format: m.format, formatLabel: S.FORMAT_LABEL[m.format] || m.format, version: m.version,
    bdtVariant: m.bdtVariant, charset: m.charset.charset, charsetLabel: CHARSETS[m.charset.charset]?.label || m.charset.charset,
    charsetSource: m.charset.source, charsetConfidence: m.charset.confidence, charsetCandidates: m.charset.candidates,
    lines: m.lines.n, records: m.records.length, size: m.size,
    issues: m.issueCounts, truncated: m.truncated,
  };
  if (m.empty) return s;
  const recs = m.records;
  const head = recs.find((r) => ["8220", "8230"].includes(r.type));
  if (m.format === "ldt2" && head) {
    const lab = firstContent(m, 8320, head.start, head.end) || firstContent(m, 8300, head.start, head.end);
    const praxis = firstContent(m, 203, head.start, head.end);
    if (head.type === "8220") { s.sender = lab ? `Labor: ${lab}` : ""; s.receiver = praxis ? `Einsender: ${praxis}` : ""; }
    else { s.sender = praxis ? `Praxis: ${praxis}` : ""; s.receiver = lab ? `Labor: ${lab}` : ""; }
    s.date = fmtDate(firstContent(m, 9103, head.start, head.end), "JJJJMMTT");
    s.direction = head.type === "8220" ? "Befund vom Labor an die Praxis" : "Auftrag von der Praxis an das Labor";
  }
  if (m.format === "ldt3" && head) {
    const org = firstContent(m, 1250, head.start, head.end);
    const id = firstContent(m, 8316, head.start, head.end);
    const body = recs.find((r) => r.type === "8205" || r.type === "8215");
    const einsender = body ? (firstContent(m, 203, body.start, body.end) || firstContent(m, 1250, body.start, body.end)) : "";
    if (head.type === "8220") { s.sender = org ? `Labor: ${org}` : id ? `Labor-ID ${id}` : ""; s.receiver = einsender ? `Einsender: ${einsender}` : ""; }
    else {
      s.sender = org ? `Praxis: ${org}` : einsender ? `Praxis: ${einsender}` : "";
      const labObj = body ? m.objects.find((o) => o.id === "Obj_0036" && o.record === body.index) : null;
      const lab = labObj ? firstContent(m, 1250, labObj.start, labObj.end) : "";
      s.receiver = lab ? `Labor: ${lab}` : "";
    }
    s.date = fmtDate(firstContent(m, 7278, head.start, head.end), "JJJJMMTT");
    s.direction = head.type === "8220" ? "Befund vom Labor an die Praxis" : "Auftrag von der Praxis an das Labor";
  }
  if (m.format === "bdt") {
    const z = firstContent(m, 9603);
    if (z && /^\d{16}$/.test(z)) s.date = `${fmtDate(z.slice(0, 8), "TTMMJJJJ")} bis ${fmtDate(z.slice(8), "TTMMJJJJ")}`;
    s.direction = "Export aus einer Praxissoftware";
    s.patientRecords = recs.filter((r) => r.type === "6100").length;
  }
  const bef = m.befunde || [];
  const pats = new Set(bef.map((b) => [b.patient.last, b.patient.first, b.patient.birth, b.patient.id].join("|")));
  if (m.format === "bdt") {
    const ids = new Set();
    for (let i = 0; i < m.lines.n; i++) if (m.fk[i] === 3000) ids.add(content(m, i).trim());
    s.patients = ids.size || s.patientRecords || 0;
  } else s.patients = bef.length ? pats.size : 0;
  s.befunde = bef.length;
  s.tests = bef.reduce((a, b) => a + b.tests.length, 0);
  s.flagged = bef.reduce((a, b) => a + b.tests.reduce((x, t) => x + t.results.filter((r) => r.flag && r.flag !== "N").length, 0), 0);
  if (m.checksum) s.checksum = m.checksum;
  return s;
}

/* ------------------------------------------------------- Zeilen-Ansicht */

export function rowInfo(m, i) {
  const f = m.fk[i];
  const def = f >= 0 ? fieldDef(m, f) : null;
  const L = m.lines.end[i] - m.lines.start[i];
  const objIdx = m.lineObj ? m.lineObj[i] : -1;
  return {
    i, line: i + 1,
    len: m.len[i] >= 0 ? String(m.len[i]).padStart(3, "0") : "",
    actual: L >= 7 ? contentBytes(m, i) + 9 : L,
    fk: fkString(f),
    label: f >= 0 ? fieldLabel(m, f) : L === 0 ? "leere Zeile" : "nicht lesbar",
    known: !!def,
    content: L >= 7 ? content(m, i) : rawLine(m, i),
    sev: m.lineSev ? m.lineSev[i] : 0,
    rec: m.lineRec ? m.lineRec[i] : -1,
    obj: objIdx,
    depth: objIdx >= 0 ? m.objects[objIdx].depth + 1 : 0,
  };
}
