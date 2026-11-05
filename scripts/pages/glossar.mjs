import { heroHtml, breadcrumbLd, faqHtml, faqLd, relatedHtml, ctaHtml, src, href, url, esc, SITE } from "../lib/layout.mjs";

const path = "glossar/";
const crumbs = [["LDT & BDT Viewer", ""], ["Glossar", path]];
const title = "LDT- und BDT-Glossar: Fachbegriffe der xDT-Formate";
const description = "Glossar zu LDT, BDT, GDT und KVDT: Satzart, Feldkennung, Objekt, Prüfsumme, Grenzwertindikator und weitere Begriffe kurz erklärt, jeweils mit Quelle.";
const h1 = "Glossar: Fachbegriffe rund um LDT- und BDT-Dateien";
const UPDATED = "2026-10-26";
const STAND = "26.10.2026";

// Jede Definition übernimmt eine auf den Fachseiten belegte Aussage; „mehr“ verweist auf die ausführliche Stelle.
// text: Klartext für Schema und llms-full.txt; src: sichtbarer Beleg
const TERMS = [
  { id: "anhang", term: "Anhang (Obj_0010)", text: "Objekt in LDT 3, das Dokumente wie den Laborbefund als PDF mitbringt. Das Dateiformat steht in Feld 6303, der Inhalt Base64-kodiert in den Zeilen von Feld 6329.", src: src("ldt3", "Kap. 11.10, Regel K100"), more: ["ldt-datei-oeffnen/#pdf", "LDT-Datei in PDF umwandeln"] },
  { id: "bdt", term: "BDT", text: "Behandlungsdatentransfer, früher Behandlungsdatenträger: Standard der xDT-Familie für den systemunabhängigen Export von Praxisdaten, vor allem beim Wechsel der Praxissoftware. Weiterentwickelt vom Qualitätsring Medizinische Software (QMS).", src: src("bdt3", "Kap. 2"), more: ["was-ist-bdt/", "Was ist BDT?"] },
  { id: "befundstatus", term: "Befundstatus (Feld 8401)", text: "Gibt an, wie fertig ein Befund ist. In LDT 2 als Befundart: E Endbefund, T Teilbefund, V Vorläufiger Befund, A Archiv-Befund, N Nachforderung. In LDT 3 nur noch 1 = Auftrag nicht abgeschlossen oder 2 = Auftrag abgeschlossen.", src: `${src("ldt2", "Kap. 4.1")} ${src("ldt3", "Kap. 4, Regel E006")}`, more: ["ldt-2-vs-ldt-3/", "LDT 2 und LDT 3 im Vergleich"] },
  { id: "datenpaket", term: "Datenpaket", text: "Zusammengehörige Sätze einer Datei zwischen Kopf- und Abschluss-Satz. Ein LDT-Befund beginnt zum Beispiel mit dem Satz 8220 (L-Datenpaket-Header) und endet mit 8221 (L-Datenpaket-Abschluss).", src: src("ldt3", "Regel E001"), more: ["was-ist-ldt/", "Was ist LDT?"] },
  { id: "eulumdat", term: "EULUMDAT", text: "Format für Lichtdaten von Leuchten, das ebenfalls die Endung .ldt nutzt. Jede Zeile enthält einen einzelnen Wert ohne Feldkennung; mit Laborbefunden hat es nichts zu tun.", src: src("eulumdatFormat", "", STAND), more: ["ldt-datei-oeffnen/#lichtdatei", "Labordatei oder Lichtdatei?"] },
  { id: "feldkennung", term: "Feldkennung", text: "Vierstellige Nummer, die sagt, was in einer Zeile steht, etwa 3101 für den Nachnamen. In der xDT-Familie sind Feldkennungen grundsätzlich gleich benannt und gleich gemeint; den Feldkatalog führt die KBV.", src: `${src("ldt3", "Kap. 6.4.1")} ${src("bdt3", "Kap. 2")}`, more: ["feldkennungen/", "Alle Feldkennungen"] },
  { id: "gdt", term: "GDT", text: "Gerätedatentransfer: verbindet Praxissoftware und medizinische Geräte, zum Beispiel mit den Satzarten 6302 (Untersuchung anfordern) und 6310 (Untersuchungsdaten übermitteln). Gepflegt vom QMS.", src: `${src("gdt", "Kap. 3")} ${src("qms")}`, more: ["xdt-gdt-ldt-bdt/", "xDT im Überblick"] },
  { id: "grenzwertindikator", term: "Grenzwertindikator (Feld 8422)", text: "Kennzeichen, mit dem das Labor einen Wert als auffällig markiert. In LDT 3 zum Beispiel N normal, H oder + erhöht, HH oder ++ stark erhöht, L erniedrigt, !H extrem erhöht; in LDT 2 +, ++, -, -- und !. Der Viewer zeigt das Kennzeichen so an, wie es in der Datei steht.", src: `${src("ldt3", "Regel E005")} ${src("ldt2", "Kap. 4.1")}`, more: ["ldt-datei-oeffnen/#befund-lesen", "Laborbefund lesen"] },
  { id: "kvdt", term: "KVDT", text: "Kassenärztliche Vereinigung-Datentransfer: xDT-Format, mit dem die Arztpraxis ihre Abrechnungsdaten an die Kassenärztliche Vereinigung überträgt. Die Datensatzbeschreibung gibt die KBV heraus.", src: src("kvdt", "Kap. 1.1", STAND), more: ["xdt-gdt-ldt-bdt/#kvdt", "KVDT im Überblick"] },
  { id: "ldk", term: "Labordatenkommunikation (LDK)", text: "Oberbegriff der KBV für das ganze Verfahren zwischen Praxis und Labor: den Einsatz der digitalen Muster 10 und 10A sowie von LDT-Auftrag und LDT-Befund.", src: src("faq", "Kap. 1"), more: ["was-ist-ldt/", "Was ist LDT?"] },
  { id: "labordatentransfer", term: "Labordatentransfer", text: "Andere Bezeichnung für LDT, die Handbücher von Praxissoftware wie tomedo verwenden. Die Spezifikation der KBV nennt das Format LaborDatenTräger.", src: `${src("tomedoLdt", "", STAND)} ${src("ldt3", "Kap. 5.1")}`, more: ["was-ist-ldt/", "Was ist LDT?"] },
  { id: "laengenangabe", term: "Längenangabe", text: "Die ersten drei Ziffern jeder Zeile. Sie zählen die ganze Zeile: Inhalt plus 9 Zeichen für Längenangabe, Feldkennung und Zeilenende CR LF.", src: src("ldt3", "Kap. 6.4.1"), more: ["fehler/", "Fehler in LDT-Dateien"] },
  { id: "ldt", term: "LDT", text: "Labordatenträger, in Handbüchern von Praxissoftware auch Labordatentransfer genannt: Datenformat der Kassenärztlichen Bundesvereinigung (KBV), mit dem Arztpraxen Laboraufträge elektronisch an ein Labor senden und Labore ihre Befunde zurückschicken.", src: src("ldt3", "Kap. 4 und 5.1"), more: ["was-ist-ldt/", "Was ist LDT?"] },
  { id: "objekt", term: "Objekt (LDT 3)", text: "Bündel zusammengehöriger Felder innerhalb eines Satzes, etwa alle Angaben zum Patienten. Ein Objekt wird durch ein Objektattribut (Feldkennungen 8100 bis 8299) angekündigt, beginnt mit Feld 8002 (Objekt-ID wie Obj_0060) und endet mit Feld 8003.", src: src("ldt3", "Kap. 6.3"), more: ["ldt-datei-beispiel/", "LDT-3-Beispiel Zeile für Zeile"] },
  { id: "pruefsumme", term: "Prüfsumme (Feld 9300)", text: "SHA-1-Wert über alle Zeichen vor dieser Zeile, Pflicht im Abschluss-Satz einer LDT-3-Datei. Ändert sich nach dem Erstellen auch nur ein Zeichen, passt die Prüfsumme nicht mehr.", src: src("ldt3", "Kap. 6.7"), more: ["fehler/#pruefsumme", "Fehler: Prüfsumme passt nicht"] },
  { id: "satz", term: "Satz und Satzart (Feld 8000)", text: "Ein Satz ist eine Gruppe von Zeilen, die mit Feld 8000 beginnt. Dessen Inhalt, die Satzart, sagt, worum es geht, in LDT 3 etwa 8205 für einen Befund und 8215 für einen Auftrag.", src: src("ldt3", "Kap. 6.2"), more: ["xdt-gdt-ldt-bdt/", "Format an der Satzart erkennen"] },
  { id: "satzende", term: "Satzende (Feld 8001 bzw. 8202)", text: "In LDT 3 endet jeder Satz mit Feld 8001 und derselben Satzart wie am Anfang. In BDT 3.0 endet ein Satz mit Feld 8202, das die Felder des Satzes zählt.", src: `${src("ldt3", "Kap. 6.3")} ${src("bdt3", "Kap. 3.3")}`, more: ["ldt-2-vs-ldt-3/", "LDT 2 und LDT 3 im Vergleich"] },
  { id: "satzlaenge", term: "Satzlänge (Feld 8100)", text: "In LDT 2 und im klassischen BDT das zweite Feld jedes Satzes: die Summe aller Feldlängen des Satzes in Bytes. LDT 3 nutzt stattdessen das Satzende in Feld 8001.", src: `${src("ldt2", "Kap. 2.3.3")} ${src("giessen")}`, more: ["bdt-datei-beispiel/#fehler", "Fehler: Satzlänge passt nicht"] },
  { id: "xdt", term: "xDT", text: "Familie von Datensatzbeschreibungen für den Datenaustausch von Praxissoftware, zu der GDT, LDT und BDT gehören. Alle nutzen denselben Zeilenaufbau aus Länge, Feldkennung und Inhalt.", src: src("bdt3", "Kap. 2 und 3.3"), more: ["xdt-gdt-ldt-bdt/", "xDT im Überblick"] },
  { id: "zeichensatz", term: "Zeichensatz (Feld 9106)", text: "Legt fest, welches Byte für welchen Buchstaben steht. LDT 3 erlaubt nur ISO 8859-15; LDT 2 erlaubte vier Zeichensätze, welcher gilt, steht in Feld 9106. Wird mit dem falschen gelesen, erscheinen Umlaute falsch.", src: `${src("ldt3", "Kap. 6.6")} ${src("ldt2", "Kap. 2.6, Feld 9106")}`, more: ["fehler/", "Fehler: Umlaute falsch"] },
];

