import { href, heroHtml, breadcrumbLd, howToLd, stepsHtml, faqHtml, faqLd, relatedHtml, ctaHtml, src } from "../lib/layout.mjs";

const path = "ldt-datei-oeffnen/";
const crumbs = [["LDT & BDT Viewer", ""], ["LDT-Datei öffnen", path]];
const title = "LDT Datei öffnen: Anleitung für Laborbefunde (kostenlos)";
const description = "LDT Datei öffnen in 7 Schritten: Laborbefund im Browser ansehen, Markierungen lesen, Fehler prüfen. Mit Checkliste, wenn ein Befund nicht ankommt.";

const steps = [
  {
    name: "Viewer aufrufen",
    text: "Öffnen Sie den LDT & BDT Viewer in einem aktuellen Browser. Sie müssen nichts installieren und sich nicht anmelden.",
    html: `Öffnen Sie den <a href="${href()}">LDT &amp; BDT Viewer</a> in einem aktuellen Browser. Sie müssen nichts installieren und sich nicht anmelden.`,
  },
  {
    name: "Datei wählen oder ins Feld ziehen",
    text: "Klicken Sie im Bereich „Datei öffnen“ auf „Datei wählen“ oder ziehen Sie die Datei in das Feld. Möglich sind .ldt, .dat und .txt, auch mehrere Dateien auf einmal. Zum Ausprobieren gibt es die Beispiele „LDT 3“ und „LDT 2 (Codepage 437)“.",
  },
  {
    name: "Zusammenfassung lesen",
    text: "Karten zeigen Dateityp und Version, Richtung (etwa „Befund vom Labor an die Praxis“), Absender, Empfänger, Datum, Sätze, Patienten und Befunde, Zeichensatz und das Ergebnis der Prüfung.",
  },
  {
    name: "Laborwerte im Reiter „Befunde“ ansehen",
    text: "Für jeden Patienten erscheint eine Tabelle mit Untersuchung, Ergebnis, Einheit, Normbereich und „Markierung laut Datei“. Mit „Suchen und filtern“ finden Sie Patienten oder Untersuchungen.",
  },
  {
    name: "Details im Reiter „Struktur“ prüfen",
    text: "Hier stehen Sätze und Objekte als Baum, daneben die Rohzeilen mit Zeile, Länge, Feld, Bedeutung und Inhalt. „Gehe zu Zeile“ springt zu einer bestimmten Zeilennummer.",
  },
  {
    name: "Meldungen im Reiter „Prüfung“ lesen",
    text: "Fehler, Warnungen und Hinweise stehen mit Zeilennummer da. „Was bedeutet das in der Praxis?“ erklärt jede Meldung in einfachen Worten.",
  },
  {
    name: "Zeichensatz umschalten, wenn Umlaute falsch aussehen",
    text: "Erscheinen Namen wie „M?ller“ oder „MÃ¼ller“, wählen Sie in der Karte „Zeichensatz“ einen anderen. Danach können Sie die Befunde mit „CSV“ für Excel speichern oder mit „Drucken“ ausdrucken.",
  },
];

