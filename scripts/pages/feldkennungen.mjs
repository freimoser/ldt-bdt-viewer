import { esc, href, heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src } from "../lib/layout.mjs";
import { SATZARTEN, SOURCES } from "../../src/assets/js/core/spec.js";

const path = "feldkennungen/";
const crumbs = [["LDT & BDT Viewer", ""], ["Feldkennungen", path]];
const FORMATS = [["ldt2", "LDT 2"], ["ldt3", "LDT 3"], ["bdt", "BDT 3.0"]];

function cut(s, n = 200) {
  s = String(s || "").trim();
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + " …" : s;
}

function fmtCell(e) {
  if (!e) return `<td class="fmt-cell">–</td>`;
  const bits = [];
  // Nur echte Längenangaben zeigen (ein einzelnes „≤“ ohne Zahl ist ein Rest aus der PDF-Tabelle)
  if (e.l && /\d|var/.test(e.l)) bits.push(`Länge ${esc(e.l)}`);
  if (e.t) bits.push(`Typ ${esc(e.t)}`);
  if (e.p) bits.push(`S. ${esc(e.p)}`);
  return `<td class="fmt-cell">✓${bits.length ? " " + bits.join(" · ") : ""}</td>`;
}

export default function ({ dict }) {
  const fks = new Set([...Object.keys(dict.ldt2), ...Object.keys(dict.ldt3), ...Object.keys(dict.bdt)]);
  const list = [...fks].sort();
  const counts = Object.fromEntries(FORMATS.map(([k]) => [k, Object.keys(dict[k]).length]));

  const rowHtml = list.map((fk) => {
    const e = { ldt2: dict.ldt2[fk], ldt3: dict.ldt3[fk], bdt: dict.bdt[fk] };
    const names = [];
    for (const [k, label] of FORMATS) if (e[k]?.n && !names.some((x) => x.n.toLowerCase() === e[k].n.toLowerCase())) names.push({ n: e[k].n, label });
    const name = names.length ? names.map((x, i) => (i === 0 ? esc(x.n) : `<br><span class="muted small">${esc(x.label)}: ${esc(x.n)}</span>`)).join("") : "(ohne Bezeichnung)";
    const notes = [];
    if (e.ldt2?.v) notes.push(`LDT 2: ${esc(cut(e.ldt2.v, 160))}`);
    if (e.ldt3?.d) notes.push(esc(cut(e.ldt3.d, 180)));
    // Offene Fragen der Autoren im BDT-3.0-Entwurf als Zitat kennzeichnen
    else if (e.bdt?.d) notes.push(/\?\?\?/.test(e.bdt.d) ? `<span class="muted small">Wortlaut des BDT-3.0-Entwurfs, dort mit offener Rückfrage:</span> ${esc(cut(e.bdt.d, 160))}` : esc(cut(e.bdt.d, 180)));
    if (e.ldt3?.r) notes.push(`<span class="muted small">Regeln LDT 3: ${esc(e.ldt3.r)}</span>`);
    const formats = FORMATS.filter(([k]) => e[k]).map(([k]) => k).join(" ");
    const search = [fk, ...names.map((x) => x.n)].join(" ").toLowerCase();
    return [fk, `<tr id="fk-${fk}" data-f="${formats}" data-s="${esc(search)}"><td>${fk}</td><td>${name}</td>${fmtCell(e.ldt2)}${fmtCell(e.ldt3)}${fmtCell(e.bdt)}<td>${notes.join("<br>")}</td></tr>`];
  });

  // Eine Tabelle je Tausenderbereich. Der Browser zeichnet nur die Blöcke im sichtbaren Bereich
  // (content-visibility), das hält die Seite auch auf langsamen Praxis-PCs flüssig.
  const groups = new Map();
  for (const [fk, tr] of rowHtml) {
    const d = fk[0];
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(tr);
  }
  const blocks = [...groups].map(([d, trs]) => `<div class="ref-block" style="contain-intrinsic-size:auto ${trs.length * 64}px">
<div class="table-wrap">
<table class="ref-table">
<caption>Feldkennungen ${d}000 bis ${d}999</caption>
<colgroup><col class="c-fk"><col class="c-name"><col class="c-fmt"><col class="c-fmt"><col class="c-fmt"><col></colgroup>
<thead><tr><th scope="col">FK</th><th scope="col">Bezeichnung</th><th scope="col">LDT 2</th><th scope="col">LDT 3</th><th scope="col">BDT 3.0</th><th scope="col">Erläuterung</th></tr></thead>
<tbody>
${trs.join("\n")}
</tbody>
</table>
</div>
</div>`).join("\n");

  const satzTable = (key, title, srcKey, detail) => `<h3>${esc(title)}</h3>
<div class="table-wrap"><table><thead><tr><th scope="col">Satzart (Feld 8000)</th><th scope="col">Bezeichnung</th></tr></thead><tbody>
${Object.entries(SATZARTEN[key]).map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${esc(v)}</td></tr>`).join("\n")}
</tbody></table></div>
<p>${src(srcKey, detail)}</p>`;

  const faq = [
    { q: "Was ist eine Feldkennung?", a: "Eine Feldkennung ist die vierstellige Zahl, die in jeder Zeile einer LDT-, BDT- oder GDT-Datei direkt nach der dreistelligen Längenangabe steht. Sie sagt, was im Feld steht, zum Beispiel 3101 für den Nachnamen oder 8420 für den Ergebniswert." },
    { q: "Warum gibt es eine Feldkennung in LDT 3, aber nicht in LDT 2?", a: "Jede Version hat ihre eigene Feldtabelle. LDT 3 hat viele Felder neu eingeführt, vor allem die Objektattribute 8100 bis 8299, die ein Objekt ankündigen. Umgekehrt gibt es Felder wie 8100 (Satzlänge), die nur in LDT 2 und im klassischen BDT eine Rolle spielen." },
    { q: "Was bedeutet „unbekannt“ im Viewer?", a: "Der Viewer zeigt „unbekannt“, wenn eine Feldkennung in der Feldtabelle der erkannten Version nicht vorkommt. Steht sie in einer anderen Tabelle, nennt der Viewer zusätzlich deren Bedeutung. Häufig sind das herstellereigene Erweiterungen oder Felder einer anderen Version." },
    { q: "Was bedeuten Länge und Typ?", a: "„Länge 8“ heißt: genau 8 Zeichen, „Länge ≤ 60“: höchstens 60 Zeichen, „var“: variabel. Der Typ beschreibt den Inhalt, zum Beispiel num oder n für Ziffern, alnum oder a für Text, date oder d für ein Datum und f für eine Zahl mit Punkt als Dezimaltrennzeichen." },
  ];

  const total = list.length;
  return {
    path,
    title: "LDT Feldkennungen: Referenz für LDT 2, LDT 3 und BDT",
    description: `Alle ${total} Feldkennungen aus LDT 2 (KBV 5.12), LDT 3.2.20 und BDT 3.0 als durchsuchbare Tabelle mit Bedeutung, Länge, Typ und Satzarten.`,
    ogType: "article",
    pageClass: "page-content page-wide",
    minInternalLinks: 3,
    llms: `Durchsuchbare Tabelle aller ${total} Feldkennungen aus LDT 2, LDT 3.2.20 und BDT 3.0 mit Bedeutung, Länge, Typ, Seitenangabe der Quelle und den Satzarten.`,
    jsonld: [
      articleLd({ headline: "LDT Feldkennungen: Referenz für LDT 2, LDT 3 und BDT", description: "Vollständige Referenz der Feldkennungen und Satzarten aus den Spezifikationen LDT 2 (KBV 5.12), LDT 3.2.20 (KBV) und BDT 3.0 (QMS).", path }),
      breadcrumbLd(crumbs),
      faqLd(faq),
    ],
    body: `<main id="inhalt">
