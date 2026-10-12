import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src as srcAt, href, url, esc, SITE } from "../lib/layout.mjs";
import { BEISPIELE } from "../../src/assets/js/core/beispiele.js";
import { openFile, rowInfo } from "../../src/assets/js/core/xdt.js";
import { LDT3_OBJECTS } from "../../src/assets/js/core/spec.js";

const path = "ldt-datei-beispiel/";
const STAND = "12.10.2026";
const UPDATED = "2026-10-12";
const src = (k, d) => srcAt(k, d, STAND);
const crumbs = [["LDT & BDT Viewer", ""], ["LDT-Beispieldateien", path]];
const title = "LDT Datei Beispiel: Laborbefund Zeile für Zeile erklärt";
const description = "LDT-Beispieldateien zum Download (LDT 3 und LDT 2): Befund, Auftrag, Teilbefund und Fehlerbeispiele, ein Laborbefund Zeile für Zeile erklärt.";
const h1 = "LDT-Datei Beispiel: ein Laborbefund Zeile für Zeile";
const now = new Date(SITE.updated + "T09:30:00Z");

// Kurze Erklärungen zu den Feldern der Beispieldatei (Bedeutung laut Feld- und Regeltabelle der KBV LDT 3.2.20)
const WHY = {
  8000: "Satzbeginn. Der Inhalt nennt die Satzart.",
  8001: "Satzende. Wiederholt die Satzart.",
  "0001": "Version der Satzbeschreibung.",
  8316: "Kennung des Absenders, hier des Labors.",
  "0105": "Prüfnummer der Laborsoftware aus der KBV-Zertifizierung (hier erfunden).",
  "0103": "Name der Laborsoftware.",
  "0132": "Version der Software.",
  7278: "Datum als JJJJMMTT.",
  7279: "Uhrzeit als hhmmss.",
  7273: "Zeitzone: UTC+2 ist die Sommerzeit.",
  1250: "Name der Einrichtung.",
  7266: "Laborart: 2 = Facharztlabor (Regel E051).",
  "0204": "Art der Betriebsstätte: 1 = Arztpraxis, 2 = Laborarztpraxis (Regel E046).",
  "0203": "Name der Betriebsstätte.",
  "0201": "Betriebsstättennummer (BSNR), hier erfunden.",
  3112: "Postleitzahl.", 3113: "Ort.", 3107: "Straße.", 3109: "Hausnummer.", 3114: "Länderkennzeichen.",
  7321: "Status des Einsenders: 02 = Einsender Arzt (Regel E023).",
  8312: "Kundennummer, die das Labor der Praxis gegeben hat.",
  7420: "Rolle der Person: 02 = Einsender Arzt, 12 = Patient, 07 = Laborarzt (Regel E027).",
  3101: "Nachname.", 3102: "Vorname.", 3104: "Titel.", 3103: "Geburtsdatum als JJJJMMTT.", 3110: "Geschlecht: W = weiblich.",
  "0212": "Lebenslange Arztnummer (LANR), hier erfunden.",
  3119: "Versichertennummer der Gesundheitskarte, hier erfunden.",
  3000: "Patientennummer im Praxisprogramm.",
  8310: "Auftragsnummer der Praxis. Daran ordnet das Praxisprogramm den Befund dem Auftrag zu.",
  8311: "Auftragsnummer des Labors.",
  7305: "Kennung des Befunds beim Labor.",
  8401: "Befundstatus: 2 = Auftrag abgeschlossen. 1 hieße: Es folgen noch Werte (Regel E006).",
  7364: "Kennung des Probengefäßes. Sie verbindet Material und Ergebnis.",
  8428: "Kurzbezeichnung des Materials, hier SE für Serum.",
  8430: "Bezeichnung des Materials.",
  7304: "Kennung dieses Ergebnisses.",
  8410: "Kürzel der Untersuchung beim Labor (Test-Ident).",
  8411: "Name der Untersuchung.",
  8418: "Ergebnisstatus: 06 = Befundergebnis, ärztlich geprüft (Regel E007).",
  7306: "Darstellung des Werts: 01 = Zahl (Regel E058).",
  8420: "Der Messwert. Dezimaltrennzeichen ist der Punkt.",
  8419: "Einheitensystem: 1 = SI-Einheit, 2 = andere Einheit (Regel E070).",
  8421: "Einheit des Werts.",
  8424: "Art des Normbereichs: 13 = sonstige Standards (Regel E052).",
  8461: "Untere Grenze des Normbereichs.",
  8462: "Obere Grenze des Normbereichs.",
  8422: "Markierung (Grenzwertindikator): N = normal. Auffällige Werte tragen H, HH, L, LL oder !H (Regel E005).",
  7358: "Name des Laborarztes, der den Wert verantwortet.",
  8990: "Namenskürzel.",
  3564: "Freitext.",
  9300: "Prüfsumme (SHA-1) über alle Bytes davor. Jede spätere Änderung an der Datei fällt damit auf.",
};

