const lb=document.getElementById('lb'),big=lb.querySelector('img');
document.addEventListener('click',e=>{const f=e.target.closest('.fig');
  if(f){const i=f.querySelector('img');big.src=i.dataset.full||i.src;big.alt=i.alt;lb.showModal()}
  else if(e.target===lb||e.target===big)lb.close()});
// Pilih jawaban: klik pilihan, benar jadi hijau, salah jadi merah dan kunci ditandai hijau. Sekali pilih per soal.
const pick=li=>{const ol=li.parentNode;if(ol.dataset.done)return;ol.dataset.done=1;
  const k=ol.children[ol.dataset.k];li.classList.add(li===k?'ok':'no');k.classList.add('ok')};
// Reset: kosongkan warna dan tutup pembahasan, per soal (.rst) atau semua (#rstall).
const reset=ol=>{delete ol.dataset.done;for(const l of ol.children)l.className='';ol.closest('.q').querySelector('details').open=false};
document.addEventListener('click',e=>{const t=e.target,li=t.closest('ol[data-k]>li');
  if(li)pick(li);
  else if(t.matches('.rst'))reset(t.previousElementSibling);
  else if(t.id==='rstall')document.querySelectorAll('ol[data-done]').forEach(reset)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('ol[data-k]>li')){e.preventDefault();pick(e.target)}});

// Pemutar musik: pilih lagu lewat <select>, lanjut otomatis ke lagu berikutnya.
const au=document.getElementById('au'),trk=document.getElementById('trk');
const load=play=>{au.src=trk.value;if(play)au.play().catch(()=>{})};
trk.addEventListener('change',()=>load(true));
au.addEventListener('ended',()=>{trk.selectedIndex=(trk.selectedIndex+1)%trk.length;load(true)});
load(false);

// Bank soal: tiap berkas soal/<tahun>.js memanggil soal(id, html) untuk mengisi section-nya.
window.soal=(id,html)=>document.getElementById(id).insertAdjacentHTML('beforeend',html);
// Setelah semua soal masuk, ulangi lompatan ke #anchor (target mungkin baru ada sekarang).
addEventListener('load',()=>{const t=location.hash&&document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView()});
