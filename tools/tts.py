"""Buat audio bacaan soal + pembahasan Sumatif 1 dengan ElevenLabs, lalu pasang tombol ▶ di soal/<tahun>.js.

Pakai:  ELEVENLABS_API_KEY=... python3 tools/tts.py --voice VOICE_ID [--years 2023,2022] [--dry]
Aman diulang: soal yang audionya sudah ada dilewati, jadi bisa dicicil sesuai sisa kredit.
API key hanya dibaca dari environment, tidak pernah ditulis ke repo.
"""
import argparse, glob, html, json, os, re, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ucap import ucap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, 'audio')
ART = re.compile(r'<article class="q" id="(s\d+-\w+)">(.*?)</article>', re.S)

def plain(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()

def bacaan(art):
    """Teks yang dibacakan, dalam gaya tutor: nomor, soal, pilihan, jawaban, penjelasan.
    Tanpa label, gambar, catatan berkas, dan tautan sumber; simbol dan singkatan diubah ke ucapan (tools/ucap.py)."""
    if '<ol' not in art: return None                      # soal tidak lengkap di berkas
    no = re.search(r'<h3><span>([^<]*)</span>', art).group(1)
    a = re.sub(r'<h3>.*?</h3>|<div class="figs">.*?</div>|<ul class="srcq">.*?</ul>|<p class="note">.*?</p>'
               r'|<button.*?</button>|<summary>.*?</summary>|<img[^>]*>', '', art, flags=re.S)
    soal, _, bahas = a.partition('<details>')
    tanya, _, rest = soal.partition('<ol')
    opsi = [re.sub(r'^[A-H][.)]\s+', '', plain(x)).rstrip('.') for x in re.findall(r'<li[^>]*>(.*?)</li>', rest, re.S)]
    pilihan = ' '.join(f'{"ABCDEFGH"[i]}, {x}.' for i, x in enumerate(opsi))
    m = re.search(r'<p class="ans">(.*?)</p>', bahas, re.S)
    jawab = ''
    if m:
        bahas = bahas.replace(m.group(0), '')
        k = re.match(r'\s*Jawaban:\s*([A-H])\.?\s*(.*)', plain(m.group(1)))
        jawab = f'Jawabannya {k.group(1)}, {k.group(2).rstrip(".")}.' if k else plain(m.group(1))
    sisa = plain(bahas.replace('</p>', '. '))
    sisa = re.sub(r'\s*\((?:PPT )?K\d+[^)]*\)|\bPPT K\d+(?:, slide \d+)?:\s*', '', sisa)   # rujukan slide tidak dibacakan
    t = f'Nomor {no}. {plain(tanya)} Pilihannya. {pilihan} JEDA {jawab} ' + (f'Penjelasannya. {sisa[:1].upper()}{sisa[1:]}' if sisa else '')
    t = t.replace('(-)', ' negatif').replace('(+)', ' positif')
    t = ucap(t).replace(' ... ', ' ... ').replace(', artinya ', ', artinya ')
    t = re.sub(r'([.?!:])(\s*\.)+', r'\1', t)
    return t.replace(' JEDA ', ' <break time="2.0s" /> ')   # waktu berpikir sebelum jawaban (didukung model v2/v2.5)

def semua():
    for f in sorted(glob.glob(os.path.join(ROOT, 'soal', '*.js'))):
        t = open(f, encoding='utf8').read()
        for i, a in ART.findall(json.loads(t[t.index(',') + 1:t.rindex(')')])):
            yield f, i, bacaan(a)

def tts(key, voice, model, qid, text):
    out = os.path.join(AUD, qid + '.mp3')
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_22050_32',
        data=json.dumps({'text': text, 'model_id': model, **({'language_code': 'id'} if 'v2_5' in model else {}),
                         'voice_settings': {'stability': .52, 'similarity_boost': 1.0, 'speed': .98}}).encode(),
        headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    for coba in range(5):
        try:
            with urllib.request.urlopen(req, timeout=180) as r: data = r.read()
            open(out + '.part', 'wb').write(data); os.replace(out + '.part', out); return qid, None
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode(errors='ignore')
            if e.code == 429 or e.code >= 500: time.sleep(5 * (coba + 1)); continue
            return qid, f'{e.code} {msg}'                 # 401/402/422: berhenti, jangan buang kredit
        except Exception as e:
            time.sleep(5); err = str(e)
    return qid, 'gagal setelah 5 kali'

def pasang_tombol():
    """Tambah tombol ▶ di h3 soal yang audionya sudah ada. Idempoten."""
    for f in sorted(glob.glob(os.path.join(ROOT, 'soal', '*.js'))):
        t = open(f, encoding='utf8').read(); i, j = t.index(','), t.rindex(')')
        s = json.loads(t[i + 1:j])
        def add(m):
            qid, art = m.group(1), m.group(0)
            if 'class="tts"' in art or not os.path.exists(os.path.join(AUD, qid + '.mp3')): return art
            return art.replace('</h3>', f'<button type="button" class="tts" data-a="audio/{qid}.mp3" aria-label="Dengarkan soal dan pembahasan">▶ Dengarkan</button></h3>', 1)
        s2 = ART.sub(add, s)
        if s2 != s: open(f, 'w', encoding='utf8').write(t[:i + 1] + json.dumps(s2, ensure_ascii=False) + t[j:])

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice'); ap.add_argument('--model', default='eleven_multilingual_v2')
    ap.add_argument('--years', default=''); ap.add_argument('--dry', action='store_true')
    ap.add_argument('--workers', type=int, default=3)
    o = ap.parse_args()
    todo = [(i, t) for f, i, t in semua() if t and (not o.years or i[1:5] in o.years.split(','))
            and not os.path.exists(os.path.join(AUD, i + '.mp3'))]
    print(f'{len(todo)} soal belum ada audionya, {sum(len(t) for _, t in todo):,} karakter')
    if o.dry:
        print(todo[0][1] if todo else '-'); sys.exit()
    key = os.environ['ELEVENLABS_API_KEY']; os.makedirs(AUD, exist_ok=True)
    with ThreadPoolExecutor(o.workers) as ex:
        for n, (qid, err) in enumerate(ex.map(lambda x: tts(key, o.voice, o.model, *x), todo), 1):
            print(f'[{n}/{len(todo)}] {qid}', err or 'ok', flush=True)
            if err and err[:3] in ('401', '402', '403', '422'): print('Berhenti:', err); ex.shutdown(cancel_futures=True); break
    pasang_tombol()
