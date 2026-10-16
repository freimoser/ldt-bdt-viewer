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

test("Auftrag: Übersicht mit Patient, Anforderungen, Diagnose, Material und Abrechnung", () => {
  const b = BEISPIELE.find((x) => x.file === "Z01_LDT3_Auftrag.ldt");
  const m = openFile(b.build(now), b.file, dict);
  assert.equal(m.befunde.length, 0);
  const [a] = m.auftraege;
  assert.equal(a.patient.last, "Test-Krüger");
  assert.deepEqual(a.tests.map((t) => t.id), ["TGLU", "THB", "TKRE"]);
  assert.deepEqual(a.diagnoses, [{ icd: "R73.9", certainty: "Verdacht auf" }]);
  assert.equal(a.billing, "GKV, Laborgemeinschaft");
  assert.deepEqual(a.material, ["Serum (Testmaterial)"]);
});

test("Generator: LDT-3-Aufträge mit vielen Patienten sind fehlerfrei", async () => {
  const { generate } = await import("../src/assets/js/core/generator.js");
  const g = generate({ format: "ldt3order", count: 25, seed: 9, now });
  const m = openFile(g.bytes, g.name, dict);
  assert.equal(m.issueCounts.fehler, 0, JSON.stringify(m.issues.slice(0, 3)));
  assert.equal(m.issueCounts.warnung, 0);
  assert.equal(m.auftraege.length, 25);
  assert.match(new TextDecoder("latin1").decode(g.bytes), /TESTDATEN/);
});

/* Kontextregeln (K-Regeln): jede Regel an einer gezielt veränderten, sonst gültigen Beispieldatei */
import { sha1Hex } from "../src/assets/js/core/sha1.js";
function variant(file, fn) {
  const b = BEISPIELE.find((x) => x.file === file);
  const lines = new TextDecoder("latin1").decode(b.build(now)).split("\r\n");
  const out = fn(lines);
  const k = out.findIndex((l) => l.slice(3, 7) === "9300");
  const enc = (t) => Uint8Array.from(t, (c) => c.charCodeAt(0));
  if (k >= 0) { const sum = sha1Hex(enc(out.slice(0, k).join("\r\n") + "\r\n")); out[k] = "0499300" + sum; }
  return openFile(enc(out.join("\r\n")), file, dict);
}
const L = (fk, v) => `${String(v.length + 9).padStart(3, "0")}${fk}${v}`;
const codes = (m) => m.issues.map((i) => i.code);

test("K096: vorläufiger Ergebnisstatus in abgeschlossenem Befund", () => {
  const m = variant("Z01_LDT3_Befund_auffaellig.ldt", (l) => { l[l.findIndex((x) => x === L("8418", "06"))] = L("8418", "05"); return l; });
  assert.ok(codes(m).includes("K096"), codes(m).join(","));
});
test("K005: Abrechnungsangabe in Teilbefund", () => {
  const m = variant("Z01_LDT3_Teilbefund.ldt", (l) => { const k = l.findIndex((x) => x === L("8001", "8205")); l.splice(k, 0, L("4121", "1")); return l; });
  assert.ok(codes(m).includes("K005"), codes(m).join(","));
});
test("K002: Einheitensystem ohne Maßeinheit", () => {
  const m = variant("Z01_LDT3_Befund_unauffaellig.ldt", (l) => { const k = l.findIndex((x, i) => x === L("8419", "2") && l[i + 1].slice(3, 7) === "8421"); l.splice(k + 1, 1); return l; });
  assert.ok(codes(m).includes("K002"), codes(m).join(","));
});
test("K099: Extremwert ohne Aufmerksamkeitsmeldung", () => {
  const m = variant("Z01_LDT3_Befund_auffaellig.ldt", (l) => { l[l.findIndex((x) => x === L("8422", "HH"))] = L("8422", "!H"); return l; });
  assert.ok(codes(m).includes("K099"), codes(m).join(","));
});
test("K076: Ergebnis ohne Zeitpunkt der Messung", () => {
  const m = variant("Z01_LDT3_Befund_unauffaellig.ldt", (l) => { const k = l.findIndex((x) => x.slice(3) === "8225Timestamp_Messung"); l.splice(k, 6); return l; });
  assert.ok(codes(m).includes("K076"), codes(m).join(","));
});
test("K-Regeln: keine Meldung bei den gültigen Beispielen", () => {
  for (const b of BEISPIELE.filter((x) => x.group === "ldt3")) {
    const m = openFile(b.build(now), b.file, dict);
    assert.deepEqual(codes(m).filter((c) => /^K\d{3}$/.test(c)), [], b.file);
  }
});
