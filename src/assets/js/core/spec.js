/**
 * Formatwissen aus den Spezifikationen. Jede Angabe trägt ihre Quelle.
 * Vollständige Liste der Quellen: /quellen.md im Repository.
 */

export const SOURCES = {
  ldt2: {
    title: "KBV: Datensatzbeschreibung LDT (Labordatenträger), Version 5.12 vom 03.05.2017 (LDT1014.01)",
    url: "https://wiki.gematik.de/download/attachments/76611849/KBV_ITA_VGEX_Datensatzbeschreibung_LDT.pdf?api=v2",
    short: "KBV LDT 5.12",
  },
  ldt3: {
    title: "KBV: LDT 3 Satzbeschreibung, Version 3.2.20 vom 13.05.2026",
    url: "https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/EXT_ITA_VGEX_LDT%203_2_20_Gesamtdokument.pdf",
    short: "KBV LDT 3.2.20",
  },
  bdt3: {
    title: "QMS: BDT 3.0 Satzbeschreibung, Version 0.96 vom 01.03.2015 (Entwurf)",
    url: "https://web.archive.org/web/20180215143723/http://www.qms-standards.de/fileadmin/Download/DOWNLOAD-PDFS/GDT_BDT/BDT-Datensatzbeschreibung_3-0_V0-96_20150301.pdf",
    short: "QMS BDT 3.0 V0.96",
  },
  bdtClassic: {
    title: "Universität Gießen, Institut für Medizinische Informatik: Onkologischer BDT – Beschreibung des BDT-Formats",
    url: "https://www.uni-giessen.de/de/fbz/fb11/institute/imi/schwerpunkte/kkk/standards/bdt",
    short: "Uni Gießen (BDT-Aufbau)",
  },
};

export const FORMAT_LABEL = {
  ldt2: "LDT 2.x",
  ldt3: "LDT 3.x",
  bdt: "BDT",
  gdt: "GDT",
  unknown: "Unbekanntes Format",
};

/** Satzarten (Feld 8000) mit Bezeichnung. */
export const SATZARTEN = {
  // KBV LDT 5.12, Kap. 2.3.1
  ldt2: {
    "0020": "Datenträger-Header",
    "0021": "Datenträger-Abschluss",
    "8220": "L-Datenpaket-Header",
    "8221": "L-Datenpaket-Abschluss",
    "8230": "P-Datenpaket-Header",
    "8231": "P-Datenpaket-Abschluss",
    "8201": "Labor-Bericht",
    "8202": "LG-Bericht",
    "8203": "Mikrobiologie-Bericht",
    "8204": "Labor-Bericht „Sonstige Einsendepraxen“",
    "8218": "Elektronische Überweisung",
    "8219": "Auftrag an eine Laborgemeinschaft",
  },
  // KBV LDT 3.2.20, Kap. 6.2
  ldt3: {
    "8220": "L-Datenpaket-Header",
    "8221": "L-Datenpaket-Abschluss",
    "8230": "P-Datenpaket-Header",
    "8231": "P-Datenpaket-Abschluss",
    "8205": "Befund",
    "8215": "Auftrag",
  },
  // QMS BDT 3.0 V0.96, Kap. 3.6.1; 6100 als „Patientenstamm“ auch bei Uni Gießen
  bdt: {
    "0001": "Kommunikations-Header",
    "0002": "Kommunikations-Abschluss",
    "0020": "Datei-Header",
    "0021": "Datei-Abschluss",
    spec: "Formatbeschreibungen referenzierter Dateien",
    iden: "BDT-interne Identifikatoren",
    frei: "Freie Kategorien",
    "0010": "Praxisstammdaten",
    adrs: "Adressen",
    term: "Termine",
    diag: "Kürzel für Diagnosen",
    grnk: "Kürzel für Leistungsziffernketten",
    hapo: "Kürzel für Verordnungen",
    bbst: "Kürzel für Behandlungsbausteine",
    text: "Kürzel für Textbausteine",
    "6100": "Patientenstammdaten",
    "6200": "Behandlungsdaten",
  },
};

