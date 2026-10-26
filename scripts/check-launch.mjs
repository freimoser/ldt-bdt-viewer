/**
 * Livegang-Prüfung gegen den Build (dist/), nicht gegen den Quelltext:
 *   node scripts/build.mjs && node scripts/check-launch.mjs
 * Blocker beenden mit Exit 1, Hinweise nicht. Geprüft werden Fehlerklassen, keine Einzelwerte.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./lib/layout.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = process.env.DIST || join(root, "dist");
const blocker = [], hinweis = [];
const read = (f) => (existsSync(join(dist, f)) ? readFileSync(join(dist, f), "utf8") : "");
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ");

// Seiten aus dem Build; Route aus beiden Ausgabeformen ableiten (seite/index.html und seite.html)
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".html") && !/^google[0-9a-f]+\.html$/.test(n)) {
      const rel = "/" + relative(dist, p).split("\\").join("/");
      const route = rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
      pages.push({ file: p, route, html: readFileSync(p, "utf8") });
    }
  }
})(dist);
const byRoute = (r) => pages.find((p) => p.route === r);

// 1) Pflichtseiten und Impressumsangaben (§ 5 DDG: Name, ladungsfähige Anschrift, schneller Kontakt)
const imp = byRoute("/impressum/"), ds = byRoute("/datenschutz/");
if (!imp) blocker.push("Impressum fehlt (/impressum/).");
if (!ds) blocker.push("Datenschutzerklärung fehlt (/datenschutz/).");
for (const [name, pg] of [["Impressum", imp], ["Datenschutz", ds]]) {
  if (pg && /\b(TODO|Platzhalter|Lorem ipsum|XXX)\b|\[(Name|Anschrift|Straße|PLZ)\]/i.test(text(pg.html))) blocker.push(`${name} enthält einen Platzhalter.`);
}
if (imp) {
  const t = text((imp.html.match(/<main[\s\S]*?<\/main>/) || [""])[0]);
  if (!/\b\d{5}\b/.test(t)) blocker.push("Impressum: keine Postleitzahl. § 5 DDG verlangt eine ladungsfähige Anschrift.");
  if (!/\p{L}+(straße|strasse|str\.|weg|gasse|platz|allee|ring|damm|ufer|steig|pfad|markt)\s*\d+/iu.test(t)) blocker.push("Impressum: keine Straße mit Hausnummer. Ein Ort allein ist keine ladungsfähige Anschrift.");
  if (!/@|\[at\]/.test(t)) blocker.push("Impressum: keine E-Mail-Adresse oder andere schnelle Kontaktmöglichkeit.");
}
for (const pg of pages) {
  if (!/\/impressum\/"/.test(pg.html) || !/\/datenschutz\/"/.test(pg.html)) blocker.push(`${pg.route}: Link auf Impressum oder Datenschutz fehlt.`);
}

// 2) Canonical der Startseite: vorhanden und auf der Live-Adresse
const start = byRoute("/");
const canonical = start ? (start.html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "" : "";
if (!canonical) blocker.push("Startseite hat kein Canonical.");
else if (/localhost|127\.0\.0\.1|\.pages\.dev|0\.0\.0\.0/.test(canonical) || !canonical.startsWith(SITE.origin + SITE.base)) blocker.push(`Canonical der Startseite zeigt auf ${canonical} statt auf ${SITE.origin + SITE.base}.`);
for (const pg of pages) {
  const c = (pg.html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (c && c !== SITE.origin + SITE.base + pg.route.replace(/^\//, "")) blocker.push(`${pg.route}: Canonical ${c} passt nicht zur ausgelieferten Adresse.`);
}

// 3) Sitemap gegen noindex, beide Richtungen
const xml = read("sitemap.xml");
if (!xml) blocker.push("sitemap.xml fehlt.");
const inSitemap = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(SITE.base, "/")));
for (const pg of pages) {
  const noindex = /<meta name="robots" content="noindex/.test(pg.html);
  if (noindex && inSitemap.has(pg.route)) blocker.push(`${pg.route} steht in der Sitemap, trägt aber noindex.`);
  if (!noindex && !inSitemap.has(pg.route)) blocker.push(`${pg.route} ist indexierbar, fehlt aber in der Sitemap.`);
}
for (const r of ["/impressum/", "/datenschutz/"]) {
  const pg = byRoute(r);
  if (pg && !/<meta name="robots" content="noindex/.test(pg.html)) hinweis.push(`${r} ist indexierbar. Rechtsseiten gehören auf noindex, follow (Privatanschrift nicht als Suchergebnis).`);
}

// 4) Titel höchstens 60 Zeichen (Google kürzt bei rund 60)
for (const pg of pages) {
  if (/<meta name="robots" content="noindex/.test(pg.html)) continue;
  const t = (pg.html.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/&amp;/g, "&") || "";
  if ([...t].length > 60) blocker.push(`${pg.route}: Titel hat ${[...t].length} Zeichen (höchstens 60).`);
}

// 5) Favicons: Dateien, Kantenlängen, Einbindung (Google nutzt nur Vielfache von 48 px)
const pngSize = (f) => { const b = readFileSync(join(dist, f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
for (const [f, size] of [["favicon-96.png", 96], ["favicon-48.png", 48], ["favicon-32.png", 32], ["apple-touch-icon.png", 180]]) {
  if (!existsSync(join(dist, f))) { blocker.push(`${f} fehlt im Build.`); continue; }
  const [w, h] = pngSize(f);
  if (w !== size || h !== size) blocker.push(`${f} ist ${w}×${h} statt ${size}×${size}.`);
}
for (const f of ["favicon.svg", "favicon.ico"]) if (!existsSync(join(dist, f))) blocker.push(`${f} fehlt im Build.`);
if (start && !/rel="icon"[^>]*favicon-96\.png[^>]*sizes="96x96"/.test(start.html)) blocker.push("Startseite bindet favicon-96.png nicht ein (Google-Suchergebnis).");
if (start && !/rel="icon"[^>]*favicon\.svg/.test(start.html)) hinweis.push("Startseite bindet favicon.svg nicht ein.");
hinweis.push("Favicon vor dem Livegang ansehen und freigeben: node ~/.claude/skills/website-livegang/scripts/favicon-vorschau.mjs dist vorschau.png");

// 6) Datenschutzversprechen: keine Einbindung fremder Server; Messwerkzeuge nur mit passender Erklärung
const TRACKER = /googletagmanager\.com|google-analytics\.com|cloudflareinsights\.com|plausible\.io|matomo|hotjar|facebook\.net|doubleclick\.net/;
for (const pg of pages) {
  for (const m of pg.html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*\b(src|href)="(https?:\/\/[^"]+)"/g)) {
    const tag = m[1], u = m[3];
    if (tag === "link" && !/rel="(stylesheet|preload|modulepreload|preconnect|dns-prefetch)"/.test(m[0])) continue;
    if (!u.startsWith(SITE.origin)) blocker.push(`${pg.route}: lädt ${u} von einem fremden Server (Datenschutzerklärung verspricht: keine Drittanbieter).`);
  }
  if (TRACKER.test(pg.html) && ds && !TRACKER.test(ds.html)) blocker.push(`${pg.route}: Messwerkzeug eingebunden, die Datenschutzerklärung erwähnt es nicht.`);
}
// Jeder Inhabernachweis im Seitenkopf muss in der Datenschutzerklärung stehen (Bing-Tag kam am 16.10.2026 ohne Erwähnung hinzu)
const NACHWEIS = { "google-site-verification": /Google Search Console/, "msvalidate.01": /Bing Webmaster/, "yandex-verification": /Yandex/, "p:domain_verify": /Pinterest/ };
for (const [tag, muster] of Object.entries(NACHWEIS)) {
  if (start && start.html.includes(`name="${tag}"`) && ds && !muster.test(text(ds.html))) blocker.push(`Seitenkopf enthält ${tag}, die Datenschutzerklärung erwähnt den Dienst nicht.`);
}
if (ds && !/keine (Analyse|Messung)|nicht gemessen/i.test(text(ds.html)) && !pages.some((p) => TRACKER.test(p.html))) hinweis.push("Datenschutz sagt nicht ausdrücklich, dass nicht gemessen wird.");
if (!pages.some((p) => TRACKER.test(p.html))) hinweis.push("Keine Messung eingebunden (gewollt: die Datenschutzerklärung sagt das ausdrücklich).");

// 7) GEO-Dateien
for (const f of ["llms.txt", "llms-full.txt"]) if (!read(f)) hinweis.push(`${f} fehlt.`);
for (const pg of pages) {
  for (const m of pg.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const o = JSON.parse(m[1]);
    if (o["@type"] === "Dataset" && !o.license) hinweis.push(`${pg.route}: Dataset ohne license (Search Console warnt; Entscheidung des Betreibers).`);
  }
}

// 7b) Strukturierte Daten gegen die sichtbare Seite und die Sitemap (Google-Richtlinien für Rich Results)
const lastmod = new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [new URL(m[1]).pathname.replace(SITE.base, "/"), m[2]]));
const norm = (t) => t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
for (const pg of pages) {
  if (/<meta name="robots" content="noindex/.test(pg.html)) continue;
  const sichtbar = norm(text(pg.html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")));
  for (const m of pg.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const o = JSON.parse(m[1]);
    if (o["@type"] === "FAQPage") {
      for (const q of o.mainEntity || []) if (!sichtbar.includes(norm(q.name))) blocker.push(`${pg.route}: FAQ-Frage „${q.name}“ steht im Schema, aber nicht sichtbar auf der Seite.`);
    }
    if (o["@type"] === "Article") {
      if (!o.headline || [...o.headline].length > 110) blocker.push(`${pg.route}: Article-headline fehlt oder ist länger als 110 Zeichen.`);
      if (!o.image || !o.author || !o.datePublished) blocker.push(`${pg.route}: Article ohne image, author oder datePublished.`);
      if (o.datePublished > o.dateModified) blocker.push(`${pg.route}: datePublished liegt nach dateModified.`);
    }
    if (o.dateModified && lastmod.has(pg.route) && o.dateModified !== lastmod.get(pg.route)) hinweis.push(`${pg.route}: dateModified ${o.dateModified} (${o["@type"]}) weicht von lastmod ${lastmod.get(pg.route)} in der Sitemap ab.`);
    if (o["@type"] === "BreadcrumbList") {
      const last = (o.itemListElement || []).at(-1);
      const c = (pg.html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if (last && c && last.item !== c) blocker.push(`${pg.route}: letzter Breadcrumb ${last.item} ist nicht das Canonical ${c}.`);
    }
  }
}

// 7e) Einheitliche Navigation: genau ein Kopf, auf jeder Seite dieselben Ziele in derselben Reihenfolge
const navZiele = (html) => ((html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/) || [""])[0].match(/href="[^"]+"/g) || []).join(" ");
const navRef = start ? navZiele(start.html) : "";
for (const pg of pages) {
  if ((pg.html.match(/<header class="site-header">/g) || []).length !== 1) blocker.push(`${pg.route}: nicht genau ein Seitenkopf mit Navigation.`);
  else if (navZiele(pg.html) !== navRef) blocker.push(`${pg.route}: Navigation weicht von der Startseite ab.`);
}

// 7d) Sichtbares Aktualisierungsdatum = Sitemap-lastmod
for (const pg of pages) {
  const t = (pg.html.match(/<p class="meta-line">Aktualisiert: <time datetime="([^"]+)"/) || [])[1];
  if (t && lastmod.has(pg.route) && t !== lastmod.get(pg.route)) blocker.push(`${pg.route}: sichtbar aktualisiert am ${t}, Sitemap sagt ${lastmod.get(pg.route)}.`);
}

// 7c) Vorschaubild jeder Seite muss im Build liegen (sonst zeigen Teams, LinkedIn und Co. keine Vorschau)
for (const pg of pages) {
  const og = (pg.html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (!og) { blocker.push(`${pg.route}: og:image fehlt.`); continue; }
  if (og.startsWith(SITE.origin + SITE.base) && !existsSync(join(dist, og.slice((SITE.origin + SITE.base).length)))) blocker.push(`${pg.route}: Vorschaubild ${og} fehlt im Build.`);
}

// 8) Grenzen des Hostings (GitHub-Pages-Projektseite)
hinweis.push(`robots.txt und /favicon.ico liegen bei einer Projektseite auf ${SITE.origin}/ und gehören zum Repository der Hauptseite; die Sitemap wird in der Search Console eingereicht.`);

console.log(blocker.length ? `✖ ${blocker.length} Blocker:` : "✔ Keine Blocker.");
for (const b of [...new Set(blocker)]) console.log("  ✖ " + b);
console.log(`\nHinweise (${new Set(hinweis).size}):`);
for (const h of [...new Set(hinweis)]) console.log("  · " + h);
process.exitCode = blocker.length ? 1 : 0;
