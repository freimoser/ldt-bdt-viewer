import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src, href } from "../lib/layout.mjs";

const path = "was-ist-ldt/";
const crumbs = [["LDT & BDT Viewer", ""], ["Was ist LDT?", path]];
const title = "LDT Labordatenträger: Definition, Versionen, Ablauf";
const description = "LDT (Labordatenträger) einfach erklärt: KBV-Standard für Laboraufträge und Befunde, Versionen LDT 2 und 3.2.20, Satzarten, Dateiaufbau und Dateiname.";
const h1 = "LDT (Labordatenträger): Definition, Versionen und Ablauf";

const faq = [
  {
    q: "Wofür steht die Abkürzung LDT?",
    a: "LDT steht für Labordatenträger. Die ältere LDT-2-Beschreibung der KBV regelt noch den Versand auf Disketten. Für LDT 3 geht die KBV dagegen davon aus, dass keine Datenträger mehr verschickt werden, sondern komplett elektronisch über installierte Infrastruktur übertragen wird.",
  },
  {
    q: "Ersetzt der LDT-Auftrag den Überweisungsschein Muster 10?",
    a: "Nein. Laut FAQ der KBV gilt nur das Muster als abrechnungsbegründende Unterlage, entweder auf Papier oder in digitaler Form, nicht der LDT-Auftrag. Der LDT-Auftrag transportiert die Anforderung strukturiert an das Labor.",
  },
  {
    q: "Kann eine LDT-Datei mehrere Befunde enthalten?",
    a: "Ja. In einer Befunddatei folgen auf den Kopfsatz 8220 beliebig viele Befundsätze 8205, bevor der Abschlusssatz 8221 die Datei beendet. Jede Datei muss aber separat erzeugt und eingelesen werden.",
  },
  {
    q: "Sind LDT-Dateien verschlüsselt?",
    a: "Nein, nicht durch das Format selbst. Die LDT-3-Satzbeschreibung beschränkt sich ausdrücklich auf die reine Datenübertragung und sieht keine Verschlüsselung vor. Schutzmechanismen müssen die eingesetzten Programme und Übertragungswege bereitstellen.",
  },
  {
    q: "Wo bekomme ich offizielle LDT-Testdateien?",
    a: "Die KBV stellt im <a href=\"https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/\">Update-Verzeichnis Labordatenkommunikation</a> ein ZIP-Archiv mit Testdateien zu LDT 3.2.20 bereit. Erfundene Testdateien für LDT 3 und LDT 2 erzeugt außerdem der <a href=\"" + href("#generator") + "\">Generator im Viewer</a>.",
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>LDT (Labordatenträger) ist</strong> das Datenformat der Kassenärztlichen Bundesvereinigung (KBV), mit dem Arztpraxen Laboraufträge elektronisch an ein Labor senden und Labore ihre Befundberichte zurückschicken. ${src("ldt3", "Kap. 4 und 5.1")}`,
  minutes: 6,
})}
<div class="prose">
<h2>Wer gibt den LDT heraus?</h2>
<p>Der LDT ist ein Standard der sogenannten xDT-Familie und wird von der KBV gepflegt und weiterentwickelt, genauer vom Dezernat Digitalisierung und IT. ${src("ldt3", "Titelblatt und Kap. 4")}</p>
<p>Zwei Begriffe aus der Spezifikation sollten Sie kennen: Der <strong>Einsender</strong> ist die Einrichtung, die einen Untersuchungsauftrag und das Material an ein Labor schickt, meist die Arztpraxis. ${src("ldt3", "Kap. 3.4")} Als <strong>Labor</strong> gelten zum Beispiel Praxen, in denen der Patient in der Regel nicht vorstellig wird und eingesandtes Körpermaterial untersucht wird, MVZ mit eigenem Laboratorium oder Laborgemeinschaften. ${src("ldt3", "Kap. 3.5")}</p>
<p>Mit GDT (Geräteanbindung) und BDT (Datenexport aus der Praxissoftware) teilt LDT den gleichen Zeilenaufbau. Wie die drei Formate zusammenhängen, zeigt der <a href="${href("xdt-gdt-ldt-bdt/")}">Überblick über die xDT-Schnittstelle</a>.</p>

<h2>Welche LDT-Versionen gibt es?</h2>
<p>Im Umlauf sind zwei Generationen. Jede LDT-Datei trägt eine Versionskennung, an der Sie erkennen, nach welcher Beschreibung sie erstellt wurde.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Generation</th><th scope="col">Grundlage</th><th scope="col">Kennung in der Datei</th><th scope="col">Status</th></tr></thead>
<tbody>
<tr><td>LDT 2.x</td><td>KBV-Datensatzbeschreibung LDT, Version 5.12 vom 03.05.2017</td><td>Feld 9212 = <code>LDT1014.01</code></td><td>Zertifizierung seit 01.01.2016 nicht mehr möglich</td></tr>
<tr><td>LDT 3.x</td><td>KBV LDT 3 Satzbeschreibung, Version 3.2.20 vom 13.05.2026</td><td>Feld 0001 = <code>LDT3.2.20</code></td><td>in Kraft seit 01.10.2026, ersetzt 3.2.19</td></tr>
</tbody>
</table></div>
<p>${src("ldt2", "S. 1, Satzart 8220")} ${src("ldt3", "S. 1–2, Regel E001")} ${src("faq", "Kap. 2")}</p>
<p>Was sich zwischen beiden Generationen geändert hat, von den Satzarten bis zur Prüfsumme, steht im ausführlichen Vergleich <a href="${href("ldt-2-vs-ldt-3/")}">LDT 3 und LDT 2</a>. Die folgenden Abschnitte beschreiben LDT 3.</p>

<h2>So läuft der Austausch zwischen Praxis und Labor</h2>
<p>Eine LDT-Datei besteht aus <strong>Sätzen</strong>. Ein Satz ist ein zusammengehöriger Block von Zeilen, etwa der Kopf einer Sendung oder ein einzelner Befund. LDT 3 kennt sechs Satzarten, und für jede Richtung ist festgelegt, welche Satzarten in welcher Reihenfolge vorkommen. ${src("ldt3", "Kap. 6.2")}</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Richtung</th><th scope="col">Erster Satz</th><th scope="col">Inhalt</th><th scope="col">Letzter Satz</th></tr></thead>
<tbody>
<tr><td>Auftrag: Praxis → Labor</td><td>8230 P-Datenpaket-Header (einmal)</td><td>8215 Auftrag (mindestens einmal)</td><td>8231 P-Datenpaket-Abschluss (einmal)</td></tr>
<tr><td>Befund: Labor → Praxis</td><td>8220 L-Datenpaket-Header (einmal)</td><td>8205 Befund (mindestens einmal, beliebige Reihenfolge)</td><td>8221 L-Datenpaket-Abschluss (einmal)</td></tr>
</tbody>
</table></div>
<p>${src("ldt3", "Kap. 6.2.2 und 6.2.3")}</p>
<p>Im Praxisalltag sieht das so aus:</p>
<ol>
<li><strong>Auftrag erstellen:</strong> Die Praxissoftware schreibt die Laboranforderung als Auftragsdatei (8230, 8215, 8231) und überträgt sie an das Labor. Abrechnungsbegründend bleibt dabei das Muster auf Papier oder in digitaler Form, nicht der LDT-Auftrag. ${src("faq", "Kap. 2")}</li>
<li><strong>Untersuchen:</strong> Das Labor liest den Auftrag in sein Laborsystem ein und untersucht das eingesandte Material.</li>
<li><strong>Befund senden:</strong> Das Labor schickt die Ergebnisse als Befunddatei (8220, 8205, 8221) zurück. Die Arbeitsgemeinschaft LDT empfiehlt, immer eine PDF-Datei des Befundes in den Befundsatz 8205 einzubetten. ${src("ldt3", "Fußnote 7 zu Kap. 8.5")}</li>
<li><strong>Einlesen:</strong> Die Praxissoftware liest die Datei ein und ordnet die Werte dem Patienten zu. Jede Datei muss separat erzeugt und eingelesen werden. ${src("ldt3", "Kap. 6.2.1")}</li>
</ol>
<p>Der LDT selbst verschlüsselt nichts. Er beschränkt sich auf die reine Datenübertragung; Schutz müssen die beteiligten Programme und Übertragungswege liefern. ${src("ldt3", "Kap. 4")}</p>
<p>Kommt ein Befund nicht an oder lässt er sich nicht einlesen, hilft die Anleitung <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a>. Typische Ursachen und ihre Lösung erklärt die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>.</p>

<h2>Aufbau einer LDT-Datei</h2>
<p>Eine LDT-Datei ist eine Textdatei. Sie besteht aus Sätzen, die Sätze bestehen aus Feldern, und in LDT 3 werden zusammengehörige Felder zusätzlich zu <strong>Objekten</strong> gebündelt. ${src("ldt3", "Kap. 6.1")}</p>
<h3>Jede Zeile ist ein Feld</h3>
<p>Ein Feld hat immer vier Teile: 3 Zeichen Länge, 4 Zeichen Feldkennung, den Inhalt und am Ende Wagenrücklauf und Zeilenvorschub (CR LF). Die Länge ist immer die Zahl der Inhaltszeichen plus 9. Leere Felder sind nicht zulässig. ${src("ldt3", "Kap. 6.4.1")}</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Zeile</th><th scope="col">Länge</th><th scope="col">Feldkennung</th><th scope="col">Inhalt</th><th scope="col">Rechnung</th></tr></thead>
<tbody>
<tr><td><code>0178002Obj_0032</code></td><td>017</td><td>8002 (Objekt-ID)</td><td>Obj_0032</td><td>8 Zeichen + 9 = 17</td></tr>
</tbody>
</table></div>
<h3>Satz und Objekt</h3>
<p>Jeder Satz beginnt mit Feld 8000 (Satzart) und endet mit Feld 8001, das dieselbe Satzart wiederholt. Ein Objekt wird durch ein Objektattribut angekündigt (Feldkennungen 8100 bis 8299), beginnt mit Feld 8002 (Objekt-ID) und endet mit Feld 8003 mit derselben Objekt-ID. ${src("ldt3", "Kap. 6.3")}</p>
<p>Die Spezifikation zeigt das am Kopfsatz 8220 des Labors. Ein Ausschnitt mit dem Zeitstempel der Dateierstellung: ${src("ldt3", "Kap. 7, Implementierungshinweis")}</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Zeile</th><th scope="col">Feldkennung</th><th scope="col">Bedeutung</th></tr></thead>
<tbody>
<tr><td><code>01380008220</code></td><td>8000</td><td>Satz 8220 (L-Datenpaket-Header) beginnt</td></tr>
<tr><td><code>0188132Kopfdaten</code></td><td>8132</td><td>Objektattribut: Es folgen die Kopfdaten</td></tr>
<tr><td><code>0178002Obj_0032</code></td><td>8002</td><td>Objekt Obj_0032 (Kopfdaten) beginnt</td></tr>
<tr><td>…</td><td></td><td>u. a. die Version in Feld 0001 und das sendende System</td></tr>
<tr><td><code>0398218Timestamp_Erstellung_Datensatz</code></td><td>8218</td><td>Objektattribut: Zeitpunkt der Erstellung</td></tr>
<tr><td><code>0178002Obj_0054</code></td><td>8002</td><td>Objekt Obj_0054 (Zeitstempel) beginnt</td></tr>
<tr><td><code>017727820151008</code></td><td>7278</td><td>Datum im Format JJJJMMTT: 08.10.2015</td></tr>
<tr><td><code>0157279173510</code></td><td>7279</td><td>Uhrzeit 17:35:10</td></tr>
<tr><td><code>0147273UTC+2</code></td><td>7273</td><td>Zeitzone</td></tr>
<tr><td><code>0178003Obj_0054</code></td><td>8003</td><td>Objekt Obj_0054 endet</td></tr>
<tr><td><code>0178003Obj_0032</code></td><td>8003</td><td>Objekt Obj_0032 endet</td></tr>
<tr><td>…</td><td></td><td>Laborkennung und Betriebsstätte</td></tr>
<tr><td><code>01380018220</code></td><td>8001</td><td>Satz 8220 endet</td></tr>
</tbody>
</table></div>
<div class="callout"><span class="callout-title">Hinweis für Entwickler</span><p>Im selben Beispiel der Spezifikation steht die Versionszeile als <code>0170001LDT3.2.20</code>. Der Inhalt <code>LDT3.2.20</code> hat 9 Zeichen, nach der Längenregel müsste die Länge also 018 lauten. Übernehmen Sie Beispielzeilen deshalb nicht ungeprüft in eigene Testdaten. ${src("ldt3", "Kap. 6.4.1 und 7")}</p></div>
<p>Was eine bestimmte Kennung bedeutet, schlagen Sie in der Referenz <a href="${href("feldkennungen/")}">Feldkennungen</a> nach.</p>
<h3>Zeichensatz</h3>
<p>In LDT 3 darf nur der Zeichencode ISO 8859-15 verwendet werden. ${src("ldt3", "Kap. 6.6")} LDT 2 erlaubte noch vier Zeichensätze; welcher genutzt wird, steht dort in Feld 9106. ${src("ldt2", "Kap. 2.6, Feld 9106")} Der Zeichensatz legt fest, welches Byte für welchen Buchstaben steht; wird eine Datei mit einem anderen Zeichensatz gelesen, als sie geschrieben wurde, erscheinen Umlaute falsch. Der Viewer erkennt den Zeichensatz, lässt ihn umschalten und meldet, wenn Angabe und Umlaute nicht zusammenpassen.</p>
<h3>Dateiname</h3>
<p>Für LDT 3 ist der Dateiname verbindlich: Er beginnt mit <code>Z01</code>, danach folgen frei wählbare Zeichen (A–Z, 0–9, Unterstrich) und die Endung <code>.ldt</code>, insgesamt höchstens 256 Zeichen. Beispiel aus der Spezifikation: <code>Z0147112345M27_01.ldt</code>. ${src("ldt3", "Kap. 6.7")} In LDT 2 verrät der erste Buchstabe den Zeichensatz, etwa X für IBM-Codepage 437 wie in <code>X01L0505.LDT</code>. ${src("ldt2", "Kap. 2.7.3")}</p>
</div>
${faqHtml(faq)}
${ctaHtml("LDT-Datei ansehen", "Öffnen Sie einen Laborbefund im Viewer: Satzarten, Objekte und Werte werden lesbar angezeigt und geprüft. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["ldt-datei-oeffnen/", "ldt-2-vs-ldt-3/", "xdt-gdt-ldt-bdt/", "fehler/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogTitle: "Was ist LDT? Der Labordatenträger einfach erklärt",
  ogDescription: "Labordatenträger LDT: wer ihn pflegt, welche Versionen gelten, wie Auftrag und Befund zwischen Praxis und Labor laufen und wie eine LDT-Datei aufgebaut ist.",
  ogType: "article",
  jsonld: [articleLd({ headline: h1, description, path }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Was LDT (Labordatenträger) ist: KBV-Standard für Laboraufträge und Befunde, Versionen LDT 2.x und LDT 3.2.20, Satzarten 8230/8215/8231 und 8220/8205/8221, Feld- und Objektaufbau, Zeichensatz ISO 8859-15 und Dateiname.",
};
