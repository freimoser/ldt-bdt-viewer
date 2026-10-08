/** Gemeinsames Seitenlayout für alle Seiten. */

export const SITE = {
  origin: "https://freimoser.github.io",
  base: "/ldt-bdt-viewer/",
  name: "LDT & BDT Viewer",
  tagline: "Labordaten und Praxisdaten-Exporte im Browser lesen – ohne Upload",
  verification: "6pYvtFCnU7UFcQFajtMSkQ7tYMy3Z_Bt7teKiT5yKNg",
  themeColor: "#0f1419",
  author: { name: "S. Thomas Freimoser", url: "https://freimoser.github.io/freimoser.de/" },
  repo: "https://github.com/freimoser/ldt-bdt-viewer",
  updated: "2026-10-08",
  updatedDe: "08.10.2026",
};

export const url = (path = "") => SITE.origin + SITE.base + path;
export const href = (path = "") => SITE.base + path;

export function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Quellen für sichtbare Belege auf den Ratgeberseiten. */
export const Q = {
  ldt3: { t: "KBV, LDT 3 Satzbeschreibung Version 3.2.20", u: "https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/EXT_ITA_VGEX_LDT%203_2_20_Gesamtdokument.pdf" },
  ldt2: { t: "KBV, Datensatzbeschreibung LDT Version 5.12 (LDT1014.01)", u: "https://wiki.gematik.de/download/attachments/76611849/KBV_ITA_VGEX_Datensatzbeschreibung_LDT.pdf?api=v2" },
  ldt2emp: { t: "KBV, Empfehlung zur Erweiterung des LDT2, Version 1.06", u: "https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/KBV_ITA_VGEX_Empfehlung_bei%20LDT2.pdf" },
  faq: { t: "KBV, FAQ für Softwarehersteller zur Labordatenkommunikation, Version 1.04", u: "https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/KBV_ITA_VGEX_FAQ_LDK.pdf" },
  kbvdir: { t: "KBV, Update-Verzeichnis Labordatenkommunikation", u: "https://update.kbv.de/ita-update/Labor/Labordatenkommunikation/" },
  bdt3: { t: "QMS, BDT 3.0 Satzbeschreibung Version 0.96 (archiviert)", u: "https://web.archive.org/web/20180215143723/http://www.qms-standards.de/fileadmin/Download/DOWNLOAD-PDFS/GDT_BDT/BDT-Datensatzbeschreibung_3-0_V0-96_20150301.pdf" },
  giessen: { t: "Universität Gießen, Institut für Medizinische Informatik: Beschreibung des BDT-Formats", u: "https://www.uni-giessen.de/de/fbz/fb11/institute/imi/schwerpunkte/kkk/standards/bdt" },
  gdt: { t: "QMS, GDT 2.1 (englische Fassung)", u: "https://www.qms-standards.de/files/GDT_2_1_0501_english.pdf" },
  qms: { t: "QMS, Marktgestaltung und GDT", u: "https://www.qms-standards.de/Marktgestaltung.html" },
};

/** Sichtbarer Beleg: „Stand …, Quelle: …“ */
export function src(key, detail = "") {
  const q = Q[key];
  return `<span class="src">(Stand ${SITE.updatedDe}, Quelle: <a href="${esc(q.u)}">${esc(q.t)}</a>${detail ? ", " + esc(detail) : ""})</span>`;
}

const NAV = [
  ["", "Viewer"],
  ["ldt-datei-oeffnen/", "LDT öffnen"],
  ["bdt-datei-oeffnen/", "BDT öffnen"],
  ["was-ist-ldt/", "Was ist LDT?"],
  ["was-ist-bdt/", "Was ist BDT?"],
  ["feldkennungen/", "Feldkennungen"],
  ["fehler/", "Fehler"],
];

export const GUIDES = [
  ["ldt-datei-oeffnen/", "LDT-Datei öffnen", "Schritt für Schritt, auch wenn ein Laborbefund nicht ankommt."],
  ["bdt-datei-oeffnen/", "BDT-Datei öffnen", "Export ansehen und Datenübernahme beim Wechsel der Praxissoftware."],
  ["was-ist-ldt/", "Was ist LDT?", "Labordatenträger: Zweck, Versionen, Ablauf zwischen Labor und Praxis."],
  ["was-ist-bdt/", "Was ist BDT?", "Behandlungsdatenträger: Einsatz beim Praxissoftware-Wechsel und Grenzen."],
  ["ldt-2-vs-ldt-3/", "LDT 2 vs. LDT 3", "Unterschiede, Umstellung und Vergleichstabelle."],
  ["xdt-gdt-ldt-bdt/", "xDT: GDT, LDT, BDT", "Die Formatfamilie im Überblick und das passende Tool."],
  ["feldkennungen/", "Feldkennungen", "Vollständige Referenz der Feldkennungen und Satzarten."],
  ["fehler/", "Fehler in LDT-Dateien", "Häufige Fehler, ihre Bedeutung und die Lösung."],
];

