import { test } from "node:test";
import assert from "node:assert/strict";
import { open, gen, codes, allText, fromLines, buildFile, dict } from "./helpers.mjs";
import { decode, encode } from "../src/assets/js/core/charsets.js";
import { sha1Hex } from "../src/assets/js/core/sha1.js";
import { anonymize } from "../src/assets/js/core/anonymize.js";
import { befundeCsv } from "../src/assets/js/core/export.js";

const errorsAndWarnings = (m) => m.issueCounts.fehler + m.issueCounts.warnung;

test("Zeichentabellen: Codepage 437 hat 128 obere Zeichen, Umlaute runden fehlerfrei", () => {
  for (const cs of ["cp437", "iso-8859-1", "iso-8859-15", "din66003"]) {
    const text = "Müller Größe Äpfel Öl Übel ß";
    const b = encode(text, cs);
    assert.equal(decode(b, 0, b.length, cs), text, cs);
  }
  const all = new Uint8Array(256).map((_, i) => i);
  assert.equal(decode(all, 128, 256, "cp437").length, 128);
  assert.equal(decode(new Uint8Array([0xa4]), 0, 1, "iso-8859-15"), "€");
});

test("SHA-1 stimmt mit bekannten Testvektoren überein", () => {
  assert.equal(sha1Hex(new Uint8Array(0)), "da39a3ee5e6b4b0d3255bfef95601890afd80709");
  assert.equal(sha1Hex(encode("abc", "iso-8859-15")), "a9993e364706816aba3e25717850c26c9cd0d89d");
  const long = encode("a".repeat(1000), "iso-8859-15");
  assert.equal(sha1Hex(long), "291e9a6c66994949b57ba5e650361e98fc36b1ba");
});

for (const format of ["ldt2", "ldt3", "bdt"]) {
  test(`Generator: gültige ${format.toUpperCase()}-Datei läuft fehlerfrei durch den Prüfer`, () => {
    const g = gen(format);
    const m = open(g.bytes, g.name);
    assert.equal(m.format, format);
    assert.equal(errorsAndWarnings(m), 0, JSON.stringify(m.issues.slice(0, 5), null, 1));
    assert.ok(m.befunde.length >= 1);
    assert.ok(m.summary.patients >= 1);
    // Testdaten sind erkennbar
    assert.match(allText(m), /TESTDATEN/);
  });
}

test("LDT 2: Version, Satzlänge 8100 und Gesamtlänge 9202 werden geprüft", () => {
  const g = gen("ldt2");
  const m = open(g.bytes, g.name);
  assert.equal(m.version, "LDT1014.01");
  assert.equal(m.records[0].type, "8220");
  assert.equal(m.records.at(-1).type, "8221");
  // Satzlänge verfälschen
  const bad = g.bytes.slice();
  const txt = new TextDecoder("latin1").decode(bad);
  const pos = txt.indexOf("0148100", 10);
  bad[pos + 7] = "9".charCodeAt(0);
  const m2 = open(bad, g.name);
  assert.ok(codes(m2).RECLEN >= 1);
  assert.ok(codes(m2).TOTAL === undefined || codes(m2).TOTAL >= 0);
});

test("LDT 3: Objektbaum, Satzende 8001 und Prüfsumme 9300", () => {
  const g = gen("ldt3");
  const m = open(g.bytes, g.name);
  assert.equal(m.version, "LDT3.2.20");
  assert.ok(m.objects.length > 20);
  assert.ok(m.checksum?.ok, "Prüfsumme muss stimmen");
  // Inhalt verändern: Prüfsumme passt nicht mehr
  const t = g.bytes.slice();
  const s = new TextDecoder("latin1").decode(t);
  const p = s.indexOf("TESTLABOR");
  t[p] = "X".charCodeAt(0);
  assert.equal(codes(open(t, g.name)).CHECKSUM, 1);
});

test("Befundansicht: Patient, Werte, Einheit, Normbereich und Markierung", () => {
  for (const format of ["ldt2", "ldt3"]) {
    const g = gen(format);
    const m = open(g.bytes, g.name);
    const b = m.befunde[0];
    assert.ok(b.patient.last.startsWith("Test-"));
    assert.ok(b.patient.birth.match(/^\d\d\.\d\d\.\d{4}$/));
    const r = b.tests[0].results[0];
    assert.ok(r.value && r.unit && r.low && r.high, JSON.stringify(r));
    const flagged = m.befunde.flatMap((x) => x.tests).flatMap((t) => t.results).filter((x) => x.flag && x.flag !== "N");
    assert.ok(flagged.every((x) => x.flagText), "Markierungen werden erklärt");
  }
});

