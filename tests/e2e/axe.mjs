/**
 * Barrierefreiheit der dynamischen Ansichten mit axe-core (lokal):
 *   npm install --no-save puppeteer-core axe-core && node tests/e2e/axe.mjs
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const PORT = 8804;
const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, timeout: 180000 });
let total = 0;
// DOM-Klick statt Koordinaten-Klick: robust, wenn sich das Layout unter Last noch verschiebt
const tap = (pg, sel) => pg.$eval(sel, (el) => el.click());
async function audit(page, label) {
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }));
  total += res.violations.length;
  console.log(`${res.violations.length ? "✖" : "✔"} ${label}: ${res.violations.length} Verstöße`);
  for (const v of res.violations) console.log(`   - ${v.id} (${v.impact}): ${v.nodes.length}× ${v.help} | ${v.nodes[0].target.join(" ")}`);
}
try {
  for (const [w, h] of [[1280, 900], [360, 780]]) {
    const page = await browser.newPage();
    page.setDefaultTimeout(180000);
    await page.setViewport({ width: w, height: h });
    await page.goto(`http://localhost:${PORT}/ldt-bdt-viewer/`, { waitUntil: "networkidle0" });
    await tap(page, '[data-example="Z01_LDT3_Befund_auffaellig.ldt"]');
    await page.waitForSelector(".befund");
    await audit(page, `${w}px Befunde`);
    await page.$eval("#beispiele", (d) => { d.open = true; });
    await audit(page, `${w}px Beispielliste`);
    await tap(page, '[data-example="Z01_LDT3_Auftrag.ldt"]');
    await page.waitForSelector(".order-facts");
    await audit(page, `${w}px Auftrag`);
    await tap(page, '[data-example="Z01_LDT3_Befund_auffaellig.ldt"]');
    await page.waitForFunction(() => document.getElementById("fileName").textContent === "Z01_LDT3_Befund_auffaellig.ldt" && document.querySelector(".befund-table"));
    await tap(page, "#tab-struktur"); await page.waitForSelector(".rows tbody tr");
    await tap(page, ".line-btn");
    await audit(page, `${w}px Struktur`);
    // Datei mit Fehlern für die Prüfansicht
    await tap(page, '[data-example="Z01_FEHLER_UTF8.ldt"]');
    await page.waitForFunction(() => document.getElementById("fileName").textContent === "Z01_FEHLER_UTF8.ldt");
    await tap(page, "#tab-pruefung"); await page.waitForSelector("#panel .notice-ok, #panel .issue");
    await audit(page, `${w}px Prüfung`);
    await page.type("#lookupInput", "3101"); await page.waitForSelector(".lookup-list");
    await audit(page, `${w}px Nachschlagen`);
  }
  for (const p of ["ldt-datei-oeffnen/", "bdt-datei-oeffnen/", "was-ist-ldt/", "was-ist-bdt/", "ldt-2-vs-ldt-3/", "xdt-gdt-ldt-bdt/", "feldkennungen/", "fehler/", "ldt-datei-beispiel/", "impressum/", "datenschutz/", "gibt-es-nicht/"]) {
    const page = await browser.newPage();
    page.setDefaultTimeout(180000);
    await page.goto(`http://localhost:${PORT}/ldt-bdt-viewer/${p}`, { waitUntil: "load" });
    await audit(page, "/" + p);
  }
} finally {
  await browser.close();
  server.kill();
}
process.exitCode = total ? 1 : 0;
