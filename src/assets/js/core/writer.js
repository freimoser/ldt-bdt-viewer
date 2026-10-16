/**
 * Schreibt xDT-Dateien mit korrekten Längenangaben.
 * Zeile = 3 Ziffern Länge + 4 Ziffern Feldkennung + Inhalt + CR LF, Länge = Inhalt + 9.
 * Satzlänge 8100 (LDT 2, klassischer BDT), Gesamtlänge 9202 (LDT 2), Prüfsumme 9300 (LDT 3, SHA-1),
 * Feldanzahl 8202 (BDT 3.0) werden berechnet, wenn der Wert null ist.
 */
import { encode } from "./charsets.js";
import { sha1Hex } from "./sha1.js";

const CRLF = new Uint8Array([13, 10]);
const ascii = (s) => { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };

function fieldBytes(fk, valueBytes) {
  const L = valueBytes.length + 9;
  if (L > 999) throw new Error(`Feld ${fk}: Inhalt zu lang (${valueBytes.length} Bytes, höchstens 990).`);
  const out = new Uint8Array(L);
  out.set(ascii(String(L).padStart(3, "0") + fk), 0);
  out.set(valueBytes, 7);
  out.set(CRLF, L - 2);
  return out;
}

/**
 * records: [{ type, fields: [{ fk, value } | { raw: Uint8Array }] }]
 * value === null markiert ein Feld, dessen Inhalt berechnet wird (8100, 9202, 9300, 8202).
 */
export function buildFile(records, { charset = "iso-8859-15", lengthWidth = 5, totalWidth = 8 } = {}) {
  // 1) Felder kodieren, Satzlängen berechnen
  const encoded = records.map((rec) => {
    const lines = rec.fields.map((f) => {
      if (f.raw) return { raw: f.raw, len: f.raw.length + 2 };
      if (f.value === null) {
        const w = f.fk === "8100" ? lengthWidth : f.fk === "9202" ? totalWidth : f.fk === "9300" ? 40 : 0;
        return { fk: f.fk, pending: true, len: w ? w + 9 : null };
      }
      const vb = encode(String(f.value), charset);
      return { fk: f.fk, bytes: vb, len: vb.length + 9 };
    });
    return { type: rec.type, lines };
  });
  for (const rec of encoded) {
    // 8202 = Anzahl Felder (BDT 3.0)
    for (const l of rec.lines) if (l.pending && l.fk === "8202") { l.bytes = ascii(String(rec.lines.length)); l.len = l.bytes.length + 9; l.pending = false; }
    const sum = rec.lines.reduce((a, l) => a + l.len, 0);
    rec.length = sum;
    for (const l of rec.lines) if (l.pending && l.fk === "8100") { l.bytes = ascii(String(sum).padStart(lengthWidth, "0")); l.pending = false; }
  }
  // 2) Gesamtlänge (alle Sätze außer Datenträger-Header/-Abschluss, inklusive Abschluss-Satz)
  const total = encoded.filter((r) => r.type !== "0020" && r.type !== "0021").reduce((a, r) => a + r.length, 0);
  for (const rec of encoded) for (const l of rec.lines) if (l.pending && l.fk === "9202") { l.bytes = ascii(String(total).padStart(totalWidth, "0")); l.pending = false; }

  // 3) Zusammensetzen, 9300 als SHA-1 über alle vorherigen Bytes
  const size = encoded.reduce((a, r) => a + r.length, 0);
  const out = new Uint8Array(size);
  let pos = 0;
  for (const rec of encoded) {
    for (const l of rec.lines) {
      if (l.raw) { out.set(l.raw, pos); pos += l.raw.length; out.set(CRLF, pos); pos += 2; continue; }
      if (l.pending && l.fk === "9300") { l.bytes = ascii(sha1Hex(out, pos)); l.pending = false; }
      const fb = fieldBytes(l.fk, l.bytes);
      out.set(fb, pos); pos += fb.length;
    }
  }
  return out.subarray(0, pos);
}
