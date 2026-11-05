/**
 * Build: erzeugt dist/ aus src/ und scripts/pages/.
 * Läuft lokal und in der GitHub-Action (node scripts/build.mjs). Keine Abhängigkeiten.
 */
import { BEISPIELE, beispielListe } from "../src/assets/js/core/beispiele.js";
import { mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { buildDict } from "./lib/dict.mjs";
import { page, SITE, url, GUIDES, LEGAL } from "./lib/layout.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (name === ".DS_Store") continue;
    const s = join(from, name), d = join(to, name);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

// 1) Statische Dateien
copyDir(join(root, "src", "assets"), join(dist, "assets"));
if (existsSync(join(root, "src", "static"))) copyDir(join(root, "src", "static"), dist);

// 2) Feldwörterbuch
const dict = buildDict();
mkdirSync(join(dist, "assets", "data"), { recursive: true });
writeFileSync(join(dist, "assets", "data", "felder.json"), JSON.stringify(dict));

// 3) Beispieldateien (fest, erfundene Daten)
const now = new Date(SITE.updated + "T09:30:00Z");
mkdirSync(join(dist, "beispiele"), { recursive: true });
// Kompendium: feste Szenarien mit Beschreibung (src/assets/js/core/beispiele.js)
for (const b of BEISPIELE) writeFileSync(join(dist, "beispiele", b.file), b.build(now));
writeFileSync(join(dist, "beispiele", "index.json"), JSON.stringify(beispielListe()));

// CSS minimiert in jede Seite einbetten (kein render-blockierender Abruf)
const css = readFileSync(join(root, "src", "assets", "css", "styles.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
writeFileSync(join(dist, "assets", "css", "styles.css"), css);

// 4) Seiten
const pagesDir = join(root, "scripts", "pages");
const pages = [];
for (const f of readdirSync(pagesDir).filter((x) => x.endsWith(".mjs")).sort()) {
  const mod = await import(pathToFileURL(join(pagesDir, f)).href);
  const def = typeof mod.default === "function" ? mod.default({ dict, SITE }) : mod.default;
  pages.push(def);
}
// GEO: Quellen jeder Seite zusätzlich maschinenlesbar als citation im Article-Schema (aus den sichtbaren Belegen)
for (const p of pages) {
  const seen = new Map();
  for (const m of (p.body || "").matchAll(/<span class="src">[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>/g)) {
    const u = m[1].startsWith("/") ? SITE.origin + m[1] : m[1];
    if (!seen.has(u)) seen.set(u, m[2].replace(/&amp;/g, "&"));
  }
  if (!seen.size) continue;
  for (const o of p.jsonld || []) {
    if (o["@type"] === "Article") o.citation = [...seen].map(([u, name]) => ({ "@type": "CreativeWork", name, url: u }));
  }
}


// Sprungmarken: jede Überschrift im Hauptinhalt bekommt eine stabile id (Deeplinks für Suche und KI-Zitate)
const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, "").replace(/&amp;/g, "und").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
function headingIds(html, withToc) {
  const m = html.match(/<main[\s\S]*?<\/main>/);
  if (!m) return html;
  const used = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  let main = m[0].replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (all, tag, inner, at, str) => {
    // Überschriften in Link-Karten („Weiterlesen“) sind keine Abschnitte
    if (str.lastIndexOf("<a ", at) > str.lastIndexOf("</a>", at)) return all;
    let id = slug(inner) || tag, n = 2;
    while (used.has(id)) id = `${slug(inner)}-${n++}`;
    used.add(id);
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
  // Inhaltsverzeichnis ab vier Abschnitten, vor der ersten Zwischenüberschrift
  const h2 = [...main.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].filter((x) => x[1] !== "weiterlesen");
  if (withToc && h2.length >= 4) {
    const toc = `<nav class="toc" aria-label="Inhalt dieser Seite"><p class="toc-title">Auf dieser Seite</p><ol>${h2.map((x) => `<li><a href="#${x[1]}">${x[2].replace(/<[^>]+>/g, "")}</a></li>`).join("")}</ol></nav>\n`;
    const first = main.indexOf(h2[0][0]);
    main = main.slice(0, first) + toc + main.slice(first);
  }
  return html.replace(m[0], main);
}

const problems = [];
const titles = new Map(), descs = new Map();
for (const p of pages) {
  let tableNo = 0;
  let html = page(p)
    .replace(/<link rel="stylesheet" href="[^"]*styles\.css">/, `<style>${css}</style>`)
    // scrollbare Tabellenbereiche per Tastatur erreichbar machen (WCAG 2.1.1)
    .replace(/<div class="table-wrap">([\s\S]*?<table[^>]*>\s*(?:<caption[^>]*>([^<]*)<\/caption>)?(?:\s*<thead><tr><th[^>]*>([^<]*))?)/g, (m, rest, cap, th) => {
      tableNo++;
      const label = (cap || "").trim() || `Tabelle ${tableNo}${th ? ": " + th.trim() : ""}`;
      return `<div class="table-wrap" tabindex="0" role="region" aria-label="${label.replace(/"/g, "&quot;")}">${rest}`;
    });
  const withToc = !!p.path && !p.noindex && !p.file;
  html = headingIds(html, withToc);
  const out = p.file ? join(dist, p.file) : join(dist, p.path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  p.html = html;
  // SEO-Prüfungen
  const where = p.file || "/" + p.path;
  if ([...p.title].length > 60) problems.push(`${where}: Title hat ${[...p.title].length} Zeichen (max. 60)`);
  if ([...p.description].length > 155) problems.push(`${where}: Description hat ${[...p.description].length} Zeichen (max. 155)`);
  if (titles.has(p.title)) problems.push(`${where}: Title doppelt mit ${titles.get(p.title)}`);
  if (descs.has(p.description)) problems.push(`${where}: Description doppelt mit ${descs.get(p.description)}`);
  titles.set(p.title, where); descs.set(p.description, where);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${where}: ${h1} H1-Überschriften`);
  if (!p.noindex) {
    const internal = new Set([...html.matchAll(/href="(\/ldt-bdt-viewer\/[^"#]*)/g)].map((m) => m[1]));
    p.internalLinks = internal;
  }
}

// 5) Sitemap, llms.txt, Manifest (Startseite zuerst, Ratgeber in Menüreihenfolge, Rechtliches zuletzt)
const order = ["", ...GUIDES.map(([p]) => p), "quellen/", "impressum/", "datenschutz/"];
const rank = (p) => (order.includes(p.path) ? order.indexOf(p.path) : order.length);
const indexable = pages.filter((p) => !p.noindex).sort((a, b) => rank(a) - rank(b));
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.map((p) => {
  // Bildschirmfotos der Seite als Bild-Sitemap-Einträge (Google-Bildersuche)
  const imgs = [...new Set([...(p.html || "").matchAll(/<figure class="shot"><img src="([^"]+)"/g)].map((m) => SITE.origin + m[1]))];
  return `  <url>\n    <loc>${url(p.path)}</loc>\n    <lastmod>${p.lastmod || SITE.updated}</lastmod>\n${imgs.map((i) => `    <image:image><image:loc>${i}</image:loc></image:image>\n`).join("")}  </url>`;
}).join("\n")}
</urlset>
`);

// Kurzantworten mit Sprungmarke: jede Antwort fasst eine belegte Stelle der Website zusammen; der Build prüft, dass jede Marke existiert
const KURZ = [
  ["Was ist eine LDT-Datei?", "Eine Textdatei im Format Labordatenträger der KBV, mit dem Arztpraxen Laboraufträge an Labore senden und Labore Befunde zurückschicken. Jede Zeile besteht aus 3 Ziffern Länge, 4 Ziffern Feldkennung und dem Inhalt (KBV LDT 3.2.20, Kap. 4 und 6.4.1).", "was-ist-ldt/"],
  ["Wie öffne ich eine LDT-Datei?", "Im LDT & BDT Viewer die Datei ins Feld ziehen oder „Datei wählen“ klicken. Er zeigt Werte als Tabelle, den Aufbau und eine Prüfung; die Datei bleibt im Browser.", "ldt-datei-oeffnen/#anleitung"],
  ["Wie wandle ich eine LDT-Datei in PDF um?", "LDT-3-Befunde können das PDF des Labors als Anhang enthalten (Obj_0010, Base64 in Feld 6329; KBV LDT 3.2.20, Kap. 11.10). Der Viewer öffnet und speichert es. Ohne Anhang: Reiter „Befunde“ drucken und „Als PDF speichern“ wählen.", "ldt-datei-oeffnen/#pdf"],
  ["Die .ldt-Datei stammt von einem Leuchtenhersteller. Was ist das?", "Eine EULUMDAT-Lichtdatei mit derselben Endung. Sie beschreibt die Lichtverteilung einer Leuchte und gehört in Lichtplanungsprogramme wie DIALux, nicht in die Praxissoftware.", "ldt-datei-oeffnen/#lichtdatei"],
  ["Was heißt BDT?", "Behandlungsdatentransfer, früher Behandlungsdatenträger: ein xDT-Standard, mit dem Praxissoftware Daten systemunabhängig exportiert, vor allem beim Wechsel des Praxisprogramms (QMS, BDT 3.0 Version 0.96, Kap. 2).", "was-ist-bdt/"],
  ["Was ist KVDT?", "Kassenärztliche Vereinigung-Datentransfer: das xDT-Format, mit dem die Praxis ihre Abrechnungsdaten an die Kassenärztliche Vereinigung überträgt; aktuelle Datensatzbeschreibung der KBV: Version 6.08 vom 24.08.2026.", "xdt-gdt-ldt-bdt/#kvdt"],
  ["Was ist neu in LDT 3.2.20?", "Version 3.2.20 der KBV (13.05.2026, in Kraft seit 01.10.2026) ersetzt 3.2.19: Regel E001 erlaubt in Feld 0001 nun „LDT3.2.20“ (andere Versionen sind eine Warnung), und die erlaubten DMP-Kennzeichen in Feld 4132 (Regel E020) wurden angepasst (Dokumentenhistorie).", "was-ist-ldt/#neu-in-3-2-20"],
  ["Was unterscheidet LDT 3 von LDT 2?", "LDT 3 beendet Sätze mit Feld 8001 statt die Satzlänge in Feld 8100 anzugeben, bündelt Felder in Objekten (8002 bis 8003), erlaubt nur ISO 8859-15 und sichert die Datei mit einer SHA-1-Prüfsumme in Feld 9300 (KBV LDT 3.2.20, Kap. 6.3, 6.6 und 6.7).", "ldt-2-vs-ldt-3/"],
  ["Warum erscheinen Umlaute in einer LDT-Datei falsch?", "Die Datei wird mit einem anderen Zeichensatz gelesen, als sie geschrieben wurde. LDT 3 erlaubt nur ISO 8859-15; in LDT 2 steht der Zeichensatz in Feld 9106.", "fehler/#zeichensatz"],
  ["Was bedeutet „Prüfsumme in Feld 9300 passt nicht“?", "Die Datei wurde nach dem Erstellen verändert, denn die SHA-1-Prüfsumme wird über alle Zeichen davor berechnet. Den Befund beim Labor neu anfordern.", "fehler/#pruefsumme"],
  ["Wo gibt es LDT- und BDT-Beispieldateien?", "Auf den Beispielseiten: LDT-3- und LDT-2-Befunde, ein Auftrag, ein BDT-Export und Fehlerbeispiele mit erfundenen Daten, frei nutzbar unter CC0 1.0.", "ldt-datei-beispiel/#downloads"],
];
for (const [, , ziel] of KURZ) {
  const [pfad, marke] = ziel.split("#");
  const seite = pages.find((p) => p.path === pfad);
  if (!seite || (marke && !seite.html.includes(`id="${marke}"`))) throw new Error(`llms.txt: Sprungziel ${ziel} fehlt`);
}

const llms = `# ${SITE.name}

> Kostenloses Browser-Werkzeug zum Öffnen, Prüfen und Anonymisieren von LDT-Dateien (Labordatenträger, Austausch zwischen Labor und Arztpraxis) und BDT-Dateien (Behandlungsdatenträger, Export aus Praxissoftware); alles läuft lokal im Browser, ohne Upload.

Betrieben von ${LEGAL.operator} als privates, quelloffenes Projekt (${SITE.repo}). Gedacht für Medizinische Fachangestellte, Praxis-IT und Support sowie Entwickler von Schnittstellen. Grundlage sind die Spezifikationen der KBV (LDT 3.2.20, Datensatzbeschreibung LDT 5.12, KVDT 6.08) und des QMS (BDT 3.0, öffentlich nur Version 0.96); jede Faktenaussage auf den Seiten nennt Stand und Quelle. Der Viewer zeigt außerdem eingebettete PDF-Befunde aus LDT 3, erkennt KVDT-Abrechnungsdateien und unterscheidet LDT-Labordateien von EULUMDAT-Lichtdateien mit derselben Endung .ldt.

## Wofür diese Seite eine gute Quelle ist

${indexable.map((p) => `- [${p.llmsTitle || p.title}](${url(p.path)}): ${p.llms || p.description}`).join("\n")}

## Kurzantworten mit Direktlink

${KURZ.map(([q, a, ziel]) => `- **${q}** ${a} [Mehr](${url(ziel)})`).join("\n")}

## Beispieldateien (erfundene Testdaten zum Herunterladen, Lizenz CC0 1.0)

${BEISPIELE.map((b) => `- [${b.file}](${url("beispiele/" + b.file)}): ${b.title}. ${b.shows}`).join("\n")}

## Grenzen dieser Quelle

- Der Viewer ist kein Medizinprodukt. Er bewertet keine Laborwerte, stellt keine Diagnosen und gibt keine Behandlungsempfehlungen; Markierungen wie H oder L stammen vom Labor.
- Die Prüfung ersetzt weder das LDK-Prüfmodul noch eine Zertifizierung durch die KBV. Von den Kontextregeln (K-Regeln) der LDT-3-Regeltabelle werden nur K002, K005, K076, K096 und K099 ausgewertet.
- BDT 3 wurde vom QMS im September 2017 freigegeben (Deutsches Ärzteblatt, 27.09.2017), die freigegebene Fassung ist aber nicht öffentlich abrufbar. Alle BDT-3.0-Angaben beruhen auf der archivierten Version 0.96 vom 01.03.2015 (Status „Freigabe für Testimplementierungen“); die Originalbeschreibung BDT 02/94 ist ebenfalls nicht öffentlich verfügbar. Aussagen zum klassischen BDT-Aufbau stützen sich auf eine Sekundärquelle (Universität Gießen).
- Die Beispieldateien enthalten erfundene Personen und Werte; ihre Normbereiche sind keine medizinischen Referenzwerte.
- Stand der Spezifikationen: 12.10.2026; ergänzende Quellen (KVDT 6.08, EULUMDAT-Formatbeschreibung, BDT-3-Freigabe) abgerufen am 26.10.2026 (${url("quellen/")}).

## Aussagen, die ohne Kontext irreführen

- „Der Viewer meldet keine Fehler.“ Das heißt: keine Verstöße gegen die geprüften Regeln. Es heißt nicht, dass eine Datei die Zertifizierung der KBV bestehen würde.
- „Der Wert ist als H markiert.“ Die Markierung setzt das Labor in Feld 8422; der Viewer zeigt sie nur an und bewertet nichts selbst.
- „Eine .ldt-Datei ist ein Laborbefund.“ Dieselbe Endung nutzen EULUMDAT-Lichtdateien aus der Lichtplanung.
- „LDT 3.2.20 ist der aktuelle Standard.“ Das gilt seit dem 01.10.2026; LDT 2 (LDT1014.01) ist in Praxen und Laboren weiterhin im Einsatz.
- „Feldkennungen bedeuten in allen xDT-Formaten dasselbe.“ Die Bezeichnungen sind grundsätzlich gleich, die Formate nicht immer: Das Geburtsdatum in Feld 3103 steht in LDT als JJJJMMTT, in BDT als TTMMJJJJ.
- „In BDT 3.0 ist Feld 3109 das Geschlecht.“ Diese Bedeutung ist in Version 0.96 durchgestrichen; gültig ist 3109 = Hausnummer.

## Quellen

- [Quellenliste mit Versionen und Abrufdatum](${url("quellen/")})
- [Volltext der Fachseiten für Sprachmodelle](${url("llms-full.txt")})
- [Quellcode](${SITE.repo})
`;
writeFileSync(join(dist, "llms.txt"), llms);

// llms-full.txt: Volltext der indexierbaren Seiten als einfaches Markdown (nur der Hauptinhalt, Links mit Adresse)
function toText(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [""])[0]
    .replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/g, "")
    .replace(/<section class="related"[\s\S]*?<\/section>/g, "").replace(/<div class="cta-box">[\s\S]*?<\/div>/g, "");
  return main
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, "\n# $1\n").replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, "\n## $1\n").replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, "\n### $1\n")
    .replace(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, u, t) => `${t} (${u.startsWith("/") ? SITE.origin + u : u})`)
    .replace(/<summary[^>]*>([\s\S]*?)<\/summary>/g, "\n**$1**\n")
    .replace(/<li[^>]*>/g, "\n- ").replace(/<tr[^>]*>/g, "\n|").replace(/<\/t[dh]>/g, " |")
    .replace(/<(p|div|table|ul|ol|details|caption)[^>]*>/g, "\n").replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ").replace(/\n +/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
