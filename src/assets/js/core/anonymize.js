/**
 * Anonymisierung für Support-Anfragen.
 * Ersetzt Namen, Geburtsdaten, Adressen, Versichertennummern und Telefonnummern durch Platzhalter,
 * entfernt eingebettete Anhänge (LDT 3, Obj_0010) und berechnet alle Längenfelder neu.
 */
import * as S from "./spec.js";
import { content, fkString, inPatientContext } from "./xdt.js";
import { buildFile } from "./writer.js";

// Gültige Test-Versicherten-ID: A + 8 Nullen + Prüfziffer (Verfahren laut KBV LDT 3.2.20, FK 3119)
export function kvnrCheckDigit(letterAnd8) {
  const letter = letterAnd8[0].toUpperCase().charCodeAt(0) - 64;
  const digits = String(letter).padStart(2, "0") + letterAnd8.slice(1);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let p = Number(digits[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(p / 10) + (p % 10);
  }
  return String((10 - (sum % 10)) % 10);
}
const TEST_KVNR = "A00000000" + kvnrCheckDigit("A00000000");

const STRUCTURAL = new Set([8000, 8001, 8002, 8003, 8100, 8202, 9202, 9300]);

const WORD = /[\p{L}\p{N}]+/gu;

export function anonymize(m) {
  if (!["ldt2", "ldt3", "bdt"].includes(m.format)) throw new Error("Anonymisieren ist nur für LDT- und BDT-Dateien möglich.");
  const order = m.format === "bdt" ? "TTMMJJJJ" : "JJJJMMTT";
  const P = S.PERSONAL;
  const nameSet = new Set(P.name), birthSet = new Set(P.birth), addrSet = new Set(P.address), insSet = new Set(P.insurance), phoneSet = new Set(P.phone), idSet = new Set(P.patientId);
  const report = { names: 0, births: 0, addresses: 0, insurance: 0, phones: 0, ids: 0, freeText: 0, removedLines: 0, removedAttachments: 0 };

  // Objekte, die komplett entfernt werden (Anhänge können PDFs mit Patientendaten enthalten)
  const removeLine = new Uint8Array(m.lines.n);
  if (m.format === "ldt3") {
    for (const o of m.objects) {
      if (o.id !== "Obj_0010") continue;
      const from = o.attrLine >= 0 ? o.attrLine : o.start;
      for (let i = from; i <= o.end; i++) removeLine[i] = 1;
      report.removedAttachments++;
    }
  }

  // 1) Originalwerte einsammeln und Platzhalter festlegen
  const originals = new Map(); // Text -> Platzhalter (für Freitext)
  const personIdx = new Map();
  const patientNo = new Map();
  let lastName = null;
  const repl = new Array(m.lines.n);
  for (let i = 0; i < m.lines.n; i++) {
    if (removeLine[i] || m.fk[i] < 0) continue;
    const f = fkString(m.fk[i]);
    const v = content(m, i).trim();
    if (!v) continue;
    const patient = inPatientContext(m, i);
    if (nameSet.has(f)) {
      if (f === "3100" || f === "3120") { removeLine[i] = 1; report.names++; remember(originals, v, ""); continue; }
      if (f === "3104") continue; // akademischer Titel bleibt
      if (f === "3101") {
        lastName = v;
        if (!personIdx.has(v)) personIdx.set(v, personIdx.size + 1);
        repl[i] = "Anonym" + personIdx.get(v);
      } else if (f === "3102") repl[i] = "Vorname";
      else repl[i] = "Anonym";
      remember(originals, v, repl[i]);
      report.names++;
    } else if (birthSet.has(f) && patient) {
      repl[i] = order === "TTMMJJJJ" ? "01011900" : "19000101";
      if (/^\d{8}$/.test(v)) {
        const d = order === "TTMMJJJJ" ? v : v.slice(6) + v.slice(4, 6) + v.slice(0, 4);
        remember(originals, v, repl[i]);
        remember(originals, `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`, "01.01.1900");
      }
      report.births++;
    } else if (addrSet.has(f) && patient) {
      repl[i] = { "3106": "00000 Anonymort", "3107": "Anonymstrasse", "3109": "1", "3112": "00000", "3113": "Anonymort", "3121": "00000", "3122": "Anonymort", "3123": "0" }[f];
      if (f === "3115") { removeLine[i] = 1; report.addresses++; remember(originals, v, ""); continue; }
      if (f === "3107") remember(originals, v, repl[i]);
      report.addresses++;
    } else if (insSet.has(f) && patient) {
      repl[i] = f === "3119" ? TEST_KVNR : "000000";
      remember(originals, v, repl[i]);
      report.insurance++;
    } else if (phoneSet.has(f) && patient) {
      repl[i] = f === "3619" || f === "7335" ? "anonym@example.invalid" : "0000";
      if (v.replace(/\D/g, "").length >= 5) remember(originals, v, repl[i]);
      report.phones++;
    } else if (idSet.has(f) && patient) {
      if (!patientNo.has(v)) patientNo.set(v, "ANON" + String(patientNo.size + 1).padStart(4, "0"));
      repl[i] = patientNo.get(v);
      if (v.length >= 4) remember(originals, v, repl[i]);
      report.ids++;
    }
  }

  // 2) Freitext: Vorkommen der Originalwerte ersetzen (Suche über das erste Wort jedes Originalwerts)
  const byFirst = new Map();
  for (const [orig, ph] of originals) {
    if (orig.length < 2) continue;
    const first = (orig.match(WORD) || [orig])[0].toLowerCase();
    if (!byFirst.has(first)) byFirst.set(first, []);
    byFirst.get(first).push([orig.toLowerCase(), ph]);
  }
  for (const list of byFirst.values()) list.sort((a, b) => b[0].length - a[0].length);
  const re = byFirst.size ? true : null;
  const replaceKnown = (text) => {
    const low = text.toLowerCase();
    if (low.length !== text.length) return text;
    let out = "", last = 0;
    WORD.lastIndex = 0;
    let mt;
    while ((mt = WORD.exec(low))) {
      const cands = byFirst.get(mt[0]);
      if (!cands || mt.index < last) continue;
      for (const [needle, ph] of cands) {
        if (!low.startsWith(needle, mt.index)) continue;
        const endPos = mt.index + needle.length;
        if (endPos < low.length && /[\p{L}\p{N}]/u.test(low[endPos])) continue;
        out += text.slice(last, mt.index) + ph;
        last = endPos;
        WORD.lastIndex = endPos;
        break;
      }
    }
    return last ? out + text.slice(last) : text;
  };

  // 3) Datei neu aufbauen
  const records = [];
  let cur = { type: "", fields: [] };
  const flush = () => { if (cur.fields.length) records.push(cur); };
  for (let i = 0; i < m.lines.n; i++) {
    if (removeLine[i]) { report.removedLines++; continue; }
    const L = m.lines.end[i] - m.lines.start[i];
    if (L === 0) continue;
    if (m.fk[i] < 0) { cur.fields.push({ raw: m.bytes.slice(m.lines.start[i], m.lines.end[i]) }); continue; }
    const f = fkString(m.fk[i]);
    if (f === "8000") { flush(); cur = { type: content(m, i).trim(), fields: [] }; }
    let value;
    if (repl[i] !== undefined) value = repl[i];
    else {
      value = content(m, i);
      const numeric = m.fk[i];
      const computed = (m.format === "ldt2" || (m.format === "bdt" && m.bdtVariant !== "3.0")) ? numeric === 8100 || numeric === 9202 : m.format === "ldt3" ? numeric === 9300 : numeric === 8202;
      if (computed) value = null;
      else if (re && !STRUCTURAL.has(numeric) && !(numeric >= 8100 && numeric <= 8299 && m.format === "ldt3")) {
        const nv = replaceKnown(value);
        if (nv !== value) { report.freeText++; value = nv || "Anonym"; }
      }
    }
    cur.fields.push({ fk: f, value });
  }
  flush();
  const width8100 = guessWidth(m, 8100, 5), width9202 = guessWidth(m, 9202, 8);
  const bytes = buildFile(records, { charset: m.charset.charset === "utf-8" ? "iso-8859-15" : m.charset.charset, lengthWidth: width8100, totalWidth: width9202 });
  return { bytes, name: anonName(m), report, charset: m.charset.charset === "utf-8" ? "iso-8859-15" : m.charset.charset, originals: [...originals.keys()] };
}

function remember(map, v, placeholder) {
  if (v && !map.has(v)) map.set(v, placeholder);
}

function guessWidth(m, fk, dflt) {
  for (let i = 0; i < m.lines.n; i++) if (m.fk[i] === fk) return Math.max(1, m.lines.end[i] - m.lines.start[i] - 7);
  return dflt;
}

function anonName(m) {
  const base = m.name.split(/[\\/]/).pop();
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : m.format === "bdt" ? ".bdt" : ".ldt";
  if (m.format === "ldt2" && /^[XSAZ]\d\d/i.test(stem)) return stem.slice(0, 3) + "ANONY" + ext;
  return stem.replace(/[^A-Za-z0-9_]/g, "_") + "_ANONYM" + ext;
}
