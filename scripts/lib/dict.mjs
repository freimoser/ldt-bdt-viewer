/**
 * Baut aus den extrahierten Feldtabellen (data/*.json) das kompakte Feldwörterbuch
 * für Browser und Tests. Einträge: n = Name, l = Länge, t = Typ, r = Regeln,
 * v = erlaubte Inhalte, d = Erläuterung, e = Beispiel, p = Seite in der Quelle.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (f) => JSON.parse(readFileSync(join(root, "data", f), "utf8"));

function tidy(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .replace(/_ (?=\S)/g, "_")
    .replace(/(\p{Ll})- (\p{Lu})/gu, "$1-$2")
    .trim();
}

export function buildDict() {
  const ldt2 = read("ldt2-feldtabelle.json");
  const ldt3 = read("ldt3-feldtabelle.json");
  const bdt = read("bdt3-feldtabelle.json");
  const rules = read("ldt3-regeltabelle.json");
  const out = { ldt2: {}, ldt3: {}, bdt: {}, rules: {} };
  for (const [fk, v] of Object.entries(ldt2)) {
    out.ldt2[fk] = { n: tidy(v.name), l: tidy(v.len), t: tidy(v.type), r: tidy(v.rules), v: tidy(v.values), e: tidy(v.example), p: v.page };
  }
  for (const [fk, v] of Object.entries(ldt3)) {
    let d = tidy(v.desc);
    if (fk === "8003") d = d.replace(/Mit den Feldkennungen 8101 bis 8299.*$/, "").trim();
    out.ldt3[fk] = { n: tidy(v.name), l: tidy(v.len), t: tidy(v.type), r: tidy(v.rules), d, p: v.page };
  }
  for (const [fk, v] of Object.entries(bdt)) {
    out.bdt[fk] = { n: tidy(v.name), l: tidy(v.len), t: tidy(v.type), f: tidy(v.format), v: tidy(v.values), d: tidy([v.desc, v.oid].filter(Boolean).join(" ")), p: v.page };
  }
  // Klassischer BDT-Aufbau: Satzlänge im zweiten Feld (Uni Gießen, Beschreibung des BDT-Formats)
  if (!out.bdt["8100"]) out.bdt["8100"] = { n: "Satzlänge", l: "5", t: "n", f: "", v: "", d: "Satzlänge des aktuellen Satzes in Bytes (klassischer BDT-Aufbau, Quelle: Universität Gießen, Beschreibung des BDT-Formats).", p: null, src: "giessen" };
  const used = new Set();
  for (const v of Object.values(out.ldt3)) for (const r of (v.r || "").split(/\s+/)) if (/^E\d{3}$/.test(r)) used.add(r);
  for (const r of used) if (rules[r]) out.rules[r] = { c: rules[r].check, x: rules[r].expl, s: rules[r].status, p: rules[r].page };
  return out;
}
