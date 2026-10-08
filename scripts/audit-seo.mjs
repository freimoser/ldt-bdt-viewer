/**
 * SEO-Prüfung der gebauten Website (dist/). Ändert nichts, gibt einen Bericht aus.
 *   node scripts/build.mjs && node scripts/audit-seo.mjs
 * Startet dafür kurz den lokalen Server, um Statuscodes zu prüfen.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const BASE = "/ldt-bdt-viewer/";
const ORIGIN = "https://freimoser.github.io";
const PORT = 8802;

const htmlFiles = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith(".html")) htmlFiles.push(p); } })(dist);

const strip = (s) => s.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}\-.]*/gu) || []);

const pages = htmlFiles.map((f) => {
  const html = readFileSync(f, "utf8");
  const rel = relative(dist, f).split("\\").join("/");
  const path = BASE + rel.replace(/index\.html$/, "");
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [""])[0];
  const text = strip(main);
  const dec = (x) => x.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const title = dec((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
  const desc = dec((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || "";
  const headings = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  const links = [...html.matchAll(/href="([^"#]*)(#[^"]*)?"/g)].map((m) => m[1]);
  const mainLinks = [...main.matchAll(/href="(\/ldt-bdt-viewer\/[^"#]*)/g)].map((m) => m[1]);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch (e) { return { error: e.message }; } });
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const firstP = strip((main.match(/<p class="lead">([\s\S]*?)<\/p>/) || html.match(/<p class="tagline">([\s\S]*?)<\/p>/) || main.match(/<p[^>]*>([\s\S]*?)<\/p>/) || ["", ""])[1]);
  return { file: rel, path, html, text, words: words(text).length, title, desc, canonical, robots, headings, links, mainLinks, ld, imgs, firstP };
});

const out = [];
const log = (s = "") => out.push(s);

// Inhalte
log("## Seiten, Wortzahl, Titel und Beschreibung");
for (const p of pages.sort((a, b) => a.path.localeCompare(b.path))) {
  log(`- ${p.path} | ${p.words} Wörter | Title ${[...p.title].length}: „${p.title}“ | Description ${[...p.desc].length} | robots ${p.robots} | canonical ${p.canonical === ORIGIN + p.path ? "selbst" : p.canonical || "fehlt"}`);
}

// Ähnlichkeit (5-Wort-Schindeln)
log("\n## Ähnlichkeit zwischen Seiten (Jaccard der 5-Wort-Folgen, ab 0,15)");
const shingles = new Map(pages.map((p) => { const w = words(p.text.toLowerCase()); const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(" ")); return [p.path, s]; }));
let simCount = 0;
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const a = shingles.get(pages[i].path), b = shingles.get(pages[j].path);
  if (!a.size || !b.size) continue;
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  const jac = inter / (a.size + b.size - inter);
  if (jac >= 0.15) { log(`- ${pages[i].path} ↔ ${pages[j].path}: ${jac.toFixed(2)}`); simCount++; }
}
if (!simCount) log("- keine Paare über 0,15");

// Überschriften
log("\n## Überschriften");
for (const p of pages) {
  const h1 = p.headings.filter((h) => h === 1).length;
  let skip = false;
  for (let i = 1; i < p.headings.length; i++) if (p.headings[i] > p.headings[i - 1] + 1) skip = true;
  if (h1 !== 1 || skip) log(`- ${p.path}: ${h1} H1${skip ? ", Ebene übersprungen" : ""}`);
}
log("- geprüft: genau eine H1, keine übersprungenen Ebenen (sofern oben nichts steht)");

// Sitemap
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const smUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].length;
const indexable = pages.filter((p) => !/noindex/.test(p.robots));
log("\n## Sitemap");
log(`- ${smUrls.length} URLs, ${lastmods} mit lastmod, ${indexable.length} indexierbare Seiten`);
for (const p of indexable) if (!smUrls.includes(ORIGIN + p.path)) log(`- fehlt in Sitemap: ${p.path}`);
for (const u of smUrls) { const p = pages.find((x) => ORIGIN + x.path === u); if (!p) log(`- Sitemap-URL ohne Seite: ${u}`); else if (/noindex/.test(p.robots)) log(`- Sitemap enthält noindex-Seite: ${u}`); }

// Interne Verlinkung
log("\n## Interne Verlinkung");
const inbound = new Map(indexable.map((p) => [p.path, 0]));
for (const p of pages) for (const l of new Set(p.links.filter((l) => l.startsWith(BASE)))) if (inbound.has(l) && l !== p.path) inbound.set(l, inbound.get(l) + 1);
for (const [k, v] of inbound) log(`- ${k}: ${v} Seiten verlinken hierher`);
const depth = new Map([[BASE, 0]]); const q = [BASE];
while (q.length) { const cur = q.shift(); const p = pages.find((x) => x.path === cur); if (!p) continue; for (const l of p.links) if (l.startsWith(BASE) && !depth.has(l) && pages.some((x) => x.path === l)) { depth.set(l, depth.get(cur) + 1); q.push(l); } }
for (const p of indexable) log(`- Klicktiefe ${p.path}: ${depth.has(p.path) ? depth.get(p.path) : "nicht erreichbar"}`);
log("\n## Interne Links im Inhalt (main)");
for (const p of indexable) log(`- ${p.path}: ${new Set(p.mainLinks).size} verschiedene interne Ziele`);

// Strukturierte Daten
log("\n## Strukturierte Daten");
for (const p of pages) {
  const types = p.ld.map((o) => o.error ? `FEHLER ${o.error}` : o["@type"]).join(", ");
  log(`- ${p.path}: ${types || "keine"}`);
  for (const o of p.ld) if (o["@type"] === "FAQPage") for (const qn of o.mainEntity) if (!p.text.includes(qn.name.replace(/&/g, "&"))) log(`  ! FAQ-Frage nicht sichtbar: ${qn.name}`);
}

// Bilder
log("\n## Bilder");
const noAlt = pages.flatMap((p) => p.imgs.filter((i) => !/\balt=/.test(i) || !/\bwidth=/.test(i)).map((i) => p.path + " " + i));
log(noAlt.length ? noAlt.map((x) => "- " + x).join("\n") : "- keine <img> ohne alt/width; Grafiken sind Inline-SVG (dekorativ, aria-hidden)");

// Erster Absatz
log("\n## Erster Absatz (direkte Antwort)");
for (const p of indexable) log(`- ${p.path}: ${p.firstP.slice(0, 160)}${p.firstP.length > 160 ? " …" : ""}`);

// Statuscodes über den lokalen Server
const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 700));
log("\n## Statuscodes (lokaler Server wie GitHub Pages)");
const targets = new Set([...pages.flatMap((p) => p.links.filter((l) => l.startsWith(BASE))), ...smUrls.map((u) => u.replace(ORIGIN, ""))]);
const bad = [];
for (const t of targets) { const r = await fetch(`http://localhost:${PORT}${t}`, { redirect: "manual" }); if (r.status !== 200) bad.push(`${r.status} ${t}`); }
log(bad.length ? bad.map((b) => "- " + b).join("\n") : `- alle ${targets.size} internen Ziele und Sitemap-URLs liefern 200`);
for (const t of [BASE + "gibt-es-nicht/", BASE + "was-ist-ldt"]) { const r = await fetch(`http://localhost:${PORT}${t}`, { redirect: "manual" }); log(`- ${t}: ${r.status}${r.headers.get("location") ? " → " + r.headers.get("location") : ""}`); }
server.kill();

// Externe Links
log("\n## Externe Links");
const ext = [...new Set(pages.flatMap((p) => p.links.filter((l) => /^https?:/.test(l))))].sort();
for (const u of ext) {
  let s;
  try { const r = await fetch(u, { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } }); s = r.status; } catch (e) { s = "Fehler " + e.message; }
  log(`- ${s} ${u}`);
}
const affiliate = pages.flatMap((p) => [...p.html.matchAll(/<a [^>]*rel="[^"]*sponsored/g)]).length;
log(`- Links mit rel="sponsored": ${affiliate} (keine Affiliate-Links vorhanden)`);

console.log(out.join("\n"));