function head(p) {
  const canonical = p.noindex ? "" : `<link rel="canonical" href="${esc(url(p.path))}">`;
  const robots = p.noindex ? "noindex, follow" : "index, follow, max-image-preview:large";
  const ogTitle = p.ogTitle || p.title;
  const ogDesc = p.ogDescription || p.description;
  const ld = (p.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${canonical}
<meta name="robots" content="${robots}">
<meta name="google-site-verification" content="${SITE.verification}" />
<meta name="theme-color" content="${SITE.themeColor}">
<meta name="author" content="${esc(SITE.author.name)}">
<link rel="icon" href="${href("favicon.ico")}" sizes="48x48">
<link rel="icon" href="${href("favicon.svg")}" type="image/svg+xml">
<link rel="icon" href="${href("favicon-32.png")}" type="image/png" sizes="32x32">
<link rel="icon" href="${href("favicon-16.png")}" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="${href("apple-touch-icon.png")}" sizes="180x180">
<link rel="manifest" href="${href("site.webmanifest")}">
<meta property="og:type" content="${p.ogType || "website"}">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(ogDesc)}">
<meta property="og:url" content="${esc(url(p.path))}">
<meta property="og:image" content="${esc(url("og-image.png"))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="LDT &amp; BDT Viewer – Labordaten und Praxisdaten-Exporte im Browser lesen, ohne Upload">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle)}">
<meta name="twitter:description" content="${esc(ogDesc)}">
<meta name="twitter:image" content="${esc(url("og-image.png"))}">
<link rel="stylesheet" href="${href("assets/css/styles.css")}">
${ld}
</head>`;
}

function nav(path) {
  return `<nav class="site-nav" aria-label="Hauptnavigation">
${NAV.map(([p, l]) => `<a href="${href(p)}"${p === path ? ' aria-current="page"' : ""}>${esc(l)}</a>`).join("\n")}
</nav>`;
}

function footer() {
  return `<footer class="site-footer">
<div class="site-footer-grid">
<div><h2>Tool</h2><ul>
<li><a href="${href()}">LDT &amp; BDT Viewer</a></li>
<li><a href="${href("feldkennungen/")}">Feldkennungen</a></li>
<li><a href="${SITE.repo}/blob/main/quellen.md">Quellen</a></li>
<li><a href="${SITE.repo}">Quellcode auf GitHub</a></li>
</ul></div>
<div><h2>Ratgeber</h2><ul>
${GUIDES.filter(([p]) => p !== "feldkennungen/").map(([p, l]) => `<li><a href="${href(p)}">${esc(l)}</a></li>`).join("\n")}
</ul></div>
<div><h2>Weitere kostenlose Tools</h2><ul>
<li><a href="https://freimoser.github.io/gdt-viewer/">GDT Viewer</a></li>
<li><a href="https://freimoser.github.io/easy-photo-editor/">Easy Photo Editor</a></li>
<li><a href="https://freimoser.github.io/freimoser.de/">Über den Entwickler</a></li>
</ul></div>
<div><h2>Rechtliches</h2><ul>
<li><a href="${href("impressum/")}">Impressum</a></li>
<li><a href="${href("datenschutz/")}">Datenschutz</a></li>
</ul>
<p class="small">Kein Medizinprodukt. Dateien bleiben in Ihrem Browser.</p></div>
</div>
<p class="site-footer-note">Open Source · keine Cookies, kein Tracking, kein Upload · Stand ${SITE.updatedDe}</p>
</footer>`;
}

export function breadcrumbHtml(items) {
  return `<nav class="breadcrumb" aria-label="Brotkrumen"><ol>
${items.map(([name, path], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${href(path)}">${esc(name)}</a></li>`)).join("\n")}
</ol></nav>`;
}

export function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: url(path) })),
  };
}

export function faqHtml(faq) {
  return `<section class="faq" aria-labelledby="faq"><h2 id="faq">Häufige Fragen</h2>
${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("\n")}
</section>`;
}

export function faqLd(faq) {
  const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })),
  };
}

export function relatedHtml(paths) {
  const items = GUIDES.filter(([p]) => paths.includes(p));
  return `<section class="related" aria-labelledby="weiterlesen"><h2 id="weiterlesen">Weiterlesen</h2>
<div class="card-grid">
${items.map(([p, l, d]) => `<a class="card-link" href="${href(p)}"><h3>${esc(l)}</h3><p>${esc(d)}</p></a>`).join("\n")}
</div></section>`;
}

export function ctaHtml(title = "Datei jetzt ansehen", text = "Öffnen Sie Ihre LDT- oder BDT-Datei im Viewer. Die Datei bleibt auf Ihrem Rechner.") {
  return `<div class="cta-box"><p><strong>${esc(title)}</strong>${esc(text)}</p><a class="btn btn-primary btn-lg" href="${href()}">Zum LDT &amp; BDT Viewer</a></div>`;
}

export function page(p) {
  return `<!DOCTYPE html>
<html lang="de" data-base="${SITE.base}">
${head(p)}
<body>
<a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
<div class="page ${p.pageClass || "page-content"}">
${nav(p.path)}
${p.body}
${footer()}
</div>
${p.after || ""}
</body>
</html>
`;
}
