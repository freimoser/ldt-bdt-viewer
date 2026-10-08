import { href, heroHtml, breadcrumbLd, howToLd, stepsHtml, faqHtml, faqLd, relatedHtml, ctaHtml, src } from "../lib/layout.mjs";

const path = "bdt-datei-oeffnen/";
const crumbs = [["LDT & BDT Viewer", ""], ["BDT-Datei öffnen", path]];
const title = "BDT Datei öffnen: Anleitung für Praxissoftware-Exporte";
const description = "BDT Datei öffnen und prüfen: Export aus der Praxissoftware im Browser ansehen, Patienten und Umlaute kontrollieren. Mit Checkliste für den Softwarewechsel.";

const steps = [
  {
    name: "Mit einer Kopie arbeiten",
    text: "Legen Sie eine Kopie der Export-Datei an und arbeiten Sie nur mit dieser Kopie. So bleibt der Originalexport unverändert, falls der neue Anbieter ihn später braucht.",
  },
  {
    name: "Viewer aufrufen und Datei wählen",
    text: "Öffnen Sie den LDT & BDT Viewer und klicken Sie auf „Datei wählen“, oder ziehen Sie die Datei in das Feld. Der Viewer öffnet Dateien mit den Endungen .bdt, .dat und .txt bis 300 MB. Zum Ausprobieren gibt es die Beispiel-Schaltfläche „BDT“.",
    html: `Öffnen Sie den <a href="${href()}">LDT &amp; BDT Viewer</a> und klicken Sie auf „Datei wählen“, oder ziehen Sie die Datei in das Feld. Der Viewer öffnet Dateien mit den Endungen .bdt, .dat und .txt bis 300 MB. Zum Ausprobieren gibt es die Beispiel-Schaltfläche „BDT“.`,
  },
  {
    name: "Zusammenfassung prüfen",
    text: "Die Karte „Dateityp“ zeigt BDT und den Aufbau: „klassischer Aufbau (Satzlänge in 8100)“ oder „BDT 3.0“. Unter „Richtung“ steht „Export aus einer Praxissoftware“. Die Karte „Patienten und Befunde“ zählt die verschiedenen Patientennummern. Die Karte „Datum“ zeigt den exportierten Zeitraum, wenn die Datei ihn in Feld 9603 angibt.",
  },
  {
    name: "Inhalte im Reiter „Struktur“ ansehen",
    text: "Hier sehen Sie alle Sätze, zum Beispiel 6100 für Patientenstammdaten und 6200 für Behandlungsdaten, und daneben jede Zeile mit Feld, Bedeutung und Inhalt. Im Feld „Suchen und filtern“ suchen Sie nach einem Namen oder einer Feldkennung wie 3101 (Name).",
  },
  {
    name: "Laborwerte im Reiter „Befunde“ ansehen",
    text: "Enthält der Export Laborwerte, stehen sie im Reiter „Befunde“ als Tabelle pro Patient. Die Stammdaten ordnet der Viewer über die Patientennummer zu. Findet er keine Laborwerte, sagt er das und verweist auf den Reiter „Struktur“.",
  },
  {
    name: "Reiter „Prüfung“ und Zeichensatz kontrollieren",
    text: "Im Reiter „Prüfung“ stehen Fehler, Warnungen und Hinweise mit Zeilennummer und Erklärung. Sehen Umlaute falsch aus, wählen Sie in der Karte „Zeichensatz“ einen anderen Zeichensatz und vergleichen Sie.",
  },
];

const faq = [
  {
    q: "Welche Endung hat eine BDT-Datei?",
    a: `Nach BDT 3.0 endet der Dateiname auf .BDT, der Text davor ist frei wählbar. ${src("bdt3", "Kap. 3.2")} Der Viewer öffnet .bdt, .dat und .txt und erkennt das Format am Inhalt, nicht an der Endung.`,
  },
  {
    q: "Kann der Viewer eine BDT-Datei in eine andere Praxissoftware übertragen?",
    a: "Nein. Der Viewer zeigt die Datei an und prüft sie. Den Import übernimmt die neue Praxissoftware. Laborwerte aus dem Reiter „Befunde“ können Sie als CSV speichern, die Rohdaten als JSON.",
  },
  {
    q: "Wie groß darf eine BDT-Datei für den Viewer sein?",
    a: "Der Viewer öffnet Dateien bis 300 MB, größere lehnt er mit einem Hinweis ab. Weil die Datei nur in Ihrem Browser gelesen wird, hängt die Ladezeit von Ihrem Rechner ab.",
  },
  {
    q: "Kann ich nur einen einzelnen Patienten als BDT exportieren?",
    a: `BDT 3.0 sieht dafür die Anwendungsfälle 4 (Einzelpatient) und 5 (Fallakte) vor. ${src("bdt3", "Kap. 3.6")} Ob Ihre Praxissoftware diesen Export anbietet, erfahren Sie beim Hersteller. Für eine Support-Anfrage können Sie die Datei danach im Viewer anonymisieren.`,
  },
];

