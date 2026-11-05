import { heroHtml, breadcrumbLd, href, url, esc, src, PERSON_LD } from "../lib/layout.mjs";
import { NEWS } from "../lib/news.mjs";

const path = "neuigkeiten/";
const crumbs = [["LDT & BDT Viewer", ""], ["Neuigkeiten", path]];
const title = "Neuigkeiten zu LDT, BDT und KVDT: Versionen und Termine";
const description = "Was sich bei LDT, KVDT und den Werkzeugen der KBV ändert: neue Versionen, Termine und Prüfmodule, jeweils mit Datum und Quelle. Auch als Feed.";
const h1 = "Neuigkeiten zu LDT, BDT und KVDT";
const UPDATED = NEWS.map((n) => n.date).sort().at(-1);
const ABRUF = "05.11.2026";
const de = (iso) => iso.split("-").reverse().join(".");

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `Neue Versionen, Termine und Werkzeuge rund um LDT, BDT und KVDT, neueste zuerst. Jede Meldung nennt Datum und Quelle. Neue Meldungen gibt es auch als <a href="${href("feed.xml")}">Atom-Feed</a> für Feedreader.`,
  minutes: 3,
})}
<div class="prose">
${NEWS.map((n) => `<article class="news-item" id="${n.id}">
<h2><time datetime="${n.date}">${de(n.date)}</time>: ${esc(n.title)}</h2>
<p>${esc(n.text)} ${src(n.src[0], n.src[1], ABRUF)}</p>
<p class="glossar-more"><a href="${href(n.link[0])}">${esc(n.link[1])}</a></p>
</article>`).join("\n")}
</div>
</main>`;

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
      author: PERSON_LD,
      hasPart: NEWS.map((n) => ({ "@type": "NewsArticle", headline: n.title, datePublished: n.date, url: url(path) + "#" + n.id, author: PERSON_LD, publisher: PERSON_LD, description: n.text })),
    },
    breadcrumbLd(crumbs),
  ],
  body,
  llms: "Neuigkeiten mit Datum und Quelle: LDT 3.2.20 seit 01.10.2026 in Kraft, KVDT 6.07/6.08 ab Abrechnung Q4/2026, KBV-Testdateien LDT 3.2.20 (02.09.2026), Prüfmodul XPM-LDK 2.20.0 (14.08.2026). Atom-Feed: feed.xml.",
};
