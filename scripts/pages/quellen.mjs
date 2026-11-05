import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { heroHtml, breadcrumbLd, articleLd, esc, href } from "../lib/layout.mjs";

// Die Seite wird beim Build aus quellen.md erzeugt: eine Quelle der Wahrheit für Repository und Website.
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Der Einleitungssatz der Datei steht schon im Seitenkopf
const md = readFileSync(join(root, "quellen.md"), "utf8").replace(/^Alle Feldtabellen[^\n]*?Dokumente\.\s*/m, "");

const path = "quellen/";
// Seite seit 14.10.2026; „Stand“ nennt das letzte Abrufdatum der Quellen
const UPDATED = "2026-10-26";
const STAND = "26.10.2026";
const crumbs = [["LDT & BDT Viewer", ""], ["Quellen", path]];
const title = "Quellen: Spezifikationen für LDT, BDT und GDT";
const description = "Alle Quellen des LDT & BDT Viewers mit Version, Link und Abrufdatum: KBV LDT 3.2.20 und LDT 5.12, QMS BDT 3.0, Uni Gießen, GDT 2.1, und was fehlt.";
const h1 = "Quellen: Spezifikationen hinter dem LDT & BDT Viewer";

/** Inline-Markdown: **fett**, `Code`, [Text](URL) und nackte URLs als Links. */
function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)|]+)/g, (m, pre, u) => `${pre}<a href="${u}">${u.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 60)}${u.length > 68 ? "…" : ""}</a>`);
  return out;
}

/** Kleiner Markdown-Umsetzer für die Elemente, die quellen.md nutzt: Überschriften, Tabellen, Listen, Absätze. */
function render(text) {
  const lines = text.split("\n");
  const html = [];
  let i = 0, tableNo = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^# /.test(l)) { i++; continue; } // H1 kommt aus dem Seitenkopf
    if (/^## /.test(l)) { const t = l.slice(3).trim(); html.push(`<h2 id="${t.toLowerCase().replace(/[^a-zäöüß0-9]+/g, "-").replace(/^-|-$/g, "")}">${esc(t)}</h2>`); i++; continue; }
    if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      tableNo++;
      html.push(`<div class="table-wrap"><table>
<caption>${tableNo === 1 ? "Genutzte Spezifikationen" : "Belege für Aussagen über Organisationen"}</caption>
<thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
<tbody>
${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("\n")}
</tbody></table></div>`);
      continue;
    }
    if (/^- /.test(l)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      html.push(`<ul>\n${items.map((x) => `<li>${inline(x)}</li>`).join("\n")}\n</ul>`);
      continue;
    }
    if (l.trim()) {
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^(#|\||- )/.test(lines[i])) { para.push(lines[i].trim()); i++; }
      html.push(`<p>${inline(para.join(" "))}</p>`);
      continue;
    }
    i++;
  }
  return html.join("\n");
}

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>Alle Feldtabellen, Prüfregeln und Faktenaussagen des LDT &amp; BDT Viewers stützen sich auf öffentlich zugängliche Spezifikationen</strong> der Kassenärztlichen Bundesvereinigung (KBV) und des Qualitätsrings Medizinische Software (QMS). Diese Seite nennt jede Quelle mit Version, Link und Abrufdatum, beschreibt, was daraus genutzt wird, und sagt offen, welche Dokumente fehlen.`,
  stand: STAND,
})}
<div class="prose">
${render(md)}
<p>Wie die Quellen in der Praxis genutzt werden, zeigen die <a href="${href("feldkennungen/")}">Feldkennungen</a>, die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a> und die <a href="${href("ldt-datei-beispiel/")}">LDT-Beispieldateien</a>.</p>
</div>
</main>`;

export default {
  path,
  title,
  description,
  ogType: "article",
  lastmod: UPDATED,
  jsonld: [articleLd({ headline: h1, description, path, updated: UPDATED, published: UPDATED }), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Quellenliste: KBV LDT 3.2.20 (mit Objektkatalog und Testdateien), KBV LDT 5.12, KBV-Prüfpaket, QMS BDT 3.0 V0.96 (archiviert; BDT 3 laut Deutschem Ärzteblatt 2017 freigegeben, Fassung nicht öffentlich), KBV KVDT 6.08, Uni Gießen (klassischer BDT), QMS GDT 2.1, EULUMDAT-Formatbeschreibung (Paul Bourke) und DIAL zur Abgrenzung; Lücken (BDT 02/94, BDT-3.0-Objektkatalog) und Vorgehen bei der Extraktion.",
};
