import { href, heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src as srcAt } from "../lib/layout.mjs";

const path = "kbv-pruefmodul-testdateien/";
const crumbs = [["LDT & BDT Viewer", ""], ["KBV-Prüfmodul und Testdateien", path]];
const title = "KBV-Prüfmodul und Testdateien für LDT 3 (XPM-LDK)";
const description = "Wo es das KBV-Prüfmodul XPM-LDK und die offiziellen LDT-3-Testdateien gibt, wofür sie gedacht sind und was der LDT & BDT Viewer anders macht.";
const h1 = "KBV-Prüfmodul und KBV-Testdateien für LDT 3";
const UPDATED = "2026-11-05";
const ABRUF = "05.11.2026";
const src = (k, d, s = "12.10.2026") => srcAt(k, d, s);

// Inhalt des KBV-Verzeichnisses „Labordatenkommunikation“ am 05.11.2026 (Dateiname, Datum, Größe laut Verzeichnisliste)
const DATEIEN = [
  ["LDT3.2.20_Testdateien LDT-KBV.zip", "02.09.2026", "3,4 MB", "Testdateien der KBV zu LDT 3.2.20"],
  ["XPM-LDK.praxis-2.20.0.zip", "14.08.2026", "69 MB", "Prüfmodul Labordatenkommunikation, Paket „praxis“"],
  ["XPM-LDK.KV-2.20.0.zip", "14.08.2026", "68 MB", "Prüfmodul Labordatenkommunikation, Paket „KV“"],
  ["EXT_ITA_VGEX_LDT 3_2_20_Gesamtdokument.pdf", "14.08.2026", "8,9 MB", "LDT-3-Satzbeschreibung 3.2.20"],
  ["KBV_ITA_AHEX_Pruefpaket_LDK.pdf", "27.11.2023", "639 KB", "Prüfpaket Labordatenkommunikation (Zertifizierung)"],
  ["KBV_ITA_VGEX_FAQ_LDK.pdf", "15.11.2023", "373 KB", "FAQ für Softwarehersteller"],
];

// Dateien im Testdaten-Archiv (lokal entpackt und geprüft; nur die Namen, keine Inhalte)
const TESTDATEIEN = [
  ["Z01_UseCase01_Auftrag_UseCase1_FA_LG.ldt", "Laborauftrag"],
  ["Z01_UseCase05_Befund_mitPDF.ldt", "Befund mit eingebettetem PDF"],
  ["Z01_UseCase06_Befund_mitPDF.ldt", "Befund mit eingebettetem PDF"],
  ["Z01_UseCase09_Befund_mitPDF_ohneUnterschrift.ldt", "Befund mit PDF ohne Unterschrift"],
  ["Z01_UseCase12_Storno_Auftrag.ldt", "Stornierung eines Auftrags"],
  ["Z01_UseCase13_Auftrag323_323.ldt", "Laborauftrag"],
  ["Z01_UseCase14_Befund_Obj_0073_mit_PDF.ldt", "Befund mit Obj_0073 und PDF"],
  ["Z01_UseCase15_Befund_mit_PDF.ldt", "Befund mit PDF"],
  ["Z01_UseCase17_Muster39.ldt", "Auftrag mit Muster 39"],
];

