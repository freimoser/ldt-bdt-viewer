/**
 * Browser-Test mit echtem Chrome (lokal ausführen, nicht in der CI):
 *   node scripts/build.mjs && npm install --no-save puppeteer-core && node tests/e2e/browser.mjs
 * Prüft: große Datei (≥ 20 MB) ohne Einfrieren, alle Ansichten, 360 px ohne seitliches Scrollen,
 * Tastaturbedienung, Offline-Betrieb über den Service Worker.
 */
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { generate } from "../../src/assets/js/core/generator.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "tests", "e2e", "out");
mkdirSync(out, { recursive: true });
const PORT = 8799;
const BASE = `http://localhost:${PORT}/ldt-bdt-viewer/`;
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const results = [];
// DOM-Klick statt Koordinaten-Klick: robust, wenn sich das Layout unter Last noch verschiebt
const tap = (pg, sel) => pg.$eval(sel, (el) => el.click());
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "✔" : "✖"} ${name}${detail ? " – " + detail : ""}`); };

const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(180000); // großzügig, damit hohe Systemlast keinen Fehlalarm auslöst
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle0" });

  // 1) Große Datei
  const big = generate({ format: "ldt3", count: 5800, maxCount: 100000, seed: 3 });
  const bigPath = join(out, "Z01GROSS_20MB.ldt");
  writeFileSync(bigPath, big.bytes);
  await page.evaluate(() => {
    window.__gaps = [];
    let last = performance.now();
    window.__probe = setInterval(() => { const now = performance.now(); window.__gaps.push(now - last); last = now; }, 20);
    window.__long = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ entryTypes: ["longtask"] });
  });
  const input = await page.$("#fileInput");
  const t0 = Date.now();
  await input.uploadFile(bigPath);
  await page.waitForFunction(() => !document.getElementById("workspace").hidden && document.querySelector(".befund"), { timeout: 120000 });
  const loadMs = Date.now() - t0;
  const { maxGap, maxLong, patients } = await page.evaluate(() => {
    clearInterval(window.__probe);
    return {
      maxGap: Math.round(Math.max(...window.__gaps)),
      maxLong: Math.round(Math.max(0, ...window.__long)),
      patients: [...document.querySelectorAll(".summary-card")].find((c) => c.innerText.includes("PATIENTEN"))?.innerText.replace(/\n/g, " "),
    };
  });
  check(`20-MB-Datei (${(big.bytes.length / 1048576).toFixed(1)} MB) geöffnet`, /5\.800 Patienten/.test(patients || ""), `${loadMs} ms, ${patients}`);
  check("Seite friert nicht ein (längste Blockade des Hauptthreads < 500 ms)", maxGap < 500 && maxLong < 500, `größte Pause ${maxGap} ms, längste Long Task ${maxLong} ms`);

  // Ansichten der großen Datei
  await tap(page, "#tab-struktur");
  await page.waitForSelector(".rows tbody tr", { timeout: 120000 });
  const rows = await page.$$eval(".rows tbody tr", (r) => r.length);
  check("Strukturansicht blättert (250 Zeilen pro Seite)", rows === 250, `${rows} Zeilen`);
  await page.type("#searchInput", "9300");
  await page.waitForFunction(() => document.querySelectorAll(".rows tbody tr").length === 1, { timeout: 180000 });
  check("Suche nach Feldkennung 9300 in 1,2 Mio. Zeilen", true);
  await page.$eval("#searchInput", (el) => { el.value = ""; el.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => document.querySelectorAll(".rows tbody tr").length === 250);
  await tap(page, "#tab-pruefung");
  await page.waitForSelector(".notice-ok, .issue", { timeout: 120000 });
  const okText = await page.$eval("#panel .notice-ok, #panel .issue", (p) => p.innerText.slice(0, 60));
  check("Prüfung der großen Datei ohne Fehler", /Keine Fehler gefunden/.test(okText), okText.replace(/\n/g, " "));

  // 2) Beispiele und Befundansicht
  await page.goto(BASE, { waitUntil: "networkidle0" });
  for (const ex of ["Z01BEISPIEL_LDT3.ldt", "X01BSPL.LDT", "BEISPIEL_BDT.bdt"]) {
    await tap(page, `[data-example="${ex}"]`);
    await page.waitForFunction((n) => [...document.querySelectorAll("#fileName")].some((e) => e.textContent === n), {}, ex);
  }
  const tabs = await page.$$eval(".file-tab", (t) => t.length);
  check("Mehrere Dateien gleichzeitig geöffnet", tabs === 3, `${tabs} Reiter`);

  // 3) Tastatur: Reiter mit Pfeiltasten
  await page.focus("#tab-befunde").catch(() => {});
  await tap(page, ".file-tab");
  await page.focus("#tab-struktur");
  await page.keyboard.press("ArrowRight");
  const active = await page.evaluate(() => document.activeElement.id);
  check("Reiter per Pfeiltaste bedienbar", active === "tab-pruefung", active);

  // 4) 360 px: kein seitliches Scrollen
  const mobile = await browser.newPage();
  mobile.setDefaultTimeout(120000);
  await mobile.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  const pages = ["", "ldt-datei-oeffnen/", "bdt-datei-oeffnen/", "was-ist-ldt/", "was-ist-bdt/", "ldt-2-vs-ldt-3/", "xdt-gdt-ldt-bdt/", "feldkennungen/", "fehler/", "impressum/", "datenschutz/", "gibt-es-nicht/"];
  for (const p of pages) {
    const res = await mobile.goto(BASE + p, { waitUntil: "load" });
    if (p === "") {
      await tap(mobile, '[data-example="Z01BEISPIEL_LDT3.ldt"]');
      await mobile.waitForSelector(".befund");
    }
    const w = await mobile.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(`360 px ohne seitliches Scrollen: /${p}`, w.sw <= w.cw, `${w.sw}/${w.cw}, Status ${res.status()}`);
  }

  // 5) Offline
  const off = await browser.newPage();
  off.setDefaultTimeout(120000);
  await off.goto(BASE, { waitUntil: "networkidle0" });
  await off.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null || (navigator.serviceWorker && navigator.serviceWorker.ready.then(() => true)), { timeout: 120000 });
  await off.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await off.setOfflineMode(true);
  await off.reload({ waitUntil: "load" });
  await tap(off, '[data-example="X01BSPL.LDT"]');
  await off.waitForSelector(".befund", { timeout: 120000 });
  const offlineName = await off.$eval(".befund h3", (e) => e.textContent);
  check("Offline nach dem ersten Laden nutzbar", /Test-/.test(offlineName), offlineName);
  const sub = await off.goto(BASE + "was-ist-ldt/", { waitUntil: "load" }).catch(() => null);
  const subH1 = sub ? await off.$eval("h1", (e) => e.textContent).catch(() => "") : "";
  check("Ratgeberseite offline aus dem Cache", /LDT/.test(subH1) && !/nicht gefunden/.test(subH1), subH1);
  await off.setOfflineMode(false);
} catch (err) {
  check("Ablauf ohne Ausnahme", false, err.message + (err.cause ? " (" + err.cause.message + ")" : ""));
} finally {
  await browser.close();
  server.kill();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} Browser-Prüfungen bestanden`);
  writeFileSync(join(out, "ergebnis.json"), JSON.stringify(results, null, 2));
  process.exitCode = failed.length ? 1 : 0;
}
