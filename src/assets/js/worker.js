/**
 * Web Worker: hält die geöffneten Dateien und erledigt Parsen, Prüfen, Suchen,
 * Anonymisieren, Export und Generator. So bleibt die Seite auch bei großen Dateien bedienbar.
 * Es werden keine Daten an einen Server gesendet; der einzige Abruf ist das Feldwörterbuch dieser Website.
 */
import { createHandler } from "./engine-core.js";

const handle = createHandler((msg) => self.postMessage(msg), new URL("../data/felder.json", import.meta.url).href);

self.onmessage = async (e) => {
  const msg = e.data;
  try {
    const { result, transfer } = await handle(msg);
    self.postMessage({ id: msg.id, ok: true, result }, transfer || []);
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