${heroHtml({
  crumbs,
  h1: "LDT Feldkennungen: Referenz für LDT 2, LDT 3 und BDT",
  lead: `Feldkennungen sind die vierstelligen Nummern, die in jeder Zeile einer LDT- oder BDT-Datei festlegen, was im Feld steht. Diese Seite listet alle <strong>${total} Feldkennungen</strong> aus den offiziellen Feldtabellen: ${counts.ldt2} aus LDT 2, ${counts.ldt3} aus LDT 3.2.20 und ${counts.bdt} aus BDT 3.0.`,
})}
<div class="prose">
<p>So lesen Sie eine Zeile: In <code>0213101Mustermann</code> ist <code>021</code> die Länge (Inhalt + 9 Bytes), <code>3101</code> die Feldkennung (Nachname) und <code>Mustermann</code> der Inhalt. ${src("ldt3", "Kap. 6.4.1")}</p>
<p>Einzelne Felder schlagen Sie auch direkt im <a href="${href()}#nachschlagen">Viewer</a> nach. Wie Zeilen, Sätze und Objekte zusammenspielen, erklären <a href="${href("was-ist-ldt/")}">Was ist LDT?</a> und <a href="${href("xdt-gdt-ldt-bdt/")}">xDT im Überblick</a>; Meldungen wie „Feldkennung unbekannt“ erläutert die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>.</p>
<h2 id="quellen">Quellen der Tabelle</h2>
<ul>
<li>LDT 2: <a href="${esc(SOURCES.ldt2.url)}">${esc(SOURCES.ldt2.title)}</a>, Feldtabelle Kap. 4.1</li>
<li>LDT 3: <a href="${esc(SOURCES.ldt3.url)}">${esc(SOURCES.ldt3.title)}</a>, Feldtabelle Kap. 9, Regeltabelle Kap. 10</li>
<li>BDT 3.0: <a href="${esc(SOURCES.bdt3.url)}">${esc(SOURCES.bdt3.title)}</a>, Feldtabelle Kap. 6; Feld 8100 (Satzlänge im klassischen BDT): <a href="${esc(SOURCES.bdtClassic.url)}">${esc(SOURCES.bdtClassic.title)}</a></li>
</ul>
<p class="src">Stand 08.10.2026. Die Spalte „S.“ nennt die Seite im jeweiligen Dokument. Die Tabelle wurde automatisch aus den PDF-Dokumenten übernommen; maßgeblich ist immer das Originaldokument.</p>
</div>

