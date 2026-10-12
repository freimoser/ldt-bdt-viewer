import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src as srcAt, href, url, esc, SITE } from "../lib/layout.mjs";
import { BEISPIELE } from "../../src/assets/js/core/beispiele.js";
import { openFile, rowInfo } from "../../src/assets/js/core/xdt.js";

const path = "bdt-datei-beispiel/";
const STAND = "12.10.2026";
const UPDATED = "2026-10-12";
const src = (k, d) => srcAt(k, d, STAND);
const crumbs = [["LDT & BDT Viewer", ""], ["BDT-Beispieldateien", path]];
const title = "BDT Datei Beispiel: Praxisdaten-Export Zeile für Zeile";
const description = "BDT-Beispieldatei zum Download mit erfundenen Daten: Patientenstamm 6100 und Behandlungsdaten 6200 Zeile für Zeile erklärt, dazu ein Fehlerbeispiel.";
const h1 = "BDT-Datei Beispiel: ein Praxisdaten-Export Zeile für Zeile";
const now = new Date(SITE.updated + "T09:30:00Z");

// Bedeutungen laut BDT-3.0-Feldtabelle (QMS, V0.96) bzw. Uni Gießen für den klassischen Aufbau
const WHY = {
  8000: "Satzbeginn mit der Satzart: 6100 = Patientenstamm, 6200 = Behandlungsdaten.",
  8100: "Satzlänge in Bytes. Im klassischen Aufbau steht sie im zweiten Feld jedes Satzes.",
  3000: "Patientennummer im Praxisprogramm. Sie verbindet die Stammdaten (6100) mit den Behandlungsdaten (6200).",
  3101: "Nachname.", 3102: "Vorname.",
  3103: "Geburtsdatum als TTMMJJJJ (in LDT dagegen JJJJMMTT).",
  3110: "Geschlecht: M = männlich, W = weiblich. BDT 3.0 erlaubt außerdem 0–3, U und A.",
  3106: "Postleitzahl und Ort in einem Feld.",
  3107: "Straße und Hausnummer in einem Feld.",
  3626: "Telefonnummer, hier ein Platzhalter.",
  6200: "Tag der Speicherung der Behandlungsdaten, als TTMMJJJJ.",
  6201: "Uhrzeit der Erhebung als hhmmss.",
  8410: "Test-Ident: Kürzel der Untersuchung, höchstens 8 Zeichen.",
  8411: "Name der Untersuchung.",
  8420: "Der Messwert.",
  8421: "Einheit des Messwerts.",
  8461: "Untere Grenze des Normbereichs.",
  8462: "Obere Grenze des Normbereichs.",
  8480: "Ergebnistext. Hier steht der Hinweis, dass alle Werte erfunden sind.",
};

function walkthrough(dict) {
  const b = BEISPIELE.find((x) => x.file === "BEISPIEL_BDT_Export.bdt");
  const m = openFile(b.build(now), b.file, dict);
  const rows = Array.from({ length: m.lines.n }, (_, i) => rowInfo(m, i)).filter((r) => r.fk);
  const second = rows.findIndex((r, i) => i > 0 && r.fk === "8000" && r.content === "6100");
  const table = (list, caption) => `<div class="table-wrap"><table class="walk">
<caption>${esc(caption)}</caption>
<thead><tr><th scope="col">Zeile</th><th scope="col">So steht es in der Datei</th><th scope="col">Bedeutung</th></tr></thead>
<tbody>
${list.map((r) => `<tr><td>${r.line}</td><td><code>${esc(r.len)}<b>${esc(r.fk)}</b>${esc(r.content)}</code></td><td><strong>${esc(r.label)}</strong>${WHY[r.fk] ? " – " + WHY[r.fk] : ""}</td></tr>`).join("\n")}
</tbody></table></div>`;
  const first = rows.slice(0, second);
  const stamm = first.filter((r, i) => i < first.findIndex((x, k) => k > 0 && x.fk === "8000"));
  const behandlung = first.slice(stamm.length);
  return {
    lines: rows.length,
    stamm: table(stamm, `Zeilen ${stamm[0].line} bis ${stamm.at(-1).line}: Patientenstamm (Satzart 6100)`),
    behandlung: table(behandlung, `Zeilen ${behandlung[0].line} bis ${behandlung.at(-1).line}: Behandlungsdaten mit Laborwerten (Satzart 6200)`),
    secondFrom: rows[second].line,
    raw: rows.map((r) => esc(r.len + r.fk + r.content)).join("\n"),
  };
}

