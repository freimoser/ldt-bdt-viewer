/**
 * Zeichensätze für xDT-Dateien.
 *
 * LDT 2 erlaubt laut KBV-Datensatzbeschreibung LDT (Version 5.12, Kap. 2.6, Feld 9106)
 * 7-Bit-Code (DIN 66003), IBM-Codepage 437, ISO 8859-1 und ISO 8859-15.
 * LDT 3 (Kap. 6.6) und BDT 3.0 (Kap. 3.7.5) schreiben ISO 8859-15 vor.
 * UTF-8 und Windows-1252 sind nicht spezifiziert, kommen in der Praxis aber vor
 * und werden deshalb erkannt und als Fehler bzw. Warnung gemeldet.
 */

const CP437_HIGH =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

const WIN1252_80 =
  "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ";

const ISO15_DIFF = { 0xa4: "€", 0xa6: "Š", 0xa8: "š", 0xb4: "Ž", 0xb8: "ž", 0xbc: "Œ", 0xbd: "œ", 0xbe: "Ÿ" };

// DIN 66003, deutsche Referenzversion (KBV LDT 5.12, Kap. 2.6.1)
const DIN66003 = { 0x40: "§", 0x5b: "Ä", 0x5c: "Ö", 0x5d: "Ü", 0x7b: "ä", 0x7c: "ö", 0x7d: "ü", 0x7e: "ß" };

export const CHARSETS = {
  "iso-8859-15": { label: "ISO 8859-15 (Latin-9)", short: "ISO 8859-15" },
  "iso-8859-1": { label: "ISO 8859-1 (Latin-1)", short: "ISO 8859-1" },
  cp437: { label: "IBM-Codepage 437 (DOS)", short: "Codepage 437" },
  din66003: { label: "7-Bit-Code nach DIN 66003", short: "7-Bit DIN 66003" },
  "utf-8": { label: "UTF-8 (nicht spezifiziert)", short: "UTF-8" },
  "windows-1252": { label: "Windows-1252 (nicht spezifiziert)", short: "Windows-1252" },
};

function buildTable(id) {
  const t = new Array(256);
  for (let i = 0; i < 128; i++) t[i] = String.fromCharCode(i);
  for (let i = 128; i < 256; i++) t[i] = String.fromCharCode(i);
  if (id === "cp437") for (let i = 0; i < 128; i++) t[128 + i] = CP437_HIGH[i];
  if (id === "windows-1252") for (let i = 0; i < 32; i++) t[128 + i] = WIN1252_80[i];
  if (id === "iso-8859-15") for (const [k, v] of Object.entries(ISO15_DIFF)) t[k] = v;
  if (id === "din66003") {
    for (const [k, v] of Object.entries(DIN66003)) t[k] = v;
    for (let i = 128; i < 256; i++) t[i] = "�";
  }
  return t;
}

const tables = {};
function table(id) {
  if (!tables[id]) tables[id] = buildTable(id);
  return tables[id];
}

let utf8Decoder = null;

/** Dekodiert bytes[start, end) im angegebenen Zeichensatz. */
export function decode(bytes, start, end, charset) {
  if (end <= start) return "";
  if (charset === "utf-8") {
    utf8Decoder ||= new TextDecoder("utf-8");
    return utf8Decoder.decode(bytes.subarray(start, end));
  }
  const t = table(charset);
  let s = "";
  // ASCII-Schnellweg in Blöcken
  for (let i = start; i < end; ) {
    const stop = Math.min(end, i + 4096);
    let chunk = "";
    for (; i < stop; i++) chunk += t[bytes[i]];
    s += chunk;
  }
  return s;
}

/** Einbyte-Zeichensätze: ein Byte entspricht genau einem Zeichen. */
export function isSingleByte(charset) {
  return charset !== "utf-8";
}

/** Dekodiert die ganze Datei auf einmal (nur Einbyte-Zeichensätze; Zeichenindex = Byteindex). */
export function decodeAll(bytes, charset) {
  if (charset === "iso-8859-15" || charset === "windows-1252") {
    try { return new TextDecoder(charset).decode(bytes); } catch { /* weiter mit Tabelle */ }
  }
  const t = table(charset);
  const codes = new Uint16Array(256);
  for (let i = 0; i < 256; i++) codes[i] = t[i].charCodeAt(0);
  const parts = [];
  const CH = 8192;
  const buf = new Uint16Array(CH);
  for (let i = 0; i < bytes.length; i += CH) {
    const n = Math.min(CH, bytes.length - i);
    for (let k = 0; k < n; k++) buf[k] = codes[bytes[i + k]];
    parts.push(String.fromCharCode.apply(null, n === CH ? buf : buf.subarray(0, n)));
  }
  return parts.join("");
}