const faq = [
  {
    q: "Was ist der Unterschied zwischen Satz, Feld und Objekt?",
    a: `Ein Feld ist eine Zeile mit Längenangabe, Feldkennung und Inhalt. Mehrere Felder bilden einen Satz, der mit Feld 8000 (Satzart) beginnt. In LDT 3 bündeln Objekte innerhalb eines Satzes zusammengehörige Felder; sie beginnen mit Feld 8002 und enden mit Feld 8003. ${src("ldt3", "Kap. 6.2 bis 6.4.1")}`,
  },
  {
    q: "Warum gibt es zwei verschiedene LDT-Dateien?",
    a: `Weil zwei Formate dieselbe Endung nutzen: der Labordatenträger LDT der KBV für Laborbefunde und EULUMDAT für Lichtdaten von Leuchten. ${src("eulumdatFormat", "", STAND)} Der Viewer erkennt Lichtdateien und weist darauf hin.`,
  },
];

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const termSetLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": url(path) + "#begriffe",
  name: "Glossar LDT, BDT und xDT",
  inLanguage: "de-DE",
  url: url(path),
  hasDefinedTerm: TERMS.map((t) => ({
    "@type": "DefinedTerm",
    "@id": url(path) + "#" + t.id,
    name: t.term,
    description: t.text,
    url: url(path) + "#" + t.id,
    inDefinedTermSet: url(path) + "#begriffe",
  })),
};

const pageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: h1,
  description,
  inLanguage: "de-DE",
  url: url(path),
  dateModified: UPDATED,
  author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
  mainEntity: { "@id": url(path) + "#begriffe" },
};

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `Die wichtigsten Begriffe aus LDT-, BDT- und anderen xDT-Dateien in ein bis drei Sätzen, alphabetisch. Jede Erklärung nennt ihre Quelle und verweist auf die Seite, die das Thema ausführlich behandelt.`,
  minutes: 5,
  stand: STAND,
})}
<div class="prose">
<p class="glossar-index" aria-label="Begriffe von A bis Z">${TERMS.map((t) => `<a href="#${t.id}">${esc(t.term.replace(/ \(.*\)$/, ""))}</a>`).join(" · ")}</p>
<dl class="glossar">
${TERMS.map((t) => `<dt id="${t.id}">${esc(t.term)}</dt>
<dd><p>${esc(t.text)} ${t.src}</p><p class="glossar-more"><a href="${href(t.more[0])}">${esc(t.more[1])}</a></p></dd>`).join("\n")}
</dl>
</div>
${faqHtml(faq)}
${ctaHtml("Begriffe in der eigenen Datei sehen", "Der Viewer zeigt zu jeder Zeile Feldkennung, Bedeutung und Inhalt. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["was-ist-ldt/", "was-ist-bdt/", "xdt-gdt-ldt-bdt/", "feldkennungen/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogTitle: "Glossar: LDT, BDT und xDT-Begriffe kurz erklärt",
  ogDescription: "Satzart, Feldkennung, Objekt, Prüfsumme, Grenzwertindikator, KVDT, EULUMDAT: die Fachbegriffe rund um LDT- und BDT-Dateien mit Quelle.",
  ogType: "article",
  lastmod: UPDATED,
  jsonld: [pageLd, termSetLd, faqLd(faq.map((f) => ({ q: f.q, a: strip(f.a) }))), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Glossar mit kurzen, belegten Definitionen: Anhang (Obj_0010), BDT, Befundstatus 8401, Datenpaket, EULUMDAT, Feldkennung, GDT, Grenzwertindikator 8422, KVDT, Labordatenkommunikation (LDK), Labordatentransfer, Längenangabe, LDT, Objekt, Prüfsumme 9300, Satz/Satzart 8000, Satzende 8001/8202, Satzlänge 8100, xDT, Zeichensatz 9106; als DefinedTermSet ausgezeichnet.",
};