/** Unbedingte Mussfelder (Feldart „M“, oberste Ebene) je Satzart. */
export const REQUIRED = {
  // KBV LDT 5.12, Kap. 3.1–3.12
  ldt2: {
    "0020": ["8000", "8100", "9105"],
    "0021": ["8000", "8100"],
    "8220": ["8000", "8100", "9212", "0201", "0203", "0205", "0215", "0216", "0101", "9106", "8312", "9103"],
    "8221": ["8000", "8100", "9202"],
    "8230": ["8000", "8100", "9212", "0201", "0203", "0205", "0215", "0216", "0101", "9106", "8312", "9103"],
    "8231": ["8000", "8100", "9202"],
    "8201": ["8000", "8100", "8301", "8302", "8401", "8410"],
    "8202": ["8000", "8100", "8310", "8301", "8302", "8401", "8410"],
    "8203": ["8000", "8100", "8301", "8302", "8401"],
    "8204": ["8000", "8100", "8301", "8302", "8401"],
    "8218": ["8000", "8100", "8310", "8609", "3103", "3110", "8403"],
    "8219": ["8000", "8100", "8310", "8609", "3103", "3110", "8403", "8410"],
  },
  // KBV LDT 3.2.20, Kap. 8.1–8.6
  ldt3: {
    "8220": ["8000", "8132", "8136", "8119", "8001"],
    "8221": ["8000", "9300", "8001"],
    "8230": ["8000", "8132", "7265", "8122", "8001"],
    "8231": ["8000", "9300", "8001"],
    "8205": ["8000", "8122", "8117", "8137", "8135", "8001"],
    "8215": ["8000", "8101", "8001"],
  },
  // QMS BDT 3.0 V0.96, Kap. 5.2
  bdt3: {
    "0020": ["8000", "9806", "0010", "9603", "8202"],
  },
};

/** Versionsangaben. */
export const VERSION = {
  ldt2: { fk: "9212", expected: "LDT1014.01", source: "KBV LDT 5.12, Satzart 8220/8230: „Verbindliche Version der LDT-Satzbeschreibung: LDT1014.01“" },
  ldt3: { fk: "0001", expected: "LDT3.2.20", source: "KBV LDT 3.2.20, Regel E001 (Warnung): zulässiger Inhalt für FK 0001", validFrom: "01.10.2026" },
};

/** Zeichensatz laut Feld 9106. */
export const CHARSET_9106 = {
  // KBV LDT 5.12, Feld 9106, Regel 181
  ldt2: { 1: "din66003", 2: "cp437", 3: "iso-8859-1", 4: "iso-8859-15" },
  // QMS BDT 3.0 V0.96, Feld 9106: „3“ = ISO/IEC 8859-15
  bdt3: { 3: "iso-8859-15" },
};

/** Erster Buchstabe des LDT-2-Dateinamens (KBV LDT 5.12, Kap. 2.7.3). */
export const LDT2_FILENAME_CHARSET = { X: "cp437", S: "din66003", A: "iso-8859-1", Z: "iso-8859-15" };

/** Grenzwert-Indikator 8422. */
export const INDICATOR = {
  // KBV LDT 5.12, Feld 8422, Regel 134
  ldt2: { "+": "leicht erhöht", "++": "stark erhöht", "-": "mäßig erniedrigt", "--": "stark erniedrigt", "!": "auffällig" },
  // KBV LDT 3.2.20, Regel E005
  ldt3: {
    N: "im Normalbereich bzw. normal",
    H: "schwach erhöht", "+": "schwach erhöht",
    HH: "stark erhöht", "++": "stark erhöht",
    L: "schwach erniedrigt", "-": "schwach erniedrigt",
    LL: "stark erniedrigt", "--": "stark erniedrigt",
    "!H": "Wert extrem erhöht", "!+": "Wert extrem erhöht",
    "!L": "Wert extrem erniedrigt", "!-": "Wert extrem erniedrigt",
    A: "auffällig", AA: "sehr auffällig",
  },
};

/** Felder, deren Inhalt als Datum geprüft und angezeigt wird. */
export const DATE_ORDER = { ldt2: "JJJJMMTT", ldt3: "JJJJMMTT", bdt: "TTMMJJJJ" };

/**
 * Felder mit personenbezogenen Daten für die Anonymisierung.
 * scope "patient": in LDT 3 nur innerhalb von Obj_0045 (Patient) bzw. Obj_0048 (Rechnungsempfänger) ersetzen.
 */
export const PERSONAL = {
  name: ["3100", "3101", "3102", "3104", "3120", "0211", "7358"],
  birth: ["3103"],
  address: ["3106", "3107", "3109", "3112", "3113", "3115", "3121", "3122", "3123"],
  insurance: ["3105", "3119"],
  phone: ["3618", "3619", "3626", "7330", "7331", "7332", "7333", "7335", "8612"],
  patientId: ["3000"],
};