/** Tabelle Zeile | Rohzeile | Feld | Erklärung für einen Zeilenbereich der Beispieldatei. */
function walkthrough() {
  const b = BEISPIELE.find((x) => x.file === "Z01_LDT3_Befund_unauffaellig.ldt");
  return (dict) => {
    const m = openFile(b.build(now), b.file, dict);
    const rows = Array.from({ length: m.lines.n }, (_, i) => rowInfo(m, i)).filter((r) => r.fk);
    const idx = (pred) => rows.findIndex(pred);
    const firstResEnd = idx((r) => r.fk === "8003" && r.content === "Obj_0060");
    const tsReport = idx((r) => r.content === "Timestamp_Erstellung_Laborergebnisbericht");
    const headEnd = idx((r) => r.fk === "8001" && r.content === "8220");
    const recEnd = idx((r) => r.fk === "8001" && r.content === "8205");
    // Strukturzeilen (Objektanfang, -ende, Attribut) kurz und blass, Inhaltsfelder mit Name und Erklärung
    const meaning = (r) => {
      const objName = (id) => LDT3_OBJECTS[id] ? ` (${esc(LDT3_OBJECTS[id])})` : "";
      if (r.fk === "8002") return { struct: true, html: `Objekt ${esc(r.content)}${objName(r.content)} beginnt` };
      if (r.fk === "8003") return { struct: true, html: `Objekt ${esc(r.content)} endet` };
      const n = Number(r.fk);
      if (n >= 8100 && n <= 8299 && /^[A-Za-z]/.test(r.content)) return { struct: true, html: `kündigt das Objekt „${esc(r.content.replace(/_/g, " "))}“ an` };
      const why = WHY[r.fk] || WHY[n] || "";
      return { struct: false, html: `<strong>${esc(r.label)}</strong>${why ? " – " + why : ""}` };
    };
    const table = (from, to, caption) => `<div class="table-wrap"><table class="walk">
<caption>${esc(caption)}</caption>
<thead><tr><th scope="col">Zeile</th><th scope="col">So steht es in der Datei</th><th scope="col">Bedeutung</th></tr></thead>
<tbody>
${rows.slice(from, to + 1).map((r) => { const x = meaning(r); return `<tr${x.struct ? ' class="walk-struct"' : ""}><td>${r.line}</td><td><code>${esc(r.len)}<b>${esc(r.fk)}</b>${esc(r.content)}</code></td><td>${x.html}</td></tr>`; }).join("\n")}
</tbody></table></div>`;
    return {
      lines: rows.length,
      head: table(0, headEnd, "Zeilen 1 bis " + rows[headEnd].line + ": Kopf des Datenpakets (Satzart 8220)"),
      befund: table(headEnd + 1, firstResEnd, `Zeilen ${rows[headEnd + 1].line} bis ${rows[firstResEnd].line}: Befund mit Patient und erstem Ergebnis (Satzart 8205)`),
      tail: table(tsReport, rows.length - 1, `Zeilen ${rows[tsReport].line} bis ${rows.at(-1).line}: Ende des Befunds und Abschluss (Satzarten 8205 und 8221)`),
      gap: { from: rows[firstResEnd + 1].line, to: rows[tsReport - 1].line },
      recEnd: rows[recEnd].line,
      raw: rows.map((r) => esc(r.len + r.fk + r.content)).join("\n"),
    };
  };
}

