import pdfplumber, json, re
res = {}; last=None
with pdfplumber.open('specs/bdt3_0_96.pdf') as pdf:
    for p in range(59, 113):
        page = pdf.pages[p-1]
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
        # group into lines
        lines = {}
        for w in body:
            key = round(w['top']/2.5)
            lines.setdefault(key, []).append(w)
        for key in sorted(lines):
            ws = sorted(lines[key], key=lambda w: w['x0'])
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
json.dump(res, open('bdt3_fields.json','w'), ensure_ascii=False, indent=1)
print(len(res))
for k in ['0058','3000','3101','3103','3110','6200','8000','8100','8202','9103','9106','9218','8410','8420','9903','9904','0010']:
    if k in res: print(k, json.dumps(res[k], ensure_ascii=False)[:300])
