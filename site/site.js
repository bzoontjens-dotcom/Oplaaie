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

/* Het seintje bij de verkoopstart: het formulier versturen zonder de pagina te verlaten.
   Het loopt via Netlify Forms, onder de naam "verkoopstart". */
(function(){
  'use strict';
  document.querySelectorAll('form[data-seintje]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fout = form.querySelector('.fout'), knop = form.querySelector('button[type=submit]'), gelukt = form.parentNode.querySelector('.gelukt');
      var bedrijf = (form.elements.bedrijf.value || '').trim();
      fout.textContent = '';
      form.elements.subject.value = 'Veurpruuve: seintje gevraagd voor ' + form.elements.waarvoor.value + (bedrijf ? ', ' + bedrijf : '');
      knop.disabled = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function(r){ if (!r.ok) throw new Error(r.status); form.hidden = true; gelukt.hidden = false; gelukt.focus({ preventScroll: true }); })
        .catch(function(){ fout.textContent = 'Versturen is niet gelukt. Probeer het nog eens of mail naar info@veurpruuve.nl.'; })
        .then(function(){ knop.disabled = false; });
    });
  });
})();

/* De uitnodiging doorsturen: de knoppen openen een mail of WhatsApp met een kant-en-klare tekst. */
(function(){
  'use strict';
  var mail = document.getElementById('deelMail'), wa = document.getElementById('deelWhatsapp');
  if (!mail || !wa) return;
  var adres = location.origin + '/';
  var tekst = 'Veurpruuve x Oplaaie mee Hans, de zakelijke carnavalsavond van Lampegat. Donderdag 4 februari 2027 in de Bavaria Bierhal op het Stadhuisplein in Eindhoven, van 16.00 tot 21.00 uur. '
    + 'Een staantafel voor acht kost € 1.600,- exclusief btw, een losse kaart € 200,-. De tafels op de eerste rij worden geveild. '
    + 'De verkoop start op donderdag 26 november 2026 om 11.11 uur.';
  mail.href = 'mailto:?subject=' + encodeURIComponent('Veurpruuve x Oplaaie mee Hans, donderdag 4 februari 2027') + '&body=' + encodeURIComponent('Dit lijkt me iets voor ons:\n\n' + tekst + '\n\n' + adres);
  wa.href = 'https://wa.me/?text=' + encodeURIComponent(tekst + ' ' + adres);
})();