const encoders = {};
/** Kodiert einen String in den Zeichensatz. Nicht darstellbare Zeichen werden zu "?". */
export function encode(str, charset) {
  if (charset === "utf-8") return new TextEncoder().encode(str);
  if (!encoders[charset]) {
    const t = table(charset);
    const m = new Map();
    for (let i = 255; i >= 0; i--) if (t[i] !== "�") m.set(t[i], i);
    encoders[charset] = m;
  }
  const m = encoders[charset];
  const out = new Uint8Array(str.length);
  let n = 0;
  for (const ch of str) {
    const b = m.get(ch);
    out[n++] = b === undefined ? 0x3f : b;
  }
  return out.subarray(0, n);
}

/** Bytes, die ein Zeichen in diesem Zeichensatz belegt (für Längenberechnung). */
export function byteLength(str, charset) {
  if (charset === "utf-8") return new TextEncoder().encode(str).length;
  let n = 0;
  for (const _ of str) n++;
  return n;
}

const CP437_UMLAUT = new Set([0x81, 0x84, 0x8e, 0x94, 0x99, 0x9a, 0xe1]);
const ISO_UMLAUT = new Set([0xc4, 0xd6, 0xdc, 0xe4, 0xf6, 0xfc, 0xdf]);

/**
 * Untersucht die Bytes ohne Kenntnis des Formats.
 * Liefert Zählwerte, aus denen detectCharset() eine Empfehlung ableitet.
 */
export function byteStats(bytes, limit = 4 * 1024 * 1024) {
  const end = Math.min(bytes.length, limit);
  let high = 0, cp437 = 0, iso = 0, euro = 0, c1 = 0, utf8ok = 0, utf8bad = 0, din = 0;
  for (let i = 0; i < end; i++) {
    const b = bytes[i];
    if (b < 0x80) {
      if (b === 0x5b || b === 0x5c || b === 0x5d || b === 0x7b || b === 0x7c || b === 0x7d || b === 0x7e) {
        const p = i > 0 ? bytes[i - 1] : 0;
        if ((p >= 0x41 && p <= 0x5a) || (p >= 0x61 && p <= 0x7a)) din++;
      }
      continue;
    }
    high++;
    if (CP437_UMLAUT.has(b)) cp437++;
    if (ISO_UMLAUT.has(b)) iso++;
    if (b === 0xa4) euro++;
    if (b >= 0x80 && b <= 0x9f) c1++;
    // UTF-8 Folge prüfen
    let need = 0;
    if (b >= 0xc2 && b <= 0xdf) need = 1;
    else if (b >= 0xe0 && b <= 0xef) need = 2;
    else if (b >= 0xf0 && b <= 0xf4) need = 3;
    if (need) {
      let ok = i + need < bytes.length;
      for (let k = 1; ok && k <= need; k++) if ((bytes[i + k] & 0xc0) !== 0x80) ok = false;
      if (ok) { utf8ok++; i += need; high += 0; continue; }
    }
    utf8bad++;
  }
  return { high, cp437, iso, euro, c1, utf8ok, utf8bad, din };
}

/**
 * Wählt einen Zeichensatz.
 * declared: Zeichensatz laut Datei (Feld 9106 oder Dateiname) oder null
 * fallback: Vorgabe der Spezifikation für das erkannte Format
 */
export function detectCharset(stats, declared, fallback) {
  const guesses = [];
  if (stats.high === 0) {
    if (declared) return { charset: declared, source: "Angabe in der Datei", confidence: "hoch", candidates: [declared] };
    return { charset: fallback, source: "keine Sonderzeichen in der Datei", confidence: "hoch", candidates: [fallback] };
  }
  if (stats.utf8ok > 0 && stats.utf8bad === 0) guesses.push("utf-8");
  if (stats.cp437 > stats.iso && stats.cp437 > 0) guesses.push("cp437");
  if (stats.iso >= stats.cp437 && stats.iso > 0) guesses.push(stats.euro > 0 ? "iso-8859-15" : fallback === "iso-8859-1" ? "iso-8859-1" : "iso-8859-15");
  if (!guesses.length) guesses.push(fallback);
  const detected = guesses[0];
  if (declared) {
    const compatible =
      declared === detected ||
      (declared.startsWith("iso-8859") && detected.startsWith("iso-8859"));
    if (compatible) return { charset: declared, source: "Angabe in der Datei", confidence: "hoch", candidates: [declared, ...guesses] };
    return {
      charset: detected,
      source: "Erkennung anhand der Umlaute (weicht von der Angabe in der Datei ab)",
      confidence: "mittel",
      conflict: { declared, detected },
      candidates: unique([detected, declared, ...guesses]),
    };
  }
  const confidence = Math.max(stats.cp437, stats.iso, stats.utf8ok) >= 3 ? "mittel" : "niedrig";
  return { charset: detected, source: "Erkennung anhand der Umlaute", confidence, candidates: unique([...guesses, fallback]) };
}

function unique(a) {
  return [...new Set(a.filter(Boolean))];
}

/** Prüft, ob dekodierter Text typische Zeichen falscher Dekodierung enthält. */
export function looksBroken(text) {
  return /�|Ã[¤¶¼„–œŸ]|Ã\u009f|â‚¬/.test(text);
}
