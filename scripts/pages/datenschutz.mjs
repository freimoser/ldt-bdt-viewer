import { breadcrumbHtml, breadcrumbLd, href } from "../lib/layout.mjs";

const crumbs = [["LDT & BDT Viewer", ""], ["Datenschutz", "datenschutz/"]];

export default {
  path: "datenschutz/",
  title: "Datenschutz – LDT & BDT Viewer",
  description: "Datenschutzerklärung: Der LDT & BDT Viewer erhebt keine Daten. Dateien werden nur lokal im Browser verarbeitet. Hosting über GitHub Pages.",
  jsonld: [breadcrumbLd(crumbs)],
  body: `<main id="inhalt">
${breadcrumbHtml(crumbs)}
<header class="hero-article"><h1>Datenschutz</h1>
<p class="lead">Kurz gesagt: Der LDT &amp; BDT Viewer erhebt keine Daten. Ihre Dateien werden ausschließlich in Ihrem Browser verarbeitet und nie an einen Server übertragen.</p></header>
<div class="prose">
<h2>Verantwortlicher</h2>
<p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist der im <a href="${href("impressum/")}">Impressum</a> genannte Betreiber.</p>

<h2>Verarbeitung Ihrer Dateien</h2>
<p>Wenn Sie eine LDT-, BDT- oder andere Datei öffnen, liest der Viewer sie mit JavaScript direkt in Ihrem Browser. Die Datei und ihr Inhalt, also auch darin enthaltene Patientendaten, werden nicht hochgeladen, nicht gespeichert und nicht an Dritte übermittelt. Beim Schließen des Browser-Tabs ist die Datei aus dem Arbeitsspeicher entfernt. Exporte (CSV, JSON, anonymisierte Datei) erzeugt der Browser lokal als Download.</p>
<p>Damit der Viewer auch ohne Internetverbindung funktioniert, speichert ein sogenannter Service Worker die Programmdateien dieser Website (HTML, CSS, JavaScript, Feldtabellen) im Browser-Cache. Ihre eigenen Dateien werden dabei nicht gespeichert.</p>

<h2>Keine Cookies, kein Tracking</h2>
<p>Diese Website setzt keine Cookies, verwendet keine Analyse- oder Tracking-Werkzeuge, lädt keine externen Schriften und bindet keine Inhalte von Drittanbietern ein.</p>

<h2>Hosting durch GitHub Pages</h2>
<p>Die Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, USA. Beim Aufruf der Seiten verarbeitet GitHub technisch notwendige Zugriffsdaten, insbesondere Ihre IP-Adresse, Datum und Uhrzeit des Abrufs und die aufgerufene Adresse, um die Website auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in der sicheren und zuverlässigen Bereitstellung der Website. Auf diese Verarbeitung hat der Betreiber keinen Einfluss und keinen Zugriff. Einzelheiten beschreibt die <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">Datenschutzerklärung von GitHub</a>.</p>

<h2>Ihre Rechte</h2>
<p>Sie haben nach der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Da der Betreiber selbst keine personenbezogenen Daten erhebt, betreffen diese Rechte praktisch nur die Zugriffsdaten bei GitHub.</p>

<h2>So prüfen Sie es selbst</h2>
<ol>
<li>Laden Sie den <a href="${href()}">Viewer</a> und trennen Sie danach die Internetverbindung. Dateien lassen sich weiterhin öffnen.</li>
<li>Öffnen Sie die Entwicklerwerkzeuge Ihres Browsers (F12, Reiter „Netzwerk“). Beim Öffnen einer Datei wird nichts übertragen.</li>
<li>Der gesamte Quellcode ist auf <a href="https://github.com/freimoser/ldt-bdt-viewer">GitHub</a> einsehbar.</li>
</ol>
<p class="meta-line">Stand: 08.10.2026</p>
</div>
</main>`,
};
