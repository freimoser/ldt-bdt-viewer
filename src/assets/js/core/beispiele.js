/**
 * Kompendium der Beispieldateien: feste, erfundene Testdaten für typische Situationen.
 * Wird vom Build (Dateien und Seiten), vom Viewer (Beispielauswahl) und von den Tests genutzt.
 * Alle Personen, Einrichtungen, Werte und Normbereiche sind erfunden – keine medizinischen Referenzwerte.
 */
import { buildFile } from "./writer.js";
import { ldt3Records, ldt3OrderRecords, ldt2Records, bdtRecords, ANALYTES, TEST_NOTE } from "./generator.js";
import { kvnrCheckDigit } from "./anonymize.js";
import { sha1Hex } from "./sha1.js";
import { decodeAll, encode } from "./charsets.js";

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

/* ------------------------------------------------------------------ Fehlerbeispiele */

const CRLF = "\r\n";
const latin = (bytes) => decodeAll(bytes, "iso-8859-15");
const line = (fk, value) => `${String(value.length + 9).padStart(3, "0")}${fk}${value}`;

/** LDT 3: Prüfsumme 9300 neu berechnen (SHA-1 über alle Bytes vor der 9300-Zeile), damit nur der gewollte Fehler bleibt. */
function withChecksum(text) {
  const lines = text.split(CRLF);
  const k = lines.findIndex((l) => l.slice(3, 7) === "9300");
  if (k < 0) return encode(text, "iso-8859-15");
  const before = encode(lines.slice(0, k).join(CRLF) + CRLF, "iso-8859-15");
  lines[k] = line("9300", sha1Hex(before));
  return encode(lines.join(CRLF), "iso-8859-15");
}

/** Gültige Basisdatei als Zeilen holen, ändern und wieder zusammensetzen. */
function mutate(baseFile, fn, { checksum = true } = {}) {
  return (now) => {
    const base = BEISPIELE.find((b) => b.file === baseFile).build(now);
    const text = fn(latin(base).split(CRLF)).join(CRLF);
    return checksum ? withChecksum(text) : encode(text, "iso-8859-15");
  };
}
const find = (lines, re) => lines.findIndex((l) => re.test(l));

