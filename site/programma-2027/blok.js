/* Het blok voor 2027.
   1. De elfde: de tien pullen komen op tafel, en de bezoeker schenkt met één tik de elfde in.
   2. De avond: een pul schuift mee langs de tijden terwijl je scrolt.
   Zonder dit script, en voor wie animaties heeft uitgezet, staat alles er meteen in de eindstand. */
(function(){
  'use strict';
  var rustig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- de elfde ---------- */
  var blok = document.querySelector('.p27-elfde'), beeld = document.querySelector('.elfde-beeld');
  var knop = document.getElementById('schenk'), opnieuw = document.getElementById('schenkOpnieuw'), actie = document.querySelector('.elfde-actie');
  if (blok && beeld && knop && !rustig && 'animate' in document.documentElement && 'IntersectionObserver' in window) {
    var pullen = [].slice.call(beeld.querySelectorAll('.pullen .pul')), glas = beeld.querySelector('.glas'), elfde = beeld.querySelector('.de-elfde');
    blok.classList.add('speel');          // de elfde begint leeg
    actie.hidden = false; if (opnieuw) opnieuw.hidden = false;
    elfde.setAttribute('aria-label', 'De elfde pul. Hij is nog leeg.');

    // de tien komen een voor een op tafel zodra het beeld in beeld komt
    beeld.classList.add('wacht');
    var kijk = new IntersectionObserver(function(items){
      items.forEach(function(item){ if (item.isIntersecting) { beeld.classList.remove('wacht'); beeld.classList.add('start'); kijk.disconnect(); } });
    }, { threshold: .4 });
    kijk.observe(beeld);

    var schenken = function(){
      if (blok.classList.contains('bezig')) return;
      // nog een rondje: eerst weer leeg
      if (blok.classList.contains('vol')) { blok.classList.remove('vol'); void glas.offsetWidth; knop.focus({ preventScroll: true }); }
      beeld.classList.remove('wacht', 'start');
      blok.classList.add('bezig'); knop.disabled = true;
      var kader = beeld.getBoundingClientRect(), doel = glas.getBoundingClientRect();
      var naarX = doel.left + doel.width * .55 - kader.left, naarY = doel.top + doel.height * .22 - kader.top;
      pullen.forEach(function(pul, i){
        var wacht = i * 95, plek = pul.getBoundingClientRect();
        var vanX = plek.left + plek.width * .62 - kader.left, vanY = plek.top + plek.height * .12 - kader.top;
        // de pul kantelt even
        pul.animate([{ transform: 'none' }, { transform: 'rotate(24deg)', offset: .45 }, { transform: 'none' }], { duration: 620, delay: wacht, easing: 'ease-in-out' });
        // en er vliegt een druppel in een boog naar de elfde
        var druppel = document.createElement('i'); druppel.className = 'druppel'; beeld.appendChild(druppel);
        var top = Math.min(vanY, naarY) - 70 - Math.random() * 30;
        druppel.animate([
          { transform: 'translate(' + vanX + 'px,' + vanY + 'px) scale(.6)', opacity: 0 },
          { transform: 'translate(' + (vanX + (naarX - vanX) * .12) + 'px,' + (vanY - 24) + 'px) scale(1)', opacity: 1, offset: .12 },
          { transform: 'translate(' + (vanX + (naarX - vanX) * .55) + 'px,' + top + 'px) scale(1)', opacity: 1, offset: .55 },
          { transform: 'translate(' + naarX + 'px,' + naarY + 'px) scale(.7)', opacity: 1, offset: .96 },
          { transform: 'translate(' + naarX + 'px,' + naarY + 'px) scale(.2)', opacity: 0 }
        ], { duration: 780, delay: wacht + 200, easing: 'cubic-bezier(.3,.1,.6,1)' }).onfinish = function(){ druppel.remove(); };
      });
      // zodra de eerste druppels er zijn, loopt de elfde vol
      setTimeout(function(){ blok.classList.add('vol'); elfde.setAttribute('aria-label', 'De elfde pul. Hij is vol en licht op.'); }, 900);
      setTimeout(function(){
        blok.classList.remove('bezig'); knop.disabled = false;
        if (window.vpConfetti) window.vpConfetti(elfde, 90);
      }, 900 + 1300);
    };
    knop.addEventListener('click', schenken);
    if (opnieuw) opnieuw.addEventListener('click', schenken);
  }

  /* ---------- de avond: de pul schuift mee ---------- */
  var lijst = document.getElementById('tijden');
  if (lijst) {
    var loper = lijst.querySelector('.meeloper'), regels = [].slice.call(lijst.querySelectorAll('li:not(.meeloper)'));
    var bezigLijst = false;
    var schuif = function(){
      var r = lijst.getBoundingClientRect(), hoog = r.height - loper.offsetHeight;
      // de pul is boven als de lijst onderin beeld komt, en onder als de lijst bovenin beeld is
      var deel = Math.max(0, Math.min(1, (innerHeight * .78 - r.top) / Math.max(1, r.height + innerHeight * .25)));
      var y = deel * hoog;
      loper.style.setProperty('--y', y + 'px');
      regels.forEach(function(regel){ regel.classList.toggle('geweest', regel.offsetTop <= y + loper.offsetHeight * .6); });
    };
    lijst.classList.add('loopt');
    addEventListener('scroll', function(){ if (!bezigLijst) { bezigLijst = true; requestAnimationFrame(function(){ bezigLijst = false; schuif(); }); } }, { passive: true });
    addEventListener('resize', schuif); schuif();
  }
})();
