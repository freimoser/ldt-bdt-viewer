import { SITE, url, href, esc, faqHtml, faqLd, GUIDES } from "../lib/layout.mjs";

const faq = [
  { q: "Wird meine Datei hochgeladen?", a: "Nein. Der Viewer liest die Datei mit JavaScript direkt in Ihrem Browser. Es gibt keinen Server, der Dateien annimmt, keine Cookies und kein Tracking. Sie können das selbst prüfen: Seite laden, Internet trennen und die Datei trotzdem öffnen." },
  { q: "Welche Dateien kann der Viewer öffnen?", a: "LDT 2.x (LDT1014.01), LDT 3.x (aktuell LDT3.2.20) und BDT, sowohl im klassischen Aufbau mit Satzlänge als auch BDT 3.0. Übliche Endungen sind .ldt, .bdt, .dat und .txt. GDT-Dateien werden erkannt; für sie gibt es den <a href=\"https://freimoser.github.io/gdt-viewer/\">GDT Viewer</a>." },
  { q: "Bewertet der Viewer meine Laborwerte?", a: "Nein. Der Viewer zeigt Werte, Einheiten, Normbereiche und Markierungen so an, wie das Labor sie in die Datei geschrieben hat. Er ist kein Medizinprodukt und stellt keine Diagnose." },
  { q: "Was kostet der Viewer?", a: "Nichts. Der LDT &amp; BDT Viewer ist kostenlos und der Quellcode ist öffentlich auf GitHub einsehbar." },
];

