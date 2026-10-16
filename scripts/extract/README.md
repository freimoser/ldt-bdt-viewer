# Extraktion der Feldtabellen

Die JSON-Dateien in `data/` wurden mit diesen Skripten aus den Original-PDFs erzeugt (siehe `quellen.md`).

```bash
python3 -m venv venv && ./venv/bin/pip install pdfplumber
mkdir -p specs   # PDFs hier ablegen (nicht im Repository)
./venv/bin/python scripts/extract/extract_ldt.py ldt2      # -> ldt2_fields.json  (KBV LDT 5.12, S. 47–57)
./venv/bin/python scripts/extract/extract_ldt3.py          # -> ldt3_fields.json  (KBV LDT 3.2.20, S. 38–73)
./venv/bin/python scripts/extract/extract_rules.py         # -> ldt3_rules.json   (KBV LDT 3.2.20, S. 74–117)
./venv/bin/python scripts/extract/extract_bdt.py           # -> bdt3_fields.json  (QMS BDT 3.0 V0.96, S. 59–112)
```

Objektkatalog LDT 3.2.20 (Kap. 11, S. 118–187) aus der Textfassung des PDFs (poppler `pdftotext`):

```bash
pdftotext -layout specs/ldt3_2_20.pdf specs/ldt3_2_20.txt
node scripts/extract/extract_ldt3_objects.mjs > data/ldt3-objekte.json   # 50 Objekte mit Feldern, Ebene, Feldart (M/m/K/k) und Seite
```

Der Prüfer nutzt daraus nur die unbedingten Mussfelder (Feldart „M“ direkt im Objekt). Bedingte Mussfelder („m“) hängen an Regeln und werden nicht geprüft.

Erwartete Dateinamen in `specs/`: `kbv_ldt2.pdf`, `ldt3_2_20.pdf`, `bdt3_0_96.pdf`.
