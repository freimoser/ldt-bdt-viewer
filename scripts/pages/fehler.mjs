import { href, heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src as srcAt, esc, SITE, figureHtml } from "../lib/layout.mjs";
import { BEISPIELE } from "../../src/assets/js/core/beispiele.js";
import { openFile } from "../../src/assets/js/core/xdt.js";

const STAND = "12.10.2026";
const UPDATED = "2026-10-26";
const src = (k, d) => srcAt(k, d, STAND);
const now = new Date(SITE.updated + "T09:30:00Z");

// Beispieldatei je Fehlerart und die Meldung, die der Viewer dazu zeigt (beim Build aus der Datei erzeugt)
const EXAMPLES = {
  zeichensatz: [["Z01_FEHLER_UTF8.ldt", "CHARSET_WRONG"], ["X01ZEICH.LDT", "CHARSET_CONFLICT"]],
  laenge: [["Z01_FEHLER_Laenge.ldt", "LEN"]],
  zeilenende: [["Z01_FEHLER_Zeilenende_LF.ldt", "EOL_LF"]],
  pflichtfeld: [["Z01_FEHLER_Pflichtfeld.ldt", "OBJ_REQUIRED"]],
  unbekannt: [["Z01_FEHLER_unbekannte_FK.ldt", "UNKNOWN"]],
  satzlaenge: [["X01SATZL.LDT", "RECLEN"], ["BDT_FEHLER_Satzlaenge.bdt", "RECLEN"]],
  pruefsumme: [["Z01_FEHLER_Pruefsumme.ldt", "CHECKSUM"]],
  satzende: [["Z01_FEHLER_abgeschnitten.ldt", "OBJ_OPEN"]],
};

function exampleInfo(dict) {
  const out = {};
  for (const [id, list] of Object.entries(EXAMPLES)) {
    out[id] = list.map(([file, code]) => {
      const b = BEISPIELE.find((x) => x.file === file);
      const m = openFile(b.build(now), b.file, dict);
      const issue = m.issues.find((i) => i.code === code);
      if (!issue) throw new Error(`Fehlerbeispiel ${file}: Meldung ${code} fehlt`);
      return { file, title: b.title, text: issue.text, cause: m.diagnosis?.title || "" };
    });
  }
  return out;
}

const path = "fehler/";
const crumbs = [["LDT & BDT Viewer", ""], ["Fehler in LDT-Dateien", path]];
const title = "LDT Datei Fehler: Meldungen, Ursachen und Lösungen";
const description = "LDT Datei Fehler verstehen: echte Meldungen zu Zeichensatz, Längenangabe, Pflichtfeld, Version und Prüfsumme 9300, jeweils mit Ursache und Lösung.";

const faq = [
  {
    q: "Ist eine Warnung genauso schlimm wie ein Fehler?",
    a: `Nicht unbedingt. Die Regeltabelle von LDT 3 unterscheidet die Fehlerstatus F (Fehler), W (Warnung) und I (Information/Hinweis). ${src("ldt3", "Kap. 6.5.1")} Eine ältere Version ist zum Beispiel eine Warnung, eine falsche Prüfsumme ein Fehler. Der Viewer sortiert seine Meldungen ebenfalls in Fehler, Warnungen und Hinweise.`,
  },
  {
    q: "Warum erscheint die Meldung zur Prüfsumme zusammen mit anderen Fehlern?",
    a: `Weil die Prüfsumme in Feld 9300 aus allen Zeichen davor berechnet wird. ${src("ldt3", "Regel E157")} Jede Änderung an diesen Zeichen, etwa geänderte Zeilenenden oder eine fehlende Zeile, verändert auch den berechneten Wert. Wird die Datei beim Absender richtig neu erzeugt, passt die Prüfsumme wieder.`,
  },
  {
    q: "Gelten diese Fehler auch für BDT-Dateien?",
    a: `Teilweise. Die Längenregel (Inhalt plus 9) ist in BDT dieselbe. ${src("bdt3", "Kap. 3.3")} In BDT 3.0 endet ein Satz aber nicht mit 8001, sondern mit Feld 8202, das die Felder des Satzes zählt. ${src("bdt3", "Kap. 3.4.1")} Mehr dazu unter <a href="${href("bdt-datei-oeffnen/")}">BDT-Datei öffnen</a>.`,
  },
];

