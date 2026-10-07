/** Export der Befundtabelle (CSV für Excel) und der Rohdaten (JSON). */
import { rowInfo } from "./xdt.js";

const CSV_HEAD = ["Patient", "Geburtsdatum", "Geschlecht", "Patientennummer", "Auftragsnummer", "Berichtsdatum", "Satzart", "Test-Kürzel", "Untersuchung", "Ergebnis", "Einheit", "Normbereich", "Markierung laut Datei", "Ergebnistext", "Hinweise", "Zeile"];

function cell(v) {
  let s = String(v ?? "");
  // Zahlen mit Dezimalpunkt für deutsches Excel mit Komma ausgeben
  if (/^[+-]?\d+\.\d+$/.test(s)) s = s.replace(".", ",");
  // Schutz vor Formel-Injektion in Tabellenprogrammen
  if (/^[=@+\t\r]/.test(s)) s = "'" + s;
  if (/[;"\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function rangeText(res) {
  const parts = [];
  if (res.low !== "" || res.high !== "") parts.push(`${res.low || "…"} – ${res.high || "…"}`);
  if (res.range) parts.push(res.range);
  return parts.join(" ");
}

/** Liefert den CSV-Text inklusive UTF-8-BOM. */
export function befundeCsv(befunde) {
  const rows = [CSV_HEAD];
  for (const b of befunde) {
    const name = [b.patient.last, b.patient.first].filter(Boolean).join(", ");
    for (const t of b.tests) {
      for (const r of t.results) {
        rows.push([
          name, b.patient.birth || "", b.patient.sex || "", b.patient.id || "", b.order || b.labOrder || "", b.reported || "", b.satzart,
          t.id, t.name, r.value, r.unit, rangeText(r),
          r.flag ? `${r.flagText} (${r.flag})` : "", r.text.join(" "), t.notes.join(" "), r.line || t.line,
        ]);
      }
    }
  }
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n") + "\r\n";
}

/** JSON in Teilen (für große Dateien), als Array von Strings für einen Blob. */
export function rawJsonParts(m) {
  const parts = [];
  const head = {
    datei: m.name, groesseBytes: m.size, format: m.summary.formatLabel, version: m.version || null,
    zeichensatz: m.charset.charset, zusammenfassung: m.summary,
    pruefung: { anzahl: m.issueCounts, meldungen: m.issues },
    befunde: m.befunde,
  };
  const json = JSON.stringify(head, null, 1);
  parts.push(json.slice(0, -2) + ',\n "saetze": [\n');
  m.records.forEach((rec, k) => {
    const fields = [];
    for (let i = rec.start; i <= rec.end; i++) {
      const r = rowInfo(m, i);
      const f = { zeile: r.line, laenge: r.len, feldkennung: r.fk, bedeutung: r.label, inhalt: r.content };
      if (r.obj >= 0) f.objekt = m.objects[r.obj].id;
      fields.push(f);
    }
    parts.push((k ? ",\n" : "") + JSON.stringify({ satzart: rec.type, bezeichnung: rec.label || "", ab_zeile: rec.start + 1, felder: fields }));
  });
  parts.push("\n ]\n}\n");
  return parts;
}
