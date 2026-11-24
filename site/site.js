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
  var tekst = 'Veurpruuve, de zakelijke carnavalsavond van Lampegat. Wij pruuve veur, heel Lampegat viert mee. Donderdag 4 februari 2027 in de Bavaria Bierhal op het Stadhuisplein in Eindhoven, van 16.00 tot 21.00 uur. '
    + 'Een eigen tafel voor tien kost € 1.500,- inclusief btw, een tafel op de eerste rij € 2.000,-. Van elke tafel gaat € 25,- naar {{DOEL}}. '
    + 'De verkoop start op dinsdag 1 december 2026 om 11.11 uur.';
  mail.href = 'mailto:?subject=' + encodeURIComponent('Veurpruuve, donderdag 4 februari 2027') + '&body=' + encodeURIComponent('Dit lijkt me iets voor ons:\n\n' + tekst + '\n\n' + adres);
  wa.href = 'https://wa.me/?text=' + encodeURIComponent(tekst + ' ' + adres);
})();

/* Confetti in de kleuren van Veurpruuve. Andere scripts roepen het aan met: vpConfetti(element, aantal).
   Wie animaties heeft uitgezet, krijgt geen confetti. */
(function(){
  'use strict';
  var KLEUREN = ['#F07D1A', '#FF9636', '#3B66CF', '#FAF6EE', '#F5AE2E', '#16307A'];
  var rustig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doek, ctx, stukjes = [], bezig = false;
  function maat(){ var r = window.devicePixelRatio || 1; doek.width = innerWidth * r; doek.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
  function teken(){
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    stukjes = stukjes.filter(function(s){ return s.y < innerHeight + 30 && s.leven > 0; });
    stukjes.forEach(function(s){
      s.vy += .32; s.vx *= .99; s.x += s.vx; s.y += s.vy; s.hoek += s.draai; s.leven--;
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.hoek); ctx.globalAlpha = Math.min(1, s.leven / 30); ctx.fillStyle = s.kleur;
      if (s.rond) { ctx.beginPath(); ctx.arc(0, 0, s.r / 2, 0, 6.3); ctx.fill(); } else ctx.fillRect(-s.r / 2, -s.r / 4, s.r, s.r / 2);
      ctx.restore();
    });
    if (stukjes.length) requestAnimationFrame(teken); else { bezig = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  window.vpConfetti = function(el, aantal){
    if (rustig || !el) return;
    if (!doek) {
      doek = document.createElement('canvas'); doek.setAttribute('aria-hidden', 'true');
      doek.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60';
      document.body.appendChild(doek); ctx = doek.getContext('2d'); maat(); addEventListener('resize', maat);
    }
    var b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height * .45;
    for (var i = 0; i < (aantal || 80); i++) stukjes.push({ x: x + (Math.random() - .5) * b.width * .5, y: y, vx: (Math.random() - .5) * 15, vy: -Math.random() * 14 - 4,
      r: 6 + Math.random() * 7, kleur: KLEUREN[i % KLEUREN.length], hoek: Math.random() * 6, draai: (Math.random() - .5) * .4, rond: i % 4 === 0, leven: 110 + Math.random() * 60 });
    if (!bezig) { bezig = true; requestAnimationFrame(teken); }
  };
})();
