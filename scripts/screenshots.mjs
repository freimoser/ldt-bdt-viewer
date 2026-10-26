/**
 * Bildschirmfotos des Viewers für die Ratgeberseiten (Bildersuche, HowTo-Schema).
 * Nur erfundene Beispieldateien. Lokal ausführen, Ergebnis wird eingecheckt:
 *   node scripts/build.mjs && node scripts/screenshots.mjs
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "static", "bilder");
mkdirSync(outDir, { recursive: true });
const PORT = 8798;
const BASE = `http://localhost:${PORT}/ldt-bdt-viewer/`;
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Datei, Reiter, Ausgabename; Ausschnitt: Dateikopf bis Ende der Tabelle
export const SHOTS = [
  { beispiel: "Z01_LDT3_Befund_auffaellig.ldt", tab: "befunde", file: "ldt-viewer-laborbefund.webp" },
  { beispiel: "Z01_FEHLER_Pruefsumme.ldt", tab: "pruefung", file: "ldt-viewer-pruefung-fehler.webp" },
  { beispiel: "BEISPIEL_BDT_Export.bdt", tab: "struktur", file: "bdt-viewer-struktur.webp" },
];

const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
try {
  for (const s of SHOTS) {
    // je Bild ein frischer Kontext, sonst stehen Reiter früherer Dateien mit im Bild
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(BASE + "#beispiel=" + encodeURIComponent(s.beispiel), { waitUntil: "networkidle0" });
    await page.waitForSelector("#workspace:not([hidden]) #tab-" + s.tab);
    await page.$eval("#tab-" + s.tab, (el) => el.click());
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await new Promise((r) => setTimeout(r, 600));
    const box = await page.$eval("#workspace", (ws) => {
      const r = ws.getBoundingClientRect(), panel = document.getElementById("panel").getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(panel.bottom - r.top, 1100) };
    });
    await page.screenshot({ path: join(outDir, s.file), type: "webp", quality: 82, clip: box, captureBeyondViewport: true });
    await ctx.close();
    console.log(`✔ ${s.file} ${Math.round(box.width)}×${Math.round(box.height)}`);
  }
} finally {
  await browser.close();
  server.kill();
}
