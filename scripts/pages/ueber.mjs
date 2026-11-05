import { heroHtml, breadcrumbLd, href, url, esc, SITE, LEGAL, PERSON_LD } from "../lib/layout.mjs";

// Herkunft und Arbeitsweise: nur Aussagen, die das Repository selbst belegt (Workflow, Skripte, Lizenzen)
const path = "ueber/";
const crumbs = [["LDT & BDT Viewer", ""], ["Über diese Website", path]];
const title = "Über den LDT & BDT Viewer: Quellen, Prüfung, Grenzen";
const description = "Wer den LDT & BDT Viewer betreibt, auf welchen Spezifikationen er beruht, wie er vor jeder Veröffentlichung geprüft wird und wo seine Grenzen liegen.";
const h1 = "Über diese Website: Quellen, Prüfung und Grenzen";
const UPDATED = "2026-10-26";
const STAND = "26.10.2026";
const ISSUES = SITE.repo + "/issues";

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `Der LDT &amp; BDT Viewer ist ein kostenloses, quelloffenes Projekt von ${esc(LEGAL.operator)}. Er liest LDT- und BDT-Dateien nur im Browser und erklärt die Formate auf Grundlage der veröffentlichten Spezifikationen von KBV und QMS. Diese Seite beschreibt, woher die Inhalte stammen, wie sie geprüft werden und was die Website nicht leistet.`,
  stand: STAND,
})}
<div class="prose">
<h2 id="betreiber">Wer die Website betreibt</h2>
<p>Betreiber und Verantwortlicher ist ${esc(LEGAL.operator)}; Anschrift und Kontakt stehen im <a href="${href("impressum/")}">Impressum</a>. Die Website ist kein Angebot eines Praxissoftware-Herstellers, eines Labors oder der KBV und finanziert sich nicht über Werbung. Sie setzt keine Cookies und misst nichts (<a href="${href("datenschutz/")}">Datenschutz</a>).</p>

<h2 id="quellen">Woher die Inhalte stammen</h2>
<ul>
<li><strong>Primärquellen:</strong> die Satz- und Datensatzbeschreibungen der KBV (LDT 3.2.20, LDT 5.12, KVDT 6.08, Prüfpaket und FAQ zur Labordatenkommunikation) und des QMS (BDT 3.0 Version 0.96, GDT 2.1). Wo eine Primärquelle nicht öffentlich ist, etwa BDT 02/94, ist die Ersatzquelle als solche gekennzeichnet.</li>
<li><strong>Beleg an jeder Aussage:</strong> Jede Faktenaussage nennt im Text Stand und Quelle mit Kapitel, Regel oder Seite. Die vollständige Liste mit Version und Abrufdatum steht unter <a href="${href("quellen/")}">Quellen</a>.</li>
<li><strong>Feldtabellen aus den PDFs:</strong> Die Feldkennungen, Regeln und der LDT-3-Objektkatalog werden mit Skripten aus den Spezifikationen gelesen, nicht abgetippt. Durchgestrichene Änderungsmarkierungen im BDT-3.0-Dokument werden dabei verworfen.</li>
<li><strong>Erfundene Beispieldaten:</strong> Alle Beispieldateien und Bildschirmfotos enthalten erfundene Personen und Werte.</li>
</ul>

<h2 id="pruefung">Wie geprüft wird, bevor etwas online geht</h2>
<p>Jede Änderung läuft vor der Veröffentlichung automatisch durch diese Schritte; schlägt einer fehl, wird nicht veröffentlicht:</p>
<ol>
<li><strong>Tests des Prüfkerns:</strong> Erkennung von Format, Version und Zeichensatz, Prüfregeln, Anonymisierung, Export und alle Beispieldateien mit ihren erwarteten Meldungen.</li>
<li><strong>Build mit Inhaltsprüfung:</strong> Länge und Eindeutigkeit von Titeln und Beschreibungen, genau eine Hauptüberschrift je Seite, alle internen Links und die Sprungziele der Kurzantworten für KI-Assistenten.</li>
<li><strong>Livegang-Prüfung:</strong> Impressum und Datenschutz, Canonical, Sitemap gegen <code>noindex</code>, strukturierte Daten gegen die sichtbare Seite, Vorschaubilder und dass keine fremden Server eingebunden sind.</li>
</ol>
<p>Zusätzlich prüfen Browser-Tests die Bedienung mit Tastatur, auf 360 Pixel Breite, offline und mit einer Datei über 20 MB, und eine Barrierefreiheitsprüfung alle Seiten und Ansichten. Der gesamte Ablauf ist im <a href="${SITE.repo}">Quellcode auf GitHub</a> nachvollziehbar.</p>

<h2 id="grenzen">Was die Website nicht leistet</h2>
<ul>
<li>Der Viewer ist <strong>kein Medizinprodukt</strong>. Er bewertet keine Laborwerte und stellt keine Diagnosen; Markierungen wie „erhöht“ stammen vom Labor.</li>
<li>Die Prüfung ersetzt weder das Prüfmodul der KBV in der Praxissoftware noch eine Zertifizierung.</li>
<li>Für BDT 3.0 liegt öffentlich nur Version 0.96 vor; die 2017 freigegebene Fassung ist nicht zugänglich. Einzelheiten können dort abweichen.</li>
</ul>

<h2 id="fehler-melden">Fehler melden und mitmachen</h2>
<p>Haben Sie einen Fehler gefunden, eine Datei, die falsch erkannt wird, oder eine Aussage, die nicht zur Quelle passt? Melden Sie es bitte als <a href="${ISSUES}">Issue auf GitHub</a> oder per E-Mail (Adresse im <a href="${href("impressum/")}">Impressum</a>). Schicken Sie keine echten Patientendaten; die Funktion „Anonymisieren“ im Viewer erzeugt eine Kopie ohne Namen, Geburtsdaten und Anhänge.</p>

<h2 id="lizenz">Lizenz</h2>
<p>Der Quellcode steht unter der MIT-Lizenz, die Beispieldateien unter <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.de">CC0 1.0</a>: Sie dürfen sie ohne Einschränkung verwenden, auch in eigener Software.</p>
</div>
</main>`;

export default {
  path,
  title,
  description,
  lastmod: UPDATED,
  jsonld: [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: h1,
      description,
      inLanguage: "de-DE",
      url: url(path),
      dateModified: UPDATED,
      about: { "@type": "WebApplication", name: SITE.name, url: url() },
      author: PERSON_LD,
      publisher: PERSON_LD,
    },
    breadcrumbLd(crumbs),
  ],
  body,
  llms: "Über die Website: Betreiber, Primärquellen (KBV, QMS) mit Beleg an jeder Aussage, aus den PDFs extrahierte Feldtabellen, automatische Prüfungen vor jeder Veröffentlichung, Grenzen (kein Medizinprodukt, kein Ersatz für das KBV-Prüfmodul) und wie man Fehler meldet.",
};