test("Codepage 437 mit Umlauten: Angabe 9106 = 2 wird erkannt, Umlaute stimmen", () => {
  const g = gen("ldt2", { charset: "cp437" });
  const m = open(g.bytes, g.name);
  assert.equal(m.charset.charset, "cp437");
  assert.equal(errorsAndWarnings(m), 0, JSON.stringify(m.issues.slice(0, 3)));
  const text = allText(m);
  assert.match(text, /Test-Müller/);
  assert.match(text, /Hämoglobin|Test-Schäfer|Test-Weiß/);
  assert.ok(g.bytes.includes(0x81), "ü als 0x81 kodiert");
  // Ohne Angabe in der Datei: Erkennung über die Umlaute
  const lines = new TextDecoder("latin1").decode(g.bytes).split("\r\n");
  const stripped = lines.filter((l) => !l.startsWith("0109106")).join("\r\n");
  const bytes = Uint8Array.from(stripped, (c) => c.charCodeAt(0));
  const m2 = open(bytes, "test.ldt");
  assert.equal(m2.charset.charset, "cp437");
  assert.match(allText(m2), /Test-Müller/);
});

test("ISO 8859-15 mit Umlauten: korrekt gelesen, falscher Zeichensatz wird gemeldet", () => {
  const g = gen("ldt3");
  const m = open(g.bytes, g.name);
  assert.equal(m.charset.charset, "iso-8859-15");
  assert.match(allText(m), /Test-Müller/);
  // Dieselbe Datei als UTF-8: Fehler „falscher Zeichensatz“ und Längenfehler
  const utf8 = new TextEncoder().encode(new TextDecoder("iso-8859-15").decode(g.bytes));
  const m2 = open(utf8, g.name);
  assert.equal(m2.charset.charset, "utf-8");
  assert.ok(codes(m2).CHARSET_WRONG >= 1);
  assert.ok(codes(m2).LEN >= 1);
});

test("Falsche Längenfelder werden zeilengenau gemeldet", () => {
  const g = gen("bdt");
  const s = new TextDecoder("latin1").decode(g.bytes).split("\r\n");
  s[3] = "099" + s[3].slice(3); // Zeile 4
  s[6] = "001" + s[6].slice(3); // Zeile 7
  const bytes = Uint8Array.from(s.join("\r\n"), (c) => c.charCodeAt(0));
  const m = open(bytes, "kaputt.bdt");
  const len = m.issues.filter((i) => i.code === "LEN");
  assert.deepEqual(len.map((i) => i.line), [4, 7]);
  assert.match(len[0].text, /^Zeile 4: Die Längenangabe passt nicht zum Inhalt/);
  assert.ok(len[0].why.length > 40, "Erklärung für die Praxis vorhanden");
});

test("Unbekannte Feldkennungen werden als „unbekannt“ markiert", () => {
  const g = gen("ldt2");
  const s = new TextDecoder("latin1").decode(g.bytes).split("\r\n");
  s.splice(5, 0, "0161234Unbekannt");
  const m = open(Uint8Array.from(s.join("\r\n"), (c) => c.charCodeAt(0)), g.name);
  const u = m.issues.filter((i) => i.code === "UNKNOWN");
  assert.equal(u.length, 1);
  assert.equal(u[0].line, 6);
  const { rowInfo } = awaitRow();
  assert.match(rowInfo(m, 5).label, /^unbekannt/);
});

import * as xdt from "../src/assets/js/core/xdt.js";
function awaitRow() { return xdt; }

test("Leere Datei", () => {
  const m = open(new Uint8Array(0), "leer.ldt");
  assert.equal(m.issueCounts.fehler, 1);
  assert.equal(m.issues[0].code, "EMPTY");
});

test("GDT-Datei wird als GDT erkannt", () => {
  const bytes = fromLines(["80006310", "810000000", "921802.10", "3000TEST-1", "3101Test-Mustermann", "3102Erika", "310301011980", "8410RR_SYS", "8420120", "8421mmHg"], "iso-8859-1");
  const m = open(bytes, "beispiel.gdt");
  assert.equal(m.format, "gdt");
  assert.equal(m.version, "02.10");
});

test("Zeilenende nur LF wird als Warnung gemeldet", () => {
  const g = gen("ldt3");
  const s = new TextDecoder("latin1").decode(g.bytes).replace(/\r\n/g, "\n");
  const m = open(Uint8Array.from(s, (c) => c.charCodeAt(0)), g.name);
  assert.equal(codes(m).EOL_LF, 1);
});

for (const format of ["ldt2", "ldt3", "bdt"]) {
  test(`Anonymisierung ${format.toUpperCase()}: gültige Datei, kein Originalname mehr`, () => {
    const g = gen(format, { count: 5 });
    const m = open(g.bytes, g.name);
    const names = m.befunde.length ? m.befunde.flatMap((b) => [b.patient.last, b.patient.first]) : [];
    const a = anonymize(m);
    const m2 = open(a.bytes, a.name);
    assert.equal(m2.format, format);
    assert.equal(m2.issueCounts.fehler, 0, JSON.stringify(m2.issues.slice(0, 5), null, 1));
    assert.equal(m2.issueCounts.warnung, 0, JSON.stringify(m2.issues.slice(0, 5), null, 1));
    const text = allText(m2);
    const originals = new Set([...names, ...a.originals]);
    for (const n of originals) if (n && n.length > 2) assert.ok(!text.toLowerCase().includes(n.toLowerCase()), `Originalwert „${n}“ kommt noch vor`);
    assert.ok(a.report.names > 0 && a.report.births > 0);
  });
}

