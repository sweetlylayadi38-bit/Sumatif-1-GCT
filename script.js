const lb=document.getElementById('lb'),big=lb.querySelector('img');
document.addEventListener('click',e=>{const f=e.target.closest('.fig');
  if(f){const i=f.querySelector('img');big.src=i.dataset.full||i.src;big.alt=i.alt;lb.showModal()}
  else if(e.target===lb||e.target===big)lb.close()});
// Pilih jawaban: klik pilihan, benar jadi hijau, salah jadi merah dan kunci ditandai hijau. Sekali pilih per soal.
const pick=li=>{const ol=li.parentNode;if(ol.dataset.done)return;ol.dataset.done=1;
  const k=ol.children[ol.dataset.k];li.classList.add(li===k?'ok':'no');k.classList.add('ok')};
// Reset: kosongkan warna dan tutup pembahasan, per soal (.rst), per tahun, atau semua (.rstall).
const reset=ol=>{delete ol.dataset.done;for(const l of ol.children)l.className='';ol.closest('.q').querySelector('details').open=false};
// .rstall di dalam section tahun (id y2023 dst.) hanya mereset tahun itu; di luar itu mereset seluruh bank soal.
// Pembahasan yang dibuka tanpa menjawab (termasuk soal tanpa pilihan) ikut ditutup.
const resetAll=b=>{const s=b.closest('[id^="y2"]')||document,ol=s.querySelectorAll('ol[data-done]'),d=s.querySelectorAll('.q details[open]');
  if(!ol.length&&!d.length||ol.length>1&&!confirm(`Reset ${ol.length} jawaban?`))return;
  ol.forEach(reset);d.forEach(x=>x.open=false)};
document.addEventListener('click',e=>{const t=e.target,li=t.closest('ol[data-k]>li');
  if(li)pick(li);
  else if(t.matches('.rst'))reset(t.previousElementSibling);
  else if(t.matches('.rstall'))resetAll(t)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('ol[data-k]>li')){e.preventDefault();pick(e.target)}});

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
