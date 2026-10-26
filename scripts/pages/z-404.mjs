import { href, esc, GUIDES, SITE } from "../lib/layout.mjs";

const ZIELE = [["", "LDT & BDT Viewer"], ...GUIDES.map(([p, l]) => [p, l]), ["quellen/", "Quellen"], ["ueber/", "Über diese Website"], ["inhalt/", "Alle Seiten"]];

export default {
  path: "404.html",
  file: "404.html",
  noindex: true,
  title: "Seite nicht gefunden – LDT & BDT Viewer",
  description: "Diese Seite gibt es nicht. Zum LDT & BDT Viewer und zu den Ratgebern für LDT- und BDT-Dateien.",
  body: `<main id="inhalt">
<header class="hero-article">
<h1>Seite nicht gefunden</h1>
<p class="lead">Unter dieser Adresse gibt es keine Seite. Vielleicht wurde sie verschoben oder der Link enthält einen Tippfehler. Alle Seiten finden Sie in der <a href="${href("inhalt/")}">Übersicht</a>.</p>
<p id="vorschlag" class="callout" hidden></p>
</header>
<div class="cta-box"><p><strong>Datei öffnen</strong>Der Viewer zeigt LDT- und BDT-Dateien direkt im Browser an.</p><a class="btn btn-primary btn-lg" href="${href()}">Zum LDT &amp; BDT Viewer</a></div>
<section class="related" aria-labelledby="ratgeber"><h2 id="ratgeber">Ratgeber</h2>
<div class="card-grid">
${GUIDES.map(([p, l, d]) => `<a class="card-link" href="${href(p)}"><h3>${esc(l)}</h3><p>${esc(d)}</p></a>`).join("\n")}
</div></section>
</main>
<script>
// „Meinten Sie …?“: Adresse mit den echten Seiten vergleichen (Umlaute, Groß-/Kleinschreibung, Tippfehler)
(() => {
  const ziele = ${JSON.stringify(ZIELE)};
  const base = ${JSON.stringify(SITE.base)};
  const norm = (s) => decodeURIComponent(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const wunsch = norm(location.pathname.replace(base, ""));
  if (!wunsch) return;
  const dist = (a, b) => { const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let prev = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; } } return d[b.length]; };
  let best = null;
  for (const [p, l] of ziele) { if (!p) continue; const k = dist(wunsch, norm(p)); if (!best || k < best.k) best = { p, l, k }; }
  if (!best || best.k > Math.max(3, norm(best.p).length / 3)) return;
  const box = document.getElementById("vorschlag");
  const a = document.createElement("a"); a.href = base + best.p; a.textContent = best.l;
  box.append("Meinten Sie ", a, "?"); box.hidden = false;
})();
</script>`,
};