test("Anonymisierung entfernt LDT-3-Anhänge und hält die Prüfsumme gültig", () => {
  const g = gen("ldt3");
  // Anhang (Obj_0010) in den ersten Befund einfügen
  const s = new TextDecoder("latin1").decode(g.bytes).split("\r\n").filter(Boolean);
  const idx = s.findIndex((l, i) => i > 5 && l.slice(3, 7) === "8001" && l.endsWith("8205"));
  const extra = fromLines(["8110Anhang", "8002Obj_0010", "9970100", "8242base64-kodierte_Anlage", "8002Obj_0068", "6329VGVzdC1NdWVsbGVy", "8003Obj_0068", "8003Obj_0010"]);
  const extraLines = new TextDecoder("latin1").decode(extra).split("\r\n").filter(Boolean);
  s.splice(idx, 0, ...extraLines);
  // Prüfsumme neu berechnen, damit die Ausgangsdatei gültig ist
  const body = s.slice(0, -2).join("\r\n") + "\r\n";
  const sum = sha1Hex(Uint8Array.from(body, (c) => c.charCodeAt(0)));
  const full = body + "0499300" + sum + "\r\n" + s.at(-1) + "\r\n";
  const bytes = Uint8Array.from(full, (c) => c.charCodeAt(0));
  const m = open(bytes, g.name);
  assert.equal(m.issueCounts.fehler, 0, JSON.stringify(m.issues.slice(0, 4)));
  const a = anonymize(m);
  assert.equal(a.report.removedAttachments, 1);
  const m2 = open(a.bytes, a.name);
  assert.equal(m2.issueCounts.fehler, 0);
  assert.ok(m2.checksum.ok);
  assert.ok(!m2.objects.some((o) => o.id === "Obj_0010"));
});

test("CSV-Export: Semikolon, UTF-8 mit BOM, Dezimalkomma", () => {
  const g = gen("ldt2");
  const m = open(g.bytes, g.name);
  const csv = befundeCsv(m.befunde);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  const [head, first] = csv.slice(1).split("\r\n");
  assert.equal(head.split(";")[0], "Patient");
  assert.equal(first.split(";").length, head.split(";").length);
  assert.ok(!/\d\.\d/.test(first.split(";")[9]), "Dezimalpunkt in Komma umgewandelt");
});

test("Feldwörterbuch: alle drei Tabellen geladen, Kernfelder vorhanden", () => {
  assert.ok(Object.keys(dict.ldt2).length > 100);
  assert.ok(Object.keys(dict.ldt3).length > 350);
  assert.ok(Object.keys(dict.bdt).length > 450);
  assert.equal(dict.ldt2["8410"].n, "Test-Ident");
  assert.equal(dict.ldt3["8420"].n, "Ergebnis-Wert");
  assert.match(dict.bdt["3101"].n, /Nachname/);
});

test("Nicht-xDT-Datei wird freundlich abgewiesen", () => {
  const m = open(new TextEncoder().encode("Hallo Welt\nDas ist keine LDT-Datei\n"), "notiz.txt");
  assert.equal(m.format, "unknown");
  assert.ok(m.issues.some((i) => i.code === "NOT_XDT" || i.code === "SYNTAX"));
});

test("Dateischreiber berechnet Längen korrekt", () => {
  const b = buildFile([{ type: "x", fields: [{ fk: "8000", value: "6100" }, { fk: "8100", value: null }, { fk: "3101", value: "Müller" }] }]);
  const s = new TextDecoder("latin1").decode(b);
  assert.equal(s, "01380006100\r\n014810000042\r\n0153101Müller\r\n".replace("014810000042", "0148100" + String(13 + 14 + 15).padStart(5, "0")));
});

test("BDT 3.0: Feldlänge 000 bedeutet „nicht angegeben“ und ist kein Fehler", () => {
  // Satz: 8000 0020, ein Feld mit Länge 000, Satzende 8202 mit Feldanzahl
  const txt = ["01380000020", "000980601", "01200101", "02596030101202631122026", "0108202" + "5"].join("\r\n") + "\r\n";
  const m = open(Uint8Array.from(txt, (c) => c.charCodeAt(0)), "test.bdt");
  assert.equal(m.format, "bdt");
  assert.equal(m.bdtVariant, "3.0");
  assert.ok(!m.issues.some((i) => i.code === "LEN" && i.line === 2), JSON.stringify(m.issues.filter((i) => i.code === "LEN")));
});
