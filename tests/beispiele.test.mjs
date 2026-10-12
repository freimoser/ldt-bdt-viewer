/** Jede Datei im Kompendium muss das erwartete Prüfergebnis liefern. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BEISPIELE } from "../src/assets/js/core/beispiele.js";
import { openFile } from "../src/assets/js/core/xdt.js";
import { buildDict } from "../scripts/lib/dict.mjs";

const dict = buildDict();
const now = new Date("2026-10-08T09:30:00Z");

for (const b of BEISPIELE) {
  test(`Beispiel ${b.file}: ${b.title}`, () => {
    const m = openFile(b.build(now), b.file, dict);
    assert.equal(m.format, b.group.startsWith("ldt3") ? "ldt3" : b.group.startsWith("ldt2") ? "ldt2" : m.format);
    const detail = m.issues.slice(0, 5).map((i) => `${i.code} Z.${i.line + 1}`).join(", ");
    if ("errors" in b.expect) assert.equal(m.issueCounts.fehler, b.expect.errors, detail);
    if ("warnings" in b.expect) assert.equal(m.issueCounts.warnung, b.expect.warnings, detail);
    if (b.expect.code) assert.ok(m.issues.some((i) => i.code === b.expect.code), `erwartet ${b.expect.code}, gefunden: ${detail}`);
    assert.ok(m.befunde.length >= 1 || b.expect.noBefund, "Befund erwartet");
    if (b.expect.cause) assert.ok(m.diagnosis && m.diagnosis.title.includes(b.expect.cause), `Ursache „${b.expect.cause}“ erwartet, erkannt: ${m.diagnosis?.title}`);
    if (b.group !== "fehler") assert.equal(m.diagnosis, null, "gültige Datei darf keine Fehlerursache haben");
    for (const f of ["title", "short", "shows"]) assert.ok(b[f], `${f} fehlt`);
    if (b.group === "fehler") assert.ok(b.cause && b.fix, "Fehlerbeispiel braucht Ursache und Behebung");
  });
}

test("Teilbefund: Status und fehlender Wert werden verständlich erfasst", () => {
  const b = BEISPIELE.find((x) => x.file === "Z01_LDT3_Teilbefund.ldt");
  const [bef] = openFile(b.build(now), b.file, dict).befunde;
  assert.equal(bef.partial, true);
  const tsh = bef.tests.find((t) => t.id === "TTSH");
  assert.equal(tsh.statusText, "Ergebnis folgt");
  assert.deepEqual(tsh.notes, [], "Befundnotiz darf nicht am letzten Test hängen");
  assert.ok(bef.notes.some((n) => n.startsWith("TESTDATEN")));
});

test("Extremwert: Meldung des Labors wird als Meldung erkannt", () => {
  const b = BEISPIELE.find((x) => x.file === "Z01_LDT3_Befund_auffaellig.ldt");
  const [bef] = openFile(b.build(now), b.file, dict).befunde;
  const kal = bef.tests.find((t) => t.id === "TKAL");
  assert.equal(kal.results[0].flag, "!H");
  assert.equal(kal.alerts.length, 1);
  assert.deepEqual(kal.notes, []);
  assert.equal(bef.tests.find((t) => t.id === "TKRE").notes.length, 1);
});