const LIST = BEISPIELE.filter((b) => /\.bdt$/i.test(b.file));

const faq = [
  { q: "Wo bekomme ich eine BDT-Beispieldatei?", a: `Auf dieser Seite gibt es ${LIST.length} BDT-Dateien mit erfundenen Daten zum Herunterladen oder zum direkten Öffnen im Viewer. Weitere Testdateien im klassischen BDT-Aufbau mit beliebig vielen Patienten erzeugt der <a href="${href("#generator")}">Generator im Viewer</a>.` },
  { q: "Kann ich mit der Beispieldatei einen Wechsel der Praxissoftware testen?", a: "Nur sehr eingeschränkt. Die Beispieldatei enthält Stammdaten und Laborwerte. Echte Exporte enthalten viel mehr, etwa Diagnosen, Abrechnungsdaten, Medikation und Dokumente, und jede Praxissoftware nutzt BDT etwas anders. Lesen Sie Testdateien außerdem nur in eine Testumgebung ein, nie in den echten Patientenbestand." },
  { q: "Warum steht das Datum anders als in LDT?", a: "BDT schreibt Daten als TTMMJJJJ, also Tag, Monat, Jahr. LDT 3 verwendet JJJJMMTT. Der Viewer zeigt beide Formate lesbar an." },
  { q: "Enthält die Datei echte Patientendaten?", a: "Nein. Alle Namen beginnen mit „Test-“, alle Untersuchungen heißen „(Testwert)“, Nummern und Werte sind erfunden, und die Normbereiche sind keine medizinischen Referenzwerte." },
  { q: "Warum gibt es nur so wenige BDT-Beispiele?", a: "Weil wir nur erzeugen, was sich belegen lässt. Die ursprüngliche BDT-Beschreibung 02/94 ist nicht mehr öffentlich verfügbar, und für BDT 3.0 fehlt der Objektkatalog. Welche Quellen genutzt wurden und welche fehlen, steht in der <a href=\"https://github.com/freimoser/ldt-bdt-viewer/blob/main/quellen.md\">Quellenliste</a>." },
];

