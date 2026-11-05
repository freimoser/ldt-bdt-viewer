import { href, heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src as srcAt } from "../lib/layout.mjs";

const path = "muster-10-laborauftrag/";
const crumbs = [["LDT & BDT Viewer", ""], ["Muster 10 und 10A digital", path]];
const title = "Muster 10 und 10A digital: Laborauftrag mit LDT 3";
const description = "Muster 10 und 10A als digitaler Laborauftrag: was die KBV verlangt, wo die Formularart in der LDT-Datei steht (Feld 4239) und was abrechnungsrelevant ist.";
const h1 = "Muster 10 und Muster 10A digital: der Laborauftrag mit LDT 3";
const UPDATED = "2026-11-05";
const STAND = "12.10.2026";
const src = (k, d) => srcAt(k, d, STAND);

const faq = [
  {
    q: "Was ist der Unterschied zwischen Muster 10 und Muster 10A?",
    a: `Muster 10 ist der Überweisungsschein für Laboratoriumsuntersuchungen als Auftragsleistung, Muster 10A der Anforderungsschein für Laboratoriumsuntersuchungen bei Laborgemeinschaften. So stehen beide in der Werteliste der Regel E009 für Feld 4239. ${src("ldt3", "Regel E009")}`,
  },
  {
    q: "Ersetzt der LDT-Auftrag das Muster 10?",
    a: `Nein. Laut KBV gilt nur das Muster, als Papier oder in digitaler Form, als abrechnungsbegründende Unterlage, nicht der LDT-Auftrag. Beide können unabhängig voneinander oder zusammen zertifiziert werden. ${src("faq", "Kap. 2")}`,
  },
  {
    q: "Ist ein ausgedrucktes digitales Muster 10 gültig?",
    a: `Nein. Der Ausdruck eines digitalen Musters ist laut KBV kein gültiges Muster im Sinne einer abrechnungsbegründenden Unterlage und kein Ersatz für das Formular aus der Blankoformularbedruckung. ${src("faq", "Kap. 2")}`,
  },
  {
    q: "Darf ich einem digitalen Muster ein PDF anhängen?",
    a: `Nein. Das Einbetten weiterer Anlagen in digitale Muster ist laut KBV nicht erlaubt, weil alle Inhalte maschinell auslesbar sind und die geforderte qualifizierte elektronische Signatur (QES) sonst mehr Aufwand bedeuten würde. ${src("faq", "Kap. 2")} Anders beim LDT-Befund: Dort darf ein PDF als Anhang mitkommen (<a href="${href("ldt-datei-oeffnen/#pdf")}">LDT-Datei in PDF umwandeln</a>).`,
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>Muster 10</strong> ist der Überweisungsschein für Laboruntersuchungen als Auftragsleistung, <strong>Muster 10A</strong> der Anforderungsschein für Laboruntersuchungen bei einer Laborgemeinschaft. ${src("ldt3", "Regel E009")} Beide gibt es digital; zusammen mit LDT-Auftrag und LDT-Befund bilden sie das Verfahren, das die KBV Labordatenkommunikation nennt. ${src("faq", "Kap. 1")}`,
  minutes: 6,
})}
<div class="prose">
<h2 id="was-gilt">Was abrechnungsrelevant ist</h2>
<p>Die wichtigste Regel vorweg: Abrechnungsbegründend ist nur das Muster selbst, auf Papier oder digital, nicht der LDT-Auftrag. ${src("faq", "Kap. 2")} Der LDT-Auftrag überträgt die Anforderung maschinenlesbar an das Labor; das Muster bleibt der Beleg. Ein ausgedrucktes digitales Muster ist dabei kein gültiges Muster. ${src("faq", "Kap. 2")}</p>
<ul>
<li><strong>Keine Anlagen:</strong> In ein digitales Muster dürfen keine weiteren Dateien eingebettet werden. ${src("faq", "Kap. 2")}</li>
<li><strong>Signatur:</strong> Die KBV nennt für digitale Muster eine geforderte qualifizierte elektronische Signatur (QES). ${src("faq", "Kap. 2")}</li>
<li><strong>Übertragungsweg:</strong> Die Anforderungen an einen sicheren Übertragungsweg stehen in Anlage 2b des Bundesmantelvertrags-Ärzte (BMV-Ä); bei der Zertifizierung muss der Anbieter des Übertragungswegs bestätigen, dass er sie einhält. ${src("faq", "Kap. 2")}</li>
</ul>

<h2 id="wo-in-der-datei">Wo die Formularart in der LDT-Datei steht</h2>
<p>Ein Laborauftrag ist in LDT 3 die Satzart 8215. ${src("ldt3", "Kap. 6.2")} Ob er zu einem Muster 10 oder Muster 10A gehört, steht im Objekt „Abrechnung GKV“ (Obj_0002) in Feld 4239, der Scheinuntergruppe:</p>
<div class="table-wrap"><table>
<caption>Feld 4239 und Feld 7303 im LDT-3-Auftrag</caption>
<thead><tr><th scope="col">Feld 4239 (Scheinuntergruppe)</th><th scope="col">Bedeutung</th><th scope="col">passende Abrechnungsart in Feld 7303</th></tr></thead>
<tbody>
<tr><td><code>27</code></td><td>Überweisungsschein für Laboratoriumsuntersuchungen als Auftragsleistung (Muster 10)</td><td><code>1</code> GKV Laborfacharzt</td></tr>
<tr><td><code>28</code></td><td>Anforderungsschein für Laboratoriumsuntersuchungen bei Laborgemeinschaften (Muster 10A)</td><td><code>2</code> GKV Laborgemeinschaft</td></tr>
</tbody></table></div>
<p>${src("ldt3", "Regeln E009, E050 und K032")}</p>
<p>Die beiden Felder hängen zusammen: Steht in einem Auftrag in Feld 7303 der Wert 1, muss Feld 4239 den Wert 27 haben; bei 2 muss es 28 sein. ${src("ldt3", "Regel K032")} Wird ein Formular als Datei mitgeschickt, kennzeichnet Feld 9970 im Anhang den Dokumententyp, etwa <code>010</code> für Muster 10 und <code>10A</code> für Muster 10A. ${src("ldt3", "Regel E053")}</p>
<p>Der Viewer zeigt die Formularart bei jedem LDT-3-Auftrag in der Zeile „Formular“. Ausprobieren können Sie das mit der Beispieldatei <a href="${href("#beispiel=Z01_LDT3_Auftrag.ldt")}">Laborauftrag (Muster 10A)</a>.</p>

<h2 id="laborgemeinschaft">Was ist eine Laborgemeinschaft?</h2>
<p>Die LDT-Spezifikation nennt die Laborgemeinschaft als eine Art von Labor: eine Gemeinschaft, die für ihre Mitglieder Leistungen aus Abschnitt 32.2 des EBM bzw. Abschnitt M II der GOÄ erbringen kann. ${src("ldt3", "Kap. 3.5")} Genau für diese Anforderungen gibt es das Muster 10A; Aufträge an einen Laborfacharzt laufen über Muster 10. ${src("ldt3", "Regel E009")}</p>

<h2 id="zertifizierung">Welche Software was können muss</h2>
<p>Die KBV zertifiziert die Labordatenkommunikation in acht Bereichen, die eine Software frei kombinieren kann. ${src("faq", "Kap. 2")} Für Muster 10 und 10A gibt es je einen Bereich für Export (erstellen und versenden) und Import (empfangen und einlesen). Die KBV nennt als mögliche, nicht verbindliche Zuordnung:</p>
<div class="table-wrap"><table>
<caption>Typische Zertifizierungsbereiche laut KBV</caption>
<thead><tr><th scope="col">System</th><th scope="col">Typische Bereiche</th></tr></thead>
<tbody>
<tr><td>Praxisverwaltungssystem (PVS)</td><td>Digitales Muster 10 und 10A – Export, LDT-Auftrag – Export, LDT-Befund – Import</td></tr>
<tr><td>Laborinformationssystem (LIS)</td><td>Digitales Muster 10 und 10A – Export und Import, LDT-Auftrag – Export und Import, LDT-Befund – Export</td></tr>
<tr><td>Order-Entry-System</td><td>Digitales Muster 10 und 10A – Export, LDT-Auftrag – Export</td></tr>
<tr><td>Scan-System</td><td>Digitales Muster 10 und 10A – Import, LDT-Auftrag – Export, LDT-Befund – Import</td></tr>
</tbody></table></div>
<p>${src("faq", "Kap. 2")}</p>
<p>Was in einer Auftragsdatei sonst noch steht, Satz für Satz, zeigt <a href="${href("was-ist-ldt/")}">Was ist LDT?</a>; wie Sie eine Datei öffnen, steht unter <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("Laborauftrag ansehen", "Öffnen Sie eine LDT-3-Auftragsdatei im Viewer: Patient, Untersuchungen, Material, Abrechnung und Formular auf einen Blick. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["was-ist-ldt/", "ldt-datei-oeffnen/", "ldt-datei-beispiel/", "glossar/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogType: "article",
  lastmod: UPDATED,
  jsonld: [articleLd({ headline: h1, description, path, updated: UPDATED, published: UPDATED }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Muster 10 (Überweisungsschein Laboratoriumsuntersuchungen als Auftragsleistung) und Muster 10A (Anforderungsschein bei Laborgemeinschaften) digital: abrechnungsbegründend ist nur das Muster, nicht der LDT-Auftrag; Formularart in Feld 4239 (27/28, Regel E009) passend zu 7303 (1/2, Regel K032); Laborgemeinschaft; acht Zertifizierungsbereiche der KBV.",
};
