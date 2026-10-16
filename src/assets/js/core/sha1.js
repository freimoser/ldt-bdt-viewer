/** Synchrones SHA-1 (für Feld 9300, KBV LDT 3.2.20 Regel E157). Liefert Kleinbuchstaben-Hex. */
export function sha1Hex(bytes, end = bytes.length) {
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Int32Array(80);
  const fullBlocks = Math.floor(end / 64);
  const tailLen = end - fullBlocks * 64;
  const tail = new Uint8Array(tailLen + 9 <= 64 ? 64 : 128);
  tail.set(bytes.subarray(fullBlocks * 64, end));
  tail[tailLen] = 0x80;
  const bitLenHi = Math.floor((end * 8) / 0x100000000);
  const bitLenLo = (end * 8) >>> 0;
  const t = tail.length;
  tail[t - 8] = (bitLenHi >>> 24) & 255; tail[t - 7] = (bitLenHi >>> 16) & 255;
  tail[t - 6] = (bitLenHi >>> 8) & 255; tail[t - 5] = bitLenHi & 255;
  tail[t - 4] = (bitLenLo >>> 24) & 255; tail[t - 3] = (bitLenLo >>> 16) & 255;
  tail[t - 2] = (bitLenLo >>> 8) & 255; tail[t - 1] = bitLenLo & 255;

  const block = (src, off) => {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = (src[j] << 24) | (src[j + 1] << 16) | (src[j + 2] << 8) | src[j + 3];
    }
    for (let i = 16; i < 80; i++) {
      const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
      w[i] = (x << 1) | (x >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const tmp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) | 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = tmp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  };
  for (let i = 0; i < fullBlocks; i++) block(bytes, i * 64);
  for (let off = 0; off < tail.length; off += 64) block(tail, off);
  return [h0, h1, h2, h3, h4].map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
