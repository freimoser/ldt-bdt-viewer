import { breadcrumbHtml, breadcrumbLd, href, esc, LEGAL } from "../lib/layout.mjs";

const crumbs = [["LDT & BDT Viewer", ""], ["Datenschutz", "datenschutz/"]];
const STAND = "22.10.2026";

// Abschnittsnummern zentral vergeben, nie von Hand an die Überschriften (sonst doppelte Nummern bei Änderungen)
const ABSCHNITTE = ["verantwortlicher", "dateien", "hosting", "messung", "searchConsole", "speicherung", "kontakt", "rechte", "automatisiert"];
const nr = (k) => ABSCHNITTE.indexOf(k) + 1;
const h2 = (k, text) => `<h2 id="${k}">${nr(k)}. ${text}</h2>`;

const anschrift = [LEGAL.operator, LEGAL.street, [LEGAL.zip, LEGAL.city].filter(Boolean).join(" "), LEGAL.country].filter(Boolean).map(esc).join("<br>");

// noindex: Standardtext ohne Suchnutzen; über den Footer jeder Seite erreichbar
export default {
  path: "datenschutz/",
  noindex: true,
  title: "Datenschutz – LDT & BDT Viewer",
  description: "Datenschutzerklärung: Der LDT & BDT Viewer erhebt keine Daten. Dateien werden nur lokal im Browser verarbeitet. Hosting über GitHub Pages.",
  jsonld: [breadcrumbLd(crumbs)],
  body: `<main id="inhalt">
${breadcrumbHtml(crumbs)}
<header class="hero-article"><h1>Datenschutz</h1></header>
<div class="prose">
<div class="callout"><span class="callout-title">Das Wichtigste in drei Sätzen</span>
<p>Ihre LDT- und BDT-Dateien verlassen Ihren Rechner nicht: Der Viewer liest sie ausschließlich in Ihrem Browser, nichts wird hochgeladen. Diese Website setzt keine Cookies, misst nichts und lädt nichts von Drittanbietern. Verarbeitet werden nur die technischen Zugriffsdaten, die beim Abruf jeder Website beim Hoster GitHub anfallen.</p></div>

${h2("verantwortlicher", "Verantwortlicher")}
<p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO):</p>
<p>${anschrift}<br>E-Mail: ${esc(LEGAL.email)}</p>
<p>Weitere Angaben stehen im <a href="${href("impressum/")}">Impressum</a>.</p>

${h2("dateien", "Ihre Dateien und Patientendaten")}
<p>Wenn Sie eine LDT-, BDT- oder andere Datei öffnen, liest der Viewer sie mit JavaScript direkt in Ihrem Browser. Die Datei und ihr Inhalt werden nicht hochgeladen, nicht auf einem Server gespeichert und nicht an Dritte übermittelt. Das gilt auch für Gesundheitsdaten im Sinne von Art. 9 DSGVO, die in Laborbefunden und Praxisdaten enthalten sind: Sie werden ausschließlich auf Ihrem Gerät verarbeitet. Beim Schließen des Browser-Tabs ist die Datei aus dem Arbeitsspeicher entfernt. Exporte (CSV, JSON, anonymisierte Datei) erzeugt der Browser lokal als Download.</p>

${h2("hosting", "Hosting und Zugriffsdaten (GitHub Pages)")}
<p>Die Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA. Beim Aufruf der Seiten verarbeitet GitHub technisch notwendige Zugriffsdaten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit des Abrufs und die aufgerufene Adresse, um die Website auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in der sicheren und zuverlässigen Bereitstellung der Website. Auf diese Daten hat der Betreiber keinen Zugriff.</p>
<p>Dabei können Daten in die USA übermittelt werden. GitHub ist nach dem EU-U.S. Data Privacy Framework zertifiziert, für das die Europäische Kommission ein angemessenes Datenschutzniveau festgestellt hat (Art. 45 DSGVO). Einzelheiten beschreibt die <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">Datenschutzerklärung von GitHub</a>, Abschnitt „Data Privacy Framework“.</p>

${h2("messung", "Keine Messung, keine Cookies")}
<p>Diese Website verwendet keine Analyse- oder Tracking-Werkzeuge, setzt keine Cookies, lädt keine externen Schriften und bindet keine Inhalte von Drittanbietern ein. Es wird nicht gemessen, wer die Website besucht.</p>

${h2("searchConsole", "Google Search Console und Bing Webmaster Tools: keine Verarbeitung über diese Website")}
<p>Diese Website ist in der Google Search Console und in den Bing Webmaster Tools von Microsoft angemeldet. <strong>Dabei wird nichts in Ihrem Browser geladen und nichts über Sie an den Betreiber übermittelt.</strong> Es gibt kein Skript, kein Cookie und keinen Zählpixel. Die Daten entstehen bei Google und Microsoft im Rahmen der Suche, also unabhängig davon, ob Sie diese Website je aufrufen, und der Betreiber sieht sie ausschließlich zusammengefasst.</p>
<p>Der Nachweis, dass die Website dem Betreiber gehört, steht als Kennzeichnung im Quelltext der Seiten (sogenannte Meta-Tags). Sie laden nichts und übertragen nichts. Nach jeder neuen Version meldet der Betreiber die geänderten Seitenadressen über das IndexNow-Verfahren an Suchmaschinen; dabei werden nur Adressen dieser Website übermittelt, keine Angaben über Besucher. Für eine Auskunft nach Art. 15 DSGVO zu Ihren Suchdaten sind Google bzw. Microsoft die richtigen Ansprechpartner.</p>

${h2("speicherung", "Speicherung in Ihrem Browser")}
<div class="table-wrap"><table>
<caption>Was diese Website in Ihrem Browser speichert</caption>
<thead><tr><th scope="col">Art</th><th scope="col">Inhalt</th><th scope="col">Zweck</th><th scope="col">Dauer</th></tr></thead>
<tbody>
<tr><td>Cookies</td><td>keine</td><td>–</td><td>–</td></tr>
<tr><td>Local Storage, Session Storage, IndexedDB</td><td>nichts</td><td>–</td><td>–</td></tr>
<tr><td>Cache des Service Workers</td><td>die öffentlichen Programmdateien dieser Website (HTML, CSS, JavaScript, Feldtabellen, Beispieldateien); keine Angaben über Sie und keine Ihrer Dateien</td><td>Der Viewer funktioniert nach dem ersten Laden auch ohne Internetverbindung.</td><td>bis zur nächsten Version der Website oder bis Sie die Websitedaten im Browser löschen</td></tr>
</tbody></table></div>
<p>Der Cache enthält keine Informationen über Sie und wird nicht ausgelesen, um etwas über Sie zu erfahren. Die Speicherung ist für die von Ihnen genutzte Offline-Funktion unbedingt erforderlich und deshalb nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig. Sie können ihn jederzeit in den Einstellungen Ihres Browsers unter „Websitedaten“ löschen.</p>

${h2("kontakt", "Kontakt per E-Mail")}
<p>Wenn Sie per E-Mail Kontakt aufnehmen, werden Ihre Adresse und Ihre Nachricht verarbeitet, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in der Beantwortung Ihrer Anfrage. Die Nachricht wird gelöscht, sobald sie erledigt ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Bitte senden Sie keine Patientendaten per E-Mail; für Support-Anfragen gibt es im Viewer die Funktion „Anonymisieren“.</p>

${h2("rechte", "Ihre Rechte")}
<p>Sie haben nach der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77), insbesondere in dem Mitgliedstaat Ihres Aufenthalts. Für den Betreiber zuständig ist das <a href="https://www.lda.bayern.de/">Bayerische Landesamt für Datenschutzaufsicht</a> in Ansbach.</p>

${h2("automatisiert", "Keine automatisierte Entscheidungsfindung")}
<p>Es findet keine automatisierte Entscheidungsfindung und kein Profiling im Sinne von Art. 22 DSGVO statt.</p>

<h2 id="selbst-pruefen">So prüfen Sie es selbst</h2>
<ol>
<li>Laden Sie den <a href="${href()}">Viewer</a> und trennen Sie danach die Internetverbindung. Dateien lassen sich weiterhin öffnen.</li>
<li>Öffnen Sie die Entwicklerwerkzeuge Ihres Browsers (F12, Reiter „Netzwerk“). Beim Öffnen einer Datei wird nichts übertragen.</li>
<li>Der gesamte Quellcode ist auf <a href="https://github.com/freimoser/ldt-bdt-viewer">GitHub</a> einsehbar.</li>
</ol>
<p class="meta-line">Stand: ${STAND}</p>
</div>
</main>`,
};