let EX = {};
// Meldung aus der Beispieldatei, falls vorhanden; sonst das angegebene Beispiel (Version, Dateiname)
const err = (id, h, msg, meaning, fix) => {
  const ex = EX[id] || [];
  const quote = ex.length ? ex.map((e) => `„${esc(e.text)}“`).join(" oder ") : msg;
  const tryIt = ex.length ? `<p class="try-it"><strong>Zum Ausprobieren:</strong> ${ex.map((e) => `<a href="${href("#beispiel=" + encodeURIComponent(e.file))}">${esc(e.title)}</a> (<a href="${href("beispiele/" + e.file)}" download>herunterladen</a>)${e.cause ? `, der Viewer nennt als wahrscheinliche Ursache „${esc(e.cause)}“` : ""}`).join("; ")}.</p>` : "";
  return `<h3 id="${id}">${h}</h3>
<p><strong>Meldung im Viewer:</strong> ${quote}</p>
<p><strong>Bedeutung:</strong> ${meaning}</p>
<p><strong>Lösung:</strong> ${fix}</p>
${tryIt}`;
};

export default function ({ dict }) {
  EX = exampleInfo(dict);
  return {
  path,
  lastmod: UPDATED,
  title,
  description,
  ogTitle: "Fehler in LDT-Dateien: Meldungen, Ursachen, Lösungen",
  ogDescription: "Was die Meldungen zu Zeichensatz, Längen, Pflichtfeldern, Version und Prüfsumme in LDT-Dateien bedeuten und was Sie tun können.",
  ogType: "article",
  minInternalLinks: 3,
  llms: "Erklärt zehn Fehlermeldungen in LDT-Dateien (Zeichensatz, Längenangabe, CR LF, Pflichtfeld, Version, unbekannte Feldkennung, Satzlänge 8100 und Gesamtlänge 9202, Prüfsumme 9300, Satzende 8001, Dateiname) mit Ursache und Lösung.",
  jsonld: [
    articleLd({ headline: "Fehler in LDT-Dateien: Meldungen, Ursachen, Lösungen", description, path, updated: UPDATED, image: "bilder/ldt-viewer-pruefung-fehler.webp" }),
    faqLd(faq.map((f) => ({ q: f.q, a: f.a.replace(/&amp;/g, "&") }))),
    breadcrumbLd(crumbs),
  ],
  body: `<main id="inhalt">
${heroHtml({
  crumbs,
  h1: "Fehler in LDT-Dateien: Meldungen, Ursachen, Lösungen",
  lead: `Welcher Fehler in einer LDT-Datei steckt, sehen Sie, wenn Sie die Datei im kostenlosen <a href="${href()}">LDT &amp; BDT Viewer</a> öffnen: Der Reiter „Prüfung“ nennt jeden Fehler mit Zeilennummer und erklärt unter „Was bedeutet das in der Praxis?“, welche Folgen er hat. Hängen mehrere Meldungen zusammen, steht oben die wahrscheinliche Ursache mit einem Vorschlag, was zu tun ist. Diese Seite erklärt zehn Fehlerarten mit Ursache und Lösung, ${Object.keys(EXAMPLES).length} davon mit einer Beispieldatei zum Ausprobieren.`,
  minutes: 6,
  stand: STAND,
})}
<div class="prose">
<p>Die Meldungen betreffen nicht die Laborwerte, sondern den Aufbau der Datei. Wie Sie sie finden, zeigt die Anleitung <a href="${href("ldt-datei-oeffnen/")}">LDT-Datei öffnen</a>. Grundregel: Korrigieren Sie den Inhalt nicht von Hand. Die Datei muss dort neu erzeugt werden, wo sie entstanden ist, bei einem Befund also beim Labor bzw. in dessen Software.</p>

${figureHtml("ldt-viewer-pruefung-fehler.webp", "Fehler in einer LDT-Datei im LDT & BDT Viewer: Warnung Die Prüfung hat 1 Fehler gefunden, wahrscheinliche Ursache Die Datei wurde nach dem Erstellen verändert, und im Reiter Prüfung die Meldung Zeile 365: Die Prüfsumme in Feld 9300 passt nicht zum Dateiinhalt", "Der Reiter „Prüfung“ mit einem Fehlerbeispiel (erfundene Testdaten): Der Viewer nennt die wahrscheinliche Ursache, was zu tun ist, und jede Meldung mit Zeilennummer.")}

<h2 id="uebersicht">Übersicht: Fehler in LDT-Dateien auf einen Blick</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Fehler</th><th scope="col">Erkennbar an</th><th scope="col">Ursache</th><th scope="col">Lösung</th></tr></thead>
<tbody>
<tr><td><a href="#zeichensatz">Falscher Zeichensatz</a></td><td>„M?ller“, „MÃ¼ller“</td><td>Anderer Zeichensatz als vorgeschrieben oder angegeben</td><td>Umschalten, Absender korrigiert Export</td></tr>
<tr><td><a href="#laenge">Längenangabe falsch</a></td><td>„Längenangabe passt nicht“</td><td>Länge ist nicht Inhalt plus 9</td><td>Neu erzeugen lassen</td></tr>
<tr><td><a href="#zeilenende">LF statt CR LF</a></td><td>„nur mit LF statt mit CR LF“</td><td>Zeilenende falsch erzeugt oder umgewandelt</td><td>Original neu anfordern</td></tr>
<tr><td><a href="#pflichtfeld">Pflichtfeld fehlt</a></td><td>„Pflichtfeld … fehlt“</td><td>Muss-Feld nicht gefüllt</td><td>Labor bzw. Hersteller informieren</td></tr>
<tr><td><a href="#version">Ältere Version</a></td><td>„nach LDT3.2.19 erstellt“</td><td>Software des Absenders veraltet</td><td>Update beim Absender</td></tr>
<tr><td><a href="#unbekannt">Unbekannte Feldkennung</a></td><td>„Feldkennung … nicht bekannt“</td><td>Erweiterung, andere Version, Tippfehler</td><td>Nachschlagen, mit Hersteller klären</td></tr>
<tr><td><a href="#satzlaenge">Satzlänge 8100, Gesamtlänge 9202</a></td><td>„Satzlänge in Feld 8100 … stimmt nicht“</td><td>LDT 2: Zeilen fehlen, zu viel oder geändert</td><td>Neu erzeugen lassen</td></tr>
<tr><td><a href="#pruefsumme">Prüfsumme 9300</a></td><td>„Prüfsumme in Feld 9300 passt nicht“</td><td>LDT 3: Datei verändert oder unvollständig</td><td>Original neu anfordern</td></tr>
<tr><td><a href="#satzende">Satzende 8001, Objekte</a></td><td>„Satzende (Feld 8001) fehlt“</td><td>Datei abgeschnitten oder durcheinander</td><td>Neu übertragen lassen</td></tr>
<tr><td><a href="#dateiname">Dateiname</a></td><td>„folgt nicht der LDT-3-Namensregel“</td><td>Datei umbenannt</td><td>Name nach der Regel</td></tr>
</tbody></table></div>

<h2 id="einzeln">Die Fehler im Einzelnen</h2>
${err("zeichensatz", "Umlaute kaputt: falscher Zeichensatz",
  "„Die Datei gibt ISO 8859-15 an (Feld 9106 = 4), die Umlaute passen aber eher zu Codepage 437.“",
  `Der Zeichensatz legt fest, welches Byte für welchen Buchstaben steht. In LDT 3 ist nur ISO 8859-15 erlaubt ${src("ldt3", "Kap. 6.6")}; eine UTF-8-Datei meldet der Viewer dort als Fehler. LDT 2 erlaubt 7-Bit-Code nach DIN 66003, IBM-Codepage 437, ISO 8859-1 und ISO 8859-15; welcher gilt, steht in Feld 9106 und im ersten Buchstaben des Dateinamens. ${src("ldt2", "Kap. 2.6, 2.7.3 und Feld 9106")} Passen Angabe und Umlaute nicht zusammen, liest der Viewer die Datei mit dem Zeichensatz, der zu den Umlauten passt, und meldet den Widerspruch.`,
  "Wählen Sie in der Karte „Zeichensatz“ einen anderen, um die Datei zu lesen. Dauerhaft muss der Absender den richtigen Zeichensatz verwenden.")}
${err("laenge", "Längenangabe passt nicht zum Inhalt",
  "„Zeile 14: Die Längenangabe passt nicht zum Inhalt (angegeben 021, richtig wäre 019).“",
  `Die ersten drei Ziffern jeder Zeile nennen die Länge in Bytes: Inhalt plus 9. ${src("ldt3", "Kap. 6.4.1")} In LDT 2 gilt dieselbe Regel. ${src("ldt2", "Kap. 2.4.1")} Ergänzt der Viewer „Die Längenfehler treten in Zeilen mit Umlauten auf.“, wurde die Datei als UTF-8 gespeichert. Dort belegt ein Umlaut zwei Bytes.`,
  "Lassen Sie die Datei beim Absender neu erzeugen.")}
${err("zeilenende", "Zeilen enden mit LF statt mit CR LF",
  "„427 Zeilen enden nur mit LF statt mit CR LF.“, manchmal zusammen mit „Fast alle falschen Längenangaben sind genau um 1 zu klein.“",
  `Jedes Feld endet mit CR (Wagenrücklauf) und LF (Zeilenvorschub). ${src("ldt3", "Kap. 6.4.1")} Fehlt das CR, wurde die Datei so erzeugt oder später umgewandelt; weil sich dabei die Bytes ändern, passt in LDT 3 auch die Prüfsumme nicht mehr. Erscheint zusätzlich „Fast alle falschen Längenangaben sind genau um 1 zu klein.“, hat das erzeugende Programm für das Zeilenende vermutlich nur ein Byte gezählt.`,
  "Fordern Sie die Originaldatei erneut an und speichern Sie sie nicht in einem Texteditor.")}
${err("pflichtfeld", "Pflichtfeld fehlt",
  "„Satz ab Zeile 5 (Satzart 8201 Labor-Bericht): Pflichtfeld 8301 (Eingangsdatum des Auftrags im Labor) fehlt.“",
  `Jede Satzart hat Muss-Felder, im LDT-2-Labor-Bericht 8201 zum Beispiel das Eingangsdatum 8301. ${src("ldt2", "Kap. 3.8")} In LDT 3 hat zusätzlich jedes Objekt Mussfelder, im Untersuchungsergebnis Obj_0060 zum Beispiel den Ergebnisstatus 8418. ${src("ldt3", "Kap. 11.43, S. 169")} Der Viewer prüft die Pflichtfelder jeder Satzart und die unbedingten Mussfelder jedes LDT-3-Objekts; bedingte Pflichtfelder, die von Regeln abhängen, prüft er nicht. ${src("tool", "Abschnitt Lücken")}`,
  "Informieren Sie das Labor bzw. den Hersteller der sendenden Software und nennen Sie Satzart, Zeile und Feldkennung.")}
${err("version", "Ältere oder falsche Version",
  "„Die Datei wurde nach LDT3.2.19 erstellt. Aktuell gültig ist LDT3.2.20 (in Kraft seit 01.10.2026).“",
  `In LDT 3 steht die Version in Feld 0001 der Kopfdaten (Obj_0032). Regel E001 erlaubt dort nur „LDT3.2.20“ und stuft Abweichungen als Warnung ein. ${src("ldt3", "Regel E001")} In LDT 2 steht die Version in Feld 9212, verbindlich ist „LDT1014.01“. ${src("ldt2", "Kap. 3.3")}`,
  `Bitten Sie den Absender, seine Software zu aktualisieren. Die Unterschiede der Versionen stehen unter <a href="${href("ldt-2-vs-ldt-3/")}">LDT 2 vs. LDT 3</a>.`)}
${err("unbekannt", "Unbekannte Feldkennung",
  "„Zeile 2: Feldkennung 7777 ist in der LDT-2-Feldtabelle (KBV LDT 5.12) nicht bekannt.“",
  "Die Kennung fehlt in der Feldtabelle der erkannten Version. Steht sie in einer anderen Tabelle, nennt der Viewer deren Bedeutung gleich mit. Mögliche Ursachen sind herstellereigene Erweiterungen, eine andere Version oder ein Tippfehler in der Schnittstelle.",
  `Schlagen Sie die Kennung unter <a href="${href("feldkennungen/")}">Feldkennungen</a> nach und klären Sie sie mit dem Hersteller der sendenden Software.`)}
${err("satzlaenge", "Satzlänge 8100 oder Gesamtlänge 9202 falsch (LDT 2)",
  "„Zeile 20: Die Satzlänge in Feld 8100 (00725) stimmt nicht mit der tatsächlichen Länge des Satzes überein (00708 Bytes).“",
  `In LDT 2 ist das zweite Feld jedes Satzes die Satzlänge 8100, die Summe aller Feldlängen des Satzes. ${src("ldt2", "Kap. 2.3.3")} Die Abschluss-Sätze 8221 und 8231 enthalten in Feld 9202 die Gesamtlänge des Datenpakets. ${src("ldt2", "Kap. 3.4 und 3.6")} Fehlt eine Zeile oder kommt eine hinzu, stimmen beide Werte nicht mehr.`,
  "Lassen Sie die Datei neu erzeugen und prüfen Sie, ob sie beim Kopieren abgeschnitten wurde.")}
${err("pruefsumme", "Prüfsumme in Feld 9300 passt nicht (LDT 3)",
  "„Zeile 426: Die Prüfsumme in Feld 9300 passt nicht zum Dateiinhalt.“",
  `Der Abschluss-Satz enthält in Feld 9300 einen SHA-1-Wert über alle Zeichen vor dieser Zeile. Eine Abweichung ist ein Fehler. ${src("ldt3", "Kap. 8.2, 8.4 und Regel E157")} Schon ein geändertes Zeichen reicht dafür aus.`,
  "Fordern Sie die Originaldatei neu an. Erscheinen weitere Fehler, beheben Sie zuerst diese beim Absender.")}
${err("satzende", "Satzende 8001 fehlt oder Objekte passen nicht (LDT 3)",
  "„Satz ab Zeile 46 (Satzart 8205 Befund): Das Satzende (Feld 8001) fehlt.“ oder „Zeile 42: Objektende Obj_0043 passt nicht zum offenen Objekt Obj_0007 (begonnen in Zeile 36).“",
  `Jeder Satz beginnt mit Feld 8000 und endet mit Feld 8001 mit derselben Satzart. Jedes Objekt beginnt mit 8002 und endet mit 8003 mit derselben Objekt-ID. ${src("ldt3", "Kap. 6.3")} Fehlt ein Ende, ist die Datei abgeschnitten oder durcheinander. Die Meldung „Die Datei enthält mehrere Datenpaket-Header oder -Abschlüsse.“ deutet auf zusammengefügte Dateien hin; jede Datei muss aber separat erzeugt und eingelesen werden. ${src("ldt3", "Kap. 6.2.1")}`,
  "Lassen Sie die Datei neu übertragen und fügen Sie LDT-Dateien nie zusammen.")}
${err("dateiname", "Dateiname folgt nicht der Namensregel",
  "„Der Dateiname „befund.ldt“ folgt nicht der LDT-3-Namensregel (Z01….ldt).“",
  `In LDT 3 beginnt der Name mit Z01, danach folgen Buchstaben, Ziffern oder Unterstrich, am Ende .ldt, höchstens 256 Zeichen. Die Konvention ist verbindlich. ${src("ldt3", "Kap. 6.7")} In LDT 2 nennt der erste Buchstabe den Zeichensatz: X für IBM-Code, S für 7-Bit-Code, A für ISO 8859-1, Z für ISO 8859-15. ${src("ldt2", "Kap. 2.7.3")} Der Viewer gibt dazu nur einen Hinweis aus.`,
  "Benennen Sie die Datei nach der Regel, zum Beispiel <code>Z0147112345M27_01.ldt</code>, oder fragen Sie, wer sie umbenannt hat.")}

<h2 id="grenzen">Was der Viewer prüft und was nicht</h2>
<p>Der Viewer prüft Zeilenaufbau, Satz- und Objektstruktur, Pflichtfelder der Satzarten und die unbedingten Mussfelder jedes LDT-3-Objekts, Feldlänge, Feldtyp, erlaubte Inhalte, Version, Zeichensatz und Prüfsumme. Von den Kontextregeln der LDT-3-Regeltabelle wertet er nur eine Auswahl aus, etwa dass ein abgeschlossener Befund keine vorläufigen Werte enthalten darf (K096) und auf einen Extremwert eine Meldung des Labors folgen muss (K099). ${src("ldt3", "Regeln K096 und K099")} Die neun offiziellen KBV-Testdateien zu LDT 3.2.20 zeigt er ohne Fehler und Warnungen. ${src("tool")} Er ersetzt nicht das LDK-Prüfmodul der KBV, das in allen Systemen eingebunden sein muss. ${src("faq", "Kap. 2")} Laborwerte bewertet er nicht, denn er ist kein Medizinprodukt. Bedeutung und Länge einzelner Kennungen stehen unter <a href="${href("feldkennungen/")}">Feldkennungen</a>. Alle Fehlerbeispiele dieser Seite und gültige Vergleichsdateien finden Sie unter <a href="${href("ldt-datei-beispiel/")}">LDT-Beispieldateien</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("Datei jetzt prüfen", "Öffnen Sie die LDT-Datei im Viewer und lesen Sie die Meldungen im Reiter „Prüfung“. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["ldt-datei-oeffnen/", "bdt-datei-oeffnen/", "ldt-2-vs-ldt-3/", "feldkennungen/"])}
</main>`,
};
}
