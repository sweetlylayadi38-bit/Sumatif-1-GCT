const lb=document.getElementById('lb'),big=lb.querySelector('img');
document.addEventListener('click',e=>{const f=e.target.closest('.fig');
  if(f){const i=f.querySelector('img');big.src=i.src;big.alt=i.alt;lb.showModal()}
  else if(e.target===lb||e.target===big)lb.close()});
