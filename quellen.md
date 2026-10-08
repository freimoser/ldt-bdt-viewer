# Quellen

Alle Feldtabellen, Prüfregeln und Faktenaussagen des LDT & BDT Viewers stützen sich auf die folgenden Dokumente.
Abrufdatum aller Quellen: **08.10.2026**.

## Spezifikationen

| Format | Dokument | Version / Stand | Herausgeber | Link | Genutzt für |
|---|---|---|---|---|---|
| LDT 3.x | LDT 3 Satzbeschreibung (Gesamtdokument) | Version 3.2.20 vom 13.05.2026, Status „in Kraft“, Inkrafttreten 01.10.2026 | Kassenärztliche Bundesvereinigung (KBV) | https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/EXT_ITA_VGEX_LDT%203_2_20_Gesamtdokument.pdf | Feldtabelle (406 Feldkennungen inkl. Objektattribute), Regeltabelle (Erlaubte Inhalte), Satzarten, Objektkatalog, Zeilenaufbau, Zeichensatz ISO 8859-15, Prüfsumme 9300 (SHA-1), Dateiname |
| LDT 3.x | Testdateien LDT 3.2.20 (ZIP, 9 Dateien) | Stand 11.05.2026 | KBV | https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/LDT3.2.20_Testdateien%20LDT-KBV.zip | Abgleich von Parser und Prüfer (alle 9 Dateien: 0 Fehler, 0 Warnungen); nicht im Repository enthalten |
| LDT 2.x | Datensatzbeschreibung LDT (Labordatenträger), KBV_ITA_VGEX_Datensatzbeschreibung_LDT | Version 5.12 vom 03.05.2017, LDT-Version „LDT1014.01“ | KBV | https://wiki.gematik.de/download/attachments/76611849/KBV_ITA_VGEX_Datensatzbeschreibung_LDT.pdf?api=v2 | Feldtabelle (136 Feldkennungen), Satzarten und Pflichtfelder, Satzlänge 8100, Gesamtlänge 9202, Zeichensätze (Feld 9106, Dateiname X/S/A/Z), Grenzwert-Indikator |
| LDT 2.x | Empfehlung zur Erweiterung des LDT2 | Version 1.06 vom 14.02.2022 | KBV | https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/KBV_ITA_VGEX_Empfehlung_bei%20LDT2.pdf | Hinweis, dass LDT 2 noch eingesetzt wird; Erweiterungsfelder (Ratgeberseiten) |
| LDT allgemein | FAQ Labordatenkommunikation | Stand 15.11.2023 (Dateidatum) | KBV | https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/KBV_ITA_VGEX_FAQ_LDK.pdf | Hintergrund für Ratgeberseiten |
| BDT 3.0 | BDT 3.0 Satzbeschreibung | Version 0.96, Release 0.0, Stand 01.03.2015, Status „Freigabe für Testimplementierungen“ (Entwurf) | Qualitätsring Medizinische Software e. V. (QMS) | Original nicht mehr online; archivierte Kopie: https://web.archive.org/web/20180215143723/http://www.qms-standards.de/fileadmin/Download/DOWNLOAD-PDFS/GDT_BDT/BDT-Datensatzbeschreibung_3-0_V0-96_20150301.pdf | Feldtabelle (514 Feldkennungen), Satzarten, Satzende 8202, Feldtypen, Zeichensatz ISO 8859-15, Datumsformat TTMMJJJJ |
| BDT (klassisch) | Onkologischer BDT – Beschreibung des BDT-Formats (Tabellen 1–3) | ohne Datum | Universität Gießen, Institut für Medizinische Informatik | https://www.uni-giessen.de/de/fbz/fb11/institute/imi/schwerpunkte/kkk/standards/bdt | Sekundärquelle für den klassischen BDT-Aufbau: Satzart im ersten, Satzlänge 8100 im zweiten Feld, Satzart 6100 Patientenstamm |
| GDT | GDT 2.1 (englische Fassung) | 2.1 | QMS | https://www.qms-standards.de/files/GDT_2_1_0501_english.pdf | Erkennung von GDT-Dateien (Satzarten 6300–6311, Feld 9218 Versionsnummer) |

## Organisationen

| Aussage | Quelle |
|---|---|
| Der QMS pflegt GDT als eigenen Standard und bietet GDT-Downloads an | https://www.qms-standards.de/Marktgestaltung.html (abgerufen 08.10.2026) |
| BDT wurde Anfang der 1990er Jahre vom Zentralinstitut für die kassenärztliche Versorgung (ZI) entwickelt, lag zuletzt als BDT 02/94 (Stand 15.09.1998) vor, der QMS übernahm 2011 die Weiterentwicklung | QMS BDT 3.0 V0.96, Kap. 2 „Vorbemerkungen“ |

## Lücken (nicht verfügbar, nicht geraten)

- **BDT 02/94 (ZI)**: Die Originalspezifikation ist nicht mehr öffentlich abrufbar. Felder, die nur dort definiert sind, zeigt das Tool als „unbekannt“ an. Die Feldbedeutungen stammen aus der BDT-3.0-Feldtabelle des QMS.
- **BDT-3.0-Objektkatalog (QMS)**: Im Webarchiv liegt nur eine HTML-Seite, das PDF ist nicht gesichert. BDT-3.0-Objekte (z. B. Obj_Patient) werden deshalb nicht gegen ihren Aufbau geprüft. Der Generator erzeugt BDT im klassischen Aufbau.
- **BDT-Kopf- und Abschlusssätze im klassischen Aufbau** (Datenträger-/Datenpaket-Header): Ihr Inhalt ist für BDT 02/94 nicht öffentlich dokumentiert. Der Generator lässt sie weg.
- **Kontextregeln (K-Regeln) der LDT-3-Regeltabelle** werden nicht ausgewertet. Geprüft werden Zeilenaufbau, Satz- und Objektstruktur, Pflichtfelder der obersten Ebene, Feldlänge, Feldtyp, erlaubte Inhalte (E-Regeln), Version, Zeichensatz und Prüfsumme.

## Extraktion

Die Feldtabellen wurden mit den Skripten in `scripts/extract/` (pdfplumber) aus den PDFs gelesen und liegen als JSON in `data/`. Jeder Eintrag enthält die Seitenzahl im Quelldokument.