BEISPIELE.push(
  {
    file: "Z01_FEHLER_Laenge.ldt",
    group: "fehler",
    title: "Falsche Längenangabe nach Bearbeitung im Editor",
    short: "Fehler: Längenangabe",
    shows: "Im Nachnamen wurde „-Schmidt“ ergänzt, die dreistellige Längenangabe am Zeilenanfang blieb aber 024. Der Viewer zeigt, welche Länge richtig wäre.",
    cause: "Die Datei wurde in einem Texteditor geändert. Jede Zeile beginnt mit ihrer eigenen Länge in Bytes (Inhalt + 9); die passt dann nicht mehr.",
    fix: "Die Datei nicht von Hand ändern, sondern im Praxisprogramm oder vom Labor neu erzeugen lassen.",
    expect: { code: "LEN", errors: 1, cause: "von Hand bearbeitet" },
    build: mutate("Z01_LDT3_Befund_unauffaellig.ldt", (l) => { const k = find(l, /^\d{3}3101Test-Musterfrau$/); l[k] = l[k] + "-Schmidt"; return l; }),
  },
  {
    file: "Z01_FEHLER_UTF8.ldt",
    group: "fehler",
    title: "Als UTF-8 gespeichert statt ISO 8859-15",
    short: "Fehler: UTF-8 statt ISO 8859-15",
    shows: "Die Datei wurde mit einem modernen Editor als UTF-8 gespeichert. Umlaute belegen dann zwei Bytes, dadurch stimmen Längen und Prüfsumme nicht mehr, und im Praxisprogramm erscheint „JÃ¶rdis“ statt „Jördis“.",
    cause: "Ein Editor oder ein Übertragungsweg (E-Mail, Cloud-Ordner, Skript) hat den Zeichensatz umgewandelt. LDT 3 verlangt ISO 8859-15 (KBV LDT 3.2.20, Kap. 6.5).",
    fix: "Originaldatei erneut abholen; Dateien nur unverändert kopieren, nicht öffnen und speichern.",
    expect: { code: "CHARSET_WRONG", cause: "als UTF-8 gespeichert" },
    build: (now) => new TextEncoder().encode(latin(BEISPIELE.find((b) => b.file === "Z01_LDT3_Teilbefund.ldt").build(now))),
  },
  {
    file: "Z01_FEHLER_Zeilenende_LF.ldt",
    group: "fehler",
    title: "Zeilenende LF statt CR LF",
    short: "Fehler: Zeilenende",
    shows: "Alle Zeilen enden nur mit LF (Unix-Stil). Die Spezifikation verlangt CR LF. Weil sich dadurch die Bytes ändern, passt auch die Prüfsumme nicht mehr.",
    cause: "Die Datei lief über ein Unix-System, ein Git-Repository oder ein Skript, das Zeilenenden vereinheitlicht.",
    fix: "Zeilenenden auf CR LF zurückstellen (z. B. unix2dos) oder die Originaldatei neu holen.",
    expect: { code: "EOL_LF", cause: "Zeilenenden" },
    build: (now) => encode(latin(BEISPIELE.find((b) => b.file === "Z01_LDT3_Befund_unauffaellig.ldt").build(now)).replace(/\r\n/g, "\n"), "iso-8859-15"),
  },
  {
    file: "Z01_FEHLER_abgeschnitten.ldt",
    group: "fehler",
    title: "Abgeschnittene Datei (Export abgebrochen)",
    short: "Fehler: Datei abgeschnitten",
    shows: "Die Datei endet mitten im zweiten Befund: Objekte und Sätze werden nicht mehr geschlossen, Satzende 8001 und Datenpaket-Abschluss 8221 fehlen.",
    cause: "Der Export oder die Übertragung wurde abgebrochen, oder die Datei wurde abgeholt, während sie noch geschrieben wurde.",
    fix: "Datei beim Labor erneut anfordern. Im Praxisprogramm prüfen, ob die Abholung zu früh startet.",
    expect: { code: "OBJ_OPEN", cause: "abgeschnitten" },
    build: mutate("Z01_LDT3_Sammelbefund.ldt", (l) => l.slice(0, Math.floor(l.length * 0.55)), { checksum: false }),
  },
  {
    file: "Z01_FEHLER_Pruefsumme.ldt",
    group: "fehler",
    title: "Wert von Hand geändert: Prüfsumme stimmt nicht",
    short: "Fehler: Prüfsumme 9300",
    shows: "Ein Glukosewert wurde im Editor von 182 auf 128 geändert, Länge und Aufbau stimmen weiter. Nur die SHA-1-Prüfsumme in Feld 9300 verrät die Änderung.",
    cause: "Die Datei wurde nach dem Erstellen verändert. Die Prüfsumme schützt davor, dass veränderte Befunde unbemerkt übernommen werden (KBV LDT 3.2.20, Feld 9300).",
    fix: "Befund nicht verwenden, beim Labor neu anfordern und klären, wer die Datei geändert hat.",
    expect: { code: "CHECKSUM", errors: 1, cause: "nach dem Erstellen verändert" },
    build: mutate("Z01_LDT3_Befund_auffaellig.ldt", (l) => { const k = find(l, /^\d{3}8420182$/); l[k] = l[k].replace(/182$/, "128"); return l; }, { checksum: false }),
  },
  {
    file: "Z01_FEHLER_Pflichtfeld.ldt",
    group: "fehler",
    title: "Pflichtfeld im Ergebnis fehlt",
    short: "Fehler: Pflichtfeld fehlt",
    shows: "Im ersten Untersuchungsergebnis (Obj_0060) fehlt der Ergebnisstatus 8418. Ohne ihn ist unklar, ob der Wert endgültig, vorläufig oder korrigiert ist.",
    cause: "Fehler in der Exportsoftware des Labors, oft nach einem Update.",
    fix: "Labor bzw. Hersteller der Laborsoftware informieren; die Meldung im Viewer nennt Zeile, Objekt und Seite der Spezifikation.",
    expect: { code: "OBJ_REQUIRED", errors: 1 },
    build: mutate("Z01_LDT3_Befund_unauffaellig.ldt", (l) => { const k = find(l, /^\d{3}841806$/); l.splice(k, 1); return l; }),
  },
  {
    file: "Z01_FEHLER_unbekannte_FK.ldt",
    group: "fehler",
    title: "Unbekannte Feldkennung (Herstellerfeld)",
    short: "Fehler: unbekannte Feldkennung",
    shows: "Im Patientenobjekt steht eine Feldkennung 7999, die es in LDT 3.2.20 nicht gibt. Viele Praxisprogramme überspringen sie still, manche brechen ab.",
    cause: "Herstellereigene Erweiterung oder ein Feld aus einer anderen Version.",
    fix: "Klären, was das Feld bedeuten soll; für die Übernahme ist es meist unkritisch.",
    expect: { code: "UNKNOWN", errors: 0, warnings: 1 },
    build: mutate("Z01_LDT3_Befund_unauffaellig.ldt", (l) => { const k = find(l, /^\d{3}3000TEST0001$/); l.splice(k + 1, 0, line("7999", "INTERN-123")); return l; }),
  },
  {
    file: "X01ZEICH.LDT",
    group: "fehler",
    title: "LDT 2: Zeichensatz-Angabe passt nicht zum Inhalt",
    short: "Fehler: Zeichensatz-Konflikt (LDT 2)",
    shows: "Dateiname (X…) und Feld 9106 = 2 kündigen den DOS-Zeichensatz Codepage 437 an, die Umlaute sind aber in ISO 8859-15 gespeichert. Gelesen nach Angabe wird aus „Schäfer“ „SchΣfer“.",
    cause: "Die Laborsoftware schreibt einen anderen Zeichensatz, als sie angibt – der häufigste Grund für kaputte Umlaute bei LDT 2.",
    fix: "Im Viewer den Zeichensatz umschalten, um die Daten zu lesen; dauerhaft muss das Labor Angabe und Inhalt angleichen.",
    expect: { code: "CHARSET_CONFLICT", cause: "Zeichensatz-Angabe" },
    build: (now) => buildFile(ldt2Records([patient(8, {
      last: "Test-Schäfer", first: "Jürgen", sex: "M", birth: "1950-06-18",
      tests: [test("TGLU", 131, { ind2: "+" }), test("TKAL", 4.4)],
    })], now, "2"), { charset: "iso-8859-15" }),
  },
  {
    file: "X01SATZL.LDT",
    group: "fehler",
    title: "LDT 2: Zeile gelöscht, Satzlänge stimmt nicht",
    short: "Fehler: Satzlänge 8100 (LDT 2)",
    shows: "Aus dem Befundsatz wurde eine Hinweiszeile entfernt. Die Satzlänge in Feld 8100 und die Gesamtlänge in Feld 9202 stimmen danach nicht mehr.",
    cause: "Manuelle Bearbeitung oder ein Filterprogramm hat Zeilen entfernt, ohne die Längenfelder neu zu berechnen (KBV LDT 5.12, Kap. 2.3.3).",
    fix: "Original neu anfordern; Längenfelder nie von Hand korrigieren.",
    expect: { code: "RECLEN", cause: "Zeile entfernt" },
    build: (now) => {
      const base = BEISPIELE.find((b) => b.file === "X01BEFND.LDT").build(now);
      const lines = decodeAll(base, "cp437").split(CRLF).filter((l) => l.slice(3, 7) !== "8490");
      return encode(lines.join(CRLF), "cp437");
    },
  },
);

/** Metadaten ohne Bauanleitung, z. B. für die Auswahl im Viewer. */
export function beispielListe() {
  return BEISPIELE.map(({ build, ...meta }) => meta);
}
