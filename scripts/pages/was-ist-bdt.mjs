import { heroHtml, breadcrumbLd, articleLd, faqHtml, faqLd, relatedHtml, ctaHtml, src, href } from "../lib/layout.mjs";

const path = "was-ist-bdt/";
const crumbs = [["LDT & BDT Viewer", ""], ["Was ist BDT?", path]];
const title = "BDT Behandlungsdatenträger: Definition und Einsatz";
const description = "BDT (Behandlungsdatenträger) erklärt: Herkunft vom ZI, BDT 3.0 des QMS, Export beim Praxissoftware-Wechsel, Dateiaufbau mit Beispielen und Grenzen.";
const h1 = "BDT (Behandlungsdatenträger): Definition, Aufbau und Einsatz";

const faq = [
  {
    q: "Enthält eine BDT-Datei auch Termine und Adressen?",
    a: "In BDT 3.0 ja. Die Beschreibung des QMS kennt eigene Satzarten für Adressen (adrs) und Termine (term) sowie die Anwendungsfälle 90 (Termine) und 91 (Adressen). Ältere BDT-Versionen beschrieben solche Praxisverwaltungsdaten laut QMS noch nicht.",
  },
  {
    q: "Wer ist heute für BDT zuständig?",
    a: "Seit 2011 entwickelt der Qualitätsring Medizinische Software (QMS) den BDT weiter, in Absprache mit dem Zentralinstitut für die Kassenärztliche Versorgung (ZI) und der KBV. Den Feldkatalog aller Felder der xDT-Familie führt die KBV.",
  },
  {
    q: "Was unterscheidet die Anwendungsfälle 1 und 11?",
    a: "Beide übertragen den Gesamtbestand. Anwendungsfall 1 ist laut BDT 3.0 zum Beispiel für den Systemwechsel gedacht, Anwendungsfall 11 für die Archivierung. Nur bei 11 darf nach dem Entwurf zusätzlich die Feldkennung 0000 auftauchen, mit der frühere Feldinhalte samt Zeitpunkt und Bearbeiter übertragen werden. Dieser Punkt ist in Version 0.96 noch als „zu diskutieren“ markiert.",
  },
  {
    q: "Woran erkenne ich, ob ein Export klassisch oder nach BDT 3.0 aufgebaut ist?",
    a: "Steht im zweiten Feld eines Satzes die Feldkennung 8100 (Satzlänge), ist es der klassische Aufbau. Endet jeder Satz mit Feld 8202, das die Felder des Satzes zählt, ist es BDT 3.0. Der <a href=\"" + href() + "\">Viewer</a> erkennt beide Varianten automatisch.",
  },
  {
    q: "Prüft BDT die Abrechnungsdaten beim Wechsel?",
    a: "Nein. Laut BDT-3.0-Beschreibung sind Regeln zur Plausibilitätsprüfung von Abrechnungen nicht Bestandteil der BDT-Definition. Abrechnungsnotizen in anderen Formaten werden nur als Referenz auf externe Dateien mitgegeben.",
  },
];

