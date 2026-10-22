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
// Buka/tutup semua kunci: tandai pilihan benar (li.key) sekali, tampilkan lewat kelas .lihat-kunci di body,
// sekaligus buka (atau tutup) semua pembahasan soal.
const kunci=b=>{if(!document.querySelector('li.key'))document.querySelectorAll('ol[data-k]').forEach(o=>o.children[o.dataset.k]?.classList.add('key'));
  const on=document.body.classList.toggle('lihat-kunci');document.querySelectorAll('.q details').forEach(d=>d.open=on);
  b.textContent=on?'Tutup semua jawaban dan pembahasan':'Buka semua jawaban benar dan pembahasan'};
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
// Claude AI (pengganti Cari): tulis pertanyaan, pilih Sonnet 5.5 atau Opus 5.5, lalu kirim ke claude.ai.
// Teks pertanyaan memuat nama model dan disalin ke clipboard; modelnya sendiri dipilih di claude.ai.
const cari=document.getElementById('cari'),q=document.getElementById('q'),info=cari.querySelector('.cari-info'),cb=document.querySelector('.cari-btn');
const INFO='Tulis pertanyaan tentang materi K1-K10 atau soal Sumatif 1, pilih model, lalu kirim.';
const bukaCari=on=>{if(matchMedia('(min-width:88rem)').matches)on=true;document.body.classList.toggle('cari-buka',on);cb.setAttribute('aria-expanded',on);if(on&&document.activeElement!==q&&!matchMedia('(min-width:88rem)').matches)q.focus()};
const kirim=async()=>{const t=q.value.trim(),m=cari.querySelector('input[name=mdl]:checked').value;
  if(t.length<2){info.textContent='Tulis pertanyaannya dulu.';q.focus();return}
  const p=`Saya memilih model Claude ${m}.\n\nKonteks: Recap Modul Ginjal dan Cairan Tubuh (kuliah K1-K10) dan bank soal Sumatif 1 GCT 2017-2023.\n\nPertanyaan: ${t}\n\nJawab dalam bahasa Indonesia.`;
  let ok=false;try{await navigator.clipboard.writeText(p);ok=true}catch{}
  window.open('https://claude.ai/new?q='+encodeURIComponent(p.length>1800?p.slice(0,1800)+'…':p),'_blank','noopener');
  info.textContent=ok?`Teks disalin. Di claude.ai pilih model ${m}.`:`Di claude.ai pilih model ${m}.`};
cari.querySelector('.cari-kirim').addEventListener('click',kirim);
q.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();kirim()}});
cb.addEventListener('click',()=>bukaCari(true));
cari.querySelector('.cari-x').addEventListener('click',()=>bukaCari(false));
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('cari-buka'))bukaCari(false)});
// Rangkuman K1-K10: buka/tutup semua kuliah; tautan ke #rk-kN langsung membuka kuliah itu.
const rks=[...document.querySelectorAll('#ringkas>details')],rkx=document.querySelector('.rkx');
rkx.addEventListener('click',()=>{const on=rks.some(d=>!d.open);rks.forEach(d=>d.open=on);rkx.textContent=on?'Tutup semua':'Buka semua'});
const bukaRk=()=>{const d=document.getElementById(location.hash.slice(1));if(d&&rks.includes(d))d.open=true};
addEventListener('hashchange',bukaRk);bukaRk();