export default function ({ dict }) {
  const w = walkthrough(dict);
  const tableRows = LIST.map((b) => `<tr><td><strong>${esc(b.title)}</strong><br><code>${esc(b.file)}</code></td><td>${esc(b.shows)}</td><td class="nowrap"><a href="${href("?beispiel=" + encodeURIComponent(b.file))}">Im Viewer ansehen</a><br><a href="${href("beispiele/" + b.file)}" download>Herunterladen</a></td></tr>`).join("\n");

  const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>Eine BDT-Datei ist ein Datenexport aus der Praxissoftware</strong>, in dem wie bei LDT jede Zeile aus einer dreistelligen Längenangabe, einer vierstelligen Feldkennung und dem Inhalt besteht. ${src("bdt3", "Kap. 3.3")} Hier finden Sie einen BDT-Export mit erfundenen Daten zum Herunterladen und Zeile für Zeile erklärt.`,
  minutes: 5,
  stand: STAND,
})}
<div class="prose">
<h2 id="downloads">Beispieldateien zum Herunterladen</h2>
<p>Alle Personen und Werte sind erfunden. „Im Viewer ansehen“ öffnet die Datei direkt im Browser, ohne Upload.</p>
<div class="table-wrap"><table>
<caption>BDT-Beispieldateien</caption>
<thead><tr><th scope="col">Beispiel</th><th scope="col">Was die Datei zeigt</th><th scope="col">Datei</th></tr></thead>
<tbody>
${tableRows}
</tbody></table></div>
<p>Beispiele für Laborbefunde und Laboraufträge im LDT-Format finden Sie unter <a href="${href("ldt-datei-beispiel/")}">LDT-Beispieldateien</a>.</p>

<h2 id="welcher-aufbau">Welcher BDT-Aufbau ist das?</h2>
<p>Das Beispiel nutzt den <strong>klassischen Aufbau</strong>: Jeder Satz beginnt mit der Satzart in Feld 8000, im zweiten Feld folgt die Satzlänge in Feld 8100, und die Satzart 6100 enthält den Patientenstamm. ${src("giessen")} Die neuere Beschreibung BDT 3.0 des Qualitätsrings Medizinische Software ist ein Entwurf; sie beendet jeden Satz stattdessen mit Feld 8202, das die Anzahl der Felder enthält, und schreibt ISO 8859-15 vor. ${src("bdt3", "Kap. 2.2, 3.2–3.4 und 3.7.5")}</p>
<p>Die ursprüngliche Beschreibung BDT 02/94 ist nicht mehr öffentlich verfügbar. Die Bedeutung der einzelnen Felder stammt deshalb aus der Feldtabelle von BDT 3.0. ${src("tool", "Abschnitt Lücken")} Mehr zur Herkunft und zu den Grenzen von BDT steht unter <a href="${href("was-ist-bdt/")}">Was ist BDT?</a>.</p>

<h2 id="zeile-fuer-zeile">Der BDT-Export Zeile für Zeile</h2>
<p>Grundlage ist die Datei <a href="${href("beispiele/BEISPIEL_BDT_Export.bdt")}" download>BEISPIEL_BDT_Export.bdt</a> (<a href="${href("?beispiel=BEISPIEL_BDT_Export.bdt")}">im Viewer ansehen</a>) mit zwei erfundenen Patienten, insgesamt ${w.lines} Zeilen. Für jeden Patienten gibt es zwei Sätze: zuerst die Stammdaten, dann die Behandlungsdaten mit Laborwerten. Die Feldbedeutungen stammen aus der BDT-3.0-Feldtabelle. ${src("bdt3", "Feldtabelle, S. 70–105")}</p>
<h3>1. Patientenstamm</h3>
${w.stamm}
<h3>2. Behandlungsdaten mit Laborwerten</h3>
<p>Die Patientennummer in Feld 3000 steht in beiden Sätzen. Daran erkennt ein Programm, welche Behandlungsdaten zu welchem Patienten gehören.</p>
${w.behandlung}
<p>Ab Zeile ${w.secondFrom} folgen Stammdaten und Behandlungsdaten der zweiten Patientin im selben Aufbau.</p>
<details class="raw-file"><summary>Die komplette Datei als Text anzeigen (${w.lines} Zeilen)</summary>
<pre><code>${w.raw}</code></pre>
</details>

<h2 id="unterschiede">Was bei BDT anders ist als bei LDT</h2>
<ul>
<li><strong>Datum:</strong> BDT schreibt TTMMJJJJ ${src("bdt3", "Feld 3103, S. 71")}, LDT 3 dagegen JJJJMMTT. ${src("ldt3", "Feld 3103")}</li>
<li><strong>Adresse:</strong> In BDT stehen Postleitzahl und Ort zusammen in Feld 3106, Straße und Hausnummer zusammen in Feld 3107. ${src("bdt3", "S. 72")} In LDT 3 hat jede Angabe ein eigenes Feld innerhalb eines Anschrift-Objekts. ${src("ldt3", "Kap. 11, Obj_0007")}</li>
<li><strong>Inhalt:</strong> LDT transportiert Aufträge und Befunde zwischen Praxis und Labor. ${src("ldt3", "Kap. 4")} BDT ist für den Export von Behandlungsdaten aus der Praxissoftware gedacht, zum Beispiel beim Wechsel der Praxissoftware. ${src("bdt3", "Kap. 2")} Den Überblick gibt <a href="${href("xdt-gdt-ldt-bdt/")}">xDT: GDT, LDT und BDT</a>.</li>
</ul>

<h2 id="fehler">Typischer Fehler: Satzlänge passt nicht</h2>
<p>Im klassischen Aufbau muss die Satzlänge in Feld 8100 zur tatsächlichen Länge des Satzes passen. Wird nachträglich eine Zeile gelöscht oder eingefügt, stimmt sie nicht mehr. Das zeigt die Datei <a href="${href("?beispiel=BDT_FEHLER_Satzlaenge.bdt")}">BDT_FEHLER_Satzlaenge.bdt</a>: Der Viewer meldet die Abweichung zeilengenau und nennt die wahrscheinliche Ursache. Wie Sie eine eigene BDT-Datei prüfen, steht unter <a href="${href("bdt-datei-oeffnen/")}">BDT-Datei öffnen</a>.</p>

<h2 id="entwickler">Hinweis für Entwickler</h2>
<p>Die BDT-3.0-Beschreibung ist ein Entwurf mit sichtbaren Änderungsmarkierungen. Gestrichene Einträge gelten nicht mehr. Ein Beispiel ist Feld 3109: Gültig ist „Hausnummer“, die frühere Bedeutung „Geschlecht des Patienten aus administrativer Sicht“ ist durchgestrichen. ${src("bdt3", "S. 72")} Ebenso sind die Felder zu Selektivverträgen von 3120–3124 auf 3130–3134 umnummeriert. ${src("bdt3", "S. 74")} Die <a href="${href("feldkennungen/")}">Feldkennungs-Referenz</a> enthält nur die gültigen Einträge.</p>
</div>
${faqHtml(faq)}
${ctaHtml("Eigene BDT-Datei ansehen", "Öffnen Sie einen Export aus Ihrer Praxissoftware im Viewer und vergleichen Sie ihn mit dem Beispiel. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["bdt-datei-oeffnen/", "was-ist-bdt/", "xdt-gdt-ldt-bdt/", "ldt-datei-beispiel/"])}
</main>`;

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "BDT-Beispieldateien mit erfundenen Testdaten",
    description: `Sammlung von ${LIST.length} BDT-Dateien (Behandlungsdatenträger, Datenexport aus Praxissoftware) im klassischen Aufbau mit erfundenen Patienten: Patientenstamm (Satzart 6100), Behandlungsdaten mit Laborwerten (Satzart 6200) und ein Fehlerbeispiel mit falscher Satzlänge.`,
    url: url(path),
    inLanguage: "de-DE",
    isAccessibleForFree: true,
    keywords: ["BDT", "Behandlungsdatenträger", "xDT", "Beispieldatei", "Testdatei", "Praxissoftware"],
    creator: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    dateModified: UPDATED,
    distribution: LIST.map((b) => ({ "@type": "DataDownload", name: b.title, contentUrl: url("beispiele/" + b.file), encodingFormat: "text/plain" })),
  };

  return {
    path,
    title,
    description,
    ogTitle: "BDT-Beispieldatei: Praxisdaten-Export Zeile für Zeile erklärt",
    ogType: "article",
    lastmod: UPDATED,
    jsonld: [articleLd({ headline: h1, description, path, updated: UPDATED }), dataset, faqLd(faq), breadcrumbLd(crumbs)],
    body,
    minInternalLinks: 3,
    llms: "BDT-Beispieldateien mit erfundenen Daten zum Download; ein BDT-Export im klassischen Aufbau (Satzarten 6100 Patientenstamm und 6200 Behandlungsdaten) Zeile für Zeile erklärt, Unterschiede zu LDT, Fehlerbeispiel Satzlänge 8100.",
  };
}