const body = `<main id="inhalt">
${heroHtml({
  crumbs,
  h1,
  lead: `<strong>BDT (Behandlungsdatenträger, heute auch Behandlungsdatentransfer) ist</strong> ein Standard der xDT-Familie, mit dem Praxissoftware ihre Daten systemunabhängig exportiert, vor allem damit eine Arztpraxis beim Wechsel des Praxisprogramms ihre Patientendaten mitnehmen kann. ${src("bdt3", "Kap. 2")}`,
  minutes: 6,
})}
<div class="prose">
<h2>Woher kommt BDT?</h2>
<p>Die wichtigsten Stationen laut der BDT-3.0-Beschreibung des QMS:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Zeitpunkt</th><th scope="col">Was geschah</th></tr></thead>
<tbody>
<tr><td>Anfang der 1990er Jahre</td><td>Das Zentralinstitut für die Kassenärztliche Versorgung (ZI) entwickelt BDT, um die vollständige Behandlungsdokumentation aller Patienten zwischen Praxis-Software-Systemen austauschen zu können und Ärzten den Wechsel des Softwareanbieters zu erleichtern.</td></tr>
<tr><td>15.09.1998</td><td>Stand der zuletzt gemeinfrei verfügbaren Fassung BDT 02/94. Später stellt das ZI Pflege und Weiterentwicklung ein.</td></tr>
<tr><td>2011</td><td>Der Qualitätsring Medizinische Software (QMS) nimmt in Absprache mit ZI und KBV die Weiterentwicklung auf.</td></tr>
<tr><td>01.03.2015</td><td>BDT 3.0, Version 0.96, erscheint mit dem Status „Freigabe für Testimplementierungen“.</td></tr>
</tbody>
</table></div>
<p>${src("bdt3", "S. 2 und Kap. 2")}</p>

<h2>Einsatz beim Wechsel der Praxissoftware</h2>
<p>Der Hauptzweck ist der Umzug von Daten: Das bisherige Programm exportiert den Bestand als BDT-Datei, das neue Programm liest sie ein. BDT 3.0 nennt als wichtigste Anwendungsfälle den vollständigen Export, auch zur Archivierung, und den Import aller Daten eines Praxis-Software-Systems. ${src("bdt3", "Kap. 3.6")}</p>
<p>Welcher Anwendungsfall vorliegt, steht in BDT 3.0 im Datei-Header (Satzart 0020) in Feld 0010:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Wert in Feld 0010</th><th scope="col">Anwendungsfall</th></tr></thead>
<tbody>
<tr><td>1</td><td>Gesamtbestand, zum Beispiel für einen Systemwechsel</td></tr>
<tr><td>2</td><td>definierter Zeitraum</td></tr>
<tr><td>3</td><td>Quartal</td></tr>
<tr><td>4</td><td>Einzelpatient</td></tr>
<tr><td>5</td><td>Fallakte</td></tr>
<tr><td>6</td><td>Medikationsplan</td></tr>
<tr><td>10</td><td>Notdienst</td></tr>
<tr><td>11</td><td>Gesamtbestand für die Archivierung</td></tr>
<tr><td>90</td><td>Termine</td></tr>
<tr><td>91</td><td>Adressen</td></tr>
<tr><td>99</td><td>sonstiger Anwendungsfall</td></tr>
</tbody>
</table></div>
<p>${src("bdt3", "Kap. 3.6")}</p>
<p>Inhaltlich beschreibt BDT 3.0 vor allem die „Karteikarte“ des Patienten: Stammblattdaten und datumsbezogene Verlaufsdaten der Behandlung. Im Unterschied zu älteren Versionen kommen Praxisverwaltungsdaten wie Adressen und Termine hinzu. ${src("bdt3", "Kap. 2")}</p>
<p>Wie Sie einen Export vor der Übernahme ansehen und auf Vollständigkeit prüfen, zeigt die Anleitung <a href="${href("bdt-datei-oeffnen/")}">BDT-Datei öffnen</a>.</p>

<h2>Aufbau einer BDT-Datei</h2>
<p>Wie in LDT ist jede Zeile ein Feld: 3 Zeichen Länge, 4 Zeichen Feldkennung, der Inhalt und am Ende CR LF (Wagenrücklauf und Zeilenvorschub). Die Länge ist Inhalt plus 9, leere Felder sind nicht erlaubt. ${src("bdt3", "Kap. 3.3")} Jeder Satz beginnt mit Feld 8000 (Satzart). Danach unterscheiden sich der klassische Aufbau und BDT 3.0:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Merkmal</th><th scope="col">Klassischer Aufbau</th><th scope="col">BDT 3.0 (Entwurf 0.96)</th></tr></thead>
<tbody>
<tr><td>Satzbeginn</td><td>Feld 8000 Satzart</td><td>Feld 8000 Satzart</td></tr>
<tr><td>Satzlänge oder Satzende</td><td>Feld 8100 Satzlänge als zweites Feld</td><td>Feld 8202 Satzende am Schluss, zählt alle Felder des Satzes einschließlich 8000 und 8202</td></tr>
<tr><td>Gliederung im Satz</td><td>Felder in bis zu fünf Hierarchieebenen</td><td>bis zu fünf Hierarchiestufen, dazu Objekte mit Anfang Feld 8200 und Ende Feld 8201</td></tr>
<tr><td>Datum</td><td>im Beispiel 3103 = <code>10051963</code> (TTMMJJJJ)</td><td>TTMMJJJJ</td></tr>
<tr><td>Zeichensatz</td><td>in der genutzten Quelle nicht beschrieben</td><td>ISO/IEC 8859-15</td></tr>
<tr><td>Dateiname</td><td>in der genutzten Quelle nicht beschrieben</td><td><code>&lt;Beliebiger_Text&gt;.BDT</code></td></tr>
</tbody>
</table></div>
<p>${src("giessen")} ${src("bdt3", "Kap. 2.2, 3.2–3.4 und 3.7.5")}</p>
<h3>Beispiel: klassischer Aufbau</h3>
<p>Ein Patientenstamm-Satz, wie ihn die Universität Gießen beschreibt:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Länge</th><th scope="col">Feldkennung</th><th scope="col">Inhalt</th><th scope="col">Bedeutung</th></tr></thead>
<tbody>
<tr><td>013</td><td>8000</td><td>6100</td><td>Satzart 6100 Patientenstamm</td></tr>
<tr><td>014</td><td>8100</td><td>00499</td><td>Satzlänge 499 Bytes</td></tr>
<tr><td>010</td><td>3000</td><td>1</td><td>Patientennummer</td></tr>
<tr><td>015</td><td>3101</td><td>Axmann</td><td>Nachname</td></tr>
<tr><td>015</td><td>3102</td><td>Tobias</td><td>Vorname</td></tr>
<tr><td>017</td><td>3103</td><td>10051963</td><td>Geburtsdatum 10.05.1963</td></tr>
</tbody>
</table></div>
<p>${src("giessen")}</p>
<h3>Beispiel: BDT 3.0</h3>
<p>Der Datei-Header aus dem Beispiel im nicht normativen Anhang der BDT-3.0-Beschreibung:</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Länge</th><th scope="col">Feldkennung</th><th scope="col">Inhalt</th><th scope="col">Bedeutung</th></tr></thead>
<tbody>
<tr><td>013</td><td>8000</td><td>0020</td><td>Satzart 0020 Datei-Header</td></tr>
<tr><td>014</td><td>9806</td><td>BT001</td><td>interne Kennung der ersten Betriebsstätte</td></tr>
<tr><td>014</td><td>9806</td><td>BT002</td><td>interne Kennung der zweiten Betriebsstätte</td></tr>
<tr><td>010</td><td>0010</td><td>1</td><td>Anwendungsfall 1: Gesamtbestand</td></tr>
<tr><td>025</td><td>9603</td><td>0101201231122012</td><td>Zeitraum 01.01.2012 bis 31.12.2012</td></tr>
<tr><td>010</td><td>8202</td><td>6</td><td>Satzende: 6 Felder im Satz</td></tr>
</tbody>
</table></div>
<p>${src("bdt3", "Kap. 8.1")}</p>
<p>Die Feldkennungen sind in der xDT-Familie grundsätzlich gleich: 3101 ist auch in LDT und GDT der Nachname. ${src("bdt3", "Kap. 2")} Wie die Formate zusammenhängen, zeigt der <a href="${href("xdt-gdt-ldt-bdt/")}">Überblick über die xDT-Schnittstelle</a>; einzelne Kennungen finden Sie in der Referenz <a href="${href("feldkennungen/")}">Feldkennungen</a>.</p>

<h2>Grenzen von BDT</h2>
<ul>
<li><strong>Entwurfsstatus:</strong> BDT 3.0 liegt nur als Version 0.96 mit dem Status „Freigabe für Testimplementierungen“ vor. Der QMS schreibt selbst, sie werde „noch nicht zur Anwendung empfohlen“. ${src("bdt3", "S. 2")}</li>
<li><strong>Ältere Spezifikation nicht mehr verfügbar:</strong> Die Originalspezifikation BDT 02/94 ist nicht mehr öffentlich abrufbar, BDT 3.0 nur noch als archivierte Kopie. Felder, die nur in BDT 02/94 definiert sind, zeigt der Viewer deshalb als „unbekannt“ an. ${src("tool", "Abschnitte Spezifikationen und Lücken")}</li>
<li><strong>Externe Dateien:</strong> Referenzierte Dateien in Fremdformaten stehen nicht in der BDT-Datei selbst. Sie werden separat im Originalformat und optional zusätzlich als PDF/A-1b übermittelt. Prüfen Sie beim Wechsel, ob diese Dateien vollständig mitkommen. ${src("bdt3", "Kap. 2 und 3.6.1")}</li>
<li><strong>Keine Abrechnungsprüfung:</strong> Regeln zur Plausibilitätsprüfung von Abrechnungen sind nicht Bestandteil der BDT-Definition. Abrechnungsnotizen in anderen Formaten als xDT werden nur als Referenz auf externe Dateien übertragen. ${src("bdt3", "Kap. 3.6.1")}</li>
</ul>
<h3>Einschätzung aus einem QMS-Bericht (Juli 2026)</h3>
<p>Ein Bericht des QMS vom Juli 2026 gibt einen Vortrag auf der QMS-Mitgliederversammlung am 11. Juni 2026 wieder. Darin wird die BDT-Schnittstelle der frühen 1990er Jahre als „technisch schlank, effizient, aber funktional begrenzt“ beschrieben. Weiter heißt es dort, mit § 371 SGB V habe 2020 die Archiv- und Wechselschnittstelle (AWST) auf FHIR-Basis kommen sollen; sie sei 2023 offiziell für gescheitert erklärt worden, 2025 sei die WeSt-Spezifikation des KIG gefolgt. Das ist die Darstellung des Berichts, keine eigene Bewertung dieser Seite. ${src("qmsWechsel")}</p>
</div>
${faqHtml(faq)}
${ctaHtml("BDT-Export prüfen", "Öffnen Sie einen BDT-Export im Viewer und sehen Sie Sätze, Felder und Patienten, bevor Sie ihn ins neue System übernehmen. Ohne Upload.")}
${relatedHtml(["bdt-datei-oeffnen/", "was-ist-ldt/", "xdt-gdt-ldt-bdt/", "feldkennungen/"])}
</main>`;

export default {
  path,
  title,
  description,
  ogTitle: "Was ist BDT? Der Behandlungsdatenträger einfach erklärt",
  ogDescription: "BDT-Export beim Wechsel der Praxissoftware: Geschichte, Anwendungsfälle in Feld 0010, klassischer Aufbau und BDT 3.0 mit echten Beispielzeilen sowie die Grenzen des Formats.",
  ogType: "article",
  jsonld: [articleLd({ headline: h1, description, path }), faqLd(faq), breadcrumbLd(crumbs)],
  body,
  minInternalLinks: 3,
  llms: "Was BDT (Behandlungsdatenträger, Behandlungsdatentransfer) ist: Herkunft beim ZI, Weiterentwicklung durch den QMS (BDT 3.0 Entwurf 0.96), Anwendungsfälle in Feld 0010, klassischer Aufbau mit 8100 und BDT 3.0 mit 8202 sowie Grenzen beim Praxissoftware-Wechsel.",
};