const LIST = BEISPIELE.filter((b) => b.group === "ldt3" || b.group === "ldt2" || (b.group === "fehler" && /\.ldt$/i.test(b.file)));
const groupLabel = { ldt3: "LDT 3", ldt2: "LDT 2", fehler: "Fehlerbeispiel" };

const faq = [
  { q: "Wo bekomme ich eine LDT-Beispieldatei?", a: `Auf dieser Seite: Alle ${LIST.length} Dateien in der Tabelle oben lassen sich herunterladen oder direkt im Viewer öffnen. Offizielle Testdateien zu LDT 3.2.20 stellt außerdem die KBV in ihrem <a href="https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/">Update-Verzeichnis Labordatenkommunikation</a> bereit.` },
  { q: "Enthalten die Beispiele echte Patientendaten?", a: "Nein. Alle Namen beginnen mit „Test-“, Einrichtungen heißen TESTLABOR oder TESTPRAXIS, Nummern und Werte sind erfunden. Die Normbereiche sind keine medizinischen Referenzwerte." },
  { q: "Kann ich die Beispiele in meine Praxissoftware einlesen?", a: "Die Dateien sind nach den Regeln der KBV aufgebaut und bestehen die Prüfung des Viewers ohne Fehler. Lesen Sie sie aber nur in eine Test- oder Schulungsumgebung ein, nie in den echten Patientenbestand: Die erfundenen Patienten würden sonst als neue Patienten angelegt." },
  { q: "Warum sehe ich im Texteditor merkwürdige Zeichen statt Umlauten?", a: "LDT 3 ist in ISO 8859-15 gespeichert, LDT 2 oft im alten DOS-Zeichensatz Codepage 437. Viele Editoren lesen Dateien als UTF-8 und zeigen Umlaute dann falsch an. Der Viewer erkennt den Zeichensatz selbst und lässt ihn umschalten." },
  { q: "Sind das offizielle Prüfdateien der KBV?", a: "Nein. Die Beispiele wurden mit dem LDT & BDT Viewer erzeugt und zeigen typische Situationen. Für eine Zertifizierung gelten die Prüffälle der KBV aus dem Prüfpaket Labordatenkommunikation." },
];

