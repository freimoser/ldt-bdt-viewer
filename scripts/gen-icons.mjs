/**
 * Erzeugt alle Symbole aus EINER Quelle (scripts/assets/icon.html) mit Chrome:
 *   npm install --no-save puppeteer-core && node scripts/gen-icons.mjs
 * Google nutzt ein Favicon in den Suchergebnissen nur bei einem Vielfachen von 48 px (48, 96 …).
 * apple-touch-icon ohne transparente Ecken (iOS rundet selbst ab und füllt Transparenz schwarz).
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "src", "static");
const src = pathToFileURL(join(root, "scripts", "assets", "icon.html")).href;
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ICONS = [
  ["favicon-32.png", 32, ""], ["favicon-48.png", 48, ""], ["favicon-96.png", 96, ""],
  ["apple-touch-icon.png", 180, "&q=1"], ["icon-192.png", 192, ""], ["icon-512.png", 512, ""], ["icon-512-maskable.png", 512, "&m=1"],
];

/** PNG in einen ICO-Container mit einem Bild (seit Windows Vista zulässig). */
function ico(png, size) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
  head.writeUInt8(size >= 256 ? 0 : size, 6); head.writeUInt8(size >= 256 ? 0 : size, 7);
  head.writeUInt8(0, 8); head.writeUInt8(0, 9); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
  head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
  return Buffer.concat([head, png]);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  const shots = {};
  for (const [name, size, extra] of ICONS) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.goto(`${src}?s=${size}${extra}`, { waitUntil: "load" });
    const png = await page.screenshot({ type: "png", omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    writeFileSync(join(out, name), png);
    shots[size] = shots[size] || png;
    console.log(name, size + "×" + size);
  }
  writeFileSync(join(out, "favicon.ico"), ico(shots[48], 48));
  console.log("favicon.ico 48×48 (PNG im ICO-Container)");
} finally {
  await browser.close();
}
