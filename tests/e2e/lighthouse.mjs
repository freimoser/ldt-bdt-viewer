/**
 * Lighthouse-Messung (lokal, Chrome erforderlich):
 *   node scripts/build.mjs && node tests/e2e/lighthouse.mjs
 * Der lokale Server liefert wie GitHub Pages komprimiert aus.
 */
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "tests", "e2e", "out");
mkdirSync(out, { recursive: true });
const PORT = 8803;
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["", "feldkennungen/", "ldt-datei-oeffnen/", "was-ist-ldt/"];
const env = { ...process.env, CHROME_PATH: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" };
const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
let failed = 0;
try {
  for (const p of pages) {
    const name = (p || "start").replace(/\//g, "");
    const file = join(out, `lighthouse-${name}.json`);
    const args = ["-y", "lighthouse@13", `http://localhost:${PORT}/ldt-bdt-viewer/${p}`, "--quiet", "--chrome-flags=--headless=new --no-sandbox",
      "--only-categories=performance,accessibility,best-practices,seo", "--output=json", `--output-path=${file}`];
    // Ein zweiter Versuch, falls Chrome unter hoher Systemlast nicht rechtzeitig startet
    for (let attempt = 1; ; attempt++) {
      try { execFileSync("npx", args, { env, stdio: ["ignore", "ignore", "pipe"] }); break; }
      catch (err) { if (attempt >= 2) throw new Error(`Lighthouse für /${p} fehlgeschlagen: ${String(err.stderr || err.message).slice(-400)}`); }
    }
    const r = JSON.parse(readFileSync(file, "utf8"));
    const scores = Object.fromEntries(Object.values(r.categories).map((c) => [c.id, Math.round(c.score * 100)]));
    const low = Object.entries(scores).filter(([, v]) => v < 95);
    if (low.length) failed++;
    console.log(`${low.length ? "✖" : "✔"} /${p}  Performance ${scores.performance} · Barrierefreiheit ${scores.accessibility} · Best Practices ${scores["best-practices"]} · SEO ${scores.seo}`);
  }
} finally {
  server.kill();
}
process.exitCode = failed ? 1 : 0;
