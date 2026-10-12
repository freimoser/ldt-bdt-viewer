/**
 * Kompendium der Beispieldateien: feste, erfundene Testdaten für typische Situationen.
 * Wird vom Build (Dateien und Seiten), vom Viewer (Beispielauswahl) und von den Tests genutzt.
 * Alle Personen, Einrichtungen, Werte und Normbereiche sind erfunden – keine medizinischen Referenzwerte.
 */
import { buildFile } from "./writer.js";
import { ldt3Records, ldt3OrderRecords, ldt2Records, bdtRecords, ANALYTES, TEST_NOTE } from "./generator.js";
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
// LDT 2: Zeichensatz in Feld 9106 (KBV LDT 5.12, Regel 9106: 2 = IBM-Code/CP437, 4 = ISO 8859-15) und im ersten Buchstaben des Dateinamens
const ldt2 = (patients, now, charset, opts) => buildFile(ldt2Records(patients, now, charset === "cp437" ? "2" : "4", opts), { charset });

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
  {
    file: "Z01_LDT3_Auftrag.ldt",
    group: "ldt3",
    title: "Laborauftrag von der Praxis an das Labor",
    short: "LDT 3: Auftrag",
    shows: "Die Gegenrichtung: Die Praxis bestellt drei Untersuchungen (Satzarten 8230, 8215, 8231). Mit Patient, Verdachtsdiagnose, Abrechnung über die gesetzliche Krankenversicherung (Laborgemeinschaft, Muster 10A), Probenmaterial und Anforderungen – aber noch ohne Werte.",
    expect: { errors: 0, warnings: 0, noBefund: true },
    build: (now) => buildFile(ldt3OrderRecords({
      patient: patient(4, { last: "Test-Krüger", first: "Björn", sex: "M", birth: "1971-05-09", plz: "00004", ort: "Probeort", street: "Probegasse", house: "3" }),
      tests: [{ id: "TGLU", name: A.TGLU.name }, { id: "THB", name: A.THB.name }, { id: "TKRE", name: A.TKRE.name }],
      diagnosis: { icd: "R73.9", certainty: "V" },
    }, now), { charset: "iso-8859-15" }),
  },
  {
    file: "Z01_LDT3_Sammelbefund.ldt",
    group: "ldt3",
    title: "Mehrere Patienten in einer Datei",
    short: "LDT 3: drei Patienten",
    shows: "Ein Datenpaket mit drei Befunden für drei Patienten. So kommen Laborbefunde oft in der Praxis an: eine Datei, viele Patienten.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt3([
      patient(5, { last: "Test-Weiß", first: "Hanna", sex: "W", birth: "1988-01-30", tests: [test("TTSH", 2.1), test("TNAT", 141)] }),
      patient(6, { last: "Test-Öztürk", first: "Ömer", sex: "M", birth: "1964-09-12", plz: "00002", ort: "Musterstadt", tests: [test("TGLU", 104, { ind: "H" }), test("TKRE", 0.95), test("TKAL", 4.6)] }),
      patient(7, { last: "Test-Groß", first: "Zoë", sex: "W", birth: "2001-12-24", plz: "00003", ort: "Beispielfeld", tests: [test("TCRP", 1.2), test("TLEU", 3.6, { ind: "L" })] }),
    ], now),
  },
  {
    file: "X01BEFND.LDT",
    group: "ldt2",
    title: "LDT-2-Befund im alten DOS-Zeichensatz (Codepage 437)",
    short: "LDT 2: Befund, Codepage 437",
    shows: "Ein Endbefund im älteren Format LDT 2 (LDT1014.01) mit den Markierungen +, ++ und -. Der Dateiname beginnt mit X und Feld 9106 = 2: Umlaute sind im IBM-Zeichensatz (Codepage 437) gespeichert. In einem normalen Texteditor erscheinen sie deshalb oft als falsche Zeichen.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt2([patient(8, {
      last: "Test-Schäfer", first: "Jürgen", sex: "M", birth: "1950-06-18",
      tests: [test("TGLU", 131, { ind2: "+" }), test("TCRP", 22.4, { ind2: "++" }), test("THB", 11.6, { ind2: "-" }), test("TKAL", 4.4)],
    })], now, "cp437"),
  },
  {
    file: "Z01TEILB.LDT",
    group: "ldt2",
    title: "LDT-2-Teilbefund in ISO 8859-15",
    short: "LDT 2: Teilbefund, ISO 8859-15",
    shows: "Befundart T (Teilbefund): Ein Wert hat den Test-Status F (fehlt/folgt). Der Dateiname beginnt mit Z und Feld 9106 = 4: Umlaute sind in ISO 8859-15 gespeichert, wie später in LDT 3.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => ldt2([patient(9, {
      last: "Test-Müller", first: "Sophie", sex: "W", birth: "1979-04-03",
      tests: [test("THB", 13.1), test("TLEU", 7.8), test("TTSH", null, { status2: "F", note: "Wert folgt (Testdaten)." })],
    })], now, "iso-8859-15", { reportType: "T" }),
  },
  {
    file: "BEISPIEL_BDT_Export.bdt",
    group: "bdt",
    title: "BDT-Export aus einer Praxissoftware",
    short: "BDT: Patientenstamm und Werte",
    shows: "Klassischer BDT-Aufbau mit Satzart 6100 (Patientenstamm: Name, Geburtsdatum, Anschrift) und 6200 (Behandlungsdaten mit Laborwerten). Das Datum steht hier als TTMMJJJJ, anders als in LDT.",
    expect: { errors: 0, warnings: 0 },
    build: (now) => buildFile(bdtRecords([
      patient(10, { last: "Test-Becker", first: "Paul", sex: "M", birth: "1945-02-14", tests: [test("TKRE", 1.02), test("TGLU", 96)] }),
      patient(11, { last: "Test-Groß", first: "Zoë", sex: "W", birth: "2001-12-24", plz: "00003", ort: "Beispielfeld", tests: [test("THB", 12.4), test("TTSH", 1.75)] }),
    ], now), { charset: "iso-8859-15" }),
  },
];

/** Metadaten ohne Bauanleitung, z. B. für die Auswahl im Viewer. */
export function beispielListe() {
  return BEISPIELE.map(({ build, ...meta }) => meta);
}
