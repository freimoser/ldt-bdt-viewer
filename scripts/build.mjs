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
import { page, SITE, url, GUIDES } from "./lib/layout.mjs";

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
const problems = [];
const titles = new Map(), descs = new Map();
for (const p of pages) {
  let tableNo = 0;
  const html = page(p)
    .replace(/<link rel="stylesheet" href="[^"]*styles\.css">/, `<style>${css}</style>`)
    // scrollbare Tabellenbereiche per Tastatur erreichbar machen (WCAG 2.1.1)
    .replace(/<div class="table-wrap">([\s\S]*?<table[^>]*>\s*(?:<caption[^>]*>([^<]*)<\/caption>)?(?:\s*<thead><tr><th[^>]*>([^<]*))?)/g, (m, rest, cap, th) => {
      tableNo++;
      const label = (cap || "").trim() || `Tabelle ${tableNo}${th ? ": " + th.trim() : ""}`;
      return `<div class="table-wrap" tabindex="0" role="region" aria-label="${label.replace(/"/g, "&quot;")}">${rest}`;
    });
  const out = p.file ? join(dist, p.file) : join(dist, p.path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url>\n    <loc>${url(p.path)}</loc>\n    <lastmod>${p.lastmod || SITE.updated}</lastmod>\n  </url>`).join("\n")}
</urlset>
`);

writeFileSync(join(dist, "llms.txt"), `# ${SITE.name}

> Kostenloses Browser-Werkzeug zum Öffnen, Prüfen und Anonymisieren von LDT-Dateien (Labordatenträger, Austausch zwischen Labor und Arztpraxis) und BDT-Dateien (Behandlungsdatenträger, Export aus Praxissoftware). Alle Dateien werden lokal im Browser verarbeitet, es gibt keinen Upload. Deutschsprachig. Kein Medizinprodukt.

Der Viewer erkennt LDT 2.x (LDT1014.01), LDT 3.x (LDT3.2.20) und BDT samt Zeichensatz (IBM-Codepage 437, ISO 8859-1, ISO 8859-15, 7-Bit), zeigt Befunde mit Werten, Einheiten, Normbereichen und Markierungen, prüft Zeilenaufbau, Satzlängen, Pflichtfelder und Prüfsummen zeilengenau, anonymisiert Dateien für Support-Anfragen, exportiert CSV und JSON und erzeugt gültige Testdateien. Ein Kompendium aus ${BEISPIELE.length} Beispieldateien mit erfundenen Daten (Befunde, Auftrag, LDT 2, BDT und Fehlerbeispiele) steht zum Download bereit; zwei Artikel erklären je eine LDT- und eine BDT-Datei Zeile für Zeile. Grundlage sind die Spezifikationen der KBV (LDT 3.2.20, Datensatzbeschreibung LDT 5.12) und des QMS (BDT 3.0).

## Seiten

${indexable.map((p) => `- [${p.llmsTitle || p.title}](${url(p.path)}): ${p.llms || p.description}`).join("\n")}

## Beispieldateien (erfundene Testdaten zum Herunterladen)

${BEISPIELE.map((b) => `- [${b.file}](${url("beispiele/" + b.file)}): ${b.title}. ${b.shows}`).join("\n")}

## Quellen

- [Quellenliste mit Versionen und Abrufdatum](${url("quellen/")})
- [Quellcode](${SITE.repo})
`);

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
const precache = files.filter((f) => !/^(sitemap\.xml|llms\.txt|og-image\.png|google.*\.html)$/.test(f) && !f.endsWith(".map"));
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
