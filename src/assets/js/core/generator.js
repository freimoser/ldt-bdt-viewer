/**
 * Erzeugt gültige Testdateien mit erfundenen Patienten und Werten.
 * Alle Namen, Einrichtungen und Werte sind erfunden und als Testdaten gekennzeichnet.
 * Die Normbereiche sind ebenfalls erfunden und keine medizinischen Referenzwerte.
 */
import { buildFile } from "./writer.js";
import { kvnrCheckDigit } from "./anonymize.js";

export const GENERATOR_FORMATS = {
  ldt2: { label: "LDT 2.x (LDT1014.01, Labor-Bericht 8201)", ext: ".ldt" },
  ldt3: { label: "LDT 3.2.20 (Befund 8205)", ext: ".ldt" },
  bdt: { label: "BDT, klassischer Aufbau (Satzarten 6100/6200)", ext: ".bdt" },
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LAST = ["Test-Müller", "Test-Schäfer", "Test-Weiß", "Test-Öztürk", "Test-Beispiel", "Test-Musterfrau", "Test-Mustermann", "Test-Krüger", "Test-Groß", "Test-Becker"];
const FIRST_W = ["Erika", "Jördis", "Lena", "Sophie", "Hanna", "Zoë"];
const FIRST_M = ["Max", "Jürgen", "Björn", "Lukas", "Ömer", "Paul"];
const STREETS = ["Teststraße", "Beispielweg", "Musterallee", "Probegasse"];
const PLACES = [["00001", "Testhausen"], ["00002", "Musterstadt"], ["00003", "Beispielfeld"], ["00004", "Probeort"]];

// Erfundene Testanalyte. Normbereiche frei erfunden – keine Referenzwerte!
// si: Einheitensystem für FK 8419 in LDT 3 (Regel E070: 1 = SI-Einheit, 2 = abweichende Einheit)
export const ANALYTES = [
  { id: "TGLU", id8: "GLUCTEST", name: "Glukose (Testwert)", unit: "mg/dl", low: 70, high: 99, dec: 0, si: false },
  { id: "TKAL", id8: "KALITEST", name: "Kalium (Testwert)", unit: "mmol/l", low: 3.5, high: 5.1, dec: 1, si: true },
  { id: "TNAT", id8: "NATRTEST", name: "Natrium (Testwert)", unit: "mmol/l", low: 136, high: 145, dec: 0, si: true },
  { id: "TKRE", id8: "KREATEST", name: "Kreatinin (Testwert)", unit: "mg/dl", low: 0.5, high: 1.1, dec: 2, si: false },
  { id: "THB", id8: "HBTEST01", name: "Hämoglobin (Testwert)", unit: "g/dl", low: 12, high: 16, dec: 1, si: false },
  { id: "TLEU", id8: "LEUKTEST", name: "Leukozyten (Testwert)", unit: "/nl", low: 4, high: 10, dec: 1, si: true },
  { id: "TCRP", id8: "CRPTEST1", name: "CRP (Testwert)", unit: "mg/l", low: 0, high: 5, dec: 1, si: true },
  { id: "TTSH", id8: "TSHTEST1", name: "TSH (Testwert)", unit: "mU/l", low: 0.4, high: 4, dec: 2, si: false },
];

export const TEST_NOTE = "TESTDATEN: erfundene Werte, keine Patientendaten";

function pick(r, a) { return a[Math.floor(r() * a.length)]; }
export function pad(n, w) { return String(n).padStart(w, "0"); }
export function ymd(d) { return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1, 2)}${pad(d.getUTCDate(), 2)}`; }
export function dmy(d) { return `${pad(d.getUTCDate(), 2)}${pad(d.getUTCMonth() + 1, 2)}${d.getUTCFullYear()}`; }
/** Deutsche Ortszeit: Sommerzeit vom letzten Sonntag im März bis zum letzten Sonntag im Oktober, jeweils 01:00 UTC. */
export function berlin(d) {
  const y = d.getUTCFullYear();
  const lastSunday = (m) => { const x = new Date(Date.UTC(y, m + 1, 0, 1)); x.setUTCDate(x.getUTCDate() - x.getUTCDay()); return x; };
  const off = d >= lastSunday(2) && d < lastSunday(9) ? 2 : 1;
  return { d: new Date(d.getTime() + off * 3600000), zone: `UTC+${off}` };
}
export function hms(d) { return `${pad(d.getUTCHours(), 2)}${pad(d.getUTCMinutes(), 2)}${pad(d.getUTCSeconds(), 2)}`; }

function makePatients(r, count, today) {
  const out = [];
  for (let k = 0; k < count; k++) {
    const female = r() < 0.5;
    const birth = new Date(Date.UTC(1935 + Math.floor(r() * 70), Math.floor(r() * 12), 1 + Math.floor(r() * 28)));
    const [plz, ort] = pick(r, PLACES);
    const letter = String.fromCharCode(65 + Math.floor(r() * 26));
    const body = letter + pad(Math.floor(r() * 1e8), 8);
    const tests = [...ANALYTES].sort(() => r() - 0.5).slice(0, 3 + Math.floor(r() * 4)).map((a) => {
      const span = a.high - a.low || 1;
      const roll = r();
      const v = roll < 0.18 ? a.high + span * (0.1 + r() * 0.8) : roll < 0.3 ? Math.max(0, a.low - span * (0.1 + r() * 0.4)) : a.low + span * (0.1 + r() * 0.8);
      const value = v.toFixed(a.dec);
      const num = Number(value);
      const flag = num > a.high ? "high" : num < a.low ? "low" : "normal";
      return { ...a, value, flag, low: a.low.toFixed(a.dec), high: a.high.toFixed(a.dec) };
    });
    out.push({
      no: k + 1,
      last: LAST[k % LAST.length] + (k >= LAST.length ? String(Math.floor(k / LAST.length) + 1) : ""),
      first: pick(r, female ? FIRST_W : FIRST_M),
      sex: female ? "W" : "M",
      birth, plz, ort, street: pick(r, STREETS), house: String(1 + Math.floor(r() * 120)),
      kvnr: body + kvnrCheckDigit(body),
      id: `TEST${pad(k + 1, 4)}`,
      order: `T${today.getUTCFullYear()}${pad(k + 1, 5)}`,
      tests,
    });
  }
  return out;
}

const LDT2_CHARSET = { din66003: ["1", "S"], cp437: ["2", "X"], "iso-8859-1": ["3", "A"], "iso-8859-15": ["4", "Z"] };

export function generate({ format = "ldt3", count = 3, seed = Date.now(), now = new Date(), charset: wanted = "iso-8859-15", maxCount = 200 } = {}) {
  count = Math.max(1, Math.min(maxCount, Math.floor(count)));
  const r = rng(seed);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
  const patients = makePatients(r, count, today);
  let records, name, charset = "iso-8859-15";
  if (format === "ldt2") {
    const cs = LDT2_CHARSET[wanted] ? wanted : "iso-8859-15";
    charset = cs;
    records = ldt2(patients, today, LDT2_CHARSET[cs][0]);
    name = `${LDT2_CHARSET[cs][1]}01TEST.LDT`;
  }
  else if (format === "ldt3") { records = ldt3(patients, today); name = `Z01TESTDATEN_${ymd(today)}.ldt`; }
  else if (format === "bdt") { records = bdt(patients, today); name = `TESTDATEN_${ymd(today)}.bdt`; }
  else throw new Error("Unbekanntes Format: " + format);
  const bytes = buildFile(records, { charset });
  return { bytes, name, format, charset, patients: patients.length };
}

const F = (fk, value) => ({ fk, value });

/* LDT 2: Satzarten nach KBV LDT 5.12, Kap. 3.3, 3.4, 3.8 */
/** LDT-2-Sätze (8220, je Patient 8201, 8221). opts.reportType: Befundart 8401 (Regel 135: E, T, V, A, N). */
export function ldt2Records(patients, today, cs9106 = "4", opts = {}) {
  return ldt2(patients, today, cs9106, opts);
}

function ldt2(patients, today, cs9106 = "4", { reportType = "E" } = {}) {
  const recs = [];
  recs.push({ type: "8220", fields: [
    F("8000", "8220"), F("8100", null), F("9212", "LDT1014.01"),
    F("0201", "999999999"), F("0203", "TESTPRAXIS Dr. Beispiel (erfunden)"),
    F("0212", "999999900"), F("0211", "Dr. Test-Arzt"),
    F("0205", "Teststraße 1"), F("0215", "00000"), F("0216", "Testhausen"),
    F("8320", "TESTLABOR (erfundene Daten)"), F("8321", "Laborweg 2"), F("8322", "00000"), F("8323", "Testhausen"),
    F("0101", "Z/39/2610/12/TST"), F("9106", cs9106), F("8312", "TEST01"), F("9103", ymd(berlin(today).d)),
  ] });
  for (const p of patients) {
    const f = [
      F("8000", "8201"), F("8100", null), F("8310", p.order), F("8311", `L${p.order}`),
      F("8301", ymd(berlin(today).d)), F("8302", ymd(berlin(today).d)), F("8303", hms(berlin(today).d).slice(0, 4)),
      F("3101", p.last), F("3102", p.first), F("3103", ymd(p.birth)), F("3110", p.sex),
      F("8401", reportType), F("8609", "K"), F("8403", "1"),
    ];
    // Reihenfolge laut KBV LDT 5.12, Kap. 3.7: 8410, 8411, 8418, 8420, 8421, 8470, 8461, 8462, 8422
    for (const t of p.tests) {
      f.push(F("8410", t.id), F("8411", t.name));
      if (t.status2) f.push(F("8418", t.status2));
      if (t.value !== "") f.push(F("8420", t.value), F("8421", t.unit));
      if (t.note) f.push(F("8470", t.note));
      if (t.value !== "") f.push(F("8461", t.low), F("8462", t.high));
      const ind = t.ind2 || (t.flag === "high" ? "+" : t.flag === "low" ? "-" : "");
      if (ind && t.value !== "") f.push(F("8422", ind));
    }
    f.push(F("8490", TEST_NOTE));
    recs.push({ type: "8201", fields: f });
  }
  recs.push({ type: "8221", fields: [F("8000", "8221"), F("8100", null), F("9202", null)] });
  return recs;
}

/* LDT 3: Aufbau nach KBV LDT 3.2.20, Kap. 8 und Objektkatalog; Struktur wie KBV-Testdatei UseCase 15 */
function obj(attrFk, attrName, id, inner) {
  return [F(attrFk, attrName), F("8002", id), ...inner, F("8003", id)];
}
function ts(attrFk, attrName, d) {
  // Ortszeit mit Zeitzone wie in den KBV-Testdateien (z. B. 7273 = UTC+2 im Sommer)
  const b = berlin(d);
  return obj(attrFk, attrName, "Obj_0054", [F("7278", ymd(b.d)), F("7279", hms(b.d)), F("7273", b.zone)]);
}

// Laborarzt als Befundersteller (FK 7420 = 07, Regel E027); erfundene Person
const LABARZT = [F("7420", "07"), F("3101", "Test-Laborarzt"), F("3102", "Beispiel"), F("3104", "Dr. med.")];

/**
 * Ein Untersuchungsergebnis Klinische Chemie (Obj_0060, LDT 3.2.20 Kap. 11.43).
 * t.status: Ergebnisstatus FK 8418 (E007), Standard 06 = Befundergebnis.
 * t.ind: Grenzwertindikator FK 8422 (E005), sonst aus t.flag abgeleitet.
 * Bei !H/!L/!+/!- folgt die Aufmerksamkeitsmeldung Obj_0026 (Regel K099), Aufbau wie KBV-Testdatei UseCase09.
 * Ohne Wert (Status 01, 02, 09, 11, 12) entfallen Wert, Normalwert und Timestamp_Messung (Regel K076).
 */
function resultObj(p, t, k, today) {
  const status = t.status || "06";
  const inner = [F("7304", `ERG${p.no}-${k + 1}`), F("7364", `PROBE${p.no}`), F("8410", t.id), F("8411", t.name), F("8418", status)];
  if (!["01", "02", "09", "11", "12"].includes(status)) {
    const ind = t.ind || (t.flag === "high" ? "H" : t.flag === "low" ? "L" : "N");
    const sys = t.si ? "1" : "2";
    const norm = [F("8424", "13"), F("8461", t.low), F("8419", sys), F("8421", t.unit), F("8462", t.high), F("8419", sys), F("8421", t.unit), F("8422", ind)];
    if (ind.startsWith("!")) {
      norm.push(...obj("8126", "Fehlermeldung_Aufmerksamkeit", "Obj_0026", [
        F("7280", t.reason || "2"),
        ...obj("8147", "Person", "Obj_0047", LABARZT),
        ...obj("8167", "Zusaetzliche_Informationen", "Obj_0068", [F("3564", t.alert || "Achtung: Extremwert. Bitte umgehend prüfen (Testdaten).")]),
      ]));
    }
    inner.push(F("7306", "01"), F("8420", t.value), F("8419", sys), F("8421", t.unit), ...obj("8142", "Normalwert", "Obj_0042", norm), ...ts("8225", "Timestamp_Messung", today));
  }
  if (t.note) inner.push(...obj("8236", "Testbezogene_Hinweise", "Obj_0068", [F("3564", t.note)]));
  inner.push(...obj("8141", "Namenskennung", "Obj_0041", [F("7420", "07"), F("7358", "Dr. med. Beispiel Test-Laborarzt (erfunden)"), F("8990", "TL")]));
  return obj("8160", "UE_Klinische_Chemie", "Obj_0060", inner);
}

/** LDT-3-Sätze (8220, je Patient 8205, 8221). opts.status: Befundstatus FK 8401 (E006: 1 = Auftrag nicht abgeschlossen, 2 = abgeschlossen). */
export function ldt3Records(patients, today, opts = {}) {
  return ldt3(patients, today, opts);
}

function ldt3(patients, today, { status = "2", note = TEST_NOTE } = {}) {
  const recs = [];
  recs.push({ type: "8220", fields: [
    F("8000", "8220"),
    ...obj("8132", "Kopfdaten", "Obj_0032", [
      F("0001", "LDT3.2.20"),
      ...obj("8151", "Sendendes_System", "Obj_0051", [F("8316", "TESTLAB01"), F("0105", "Z/31/2610/12/tst"), F("0103", "TEST-LIS (erfunden)"), F("0132", "1.0")]),
      ...ts("8218", "Timestamp_Erstellung_Datensatz", today),
    ]),
    ...obj("8136", "Laborkennung", "Obj_0036", [
      ...obj("8239", "Laborbezeichnung", "Obj_0043", [F("1250", "TESTLABOR (erfundene Daten)")]),
      // 7266 = 2 Facharztlabor (E051), passend zu 0204 = 2 Laborarztpraxis (E046) in der Betriebsstätte
      F("7266", "2"),
    ]),
    ...obj("8119", "Betriebsstaette", "Obj_0019", [
      F("0204", "2"), F("0203", "TESTLABOR (erfundene Daten)"), F("0201", "999999999"),
      ...obj("8143", "Organisation", "Obj_0043", [
        F("1250", "TESTLABOR (erfundene Daten)"),
        ...obj("8229", "Anschrift_Arbeitsstelle", "Obj_0007", [F("3112", "00000"), F("3113", "Testhausen"), F("3107", "Laborweg"), F("3109", "2"), F("3114", "D")]),
      ]),
    ]),
    F("8001", "8220"),
  ] });
  for (const p of patients) {
    const results = [];
    p.tests.forEach((t, k) => results.push(...resultObj(p, t, k, today)));
    recs.push({ type: "8205", fields: [
      F("8000", "8205"),
      ...obj("8122", "Einsenderidentifikation", "Obj_0022", [
        F("7321", "02"), F("8312", "TEST01"),
        ...obj("8114", "Arztidentifikation", "Obj_0014", [
          ...obj("8147", "Person", "Obj_0047", [F("7420", "02"), F("3101", "Test-Arzt"), F("3102", "Beispiel"), F("3104", "Dr. med.")]),
          F("0212", "999999900"),
        ]),
        ...obj("8119", "Betriebsstaette", "Obj_0019", [F("0204", "1"), F("0203", "TESTPRAXIS (erfunden)"), F("0201", "999999999")]),
      ]),
      ...obj("8145", "Patient", "Obj_0045", [
        ...obj("8147", "Person", "Obj_0047", [
          F("7420", "12"), F("3101", p.last), F("3102", p.first), F("3103", ymd(p.birth)), F("3110", p.sex),
          ...obj("8228", "Wohnanschrift", "Obj_0007", [F("3112", p.plz), F("3113", p.ort), F("3107", p.street), F("3109", p.house), F("3114", "D")]),
        ]),
        F("3119", p.kvnr), F("3000", p.id),
      ]),
      ...obj("8117", "Befundinformationen", "Obj_0017", [
        F("8310", p.order), ...ts("8214", "Timestamp_Auftragserteilung", today), F("8311", `L${p.order}`),
        F("7305", `BEF${p.order}`), F("8401", status), ...ts("8216", "Timestamp_Befunderstellung", today),
      ]),
      ...obj("8137", "Material", "Obj_0037", [F("7364", `PROBE${p.no}`), F("8428", "SE"), F("8430", "Serum (Testmaterial)"), ...ts("8219", "Timestamp_Materialabnahme_entnahme", today)]),
      ...obj("8135", "Laborergebnisbericht", "Obj_0035", [...results, ...ts("8221", "Timestamp_Erstellung_Laborergebnisbericht", today)]),
      ...obj("8167", "Zusaetzliche_Informationen", "Obj_0068", [F("3564", note)]),
      F("8001", "8205"),
    ] });
  }
  recs.push({ type: "8221", fields: [F("8000", "8221"), F("9300", null), F("8001", "8221")] });
  return recs;
}

/**
 * LDT-3-Auftrag (Praxis an Labor): Satzarten 8230, 8215, 8231 (LDT 3.2.20 Kap. 8.5–8.7).
 * Aufbau wie KBV-Testdatei UseCase01 (ohne Anhang); Abrechnungsangaben (Kostenträger-Kennungen) aus dieser Testdatei,
 * Namen und Einrichtungen erfunden. o: { patient, tests: [{ id, name }], diagnosis: { icd, certainty }, urgent }
 */
export function ldt3OrderRecords(o, today) {
  const p = o.patient;
  const arzt = [F("7420", "02"), F("3101", "Test-Arzt"), F("3102", "Beispiel"), F("3104", "Dr. med.")];
  const head = { type: "8230", fields: [
    F("8000", "8230"),
    ...obj("8132", "Kopfdaten", "Obj_0032", [
      F("0001", "LDT3.2.20"),
      ...obj("8151", "Sendendes_System", "Obj_0051", [F("8315", "TESTLAB01"), F("8316", "TESTPRAXIS01"), F("0105", "Z/31/2610/12/tst"), F("0103", "TEST-PVS (erfunden)"), F("0132", "1.0")]),
      ...obj("8218", "Timestamp_Erstellung_Datensatz", "Obj_0054", [F("7278", ymd(berlin(today).d)), F("7279", hms(berlin(today).d)), F("7273", berlin(today).zone), ...obj("8235", "Person_zum_Timestamp", "Obj_0047", arzt)]),
    ]),
    F("7265", "1"),
    ...obj("8122", "Einsenderidentifikation", "Obj_0022", [
      F("7321", "01"), F("8312", "TEST01"),
      ...obj("8114", "Arztidentifikation", "Obj_0014", [...obj("8147", "Person", "Obj_0047", [...arzt, F("8990", "TA")]), F("0212", "999999900")]),
      ...obj("8119", "Betriebsstaette", "Obj_0019", [
        F("0204", "1"), F("0203", "TESTPRAXIS Dr. Beispiel (erfunden)"), F("0201", "999999999"),
        ...obj("8143", "Organisation", "Obj_0043", [
          F("1250", "TESTPRAXIS Dr. Beispiel (erfunden)"),
          ...obj("8229", "Anschrift_Arbeitsstelle", "Obj_0007", [F("3112", "00000"), F("3113", "Testhausen"), F("3107", "Teststraße"), F("3109", "1")]),
        ]),
      ]),
    ]),
    F("8001", "8230"),
  ] };
  const sample = `PROBE${p.no}`;
  const tsReq = ts("8213", "Timestamp_Erstellung_Untersuchungsanforderung", today);
  const order = { type: "8215", fields: [
    F("8000", "8215"),
    ...obj("8145", "Patient", "Obj_0045", [
      ...obj("8147", "Person", "Obj_0047", [
        F("7420", "12"), F("3101", p.last), F("3102", p.first), F("3103", ymd(p.birth)), F("3110", p.sex),
        ...obj("8228", "Wohnanschrift", "Obj_0007", [F("3112", p.plz), F("3113", p.ort), F("3107", p.street), F("3109", p.house), F("3114", "D")]),
      ]),
      F("3119", p.kvnr), F("3000", p.id),
    ]),
    ...obj("8113", "Auftragsinformation", "Obj_0013", [F("8310", p.order), tsReq].flat()),
    ...obj("8127", "Veranlassungsgrund", "Obj_0027", [
      F("7303", "2"),
      ...obj("8200", "Akutdiagnose", "Obj_0100", [F("6001", o.diagnosis.icd), F("6003", o.diagnosis.certainty)]),
    ]),
    ...obj("8101", "Abrechnungsinformation", "Obj_0001", [
      ...obj("8102", "Abrechnung_GKV", "Obj_0002", [
        F("4239", "28"), F("4134", "TESTKASSE (erfunden)"), F("4104", "00038"), F("4106", "00"), F("3116", "72"),
        F("3108", "1"), F("4111", "100609049"), F("4122", "00"), F("4221", "1"),
      ]),
    ]),
    ...obj("8137", "Material", "Obj_0037", [
      F("7364", sample), F("8429", "1"), F("8428", "SE"), F("8430", "Serum (Testmaterial)"), F("8504", "0"),
      ...ts("8219", "Timestamp_Materialabnahme_entnahme", today),
    ]),
    ...o.tests.flatMap((t) => obj("8159", "Untersuchungsanforderung", "Obj_0059", [
      F("8410", t.id), F("8411", t.name), F("7303", "2"), ...(o.urgent ? [F("8501", "2")] : []),
      F("7364", sample), F("8428", "SE"), F("8429", "1"), ...tsReq,
    ])),
    ...obj("8167", "Zusaetzliche_Informationen", "Obj_0068", [F("3564", TEST_NOTE)]),
    F("8001", "8215"),
  ] };
  return [head, order, { type: "8231", fields: [F("8000", "8231"), F("9300", null), F("8001", "8231")] }];
}

/* BDT, klassischer Aufbau: 8000 Satzart, 8100 Satzlänge (Uni Gießen); Felder nach QMS BDT 3.0 Feldtabelle */
export function bdtRecords(patients, today) {
  return bdt(patients, today);
}

function bdt(patients, today) {
  const recs = [];
  for (const p of patients) {
    recs.push({ type: "6100", fields: [
      F("8000", "6100"), F("8100", null), F("3000", p.id), F("3101", p.last), F("3102", p.first),
      F("3103", dmy(p.birth)), F("3110", p.sex), F("3106", `${p.plz} ${p.ort}`), F("3107", `${p.street} ${p.house}`),
      F("3626", "0000 000000"),
    ] });
    const f = [F("8000", "6200"), F("8100", null), F("3000", p.id), F("6200", dmy(berlin(today).d)), F("6201", hms(berlin(today).d))];
    // BDT 3.0: Test-Ident höchstens 8 Zeichen (Feldtabelle S. 102), daher eigenes lesbares Kürzel je Analyt
    for (const t of p.tests) f.push(F("8410", t.id8 || (t.id + "TESTTEST").slice(0, 8)), F("8411", t.name), F("8420", t.value), F("8421", t.unit), F("8461", t.low), F("8462", t.high));
    // Pflicht-Kennzeichnung als Testdaten. 8480 ist ein Erläuterungstext zum Messergebnis (BDT 3.0, S. 105);
    // ein allgemeines Kommentarfeld für Behandlungsdaten gibt es in der Feldtabelle nicht.
    f.push(F("8480", TEST_NOTE));
    recs.push({ type: "6200", fields: f });
  }
  return recs;
}
