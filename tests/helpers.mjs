import { buildDict } from "../scripts/lib/dict.mjs";
import { openFile, content } from "../src/assets/js/core/xdt.js";
import { generate } from "../src/assets/js/core/generator.js";
import { buildFile } from "../src/assets/js/core/writer.js";
import { encode } from "../src/assets/js/core/charsets.js";

export const dict = buildDict();
export const FIXED_NOW = new Date(Date.UTC(2026, 9, 8, 9, 30, 0));

export function open(bytes, name) {
  return openFile(bytes, name, dict);
}

export function gen(format, opts = {}) {
  return generate({ format, count: 3, seed: 42, now: FIXED_NOW, ...opts });
}

/** Text aller Feldinhalte (dekodiert), zum Suchen nach Namen. */
export function allText(m) {
  let s = "";
  for (let i = 0; i < m.lines.n; i++) s += content(m, i) + "\n";
  return s;
}

export function codes(m) {
  const c = {};
  for (const i of m.issues) c[i.code] = (c[i.code] || 0) + 1;
  return c;
}

export function lines(bytes) {
  return new TextDecoder("latin1").decode(bytes).split("\r\n").filter((l) => l.length);
}

export function fromLines(arr, charset = "iso-8859-15") {
  // Zeilen ohne Längenangabe ("FFFFInhalt") mit korrekter Länge schreiben
  const parts = arr.map((l) => {
    const c = encode(l.slice(4), charset);
    const head = String(c.length + 9).padStart(3, "0") + l.slice(0, 4);
    const out = new Uint8Array(head.length + c.length + 2);
    for (let i = 0; i < head.length; i++) out[i] = head.charCodeAt(i);
    out.set(c, head.length); out[out.length - 2] = 13; out[out.length - 1] = 10;
    return out;
  });
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}

export { buildFile, encode, generate };
