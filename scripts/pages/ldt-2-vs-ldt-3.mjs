import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src, href } from "../lib/layout.mjs";

const path = "ldt-2-vs-ldt-3/";
const crumbs = [["LDT & BDT Viewer", ""], ["LDT 2 vs. LDT 3", path]];
const title = "LDT 3 Unterschied LDT 2: Vergleich und Umstellung";
const description = "Unterschied LDT 3 und LDT 2: Satzarten, 8001 statt Satzlänge 8100, Objekte, ISO 8859-15, SHA-1-Prüfsumme 9300, Zertifizierung und Umstellung.";
const h1 = "LDT 3 und LDT 2: Unterschiede im Vergleich";

const faq = [
  {
    q: "Darf ich LDT 2 noch verwenden?",
    a: "Die KBV zertifiziert LDT 2 nicht mehr: Seit 01.01.2016 ist keine Zertifizierung möglich, die Prüfnummern verloren zum 31.12.2017 ihre Gültigkeit. Zertifiziert wird im Verfahren Labordatenkommunikation mit LDT 3; zu nicht erwünschten Standards macht die KBV laut ihrer FAQ keine Aussage. Klären Sie den Einsatz mit Labor und Softwareanbieter.",
  },
  {
    q: "Woran erkenne ich, ob eine Datei LDT 2 oder LDT 3 ist?",
    a: "Bei LDT 2 enthält der Kopfsatz Feld 9212 mit LDT1014.01, und das zweite Feld jedes Satzes ist 8100 (Satzlänge). Bei LDT 3 steht die Version in Feld 0001, aktuell LDT3.2.20, und jeder Satz endet mit Feld 8001. Der Dateiname allein reicht nicht: Auch eine LDT-2-Datei im Zeichensatz ISO 8859-15, die per Datenfernübertragung kommt, beginnt mit Z01.",
  },
  {
    q: "Gibt es die Satzarten 8201 und 8218 in LDT 3 noch?",
    a: "Nein. LDT 3 kennt nur sechs Satzarten: 8220 und 8221 (Datenpaket des Labors), 8230 und 8231 (Datenpaket der Praxis), 8205 (Befund) und 8215 (Auftrag). Die LDT-2-Satzarten 8201 bis 8204, 8218 und 8219 sowie die Datenträger-Sätze 0020 und 0021 kommen darin nicht vor.",
  },
  {
    q: "Haben Laborwerte in LDT 3 andere Feldkennungen?",
    a: "Die wichtigsten Kennungen bleiben: 8410 Test-Ident, 8411 Testbezeichnung, 8420 Ergebniswert, 8421 Einheit und 8422 Grenzwertindikator gibt es in beiden Generationen. In LDT 3 stehen sie aber in Objekten, etwa im Untersuchungsergebnis Klinische Chemie (Obj_0060). Alle Kennungen finden Sie in der Referenz <a href=\"" + href("feldkennungen/") + "\">Feldkennungen</a>.",
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>LDT 3 unterscheidet sich von LDT 2 vor allem im Aufbau:</strong> Statt der Satzlänge in Feld 8100 schließt jeder Satz mit Feld 8001 ab, Inhalte stehen in Objekten von Feld 8002 bis 8003, erlaubt ist nur noch der Zeichensatz ISO 8859-15, und die Datei wird mit einer SHA-1-Prüfsumme in Feld 9300 gesichert. ${src("ldt3", "Kap. 6.3, 6.6, Regel E157")} ${src("ldt2", "Kap. 2.3.3, 2.6")}`,
  minutes: 7,
})}
<div class="prose">
<p>Für Praxen zählt vor allem: Zertifiziert wird bei der KBV nur noch LDT 3. Der LDT 2.0 ist kein Bestandteil des Verfahrens Labordatenkommunikation (LDK). ${src("faq", "Kap. 2")} Was LDT grundsätzlich ist und wie Auftrag und Befund laufen, erklärt die Seite <a href="${href("was-ist-ldt/")}">Was ist LDT?</a>.</p>

<h2>Vergleichstabelle LDT 2 und LDT 3</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Merkmal</th><th scope="col">LDT 2.x</th><th scope="col">LDT 3.x</th><th scope="col">Fundstelle</th></tr></thead>
<tbody>
<tr><td>Herausgeber und Dokument</td><td>KBV, Datensatzbeschreibung LDT Version 5.12 vom 03.05.2017</td><td>KBV, LDT 3 Satzbeschreibung Version 3.2.20 vom 13.05.2026, in Kraft seit 01.10.2026</td><td>LDT 2: S. 1 · LDT 3: S. 1–2</td></tr>
<tr><td>Versionskennung</td><td>Feld 9212 im Kopfsatz = <code>LDT1014.01</code></td><td>Feld 0001 in den Kopfdaten (Obj_0032) = <code>LDT3.2.20</code></td><td>LDT 2: Satzart 8220 · LDT 3: Regel E001</td></tr>
<tr><td>Satzarten</td><td>0020/0021 Datenträger-Header und -Abschluss, 8220/8221, 8230/8231, 8201 Labor-Bericht, 8202 LG-Bericht, 8203 Mikrobiologie-Bericht, 8204 Labor-Bericht Sonstige Einsendepraxen, 8218 Elektronische Überweisung, 8219 Auftrag an eine Laborgemeinschaft</td><td>8220/8221 L-Datenpaket, 8230/8231 P-Datenpaket, 8205 Befund, 8215 Auftrag</td><td>LDT 2: Kap. 2.3.1 · LDT 3: Kap. 6.2</td></tr>
<tr><td>Satzrahmen</td><td>1. Feld 8000 Satzart, 2. Feld 8100 Satzlänge (Summe aller Feldlängen in Bytes)</td><td>Feld 8000 am Anfang, Feld 8001 mit derselben Satzart am Ende</td><td>LDT 2: Kap. 2.3.3 · LDT 3: Kap. 6.3</td></tr>
<tr><td>Objekte</td><td>keine, ein Satz ist in Felder unterteilt</td><td>Objektattribut (Kennungen 8100–8299), dann Objekt von 8002 bis 8003 mit Objekt-ID, z. B. Obj_0032</td><td>LDT 2: Kap. 2.1 · LDT 3: Kap. 6.3</td></tr>
<tr><td>Feldaufbau</td><td colspan="2">gleich: 3 Bytes Länge, 4 Bytes Feldkennung, Inhalt, CR LF; Länge = Inhalt + 9</td><td>LDT 2: Kap. 2.4.1 · LDT 3: Kap. 6.4.1</td></tr>
<tr><td>Zeichensatz</td><td>7-Bit-Code (DIN 66003), IBM-Codepage 437, ISO 8859-1 oder ISO 8859-15; Angabe in Feld 9106 (1 bis 4)</td><td>nur ISO 8859-15</td><td>LDT 2: Kap. 2.6, Feld 9106 · LDT 3: Kap. 6.6</td></tr>
<tr><td>Dateiname</td><td>1. Zeichen = Zeichensatz (X IBM, S 7-Bit, A ISO 8859-1, Z ISO 8859-15), dann laufende Nummer des Datenträgers (bei Datenfernübertragung 01), z. B. <code>X01L0505.LDT</code></td><td><code>Z01</code> + frei wählbar (A–Z, 0–9, _) + <code>.ldt</code>, max. 256 Zeichen, z. B. <code>Z0147112345M27_01.ldt</code></td><td>LDT 2: Kap. 2.7.3 · LDT 3: Kap. 6.7</td></tr>
<tr><td>Kontrolle am Paketende</td><td>Feld 9202 Gesamtlänge des Datenpakets (Summe aller Satzlängen) in 8221/8231; Feld 9300 nur als frei verabredete Prüfsumme</td><td>Feld 9300 Prüfsumme (Pflicht) in 8221/8231: SHA-1 über alle Zeichen vor der Zeile 9300</td><td>LDT 2: Kap. 3.4, 3.6, 8 · LDT 3: Kap. 8.2, 8.4, Regel E157</td></tr>
<tr><td>Datumsformat</td><td colspan="2">gleich: JJJJMMTT</td><td>LDT 2: Kap. 2.4.2 · LDT 3: Kap. 6.4.2</td></tr>
<tr><td>Befundstatus (Feld 8401)</td><td>Befundart: E Endbefund, T Teilbefund, V Vorläufiger Befund, A Archiv-Befund, N Nachforderung</td><td>1 = Auftrag nicht abgeschlossen, 2 = Auftrag abgeschlossen; Status je Ergebnis in Feld 8418</td><td>LDT 2: Kap. 4.1 · LDT 3: Kap. 4, Regel E006</td></tr>
<tr><td>Grenzwertindikator (Feld 8422)</td><td>+ leicht erhöht, ++ stark erhöht, - mäßig erniedrigt, -- stark erniedrigt, ! auffällig</td><td>numerisch: N, H/+, HH/++, L/-, LL/--, !H/!+ extrem erhöht, !L/!- extrem erniedrigt; nicht numerisch: N, A auffällig, AA sehr auffällig</td><td>LDT 2: Kap. 4.1 · LDT 3: Regel E005</td></tr>
<tr><td>Ergebnisfelder</td><td>direkt im Berichtssatz: 8410 Test-Ident, 8411 Testbezeichnung, 8420 Ergebniswert, 8421 Einheit, 8480 Ergebnis-Text, 8460–8462 Normalwerte</td><td>dieselben Kennungen 8410, 8411, 8420, 8421 in Objekten wie Obj_0060 (Untersuchungsergebnis Klinische Chemie); Normalwerte in Obj_0042</td><td>LDT 2: Kap. 3.8 · LDT 3: Kap. 11</td></tr>
<tr><td>Übertragung</td><td>Diskette oder Datenfernübertragung; Sätze 0020/0021 nur, wenn ein Paket auf mehrere Datenträger verteilt werden kann</td><td>keine Datenträger mehr, komplett elektronische Übermittlung</td><td>LDT 2: Kap. 2.3.2, 2.7 · LDT 3: Kap. 6.2.1</td></tr>
<tr><td>Zertifizierung</td><td>seit 01.01.2016 nicht mehr möglich, Prüfnummern zum 31.12.2017 ungültig; kein Bestandteil des LDK-Verfahrens</td><td>im LDK-Verfahren: LDT-Befund seit 04.01.2016, LDT-Auftrag seit 26.05.2017 zertifizierbar</td><td>KBV-FAQ LDK, Kap. 2</td></tr>
</tbody>
</table></div>
<p>${src("ldt2")} ${src("ldt3")} ${src("faq", "Kap. 2")}</p>
<p>Alle Kennungen aus der Tabelle mit Länge und Typ finden Sie in der Referenz <a href="${href("feldkennungen/")}">Feldkennungen</a>.</p>

<h2>Umstellung von LDT 2 auf LDT 3</h2>
<h3>Was sich für die Praxis ändert</h3>
<ul>
<li><strong>Ein Befundtyp statt vier:</strong> Befunde kommen einheitlich als Satzart 8205 statt als 8201 bis 8204. ${src("ldt3", "Kap. 6.2")}</li>
<li><strong>Anderer Befundstatus:</strong> Feld 8401 sagt nur noch, ob der Auftrag abgeschlossen ist. Ob ein einzelner Wert noch folgt, korrigiert wurde oder vorliegt, steht im Ergebnisstatus (Feld 8418). ${src("ldt3", "Kap. 4, Regeln E006 und E007")}</li>
<li><strong>Feinere Markierungen:</strong> Auffällige Werte sind stärker abgestuft, etwa „!H“ für extrem erhöht. Für Ergebnisse ohne Zahl gibt es „A“ (auffällig) und „AA“ (sehr auffällig). ${src("ldt3", "Regel E005")}</li>
<li><strong>Ein Zeichensatz:</strong> LDT 3 erlaubt nur ISO 8859-15. Bei LDT 2 musste die Software einen von vier möglichen Zeichensätzen erkennen. ${src("ldt3", "Kap. 6.6")}</li>
<li><strong>PDF im Befund:</strong> Die Arbeitsgemeinschaft LDT empfiehlt, immer eine PDF-Datei des Befundes in Satzart 8205 einzubetten. ${src("ldt3", "Fußnote 7 zu Kap. 8.5")}</li>
</ul>
<h3>Was sich für Praxis-IT und Entwickler ändert</h3>
<ul>
<li><strong>Parser:</strong> Statt Satzlängen zu prüfen, wertet die Software Objektattribute (8100 bis 8299), Objektgrenzen 8002/8003 und das Satzende 8001 aus. ${src("ldt3", "Kap. 6.3 und 7")}</li>
<li><strong>Integrität:</strong> Statt der Gesamtlänge in Feld 9202 sichert eine SHA-1-Prüfsumme in Feld 9300 die Datei. Wird die Datei nachträglich verändert, passt die Prüfsumme nicht mehr. ${src("ldt3", "Regel E157")}</li>
<li><strong>Prüfmodul:</strong> Das LDK-Prüfmodul muss in allen Systemen zur Prüfung exportierter und zu importierender Dateien eingebunden und standardmäßig aktiviert sein. ${src("faq", "Kap. 2")}</li>
<li><strong>Testdaten:</strong> Die KBV stellt Testdateien zu LDT 3.2.20 als ZIP-Archiv im Update-Verzeichnis bereit. ${src("kbvdir")} Erfundene Testdateien für beide Generationen erzeugt auch der <a href="${href("#generator")}">Generator im Viewer</a>.</li>
</ul>
<h3>Warum LDT 2 trotzdem noch vorkommt</h3>
<p>Die KBV schrieb 2022, dass trotz des etablierten LDT 3 „an einigen Stellen noch der LDT 2 Standard eingesetzt“ wird. Für diese Fälle empfiehlt sie Erweiterungen der Satzarten 8218, 8201 und 8203, unter anderem für die Muster 10C und OEGD, und stellt klar, dass dies keine Weiterentwicklung von LDT 2 durch die KBV ist. ${src("ldt2emp", "Kap. 1 und 2")}</p>
<p>Pflege und Support der LDT-2.0-Datensatzbeschreibung wollte die KBV laut ihrer FAQ zum 01.01.2018 einstellen. ${src("faq", "Kap. 2")}</p>
<p>Im Alltag können Ihnen also beide Generationen begegnen. Der Viewer erkennt LDT 2.x und LDT 3.x automatisch und prüft jede Datei gegen ihre eigene Spezifikation. Was die Meldungen bedeuten, erklärt die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>; die Bedienung zeigt <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("LDT 2 oder LDT 3 prüfen", "Der Viewer erkennt die Version automatisch und prüft die Datei gegen die passende KBV-Spezifikation. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["ldt-datei-oeffnen/", "was-ist-ldt/", "feldkennungen/", "fehler/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogTitle: "LDT 2 vs. LDT 3: Vergleichstabelle und Umstellung",
  ogDescription: "Alle Unterschiede zwischen LDT 2 und LDT 3 in einer Tabelle, dazu was die Umstellung für Praxis, Praxis-IT und Entwickler bedeutet.",
  ogType: "article",
  jsonld: [articleLd({ headline: h1, description, path }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Vergleich LDT 2 (LDT1014.01, KBV 5.12) und LDT 3 (3.2.20): Satzarten, Satzlänge 8100 gegen Satzende 8001, Objekte 8002/8003, Zeichensätze, Dateiname, Prüfsumme 9202 gegen 9300 SHA-1, Befundstatus, Grenzwertindikator, Zertifizierung und Umstellung.",
};
