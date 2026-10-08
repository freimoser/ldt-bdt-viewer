/**
 * Gemeinsame Logik für Worker und Fallback im Hauptthread.
 * Jede Anfrage: { id, type, ...daten } → { result, transfer }
 */
import { openFile, rowInfo, fkString, fieldLabel, content } from "./core/xdt.js";
import { anonymize } from "./core/anonymize.js";
import { generate } from "./core/generator.js";
import { befundeCsv, rawJsonParts } from "./core/export.js";
import { SOURCES } from "./core/spec.js";

export function createHandler(post, dictUrl) {
  const files = new Map();
  let dictPromise = null;
  const loadDict = () => (dictPromise ||= fetch(dictUrl).then((r) => {
    if (!r.ok) throw new Error("Feldwörterbuch konnte nicht geladen werden.");
    return r.json();
  }));

  function view(m) {
    const s = m.summary;
    return {
      name: m.name, size: m.size, format: m.format, version: m.version, bdtVariant: m.bdtVariant,
      summary: s, charset: {
        charset: m.charset.charset, source: m.charset.source, confidence: m.charset.confidence,
        candidates: m.charset.candidates, conflict: m.charset.conflict || null, declaredBy: m.charset.declaredBy || null,
      },
      issueCounts: m.issueCounts, truncated: m.truncated,
      records: m.records.length, lines: m.lines.n, befunde: (m.befunde || []).length,
      sources: SOURCES,
    };
  }

  function match(q, ...vals) {
    return vals.some((v) => v && String(v).toLowerCase().includes(q));
  }

  function befundeMatches(m, query) {
    const all = m.befunde || [];
    if (!query) return all;
    const q = query.toLowerCase().trim();
    const out = [];
    for (const b of all) {
      const patientHit = match(q, b.patient.last, b.patient.first, b.patient.birth, b.patient.id, b.order, b.labOrder);
      if (patientHit) { out.push(b); continue; }
      const tests = b.tests.filter((t) => match(q, t.id, t.name, ...t.results.flatMap((r) => [r.value, r.unit, r.flagText, ...r.text]), ...t.notes));
      if (tests.length) out.push({ ...b, tests, filtered: true });
    }
    return out;
  }

  function rowMatches(m, query) {
    const q = query.toLowerCase().trim();
    const isFk = /^\d{4}$/.test(q);
    const hits = [];
    const labelHit = new Map();
    for (let i = 0; i < m.lines.n; i++) {
      const f = m.fk[i];
      if (isFk) { if (fkString(f) === q) hits.push(i); continue; }
      if (!labelHit.has(f)) labelHit.set(f, fieldLabel(m, f).toLowerCase().includes(q));
      if (labelHit.get(f) || content(m, i).toLowerCase().includes(q)) hits.push(i);
    }
    return hits;
  }

  function tree(m, from, to) {
    const out = [];
    for (const rec of m.records) {
      if (rec.end < from || rec.start > to) continue;
      const node = { index: rec.index, type: rec.type, label: rec.label || "", start: rec.start + 1, end: rec.end + 1, children: [] };
      const byIdx = new Map();
      for (const oi of collectObjects(m, rec)) {
        const o = m.objects[oi];
        const n = { index: oi, id: o.id, name: o.name, attr: o.attr || "", start: o.start + 1, end: o.end + 1, children: [] };
        byIdx.set(oi, n);
        if (o.parent >= 0 && byIdx.has(o.parent)) byIdx.get(o.parent).children.push(n);
        else node.children.push(n);
      }
      out.push(node);
    }
    return out;
  }

  function collectObjects(m, rec) {
    const list = [];
    for (const o of m.objects) if (o.record === rec.index) list.push(o.index);
    return list;
  }

  return async function handle(msg) {
    switch (msg.type) {
      case "open":
      case "recharset": {
        const dict = await loadDict();
        let bytes, name;
        if (msg.type === "open") { bytes = new Uint8Array(msg.buffer); name = msg.name; }
        else { const old = files.get(msg.file); bytes = old.bytes; name = old.name; }
        const m = openFile(bytes, name, dict, {
          charset: msg.charset || null,
          onProgress: (text, pct) => post({ type: "progress", id: msg.id, text, pct }),
        });
        const key = msg.file || msg.key;
        files.set(key, m);
        return { result: view(m) };
      }
      case "close": files.delete(msg.file); return { result: true };
      case "befunde": {
        const m = files.get(msg.file);
        const list = befundeMatches(m, msg.query);
        const size = msg.size || 20;
        const pages = Math.max(1, Math.ceil(list.length / size));
        const page = Math.min(Math.max(0, msg.page || 0), pages - 1);
        return { result: { items: list.slice(page * size, page * size + size), total: list.length, page, pages, all: (m.befunde || []).length } };
      }
      case "allBefunde": {
        const m = files.get(msg.file);
        return { result: befundeMatches(m, msg.query).slice(0, msg.limit || 5000) };
      }
      case "rows": {
        const m = files.get(msg.file);
        const size = msg.size || 250;
        let index = null;
        if (msg.query) {
          const hits = rowMatches(m, msg.query);
          const pages = Math.max(1, Math.ceil(hits.length / size));
          const page = Math.min(Math.max(0, msg.page || 0), pages - 1);
          const sel = hits.slice(page * size, page * size + size);
          const rows = sel.map((i) => rowInfo(m, i));
          const from = sel.length ? sel[0] : 0, to = sel.length ? sel[sel.length - 1] : 0;
          return { result: { rows, total: hits.length, page, pages, filtered: true, tree: sel.length ? tree(m, from, to) : [] } };
        }
        const total = m.lines.n;
        const pages = Math.max(1, Math.ceil(total / size));
        let page = msg.page || 0;
        if (msg.line) { index = msg.line - 1; page = Math.floor(index / size); }
        page = Math.min(Math.max(0, page), pages - 1);
        const from = page * size, to = Math.min(total, from + size) - 1;
        const rows = [];
        for (let i = from; i <= to; i++) rows.push(rowInfo(m, i));
        return { result: { rows, total, page, pages, filtered: false, tree: tree(m, from, to), focus: index !== null ? index + 1 : null } };
      }
      case "issues": {
        const m = files.get(msg.file);
        let list = m.issues;
        if (msg.sev) list = list.filter((i) => i.sev === msg.sev);
        if (msg.query) { const q = msg.query.toLowerCase(); list = list.filter((i) => i.text.toLowerCase().includes(q) || String(i.line) === q); }
        const size = msg.size || 100;
        const pages = Math.max(1, Math.ceil(list.length / size));
        const page = Math.min(Math.max(0, msg.page || 0), pages - 1);
        return { result: { items: list.slice(page * size, page * size + size), total: list.length, page, pages, counts: m.issueCounts, truncated: m.truncated } };
      }
      case "anonymize": {
        const m = files.get(msg.file);
        const a = anonymize(m);
        const buf = a.bytes.buffer.slice(a.bytes.byteOffset, a.bytes.byteOffset + a.bytes.byteLength);
        return { result: { buffer: buf, name: a.name, report: a.report }, transfer: [buf] };
      }
      case "csv": {
        const m = files.get(msg.file);
        return { result: { text: befundeCsv(m.befunde || []), name: m.name.replace(/\.[^.]+$/, "") + "_befunde.csv" } };
      }
      case "json": {
        const m = files.get(msg.file);
        return { result: { parts: rawJsonParts(m), name: m.name.replace(/\.[^.]+$/, "") + ".json" } };
      }
      case "generate": {
        const g = generate({ format: msg.format, count: msg.count, charset: msg.charset });
        const buf = g.bytes.buffer.slice(g.bytes.byteOffset, g.bytes.byteOffset + g.bytes.byteLength);
        return { result: { buffer: buf, name: g.name, format: g.format }, transfer: [buf] };
      }
      default:
        throw new Error("Unbekannte Anfrage: " + msg.type);
    }
  };
}
