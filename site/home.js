/* De homepage van Veurpruuve: de melding en de aftelling van de verkoopstart, de ticketshop,
   de confetti bij de medaille en het contactformulier.
   Het blok voor 2027 heeft zijn eigen script in /programma-2027/blok.js. */
(function(){
  'use strict';

  /* ---------- instellingen ---------- */
  /* VERKOOPSTART: pas alleen deze regel aan. Formaat: jaar-maand-dagTuur:minuut:00 plus het tijdverschil met UTC.
     +01:00 is wintertijd, +02:00 is zomertijd. Dit is dinsdag 1 december 2026, 11.11 uur. */
  var VERKOOP_START = '2026-12-01T11:11:00+01:00';
  /* De ticketshop van Weeztix voor de tafels. Het adres en de code van de shop komen uit de insluitcode
     die Weeztix geeft (28 november 2026): een vak met de klasse ot-iframe en het script injector.js. */
  var WEEZTIX_SHOP = 'https://shop.weeztix.com/2b320314-3240-4996-99af-5f3e3296a4a5';
  var WEEZTIX_SHOP_CODE = '2b320314-3240-4996-99af-5f3e3296a4a5';
  var WEEZTIX_SCRIPT = 'https://v1.widget.shop.weeztix.com/injector.js';

  var start = new Date(VERKOOP_START);
  /* Om de shop vooraf te bekijken: zet ?shop=1 achter het adres. */
  var gestart = !(new Date() < start) || /[?&]shop=1/.test(location.search);

  /* ---------- de ticketshop: pas laden als de verkoop gestart is ---------- */
  function openShop(){
    var shop = document.getElementById('shop'), wacht = document.getElementById('shopWacht');
    if (!shop || shop.querySelector('.ot-iframe')) return;
    if (wacht) wacht.remove();
    document.querySelectorAll('.startmelding').forEach(function(el){ el.hidden = true; });
    /* Zinnen die alleen kloppen zolang de verkoop nog moet beginnen, hebben de klasse voorstart. */
    document.querySelectorAll('.voorstart').forEach(function(el){ el.hidden = true; });
    var frame = document.createElement('div');
    /* Het vak moet er staan voordat het script laadt: het script zoekt bij het laden naar vakken met de klasse ot-iframe. */
    frame.className = 'ot-iframe';
    frame.setAttribute('data-ot-url', WEEZTIX_SHOP); frame.setAttribute('data-ot-guid', WEEZTIX_SHOP_CODE);
    frame.setAttribute('data-ot-iframe-title', 'Ticketshop van Veurpruuve');
    frame.style.cssText = 'max-width:600px;margin:0 auto';
    shop.appendChild(frame);
    var s = document.createElement('script'); s.src = WEEZTIX_SCRIPT; document.body.appendChild(s);
    document.getElementById('shopLink').hidden = false;
  }

  if (gestart) openShop();
  else {
    /* ---------- de melding zolang de verkoop nog niet gestart is ---------- */
    var tz = 'Europe/Amsterdam';
    var dag = start.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
    var tijd = start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: tz }).replace(':', '.');
    document.querySelectorAll('.startmelding').forEach(function(el){ el.textContent = 'De verkoop start op ' + dag + ' om ' + tijd + ' uur'; el.hidden = false; });

    /* ---------- aftellen naar de verkoopstart, in pullen ---------- */
    /* Op het moment zelf verschijnt de shop vanzelf, zonder dat de bezoeker de pagina hoeft te verversen. */
    var aftel = document.getElementById('aftel');
    if (aftel) {
      var vak = {}; ['d', 'u', 'm', 's'].forEach(function(k){ vak[k] = aftel.querySelector('[data-a="' + k + '"]'); });
      var tik = function(){
        var rest = Math.max(0, Math.ceil((start - new Date()) / 1000));
        if (rest === 0) { clearInterval(klok); openShop(); if (window.vpConfetti) window.vpConfetti(document.getElementById('shop'), 140); return; }
        vak.d.textContent = Math.floor(rest / 86400);
        vak.u.textContent = Math.floor(rest % 86400 / 3600);
        vak.m.textContent = Math.floor(rest % 3600 / 60);
        vak.s.textContent = rest % 60;
      };
      aftel.hidden = false; tik();
      var klok = setInterval(tik, 1000);
    }
  }

  /* ---------- de medaille: een tik strooit confetti ---------- */
  var medaille = document.getElementById('medaille');
  if (medaille) medaille.addEventListener('click', function(){ if (window.vpConfetti) window.vpConfetti(medaille, 110); });

  /* ---------- contactformulier, via Netlify Forms: het onderwerp van de meldingsmail ---------- */
  var form = document.querySelector('form[name=contact]'), onderwerp = document.getElementById('onderwerp');
  if (form && onderwerp) form.addEventListener('submit', function(){
    var b = (document.getElementById('bedrijf').value || '').trim();
    onderwerp.value = 'Veurpruuve: vraag' + (b ? ' van ' + b : '') + ' via de site';
  });
})();