const faq = [
  {
    q: "Kann ich eine LDT-Datei auch mit dem Editor öffnen?",
    a: `Ja, eine LDT-Datei ist eine Textdatei. Sie sehen dann aber nur Rohzeilen wie 0178002Obj_0032 ohne Erklärung. Speichern Sie die Datei im Editor nicht: Schon kleine Änderungen machen Längenangaben falsch, und in LDT 3 passt die Prüfsumme in Feld 9300 nicht mehr, weil sie über alle Zeichen davor berechnet wird. ${src("ldt3", "Regel E157")}`,
  },
  {
    q: "Warum bleibt der Reiter „Befunde“ leer?",
    a: `Vermutlich ist es eine Auftragsdatei. Aufträge an das Labor enthalten noch keine Ergebnisse. In LDT 3 ist das die Satzart 8215 ${src("ldt3", "Kap. 6.2")}, in LDT 2 sind es die Satzarten 8218 und 8219 ${src("ldt2", "Kap. 2.3.1")}. Den Inhalt sehen Sie dann im Reiter „Struktur“.`,
  },
  {
    q: "Kann ich mehrere LDT-Dateien gleichzeitig öffnen?",
    a: "Ja. Wählen Sie mehrere Dateien aus oder ziehen Sie sie gemeinsam in das Feld. Jede Datei bekommt einen eigenen Reiter.",
  },
  {
    q: "Funktioniert der Viewer auch ohne Internetverbindung?",
    a: "Ja, nach dem ersten Aufruf. Der Browser speichert die Seite des Viewers zwischen, danach öffnet sie Dateien auch offline. Ihre Datei wird in beiden Fällen nur auf Ihrem Rechner gelesen.",
  },
];