const faq = [
  {
    q: "Muss die Praxissoftware das KBV-Prüfmodul verwenden?",
    a: `Ja. Laut KBV muss das LDK-Prüfmodul in allen Systemen zur Prüfung exportierter und zu importierender Dateien eingebunden sein, und die Prüfung ist standardmäßig aktiviert. ${src("faq", "Kap. 2")}`,
  },
  {
    q: "Prüft das KBV-Prüfmodul alle Regeln der LDT-Spezifikation?",
    a: `Nein. Regeln mit dem Status „SV“ gelten nur außerhalb der kassenärztlichen Versorgung und werden laut Spezifikation nicht im Prüfmodul der KBV geprüft; das muss die jeweilige Software selbst tun. ${src("ldt3", "Kap. 6.5")}`,
  },
  {
    q: "Kann ich die KBV-Testdateien im LDT & BDT Viewer öffnen?",
    a: "Ja. Laden Sie das Archiv bei der KBV, entpacken Sie es und ziehen Sie eine Datei in den Viewer. Bei Befunden mit eingebettetem PDF erscheint oben „Die Datei enthält ein eingebettetes Dokument“ mit „Öffnen“ und „Speichern“. Der Viewer liest die Dateien nur im Browser.",
  },
  {
    q: "Ersetzt der Viewer das KBV-Prüfmodul?",
    a: "Nein. Der Viewer zeigt Inhalte an und erklärt Fehler in einfacher Sprache. Für die Zertifizierung und die Pflichtprüfung in der Praxissoftware gilt das Prüfmodul der KBV.",
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `Das <strong>KBV-Prüfmodul XPM-LDK</strong> und die <strong>KBV-Testdateien</strong> stehen kostenlos im Update-Verzeichnis „Labordatenkommunikation“ der KBV. ${src("kbvLdk", "", ABRUF)} Das Prüfmodul muss in jeder zertifizierten Software eingebunden sein, die LDT-Dateien erzeugt oder einliest. ${src("faq", "Kap. 2")} Diese Seite zeigt, was dort liegt und wie es sich vom LDT &amp; BDT Viewer unterscheidet.`,
  minutes: 5,
})}
<div class="prose">
<h2 id="downloads">Was die KBV bereitstellt</h2>
<p>Im Verzeichnis <a href="https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/">update.kbv.de/ita-update/Labor/Labordatenkommunikation</a> lagen am ${ABRUF} unter anderem diese Dateien:</p>
<div class="table-wrap"><table>
<caption>Dateien im KBV-Verzeichnis Labordatenkommunikation</caption>
<thead><tr><th scope="col">Datei</th><th scope="col">Inhalt</th><th scope="col">Datum</th><th scope="col">Größe</th></tr></thead>
<tbody>
${DATEIEN.map(([f, inhalt, d, g]) => `<tr><td><code>${f}</code></td><td>${inhalt}</td><td>${d}</td><td>${g}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${src("kbvLdk", "Verzeichnisliste", ABRUF)} Das Prüfmodul liegt in zwei Paketen vor, „praxis“ und „KV“, beide in Version 2.20.0.</p>

<h2 id="pruefmodul">Das Prüfmodul: Pflicht in der Praxissoftware</h2>
<ul>
<li><strong>Immer eingebunden:</strong> Das LDK-Prüfmodul muss in allen Systemen zur Prüfung der exportierten bzw. zu importierenden Dateien eingebunden sein. ${src("faq", "Kap. 2")}</li>
<li><strong>Standardmäßig an:</strong> Die Prüfung ist standardmäßig zu aktivieren, auch wenn Kunden sie ausschalten könnten. ${src("faq", "Kap. 2")}</li>
<li><strong>Nicht alle Regeln:</strong> Regeln mit dem Status „SV“ gelten nur außerhalb der kassenärztlichen Versorgung und werden nicht im Prüfmodul der KBV geprüft. ${src("ldt3", "Kap. 6.5")}</li>
<li><strong>Zertifizierung:</strong> Für die Zertifizierung reicht ein Hersteller LDT-Dateien zu festgelegten Prüffällen ein, benannt nach dem Muster <code>z01PF07.ldt</code>. Sie müssen fehlerfrei gegen das aktuelle Prüfschema der KBV validierbar sein. ${src("pruefpaket", "Kap. 1.5.3")}</li>
</ul>

<h2 id="testdateien">Die KBV-Testdateien für LDT 3.2.20</h2>
<p>Das Archiv mit den Testdateien enthält in der Fassung vom 02.09.2026 neun LDT-Dateien. Ihre Namen beschreiben den Anwendungsfall:</p>
<div class="table-wrap"><table>
<caption>Dateien im Archiv „LDT3.2.20_Testdateien LDT-KBV.zip“</caption>
<thead><tr><th scope="col">Datei</th><th scope="col">Anwendungsfall laut Dateiname</th></tr></thead>
<tbody>
${TESTDATEIEN.map(([f, a]) => `<tr><td><code>${f}</code></td><td>${a}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${src("kbvLdk", "Archiv vom 02.09.2026", ABRUF)} Fünf der Befund-Dateien bringen den Laborbefund als eingebettetes PDF mit. Im <a href="${href()}">Viewer</a> erscheint es mit „Öffnen“ und „Speichern“; wie das funktioniert, steht unter <a href="${href("ldt-datei-oeffnen/#pdf")}">LDT-Datei in PDF umwandeln</a>. Eigene Beispieldateien mit erfundenen Daten und Fehlerbeispielen bietet diese Website unter <a href="${href("ldt-datei-beispiel/")}">LDT-Beispieldateien</a>; sie stehen unter CC0 und dürfen frei verwendet werden.</p>

<h2 id="unterschied">Prüfmodul oder Viewer: wofür was?</h2>
<div class="table-wrap"><table>
<caption>KBV-Prüfmodul und LDT &amp; BDT Viewer im Vergleich</caption>
<thead><tr><th scope="col">Merkmal</th><th scope="col">KBV-Prüfmodul XPM-LDK</th><th scope="col">LDT &amp; BDT Viewer</th></tr></thead>
<tbody>
<tr><td>Zweck</td><td>verbindliche Prüfung in zertifizierter Software</td><td>Datei ansehen, verstehen, Fehler eingrenzen</td></tr>
<tr><td>Einsatz</td><td>eingebunden in Praxis- und Laborsoftware</td><td>im Browser, ohne Installation und ohne Upload</td></tr>
<tr><td>Ergebnis</td><td>Prüfergebnis innerhalb der Software</td><td>Laborwerte als Tabelle, Struktur, Meldungen in einfacher Sprache mit wahrscheinlicher Ursache</td></tr>
<tr><td>Formate</td><td>Dateien der Labordatenkommunikation (LDT 3)</td><td>LDT 3, LDT 2, BDT, dazu Erkennung von KVDT, GDT und EULUMDAT</td></tr>
<tr><td>Verbindlichkeit</td><td>Pflicht für die Zertifizierung</td><td>keine; ersetzt das Prüfmodul nicht</td></tr>
</tbody></table></div>
<p>${src("faq", "Kap. 2")} Was der Viewer im Einzelnen prüft und was nicht, steht unter <a href="${href("fehler/#grenzen")}">Fehler in LDT-Dateien</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("Testdatei ansehen", "Ziehen Sie eine KBV-Testdatei oder Ihre eigene LDT-Datei in den Viewer. Sie bleibt auf Ihrem Rechner.")}
${relatedHtml(["fehler/", "ldt-datei-beispiel/", "ldt-datei-oeffnen/", "ldt-2-vs-ldt-3/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogType: "article",
  lastmod: UPDATED,
  jsonld: [articleLd({ headline: h1, description, path, updated: UPDATED, published: UPDATED }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "KBV-Prüfmodul XPM-LDK (Pakete praxis und KV, Version 2.20.0 vom 14.08.2026) und KBV-Testdateien zu LDT 3.2.20 (Archiv vom 02.09.2026, neun Dateien, u. a. Befunde mit PDF, Storno, Muster 39): wo es sie gibt, Pflicht zum Einbinden des Prüfmoduls, SV-Regeln nicht im Prüfmodul, Prüffall-Dateinamen z01PFnn.ldt, Unterschied zum Viewer.",
};
