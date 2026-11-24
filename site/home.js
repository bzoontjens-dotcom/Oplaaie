/* De homepage van Veurpruuve: de melding van de verkoopstart, de ticketshop en het contactformulier.
   Het blok voor 2027 heeft zijn eigen script in /programma-2027/blok.js. */
(function(){
  'use strict';

  /* ---------- instellingen ---------- */
  /* VERKOOPSTART: pas alleen deze regel aan. Formaat: jaar-maand-dagTuur:minuut:00 plus het tijdverschil met UTC.
     +01:00 is wintertijd, +02:00 is zomertijd. Dit is dinsdag 1 december 2026, 11.11 uur. */
  var VERKOOP_START = '2026-12-01T11:11:00+01:00';
  /* De ticketshop van Weeztix voor de tafels. */
  var WEEZTIX_SHOP = 'https://shop.weeztix.com/2b320314-3240-4996-99af-5f3e3296a4a5';

  var start = new Date(VERKOOP_START);
  /* Om de shop vooraf te bekijken: zet ?shop=1 achter het adres. */
  var gestart = !(new Date() < start) || /[?&]shop=1/.test(location.search);

  /* ---------- de melding zolang de verkoop nog niet gestart is ---------- */
  if (!gestart) {
    var tz = 'Europe/Amsterdam';
    var dag = start.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
    var tijd = start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: tz }).replace(':', '.');
    document.querySelectorAll('.startmelding').forEach(function(el){ el.textContent = 'De verkoop start op ' + dag + ' om ' + tijd + ' uur'; el.hidden = false; });
  }

  /* ---------- de ticketshop: pas laden als de verkoop gestart is ---------- */
  if (gestart) {
    var shop = document.getElementById('shop'), wacht = document.getElementById('shopWacht');
    if (wacht) wacht.remove();
    var frame = document.createElement('div');
    frame.id = 'shop-frame'; frame.setAttribute('data-url', WEEZTIX_SHOP); frame.style.cssText = 'max-width:600px;margin:0 auto';
    shop.appendChild(frame);
    var s = document.createElement('script'); s.src = 'https://shop.weeztix.com/build/integrate.js'; document.body.appendChild(s);
    document.getElementById('shopLink').hidden = false;
  }

  /* ---------- contactformulier, via Netlify Forms: het onderwerp van de meldingsmail ---------- */
  var form = document.querySelector('form[name=contact]'), onderwerp = document.getElementById('onderwerp');
  if (form && onderwerp) form.addEventListener('submit', function(){
    var b = (document.getElementById('bedrijf').value || '').trim();
    onderwerp.value = 'Veurpruuve: vraag' + (b ? ' van ' + b : '') + ' via de site';
  });
})();
