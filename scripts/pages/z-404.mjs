import { href, esc, GUIDES } from "../lib/layout.mjs";

export default {
  path: "404.html",
  file: "404.html",
  noindex: true,
  title: "Seite nicht gefunden – LDT & BDT Viewer",
  description: "Diese Seite gibt es nicht. Zum LDT & BDT Viewer und zu den Ratgebern für LDT- und BDT-Dateien.",
  body: `<main id="inhalt">
<header class="hero-article">
<h1>Seite nicht gefunden</h1>
<p class="lead">Unter dieser Adresse gibt es keine Seite. Vielleicht wurde sie verschoben oder der Link enthält einen Tippfehler.</p>
</header>
<div class="cta-box"><p><strong>Datei öffnen</strong>Der Viewer zeigt LDT- und BDT-Dateien direkt im Browser an.</p><a class="btn btn-primary btn-lg" href="${href()}">Zum LDT &amp; BDT Viewer</a></div>
<section class="related" aria-labelledby="ratgeber"><h2 id="ratgeber">Ratgeber</h2>
<div class="card-grid">
${GUIDES.map(([p, l, d]) => `<a class="card-link" href="${href(p)}"><h3>${esc(l)}</h3><p>${esc(d)}</p></a>`).join("\n")}
</div></section>
</main>`,
};