/** LDT-3-Objekte, deren Inhalt zum Patienten gehört. */
export const LDT3_PATIENT_OBJECTS = new Set(["Obj_0045", "Obj_0048", "Obj_0047_patient"]);

/** LDT-3-Objekte (Kap. 11, Objektkatalog). */
export const LDT3_OBJECTS = {
  Obj_0001: "Abrechnungsinformationen",
  Obj_0002: "Abrechnung GKV",
  Obj_0003: "Abrechnung PKV",
  Obj_0004: "Abrechnung IGe-Leistungen",
  Obj_0005: "Abrechnung sonstige Kostenübernahme",
  Obj_0006: "Abrechnung Selektivvertrag",
  Obj_0007: "Anschrift",
  Obj_0008: "Adressat",
  Obj_0009: "Abrechnung ÖGD",
  Obj_0010: "Anhang",
  Obj_0011: "Antibiogramm",
  Obj_0013: "Auftragsinformation",
  Obj_0014: "Arztidentifikation",
  Obj_0017: "Befundinformationen",
  Obj_0019: "Betriebsstätte",
  Obj_0022: "Einsenderidentifikation",
  Obj_0026: "Fehlermeldung/Aufmerksamkeit",
  Obj_0031: "Kommunikationsdaten",
  Obj_0032: "Kopfdaten",
  Obj_0034: "Krebsfrüherkennung Zervix-Karzinom (Muster 39)",
  Obj_0035: "Laborergebnisbericht",
  Obj_0036: "Laborkennung",
  Obj_0037: "Material",
  Obj_0040: "Mutterschaft",
  Obj_0041: "Namenskennung",
  Obj_0042: "Normalwert",
  Obj_0043: "Organisation",
  Obj_0045: "Patient",
  Obj_0047: "Person",
  Obj_0048: "Rechnungsempfänger",
  Obj_0050: "Schwangerschaft",
  Obj_0051: "Sendendes System",
  Obj_0053: "Tier/Sonstiges",
  Obj_0054: "Timestamp",
  Obj_0055: "Blutgruppenzugehörigkeit",
  Obj_0056: "Tumor",
  Obj_0058: "Untersuchungsabrechnung",
  Obj_0059: "Untersuchungsanforderung",
  Obj_0060: "Untersuchungsergebnis Klinische Chemie",
  Obj_0061: "Untersuchungsergebnis Mikrobiologie",
  Obj_0062: "Untersuchungsergebnis Krebsfrüherkennung Zervix-Karzinom",
  Obj_0063: "Untersuchungsergebnis Zytologie",
  Obj_0068: "Fließtext",
  Obj_0069: "Körperkenngrößen",
  Obj_0070: "Medikament",
  Obj_0071: "Wirkstoff",
  Obj_0072: "BAK",
  Obj_0073: "Sonstige Untersuchungsergebnisse",
  Obj_0100: "Diagnose",
};

/** Satzarten, die Befunde (Laborergebnisse) enthalten. */
export const RESULT_RECORDS = {
  ldt2: new Set(["8201", "8202", "8203", "8204"]),
  ldt3: new Set(["8205"]),
};

/** Befundstatus 8401: KBV LDT 5.12 (Regel 135) bzw. KBV LDT 3.2.20 (Regel E006). */
export const REPORT_STATUS = {
  ldt2: { E: "Endbefund", T: "Teilbefund", V: "Vorläufiger Befund", A: "Archiv-Befund", N: "Nachforderung" },
  ldt3: { 1: "Auftrag nicht abgeschlossen", 2: "Auftrag abgeschlossen" },
};

/** Geschlecht 3110: KBV LDT 5.12 (Regel 533), KBV LDT 3.2.20 (E019), QMS BDT 3.0 (Feld 3110). */
export const SEX = {
  ldt2: { M: "männlich", W: "weiblich", U: "unbekannt", X: "unbestimmt" },
  ldt3: { M: "männlich", W: "weiblich", D: "divers", X: "unbestimmt", U: "unbekannt" },
  bdt: { 0: "unbekannt", U: "unbekannt", 1: "männlich", M: "männlich", 2: "weiblich", W: "weiblich", 3: "anders", A: "anders" },
};