export default {
  path,
  title,
  description,
  ogTitle: "BDT-Datei öffnen: Export aus der Praxissoftware prüfen",
  ogDescription: "BDT-Export im Browser öffnen, Patienten, Umlaute und Aufbau kontrollieren und für den Wechsel der Praxissoftware vorbereiten. Ohne Upload.",
  ogType: "article",
  minInternalLinks: 3,
  llms: "Anleitung, wie man eine BDT-Datei (Export aus der Praxissoftware) im Browser öffnet und prüft, mit Checkliste für die Datenübernahme beim Wechsel der Praxissoftware.",
  jsonld: [
    howToLd({
      name: "BDT-Datei öffnen und einen Praxissoftware-Export prüfen",
      description: "Eine BDT-Datei im kostenlosen LDT & BDT Viewer öffnen, Aufbau, Patienten, Zeichensatz und Prüfmeldungen kontrollieren.",
      steps,
      path,
    }),
    faqLd(faq.map((f) => ({ q: f.q, a: f.a.replace(/&amp;/g, "&") }))),
    breadcrumbLd(crumbs),
  ],
  body: `<main id="inhalt">
${heroHtml({
  crumbs,
  h1: "BDT-Datei öffnen: Export aus der Praxissoftware prüfen",
  lead: `Eine BDT-Datei öffnen Sie am einfachsten im kostenlosen <a href="${href()}">LDT &amp; BDT Viewer</a>: Datei ins Feld ziehen oder auf „Datei wählen“ klicken. Der Viewer zeigt Sätze, Felder und Patienten lesbar an, erkennt den Zeichensatz und prüft den Aufbau Zeile für Zeile. Die Datei bleibt dabei in Ihrem Browser und wird nicht hochgeladen.`,
  minutes: 5,
})}
<div class="prose">
<p>BDT steht heute für Behandlungsdatentransfer, früher für Behandlungsdatenträger. Mit diesem Format geben Praxisprogramme ihre Daten systemunabhängig weiter. ${src("bdt3", "Kap. 2")} Herkunft, Versionen und den Aufbau Zeile für Zeile erklärt <a href="${href("was-ist-bdt/")}">Was ist BDT? Der Behandlungsdatenträger</a>. Hier geht es darum, einen BDT-Export zu öffnen und zu kontrollieren, bevor Sie ihn weitergeben.</p>

<h2 id="anleitung">Anleitung: BDT-Datei öffnen in 6 Schritten</h2>
${stepsHtml(steps)}
<div class="callout"><span class="callout-title">Datenschutz</span>
<p>Ein BDT-Export enthält oft die Daten vieler Patienten. Der Viewer liest die Datei nur in Ihrem Browser, ohne Upload, Cookies oder Tracking.</p></div>

<h2 id="praxiswechsel">Datenübernahme beim Wechsel der Praxissoftware</h2>
<p>BDT wurde Anfang der 1990er Jahre unter anderem entwickelt, um Ärzten den Wechsel des Softwareanbieters zu erleichtern. ${src("bdt3", "Kap. 2")} Bevor Sie einen Export an den neuen Anbieter geben, gehen Sie diese Checkliste durch:</p>
<ol>
<li><strong>Art des Exports prüfen:</strong> In BDT 3.0 steht der Anwendungsfall im Datei-Header (Satzart 0020) in Feld 0010. Für einen Systemwechsel ist der Wert 1 (Gesamtbestand) vorgesehen; 3 stünde zum Beispiel nur für ein Quartal, 4 für einen Einzelpatienten. Feld 9603 nennt den Zeitraum der exportierten Daten. ${src("bdt3", "Kap. 3.6")} Für Exporte im klassischen Aufbau sind die Kopfsätze nicht öffentlich dokumentiert. ${src("tool", "Abschnitt Lücken")} Fragen Sie dann beim bisherigen Anbieter nach, was genau exportiert wurde.</li>
<li><strong>Vollständigkeit grob prüfen:</strong> Vergleichen Sie die Zahl in der Karte „Patienten und Befunde“ mit der Patientenzahl in Ihrer bisherigen Software. Meldet der Viewer ein fehlendes Satzende oder falsche Satzlängen, wurde der Export womöglich abgebrochen.</li>
<li><strong>Stichproben ziehen:</strong> Suchen Sie im Reiter „Struktur“ über „Suchen und filtern“ fünf bis zehn bekannte Patienten. Prüfen Sie Name, Vorname, Geburtsdatum und einige Behandlungseinträge. Nehmen Sie bewusst Patienten mit Umlauten oder ß im Namen dazu.</li>
<li><strong>Umlaute und Zeichensatz:</strong> Erscheinen Namen wie „M?ller“ oder „MÃ¼ller“, passt der Zeichensatz nicht. BDT 3.0 schreibt ISO/IEC 8859-15 vor. ${src("bdt3", "Kap. 3.7.5")} Probieren Sie in der Karte „Zeichensatz“ einen anderen und teilen Sie dem neuen Anbieter mit, welcher richtig aussieht.</li>
<li><strong>Prüfmeldungen sichern:</strong> Notieren Sie Fehler und Warnungen aus dem Reiter „Prüfung“ mit Zeilennummer. Die Längenregel (Inhalt plus 9) gilt in BDT wie in LDT. ${src("bdt3", "Kap. 3.3")} Viele Meldungen erklärt deshalb auch die Seite <a href="${href("fehler/")}">Fehler in LDT-Dateien</a>.</li>
<li><strong>Externe Dateien klären:</strong> Dateien in anderen Formaten, auch Abrechnungsnotizen, bezieht BDT 3.0 nur über Referenzen ein. ${src("bdt3", "Kap. 2 und 3.6.1")} Im Viewer sehen Sie nur den Verweis. Klären Sie mit beiden Anbietern, wie Dokumente, Bilder und Briefe mitkommen.</li>
<li><strong>Anonymisieren für den neuen Anbieter:</strong> Möchte der neue Anbieter vorab eine Beispieldatei für einen Importtest, nutzen Sie die Schaltfläche „Anonymisieren“. Sie ersetzt Namen, Geburtsdaten, Adressen, Versichertennummern, Telefonnummern und Patientennummern und lädt eine neue Datei herunter. Sehen Sie Freitexte vor dem Versand trotzdem kurz durch.</li>
<li><strong>Testdateien nutzen:</strong> Für Tests ganz ohne echte Daten erzeugt der Bereich „Testdateien erzeugen“ eine BDT-Datei im klassischen Aufbau mit 1 bis 200 erfundenen Patienten, deren Namen mit „Test-“ beginnen.</li>
</ol>

<h3>Was der Viewer bei BDT nicht prüft</h3>
<p>Der Viewer prüft Aufbau, Felder und Zeichensatz. Regeln zur Plausibilitätsprüfung von Abrechnungen gehören nicht zur BDT-Definition ${src("bdt3", "Kap. 3.6.1")}, deshalb prüft er die Abrechnung nicht. BDT-3.0-Objekte prüft er nicht gegen ihren Aufbau. Für klassische Exporte nutzt er die Feldtabelle von BDT 3.0, weil die Originalspezifikation BDT 02/94 nicht mehr öffentlich abrufbar ist; Felder, die nur dort definiert sind, erscheinen als „unbekannt“. ${src("tool", "Abschnitt Lücken")} Das ist nicht automatisch ein Fehler. Klären Sie solche Felder mit dem neuen Anbieter. Wie BDT mit GDT und LDT zusammenhängt, zeigt <a href="${href("xdt-gdt-ldt-bdt/")}">xDT: GDT, LDT, BDT</a>.</p>
</div>
${faqHtml(faq)}
${ctaHtml("BDT-Datei jetzt prüfen", "Öffnen Sie Ihren Export im Viewer. Die Datei bleibt auf Ihrem Rechner.")}
${relatedHtml(["was-ist-bdt/", "xdt-gdt-ldt-bdt/", "fehler/", "feldkennungen/"])}
</main>`,
};
