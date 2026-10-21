const lb=document.getElementById('lb'),big=lb.querySelector('img');
document.addEventListener('click',e=>{const f=e.target.closest('.fig');
  if(f){const i=f.querySelector('img');big.src=i.dataset.full||i.src;big.alt=i.alt;lb.showModal()}
  else if(e.target===lb||e.target===big)lb.close()});
// Pilih jawaban: klik pilihan, benar jadi hijau, salah jadi merah dan kunci ditandai hijau. Sekali pilih per soal.
const pick=li=>{const ol=li.parentNode;if(ol.dataset.done)return;ol.dataset.done=1;
  const k=ol.children[ol.dataset.k];li.classList.add(li===k?'ok':'no');k.classList.add('ok')};
// Reset: kosongkan warna dan tutup pembahasan, per soal (.rst), per tahun, atau semua (.rstall).
const reset=ol=>{delete ol.dataset.done;for(const l of ol.children)l.classList.remove('ok','no');ol.closest('.q').querySelector('details').open=false};
// .rstall di dalam section tahun (id y2023 dst.) hanya mereset tahun itu; di luar itu mereset seluruh bank soal.
// Pembahasan yang dibuka tanpa menjawab (termasuk soal tanpa pilihan) ikut ditutup.
const resetAll=b=>{const s=b.closest('[id^="y2"]')||document,ol=s.querySelectorAll('ol[data-done]'),d=s.querySelectorAll('.q details[open]');
  if(!ol.length&&!d.length||ol.length>1&&!confirm(`Reset ${ol.length} jawaban?`))return;
  ol.forEach(reset);d.forEach(x=>x.open=false)};
document.addEventListener('click',e=>{const t=e.target,li=t.closest('ol[data-k]>li');
  if(li)pick(li);
  else if(t.matches('.rst'))reset(t.previousElementSibling);
  else if(t.matches('.rstall'))resetAll(t);
  else if(t.matches('.kunci'))kunci(t);
  else return;
  skor()});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('ol[data-k]>li')){e.preventDefault();pick(e.target);skor()}});
// Skor: global (di #soal) dan per tahun (disisipkan di bawah tombol reset tahun). Benar = soal dijawab tanpa pilihan merah.
document.querySelectorAll('[id^="y2"]>.rstall').forEach(b=>b.insertAdjacentHTML('afterend','<p class="skor" aria-live="polite"></p>'));
const skor=()=>document.querySelectorAll('.skor').forEach(p=>{const s=p.closest('[id^="y2"]')||document,
  n=s.querySelectorAll('ol[data-done]').length,x=s.querySelectorAll('ol[data-done]>li.no').length;
  p.textContent=n?`Dijawab ${n} · Benar ${n-x} · Salah ${x} · Nilai ${Math.round((n-x)/n*100)}%`:'Belum ada soal yang dijawab.'});
// Buka/tutup semua kunci: tandai pilihan benar (li.key) sekali, lalu tampilkan lewat kelas .lihat-kunci di body.
const kunci=b=>{if(!document.querySelector('li.key'))document.querySelectorAll('ol[data-k]').forEach(o=>o.children[o.dataset.k]?.classList.add('key'));
  b.textContent=document.body.classList.toggle('lihat-kunci')?'Sembunyikan jawaban benar':'Buka semua jawaban benar'};
addEventListener('load',skor);

// Pemutar musik: pilih lagu lewat <select>, lanjut otomatis ke lagu berikutnya.
const au=document.getElementById('au'),trk=document.getElementById('trk');
const load=play=>{au.src=trk.value;if(play)au.play().catch(()=>{})};
trk.addEventListener('change',()=>load(true));
au.addEventListener('ended',()=>{trk.selectedIndex=(trk.selectedIndex+1)%trk.length;load(true)});
load(false);

// Bank soal: tiap berkas soal/<tahun>.js memanggil soal(id, html) untuk mengisi section-nya.
window.soal=(id,html)=>document.getElementById(id).insertAdjacentHTML('beforeend',html);
// Bagian di luar layar dirender belakangan (content-visibility), jadi tingginya baru perkiraan.
// Setelah lompat ke #anchor, betulkan posisi sampai tidak bergeser lagi.
const fixJump=()=>{const t=location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!t)return;
  const h=document.documentElement,sb=h.style.scrollBehavior;h.style.scrollBehavior='auto';let n=0,ok=0,last;
  const go=()=>{t.scrollIntoView();const y=t.getBoundingClientRect().top;ok=y===last?ok+1:0;last=y;if(ok<3&&++n<30)requestAnimationFrame(go);else h.style.scrollBehavior=sb};go()};
addEventListener('hashchange',fixJump);
addEventListener('load',fixJump);
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash)requestAnimationFrame(fixJump)});
// Saring topik: sembunyikan soal yang tidak memuat label kuliah terpilih (label .kt dipasang di h3 tiap soal).
document.getElementById('kf').addEventListener('change',e=>{const k=e.target.value;
  for(const q of document.querySelectorAll('#soal~section .q'))q.hidden=!!k&&!q.querySelector(`a.kt[href="#${k}"]`)});
