/* Het menu op een telefoon: open en dicht met de knop, dicht na een keuze of met Escape. Voor alle pagina's. */
(function(){
  'use strict';
  var knop = document.querySelector('.menuknop'), menu = document.getElementById('menu');
  if (!knop || !menu) return;
  function zet(open){ menu.classList.toggle('open', open); knop.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  knop.addEventListener('click', function(){ zet(!menu.classList.contains('open')); });
  menu.addEventListener('click', function(e){ if (e.target.closest('a')) zet(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && menu.classList.contains('open')) { zet(false); knop.focus(); } });
})();
