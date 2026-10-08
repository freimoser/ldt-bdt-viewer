/** Kleiner lokaler Server: liefert dist/ unter /ldt-bdt-viewer/ aus, wie GitHub Pages. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BASE = "/ldt-bdt-viewer/";
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".ldt": "application/octet-stream", ".LDT": "application/octet-stream", ".bdt": "application/octet-stream" };
const port = Number(process.env.PORT || 8765);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/" ) { res.writeHead(302, { Location: BASE }); return res.end(); }
  let status = 200, file = null;
  if (path.startsWith(BASE)) {
    let rel = path.slice(BASE.length);
    let p = join(dist, rel);
    try {
      const s = await stat(p);
      if (s.isDirectory()) {
        if (!path.endsWith("/")) { res.writeHead(301, { Location: path + "/" }); return res.end(); }
        p = join(p, "index.html");
      }
      await stat(p);
      file = p;
    } catch { /* 404 */ }
  }
  if (!file) { status = 404; file = join(dist, "404.html"); }
  try {
    const body = await readFile(file);
    res.writeHead(status, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(body);
  } catch { res.writeHead(500); res.end("Fehler"); }
}).listen(port, () => console.log(`http://localhost:${port}${BASE}`));
