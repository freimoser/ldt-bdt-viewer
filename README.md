# LDT & BDT Viewer

**Kostenloser Viewer für LDT- und BDT-Dateien** – Labordaten und Praxisdaten-Exporte im Browser lesen, prüfen und anonymisieren. Ohne Upload.

**Live:** [https://freimoser.github.io/ldt-bdt-viewer/](https://freimoser.github.io/ldt-bdt-viewer/)  
**Ratgeber:** [LDT-Datei öffnen](https://freimoser.github.io/ldt-bdt-viewer/ldt-datei-oeffnen/) · [BDT-Datei öffnen](https://freimoser.github.io/ldt-bdt-viewer/bdt-datei-oeffnen/) · [Was ist LDT?](https://freimoser.github.io/ldt-bdt-viewer/was-ist-ldt/) · [Was ist BDT?](https://freimoser.github.io/ldt-bdt-viewer/was-ist-bdt/) · [LDT 2 vs. LDT 3](https://freimoser.github.io/ldt-bdt-viewer/ldt-2-vs-ldt-3/) · [xDT im Überblick](https://freimoser.github.io/ldt-bdt-viewer/xdt-gdt-ldt-bdt/) · [Feldkennungen](https://freimoser.github.io/ldt-bdt-viewer/feldkennungen/) · [Fehler](https://freimoser.github.io/ldt-bdt-viewer/fehler/) · [LDT-Beispieldateien](https://freimoser.github.io/ldt-bdt-viewer/ldt-datei-beispiel/) · [BDT-Beispieldatei](https://freimoser.github.io/ldt-bdt-viewer/bdt-datei-beispiel/)

Schwesterprojekt: [GDT Viewer](https://freimoser.github.io/gdt-viewer/) für Gerätedatentransfer.

---

## Was macht dieses Projekt?

| Funktion | Beschreibung |
|----------|--------------|
| **Öffnen** | Datei wählen oder hineinziehen (`.ldt`, `.bdt`, `.dat`, `.txt`), mehrere Dateien gleichzeitig; Beispiele per Klick oder Link (`#beispiel=Dateiname`) |
| **Beispieldateien** | Kompendium mit 18 Dateien aus erfundenen Daten: LDT-3-Befunde (unauffällig, auffällig mit Extremwert, Teilbefund, Sammelbefund), LDT-3-Auftrag, LDT 2 in Codepage 437 und ISO 8859-15, BDT-Export und zehn Fehlerbeispiele mit Ursache und Behebung (`src/assets/js/core/beispiele.js`) |
| **Erkennen** | LDT 2.x (LDT1014.01), LDT 3.x (LDT3.2.20), BDT (klassisch mit Satzlänge 8100 oder BDT 3.0), KVDT-Abrechnungsdateien (Satzarten laut KBV 6.08), GDT mit Hinweis auf den GDT Viewer, EULUMDAT-Lichtdateien mit Hinweis statt Fehlermeldungen; Zeichensatz (IBM-Codepage 437, ISO 8859-1, ISO 8859-15, 7-Bit DIN 66003, UTF-8) mit Umschalter |
| **Zusammenfassung** | Dateityp und Version, Richtung, Absender, Empfänger, Datum, Sätze, Patienten, Befunde oder Aufträge, Extremwerte, Teilbefunde und noch folgende Werte; Warnhinweis, wenn die Datei Fehler enthält |
| **Befundansicht** | Tabelle pro Patient: Untersuchung, Ergebnis (mit Dezimalkomma), Einheit, Normbereich, Markierung so, wie das Labor sie sendet, Ergebnisstatus („Ergebnis folgt“, „korrigiert“), Meldungen des Labors bei Extremwerten, Hinweis auf Teilbefunde; bei Aufträgen eine Auftragsübersicht |
| **Anhänge** | eingebettete Dokumente aus LDT 3 (Obj_0010, Base64 in Feld 6329), etwa den PDF-Befund des Labors, lokal öffnen oder speichern; Typ nach Regel E053 |
| **Strukturansicht** | Baum aus Sätzen und LDT-3-Objekten, daneben Rohzeilen mit Feldkennung, Bedeutung, Länge und Inhalt; Klick springt zwischen Baum und Zeile |
| **Prüfen** | Fehler und Warnungen zeilengenau in einfacher Sprache mit Erklärung und erkannter Ursache („Datei als UTF-8 gespeichert“, „abgeschnitten“ …), Folgefehler gekennzeichnet: Längenangabe, Zeilenende, Zeichensatz, Satzarten und Reihenfolge, Pflichtfelder (auch je LDT-3-Objekt laut Objektkatalog), Feldlänge, Feldtyp, erlaubte Werte, Version, Satzlänge 8100, Gesamtlänge 9202, Satzende 8001/8202, Objekte 8002/8003, SHA-1-Prüfsumme 9300 |
| **Suchen** | nach Feldkennung, Patient, Untersuchung oder Text |
| **Anonymisieren** | Namen, Geburtsdaten, Adressen, Versicherten-, Telefon- und Patientennummern ersetzen, LDT-3-Anhänge entfernen, alle Längen und Prüfsummen neu berechnen |
| **Exportieren** | Befunde als CSV (Semikolon, UTF-8 mit BOM, Excel-tauglich), Druckansicht, Rohdaten als JSON |
| **Generator** | gültige Testdateien für LDT 2.x, LDT 3.2.20 (Befunde und Aufträge) und BDT mit erfundenen, klar gekennzeichneten Testpatienten |
| **Nachschlagen** | Feldkennung oder Begriff suchen; vollständige Referenz unter `/feldkennungen/`, Kurzdefinitionen unter `/glossar/` |
| **Offline** | nach dem ersten Laden ohne Internet nutzbar (Service Worker) |

Gedacht für **Medizinische Fachangestellte**, **Praxis-IT und Support** und **Entwickler von Schnittstellen**.

---

## Datenschutz

- Dateien werden **ausschließlich im Browser** gelesen (Web Worker). Es gibt keinen Server, keinen Upload, keine Cookies, kein Tracking, keine externen Schriften oder CDNs.
- Einziger Abruf ist das Feldwörterbuch dieser Website (`assets/data/felder.json`).
- Hosting über GitHub Pages; GitHub verarbeitet dabei technisch notwendige Zugriffsdaten (siehe [Datenschutz](https://freimoser.github.io/ldt-bdt-viewer/datenschutz/)).
- **Kein Medizinprodukt.** Dient nur zur Anzeige und Prüfung von Dateien, nicht zur Diagnose.

---

## Quellen

Feldtabellen und Prüfregeln stammen aus den offiziellen Spezifikationen (Details, Versionen, Abrufdatum und Lücken in [quellen.md](quellen.md)):

| Format | Dokument |
|--------|----------|
| LDT 3.x | KBV, LDT 3 Satzbeschreibung Version 3.2.20 (13.05.2026, in Kraft ab 01.10.2026) |
| LDT 2.x | KBV, Datensatzbeschreibung LDT Version 5.12 (03.05.2017), LDT1014.01 |
| BDT 3.0 | QMS, BDT 3.0 Satzbeschreibung Version 0.96 (01.03.2015, Testfassung; BDT 3 laut Ärzteblatt im September 2017 freigegeben, diese Fassung ist nicht öffentlich) |
| BDT klassisch | Universität Gießen, Beschreibung des BDT-Formats (Sekundärquelle) |

Geprüft gegen die 9 offiziellen KBV-Testdateien zu LDT 3.2.20: 0 Fehler, 0 Warnungen.

---

## Deployment

Bei jedem Push auf `main` testet und baut die GitHub Action die Seite und veröffentlicht sie auf GitHub Pages. Danach meldet sie die URLs der Sitemap per [IndexNow](https://www.indexnow.org/) an Bing und weitere Suchmaschinen (Schlüsseldatei in `src/static/`); schlägt das fehl, bleibt das Deployment gültig.

## Livegang-Prüfung

```bash
node scripts/build.mjs
npm run check:launch
```

Prüft den Build auf Blocker (Exit 1): Impressum mit ladungsfähiger Anschrift und Kontakt, Links auf Impressum und Datenschutz, Canonical, Sitemap gegen `noindex` in beiden Richtungen, Titellängen, Favicons (96 px für Google), keine Einbindung fremder Server, jeder Inhabernachweis (Google, Bing) in der Datenschutzerklärung, strukturierte Daten (FAQ-Fragen sichtbar, Article mit Bild, Autor und Datum, letzter Breadcrumb = Canonical; Hinweis, wenn `dateModified` von `lastmod` abweicht). Die GitHub Action führt die Prüfung vor jedem Deployment aus. Alle Symbole entstehen aus einer Quelle: `npm run icons` (Chrome, `scripts/assets/icon.html`).

## Aufbau der Website

- **Kopf und Navigation:** ein Kopf für alle Seiten (`nav()` in `scripts/lib/layout.mjs`), beim Scrollen oben fixiert, auf schmalen Bildschirmen waagerecht wischbar. Seiten ohne eigenen Menüpunkt markieren ihren Bereich (`BEREICH`).
- **Gliederung:** `SECTIONS` in `layout.mjs` speist Footer und die Inhaltsübersicht `/inhalt/` (HTML-Sitemap mit allen Abschnitten).
- **Vorschaubilder:** `npm run og` erzeugt je Seite ein Open-Graph-Bild aus `scripts/assets/og-page.html` nach `src/static/og/`; `npm run screenshots` die Bildschirmfotos der Ratgeber.
- **Datum:** Das sichtbare „Aktualisiert“ jeder Seite kommt aus `lastmod` wie Sitemap und Schema; die Livegang-Prüfung sperrt bei Abweichung.

## Lokal starten

```bash
git clone https://github.com/freimoser/ldt-bdt-viewer.git
cd ldt-bdt-viewer
node scripts/build.mjs
node scripts/serve.mjs
```

Browser: [http://localhost:8765/ldt-bdt-viewer/](http://localhost:8765/ldt-bdt-viewer/)

## Tests

```bash
node --test tests/*.test.mjs
```

Automatische Tests mit selbst erzeugten Testdateien: gültige LDT-2-, LDT-3- und BDT-Datei, Codepage 437 und ISO 8859-15 mit Umlauten, falsche Längenfelder, unbekannte Feldkennungen, leere Datei, GDT-Datei, Datei über 20 MB, Anonymisierung (gültig, kein Originalname), Generator (fehlerfrei, auch Aufträge), CSV-Export; dazu jede Datei des Beispiel-Kompendiums gegen ihr erwartetes Prüfergebnis und ihre erwartete Fehlerursache.

Browser-Test mit Chrome (große Datei ohne Einfrieren, 360 px, Tastatur, offline):

```bash
npm install --no-save puppeteer-core axe-core sharp
node tests/e2e/browser.mjs
```

---

## Technik

- Statisches HTML, CSS und JavaScript ohne Framework; Build-Skript `scripts/build.mjs` ohne Abhängigkeiten (Seiten, Feldwörterbuch, Sitemap, `llms.txt`, Manifest, Service Worker, SEO- und Linkprüfung)
- Deployment per GitHub Action bei Push auf `main`

## Repository

- **Homepage:** https://freimoser.github.io/ldt-bdt-viewer/
- **Code und Issues:** https://github.com/freimoser/ldt-bdt-viewer

## Lizenz

Quellcode: [MIT](LICENSE). Die erzeugten Beispieldateien (`.ldt`, `.bdt` unter `/beispiele/`) stehen unter [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) und dürfen ohne Einschränkung verwendet werden.
