/* De biedpagina. Deze code laat alleen zien wat de server zegt en stuurt een
   bod naar de server. Alle controles die tellen, gebeuren op de server. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var S = null;            // de laatste stand van de server
  var verschil = 0;        // hoeveel de klok van de server voorloopt op die van dit apparaat
  var bezig = false;
  var laatsteFase = '';
  var flits = {};          // tafels die net gewisseld zijn
  var mij = null;          // het bedrijf waarmee op dit apparaat geboden is
  try { mij = JSON.parse(localStorage.getItem('oplaaie-bieder') || 'null'); } catch (e) { mij = null; }

  var el = {
    form: $('form'), bedrijf: $('bedrijf'), contact: $('contact'), telefoon: $('telefoon'), email: $('email'),
    bod: $('bod'), akkoord: $('akkoord'), fout: $('fout'), bon: $('bon'), knop: $('biedBtn'), melding: $('melding'),
  };

  // ---------- hulpjes ----------
  function punten(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function euro(n) { return '€ ' + punten(n) + ',-'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nu() { return Date.now() + verschil; }
  function sleutel(naam) {
    var kaal = String(naam || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' en ');
    var zonder = kaal.replace(/\b(b\.?\s?v\.?|n\.?\s?v\.?|v\.?\s?o\.?\s?f\.?)(?![a-z0-9])/g, ' ').replace(/[^a-z0-9]+/g, '');
    return zonder || kaal.replace(/[^a-z0-9]+/g, '');
  }
  var DATUM = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var TIJD = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function uur(d) { return TIJD.format(d).replace(':', '.') + ' uur'; }
  function datumTekst(iso) { var d = new Date(iso); return DATUM.format(d) + ' om ' + uur(d); }
  function hoofdletter(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var WOORD = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien'];
  function woord(n) { return WOORD[n] || String(n); }
  function wanneer(iso) {
    var d = new Date(iso), min = Math.floor((nu() - d.getTime()) / 60000);
    if (min < 1) return 'zojuist';
    if (min < 60) return min + (min === 1 ? ' minuut' : ' minuten') + ' geleden';
    if (min < 24 * 60) return Math.floor(min / 60) + ' uur geleden';
    if (min < 48 * 60) return 'gisteren';
    return new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long' }).format(d);
  }

  // ---------- de klok en de fase ----------
  function fase() {
    if (!S) return 'laden';
    var t = nu();
    if (t >= Date.parse(S.sluit)) return 'gesloten';
    if (t < Date.parse(S.opent)) return 'voor';
    return 'open';
  }
  function aftellen(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), u = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    var t2 = function (n) { return ('0' + n).slice(-2); };
    return (d ? d + (d === 1 ? ' dag ' : ' dagen ') : '') + t2(u) + ':' + t2(m) + ':' + t2(sec);
  }
  function tik() {
    if (!S) return;
    var f = fase(), label, tekst, datum;
    if (f === 'voor') {
      label = 'De veiling opent over'; tekst = aftellen(Date.parse(S.opent) - nu()); datum = hoofdletter(datumTekst(S.opent));
    } else if (f === 'open') {
      label = 'De hamer valt over'; tekst = aftellen(Date.parse(S.sluit) - nu());
      datum = S.verlengd ? 'Verlengd door een laat bod, tot ' + uur(new Date(S.sluit)) : hoofdletter(datumTekst(S.sluit));
    } else {
      label = 'De hamer is gevallen'; tekst = 'Gesloten'; datum = S.eindstandVast ? 'De eindstand is vastgesteld' : 'De veiling is gesloten';
    }
    $('klok').textContent = tekst; $('klokTop').textContent = tekst;
    $('klokLabel').textContent = label; $('klokTopLabel').textContent = label; $('klokDatum').textContent = datum;
    if (f !== laatsteFase) {
      var eerste = laatsteFase === '';
      laatsteFase = f; render();
      if (!eerste) laadStand(); // bij openen en sluiten meteen de laatste stand ophalen
    }
  }

  // ---------- rekenen met de stand ----------
  function R() { return S.regels; }
  function allen() { return S.rij.concat(S.buiten.map(function (b) { return { bedrijf: b.bedrijf, bedrag: b.bedrag }; })); }
  function mijnIndex(lijst) {
    if (!mij || !mij.bedrijf) return -1;
    var k = sleutel(mij.bedrijf);
    for (var i = 0; i < lijst.length; i++) if (sleutel(lijst[i].bedrijf) === k) return i;
    return -1;
  }
  function mijnPlek(stand) { var i = mijnIndex((stand || S).rij.concat((stand || S).buiten)); return i < 0 ? 0 : i + 1; }
  function anderen() { var a = allen(), i = mijnIndex(a); if (i >= 0) a.splice(i, 1); return a; }
  function eigenBod() { var a = allen(), i = mijnIndex(a); return i >= 0 ? a[i].bedrag : 0; }
  // Wat moet je bieden om op plek r uit te komen. Bij een gelijk bod gaat voor wie eerder bood.
  function nodigVoor(r) { var a = anderen(); return a.length < r ? R().bodem : a[r - 1].bedrag + R().stap; }
  function minimum() {
    var eigen = eigenBod(), basis = eigen ? eigen + R().stap : R().bodem;
    return S.zichtbaar ? Math.max(nodigVoor(R().plekken), basis) : basis;
  }
  function plekBij(bedrag) { return 1 + anderen().filter(function (b) { return b.bedrag >= bedrag; }).length; }
  function plekTekst(p) { return p > R().plekken ? 'Buiten de eerste rij' : 'Plek ' + p + (p <= R().plekkenPerRij ? ', eerste rij' : ', tweede rij'); }
  function leesBod() { var v = el.bod.value.replace(/[^\d]/g, ''); return v ? parseInt(v, 10) : 0; }

  // ---------- tekenen ----------
  function toon(soort, html) {
    el.melding.className = 'melding' + (soort ? ' ' + soort : '');
    el.melding.innerHTML = html; el.melding.hidden = !html;
  }

  function tafelHtml(plek, b, kolom, dicht) {
    var klassen = 'tafel', naam, bedrag;
    if (!b) { klassen += ' vrij'; naam = dicht ? 'Leeg gebleven' : 'Nog vrij'; bedrag = dicht ? '' : 'vanaf ' + euro(R().bodem); }
    else {
      naam = esc(b.bedrijf); bedrag = euro(b.bedrag);
      if (mij && sleutel(b.bedrijf) === sleutel(mij.bedrijf)) klassen += ' mij'; else if (plek === 1) klassen += ' eerste';
      if (flits[sleutel(b.bedrijf)]) klassen += ' wissel';
    }
    return '<div class="' + klassen + '" style="--col:' + kolom + '"><span class="rk">' + plek + '</span><b class="nm">' + naam + '</b><span class="bd">' + bedrag + '</span></div>';
  }

  function render() {
    if (!S) return;
    var f = fase(), r = R(), z = S.zichtbaar, i;

    // bedragen in de teksten komen uit de spelregels op de server
    var waarden = { bodem: euro(r.bodem), stap: euro(r.stap), staantafel: euro(r.staantafelPrijs) };
    Array.prototype.forEach.call(document.querySelectorAll('[data-r]'), function (s) { if (waarden[s.getAttribute('data-r')]) s.textContent = waarden[s.getAttribute('data-r')]; });

    // de cijfers bovenaan
    $('stFec').textContent = z ? euro(S.fec) : 'Volgt';
    $('stHoog').textContent = z ? euro(S.rij[0].bedrag) : 'Volgt';
    $('stHoogNaam').textContent = z ? S.rij[0].bedrijf : (f === 'voor' ? 'Zodra de veiling open is' : 'Zodra de stand opent');
    $('stInstap').textContent = euro(z ? S.instap : r.bodem);
    var vol = z && S.rij.length >= r.plekken;
    $('stInstapUitleg').textContent = f === 'gesloten' ? 'Bieden kan niet meer.' : f === 'voor' ? 'Het bodembedrag per zittafel.' : vol ? 'De eerste rij is vol. Wie hoger biedt, rijdt de laagste eraf.' : 'Er zijn nog plekken vrij op de eerste rij.';

    // de regel met aantallen
    var tel = [];
    if (z) {
      tel.push('<span><b>' + S.biedingen + '</b> ' + (S.biedingen === 1 ? 'bod' : 'biedingen') + ' van <b>' + S.bedrijven + '</b> bedrijven</span>');
      if (S.verhoogd) tel.push('<span><b>' + S.verhoogd + '</b> keer verhoogd</span>');
      if (S.wacht && f !== 'voor') tel.push('<span><b>' + S.wacht + '</b> ' + (S.wacht === 1 ? 'bod wacht' : 'biedingen wachten') + ' op bevestiging</span>');
    }
    $('tel').innerHTML = tel.join(''); $('tel').hidden = !tel.length;

    // de zaal
    $('tafels').hidden = !z; $('dicht').hidden = z; $('onder').hidden = !z;
    if (z) {
      var h1 = '', h2 = '', per = r.plekkenPerRij;
      for (i = 0; i < per; i++) { h1 += tafelHtml(i + 1, S.rij[i], r.kolomVolgorde[i], f === 'gesloten'); h2 += tafelHtml(i + 1 + per, S.rij[i + per], r.kolomVolgorde[i], f === 'gesloten'); }
      $('rij1').innerHTML = h1; $('rij2').innerHTML = h2; flits = {};
      $('feed').innerHTML = S.laatste.map(function (b) {
        return '<li><b>' + esc(b.bedrijf) + '</b><em>' + euro(b.bedrag) + '</em><small>' + (b.soort === 'verhoogd' ? 'Verhoogt het bod, ' : 'Nieuw bod, ') + wanneer(b.op) + '</small></li>';
      }).join('');
      $('buiten').innerHTML = S.buiten.length ? S.buiten.map(function (b) {
        return '<li><b>' + esc(b.bedrijf) + '</b><em>' + euro(b.bedrag) + '</em><small>' + (f === 'gesloten' ? 'Krijgt als eerste een staantafel aangeboden' : 'Krijgt als eerste een staantafel aangeboden, of biedt opnieuw') + '</small></li>';
      }).join('') : '<li class="leeg">Nog niemand. Zodra de ' + woord(r.plekken) + ' plekken vol zijn, rijdt elk hoger bod de laagste eraf.</li>';
    } else {
      var d;
      if (f === 'voor') d = '<h3>Nog even geduld</h3><p>De veiling opent op ' + datumTekst(S.opent) + '. Vanaf dat moment kun je bieden en vult de eerste rij zich hier.</p>';
      else if (f === 'gesloten') d = '<h3>De veiling is gesloten</h3><p>Bieden kan niet meer.</p>';
      else if (!S.binnen) d = '<h3>De eerste rij is nog leeg</h3><p>Wie pakt de eerste plek pal voor de klep? Bieden kan vanaf ' + euro(r.bodem) + '.</p>';
      else d = '<p class="groot">' + S.binnen + '</p><h3>' + (S.binnen === 1 ? 'bod is binnen' : 'biedingen zijn binnen') + '</h3><p>We bevestigen de biedingen een voor een. De plattegrond gaat open zodra er ' + woord(r.drempelStand) + ' bevestigd zijn.</p>';
      $('dicht').innerHTML = d;
    }

    // de vaste melding na sluiting
    if (f === 'gesloten') {
      var p = z ? mijnPlek() : 0, tekst;
      if (z) {
        tekst = 'De hamer is gevallen. De eerste rij is verdeeld over ' + S.rij.length + ' bedrijven, samen goed voor <b>' + euro(S.totaal) + '</b> exclusief btw. Daarvan gaat <b>' + euro(S.fec) + '</b> naar het carnaval in Lampegat.';
        tekst += S.eindstandVast ? ' Dit is de eindstand.' : ' Dit is de voorlopige eindstand: we handelen de laatste biedingen nog af.';
        if (p && p <= r.plekken) tekst += ' Jij zit op plek ' + p + '. Je krijgt de factuur en wij zetten je bedrijfsnaam op je tafel.';
        else if (p) tekst += ' Jouw bod viel net buiten de eerste rij. Je krijgt als eerste een staantafel aangeboden.';
      } else tekst = 'De hamer is gevallen. De veiling is gesloten.';
      toon('hamer', '<p>' + tekst + '</p>');
    } else if (el.melding.classList.contains('hamer')) toon('', '');

    // het formulier
    var open = f === 'open';
    el.form.classList.toggle('uit', !open);
    el.knop.disabled = !open || bezig;
    var slot = $('slot');
    slot.hidden = open;
    if (f === 'voor') slot.textContent = 'Bieden kan vanaf ' + datumTekst(S.opent) + '.';
    if (f === 'gesloten') slot.textContent = 'De veiling is gesloten. Bieden kan niet meer.';
    chips(); bon();
  }

  function chips() {
    var f = fase(), p = S.zichtbaar ? mijnPlek() : 0, eigen = eigenBod(), r = R();
    [['chErbij', r.plekken, true], ['chVoor', r.plekkenPerRij, S.zichtbaar], ['chKlep', 1, S.zichtbaar]].forEach(function (c) {
      var knop = $(c[0]); knop.hidden = !c[2]; if (!c[2]) return;
      var bedrag = S.zichtbaar ? Math.max(nodigVoor(c[1]), eigen ? eigen + r.stap : r.bodem) : r.bodem;
      var alDaar = p && p <= c[1];
      knop.querySelector('em').textContent = alDaar ? 'Daar zit je al' : euro(bedrag);
      knop.disabled = f !== 'open' || Boolean(alDaar); knop.setAttribute('data-bedrag', bedrag);
    });
    if (!el.bod.value) el.bod.placeholder = punten(minimum());
  }

  function bon() {
    if (!S) return;
    var r = R(), f = fase();
    var naam = el.bedrijf.value.trim() || (mij && mij.bedrijf) || 'Jouw bedrijf';
    var bedrag = leesBod() || minimum();
    $('bonNaam').textContent = naam;
    $('bonBod').textContent = euro(bedrag) + ' exclusief btw';
    $('bonIncl').textContent = euro(bedrag * (100 + r.btwProcent) / 100);
    $('bonFec').textContent = euro(Math.max(0, bedrag - r.bodem));
    $('bonPlek').textContent = f === 'gesloten' ? 'De veiling is gesloten' : f === 'voor' ? 'Volgt bij de opening' : !S.zichtbaar ? 'Volgt zodra de stand opent' : plekTekst(plekBij(bedrag)) + (f === 'open' ? ', voorlopig' : '');
  }

  // ---------- wat er verandert terwijl je kijkt ----------
  function gebeurtenissen(oud, nieuw) {
    if (!oud || !nieuw.zichtbaar || fase() !== 'open') return;
    var r = nieuw.regels, voor = {}, na = {};
    oud.rij.forEach(function (b) { voor[sleutel(b.bedrijf)] = b; });
    nieuw.rij.forEach(function (b) { na[sleutel(b.bedrijf)] = b; if (!voor[sleutel(b.bedrijf)] || voor[sleutel(b.bedrijf)].plek !== b.plek || voor[sleutel(b.bedrijf)].bedrag !== b.bedrag) flits[sleutel(b.bedrijf)] = true; });
    if (!oud.zichtbaar) { flits = {}; return; }
    var pOud = mijnPlek(oud), pNieuw = mijnPlek(nieuw), top = nieuw.laatste[0], topOud = oud.laatste[0];
    var nieuwBod = top && (!topOud || topOud.bedrijf !== top.bedrijf || topOud.bedrag !== top.bedrag) ? top : null;
    var door = nieuwBod && (!mij || sleutel(nieuwBod.bedrijf) !== sleutel(mij.bedrijf)) ? '<b>' + esc(nieuwBod.bedrijf) + '</b> biedt ' + euro(nieuwBod.bedrag) + '. ' : '';
    if (pOud && pOud <= r.plekken && pNieuw > r.plekken) {
      toon('eraf', '<p>Je bent van de eerste rij gereden. ' + door + 'Bied minimaal ' + euro(minimum()) + ' om terug te komen.</p><a class="btn klein" href="#bieden" id="terug">Bied opnieuw</a>');
      el.bod.value = punten(minimum()); bon();
    } else if (pOud && pNieuw > pOud && pNieuw <= r.plekken) {
      toon('', '<p>' + (door || 'Je bent een plek opgeschoven. ') + 'Je zit nu op plek ' + pNieuw + '.</p>');
    } else if (pNieuw && pNieuw <= r.plekken && (!pOud || pNieuw < pOud)) {
      var eigen = eigenBod();
      toon('goed', '<p><b>' + esc(mij.bedrijf) + '</b> staat erin met ' + euro(eigen) + '. ' + plekTekst(pNieuw) + '.' + (eigen > r.bodem ? ' Daarvan gaat ' + euro(eigen - r.bodem) + ' naar het carnaval in Lampegat.' : '') + '</p>');
    } else if (nieuwBod && door) {
      toon('', '<p>' + (nieuwBod.soort === 'verhoogd' ? '<b>' + esc(nieuwBod.bedrijf) + '</b> verhoogt het bod naar ' + euro(nieuwBod.bedrag) + '.' : 'Nieuw bod van <b>' + esc(nieuwBod.bedrijf) + '</b>: ' + euro(nieuwBod.bedrag) + '.') + '</p>');
    }
  }

  // ---------- gegevens ophalen ----------
  function laadTijd() {
    var t0 = Date.now();
    return fetch('/api/tijd', { cache: 'no-store' }).then(function (a) { return a.json(); }).then(function (d) {
      var t1 = Date.now(), server = Date.parse(d.nu);
      if (isFinite(server)) verschil = server - (t0 + t1) / 2;
    }).catch(function () { /* dan gebruiken we de klok van dit apparaat */ });
  }
  function laadStand() {
    return fetch('/api/stand', { cache: 'no-store' }).then(function (a) { if (!a.ok) throw new Error(a.status); return a.json(); }).then(function (d) {
      if (!d || !d.regels) return;
      // een oudere kopie mag een nieuwere stand nooit overschrijven
      if (S && d.versie < S.versie) return;
      var oud = S; S = d;
      if (oud && oud.versie !== d.versie) gebeurtenissen(oud, d);
      render();
      tik();
    }).catch(function () { /* de volgende ronde proberen we het opnieuw */ });
  }

  // ---------- het formulier ----------
  function meldFout(tekst, veld) {
    el.fout.textContent = tekst;
    ['bedrijf', 'contact', 'telefoon', 'email', 'bod'].forEach(function (n) { el[n].removeAttribute('aria-invalid'); });
    $('bodveld').classList.remove('mis');
    if (veld === 'akkoord') { el.akkoord.focus(); return; }
    if (veld && el[veld]) { el[veld].setAttribute('aria-invalid', 'true'); if (veld === 'bod') $('bodveld').classList.add('mis'); el[veld].focus(); }
  }

  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (bezig || !S || fase() !== 'open') return;
    var r = R(), bedrijf = el.bedrijf.value.trim(), contact = el.contact.value.trim(), telefoon = el.telefoon.value.trim(), email = el.email.value.trim(), bedrag = leesBod(), min = minimum();
    if (bedrijf.length < 2) return meldFout('Vul je bedrijfsnaam in, die komt op je tafel te staan.', 'bedrijf');
    if (contact.length < 2) return meldFout('Vul de naam van de contactpersoon in.', 'contact');
    if (telefoon.replace(/\D/g, '').length < 8) return meldFout('Vul een telefoonnummer in waarop we je kunnen bereiken.', 'telefoon');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return meldFout('Vul een geldig e-mailadres in.', 'email');
    if (!bedrag) return meldFout('Vul een bod in. Je kunt instappen vanaf ' + euro(min) + '.', 'bod');
    if (bedrag % r.stap) return meldFout('Bieden gaat in stappen van ' + euro(r.stap) + '. Maak er bijvoorbeeld ' + euro(Math.ceil(bedrag / r.stap) * r.stap) + ' van.', 'bod');
    if (bedrag < r.bodem) return meldFout('Bieden kan vanaf ' + euro(r.bodem) + '.', 'bod');
    if (bedrag < min) return meldFout((eigenBod() ? 'Je bod moet hoger zijn dan je vorige. ' : 'De eerste rij is vol. ') + 'Bied minimaal ' + euro(min) + '.', 'bod');
    if (!el.akkoord.checked) return meldFout('Vink aan dat je akkoord gaat met de voorwaarden. Een bod is bindend.', 'akkoord');
    meldFout('', '');

    bezig = true; el.knop.disabled = true; el.knop.textContent = 'Je bod wordt verstuurd';
    fetch('/api/bod', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bedrijf: bedrijf, contact: contact, telefoon: telefoon, email: email, bod: bedrag, akkoord: true, website: $('website').value }),
    }).then(function (a) { return a.json().then(function (d) { return { status: a.status, d: d }; }); }).then(function (uit) {
      var d = uit.d;
      if (!d.ok) {
        meldFout(d.bericht || 'Je bod is niet opgeslagen. Probeer het opnieuw.', d.veld || '');
        if (d.code === 'gesloten' || d.code === 'nog_niet_open' || d.code === 'onder_minimum' || d.code === 'niet_hoger') { laadTijd().then(laadStand); }
        return;
      }
      mij = { bedrijf: d.bedrijf || bedrijf, bedrag: d.bedrag || bedrag, bonnummer: d.bonnummer };
      try { localStorage.setItem('oplaaie-bieder', JSON.stringify(mij)); } catch (err) { /* geen opslag, dan niet */ }
      $('bonNr').textContent = 'Nr. ' + d.bonnummer;
      $('bonNaam').textContent = mij.bedrijf; $('bonBod').textContent = euro(mij.bedrag) + ' exclusief btw';
      $('bonIncl').textContent = euro(mij.bedrag * (100 + r.btwProcent) / 100); $('bonFec').textContent = euro(Math.max(0, mij.bedrag - r.bodem));
      $('bonPlek').textContent = 'Volgt na bevestiging';
      el.bon.classList.remove('stamped'); void el.bon.offsetWidth; el.bon.classList.add('stamped');
      $('klaarTekst').innerHTML = '<b>' + esc(mij.bedrijf) + '</b> biedt <b>' + euro(mij.bedrag) + '</b> exclusief btw. We bellen ' + esc(contact) + ' op ' + esc(telefoon) + ' om het bod te bevestigen. Je biednummer is ' + esc(d.bonnummer) + '.'
        + (d.verlengd ? ' Omdat je in de laatste ' + woord(r.verlengMinuten) + ' minuten bood, is de veiling met ' + woord(r.verlengMinuten) + ' minuten verlengd.' : '');
      $('deelTekst').textContent = mij.bedrijf + ' biedt mee op de eerste rij van Veurpruuve x Oplaaie mee Hans, de zakelijke carnavalsavond van Lampegat op donderdag 4 februari 2027 in de Bavaria Bierhal. Wie biedt er over ons heen? Alles boven het startbod van ' + euro(r.bodem) + ' gaat naar het carnaval in Lampegat. Salaai! Oplaaie! veurpruuve.nl/eerste-rij';
      $('klaar').hidden = false; $('deel').hidden = false;
      el.bod.value = ''; el.akkoord.checked = false;
      // De klok meteen bijwerken; een oudere kopie van de stand mag dit niet terugdraaien.
      if (d.sluit) { S.sluit = d.sluit; if (d.verlengd) S.verlengd = true; if (d.versie > S.versie) S.versie = d.versie; tik(); }
      $('klaar').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      $('klaar').focus({ preventScroll: true });
      setTimeout(laadStand, 2500);
    }).catch(function () {
      meldFout('Je bod is niet verstuurd. Controleer je verbinding en probeer het opnieuw.', '');
    }).then(function () {
      bezig = false; el.knop.textContent = 'Breng bod uit'; el.knop.disabled = fase() !== 'open';
    });
  });

  el.bod.addEventListener('input', function () { el.fout.textContent = ''; $('bodveld').classList.remove('mis'); bon(); });
  el.bedrijf.addEventListener('input', bon);
  $('chips').addEventListener('click', function (e) {
    var knop = e.target.closest('.chip'); if (!knop || knop.disabled) return;
    el.bod.value = punten(knop.getAttribute('data-bedrag')); el.fout.textContent = ''; bon();
  });
  $('kopieer').addEventListener('click', function () {
    var knop = this, tekst = $('deelTekst').textContent;
    var klaar = function (ok) { knop.textContent = ok ? 'Gekopieerd' : 'Selecteer de tekst en kopieer hem zelf'; setTimeout(function () { knop.textContent = 'Kopieer het bericht'; }, 2600); };
    try { navigator.clipboard.writeText(tekst).then(function () { klaar(true); }, function () { klaar(false); }); } catch (err) { klaar(false); }
  });

  // ---------- starten ----------
  laadTijd().then(laadStand);
  setInterval(tik, 1000);
  // De stand ververst vanzelf, ongeveer elke tien seconden, zolang de pagina in beeld is.
  setInterval(function () { if (!document.hidden) laadStand(); }, 10000);
  setInterval(laadTijd, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) laadTijd().then(laadStand); });
})();
