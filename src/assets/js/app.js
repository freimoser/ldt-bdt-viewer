/**
 * LDT & BDT Viewer – Oberfläche.
 * Dateien werden ausschließlich im Browser gelesen. Es gibt keinen Upload und kein Tracking.
 */
import { Engine } from "./engine.js";

const BASE = document.documentElement.dataset.base || "/ldt-bdt-viewer/";
const $ = (id) => document.getElementById(id);
const engine = new Engine(BASE);

/* ------------------------------------------------------------ Hilfen */

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const nf = new Intl.NumberFormat("de-DE");
function plural(n, one, many) { return `${nf.format(n)} ${n === 1 ? one : many}`; }
function sizeText(b) { return b < 1024 ? `${b} Bytes` : b < 1048576 ? `${(b / 1024).toFixed(1).replace(".", ",")} KB` : `${(b / 1048576).toFixed(1).replace(".", ",")} MB`; }

function announce(text) {
  const r = $("liveRegion");
  r.textContent = "";
  setTimeout(() => (r.textContent = text), 50);
}

function download(name, data, type = "application/octet-stream") {
  const blob = data instanceof Blob ? data : new Blob(Array.isArray(data) ? data : [data], { type });
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ------------------------------------------------------------ Zustand */

const state = { files: new Map(), current: null, seq: 0 };
const FORMAT_HELP = {
  ldt2: "LDT 2.x (Labordatenträger)",
  ldt3: "LDT 3.x (Labordatenträger)",
  bdt: "BDT (Behandlungsdatenträger)",
  gdt: "GDT (Gerätedatentransfer)",
  unknown: "Unbekanntes Format",
};
const CHARSET_LABEL = {
  "iso-8859-15": "ISO 8859-15 (Latin-9)",
  "iso-8859-1": "ISO 8859-1 (Latin-1)",
  cp437: "IBM-Codepage 437 (DOS)",
  din66003: "7-Bit-Code (DIN 66003)",
  "utf-8": "UTF-8",
  "windows-1252": "Windows-1252",
};

/* ------------------------------------------------------------ Öffnen */

engine.onProgress = (p) => {
  const box = $("progress");
  box.hidden = false;
  $("progressText").textContent = p.text + " …";
  $("progressBar").value = Math.round((p.pct || 0) * 100);
};

async function openBuffer(name, buffer) {
  const key = "f" + ++state.seq;
  $("progress").hidden = false;
  $("progressText").textContent = `„${name}“ wird gelesen …`;
  $("progressBar").value = 0;
  try {
    const view = await engine.call("open", { key, file: key, name, buffer });
    const f = { key, name, view, tab: defaultTab(view), query: "", pages: { befunde: 0, struktur: 0, pruefung: 0 }, sev: "", focusLine: null };
    state.files.set(key, f);
    state.current = key;
    renderAll();
    const s = view.summary;
    announce(`${name} geöffnet: ${FORMAT_HELP[view.format]}, ${plural(s.issues.fehler || 0, "Fehler", "Fehler")}, ${plural(s.issues.warnung || 0, "Warnung", "Warnungen")}.`);
    $("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showGlobalError(`„${name}“ konnte nicht gelesen werden: ${err.message}`);
  } finally {
    $("progress").hidden = true;
  }
}

function defaultTab(view) {
  if ((view.format === "ldt2" || view.format === "ldt3") && view.befunde > 0) return "befunde";
  if (view.issueCounts.fehler > 0 && view.format === "unknown") return "pruefung";
  return "struktur";
}

async function openFiles(fileList) {
  const files = [...fileList];
  for (const file of files) {
    if (file.size > 300 * 1024 * 1024) { showGlobalError(`„${file.name}“ ist größer als 300 MB und wird nicht geöffnet.`); continue; }
    const buffer = await file.arrayBuffer();
    await openBuffer(file.name, buffer);
  }
}

function showGlobalError(text) {
  const box = $("globalError");
  box.textContent = text;
  box.hidden = false;
  announce(text);
}

/* ------------------------------------------------------------ Rendern */

function cur() { return state.files.get(state.current); }

function renderAll() {
  const f = cur();
  $("globalError").hidden = true;
  $("workspace").hidden = !f;
  $("dropTitle").textContent = state.files.size ? "Weitere Datei öffnen" : "LDT- oder BDT-Datei hierher ziehen";
  if (!f) return;
  renderFileTabs();
  renderHead(f);
  renderNotices(f);
  renderSummary(f);
  renderViewTabs(f);
  $("searchInput").value = f.query;
  renderPanel(f);
}

function renderFileTabs() {
  const box = $("fileTabs");
  box.replaceChildren();
  box.hidden = state.files.size < 2;
  for (const f of state.files.values()) {
    const sev = f.view.issueCounts.fehler ? "err" : f.view.issueCounts.warnung ? "warn" : "ok";
    box.append(h("button", {
      type: "button", class: "file-tab" + (f.key === state.current ? " active" : ""), "aria-pressed": f.key === state.current ? "true" : "false",
      onclick: () => { state.current = f.key; renderAll(); },
    }, h("span", { class: "dot dot-" + sev, "aria-hidden": "true" }), f.name));
  }
}

function renderHead(f) {
  $("fileName").textContent = f.name;
  $("fileMeta").textContent = `${sizeText(f.view.size)} · ${plural(f.view.lines, "Zeile", "Zeilen")} · ${plural(f.view.records, "Satz", "Sätze")}`;
  const canAnon = ["ldt2", "ldt3", "bdt"].includes(f.view.format);
  $("anonBtn").disabled = !canAnon;
  $("csvBtn").disabled = !f.view.befunde;
  $("printBtn").disabled = !f.view.befunde;
}

function renderNotices(f) {
  const box = $("notices");
  box.replaceChildren();
  const v = f.view;
  if (v.format === "gdt") {
    box.append(h("div", { class: "notice notice-info", role: "note" },
      h("strong", null, "Das ist eine GDT-Datei" + (v.version ? ` (Version ${v.version})` : "") + "."),
      " GDT (Gerätedatentransfer) verbindet Praxissoftware und medizinische Geräte. Dafür gibt es den passenden ",
      h("a", { href: "https://freimoser.github.io/gdt-viewer/" }, "GDT Viewer"),
      ". Hier sehen Sie die Zeilen trotzdem in der Strukturansicht."));
  }
  if (v.format === "unknown" && v.summary.records === 0 && !v.issueCounts.fehler) {
    box.append(h("div", { class: "notice notice-warn", role: "note" }, "Das Format wurde nicht erkannt."));
  }
  const cs = v.charset;
  if (cs.conflict || cs.confidence === "niedrig") {
    box.append(h("div", { class: "notice notice-warn", role: "note" },
      h("strong", null, "Zeichensatz unsicher. "),
      cs.conflict ? `Die Datei gibt ${CHARSET_LABEL[cs.conflict.declared]} an, die Umlaute passen aber eher zu ${CHARSET_LABEL[cs.conflict.detected]}. ` : "Es gibt nur wenige Umlaute, an denen sich der Zeichensatz erkennen lässt. ",
      "Wenn Namen wie „M?ller“ oder „MÃ¼ller“ erscheinen, wählen Sie unten bei „Zeichensatz“ einen anderen."));
  }
  if (f.lastAnon) box.append(f.lastAnon);
}

function card(label, value, extra) {
  return h("div", { class: "summary-card" }, h("span", { class: "label" }, label), h("span", { class: "value" }, value || "–"), extra || null);
}

function renderSummary(f) {
  const v = f.view, s = v.summary;
  const box = $("summary");
  box.replaceChildren();
  const type = FORMAT_HELP[v.format] || v.format;
  const version = v.format === "bdt" ? (v.bdtVariant === "3.0" ? "BDT 3.0" : "klassischer Aufbau (Satzlänge in 8100)") : v.version || "Version nicht angegeben";
  const shortType = { ldt2: "LDT 2.x", ldt3: "LDT 3.x", bdt: "BDT", gdt: "GDT", unknown: "Unbekannt" }[v.format] || type;
  box.append(card("Dateityp", shortType, h("span", { class: "sub" }, `${version} · ${type.replace(/^[^(]*\(|\)$/g, "")}`)));
  if (s.direction) box.append(card("Richtung", s.direction));
  if (v.format !== "gdt" && v.format !== "unknown") {
    box.append(card("Absender", s.sender || "nicht angegeben"));
    box.append(card("Empfänger", s.receiver || "nicht angegeben"));
  }
  box.append(card("Datum", s.date || "nicht angegeben"));
  box.append(card("Sätze", nf.format(s.records), h("span", { class: "sub" }, plural(s.lines, "Zeile", "Zeilen"))));
  if (v.format === "ldt2" || v.format === "ldt3" || v.format === "bdt") {
    const flagged = s.flagged ? ` · ${nf.format(s.flagged)} markiert` : "";
    box.append(card("Patienten und Befunde", `${plural(s.patients || 0, "Patient", "Patienten")}`, h("span", { class: "sub" }, `${plural(s.befunde || 0, "Befund", "Befunde")} · ${plural(s.tests || 0, "Untersuchung", "Untersuchungen")}${flagged}`)));
  }
  // Zeichensatz mit Umschalter
  const sel = h("select", { id: "charsetSelect", "aria-label": "Zeichensatz wählen" });
  const options = [...new Set([v.charset.charset, ...(v.charset.candidates || []), "iso-8859-15", "iso-8859-1", "cp437", "din66003", "utf-8", "windows-1252"])];
  for (const c of options) sel.append(h("option", { value: c, selected: c === v.charset.charset ? true : null }, CHARSET_LABEL[c] || c));
  sel.addEventListener("change", () => recharset(f, sel.value));
  box.append(h("div", { class: "summary-card summary-wide" },
    h("label", { class: "label", for: "charsetSelect" }, "Zeichensatz"),
    sel,
    h("span", { class: "sub" }, `${v.charset.source}${v.charset.confidence !== "hoch" ? " · Sicherheit: " + v.charset.confidence : ""}`)));
  const ic = v.issueCounts;
  const status = ic.fehler ? "err" : ic.warnung ? "warn" : "ok";
  const checkBtn = h("button", { type: "button", class: "summary-card summary-check status-" + status, onclick: () => switchTab(f, "pruefung") },
    h("span", { class: "label" }, "Prüfung"),
    h("span", { class: "value" }, ic.fehler || ic.warnung ? `${plural(ic.fehler || 0, "Fehler", "Fehler")}, ${plural(ic.warnung || 0, "Warnung", "Warnungen")}` : "Keine Fehler gefunden"),
    h("span", { class: "sub" }, ic.hinweis ? plural(ic.hinweis, "Hinweis", "Hinweise") + " · Details ansehen" : "Details ansehen"));
  box.append(checkBtn);
}

async function recharset(f, charset) {
  $("progress").hidden = false;
  try {
    f.view = await engine.call("recharset", { file: f.key, charset });
    f.pages = { befunde: 0, struktur: 0, pruefung: 0 };
    renderAll();
    announce(`Zeichensatz auf ${CHARSET_LABEL[charset]} umgestellt.`);
  } finally { $("progress").hidden = true; }
}

const TABS = [
  ["befunde", "Befunde"],
  ["struktur", "Struktur"],
  ["pruefung", "Prüfung"],
];

function renderViewTabs(f) {
  const list = $("viewTabs");
  list.replaceChildren();
  for (const [id, label] of TABS) {
    let text = label;
    if (id === "pruefung") { const n = (f.view.issueCounts.fehler || 0) + (f.view.issueCounts.warnung || 0); if (n) text += ` (${nf.format(n)})`; }
    if (id === "befunde") text += ` (${nf.format(f.view.befunde)})`;
    const sel = f.tab === id;
    list.append(h("button", {
      type: "button", role: "tab", id: "tab-" + id, "aria-selected": sel ? "true" : "false", "aria-controls": "panel", tabindex: sel ? "0" : "-1",
      class: "tab" + (sel ? " active" : ""), onclick: () => switchTab(f, id),
    }, text));
  }
  $("panel").setAttribute("aria-labelledby", "tab-" + f.tab);
  $("searchInput").placeholder = f.tab === "befunde" ? "Patient, Untersuchung oder Wert" : f.tab === "struktur" ? "Feldkennung (z. B. 8420), Bedeutung oder Text" : "Text oder Zeilennummer";
}

function switchTab(f, id, opts = {}) {
  f.tab = id;
  if (opts.line) f.focusLine = opts.line;
  renderViewTabs(f);
  renderPanel(f);
  if (opts.focusTab) $("tab-" + id)?.focus();
}

$("viewTabs").addEventListener("keydown", (e) => {
  const f = cur();
  if (!f) return;
  const focusedId = document.activeElement && document.activeElement.id.startsWith("tab-") ? document.activeElement.id.slice(4) : f.tab;
  const idx = TABS.findIndex(([id]) => id === focusedId);
  let next = null;
  if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
  if (e.key === "ArrowLeft") next = (idx + TABS.length - 1) % TABS.length;
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = TABS.length - 1;
  if (next !== null) { e.preventDefault(); switchTab(f, TABS[next][0], { focusTab: true }); }
});

async function renderPanel(f) {
  const panel = $("panel");
  panel.setAttribute("aria-busy", "true");
  try {
    if (f.tab === "befunde") await renderBefunde(f, panel);
    else if (f.tab === "struktur") await renderStruktur(f, panel);
    else await renderPruefung(f, panel);
  } catch (err) {
    panel.replaceChildren(h("p", { class: "notice notice-err" }, "Anzeige nicht möglich: " + err.message));
  } finally {
    panel.removeAttribute("aria-busy");
  }
}

function pager(page, pages, total, unit, go) {
  if (pages <= 1) return h("p", { class: "pager-info muted" }, `${plural(total, unit[0], unit[1])}`);
  return h("nav", { class: "pager", "aria-label": "Seiten" },
    h("button", { type: "button", class: "btn btn-ghost btn-sm", disabled: page === 0 ? true : null, onclick: () => go(page - 1) }, "← Zurück"),
    h("span", { class: "muted" }, `Seite ${nf.format(page + 1)} von ${nf.format(pages)} · ${plural(total, unit[0], unit[1])}`),
    h("button", { type: "button", class: "btn btn-ghost btn-sm", disabled: page >= pages - 1 ? true : null, onclick: () => go(page + 1) }, "Weiter →"));
}

/* ---------------------------------------------------------- Befunde */

function flagInfo(flag) {
  if (!flag) return null;
  if (flag === "N") return { cls: "flag-normal", sym: "●", up: null };
  if (/[+H]/.test(flag)) return { cls: "flag-high", sym: "▲" };
  if (/[-–L]/.test(flag)) return { cls: "flag-low", sym: "▼" };
  return { cls: "flag-other", sym: "!" };
}

function rangeText(r) {
  const parts = [];
  if (r.low !== "" || r.high !== "") parts.push(`${r.low || "…"} – ${r.high || "…"}`);
  if (r.range) parts.push(r.range);
  return parts.join(" · ");
}

async function renderBefunde(f, panel) {
  const res = await engine.call("befunde", { file: f.key, page: f.pages.befunde, size: 20, query: f.query });
  const out = [];
  out.push(h("p", { class: "legend" },
    h("strong", null, "So lesen Sie die Tabelle: "),
    "Markierungen (▲ erhöht, ▼ erniedrigt, ! auffällig) stehen genau so in der Datei, wie das Labor sie gesendet hat. Der Viewer bewertet keine Werte selbst."));
  if (!res.all) {
    out.push(h("p", { class: "empty" }, f.view.format === "ldt2" || f.view.format === "ldt3"
      ? "Diese Datei enthält keine Befundsätze. Aufträge an das Labor (Satzart 8218/8219 bzw. 8215) enthalten noch keine Ergebnisse. Die Inhalte sehen Sie unter „Struktur“."
      : "In dieser Datei wurden keine Laborwerte gefunden. Die Inhalte sehen Sie unter „Struktur“."));
  } else if (!res.total) {
    out.push(h("p", { class: "empty" }, `Keine Treffer für „${f.query}“.`));
  }
  for (const b of res.items) out.push(befundCard(f, b));
  out.push(pager(res.page, res.pages, res.total, ["Befund", "Befunde"], (p) => { f.pages.befunde = p; renderPanel(f); $("panel").scrollIntoView({ block: "start" }); }));
  panel.replaceChildren(...out);
}

function befundCard(f, b) {
  const p = b.patient;
  const name = [p.last, p.first].filter(Boolean).join(", ") || (b.order ? `Auftrag ${b.order}` : "Patient ohne Namen");
  const meta = [];
  if (p.birth) meta.push(`geb. ${p.birth}`);
  if (p.sexText) meta.push(p.sexText);
  if (p.id) meta.push(`Patientennr. ${p.id}`);
  if (b.order) meta.push(`Auftrag ${b.order}`);
  if (b.received) meta.push(`Eingang ${b.received}`);
  if (b.reported) meta.push(`Bericht ${b.reported}`);
  if (b.statusText) meta.push(b.statusText);
  const table = h("table", { class: "befund-table" },
    h("caption", { class: "sr-only" }, `Werte von ${name}`),
    h("thead", null, h("tr", null,
      h("th", { scope: "col" }, "Untersuchung"), h("th", { scope: "col" }, "Ergebnis"), h("th", { scope: "col" }, "Einheit"),
      h("th", { scope: "col" }, "Normbereich"), h("th", { scope: "col" }, "Markierung laut Datei"))));
  const tb = h("tbody");
  for (const t of b.tests) {
    t.results.forEach((r, k) => {
      const fi = flagInfo(r.flag);
      const text = r.text.filter(Boolean).join("\n");
      const tr = h("tr", { class: fi ? fi.cls : "" },
        h("td", { "data-label": "Untersuchung" },
          k === 0 ? h("span", { class: "test-name" }, t.name || t.id || "Untersuchung") : h("span", { class: "muted" }, "weiterer Wert"),
          k === 0 && t.id && t.name ? h("span", { class: "test-id" }, t.id) : null),
        h("td", { "data-label": "Ergebnis", class: "result" }, r.value || null, text ? h("span", { class: "result-text" }, text) : null, !r.value && !text ? "–" : null),
        h("td", { "data-label": "Einheit" }, r.unit || "–"),
        h("td", { "data-label": "Normbereich" }, rangeText(r) || "–"),
        h("td", { "data-label": "Markierung" }, fi
          ? h("span", { class: "flag " + fi.cls }, h("span", { "aria-hidden": "true" }, fi.sym + " "), `${r.flagText} (${r.flag})`)
          : h("span", { class: "muted" }, "keine")));
      tb.append(tr);
    });
    if (t.notes.length) tb.append(h("tr", { class: "note-row" }, h("td", { colspan: "5" }, h("span", { class: "muted" }, "Hinweis: "), t.notes.join(" "))));
  }
  table.append(tb);
  return h("article", { class: "befund" },
    h("header", { class: "befund-head" },
      h("h3", null, name),
      h("p", { class: "befund-meta" }, meta.join(" · ")),
      h("button", { type: "button", class: "link-btn", onclick: () => switchTab(f, "struktur", { line: b.line }) }, `Ab Zeile ${nf.format(b.line)} in der Struktur zeigen`)),
    h("div", { class: "table-wrap" }, table),
    b.notes.length ? h("p", { class: "befund-notes" }, h("strong", null, "Hinweise: "), b.notes.join(" ")) : null,
    b.filtered ? h("p", { class: "muted" }, "Gefiltert: nur passende Untersuchungen werden gezeigt.") : null);
}

/* ---------------------------------------------------------- Struktur */

async function renderStruktur(f, panel) {
  const req = { file: f.key, page: f.pages.struktur, size: 250, query: f.query };
  if (f.focusLine && !f.query) req.line = f.focusLine;
  const res = await engine.call("rows", req);
  f.pages.struktur = res.page;
  const focus = f.focusLine;
  f.focusLine = null;

  const tree = h("nav", { class: "tree", "aria-label": "Sätze und Objekte" });
  const ul = h("ul");
  const nodeEls = new Map();
  const addNode = (parentUl, n, kind) => {
    const label = kind === "rec" ? `Satz ${n.type}${n.label ? " · " + n.label : ""}` : `${n.attr ? n.attr.replace(/_/g, " ") : n.name} (${n.id})`;
    const btn = h("button", { type: "button", class: "tree-node tree-" + kind, dataset: { start: n.start },
      onclick: () => selectLine(n.start, true) }, h("span", { class: "tree-label" }, label), h("span", { class: "tree-line" }, `Z. ${nf.format(n.start)}`));
    const li = h("li", null, btn);
    nodeEls.set(kind + n.index, btn);
    if (n.children.length) {
      const sub = h("ul");
      for (const c of n.children) addNode(sub, c, "obj");
      li.append(sub);
    }
    parentUl.append(li);
  };
  for (const r of res.tree) addNode(ul, r, "rec");
  tree.append(h("p", { class: "tree-title" }, res.filtered ? "Sätze der Treffer" : "Sätze dieser Seite"), ul);

  const table = h("table", { class: "rows" },
    h("caption", { class: "sr-only" }, "Rohzeilen der Datei"),
    h("thead", null, h("tr", null, h("th", { scope: "col" }, "Zeile"), h("th", { scope: "col" }, "Länge"), h("th", { scope: "col" }, "Feld"), h("th", { scope: "col" }, "Bedeutung"), h("th", { scope: "col" }, "Inhalt"))));
  const tb = h("tbody");
  const rowEls = new Map();
  for (const r of res.rows) {
    const lenBad = r.len && Number(r.len) !== r.actual;
    const sevTxt = r.sev === 3 ? "Fehler" : r.sev === 2 ? "Warnung" : r.sev === 1 ? "Hinweis" : "";
    const tr = h("tr", { class: `sev-${r.sev}${r.known ? "" : " unknown"}`, dataset: { line: r.line, rec: r.rec, obj: r.obj } },
      h("td", { class: "col-line" }, h("button", { type: "button", class: "line-btn", "aria-label": `Zeile ${r.line} auswählen`, onclick: () => selectLine(r.line, false) }, nf.format(r.line)),
        sevTxt ? h("span", { class: "sev-mark", title: sevTxt }, h("span", { class: "sr-only" }, sevTxt), h("span", { "aria-hidden": "true" }, r.sev === 3 ? "✖" : r.sev === 2 ? "⚠" : "ℹ")) : null),
      h("td", { class: "col-len" + (lenBad ? " bad" : "") }, r.len || "–", lenBad ? h("span", { class: "len-should" }, ` (richtig: ${String(r.actual).padStart(3, "0")})`) : null),
      h("td", { class: "col-id" }, r.fk || "–"),
      h("td", { class: "col-label", style: r.depth ? `padding-left:${0.9 + Math.min(r.depth, 8) * 0.8}rem` : null }, r.label),
      h("td", { class: "col-value" }, r.content));
    rowEls.set(r.line, tr);
    tb.append(tr);
  }
  table.append(tb);

  function selectLine(line, fromTree) {
    const tr = rowEls.get(line);
    if (!tr) { f.focusLine = line; f.query = ""; $("searchInput").value = ""; renderPanel(f); return; }
    for (const el of tb.querySelectorAll("tr.selected")) el.classList.remove("selected");
    tr.classList.add("selected");
    for (const el of tree.querySelectorAll(".tree-node.active")) el.classList.remove("active");
    const node = nodeEls.get("obj" + tr.dataset.obj) || nodeEls.get("rec" + tr.dataset.rec);
    if (node) { node.classList.add("active"); node.scrollIntoView({ block: "nearest" }); }
    tr.scrollIntoView({ block: fromTree ? "start" : "nearest" });
    if (fromTree) tr.querySelector(".line-btn")?.focus({ preventScroll: true });
  }

  const goto = h("form", { class: "goto", onsubmit: (e) => { e.preventDefault(); const n = parseInt(gi.value, 10); if (n > 0) { f.focusLine = Math.min(n, f.view.lines); f.query = ""; $("searchInput").value = ""; renderPanel(f); } } });
  const gi = h("input", { type: "number", min: "1", max: String(f.view.lines), inputmode: "numeric", id: "gotoLine", class: "input input-sm" });
  goto.append(h("label", { for: "gotoLine" }, "Gehe zu Zeile"), gi, h("button", { type: "submit", class: "btn btn-ghost btn-sm" }, "Anzeigen"));

  panel.replaceChildren(
    h("div", { class: "struct-tools" }, goto, h("p", { class: "muted" }, "Klick auf eine Zeilennummer markiert Satz und Objekt im Baum, Klick im Baum springt zur Zeile.")),
    h("div", { class: "struct" }, tree, h("div", { class: "table-wrap rows-wrap" }, table)),
    pager(res.page, res.pages, res.total, res.filtered ? ["Treffer", "Treffer"] : ["Zeile", "Zeilen"], (p) => { f.pages.struktur = p; renderPanel(f); }));
  if (focus) selectLine(focus, true);
}

/* ---------------------------------------------------------- Prüfung */

const SEV_LABEL = { fehler: "Fehler", warnung: "Warnung", hinweis: "Hinweis" };

async function renderPruefung(f, panel) {
  const res = await engine.call("issues", { file: f.key, page: f.pages.pruefung, size: 100, sev: f.sev, query: f.query });
  const c = res.counts;
  const filters = h("div", { class: "sev-filter", role: "group", "aria-label": "Nach Schwere filtern" });
  for (const [sev, label] of [["", `Alle (${nf.format((c.fehler || 0) + (c.warnung || 0) + (c.hinweis || 0))})`], ["fehler", `Fehler (${nf.format(c.fehler || 0)})`], ["warnung", `Warnungen (${nf.format(c.warnung || 0)})`], ["hinweis", `Hinweise (${nf.format(c.hinweis || 0)})`]]) {
    filters.append(h("button", { type: "button", class: "chip" + (f.sev === sev ? " active" : ""), "aria-pressed": f.sev === sev ? "true" : "false", onclick: () => { f.sev = sev; f.pages.pruefung = 0; renderPanel(f); } }, label));
  }
  const out = [filters];
  if (!res.total) {
    out.push(h("div", { class: "notice notice-ok" },
      h("strong", null, f.sev || f.query ? "Keine passenden Meldungen." : "Keine Fehler gefunden."),
      " Geprüft wurden Zeilenaufbau (Länge, Feldkennung, Zeilenende), Zeichensatz, Satzarten und Reihenfolge, Pflichtfelder, Feldlängen, Feldtypen, erlaubte Werte, Version",
      f.view.format === "ldt2" ? ", Satzlänge 8100 und Gesamtlänge 9202." : f.view.format === "ldt3" ? ", Objektverschachtelung und Prüfsumme 9300." : "."));
  }
  const list = h("ol", { class: "issues" });
  for (const i of res.items) {
    list.append(h("li", { class: "issue issue-" + i.sev },
      h("span", { class: "badge badge-" + i.sev }, SEV_LABEL[i.sev]),
      h("div", { class: "issue-body" },
        h("p", { class: "issue-text" }, i.text),
        h("details", null, h("summary", null, "Was bedeutet das in der Praxis?"), h("p", null, i.why)),
        i.line ? h("button", { type: "button", class: "link-btn", onclick: () => switchTab(f, "struktur", { line: i.line }) }, `Zeile ${nf.format(i.line)} in der Struktur zeigen`) : null)));
  }
  if (res.items.length) out.push(list);
  if (res.truncated) out.push(h("p", { class: "muted" }, "Sehr viele gleichartige Meldungen: Pro Art werden höchstens 300 aufgelistet, gezählt werden alle."));
  out.push(pager(res.page, res.pages, res.total, ["Meldung", "Meldungen"], (p) => { f.pages.pruefung = p; renderPanel(f); }));
  panel.replaceChildren(...out);
}

/* ---------------------------------------------------------- Aktionen */

$("searchInput").addEventListener("input", debounce((e) => {
  const f = cur();
  if (!f) return;
  f.query = e.target.value.trim();
  f.pages[f.tab] = 0;
  renderPanel(f);
}, 300));

$("anonBtn").addEventListener("click", async () => {
  const f = cur();
  const btn = $("anonBtn");
  btn.disabled = true;
  try {
    const res = await engine.call("anonymize", { file: f.key });
    download(res.name, new Uint8Array(res.buffer));
    const r = res.report;
    const parts = [];
    if (r.names) parts.push(plural(r.names, "Name", "Namen"));
    if (r.births) parts.push(plural(r.births, "Geburtsdatum", "Geburtsdaten"));
    if (r.addresses) parts.push(plural(r.addresses, "Adressangabe", "Adressangaben"));
    if (r.insurance) parts.push(plural(r.insurance, "Versichertennummer", "Versichertennummern"));
    if (r.phones) parts.push(plural(r.phones, "Telefon- oder Mailangabe", "Telefon- und Mailangaben"));
    if (r.ids) parts.push(plural(r.ids, "Patientennummer", "Patientennummern"));
    if (r.freeText) parts.push(`${nf.format(r.freeText)} Treffer in Freitexten`);
    const buffer = res.buffer;
    f.lastAnon = h("div", { class: "notice notice-ok", role: "status" },
      h("strong", null, `Anonymisierte Datei gespeichert: ${res.name}. `),
      `Ersetzt: ${parts.join(", ") || "keine personenbezogenen Felder gefunden"}.`,
      r.removedAttachments ? ` ${plural(r.removedAttachments, "eingebetteter Anhang wurde", "eingebettete Anhänge wurden")} entfernt, weil sie Patientendaten enthalten können.` : "",
      " Alle Längenangaben wurden neu berechnet. Bitte prüfen Sie die Datei vor dem Versand trotzdem kurz. ",
      h("button", { type: "button", class: "link-btn", onclick: () => openBuffer(res.name, buffer.slice(0)) }, "Anonymisierte Datei hier öffnen und prüfen"));
    renderNotices(f);
    announce("Anonymisierte Datei wurde heruntergeladen.");
  } catch (err) {
    showGlobalError("Anonymisieren nicht möglich: " + err.message);
  } finally { btn.disabled = false; }
});

$("csvBtn").addEventListener("click", async () => {
  const f = cur();
  const res = await engine.call("csv", { file: f.key });
  download(res.name, res.text, "text/csv;charset=utf-8");
});

$("jsonBtn").addEventListener("click", async () => {
  const f = cur();
  const res = await engine.call("json", { file: f.key });
  download(res.name, res.parts, "application/json");
});

$("closeBtn").addEventListener("click", async () => {
  const f = cur();
  await engine.call("close", { file: f.key });
  state.files.delete(f.key);
  state.current = [...state.files.keys()].pop() || null;
  renderAll();
  if (!state.current) $("dropzone").focus();
});

$("printBtn").addEventListener("click", async () => {
  const f = cur();
  const list = await engine.call("allBefunde", { file: f.key, query: f.query, limit: 3000 });
  const area = $("printArea");
  area.replaceChildren(
    h("h1", null, `Befundübersicht: ${f.name}`),
    h("p", null, `${FORMAT_HELP[f.view.format]} ${f.view.version || ""} · gedruckt am ${new Date().toLocaleDateString("de-DE")} · LDT & BDT Viewer`),
    h("p", { class: "print-disclaimer" }, "Kein Medizinprodukt. Darstellung der Datei, keine Diagnose. Markierungen stammen aus der Datei."),
    ...list.map((b) => befundCard(f, b)));
  window.print();
});
window.addEventListener("afterprint", () => $("printArea").replaceChildren());

/* ------------------------------------------------------------ Datei-Feld */

const dz = $("dropzone");
const input = $("fileInput");
$("pickBtn").addEventListener("click", () => input.click());
input.addEventListener("change", () => { if (input.files.length) openFiles(input.files); input.value = ""; });
["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("dragover"); }));
["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("dragover"); }));
dz.addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) openFiles(e.dataTransfer.files); });
// Dateien, die neben das Feld fallen, nicht im Browser öffnen
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => { e.preventDefault(); if (e.target.closest && !e.target.closest("#dropzone") && e.dataTransfer?.files?.length) openFiles(e.dataTransfer.files); });

