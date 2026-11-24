/* De beheerpagina. Alle gegevens komen van de server en alleen na inloggen. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var O = null;          // het laatste overzicht van de server
  var verschil = 0;      // serverklok min de klok van dit apparaat
  var corrigeerId = null;
  var openTeksten = {};  // welke uitgeklapte teksten open moeten blijven als de pagina ververst
  var GETAL = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];
  function getal(n) { return GETAL[n] || String(n); }

  function punten(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function euro(n) { return '€ ' + punten(n) + ',-'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var KORT = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function tijd(iso) { return iso ? KORT.format(new Date(iso)) : ''; }
  function nu() { return Date.now() + verschil; }
  function voornaam(naam) { return String(naam || '').trim().split(/\s+/)[0] || ''; }
  function telLink(t) { return t ? '<a href="tel:' + esc(t.replace(/[^\d+]/g, '')) + '">' + esc(t) + '</a>' : '<span class="leegje">geen nummer</span>'; }
  function mailLink(m) { return m ? '<a href="mailto:' + esc(m) + '">' + esc(m) + '</a>' : '<span class="leegje">geen adres</span>'; }

  function meld(soort, tekst) {
    var m = $('bMelding');
    m.className = 'melding' + (soort ? ' ' + soort : '');
    m.innerHTML = tekst ? '<p>' + esc(tekst) + '</p>' : ''; m.hidden = !tekst;
    if (tekst) m.scrollIntoView({ block: 'nearest' });
  }

  // ---------- praten met de server ----------
  function api(actie, extra) {
    var inhoud = { actie: actie };
    for (var k in (extra || {})) inhoud[k] = extra[k];
    return fetch('/api/beheer', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-oplaaie-beheer': '1' },
      body: JSON.stringify(inhoud),
    }).then(function (a) { return a.json().then(function (d) { d.status = a.status; return d; }); });
  }

  function toonInlog(tekst) {
    O = null;
    $('app').hidden = true; $('uitloggen').hidden = true; $('inlog').hidden = false;
    $('inlogFout').textContent = tekst || '';
    $('kLabel').textContent = ''; $('kTijd').textContent = '';
  }

  function verwerk(d, goedTekst) {
    if (d.status === 401) { toonInlog(d.code === 'niet_ingelogd' ? 'Je sessie is verlopen. Log opnieuw in.' : d.bericht); return false; }
    if (!d.ok) { meld('eraf', d.bericht || 'Dat is niet gelukt.'); return false; }
    if (d.overzicht) { O = d.overzicht; verschil = Date.parse(O.nu) - Date.now(); render(); }
    if (goedTekst) meld('goed', goedTekst);
    return true;
  }

  function doe(actie, extra, goedTekst) {
    return api(actie, extra).then(function (d) { return verwerk(d, goedTekst) ? d : null; })
      .catch(function () { meld('eraf', 'Geen verbinding met de server. Er is niets gewijzigd. Probeer het opnieuw.'); return null; });
  }

  // ---------- tekenen ----------
  function bod(id) { return O.biedingen.filter(function (b) { return b.id === id; })[0]; }
  function fec(b) { return b.plek && b.plek <= O.regels.plekken ? Math.max(0, b.bedrag - O.regels.bodem) : 0; }

  function tik() {
    if (!O) return;
    var f = fase(), rest, label;
    if (f === 'voor') { label = 'Opent over'; rest = Date.parse(O.opent) - nu(); }
    else if (f === 'open') { label = 'Sluit over'; rest = Date.parse(O.sluit) - nu(); }
    else { $('kLabel').textContent = 'De veiling is'; $('kTijd').textContent = 'gesloten'; return; }
    var s = Math.max(0, Math.floor(rest / 1000)), d = Math.floor(s / 86400), t2 = function (n) { return ('0' + n).slice(-2); };
    $('kLabel').textContent = label;
    $('kTijd').textContent = (d ? d + (d === 1 ? ' dag ' : ' dagen ') : '') + t2(Math.floor(s % 86400 / 3600)) + ':' + t2(Math.floor(s % 3600 / 60)) + ':' + t2(s % 60);
  }
  function fase() { var t = nu(); return t >= Date.parse(O.sluit) ? 'gesloten' : t < Date.parse(O.opent) ? 'voor' : 'open'; }

  function belTekst(m) {
    var f = fase(), r = O.regels, groet = 'Dag ' + (voornaam(m.contact) || 'daar') + ',\n\n', slot = '\n\nGroet,\nhet team van Veurpruuve\ninfo@veurpruuve.nl';
    if (m.soort === 'eraf') {
      if (f === 'gesloten') return groet + m.bedrijf + ' is in de laatste ronde overboden en staat bij de sluiting net buiten de eerste rij van Veurpruuve. Jullie bod was ' + euro(m.bedrag) + '. Dat bod vervalt, je betaalt niets.\n\nJe krijgt als eerste een staantafel aangeboden voor ' + euro(r.staantafelPrijs) + ' exclusief btw. Laat je ons weten of je die wilt?' + slot;
      return groet + m.bedrijf + ' is overboden op de eerste rij van Veurpruuve en staat nu net buiten de ' + getal(r.plekken) + ' plekken. Jullie bod was ' + euro(m.bedrag) + '.\n\nWil je terug op de eerste rij, dan is nu een bod van minimaal ' + euro(m.terugOpRij) + ' nodig. Bieden kan tot ' + O.sluitTekst + ' op veurpruuve.nl/eerste-rij. Een bod in de laatste ' + getal(r.verlengMinuten) + ' minuten verlengt de veiling.\n\nBied je niet opnieuw, dan krijg je als eerste een staantafel aangeboden voor ' + euro(r.staantafelPrijs) + ' exclusief btw.' + slot;
    }
    if (f === 'gesloten') return groet + m.bedrijf + ' zit bij de sluiting op plek ' + m.naarPlek + ' van de eerste rij van Veurpruuve, met een bod van ' + euro(m.bedrag) + '. Je krijgt de factuur van ons.' + slot;
    return groet + m.bedrijf + ' is op de eerste rij van Veurpruuve opgeschoven van plek ' + m.vanPlek + ' naar plek ' + m.naarPlek + '. Jullie bod is ' + euro(m.bedrag) + '. Je zit nog steeds op de eerste rij.\n\nWil je terug naar plek ' + m.vanPlek + ', bied dan minimaal ' + euro(m.terugOpPlek) + '. Bieden kan tot ' + O.sluitTekst + ' op veurpruuve.nl/eerste-rij.' + slot;
  }

  var LOG = {
    bod_ingediend: 'Bod binnengekomen via de site', bevestigd: 'Bod bevestigd', afgewezen: 'Bod afgewezen', ingetrokken: 'Bod ingetrokken',
    teruggezet: 'Bod teruggezet in de wachtrij', gecorrigeerd: 'Bod gecorrigeerd', ingevoerd: 'Bod ingevoerd op de beheerpagina', verlengd: 'Veiling verlengd door een laat bod',
    veiling_nu_openen: 'Veiling geopend', veiling_nu_sluiten: 'Veiling gesloten', veiling_sluitmoment: 'Sluitmoment ingesteld', veiling_openmoment: 'Openingsmoment ingesteld',
    veiling_spelregels: 'Klok teruggezet naar de spelregels', veiling_eindstand_vast: 'Eindstand vastgesteld', veiling_eindstand_los: 'Eindstand weer vrijgegeven', melding_afgehandeld: 'Melding afgehandeld', testgegevens_gewist: 'Testgegevens gewist',
  };
  function logDetail(l) {
    var d = l.details || {}, b = l.bodId ? bod(l.bodId) : null, delen = [];
    if (b) delen.push(b.bedrijf + ' (' + b.bonnummer + ')');
    if (l.soort === 'gecorrigeerd' && d.was && d.wordt) {
      ['bedrijf', 'contact', 'email', 'telefoon', 'bedrag'].forEach(function (k) { if (String(d.was[k]) !== String(d.wordt[k])) delen.push(k + ': ' + (k === 'bedrag' ? euro(d.was[k]) + ' wordt ' + euro(d.wordt[k]) : d.was[k] + ' wordt ' + d.wordt[k])); });
      if (d.reden) delen.push('reden: ' + d.reden);
    } else if (l.soort === 'verlengd') delen.push('tot ' + tijd(d.wordt));
    else if (l.soort === 'veiling_sluitmoment' || l.soort === 'veiling_openmoment') delen.push(tijd(d.waarde));
    else {
      if (d.bedrag) delen.push(euro(d.bedrag));
      if (d.plek) delen.push('plek ' + d.plek);
      if (d.vervangt) delen.push('verhoging');
      if (d.reden) delen.push('reden: ' + d.reden);
    }
    return delen.join(', ');
  }

  function render() {
    if (!O) return;
    $('inlog').hidden = true; $('app').hidden = false; $('uitloggen').hidden = false;
    var f = fase(), r = O.regels;
    var wacht = O.biedingen.filter(function (b) { return b.status === 'wacht'; }).sort(function (a, b) { return a.id - b.id; });
    var stand = O.biedingen.filter(function (b) { return b.status === 'bevestigd'; }).sort(function (a, b) { return a.plek - b.plek; });

    // de tegels
    var faseTekst = f === 'voor' ? 'Nog niet open' : f === 'open' ? 'Open' : (O.eindstandVast ? 'Gesloten, eindstand vast' : 'Gesloten');
    $('tegels').innerHTML =
      '<div class="tegel ' + (f === 'open' ? 'aan' : '') + '"><span>De veiling is</span><b>' + faseTekst + '</b><small>' + (O.verlengd ? 'Verlengd door een laat bod' : (O.eigenTijden.opent || O.eigenTijden.sluit ? 'Met een zelf ingestelde tijd' : 'Volgens de spelregels')) + '</small></div>'
      + '<div class="tegel"><span>Opent</span><b style="font-size:16px">' + esc(O.opentTekst) + '</b></div>'
      + '<div class="tegel"><span>Sluit</span><b style="font-size:16px">' + esc(O.sluitTekst) + '</b></div>'
      + '<div class="tegel ' + (wacht.length ? 'let' : '') + '"><span>Wacht op bevestiging</span><b>' + wacht.length + '</b></div>'
      + '<div class="tegel"><span>In de stand</span><b>' + stand.length + '</b><small>' + (stand.length < r.drempelStand ? 'Openbaar vanaf ' + r.drempelStand + ' bevestigde biedingen' : 'De stand is openbaar') + '</small></div>'
      + '<div class="tegel"><span>Opgeladen voor de FEC</span><b>' + euro(O.fec) + '</b><small>Totaal eerste rij ' + euro(O.totaal) + '</small></div>'
      + '<div class="tegel"><span>Instappen vanaf</span><b>' + euro(O.instap) + '</b></div>';

    // de knoppen van de veiling
    var k = '';
    if (f === 'voor') k += '<button class="btn sm groen" data-veiling="nu_openen">Open de veiling nu</button>';
    if (f === 'open') k += '<button class="btn sm rood" data-veiling="nu_sluiten">Sluit de veiling nu</button>';
    if (f === 'gesloten' && !O.eindstandVast) k += '<button class="btn sm groen" data-veiling="eindstand_vast">Stel de eindstand vast</button>';
    if (f === 'gesloten' && O.eindstandVast) k += '<button class="btn sm line" data-veiling="eindstand_los">Geef de eindstand weer vrij</button>';
    if (O.eigenTijden.opent || O.eigenTijden.sluit) k += '<button class="btn sm line" data-veiling="spelregels">Terug naar de tijden uit de spelregels</button>';
    if (O.testadres) k += '<button class="btn sm rood" data-veiling="wis_testgegevens">Wis alle testgegevens</button>';
    $('veilingKnoppen').innerHTML = k;

    // wacht op bevestiging
    $('nWacht').textContent = wacht.length ? '(' + wacht.length + ')' : '';
    $('wacht').innerHTML = wacht.length ? wacht.map(function (b) {
      var tip = '', knoppen;
      var uitkomst = b.zouPlek <= r.plekken ? 'Komt na bevestigen op plek ' + b.zouPlek + '.' : 'Let op: komt na bevestigen buiten de eerste rij (plek ' + b.zouPlek + ').';
      if (b.lijktOp && b.lijktOp.zelfdeNaam) {
        tip = 'Dit is een verhoging: ' + b.lijktOp.bedrijf + ' staat al in de stand met ' + euro(b.lijktOp.bedrag) + ' op plek ' + b.lijktOp.plek + '. ' + (b.bedrag > b.lijktOp.bedrag ? 'Na bevestigen vervangt dit bod het oude.' : 'Dit bod is niet hoger en kan niet bevestigd worden.');
        knoppen = '<button class="btn sm groen" data-actie="bevestig" data-id="' + b.id + '">Bevestig de verhoging</button>';
      } else if (b.lijktOp) {
        tip = 'Zelfde e-mailadres als ' + b.lijktOp.bedrijf + ', dat al in de stand staat met ' + euro(b.lijktOp.bedrag) + ' op plek ' + b.lijktOp.plek + '. Is het hetzelfde bedrijf, bevestig het dan als verhoging.';
        knoppen = '<button class="btn sm groen" data-actie="bevestig" data-id="' + b.id + '" data-vervangt="' + b.lijktOp.id + '">Bevestig als verhoging van ' + esc(b.lijktOp.bedrijf) + '</button><button class="btn sm" data-actie="bevestig" data-id="' + b.id + '">Bevestig als nieuw bedrijf</button>';
      } else knoppen = '<button class="btn sm groen" data-actie="bevestig" data-id="' + b.id + '">Bevestig</button>';
      var vraag = 'Dag ' + (voornaam(b.contact) || 'daar') + ',\n\nWe hebben het bod van ' + b.bedrijf + ' op de eerste rij van Veurpruuve ontvangen: ' + euro(b.bedrag) + ' exclusief btw, biednummer ' + b.bonnummer + '.\n\nKlopt dit, en bied je namens ' + b.bedrijf + '? Antwoord dan op deze mail met akkoord. Daarna staat jullie naam in de stand op veurpruuve.nl/eerste-rij.\n\nGroet,\nhet team van Veurpruuve\ninfo@veurpruuve.nl';
      var mailKnop = b.email ? '<a class="btn sm line" href="mailto:' + esc(b.email) + '?subject=' + encodeURIComponent('Bevestig je bod op de eerste rij van Veurpruuve (' + b.bonnummer + ')') + '&body=' + encodeURIComponent(vraag) + '">Mail de bevestiging</a>' : '';
      return '<article class="kaart nieuw"><h3>' + esc(b.bedrijf) + '</h3><span class="bedrag">' + euro(b.bedrag) + '</span>'
        + '<dl><dt>Contact</dt><dd>' + esc(b.contact) + '</dd><dt>Telefoon</dt><dd>' + telLink(b.telefoon) + '</dd><dt>E-mail</dt><dd>' + mailLink(b.email) + '</dd><dt>Binnen</dt><dd>' + tijd(b.ingediend) + '</dd><dt>Nummer</dt><dd>' + b.bonnummer + '</dd></dl>'
        + '<p class="tip">' + esc(tip ? tip + ' ' : '') + esc(uitkomst) + '</p>'
        + '<div class="knoppen">' + mailKnop + knoppen + '<button class="btn sm line" data-actie="corrigeer" data-id="' + b.id + '">Corrigeer</button><button class="btn sm rood" data-actie="wijs_af" data-id="' + b.id + '">Wijs af</button></div></article>';
    }).join('') : '<p class="leeg">Er wacht niets op bevestiging.</p>';

    // bellen of mailen
    $('nBellen').textContent = O.meldingen.length ? '(' + O.meldingen.length + ')' : '';
    $('bellen').innerHTML = O.meldingen.length ? O.meldingen.map(function (m) {
      var kop = m.soort === 'eraf' ? esc(m.bedrijf) + ' is van de eerste rij af' : esc(m.bedrijf) + ' is opgeschoven van plek ' + m.vanPlek + ' naar plek ' + m.naarPlek;
      var tekst = belTekst(m);
      var mailto = m.email ? '<a class="btn sm line" href="mailto:' + esc(m.email) + '?subject=' + encodeURIComponent('De eerste rij van Veurpruuve') + '&body=' + encodeURIComponent(tekst) + '">Open als mail</a>' : '';
      return '<article class="kaart ' + (m.soort === 'eraf' ? 'eraf' : '') + '"><h3>' + kop + '</h3>'
        + '<dl><dt>Contact</dt><dd>' + esc(m.contact) + '</dd><dt>Telefoon</dt><dd>' + telLink(m.telefoon) + '</dd><dt>E-mail</dt><dd>' + mailLink(m.email) + '</dd><dt>Bod</dt><dd>' + euro(m.bedrag) + '</dd><dt>Sinds</dt><dd>' + tijd(m.sinds) + '</dd></dl>'
        + '<details data-melding="' + m.id + '"' + (m.soort === 'eraf' || openTeksten[m.id] ? ' open' : '') + '><summary>Tekst om te kopiëren</summary><textarea readonly aria-label="Tekst voor ' + esc(m.bedrijf) + '">' + esc(tekst) + '</textarea></details>'
        + '<div class="knoppen"><button class="btn sm" data-actie="kopieer">Kopieer de tekst</button>' + mailto + '<button class="btn sm groen" data-actie="melding_klaar" data-id="' + m.id + '">Afgehandeld</button></div></article>';
    }).join('') : '<p class="leeg">Er hoeft niemand gebeld of gemaild te worden.</p>';

    // de stand
    $('nStand').textContent = '(' + stand.length + ')';
    $('standTabel').innerHTML = '<thead><tr><th class="num">Plek</th><th>Bedrijf</th><th class="num">Bod</th><th class="num">Tafeldeel</th><th class="num">Naar de FEC</th><th>Contact</th><th>Telefoon</th><th>E-mail</th><th></th></tr></thead><tbody>'
      + (stand.length ? stand.map(function (b) {
        var op = b.plek <= r.plekken;
        return '<tr class="' + (op ? '' : 'buiten') + (b.plek === r.plekken + 1 ? ' streep' : '') + '"><td class="num">' + (op ? b.plek : 'buiten (' + b.plek + ')') + '</td><td><b>' + esc(b.bedrijf) + '</b></td><td class="num">' + euro(b.bedrag) + '</td><td class="num">' + (op ? euro(r.bodem) : '') + '</td><td class="num">' + (op ? euro(fec(b)) : '') + '</td><td>' + esc(b.contact) + '</td><td>' + telLink(b.telefoon) + '</td><td>' + mailLink(b.email) + '</td>'
          + '<td><div class="knoppen"><button class="btn sm line" data-actie="corrigeer" data-id="' + b.id + '">Corrigeer</button><button class="btn sm rood" data-actie="trek_in" data-id="' + b.id + '">Trek in</button></div></td></tr>';
      }).join('') : '<tr><td colspan="9">Er staat nog niets in de stand.</td></tr>') + '</tbody>';

    // alle biedingen
    var STATUS = { wacht: 'wacht', bevestigd: 'bevestigd', afgewezen: 'afgewezen', ingetrokken: 'ingetrokken', vervangen: 'vervangen' };
    $('nAlle').textContent = '(' + O.biedingen.length + ')';
    $('alleTabel').innerHTML = '<thead><tr><th>Nummer</th><th>Status</th><th>Bedrijf</th><th class="num">Bod</th><th>Contact</th><th>Telefoon</th><th>E-mail</th><th>Binnen</th><th>Beslist</th><th>Via</th><th>Notitie</th><th></th></tr></thead><tbody>'
      + (O.biedingen.length ? O.biedingen.map(function (b) {
        var knop = b.status === 'afgewezen' || b.status === 'ingetrokken' ? '<button class="btn sm line" data-actie="zet_terug" data-id="' + b.id + '">Zet terug</button>' : '';
        return '<tr><td>' + b.bonnummer + '</td><td><span class="status ' + b.status + '">' + STATUS[b.status] + '</span></td><td>' + esc(b.bedrijf) + '</td><td class="num">' + euro(b.bedrag) + '</td><td>' + esc(b.contact) + '</td><td>' + telLink(b.telefoon) + '</td><td>' + mailLink(b.email) + '</td><td>' + tijd(b.ingediend) + '</td><td>' + tijd(b.beslist) + '</td><td>' + (b.bron === 'beheer' ? 'beheer' : 'site') + '</td><td>' + esc(b.notitie) + '</td><td>' + knop + '</td></tr>';
      }).join('') : '<tr><td colspan="12">Er zijn nog geen biedingen.</td></tr>') + '</tbody>';

    // het logboek
    $('log').innerHTML = O.logboek.map(function (l) { return '<li><time>' + tijd(l.op) + '</time><span><b>' + esc(LOG[l.soort] || l.soort) + '</b>' + (logDetail(l) ? ' · ' + esc(logDetail(l)) : '') + '</span></li>'; }).join('') || '<li><span>Nog niets gebeurd.</span></li>';
    tik();
  }

  // ---------- knoppen ----------
  document.addEventListener('click', function (e) {
    var knop = e.target.closest('[data-actie],[data-veiling]');
    if (!knop || !O) return;
    var v = knop.getAttribute('data-veiling');
    if (v) {
      var vraag = { nu_openen: 'De veiling nu openen? Vanaf dat moment kan iedereen bieden.', nu_sluiten: 'De veiling nu sluiten? Daarna kan niemand meer bieden.', spelregels: 'De tijden terugzetten naar de spelregels?', eindstand_vast: 'De eindstand vaststellen? De biedpagina toont dan de definitieve eindstand.', eindstand_los: 'De eindstand weer vrijgeven?', wis_testgegevens: 'Alle biedingen wissen en de klok terugzetten? Dit kan alleen op het testadres en is niet terug te draaien.' }[v];
      if (!window.confirm(vraag)) return;
      doe(v, {}, 'Gedaan.');
      return;
    }
    var actie = knop.getAttribute('data-actie'), id = Number(knop.getAttribute('data-id')), b = id ? bod(id) : null;
    if (actie === 'kopieer') {
      var veld = knop.closest('.kaart').querySelector('textarea');
      var klaar = function (ok) { knop.textContent = ok ? 'Gekopieerd' : 'Selecteer en kopieer zelf'; if (!ok) { veld.focus(); veld.select(); } setTimeout(function () { knop.textContent = 'Kopieer de tekst'; }, 2500); };
      try { navigator.clipboard.writeText(veld.value).then(function () { klaar(true); }, function () { klaar(false); }); } catch (err) { klaar(false); }
    } else if (actie === 'bevestig') {
      knop.disabled = true;
      doe('bevestig', { id: id, vervangtId: Number(knop.getAttribute('data-vervangt')) || null }, b ? b.bedrijf + ' is bevestigd met ' + euro(b.bedrag) + ' en staat in de stand.' : 'Bevestigd.').then(function () { knop.disabled = false; });
    } else if (actie === 'wijs_af') {
      var reden = window.prompt('Waarom wijs je het bod van ' + b.bedrijf + ' af? Dit komt in het logboek.', '');
      if (reden === null) return;
      doe('wijs_af', { id: id, reden: reden }, 'Het bod van ' + b.bedrijf + ' is afgewezen.');
    } else if (actie === 'trek_in') {
      var waarom = window.prompt('Het bod van ' + b.bedrijf + ' (' + euro(b.bedrag) + ') intrekken? Het verdwijnt uit de stand. Vul de reden in voor het logboek.', '');
      if (waarom === null) return;
      doe('trek_in', { id: id, reden: waarom }, 'Het bod van ' + b.bedrijf + ' is ingetrokken.');
    } else if (actie === 'zet_terug') {
      doe('zet_terug', { id: id }, 'Het bod van ' + b.bedrijf + ' wacht weer op bevestiging.');
    } else if (actie === 'melding_klaar') {
      doe('melding_klaar', { id: id }, 'Afgehandeld.');
    } else if (actie === 'corrigeer') {
      corrigeerId = id;
      $('cBedrijf').value = b.bedrijf; $('cContact').value = b.contact; $('cTelefoon').value = b.telefoon; $('cEmail').value = b.email; $('cBod').value = b.bedrag; $('cReden').value = ''; $('cFout').textContent = '';
      $('corrigeer').showModal();
    }
  });

  document.addEventListener('toggle', function (e) { var d = e.target; if (d && d.getAttribute && d.getAttribute('data-melding')) openTeksten[d.getAttribute('data-melding')] = d.open; }, true);

  $('cAnnuleer').addEventListener('click', function () { $('corrigeer').close(); });
  $('corrigeerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    api('corrigeer', { id: corrigeerId, wijziging: { bedrijf: $('cBedrijf').value, contact: $('cContact').value, telefoon: $('cTelefoon').value, email: $('cEmail').value, bod: $('cBod').value, reden: $('cReden').value } }).then(function (d) {
      if (d.status !== 401 && !d.ok) { $('cFout').textContent = d.bericht || 'Dat is niet gelukt.'; return; }
      $('corrigeer').close(); verwerk(d, 'De correctie is opgeslagen.');
    }).catch(function () { $('cFout').textContent = 'Geen verbinding. Er is niets gewijzigd.'; });
  });

  $('invoer').addEventListener('submit', function (e) {
    e.preventDefault();
    var naam = $('iBedrijf').value.trim();
    doe('voer_in', { bod: { bedrijf: naam, contact: $('iContact').value, telefoon: $('iTelefoon').value, email: $('iEmail').value, bod: $('iBod').value, notitie: $('iNotitie').value } }).then(function (d) {
      if (!d) return;
      meld('goed', naam + ' staat in de stand op plek ' + d.uit.plek + (d.uit.verhoging ? ' (verhoging van het eerdere bod)' : '') + '.' + (d.uit.verlengd ? ' De veiling is verlengd.' : ''));
      $('invoer').reset();
    });
  });

  function momentForm(formId, veldId, actie) {
    $(formId).addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new Date($(veldId).value);
      if (isNaN(d.getTime())) { meld('eraf', 'Kies eerst een datum en een tijd.'); return; }
      doe(actie, { waarde: d.toISOString() }, 'Opgeslagen.');
    });
  }
  momentForm('sluitForm', 'sluitMoment', 'sluitmoment');
  momentForm('openForm', 'openMoment', 'openmoment');

  $('inlog').addEventListener('submit', function (e) {
    e.preventDefault();
    $('inlogFout').textContent = '';
    api('login', { wachtwoord: $('ww').value }).then(function (d) {
      if (!d.ok) { $('inlogFout').textContent = d.bericht || 'Inloggen is niet gelukt.'; return; }
      $('ww').value = '';
      return doe('overzicht');
    }).catch(function () { $('inlogFout').textContent = 'Geen verbinding met de server.'; });
  });
  $('uitloggen').addEventListener('click', function () { api('logout').then(function () { toonInlog(''); }); });

  // ---------- starten ----------
  api('overzicht').then(function (d) { if (d.ok) verwerk(d); else toonInlog(''); }).catch(function () { toonInlog('Geen verbinding met de server.'); });
  setInterval(tik, 1000);
  // Elke vijftien seconden kijken of er iets nieuws is, zolang je niet in een venster bezig bent.
  setInterval(function () {
    if (!O || document.hidden || $('corrigeer').open) return;
    var actief = document.activeElement;
    if (actief && actief.tagName === 'TEXTAREA') return;
    api('overzicht').then(function (d) { if (d.status === 401) toonInlog('Je sessie is verlopen. Log opnieuw in.'); else if (d.ok && d.overzicht) { O = d.overzicht; verschil = Date.parse(O.nu) - Date.now(); render(); } }).catch(function () {});
  }, 15000);
})();
