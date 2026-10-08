import pdfplumber, json, re
def clean(s):
    s=(s or '').replace('­','')
    return s.strip()
rules={}; last=None
with pdfplumber.open('specs/ldt3_2_20.pdf') as pdf:
    for p in range(74, 118):
        for t in pdf.pages[p-1].extract_tables():
            for row in t:
                cells=[clean(c) for c in row]+['']*6
                rid=cells[0]
                if re.fullmatch(r'[EFK]\d{3}', rid):
                    rules[rid]={'cat':cells[1],'status':cells[2],'check':cells[3],'expl':cells[4],'page':p}; last=rid
                elif last and rid=='' and any(cells[1:]):
                    r=rules[last]
                    if cells[3]: r['check']+='\n'+cells[3]
                    if cells[4]: r['expl']+='\n'+cells[4]
json.dump(rules, open('ldt3_rules.json','w'), ensure_ascii=False, indent=1)
print(len(rules))
for k in ['E001','E005','E006','E007','E019','E157','F001','F003','K063','K083']:
    if k in rules: print(k, json.dumps(rules[k], ensure_ascii=False)[:600])
