/**
 * Vorschaubilder (Open Graph, 1200 × 630) je Seite aus EINER Vorlage (scripts/assets/og-page.html).
 * Liest Titel und Bereich aus dem Build, Ergebnis wird eingecheckt (src/static/og/):
 *   node scripts/build.mjs && node scripts/og-images.mjs && node scripts/build.mjs
 */
import { readFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { ogSlug } from "./lib/layout.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist"), out = join(root, "src", "static", "og");
mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const tpl = pathToFileURL(join(root, "scripts", "assets", "og-page.html")).href;
const BEREICH = {
  "ldt-datei-oeffnen/": "Anleitung", "bdt-datei-oeffnen/": "Anleitung", "fehler/": "Anleitung",
  "was-ist-ldt/": "Wissen", "was-ist-bdt/": "Wissen", "ldt-2-vs-ldt-3/": "Wissen", "xdt-gdt-ldt-bdt/": "Wissen", "glossar/": "Wissen",
  "ldt-datei-beispiel/": "Beispieldateien", "bdt-datei-beispiel/": "Beispieldateien", "feldkennungen/": "Referenz",
  "quellen/": "Über diese Website", "inhalt/": "Über diese Website",
};
const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

const seiten = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n === "index.html") {
      const html = readFileSync(p, "utf8");
      if (/<meta name="robots" content="noindex/.test(html)) continue;
      const path = relative(dist, dirname(p)).split("\\").join("/");
      const h1 = plain((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1]);
      const pfad = path ? path + "/" : "";
      seiten.push({ path: pfad, h1, kicker: pfad ? BEREICH[pfad] || "Ratgeber" : "Kostenloses Werkzeug" });
    }
  }
})(dist);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  for (const s of seiten) {
    const titel = s.path === "" ? "LDT- und BDT-Dateien im Browser öffnen und prüfen" : s.h1;
    await page.goto(`${tpl}?t=${encodeURIComponent(titel)}&k=${encodeURIComponent(s.kicker)}`, { waitUntil: "load" });
    await page.screenshot({ path: join(out, ogSlug(s.path) + ".jpg"), type: "jpeg", quality: 86 });
    console.log(`✔ og/${ogSlug(s.path)}.jpg  ${s.kicker}: ${titel}`);
  }
} finally {
  await browser.close();
}
