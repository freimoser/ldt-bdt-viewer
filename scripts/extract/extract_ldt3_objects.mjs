/**
 * Objektkatalog LDT 3.2.20 (Kap. 11) aus der Textfassung des PDFs:
 *   pdftotext -layout specs/ldt3_2_20.pdf specs/ldt3_2_20.txt
 *   node scripts/extract/extract_ldt3_objects.mjs > data/ldt3-objekte.json
 * Je Objekt: Name, Seite und die Felder mit Ebene (Spalte „Vorkommen“), Anzahl (1/n) und Feldart (M, m, K, k).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const lines = readFileSync(join(root, "specs", "ldt3_2_20.txt"), "utf8").split("\n");

const out = {};
let cur = null, cols = null, artCol = -1;
const sectionRe = /^1[01]\.\d+\s+(Obj_\S.*?)\s+„(Obj_\d{4})["“”]/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const page = /Seite (\d+) von 187/.exec(line);
  if (page) { if (cur && !cur.page) cur.page = Number(page[1]); continue; }
  const sec = sectionRe.exec(line);
  if (sec) { cur = { name: sec[1].replace(/\s+/g, " "), page: 0, fields: [] }; out[sec[2]] = cur; cols = null; continue; }
  if (/^12\s+\S/.test(line) && cur) { cur = null; continue; }
  if (!cur) continue;
  if (/\bFK\b/.test(line) && /Vorkommen/.test(line) && /Feldart/.test(line)) { artCol = line.indexOf("Feldart"); continue; }
  if (/^\s+1\s+2\s+3\s+4/.test(line)) { cols = [...line.matchAll(/\d/g)].map((m) => m.index); continue; }
  if (!cols) continue;
  const tokens = [...line.matchAll(/\S+/g)].map((m) => ({ t: m[0], x: m.index }));
  if (!tokens.length) continue;
  const level = (() => {
    const tok = tokens.find((k) => (k.t === "1" || k.t === "n") && k.x >= cols[0] - 3 && k.x <= cols[cols.length - 1] + 3);
    if (!tok) return null;
    let best = 0;
    cols.forEach((c, k) => { if (Math.abs(c - tok.x) < Math.abs(cols[best] - tok.x)) best = k; });
    return { level: best + 1, count: tok.t };
  })();
  const art = tokens.filter((k) => /^[MmKk]$/.test(k.t) && Math.abs(k.x - artCol) <= 6).sort((a, b) => Math.abs(a.x - artCol) - Math.abs(b.x - artCol))[0];
  const fk = /^\s*(\d{4})\s/.exec(line);
  if (fk && level && art) {
    cur.fields.push({ fk: fk[1], level: level.level, n: level.count, art: art.t });
  } else if (!fk && level && /Obj_\d{4}\s*\(/.test(line) && cur.fields.length) {
    const ref = /Obj_\d{4}/.exec(line)[0];
    cur.fields[cur.fields.length - 1].obj = ref;
  }
}
console.log(JSON.stringify(out, null, 1));
