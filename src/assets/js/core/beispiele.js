/**
 * Kompendium der Beispieldateien: feste, erfundene Testdaten für typische Situationen.
 * Wird vom Build (Dateien und Seiten), vom Viewer (Beispielauswahl) und von den Tests genutzt.
 * Alle Personen, Einrichtungen, Werte und Normbereiche sind erfunden – keine medizinischen Referenzwerte.
 */
import { buildFile } from "./writer.js";
import { ldt3Records, ANALYTES, TEST_NOTE } from "./generator.js";
import { kvnrCheckDigit } from "./anonymize.js";

const A = Object.fromEntries(ANALYTES.map((a) => [a.id, a]));

/** Ein Test mit festem Wert; low/high werden wie im Generator mit fester Nachkommastellenzahl geschrieben. */
function test(id, value, extra = {}) {
  const a = A[id];
  return { ...a, value: value == null ? "" : Number(value).toFixed(a.dec), low: a.low.toFixed(a.dec), high: a.high.toFixed(a.dec), ...extra };
}

function patient(no, { last, first, sex, birth, plz = "00001", ort = "Testhausen", street = "Teststraße", house = "1", tests }) {
  const body = "T" + String(10000000 + no * 1111111).slice(-8);
  return {
    no, last, first, sex, birth: new Date(birth + "T00:00:00Z"), plz, ort, street, house,
    kvnr: body + kvnrCheckDigit(body), id: `TEST${String(no).padStart(4, "0")}`, order: `T2026${String(no).padStart(5, "0")}`, tests,
  };
}

const ldt3 = (patients, now, opts) => buildFile(ldt3Records(patients, now, opts), { charset: "iso-8859-15" });

/**
 * group: Format-Gruppe für die Auswahl; level: Einstieg/Praxis/Technik;
 * shows: was man an der Datei lernt (für Seiten und Viewer); expect: was die Prüfung melden soll.
 */
export const BEISPIELE = [
  {
    file: "Z01_LDT3_Befund_unauffaellig.ldt",
    group: "ldt3",
    title: "Laborbefund, alle Werte im Normbereich",
    short: "LDT 3: unauffälliger Befund",
    shows: "Ein abgeschlossener Befund für eine Patientin mit sechs Werten, alle mit der Markierung N (normal). Gut zum Kennenlernen des Aufbaus.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt3([patient(1, {
      last: "Test-Musterfrau", first: "Erika", sex: "W", birth: "1980-03-15",
      tests: [test("THB", 13.8), test("TLEU", 6.2), test("TKAL", 4.2), test("TNAT", 140), test("TKRE", 0.82), test("TGLU", 88)],
    })], now),
  },
  {
    file: "Z01_LDT3_Befund_auffaellig.ldt",
    group: "ldt3",
    title: "Laborbefund mit auffälligen Werten und Extremwert",
    short: "LDT 3: auffällige Werte",
    shows: "Werte über und unter dem Normbereich mit den Markierungen H, HH, L und !H. Beim Extremwert folgt eine Aufmerksamkeitsmeldung des Labors (Obj_0026), zu einem Wert gibt es einen testbezogenen Hinweis.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt3([patient(2, {
      last: "Test-Mustermann", first: "Max", sex: "M", birth: "1956-11-02", plz: "00002", ort: "Musterstadt", street: "Beispielweg", house: "7",
      tests: [
        test("TGLU", 182, { ind: "HH" }),
        test("TKAL", 6.9, { ind: "!H", alert: "Kalium extrem erhöht. Laborarzt hat die Praxis telefonisch informiert (Testdaten)." }),
        test("TNAT", 131, { ind: "L" }),
        test("TKRE", 1.38, { ind: "H", note: "Eine Kontrolle in ca. 4 Wochen wird empfohlen (Testdaten)." }),
        test("TCRP", 48, { ind: "HH" }),
        test("THB", 11.1, { ind: "L" }),
      ],
    })], now),
  },
  {
    file: "Z01_LDT3_Teilbefund.ldt",
    group: "ldt3",
    title: "Teilbefund: Auftrag noch nicht abgeschlossen",
    short: "LDT 3: Teilbefund",
    shows: "Befundstatus 1 (Auftrag nicht abgeschlossen): zwei Werte sind fertig, ein Wert ist ermittelt, aber noch nicht abgesichert, und für TSH steht „Ergebnis folgt“ ohne Wert.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt3([patient(3, {
      last: "Test-Beispiel", first: "Jördis", sex: "W", birth: "1992-07-21", plz: "00003", ort: "Beispielfeld", street: "Musterallee", house: "12",
      tests: [
        test("THB", 12.9),
        test("TLEU", 11.4, { ind: "H" }),
        test("TCRP", 7.5, { ind: "H", status: "05" }),
        test("TTSH", null, { status: "02" }),
      ],
    })], now, { status: "1", note: TEST_NOTE }),
  },
];

/** Metadaten ohne Bauanleitung, z. B. für die Auswahl im Viewer. */
export function beispielListe() {
  return BEISPIELE.map(({ build, ...meta }) => meta);
}
