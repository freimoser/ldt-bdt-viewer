import { test } from "node:test";
import assert from "node:assert/strict";
import { open, gen } from "./helpers.mjs";
import { anonymize } from "../src/assets/js/core/anonymize.js";
import { rowInfo } from "../src/assets/js/core/xdt.js";

test("Sehr große Datei (mindestens 20 MB) wird vollständig und zügig verarbeitet", () => {
  const g = gen("ldt3", { count: 5800, maxCount: 100000 });
  assert.ok(g.bytes.length >= 20 * 1024 * 1024, `Größe ${g.bytes.length}`);
  const t0 = performance.now();
  const m = open(g.bytes, g.name);
  const ms = performance.now() - t0;
  assert.equal(m.issueCounts.fehler, 0);
  assert.equal(m.befunde.length, 5800);
  assert.ok(m.lines.n > 300000);
  // Einzelne Zeilen lassen sich ohne Vollaufbereitung abrufen
  const r = rowInfo(m, m.lines.n - 2);
  assert.equal(r.fk, "9300");
  console.log(`  ${ (g.bytes.length / 1048576).toFixed(1) } MB, ${m.lines.n} Zeilen, geprüft in ${Math.round(ms)} ms`);
  assert.ok(ms < 60000);
  const a = anonymize(m);
  const m2 = open(a.bytes, a.name);
  assert.equal(m2.issueCounts.fehler, 0);
});