for (const btn of document.querySelectorAll("[data-example]")) {
  btn.addEventListener("click", async () => {
    const file = btn.dataset.example;
    btn.disabled = true;
    try {
      const r = await fetch(BASE + "beispiele/" + file);
      if (!r.ok) throw new Error("Beispieldatei nicht gefunden");
      await openBuffer(file, await r.arrayBuffer());
    } catch (err) { showGlobalError(err.message); }
    finally { btn.disabled = false; }
  });
}

/* ------------------------------------------------------------ Generator */

const genFormat = $("genFormat"), genCharset = $("genCharset");
function syncGen() { genCharset.disabled = genFormat.value !== "ldt2"; $("genCharsetHint").hidden = genFormat.value === "ldt2"; }
genFormat.addEventListener("change", syncGen);
syncGen();

async function runGenerator(show) {
  const count = Math.max(1, Math.min(200, parseInt($("genCount").value, 10) || 3));
  $("genCount").value = count;
  const res = await engine.call("generate", { format: genFormat.value, count, charset: genCharset.value });
  if (show) await openBuffer(res.name, res.buffer);
  else download(res.name, new Uint8Array(res.buffer));
  $("genHint").textContent = `Erzeugt: ${res.name} mit ${plural(count, "erfundenem Patienten", "erfundenen Patienten")}.`;
}
$("genShowBtn").addEventListener("click", () => runGenerator(true));
$("genDownloadBtn").addEventListener("click", () => runGenerator(false));

