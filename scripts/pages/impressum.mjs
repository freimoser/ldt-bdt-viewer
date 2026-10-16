import { breadcrumbHtml, breadcrumbLd, href, esc, LEGAL } from "../lib/layout.mjs";

const crumbs = [["LDT & BDT Viewer", ""], ["Impressum", "impressum/"]];

// Alle Angaben aus LEGAL (scripts/lib/layout.mjs). Leere Felder erscheinen nicht.
const anschrift = [
  LEGAL.operator,
  LEGAL.companyName,
  LEGAL.street,
  [LEGAL.zip, LEGAL.city].filter(Boolean).join(" "),
  LEGAL.country,
].filter(Boolean).map(esc).join("<br>");

// noindex: Das Impressum muss erreichbar sein (Link im Footer jeder Seite), nicht über Google auffindbar.
export default {
  path: "impressum/",
  noindex: true,
  title: "Impressum – LDT & BDT Viewer",
  description: "Impressum des LDT & BDT Viewers: Angaben gemäß § 5 DDG, Kontakt und Verantwortlicher für den Inhalt.",
  jsonld: [breadcrumbLd(crumbs)],
  body: `<main id="inhalt">
${breadcrumbHtml(crumbs)}
<header class="hero-article"><h1>Impressum</h1></header>
<div class="prose">
<h2>Angaben gemäß § 5 DDG</h2>
<p>${anschrift}</p>
<h2>Kontakt</h2>
<p>E-Mail: ${esc(LEGAL.email)}${LEGAL.phone ? `<br>Telefon: ${esc(LEGAL.phone)}` : ""}</p>
${LEGAL.vatId ? `<h2>Umsatzsteuer-Identifikationsnummer</h2>\n<p>gemäß § 27a Umsatzsteuergesetz: ${esc(LEGAL.vatId)}</p>` : ""}
<h2>Verantwortlich für den Inhalt</h2>
<p>${esc(LEGAL.responsible)} (Anschrift wie oben)</p>
<h2>Verbraucherstreitbeilegung</h2>
<p>Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle besteht keine Verpflichtung und keine Bereitschaft.</p>
<h2>Kein Medizinprodukt</h2>
<p>Der LDT &amp; BDT Viewer ist kein Medizinprodukt. Er dient nur zur Anzeige und Prüfung von Dateien, nicht zur Diagnose. Er bewertet keine Laborwerte und gibt keine Behandlungsempfehlungen.</p>
<h2>Haftung für Inhalte</h2>
<p>Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.</p>
<h2>Haftung für Links</h2>
<p>Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte kein Einfluss besteht. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
<h2>Urheberrecht</h2>
<p>Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Der Quellcode des Viewers ist offen auf <a href="https://github.com/freimoser/ldt-bdt-viewer">GitHub</a> einsehbar.</p>
<p>Weitere Informationen: <a href="${href("datenschutz/")}">Datenschutz</a> · <a href="${href()}">Zum Viewer</a></p>
</div>
</main>`,
};