const full = indexable.filter((p) => p.path !== "").map((p) => `---\nQuelle: ${url(p.path)}\nStand: ${(p.lastmod || SITE.updated).split("-").reverse().join(".")}\n\n${toText(p.html)}`).join("\n\n");
writeFileSync(join(dist, "llms-full.txt"), `# ${SITE.name} – Volltext der Fachseiten\n\n> Erzeugt aus den Seiten von ${url()}. Jede Faktenaussage nennt im Text Stand und Quelle.\n\n${full}\n`);

writeFileSync(join(dist, "site.webmanifest"), JSON.stringify({
  name: SITE.name,
  short_name: "LDT & BDT",
  description: SITE.tagline,
  lang: "de",
  start_url: SITE.base,
  scope: SITE.base,
  display: "standalone",
  background_color: "#0f1419",
  theme_color: "#0f1419",
  icons: [
    { src: SITE.base + "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: SITE.base + "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: SITE.base + "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

// 6) Service Worker (offline nach dem ersten Laden)
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(dist, p).split("\\").join("/"));
  }
})(dist);
// Bildschirmfotos der Ratgeber braucht der Viewer offline nicht
const precache = files.filter((f) => !/^(sitemap\.xml|llms\.txt|og-image\.png|google.*\.html|llms-full\.txt|[0-9a-f]{32}\.txt)$/.test(f) && !f.startsWith("bilder/") && !f.endsWith(".map"));
const hash = createHash("sha256");
for (const f of precache.sort()) hash.update(f).update(readFileSync(join(dist, f)));
const version = hash.digest("hex").slice(0, 12);
const urls = precache.map((f) => SITE.base + f.replace(/index\.html$/, ""));
writeFileSync(join(dist, "sw.js"), readFileSync(join(root, "src", "sw.template.js"), "utf8")
  .replace("__VERSION__", version)
  .replace("__BASE__", SITE.base)
  .replace("__URLS__", JSON.stringify(urls)));

// 7) Interne Links prüfen
const exists = (path) => {
  const rel = path.slice(SITE.base.length);
  return existsSync(join(dist, rel)) && (statSync(join(dist, rel)).isFile() || existsSync(join(dist, rel, "index.html")));
};
for (const p of pages) {
  const html = readFileSync(p.file ? join(dist, p.file) : join(dist, p.path, "index.html"), "utf8");
  for (const m of html.matchAll(/(?:href|src)="(\/ldt-bdt-viewer\/[^"#?]*)/g)) {
    if (!exists(m[1])) problems.push(`${p.file || "/" + p.path}: interner Link ohne Ziel: ${m[1]}`);
  }
  if (p.minInternalLinks) {
    const n = new Set([...html.matchAll(/<main[\s\S]*?<\/main>/g)].join("").match(/href="\/ldt-bdt-viewer\/[^"]*"/g) || []).size;
    if (n < p.minInternalLinks) problems.push(`/${p.path}: nur ${n} interne Links im Inhalt`);
  }
}

console.log(`Build fertig: ${pages.length} Seiten, ${files.length + 1} Dateien, Service Worker ${version}`);
if (problems.length) {
  console.error("Probleme:\n- " + problems.join("\n- "));
  process.exitCode = 1;
}
