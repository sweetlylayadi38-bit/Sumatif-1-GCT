"""Ubah teks soal menjadi bentuk ucapan bahasa Indonesia yang wajar untuk TTS: ion, rumus, satuan, singkatan, simbol, angka."""
import re

SATU = 'nol satu dua tiga empat lima enam tujuh delapan sembilan sepuluh sebelas'.split()
def kata(n):
    if n < 12: return SATU[n]
    if n < 20: return SATU[n - 10] + ' belas'
    if n < 100: return SATU[n // 10] + ' puluh' + (' ' + SATU[n % 10] if n % 10 else '')
    if n < 200: return 'seratus' + (' ' + kata(n - 100) if n > 100 else '')
    if n < 1000: return SATU[n // 100] + ' ratus' + (' ' + kata(n % 100) if n % 100 else '')
    if n < 2000: return 'seribu' + (' ' + kata(n - 1000) if n > 1000 else '')
    if n < 10**6: return kata(n // 1000) + ' ribu' + (' ' + kata(n % 1000) if n % 1000 else '')
    if n < 10**9: return kata(n // 10**6) + ' juta' + (' ' + kata(n % 10**6) if n % 10**6 else '')
    return ' '.join(SATU[int(d)] for d in str(n))

def angka(m):
    bulat, _, des = m.group(0).partition(',')
    s = kata(int(bulat.replace('.', '')))
    return s + (' koma ' + ' '.join(SATU[int(d)] for d in des) if des else '')

HURUF = dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'a be ce de e ef ge ha i je ka el em en o pe ki er es te u ve we eks ye zet'.split()))
def eja(s): return '-'.join(HURUF[c] for c in s)

KIMIA = [  # urutan penting: yang panjang dulu
    (r'CH3COONa', 'natrium asetat'), (r'CH3', 'metil'), (r'HCl\b', 'asam klorida'), (r'KCl\b', 'kalium klorida'), (r'HSO4-?', 'bisulfat'), (r'-?NH2\b', 'gugus amino'),
    (r'\bENaC\b', 'kanal natrium epitel'), (r'\bAQP(\d)', r'akuaporin \1'), (r'\bpKa\b', 'pe-ka-a'), (r'\bpH\b', 'pe-ha'), (r'\bHb\b', 'hemoglobin'),
    (r'/uL\b|/µL\b', ' per mikroliter'), (r'(?<=\d) ?gram/kilogram', ' gram per kilogram'),
    (r'Na\+-K\+-ATPase', 'pompa natrium kalium'), (r'Na\+-H\+', 'penukar natrium hidrogen'), (r'Na\+-glukosa', 'natrium glukosa'),
    (r'\[HCO3-?\]', 'kadar bikarbonat'), (r'\[K\+\]', 'kadar kalium'), (r'\[H\+\]', 'kadar ion hidrogen'), (r'\[Na\+\]', 'kadar natrium'),
    (r'H3O\+', 'ion hidronium'), (r'HNO3', 'asam nitrat'), (r'NO3-', 'ion nitrat'), (r'NO3', 'nitrat'), (r'H2CO3', 'asam karbonat'),
    (r'HCO3-?', 'bikarbonat'), (r'NH4\+?', 'amonium'), (r'-?NH3\+', 'gugus amino'), (r'NH3', 'amonia'), (r'-?COOH', 'gugus karboksil'), (r'-?COO-', 'gugus karboksilat'),
    (r'H2PO4-?', 'dihidrogen fosfat'), (r'HPO4(?:2-|=)?', 'hidrogen fosfat'), (r'H2SO4', 'asam sulfat'), (r'H2O', 'air'),
    (r'\b[pP]CO2\b', 'pe-ce-o dua'), (r'\b[pP]O2\b', 'pe-o dua'), (r'\bCO2\b', 'ce-o dua'), (r'\bO2\b', 'oksigen'),
    (r'\bCa2\+|\bCa\+\+', 'kalsium'), (r'\bMg2\+', 'magnesium'), (r'\bNa\+', 'natrium'), (r'\bK\+', 'kalium'), (r'\bH\+', 'ion hidrogen'),
    (r'\bCl-', 'klorida'), (r'\bOH-', 'hidroksida'), (r'\bNaCl\b', 'natrium klorida'), (r'\bNaHCO3\b', 'natrium bikarbonat'),
]
LATIN = [
    (r'\bNn\.|\bnn\.', 'nervi'), (r'\b[Nn]\.(?= [a-z])', 'nervus'), (r'\bMm\.', 'musculi'), (r'\b[Mm]\.(?= [a-z])', 'musculus'),
    (r'\ba\.(?= [a-z])', 'arteri'), (r'\b[vV]\.(?= [a-z])', 'vena'), (r'\bLnn?\.', 'limfonodus'), (r'\bspp\.', 'spesies'),
    (r'\bE\. coli', 'E koli'), (r'\bS\. (?=aureus|saprophyticus|epidermidis)', 'Staphylococcus '), (r'\bS\. (?=haematobium|mansoni|japonicum)', 'Schistosoma '),
    (r'\bS\. (?=pyogenes|agalactiae)', 'Streptococcus '), (r'\bP\. (?=falciparum|vivax|malariae|ovale|knowlesi)', 'Plasmodium '),
    (r'\bP\. (?=mirabilis)', 'Proteus '), (r'\bP\. (?=aeruginosa)', 'Pseudomonas '), (r'\bK\. (?=pneumoniae)', 'Klebsiella '),
    (r'\bW\. (?=bancrofti)', 'Wuchereria '), (r'\bB\. (?=malayi|timori)', 'Brugia '), (r'\bT\. (?=vaginalis)', 'Trichomonas '),
    (r'\bno\.(?= ?\d)', 'nomor '), (r'\bdll\.', 'dan lain-lain'), (r'\bdsb\.', 'dan sebagainya'), (r'\bth\.', 'tahun'), (r'\bkgBB\b', 'kilogram berat badan'),
]
SATUAN = [
    (r'mEq/L', 'mili ekuivalen per liter'), (r'mmol/L', 'milimol per liter'), (r'mg/dL', 'miligram per desiliter'), (r'g/dL', 'gram per desiliter'),
    (r'mOsm/kg', 'miliosmol per kilogram'), (r'\bmEq\b', 'mili ekuivalen'), (r'mOsm/L', 'miliosmol per liter'), (r'mOsm', 'miliosmol'), (r'mL/menit', 'mililiter per menit'),
    (r'mmHg', 'em-em-ha-ge'), (r'/mm3', ' per milimeter kubik'), (r'/LPB', ' per lapang pandang besar'), (r'/LPK', ' per lapang pandang kecil'),
    (r'x/menit', ' kali per menit'), (r'/menit', ' per menit'), (r'/jam', ' per jam'), (r'/hari', ' per hari'), (r'CFU/mL', 'koloni per mililiter'),
    (r'(?<=\d) ?mL\b', ' mililiter'), (r'(?<=\d) ?L\b', ' liter'), (r'(?<=\d) ?mg\b', ' miligram'), (r'(?<=\d) ?kg\b', ' kilogram'), (r'(?<=\d) ?g\b', ' gram'),
    (r'(?<=\d) ?cm\b', ' sentimeter'), (r'(?<=\d) ?mm\b', ' milimeter'), (r'(?<=\d) ?µm\b', ' mikrometer'), (r'(?<=\d) ?nm\b', ' nanometer'),
    (r'(?<=\d) ?°C\b|(?<=\d) C\b', ' derajat Celsius'), (r'(?<=\d) ?%', ' persen'), (r'(?<=\d) M\b', ' molar'),
]
KATA = {'JEDA', 'TIDAK', 'BENAR', 'SALAH', 'BAB', 'GLUT', 'RSCM'}   # dibaca biasa, bukan dieja

BUKU = r'Guyton|Strasinger|Snell|Tietz|Henry|Sherwood|Ganong|Robbins|Harrison|Junqueira|Moore|Netter|Kumar|Brenner|Flores-Mireles|Konsensus|IDAI|Kasus no|Lanjutan kasus|Data sama|Pertanyaan tidak tercatat|Pokoknya'
def ucap(t):
    t = re.sub(r'\s*\((?:[^()]*?(?:' + BUKU + r'))[^()]*\)', '', t)                    # rujukan buku / catatan berkas
    t = re.sub(r'[^.]*\b(?:Sejalan dengan soal|Sama dengan no|Lihat versi|Lihat no)[^.]*\.(?:\s*\d+\))?', '', t)   # rujukan silang antarsoal
    t = re.sub(r'\b(TIDAK|KECUALI|BUKAN|SALAH|BENAR|PALING)\b', lambda m: m.group(1).lower(), t)  # kapital penekanan, jangan diteriakkan
    for p, r in KIMIA + LATIN + SATUAN: t = re.sub(p, r, t)
    t = re.sub(r'(\d+)/(\d+)(?= em)', r'\1 per \2', t)                                   # tekanan darah 140/90
    t = re.sub(r'(?<![\w+])\+\+\+\+|\(\+\+\+\+\)', ' positif empat', t)
    t = re.sub(r'(?<![\w+])\+\+\+|\(\+\+\+\)', ' positif tiga', t)
    t = re.sub(r'(?<![\w+])\+\+(?!\w)', ' positif dua', t)
    t = re.sub(r'\(?\+(\d)\)?|\b(\d)\+', lambda m: ' positif ' + (m.group(1) or m.group(2)), t)  # urinalisis +2 / 2+
    t = re.sub(r'\bII\b', 'dua', t); t = re.sub(r'\bIII\b', 'tiga', t)
    t = re.sub(r'\b([TLSC])(\d{1,2})\b', lambda m: HURUF[m.group(1)] + ' ' + m.group(2), t)     # segmen T10, L1, S2
    t = re.sub(r'(?<=\d) - (?=\d)| - (?=P\b)|(\bP \w+) - ', lambda m: (m.group(1) or '') + ' dikurangi ', t)                          # rumus: 50 - 12 - 30
    t = re.sub(r' = (?=[\d(])|(?<=\d) = ', ' sama dengan ', t)
    t = re.sub(r'(\d)-(?=[\d]|(?:te|el|es|ce) \d)', r'\1 sampai ', t)                        # rentang 2-3, T10-L1
    t = re.sub(r'\b([A-Z]{2,6})(\d+)\b', lambda m: eja(m.group(1)) + ' ' + m.group(2), t)                    # SGLT2, NKCC2
    t = re.sub(r'\b[A-Z]{2,6}\b', lambda m: (m.group(0) if m.group(0)=='JEDA' else m.group(0).capitalize()) if m.group(0) in KATA else eja(m.group(0)), t)
    t = (t.replace('->', ' menjadi ').replace('→', ' menjadi ').replace('≥', ' minimal ').replace('>=', ' minimal ')
          .replace('≤', ' maksimal ').replace('<=', ' maksimal ').replace(' > ', ' lebih dari ').replace(' < ', ' kurang dari ')
          .replace('>', 'lebih dari ').replace('<', 'kurang dari ').replace(' = ', ', artinya ').replace(' x ', ' kali ').replace(' + ', ' ditambah '))
    t = re.sub(r'\d+(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?', angka, t)
    t = re.sub(r'\s*\(\s*', ' — ', t); t = re.sub(r'\s*\)', ' —', t)                    # isi kurung dibaca sebagai sisipan
    t = re.sub(r'—\s*([,.;:?!])', r'\1', t)
    t = re.sub(r'(?<=\w)/(?=\w)', ' atau ', t).replace(' +,', ' positif,')
    t = re.sub(r'[\[\]]', '', t)
    t = re.sub(r'\s+([,.;:?!])', r'\1', t); t = re.sub(r',\s*([,.;:?!])', r'\1', t)
    return re.sub(r'\s{2,}', ' ', t).strip()