/* ------------------------------------------------------------ Nachschlagen */

let dictPromise = null;
const loadDict = () => (dictPromise ||= fetch(BASE + "assets/data/felder.json").then((r) => r.json()));
const lookupInput = $("lookupInput");
const FMT = [["ldt2", "LDT 2"], ["ldt3", "LDT 3"], ["bdt", "BDT 3.0"]];

async function lookup(q) {
  const out = $("lookupResults");
  q = q.trim();
  if (!q) { out.replaceChildren(); return; }
  const d = await loadDict();
  const ql = q.toLowerCase();
  const fks = new Map();
  for (const [key] of FMT) {
    for (const [fk, e] of Object.entries(d[key])) {
      const hit = /^\d{1,4}$/.test(q) ? fk.startsWith(q) : (e.n || "").toLowerCase().includes(ql) || (ql.length > 3 && (e.d || "").toLowerCase().includes(ql));
      if (hit) { if (!fks.has(fk)) fks.set(fk, {}); fks.get(fk)[key] = e; }
    }
  }
  const sorted = [...fks.entries()].sort((a, b) => {
    const exact = (x) => (x[0] === q ? -1 : 0);
    return exact(a) - exact(b) || a[0].localeCompare(b[0]);
  }).slice(0, 40);
  if (!sorted.length) {
    out.replaceChildren(h("p", { class: "muted" }, /^\d{4}$/.test(q) ? `Feldkennung ${q} kommt in keiner der drei Feldtabellen vor (unbekannt).` : `Kein Treffer für „${q}“.`));
    return;
  }
  const list = h("ul", { class: "lookup-list" });
  for (const [fk, per] of sorted) {
    const any = per.ldt3 || per.ldt2 || per.bdt;
    list.append(h("li", null,
      h("a", { href: `${BASE}feldkennungen/#fk-${fk}`, class: "lookup-fk" }, fk),
      h("div", null,
        h("strong", null, any.n || "(ohne Bezeichnung)"),
        h("ul", { class: "lookup-formats" }, ...FMT.filter(([k]) => per[k]).map(([k, label]) => h("li", null, h("span", { class: "fmt" }, label), ` ${per[k].n}${per[k].l ? ` · Länge ${per[k].l}` : ""}${per[k].t ? ` · Typ ${per[k].t}` : ""}`))),
        FMT.some(([k]) => !per[k]) ? h("span", { class: "muted small" }, `Nicht in: ${FMT.filter(([k]) => !per[k]).map(([, l]) => l).join(", ")}`) : null)));
  }
  out.replaceChildren(h("p", { class: "muted small" }, `${plural(fks.size, "Treffer", "Treffer")}${fks.size > 40 ? " (die ersten 40)" : ""}`), list);
}
lookupInput.addEventListener("input", debounce(() => lookup(lookupInput.value), 200));
lookupInput.addEventListener("focus", () => loadDict(), { once: true });

/* ------------------------------------------------------------ Offline */

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register(BASE + "sw.js", { scope: BASE }).catch(() => {}));
}
