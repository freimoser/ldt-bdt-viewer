import pdfplumber, json, re, sys
def clean(s):
    s = (s or '').replace('­','')
    s = re.sub(r'(?<=[a-zäöüß])-\n(?=[a-zäöüß])', '', s)
    return re.sub(r'\s*\n\s*', ' ', s).strip()
def extract(path, pages):
    out = {}; last = None
    with pdfplumber.open(path) as pdf:
        for p in pages:
            for t in pdf.pages[p-1].extract_tables():
                for row in t:
                    if not row: continue
                    cells = [clean(c) for c in row]
                    fk = cells[0]
                    if re.fullmatch(r'\d{4}', fk):
                        if fk in out: last = None; continue
                        out[fk] = {'cells': cells, 'page': p}; last = fk
                    elif fk in ('FK',) or cells[1:2] == ['Feldbezeichnung']:
                        continue
                    elif last and fk == '' and any(cells[1:]):
                        prev = out[last]['cells']
                        for i, c in enumerate(cells):
                            if c and i < len(prev): prev[i] = (prev[i] + ' ' + c).strip()
    return out
which = sys.argv[1]
res = {}
if which == 'ldt3':
    for fk, v in extract('specs/ldt3_2_20.pdf', range(38, 74)).items():
        c = v['cells'] + ['']*6
        res[fk] = {'name': c[1], 'len': c[2], 'type': c[3], 'rules': c[4], 'desc': c[5], 'page': v['page']}
else:
    for fk, v in extract('specs/kbv_ldt2.pdf', range(47, 58)).items():
        c = v['cells'] + ['']*7
        res[fk] = {'name': c[1], 'len': c[2], 'type': c[3], 'rules': c[4], 'values': c[5], 'example': c[6], 'page': v['page']}
json.dump(res, open(f'{which}_fields.json','w'), ensure_ascii=False, indent=1)
print(which, len(res))
for k in ['8410','8420','8421','8422','8460','8461','8462','8480','9106','9212','8401','8418','3110']:
    if k in res: print(k, json.dumps(res[k], ensure_ascii=False)[:400])
