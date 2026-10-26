import { heroHtml, breadcrumbLd, href, url, esc, SITE, SECTIONS } from "../lib/layout.mjs";

// Inhaltsübersicht (HTML-Sitemap): wird nach allen anderen Seiten gerendert und liest deren Überschriften,
// damit jede Seite und jeder Abschnitt einen direkten Link hat, ohne dass die Liste von Hand gepflegt wird.
const path = "inhalt/";
const crumbs = [["LDT & BDT Viewer", ""], ["Alle Seiten", path]];
const title = "Alle Seiten und Themen – LDT & BDT Viewer";
const description = "Inhaltsübersicht des LDT & BDT Viewers: alle Anleitungen, Erklärseiten, Beispieldateien und Referenzen mit direkten Links zu jedem Abschnitt.";
const h1 = "Alle Seiten und Themen im Überblick";
const UPDATED = "2026-10-26";

// Gliederung aus SECTIONS (layout.mjs), dieselbe wie im Footer
const GRUPPEN = SECTIONS.map(([name, pfade]) => [name, pfade.filter((p) => p !== path)]);

const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

function eintrag(p) {
  const main = (p.html.match(/<main[\s\S]*?<\/main>/) || [""])[0];
  const h1Text = plain((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, p.title])[1]);
  const abschnitte = [...main.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
    .filter((m) => m[1] !== "weiterlesen")
    .map((m) => `<li><a href="${href(p.path)}#${m[1]}">${esc(plain(m[2]))}</a></li>`);
  return `<li class="inhalt-seite"><h3><a href="${href(p.path)}">${esc(h1Text)}</a></h3>
<p>${esc(p.description)}</p>${abschnitte.length ? `\n<ul class="inhalt-abschnitte">${abschnitte.join("")}</ul>` : ""}</li>`;
}

export default {
  path,
  title,
  description,
  lastmod: UPDATED,
  jsonld: [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: h1,
      description,
      inLanguage: "de-DE",
      url: url(path),
      dateModified: UPDATED,
      isPartOf: { "@type": "WebSite", name: SITE.name, url: url() },
    },
    breadcrumbLd(crumbs),
  ],
  llms: "Inhaltsübersicht mit allen Seiten und direkten Links zu jedem Abschnitt.",
  lateBody(pages) {
    const byPath = new Map(pages.map((p) => [p.path, p]));
    const gruppen = GRUPPEN.map(([name, pfade]) => {
      const items = pfade.map((pf) => byPath.get(pf)).filter((p) => p && p.html);
      return `<h2 id="${name.toLowerCase().replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/[^a-z]+/g, "-")}">${esc(name)}</h2>
<ul class="inhalt-liste">
${items.map(eintrag).join("\n")}
</ul>`;
    }).join("\n");
    // Jede indexierbare Seite muss hier stehen; sonst hat die Gruppenliste eine Lücke
    const fehlt = pages.filter((p) => !p.noindex && !p.file && p.path !== path && !GRUPPEN.some(([, pf]) => pf.includes(p.path)));
    if (fehlt.length) throw new Error("Inhaltsübersicht: Seite ohne Gruppe: " + fehlt.map((p) => p.path).join(", "));
    return `<main id="inhalt">
${heroHtml({ crumbs, h1, lead: "Alle Seiten dieser Website nach Thema geordnet. Unter jeder Seite stehen ihre Abschnitte als direkte Links. Die maschinenlesbare Fassung für Suchmaschinen ist die <a href=\"" + href("sitemap.xml") + "\">XML-Sitemap</a>, für KI-Assistenten die Datei <a href=\"" + href("llms.txt") + "\">llms.txt</a>.", stand: "26.10.2026" })}
<div class="prose">
${gruppen}
</div>
</main>`;
  },
};