export default function ({ dict }) {
  const w = walkthrough()(dict);
  const tableRows = LIST.map((b) => `<tr><td><strong>${esc(b.title)}</strong><br><code>${esc(b.file)}</code></td><td>${groupLabel[b.group]}</td><td>${esc(b.shows)}</td><td class="nowrap"><a href="${href("?beispiel=" + encodeURIComponent(b.file))}">Im Viewer ansehen</a><br><a href="${href("beispiele/" + b.file)}" download>Herunterladen</a></td></tr>`).join("\n");

  const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>Eine LDT-Datei ist eine Textdatei</strong>, in der jede Zeile aus einer dreistelligen Längenangabe, einer vierstelligen Feldkennung und dem Inhalt besteht. ${src("ldt3", "Kap. 6.4.1")} Hier finden Sie ${LIST.length} Beispieldateien mit erfundenen Daten zum Herunterladen und einen vollständigen LDT-3-Laborbefund, Zeile für Zeile erklärt.`,
  minutes: 8,
  stand: STAND,
})}
<div class="prose">
<div class="callout"><span class="callout-title">Nicht verwechseln</span><p>Die Endung .ldt verwenden auch EULUMDAT-Dateien aus der Lichtplanung, die Daten von Leuchten enthalten. ${src("eulumdat")} Diese Seite behandelt den Labordatenträger LDT der Kassenärztlichen Bundesvereinigung, mit dem Arztpraxen und Labore Aufträge und Befunde austauschen. ${src("ldt3", "Kap. 4")}</p></div>

<h2 id="downloads">Beispieldateien zum Herunterladen</h2>
<p>Alle Dateien enthalten nur erfundene Personen und Werte. Jede Datei, die nicht ausdrücklich ein Fehlerbeispiel ist, besteht die Prüfung des Viewers ohne Fehler und Warnungen. „Im Viewer ansehen“ öffnet die Datei direkt, ohne dass etwas hochgeladen wird.</p>
<div class="table-wrap"><table>
<caption>LDT-Beispieldateien</caption>
<thead><tr><th scope="col">Beispiel</th><th scope="col">Format</th><th scope="col">Was die Datei zeigt</th><th scope="col">Datei</th></tr></thead>
<tbody>
${tableRows}
</tbody></table></div>
<p>Ein BDT-Export aus der Praxissoftware wird auf der Seite <a href="${href("bdt-datei-beispiel/")}">BDT-Beispieldatei</a> Zeile für Zeile erklärt. Wie Sie eine eigene Datei öffnen, erklärt <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a>.</p>

<h2 id="aufbau">So ist eine LDT-Datei aufgebaut</h2>
<p>Jede Zeile beginnt mit ihrer Länge in Bytes: Inhalt plus 9 (3 Zeichen Länge, 4 Zeichen Feldkennung, 2 Zeichen Zeilenende CR LF). ${src("ldt3", "Kap. 6.4.1")} Zeilen werden zu <strong>Sätzen</strong> zusammengefasst, die mit Feld 8000 beginnen und mit Feld 8001 enden. ${src("ldt3", "Kap. 6.2 und 6.3")} Innerhalb eines Satzes bündeln <strong>Objekte</strong> zusammengehörige Felder, etwa alle Angaben zum Patienten. Ein Objekt beginnt mit Feld 8002 und endet mit Feld 8003. ${src("ldt3", "Kap. 6.3")}</p>
<p>Ein Befund vom Labor an die Praxis besteht aus drei Satzarten: dem Kopf des Datenpakets (8220), einem Befund je Patient (8205) und dem Abschluss (8221). ${src("ldt3", "Kap. 6.2")} Die Datei muss im Zeichensatz ISO 8859-15 gespeichert sein ${src("ldt3", "Kap. 6.6")}, und ihr Name beginnt mit <code>Z01</code> und endet auf <code>.ldt</code>. ${src("ldt3", "Kap. 6.7")}</p>

<h2 id="zeile-fuer-zeile">Ein LDT-3-Laborbefund Zeile für Zeile</h2>
<p>Grundlage ist die Beispieldatei <a href="${href("beispiele/Z01_LDT3_Befund_unauffaellig.ldt")}" download>Z01_LDT3_Befund_unauffaellig.ldt</a> (<a href="${href("?beispiel=Z01_LDT3_Befund_unauffaellig.ldt")}">im Viewer ansehen</a>): ein abgeschlossener Befund für die erfundene Patientin Erika Test-Musterfrau mit sechs Werten im Normbereich, insgesamt ${w.lines} Zeilen. Die Bedeutungen der Felder stammen aus der Feldtabelle und der Regeltabelle der KBV. ${src("ldt3", "Kap. 9 und 10")}</p>
<p>So lesen Sie die Tabellen: In der mittleren Spalte ist die Feldkennung fett gesetzt; davor steht die Länge, danach der Inhalt. Blasse Zeilen sind reine Struktur: Ein Attribut (z. B. „Kopfdaten“) kündigt ein Objekt an, das mit 8002 beginnt und mit 8003 endet. Dazwischen stehen die eigentlichen Angaben.</p>
<h3>1. Kopf des Datenpakets</h3>
<p>Der Kopf sagt, wer die Datei geschickt hat, mit welcher Software, wann, und nach welcher Version sie aufgebaut ist.</p>
${w.head}
<h3>2. Befund: Einsender, Patient, Material und erstes Ergebnis</h3>
<p>Ab hier beginnt der eigentliche Befund. Für die Praxis wichtig sind die Auftragsnummer in Feld 8310 (daran ordnet das Praxisprogramm den Befund zu) und der Befundstatus in Feld 8401. Jeder Wert steht in einem eigenen Untersuchungsergebnis (Obj_0060) mit Status, Wert, Einheit, Normbereich und Markierung. ${src("ldt3", "Kap. 11.43, S. 169–170")}</p>
${w.befund}
<p>Die Zeilen ${w.gap.from} bis ${w.gap.to} enthalten fünf weitere Untersuchungsergebnisse mit genau diesem Aufbau: Leukozyten, Kalium, Natrium, Kreatinin und Glukose.</p>
<h3>3. Ende des Befunds und Abschluss</h3>
<p>Der Befund endet in Zeile ${w.recEnd} mit Feld 8001. Danach folgt der Abschluss-Satz 8221 mit der Prüfsumme in Feld 9300. ${src("ldt3", "Feldtabelle, Feld 9300, S. 73")}</p>
${w.tail}
<details class="raw-file"><summary>Die komplette Datei als Text anzeigen (${w.lines} Zeilen)</summary>
<pre><code>${w.raw}</code></pre>
</details>

<h2 id="auffaellig">So sehen auffällige Werte und Teilbefunde aus</h2>
<p>Bei auffälligen Werten steht in Feld 8422 statt N zum Beispiel H (schwach erhöht), HH (stark erhöht), L oder LL (erniedrigt). Bei extremen Werten (!H oder !L) muss das Labor zusätzlich eine Aufmerksamkeitsmeldung (Obj_0026) mitschicken. ${src("ldt3", "Regeln E005 und K099")} Das zeigt die Datei <a href="${href("?beispiel=Z01_LDT3_Befund_auffaellig.ldt")}">Laborbefund mit auffälligen Werten</a>:</p>
<pre><code>0118422!H
0378126Fehlermeldung_Aufmerksamkeit
0178002Obj_0026
01072802</code></pre>
<p>Der Grund 2 in Feld 7280 bedeutet „Lebensbedrohlicher Zustand“. ${src("ldt3", "Regel E049")} Ist der Auftrag noch nicht fertig, trägt der Befund in Feld 8401 den Status 1, und einzelne Ergebnisse haben den Status 02 „Ergebnis folgt“ ohne Wert. ${src("ldt3", "Regeln E006 und E007")} Ein vollständig abgeschlossener Befund darf solche vorläufigen Ergebnisse nicht enthalten. ${src("ldt3", "Regel K096")} Beides zeigt die Datei <a href="${href("?beispiel=Z01_LDT3_Teilbefund.ldt")}">Teilbefund</a>.</p>

<h2 id="ldt2">Und wie sieht LDT 2 aus?</h2>
<p>Im älteren LDT 2 gibt es keine Objekte und kein Satzende-Feld. Stattdessen steht im zweiten Feld jedes Satzes die Satzlänge (Feld 8100), und der Zeichensatz wird in Feld 9106 und im ersten Buchstaben des Dateinamens angegeben, zum Beispiel X für den DOS-Zeichensatz Codepage 437. ${src("ldt2", "Kap. 2.3.3, 2.6 und 2.7.3")} Markierungen lauten dort +, ++, - oder --. ${src("ldt2", "Feld 8422")} Beispiele sind die Dateien <a href="${href("?beispiel=X01BEFND.LDT")}">X01BEFND.LDT</a> und <a href="${href("?beispiel=Z01TEILB.LDT")}">Z01TEILB.LDT</a>. Alle Unterschiede stehen im Vergleich <a href="${href("ldt-2-vs-ldt-3/")}">LDT 3 und LDT 2</a>.</p>

<h2 id="wer">Welches Beispiel passt zu Ihrer Frage?</h2>
<ul>
<li><strong>MFA:</strong> „Ist der Befund vollständig?“ – Teilbefund und Laborbefund mit auffälligen Werten zeigen, woran Sie offene Werte und Markierungen erkennen.</li>
<li><strong>Ärztin oder Arzt:</strong> Ergebnisstatus, Normbereich und die Aufmerksamkeitsmeldung bei Extremwerten stehen im auffälligen Befund.</li>
<li><strong>Praxis-IT und Support:</strong> Die Fehlerbeispiele zeigen typische Importprobleme wie falschen Zeichensatz, abgeschnittene Dateien oder geänderte Zeilenenden. Erklärungen dazu stehen unter <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>.</li>
<li><strong>Entwicklung:</strong> Objektaufbau, Pflichtfelder und Prüfsumme lassen sich an den Dateien nachvollziehen. Eigene Testdateien mit beliebig vielen Patienten erzeugt der <a href="${href("#generator")}">Generator im Viewer</a>; die Bedeutung jeder Kennung steht in der Referenz <a href="${href("feldkennungen/")}">Feldkennungen</a>.</li>
</ul>
<p>Offizielle Testdateien zu LDT 3.2.20 stellt die KBV als ZIP-Archiv im <a href="https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/">Update-Verzeichnis Labordatenkommunikation</a> bereit. ${src("kbvdir")} Die Prüffälle für die Zertifizierung beschreibt das Prüfpaket Labordatenkommunikation. ${src("pruefpaket", "Kap. 2")}</p>
</div>
${faqHtml(faq)}
${ctaHtml("Eigene LDT-Datei ansehen", "Öffnen Sie Ihre eigene Befunddatei im Viewer und vergleichen Sie sie mit den Beispielen. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["ldt-datei-oeffnen/", "was-ist-ldt/", "fehler/", "bdt-datei-beispiel/"])}
</main>`;

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "LDT-Beispieldateien (LDT 3.2.20 und LDT 2) mit erfundenen Testdaten",
    description: `Sammlung von ${LIST.length} LDT-Dateien (Labordatenträger der KBV) mit erfundenen Patienten und Werten: Laborbefunde, Teilbefund, Laborauftrag, Sammelbefund, LDT 2 in Codepage 437 und ISO 8859-15 sowie Dateien mit typischen Fehlern zum Testen von Praxis- und Laborsoftware.`,
    url: url(path),
    inLanguage: "de-DE",
    isAccessibleForFree: true,
    keywords: ["LDT", "Labordatenträger", "LDT 3", "LDT 2", "Beispieldatei", "Testdatei", "xDT"],
    creator: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    dateModified: UPDATED,
    distribution: LIST.map((b) => ({ "@type": "DataDownload", name: b.title, contentUrl: url("beispiele/" + b.file), encodingFormat: "text/plain" })),
  };

  return {
    path,
    title,
    description,
    ogTitle: "LDT-Beispieldateien: Laborbefund Zeile für Zeile erklärt",
    ogType: "article",
    lastmod: UPDATED,
    jsonld: [articleLd({ headline: h1, description, path, updated: UPDATED }), dataset, faqLd(faq), breadcrumbLd(crumbs)],
    body,
    minInternalLinks: 3,
    llms: `${LIST.length} LDT-Beispieldateien (LDT 3.2.20 und LDT 2) mit erfundenen Daten zum Download, darunter Fehlerbeispiele; ein vollständiger LDT-3-Laborbefund Zeile für Zeile erklärt (Satzarten 8220/8205/8221, Objekte, Ergebnisstatus, Grenzwertindikator, Prüfsumme 9300).`,
  };
}