export default {
  path: "",
  title: "LDT Viewer – LDT & BDT Dateien online öffnen, ohne Upload",
  description: "Kostenloser LDT Viewer: LDT- und BDT-Dateien öffnen, Laborwerte lesen, Fehler finden, anonymisieren, Testdateien erzeugen. Alles im Browser, kein Upload.",
  ogTitle: "LDT & BDT Viewer – Laborbefunde und Praxis-Exporte lesen",
  ogDescription: "LDT-Laborbefunde und BDT-Exporte verständlich anzeigen, prüfen und anonymisieren – direkt im Browser, ohne Upload.",
  pageClass: "page-tool",
  jsonld: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      alternateName: ["LDT Viewer", "BDT Viewer"],
      url: url(),
      description: "Kostenloser Viewer für LDT-Dateien (Labordatenträger) und BDT-Dateien (Behandlungsdatenträger). Anzeige, Prüfung, Anonymisierung und Testdaten, vollständig im Browser.",
      applicationCategory: "HealthApplication",
      operatingSystem: "Alle Betriebssysteme mit aktuellem Browser",
      browserRequirements: "JavaScript erforderlich",
      inLanguage: "de-DE",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      featureList: [
        "LDT 2.x, LDT 3.x und BDT öffnen",
        "Automatische Erkennung von Format, Version und Zeichensatz",
        "Befundansicht mit Werten, Einheiten, Normbereichen und Markierungen",
        "Strukturansicht mit Sätzen, Objekten und Rohzeilen",
        "Prüfung mit zeilengenauen Fehlermeldungen",
        "Anonymisieren für Support-Anfragen",
        "Export als CSV, JSON und Druckansicht",
        "Generator für LDT- und BDT-Testdateien",
        "Feldkennungen nachschlagen",
        "Keine Datenübertragung an Server",
      ],
      author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: url(),
      inLanguage: "de-DE",
      description: SITE.tagline,
      publisher: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    },
    faqLd(faq),
  ],
  body: `<header class="header">
<div class="brand">
<span class="logo" aria-hidden="true">LDT</span>
<div>
<h1>LDT &amp; BDT Viewer</h1>
<p class="tagline">${esc(SITE.tagline)}</p>
</div>
</div>
<p class="privacy-badge"><span class="dot" aria-hidden="true"></span>100 % lokal – nichts wird hochgeladen</p>
</header>

<main id="inhalt">
<section class="card" aria-labelledby="open-title">
<h2 id="open-title">Datei öffnen</h2>
<p class="card-intro">Laborbefund (LDT) oder Export aus der Praxissoftware (BDT) auswählen. Der Viewer erkennt Format, Version und Zeichensatz selbst.</p>
<div id="dropzone" class="dropzone">
<div class="drop-icon" aria-hidden="true"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke-linecap="round"/></svg></div>
<p class="drop-title" id="dropTitle">LDT- oder BDT-Datei hierher ziehen</p>
<p class="drop-sub">oder auswählen · .ldt, .bdt, .dat, .txt · auch mehrere Dateien</p>
<button type="button" class="btn btn-primary btn-lg" id="pickBtn">Datei wählen</button>
<input type="file" id="fileInput" accept=".ldt,.bdt,.dat,.txt,.gdt,text/plain" multiple hidden>
</div>
<div class="privacy-box">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>
<div>
<p><strong>Deine Datei bleibt auf deinem Rechner. Es wird nichts hochgeladen.</strong></p>
<details>
<summary>So prüfst du das selbst</summary>
<ol>
<li>Diese Seite laden, dann das Internet trennen (WLAN aus oder Netzwerkkabel ziehen). Der Viewer öffnet Dateien weiterhin.</li>
<li>Oder die Entwicklerwerkzeuge des Browsers öffnen (Taste F12, Reiter „Netzwerk“) und eine Datei öffnen: Es erscheint keine Übertragung der Datei.</li>
<li>Der Quellcode ist offen: <a href="${SITE.repo}">github.com/freimoser/ldt-bdt-viewer</a>.</li>
</ol>
</details>
</div>
</div>
<div class="examples" role="group" aria-label="Beispieldateien">
<span>Beispiel ausprobieren:</span>
<button type="button" class="btn btn-ghost btn-sm" data-example="Z01BEISPIEL_LDT3.ldt">LDT 3</button>
<button type="button" class="btn btn-ghost btn-sm" data-example="X01BSPL.LDT">LDT 2 (Codepage 437)</button>
<button type="button" class="btn btn-ghost btn-sm" data-example="BEISPIEL_BDT.bdt">BDT</button>
</div>
<p class="disclaimer"><strong>Kein Medizinprodukt.</strong> Dient nur zur Anzeige und Prüfung von Dateien, nicht zur Diagnose.</p>
</section>

<p id="globalError" class="notice notice-err" role="alert" hidden></p>
<div id="progress" class="progress" role="status" hidden><span id="progressText">Datei wird gelesen …</span><progress id="progressBar" max="100" value="0"></progress></div>
<div id="liveRegion" class="sr-only" aria-live="polite"></div>

<section id="workspace" class="workspace" aria-label="Geöffnete Datei" hidden>
<div id="fileTabs" class="file-tabs" aria-label="Geöffnete Dateien"></div>
<div class="toolbar">
<div class="file-meta"><strong id="fileName">–</strong><span id="fileMeta" class="muted small"></span></div>
<div class="toolbar-actions">
<button type="button" class="btn btn-primary btn-sm" id="anonBtn">Anonymisieren</button>
<button type="button" class="btn btn-ghost btn-sm" id="csvBtn">CSV</button>
<button type="button" class="btn btn-ghost btn-sm" id="printBtn">Drucken</button>
<button type="button" class="btn btn-ghost btn-sm" id="jsonBtn">JSON</button>
<button type="button" class="btn btn-ghost btn-sm" id="closeBtn">Schließen</button>
</div>
</div>
<div id="notices"></div>
<div id="summary" class="summary"></div>
<div class="view-bar">
<div id="viewTabs" class="tabs" role="tablist" aria-label="Ansicht"></div>
<div class="search"><label for="searchInput">Suchen und filtern</label><input id="searchInput" class="input" type="search" autocomplete="off"></div>
</div>
<div id="panel" class="panel" role="tabpanel" tabindex="0"></div>
</section>

<section class="card" aria-labelledby="gen-title" id="generator">
<h2 id="gen-title">Testdateien erzeugen</h2>
<p class="card-intro">Für Entwickler und Support: gültige LDT- und BDT-Dateien mit erfundenen Patienten und Werten. Alle Namen beginnen mit „Test-“, Einrichtungen heißen „TESTLABOR“ bzw. „TESTPRAXIS“, die Normbereiche sind erfunden.</p>
<div class="controls">
<label class="field">Format
<select id="genFormat">
<option value="ldt3">LDT 3.2.20 (Befund)</option>
<option value="ldt2">LDT 2.x, LDT1014.01 (Labor-Bericht)</option>
<option value="bdt">BDT, klassischer Aufbau</option>
</select></label>
<label class="field">Anzahl Patienten (1–200)
<input id="genCount" type="number" min="1" max="200" value="3" inputmode="numeric"></label>
<label class="field">Zeichensatz (nur LDT 2)
<select id="genCharset">
<option value="iso-8859-15">ISO 8859-15</option>
<option value="cp437">IBM-Codepage 437</option>
<option value="iso-8859-1">ISO 8859-1</option>
<option value="din66003">7-Bit-Code (DIN 66003)</option>
</select></label>
<div class="actions">
<button type="button" class="btn btn-primary" id="genShowBtn">Erzeugen und anzeigen</button>
<button type="button" class="btn btn-ghost" id="genDownloadBtn">Erzeugen und herunterladen</button>
</div>
</div>
<p class="hint" id="genCharsetHint">LDT 3 und BDT 3.0 schreiben ISO 8859-15 vor; der Zeichensatz ist dort fest.</p>
<p class="hint" id="genHint" aria-live="polite"></p>
</section>

<section class="card" aria-labelledby="lookup-title" id="nachschlagen">
<h2 id="lookup-title">Feldkennung nachschlagen</h2>
<p class="card-intro">Bedeutung, Länge und Typ einer Feldkennung in LDT 2, LDT 3 und BDT 3.0. Die vollständige Tabelle steht unter <a href="${href("feldkennungen/")}">Feldkennungen</a>.</p>
<label class="field" for="lookupInput">Feldkennung oder Begriff
<input id="lookupInput" type="search" placeholder="z. B. 8420 oder Geburtsdatum" autocomplete="off"></label>
<div id="lookupResults" aria-live="polite"></div>
</section>

<section class="card" aria-labelledby="about-title">
<h2 id="about-title">Was der Viewer kann</h2>
<div class="prose">
<p>Der LDT &amp; BDT Viewer öffnet Dateien im xDT-Format, die deutsche Labore und Praxisprogramme austauschen. <strong>LDT</strong> (Labordatenträger) transportiert Laboraufträge und Laborbefunde zwischen Praxis und Labor, <strong>BDT</strong> (Behandlungsdatenträger) dient vor allem dem Export aller Daten beim Wechsel der Praxissoftware. Geräteanbindungen laufen dagegen über GDT; dafür gibt es den <a href="https://freimoser.github.io/gdt-viewer/">GDT Viewer</a> aus derselben Familie.</p>
<ul>
<li><strong>Für Praxisteams:</strong> Befunde als Tabelle mit Wert, Einheit, Normbereich und deutlich markierten auffälligen Werten, so wie das Labor sie gesendet hat.</li>
<li><strong>Für Praxis-IT und Support:</strong> Sätze, Objekte und Rohzeilen mit Feldkennung, Bedeutung und Länge, Prüfung mit Zeilennummer und Erklärung, Anonymisierung für Support-Anfragen.</li>
<li><strong>Für Entwickler:</strong> gültige Testdateien und eine Referenz aller Feldkennungen aus den offiziellen Spezifikationen.</li>
</ul>
<p>Die Feldtabellen stammen aus der LDT-3-Satzbeschreibung 3.2.20 und der Datensatzbeschreibung LDT 5.12 der KBV sowie der BDT-3.0-Satzbeschreibung des QMS. Alle Quellen mit Version und Abrufdatum stehen in der <a href="${SITE.repo}/blob/main/quellen.md">Quellenliste</a>.</p>
</div>
<div class="card-grid">
${GUIDES.slice(0, 6).map(([p, l, d]) => `<a class="card-link" href="${href(p)}"><h3>${esc(l)}</h3><p>${esc(d)}</p></a>`).join("\n")}
</div>
${faqHtml(faq)}
</section>
</main>`,
  after: `<div id="printArea" aria-hidden="true"></div>
<script type="module" src="${href("assets/js/app.js")}"></script>`,
};