// Bacaan soal (ElevenLabs, MP3 di audio/): satu pemutar untuk semua tombol .tts; musik dijeda selama bacaan.
const vo=new Audio();let vb=null;
const vset=(b,on)=>{if(b){b.textContent=on?'❚❚ Jeda':'▶ Dengarkan';b.setAttribute('aria-pressed',on)}};
vo.onended=vo.onpause=()=>vset(vb,false);vo.onplay=()=>vset(vb,true);
document.addEventListener('click',e=>{const b=e.target.closest('.tts');if(!b)return;
  if(b===vb&&!vo.paused){vo.pause();return}
  if(b!==vb){vset(vb,false);vb=b;vo.src=b.dataset.a}
  au.pause();vo.play().catch(()=>{b.textContent='Audio gagal dimuat'})});
au.addEventListener('play',()=>vo.pause());
// Cari di materi kuliah K1-K10: indeks paragraf, butir, baris tabel, dan kutipan recap (dibuat sekali saat pertama dipakai).
const cari=document.getElementById('cari'),q=document.getElementById('q'),hasil=cari.querySelector('.cari-hasil'),info=cari.querySelector('.cari-info'),cb=document.querySelector('.cari-btn');
const INFO='Ketik minimal 2 huruf. Mencari di isi kuliah K1-K10; semua kata harus ada.';
let idxM=null;
const norm=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const teksSendiri=el=>[...el.childNodes].filter(n=>!/^(UL|OL)$/.test(n.nodeName)).map(n=>n.textContent).join('').replace(/\s+/g,' ').trim();
const buatIdx=()=>{idxM=[];document.querySelectorAll('.lec').forEach(sec=>{const h2=sec.querySelector('h2[id^="k"]');if(!h2)return;
  const kul=h2.querySelector('.kn').textContent,judul=h2.textContent.replace(kul,'').trim();let sub='';
  sec.querySelectorAll('h3,p,li,tr,blockquote').forEach(el=>{if(el.tagName==='H3'){sub=el.textContent.trim();return}
    if(el.closest('blockquote')&&el.tagName!=='BLOCKQUOTE')return;
    const t=el.tagName==='TR'?[...el.cells].map(c=>c.textContent.trim()).filter(Boolean).join(' · '):teksSendiri(el);
    if(t.length>2)idxM.push({el,kul,judul,sub,t,n:norm(t)})})})};
const potong=(x,w)=>{const i=Math.max(0,x.n.indexOf(w)-60);return (i?'…':'')+x.t.slice(i,i+190)+(x.t.length>i+190?'…':'')};
const cariKata=()=>{const kata=norm(q.value).split(/\s+/).filter(w=>w.length>1);hasil.replaceChildren();
  if(!kata.length){info.textContent=INFO;return}
  idxM||buatIdx();const cocok=idxM.filter(x=>kata.every(w=>x.n.includes(w)));
  info.textContent=cocok.length?`${cocok.length} bagian materi ditemukan${cocok.length>50?', 50 pertama ditampilkan':''}.`:'Tidak ditemukan di materi K1-K10. Coba kata lain.';
  cocok.slice(0,50).forEach(x=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';
    b.innerHTML='<b></b><span></span>';b.children[0].textContent=`${x.kul} · ${x.judul}${x.sub?' › '+x.sub:''}`;b.children[1].textContent=potong(x,kata[0]);
    b.onclick=()=>lompat(x.el);li.append(b);hasil.append(li)})};
// Lompat: bagian di luar layar dirender belakangan, jadi posisinya dibetulkan beberapa frame sampai diam, lalu disorot.
const lompat=el=>{bukaCari(false);const h=document.documentElement,sb=h.style.scrollBehavior;h.style.scrollBehavior='auto';let n=0,ok=0,last;
  const go=()=>{el.scrollIntoView({block:'center'});const y=el.getBoundingClientRect().top;ok=y===last?ok+1:0;last=y;
    if(ok<3&&++n<30)requestAnimationFrame(go);else{h.style.scrollBehavior=sb;el.classList.remove('kena');void el.offsetWidth;el.classList.add('kena');setTimeout(()=>el.classList.remove('kena'),2700)}};go()};
q.addEventListener('input',cariKata);
const bukaCari=on=>{if(matchMedia('(min-width:88rem)').matches)on=true;document.body.classList.toggle('cari-buka',on);cb.setAttribute('aria-expanded',on);if(on&&document.activeElement!==q&&!matchMedia('(min-width:88rem)').matches)q.focus()};
cb.addEventListener('click',()=>bukaCari(true));
cari.querySelector('.cari-x').addEventListener('click',()=>bukaCari(false));
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('cari-buka'))bukaCari(false)});
