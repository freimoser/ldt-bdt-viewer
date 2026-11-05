/**
 * Neuigkeiten zu den Standards (nicht zur Website): eine Quelle für /neuigkeiten/ und feed.xml.
 * Jede Meldung braucht ein belegtes Datum und eine Quelle aus Q (layout.mjs). Neueste zuerst.
 */
export const NEWS = [
  {
    id: "kvdt-6-08",
    date: "2026-10-01",
    title: "KVDT 6.07 und 6.08 gelten ab der Abrechnung für das 4. Quartal 2026",
    text: "Die Änderungen der KVDT-Datensatzbeschreibung vom 14.08.2026 (Version 6.07) und 24.08.2026 (Version 6.08) treten zum 01.10.2026 in Kraft, zur Abrechnung des 4. Quartals 2026 und folgender. Betroffen sind unter anderem die Version der Satzbeschreibung in Feld 9212, der Wertebereich der DMP-Kennzeichnung in Feld 4132 und mehrere Prüfregeln.",
    src: ["kvdt", "Dokumentenhistorie"],
    link: ["xdt-gdt-ldt-bdt/#kvdt", "KVDT im Überblick"],
  },
  {
    id: "ldt-3-2-20",
    date: "2026-10-01",
    title: "LDT 3.2.20 ist in Kraft und ersetzt LDT 3.2.19",
    text: "Die LDT-3-Satzbeschreibung 3.2.20 vom 13.05.2026 gilt seit dem 01.10.2026 und ersetzt Version 3.2.19 vom 01.07.2025. Regel E001 erlaubt in Feld 0001 jetzt „LDT3.2.20“; eine andere Version ist eine Warnung. Außerdem wurden die erlaubten DMP-Kennzeichen angepasst.",
    src: ["ldt3", "S. 1–2, Dokumentenhistorie"],
    link: ["was-ist-ldt/#neu-in-3-2-20", "Was ist neu in LDT 3.2.20?"],
  },
  {
    id: "kbv-testdateien",
    date: "2026-09-02",
    title: "KBV-Testdateien zu LDT 3.2.20 im Update-Verzeichnis",
    text: "Das Archiv „LDT3.2.20_Testdateien LDT-KBV.zip“ trägt im Update-Verzeichnis der KBV das Datum 02.09.2026. Es enthält neun LDT-Dateien, darunter Befunde mit eingebettetem PDF, eine Stornierung und einen Auftrag mit Muster 39.",
    src: ["kbvLdk", "Verzeichnisliste"],
    link: ["kbv-pruefmodul-testdateien/#testdateien", "KBV-Testdateien"],
  },
  {
    id: "xpm-ldk-2-20",
    date: "2026-08-14",
    title: "KBV-Prüfmodul XPM-LDK 2.20.0 veröffentlicht",
    text: "Im Update-Verzeichnis der KBV liegen die Pakete „XPM-LDK.praxis-2.20.0“ und „XPM-LDK.KV-2.20.0“ mit dem Datum 14.08.2026, zusammen mit dem Gesamtdokument der LDT-Satzbeschreibung 3.2.20.",
    src: ["kbvLdk", "Verzeichnisliste"],
    link: ["kbv-pruefmodul-testdateien/#pruefmodul", "Das Prüfmodul"],
  },
];
