import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src, href } from "../lib/layout.mjs";

const path = "xdt-gdt-ldt-bdt/";
const crumbs = [["LDT & BDT Viewer", ""], ["xDT: GDT, LDT, BDT", path]];
const title = "xDT Schnittstelle: GDT, LDT, BDT im Überblick";
const description = "xDT-Schnittstelle erklärt: GDT, LDT und BDT im Vergleich, gemeinsamer Zeilenaufbau, gleiche Feldkennungen und wie Sie das Format einer Datei erkennen.";
const h1 = "xDT-Schnittstelle: GDT, LDT und BDT im Überblick";
const GDT_VIEWER = "https://freimoser.github.io/gdt-viewer/";

const faq = [
  {
    q: "Gibt es eine Datei im Format xDT?",
    a: "Nein. xDT bezeichnet die Familie der Standards. Eine konkrete Datei folgt immer einer bestimmten Beschreibung, etwa GDT, LDT oder BDT, und welche das ist, verrät die Satzart in Feld 8000. GDT-Dateien öffnen Sie im <a href=\"" + GDT_VIEWER + "\">GDT Viewer</a>, LDT- und BDT-Dateien im <a href=\"" + href() + "\">Viewer auf dieser Website</a>.",
  },
  {
    q: "Wer legt fest, was eine Feldkennung bedeutet?",
    a: "Die KBV führt den Feldkatalog aller Felder der xDT-Familie und achtet darauf, dass gleiche Inhalte dieselbe Feldkennung und Feldbezeichnung bekommen. Umfasst der Wertevorrat eines Feldes in BDT 3.0 mehr Werte als der Feldkatalog, gilt laut QMS für BDT die BDT-3.0-Definition.",
  },
  {
    q: "Hat dieselbe Feldkennung überall dasselbe Format?",
    a: "Nicht immer. Das Geburtsdatum in Feld 3103 steht in LDT 2 und LDT 3 als JJJJMMTT, in BDT 3.0 und im Beispiel der GDT-2.1-Beschreibung als TTMMJJJJ. Wer Daten zwischen Formaten überträgt, muss solche Unterschiede umrechnen.",
  },
  {
    q: "Sollen GDT, LDT und BDT zu einem Standard zusammenwachsen?",
    a: "Die BDT-3.0-Beschreibung des QMS von 2015 nennt eine Angleichung von BDT, GDT und LDT als Ziel, damit mittelfristig aus der xDT-Familie ein einheitlicher Standard entstehen kann. Heute gibt es weiterhin drei getrennte Beschreibungen: GDT und BDT beim QMS, LDT bei der KBV.",
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>xDT ist</strong> eine Familie von Datensatzbeschreibungen für den Datenaustausch von Praxissoftware, zu der GDT, LDT und BDT gehören. Alle nutzen denselben Zeilenaufbau aus Länge, Feldkennung und Inhalt, und den Feldkatalog aller Felder der xDT-Familie führt die Kassenärztliche Bundesvereinigung (KBV). ${src("bdt3", "Kap. 2 und 3.3")}`,
  minutes: 6,
})}
<div class="prose">
<p>Welches Werkzeug Sie brauchen, hängt vom Format ab: GDT-Dateien aus der Geräteanbindung öffnen Sie im <a href="${GDT_VIEWER}">GDT Viewer</a>, LDT-Laborbefunde und BDT-Exporte im <a href="${href()}">LDT &amp; BDT Viewer</a>. Die Grundlagen der einzelnen Formate erklären die Seiten <a href="${href("was-ist-ldt/")}">Was ist LDT?</a>, <a href="${href("was-ist-bdt/")}">Was ist BDT?</a> und <a href="https://freimoser.github.io/gdt-viewer/wissen/was-ist-gdt.html">Was ist GDT?</a>.</p>

<h2>GDT, LDT und BDT im Vergleich</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Format</th><th scope="col">Zweck</th><th scope="col">Richtung</th><th scope="col">Wer pflegt es</th><th scope="col">Version laut Quelle</th><th scope="col">Passendes Tool</th></tr></thead>
<tbody>
<tr><td><strong>GDT</strong><br>Gerätedatentransfer</td><td>verbindet Praxissoftware und medizinische Geräte</td><td>beide Richtungen: z. B. 6302 Untersuchung anfordern (Praxis → Gerät), 6310 Untersuchungsdaten übermitteln (Gerät → Praxis)</td><td>QMS</td><td>im Markt gängig: GDT 2.1, 3.1 und 3.5</td><td><a href="${GDT_VIEWER}">GDT Viewer</a></td></tr>
<tr><td><strong>LDT</strong><br>Labordatenträger</td><td>Laboraufträge und Befundberichte</td><td>Auftrag Praxis → Labor, Befund Labor → Praxis</td><td>KBV</td><td>LDT 3.2.20, in Kraft seit 01.10.2026</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td><strong>BDT</strong><br>Behandlungsdatentransfer, früher Behandlungsdatenträger</td><td>systemunabhängiger Export von Praxisdaten, vor allem beim Softwarewechsel</td><td>bisheriges System → neues System</td><td>QMS (seit 2011), entwickelt vom ZI</td><td>BDT 3.0, Version 0.96 (Entwurf)</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
</tbody>
</table></div>
<p>${src("qms")} ${src("gdt", "Kap. 3")} ${src("ldt3", "S. 1–2, Kap. 4 und 5.1")} ${src("bdt3", "S. 2 und Kap. 2")}</p>
<div class="callout"><span class="callout-title">GDT-Datei? Dafür gibt es den GDT Viewer</span><p>Steht in Ihrer Datei eine der Satzarten 6300, 6301, 6302, 6310 oder 6311, handelt es sich um eine GDT-Datei aus der Geräteanbindung. Öffnen Sie sie im kostenlosen <a href="${GDT_VIEWER}"><strong>GDT Viewer</strong></a>. Er zeigt die Felder mit Bedeutung an, erzeugt Testdateien und arbeitet ebenfalls vollständig im Browser.</p></div>

<h2>Der gemeinsame Zeilenaufbau</h2>
<p>In allen drei Formaten ist jede Zeile ein Feld: 3 Ziffern Länge, 4 Ziffern Feldkennung, der Inhalt und am Ende Wagenrücklauf und Zeilenvorschub (CR LF). Die Länge ist immer Inhalt plus 9. ${src("ldt3", "Kap. 6.4.1")} ${src("bdt3", "Kap. 3.3")} Die GDT-2.1-Beschreibung erklärt das an dieser Zeile: ${src("gdt", "Kap. 2.6.1")}</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Zeile</th><th scope="col">Länge</th><th scope="col">Feldkennung</th><th scope="col">Inhalt</th><th scope="col">Rechnung</th></tr></thead>
<tbody>
<tr><td><code>0163101Schmidt</code></td><td>016</td><td>3101 (Nachname)</td><td>Schmidt</td><td>7 Zeichen + 9 = 16</td></tr>
</tbody>
</table></div>
<p>Weil der Aufbau gleich ist, sehen GDT-, LDT- und BDT-Dateien im Texteditor fast identisch aus. Vor allem die Satzarten verraten, welches Format vorliegt.</p>

<h2>Gemeinsame Feldkennungen</h2>
<p>Feldkennungen sind in der xDT-Familie prinzipiell gleich benannt und gleich gemeint, Feldkennung 3000 steht zum Beispiel für die Patientennummer. Regeln und erlaubte Werte können sich aber je nach Standard und Satzart unterscheiden. ${src("bdt3", "Kap. 2")}</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Feldkennung</th><th scope="col">Bedeutung</th><th scope="col">GDT 2.1</th><th scope="col">LDT 2</th><th scope="col">LDT 3</th><th scope="col">BDT 3.0</th></tr></thead>
<tbody>
<tr><td>8000</td><td>Satzart</td><td>erstes Feld jedes Satzes</td><td>erstes Feld jedes Satzes</td><td>erstes Feld jedes Satzes</td><td>erstes Feld jedes Satzes</td></tr>
<tr><td>3000</td><td>Patientennummer</td><td>ja</td><td>nicht in der Feldtabelle 5.12</td><td>ja</td><td>ja</td></tr>
<tr><td>3101</td><td>Nachname</td><td>ja</td><td>ja</td><td>ja</td><td>ja</td></tr>
<tr><td>3102</td><td>Vorname</td><td>ja</td><td>ja</td><td>ja</td><td>ja</td></tr>
<tr><td>3103</td><td>Geburtsdatum</td><td>TTMMJJJJ (Beispiel <code>01101945</code>)</td><td>JJJJMMTT (Beispiel <code>19661024</code>)</td><td>JJJJMMTT</td><td>TTMMJJJJ</td></tr>
</tbody>
</table></div>
<p>${src("gdt", "Kap. 2.6.2 und 3")} ${src("ldt2", "Kap. 2.3.3, 2.4.2 und 4.1")} ${src("ldt3", "Kap. 6.3, 9, Regel F003")} ${src("bdt3", "Kap. 3.4.1, 3.7.5 und Feldtabelle")}</p>
<p>Praktisch heißt das: Ein Geburtsdatum aus einem BDT-Export lässt sich nicht unverändert in ein LDT-Feld übernehmen, Tag und Jahr stehen in umgekehrter Reihenfolge. Alle Kennungen mit Länge und Typ stehen in der Referenz <a href="${href("feldkennungen/")}">Feldkennungen</a>.</p>

<h2>Was die Formate unterscheidet</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Merkmal</th><th scope="col">GDT 2.1</th><th scope="col">LDT 3</th><th scope="col">BDT 3.0</th></tr></thead>
<tbody>
<tr><td>Satzarten</td><td>6300, 6301, 6302, 6310, 6311</td><td>8220, 8221, 8230, 8231, 8205, 8215</td><td>u. a. 0001, 0020, 0010, 6100, 6200, 0021, 0002, adrs, term</td></tr>
<tr><td>Satzrahmen</td><td>8000 Satzart, danach 8100 Satzlänge</td><td>8000 Satzart, am Ende 8001 Satzende</td><td>8000 Satzart, am Ende 8202 Satzende (Anzahl der Felder)</td></tr>
<tr><td>Versionsfeld</td><td>9218</td><td>0001, z. B. <code>LDT3.2.20</code></td><td>0001, im Beispiel <code>BDT3.00</code></td></tr>
<tr><td>Zeichensatz</td><td>IBM-Codepage 437, weitere möglich (Angabe in Feld 9206)</td><td>nur ISO 8859-15</td><td>ISO/IEC 8859-15</td></tr>
<tr><td>Dateiname</td><td>wird bei der Installation eindeutig festgelegt</td><td><code>Z01</code> + frei wählbar + <code>.ldt</code>, verbindlich</td><td><code>&lt;Beliebiger_Text&gt;.BDT</code></td></tr>
</tbody>
</table></div>
<p>${src("gdt", "Kap. 2.2, 2.3.1 und 3")} ${src("ldt3", "Kap. 6.2, 6.3, 6.6 und 6.7")} ${src("bdt3", "Kap. 2.1, 3.2, 3.6.1 und 8.1")}</p>
<p>Ältere Fassungen ähneln hier GDT 2.1: LDT 2 und der klassische BDT-Aufbau tragen die Satzlänge ebenfalls in Feld 8100 als zweitem Feld. ${src("ldt2", "Kap. 2.3.3")} ${src("giessen")} Die Unterschiede innerhalb von LDT stehen im Vergleich <a href="${href("ldt-2-vs-ldt-3/")}">LDT 3 und LDT 2</a>.</p>
<p>Berührungspunkte gibt es auch zur Abrechnung: Für Abrechnungsnotizen nennt BDT 3.0 die Abrechnungs-Satzarten des KVDT (0101 bis 0104, 0109, sad1 bis sad3); Abrechnungsnotizen im xDT-Format werden innerhalb des BDT-Exports übertragen. ${src("bdt3", "Kap. 3.6.1")}</p>

<h2>Welches Format hat meine Datei?</h2>
<p>Entscheidend ist der Inhalt von Feld 8000, die Satzart. Öffnen Sie die Datei in einem Texteditor und suchen Sie die Zeilen, deren Zeichen 4 bis 7 „8000“ lauten. Die Ziffern dahinter sagen Ihnen, womit Sie es zu tun haben:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Satzart in Feld 8000</th><th scope="col">Format</th><th scope="col">Öffnen mit</th></tr></thead>
<tbody>
<tr><td>6300, 6301, 6302, 6310, 6311</td><td>GDT</td><td><a href="${GDT_VIEWER}">GDT Viewer</a></td></tr>
<tr><td>8205 oder 8215</td><td>LDT 3 (Befund oder Auftrag)</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td>8201, 8202, 8203, 8204, 8218 oder 8219</td><td>LDT 2</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td>8220, 8221, 8230, 8231</td><td>LDT, Kopf- oder Abschlusssatz (in LDT 2 und LDT 3)</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td>6100 oder 6200</td><td>BDT (Patientenstamm, Behandlungsdaten)</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td>0001 oder 0010</td><td>BDT (in BDT 3.0 Kommunikations-Header bzw. Praxisstammdaten)</td><td><a href="${href()}">LDT &amp; BDT Viewer</a></td></tr>
<tr><td>0020 oder 0021</td><td>nicht eindeutig: Datenträger-Header in LDT 2, Datei-Header in BDT 3.0</td><td>weitere Satzarten ansehen</td></tr>
</tbody>
</table></div>
<p>${src("gdt", "Kap. 3")} ${src("ldt2", "Kap. 2.3.1")} ${src("ldt3", "Kap. 6.2")} ${src("bdt3", "Kap. 3.6.1")} ${src("giessen")}</p>
<p>Schneller geht es mit dem Viewer: Er erkennt LDT 2, LDT 3, BDT und GDT automatisch und verweist bei GDT auf den GDT Viewer. Schritt für Schritt zeigen das die Anleitungen <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a> und <a href="${href("bdt-datei-oeffnen/")}">BDT-Datei öffnen</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("LDT- oder BDT-Datei öffnen", "Der Viewer erkennt Format, Version und Zeichensatz selbst und zeigt Sätze, Felder und Werte. Für GDT-Dateien nutzen Sie den GDT Viewer.")}
${relatedHtml(["was-ist-ldt/", "was-ist-bdt/", "ldt-2-vs-ldt-3/", "feldkennungen/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogTitle: "xDT-Schnittstelle: GDT, LDT und BDT einfach erklärt",
  ogDescription: "Die xDT-Familie im Überblick: wofür GDT, LDT und BDT da sind, was sie gemeinsam haben, wie sie sich unterscheiden und welches Tool zu Ihrer Datei passt.",
  ogType: "article",
  jsonld: [articleLd({ headline: h1, description, path }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Überblick über die xDT-Familie: GDT (Geräte, QMS), LDT (Labor, KBV) und BDT (Praxisdaten-Export, QMS) mit Zweck, Richtung, Pflege und Version, gemeinsamem Zeilenaufbau, gemeinsamen Feldkennungen 3000/3101/3102/3103/8000, Unterschieden und Erkennung über die Satzart; GDT-Dateien öffnet der GDT Viewer.",
};
