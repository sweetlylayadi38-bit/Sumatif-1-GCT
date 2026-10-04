const lb=document.getElementById('lb'),big=lb.querySelector('img');
document.addEventListener('click',e=>{const f=e.target.closest('.fig');
  if(f){const i=f.querySelector('img');big.src=i.src;big.alt=i.alt;lb.showModal()}
  else if(e.target===lb||e.target===big)lb.close()});

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
