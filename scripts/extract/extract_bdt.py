import pdfplumber, json, re
# Der Entwurf V0.96 enthält Änderungsmarkierungen: gestrichene Feldkennungen und Wörter sind durchgestrichen.
# Durchgestrichene Zeichen (dünne waagerechte Linie auf halber Zeichenhöhe) werden verworfen.
def strike_segments(page):
    return [o for o in page.lines + page.rects if abs(o['bottom'] - o['top']) < 1.6 and (o['x1'] - o['x0']) > 2]

def is_struck(ch, segs):
    h = ch['bottom'] - ch['top']; cx = (ch['x0'] + ch['x1']) / 2
    for s in segs:
        y = (s['top'] + s['bottom']) / 2
        if s['x0'] <= cx <= s['x1'] and ch['top'] + 0.3 * h <= y <= ch['bottom'] - 0.2 * h:
            return True
    return False

res = {}; last=None
with pdfplumber.open('specs/bdt3_0_96.pdf') as pdf:
    for p in range(59, 113):
        page = pdf.pages[p-1]
        segs = strike_segments(page)
        page = page.filter(lambda o: o.get('object_type') != 'char' or not is_struck(o, segs))
        words = page.extract_words(keep_blank_chars=False, use_text_flow=False, x_tolerance=1.5)
        # header columns
        hdr = {w['text']: w['x0'] for w in words if w['top'] < 120}
        cols = [('fk', 0), ('name', hdr.get('Feldbezeichnung', 70)-2), ('type', hdr.get('Typ', 170)-2), ('len', hdr.get('Län-', 195)-2),
                ('format', hdr.get('Format', 230)-2), ('values', hdr.get('Wertevorrat', 320)-2), ('desc', hdr.get('Erläuterungen', 400)-2), ('oid', hdr.get('OID', 600)-2)]
        # header bottom: find y of last header line ('p' of schluesseltabellen.as p) -> use words above first FK row
        hb = max([w['bottom'] for w in words if 'schluesseltabellen' in w['text'] or w['text'] in ('is.html',)] + [100])
        hb2 = [w['bottom'] for w in words if w['text']=='p' and abs(w['top']-hb) < 14]
        hb = max([hb]+hb2)
        body = [w for w in words if w['top'] > hb + 1 and not (w['text']=='sen' and w['top'] < hb+20)]
        # Tabellenzeilen an den Zelllinien der FK-Spalte trennen (nicht an Textzeilen: Ersatznummern
        # wie 3130 unter einer gestrichenen 3120 stehen tiefer als der Text derselben Zeile)
        ys = sorted(set(round((o['top'] + o['bottom']) / 2, 1) for o in segs if o['x0'] < 60 and (o['x1'] - o['x0']) > 20))
        bands = [(a, b) for a, b in zip(ys, ys[1:]) if b - a > 3 and b > hb + 1]
        lines = {}
        for w in body:
            mid = (w['top'] + w['bottom']) / 2
            for k, (a, b) in enumerate(bands):
                if a <= mid < b:
                    lines.setdefault(k, []).append(w)
                    break
        for key in sorted(lines):
            ws = sorted(lines[key], key=lambda w: (round(w['top']), w['x0']))
            row = {c: [] for c, _ in cols}
            for w in ws:
                col = 'fk'
                for c, x in cols:
                    if w['x0'] >= x: col = c
                row[col].append(w['text'])
            fk = ' '.join(row['fk'])
            txt = {c: ' '.join(v) for c, v in row.items()}
            if 'Satzbeschreibung, BDT' in ' '.join(txt.values()) or re.match(r'Seite \d+ von', ' '.join(txt.values())): continue
            if re.fullmatch(r'\d{4}', fk):
                res[fk] = {c: txt[c] for c in txt if c != 'fk'}; res[fk]['page']=p; last=fk
            elif last and not fk:
                for c in txt:
                    if c!='fk' and txt[c]:
                        res[last][c] = (res[last][c] + ' ' + txt[c]).strip()
for k,v in res.items():
    for c in v:
        if isinstance(v[c], str): v[c] = re.sub(r'(?<=[a-zäöüß])- (?=[a-zäöüß])', '', v[c])
# Reste gestrichener Wörter, die die Durchstreichung knapp verfehlt (am PDF geprüft, S. 70–72)
ERRATA = {'3109': {'name': 'Hausnummer'}, '3100': {'name': 'Namenszusatz des Patienten'}, '3200': {'name': 'Namenszusatz des Hauptversicherten'}}
for k, fix in ERRATA.items():
    if k in res: res[k].update(fix)
if '3109' in res: res['3109']['desc'] = re.sub(r'\s+\S$', '', res['3109']['desc'])
json.dump(res, open('bdt3_fields.json','w'), ensure_ascii=False, indent=1)
print(len(res))
for k in ['0058','3000','3101','3103','3110','6200','8000','8100','8202','9103','9106','9218','8410','8420','9903','9904','0010']:
    if k in res: print(k, json.dumps(res[k], ensure_ascii=False)[:300])
