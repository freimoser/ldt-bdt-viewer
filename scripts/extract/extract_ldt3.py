import pdfplumber, json, re
def clean(s):
    s=(s or '').replace('­','')
    s=re.sub(r'(?<=[a-zäöüß])-\n(?=[a-zäöüß])','',s)
    s=re.sub(r'_\s*\n\s*','_',s)
    return re.sub(r'\s*\n\s*',' ',s).strip()
LEN=re.compile(r'^(≤\s*\d+|\d+(\s*[-–,]\s*\d+)*|var)$'); TYPE={'num','alnum','date','f','d','a','n'}
RULES=re.compile(r'^([EFK]\d{3}\s*)+$')
res={}; last=None
with pdfplumber.open('specs/ldt3_2_20.pdf') as pdf:
    for p in range(38,74):
        for t in pdf.pages[p-1].extract_tables():
            for row in t:
                cells=[clean(c) for c in row]
                idx=next((i for i,c in enumerate(cells[:3]) if re.fullmatch(r'\d{4}',c)),None)
                if idx is None:
                    if last and any(cells):
                        e=res[last]
                        for c in cells:
                            if not c: continue
                            if RULES.match(c): e['rules']=(e['rules']+' '+c).strip()
                            elif len(c)>25 or not e['name']: e['desc']=(e['desc']+' '+c).strip()
                            else: e['name']=(e['name']+' '+c).strip() if len(e['name'])<40 and not e['len'] else e['name']; 
                    continue
                fk=cells[idx]; rest=[c for c in cells[idx+1:] if c]
                e={'name':'','len':'','type':'','rules':'','desc':'','page':p}
                for c in rest:
                    if not e['len'] and LEN.match(c) and e['name']: e['len']=c
                    elif not e['type'] and c in TYPE and e['name']: e['type']=c
                    elif RULES.match(c): e['rules']=c
                    elif not e['name']: e['name']=c
                    else: e['desc']=(e['desc']+' '+c).strip()
                if fk in res: last=None; continue
                res[fk]=e; last=fk
json.dump(res,open('ldt3_fields.json','w'),ensure_ascii=False,indent=1)
print(len(res))
for k in ['0001','8000','8001','8002','8003','8101','8107','8237','8167','8147','8218','8310','8311','8142','8160','8135','8110','9300','3564','8420','8422','4121','8401']:
    v=res.get(k); print(k, json.dumps(v,ensure_ascii=False)[:230] if v else None)