<h2 id="tabelle">Alle Feldkennungen</h2>
<div class="ref-search">
<label class="field" for="refFilter">Feldkennung oder Begriff filtern
<input id="refFilter" class="input" type="search" placeholder="z. B. 8420, Geburtsdatum, Einheit" autocomplete="off"></label>
<div class="sev-filter" role="group" aria-label="Format">
<button type="button" class="chip active" aria-pressed="true" data-format="">Alle</button>
<button type="button" class="chip" aria-pressed="false" data-format="ldt2">LDT 2</button>
<button type="button" class="chip" aria-pressed="false" data-format="ldt3">LDT 3</button>
<button type="button" class="chip" aria-pressed="false" data-format="bdt">BDT 3.0</button>
</div>
<p class="muted small" id="refCount" aria-live="polite">${total} Feldkennungen</p>
</div>
<div id="refBlocks">
${blocks}
</div>

<div class="prose">
<h2 id="satzarten">Satzarten</h2>
<p>Die Satzart steht immer im ersten Feld eines Satzes, der Feldkennung 8000.</p>
${satzTable("ldt2", "LDT 2 (LDT1014.01)", "ldt2", "Kap. 2.3.1")}
${satzTable("ldt3", "LDT 3.2.20", "ldt3", "Kap. 6.2")}
${satzTable("bdt", "BDT 3.0 und klassischer BDT", "bdt3", "Kap. 3.6.1")}
</div>
${faqHtml(faq)}
${ctaHtml("Feldkennungen in Ihrer Datei ansehen", "Die Strukturansicht des Viewers zeigt zu jeder Zeile Feldkennung, Bedeutung, Länge und Inhalt.")}
${relatedHtml(["was-ist-ldt/", "ldt-2-vs-ldt-3/", "xdt-gdt-ldt-bdt/", "fehler/"])}
</main>`,
    after: `<script type="module">
const input = document.getElementById("refFilter"), count = document.getElementById("refCount");
const blocks = [...document.querySelectorAll(".ref-block")].map((el) => ({ el, rows: [...el.querySelectorAll("tbody tr")] }));
let fmt = "";
function apply() {
  const q = input.value.trim().toLowerCase();
  let n = 0;
  for (const b of blocks) {
    let shown = 0;
    for (const r of b.rows) {
      const ok = (!q || r.dataset.s.includes(q)) && (!fmt || r.dataset.f.split(" ").includes(fmt));
      r.hidden = !ok;
      if (ok) shown++;
    }
    b.el.hidden = !shown;
    n += shown;
  }
  count.textContent = n + (n === 1 ? " Feldkennung" : " Feldkennungen");
}
let t;
input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(apply, 120); });
for (const b of document.querySelectorAll("[data-format]")) b.addEventListener("click", () => {
  fmt = b.dataset.format;
  for (const x of document.querySelectorAll("[data-format]")) { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on); }
  apply();
});
</script>`,
  };
}