export default {
  path,
  title,
  description,
  ogTitle: "LDT-Datei öffnen: Laborbefund lesen und prüfen",
  ogDescription: "Schritt-für-Schritt-Anleitung: LDT-Datei im Browser öffnen, Laborwerte und Markierungen lesen, Fehler finden. Ohne Upload.",
  ogType: "article",
  minInternalLinks: 3,
  llms: "Anleitung in sieben Schritten, wie man eine LDT-Datei (Laborbefund) im Browser öffnet, Werte und Markierungen liest und mit einer Checkliste prüft, warum ein Befund nicht in der Praxissoftware ankommt.",
  jsonld: [
    howToLd({
      name: "LDT-Datei öffnen und einen Laborbefund lesen",
      description: "Eine LDT-Datei im kostenlosen LDT & BDT Viewer öffnen, Laborwerte, Struktur und Prüfmeldungen ansehen und den Zeichensatz umschalten.",
      steps,
      path,
    }),
    faqLd(faq.map((f) => ({ q: f.q, a: f.a.replace(/&amp;/g, "&") }))),
    breadcrumbLd(crumbs),
  ],
  body: `<main id="inhalt">
${heroHtml({
  crumbs,
  h1: "LDT-Datei öffnen: Laborbefund lesen und prüfen",
  lead: `Eine LDT-Datei öffnen Sie am einfachsten im kostenlosen <a href="${href()}">LDT &amp; BDT Viewer</a>: Seite aufrufen, die Datei ins Feld ziehen oder auf „Datei wählen“ klicken. Der Viewer zeigt die Laborwerte als Tabelle, den Aufbau der Datei und eine Prüfung auf Fehler. Die Datei bleibt dabei in Ihrem Browser, nichts wird hochgeladen.`,
  minutes: 5,
})}
<div class="prose">
<p>LDT steht für Labordatenträger: Mit diesem Format tauschen Labore und Arztpraxen Aufträge und Befundberichte aus. ${src("ldt2", "Kap. 1.1")} Was dahintersteckt, erklärt <a href="${href("was-ist-ldt/")}">Was ist LDT? Der Labordatenträger</a>. Hier geht es um die Praxis: Datei öffnen, Werte lesen, Probleme finden.</p>

<h2 id="anleitung">Anleitung: LDT-Datei öffnen in 7 Schritten</h2>
${stepsHtml(steps)}
<div class="callout"><span class="callout-title">Datenschutz und Grenzen</span>
<p>Die Datei wird nur in Ihrem Browser gelesen, ohne Upload, Cookies oder Tracking.</p>
<p>Der Viewer ist kein Medizinprodukt. Er zeigt Dateien an und prüft ihren Aufbau, bewertet aber keine Laborwerte und stellt keine Diagnose.</p></div>

<h2 id="befund-lesen">Laborbefund lesen: Markierungen und Werte</h2>
<h3>Was ▲, ▼ und ! bedeuten</h3>
<p>Ob ein Wert erhöht oder erniedrigt ist, schreibt das Labor selbst in Feld 8422 (Grenzwertindikator). Der Viewer zeigt dieses Kennzeichen unverändert mit Symbol und Text an, etwa „▲ schwach erhöht (H)“, und rechnet nichts nach. Fragen zu einem Wert klären Sie mit dem Labor oder der behandelnden Ärztin bzw. dem behandelnden Arzt.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Kennzeichen in der Datei</th><th scope="col">Bedeutung laut LDT 3</th><th scope="col">Anzeige im Viewer</th></tr></thead>
<tbody>
<tr><td><code>H</code> oder <code>+</code></td><td>schwach erhöht</td><td>▲</td></tr>
<tr><td><code>HH</code> oder <code>++</code></td><td>stark erhöht</td><td>▲</td></tr>
<tr><td><code>!H</code> oder <code>!+</code></td><td>extrem erhöht</td><td>▲</td></tr>
<tr><td><code>L</code> oder <code>-</code></td><td>schwach erniedrigt</td><td>▼</td></tr>
<tr><td><code>LL</code> oder <code>--</code></td><td>stark erniedrigt</td><td>▼</td></tr>
<tr><td><code>!L</code> oder <code>!-</code></td><td>extrem erniedrigt</td><td>▼</td></tr>
<tr><td><code>A</code> / <code>AA</code></td><td>auffällig / sehr auffällig (nicht numerische Werte)</td><td>!</td></tr>
<tr><td><code>N</code></td><td>im Normalbereich bzw. normal</td><td>●</td></tr>
</tbody></table></div>
<p>${src("ldt3", "Regel E005")} In LDT 2 gibt es die Kennzeichen <code>+</code> (leicht erhöht), <code>++</code> (stark erhöht), <code>-</code> (mäßig erniedrigt), <code>--</code> (stark erniedrigt) und <code>!</code> (auffällig). ${src("ldt2", "Feld 8422")}</p>

<h3>Wo die Werte in der Datei stehen</h3>
<p>Für Praxis-IT und Support: In LDT 2 hat jede Angabe ein eigenes Feld, etwa 8411 Testbezeichnung, 8420 Ergebniswert, 8421 Einheit und 8480 Ergebnis-Text. ${src("ldt2", "Kap. 3.8")} Die Befundart steht in Feld 8401: <code>E</code> Endbefund, <code>T</code> Teilbefund, <code>V</code> Vorläufiger Befund, <code>A</code> Archiv-Befund, <code>N</code> Nachforderung. ${src("ldt2", "Feld 8401")} Der Viewer zeigt sie im Kopf des Befunds. In LDT 3 stecken die Werte in Objekten, zum Beispiel Obj_0060 (Untersuchungsergebnis Klinische Chemie) und Obj_0042 (Normalwert). ${src("ldt3", "Kap. 11")} Jede Kennung finden Sie unter <a href="${href("feldkennungen/")}">Feldkennungen</a>.</p>

<h2 id="befund-kommt-nicht-an">Was tun, wenn ein Laborbefund nicht in der Praxissoftware ankommt?</h2>
<p>Gehen Sie die Punkte der Reihe nach durch. Ab Punkt 2 öffnen Sie die LDT-Datei im Viewer und schauen in die Karte „Prüfung“.</p>
<ol>
<li><strong>Liegt die Datei vor?</strong> In LDT 3 schickt das Labor Befunde über gesicherte Strukturen, vorrangig KV-Connect. ${src("ldt3", "Kap. 6.2.3")} Ist keine Datei angekommen, liegt das Problem bei der Übertragung; fragen Sie beim Labor nach.</li>
<li><strong>Format und Version:</strong> Die Karte „Dateityp“ zeigt LDT 2.x oder LDT 3.x mit Version. Gültig ist LDT 3.2.20, in Kraft seit 01.10.2026. ${src("ldt3", "S. 1–2")} Eine ältere LDT-3-Version meldet der Viewer als Warnung. Die Unterschiede erklärt <a href="${href("ldt-2-vs-ldt-3/")}">LDT 2 vs. LDT 3</a>.</li>
<li><strong>Zeichensatz:</strong> In LDT 3 ist nur ISO 8859-15 erlaubt. ${src("ldt3", "Kap. 6.6")} Die Meldung „Die Datei scheint UTF-8 zu verwenden. Vorgeschrieben ist ISO 8859-15.“ heißt: Die Datei wurde falsch erzeugt.</li>
<li><strong>Längen und Zeilenende:</strong> Jedes Feld endet mit CR LF, die Länge ist Inhalt plus 9. ${src("ldt3", "Kap. 6.4.1")} Meldet der Viewer falsche Längenangaben oder Zeilen, die nur mit LF enden, wurde die Datei fehlerhaft erzeugt oder später verändert.</li>
<li><strong>Dateiname:</strong> In LDT 3 beginnt der Name verbindlich mit <code>Z01</code> und endet auf <code>.ldt</code>, zum Beispiel <code>Z0147112345M27_01.ldt</code>. ${src("ldt3", "Kap. 6.7")} Fragen Sie nach, ob jemand die Datei umbenannt hat.</li>
<li><strong>Pflichtfelder und Reihenfolge:</strong> Ein Befund beginnt mit Satz 8220 und endet mit Satz 8221. ${src("ldt3", "Kap. 6.2.3")} Fehlende Pflichtfelder nennt der Viewer mit Satzart und Zeile.</li>
<li><strong>Prüfsumme:</strong> Feld 9300 im Abschluss-Satz 8221 enthält einen SHA-1-Wert über alle Zeichen davor; eine Abweichung ist ein Fehler. ${src("ldt3", "Kap. 8.2, Regel E157")} Passt sie nicht, wurde die Datei nach dem Erzeugen verändert oder ist unvollständig.</li>
</ol>
<p>Was jede einzelne Meldung bedeutet, erklärt die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>.</p>

<h3>Danach: Labor oder Softwarehersteller ansprechen</h3>
<p>Zeigt der Viewer Fehler in der Datei, ist das Labor der richtige Ansprechpartner, denn die Datei muss beim Absender neu erzeugt werden. Ist sie fehlerfrei und kommt trotzdem nicht an, wenden Sie sich an den Hersteller Ihrer Praxissoftware. Nennen Sie Dateiname, Zeilennummer und den genauen Meldungstext. Der Viewer ersetzt nicht das LDK-Prüfmodul der KBV, das in allen Systemen eingebunden sein muss. ${src("faq", "Kap. 2")}</p>

<h3>Datei für den Support anonymisieren</h3>
<p>Schicken Sie für den Support möglichst keine echten Patientendaten. „Anonymisieren“ ersetzt Namen, Geburtsdaten, Adressen, Versichertennummern, Telefonnummern und Patientennummern, entfernt eingebettete LDT-3-Anhänge und lädt eine neue Datei herunter. Das ist wichtig, weil die AG LDT empfiehlt, immer eine PDF-Datei des Befundes einzubetten. ${src("ldt3", "Fußnote 7 zu Kap. 8.5")} Prüfen Sie die Kopie über „Anonymisierte Datei hier öffnen und prüfen“, vor allem Freitexte.</p>
<p>Wichtig: Beim Anonymisieren berechnet der Viewer Längen, Satzlängen, Feld 9202 und die Prüfsumme neu. Solche Fehler fehlen in der Kopie also; legen Sie dann die Meldungstexte der Originaldatei bei.</p>
</div>
${faqHtml(faq)}
${ctaHtml("LDT-Datei jetzt öffnen", "Ziehen Sie Ihren Laborbefund in den Viewer. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["was-ist-ldt/", "fehler/", "ldt-2-vs-ldt-3/", "feldkennungen/"])}
</main>`,
};
