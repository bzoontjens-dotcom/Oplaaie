// Tests voor de site zelf. Ze bouwen de site (bouw.mjs) en controleren het resultaat in _site:
// staan de afgesproken prijzen en regels erin, zijn de oude teksten weg en werken alle links.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bouw } from '../bouw.mjs';
import { INSTELLINGEN } from '../instellingen.mjs';

const UIT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const TEKST = new Set(['.html', '.js', '.css', '.ics', '.txt', '.xml']);
let bestanden = [];   // [pad binnen _site, inhoud]
let home = '', spelregels = '';

async function lees(map, basis = '') {
  for (const item of await readdir(map, { withFileTypes: true })) {
    const rel = path.posix.join(basis, item.name);
    if (item.isDirectory()) await lees(path.join(map, item.name), rel);
    else if (TEKST.has(path.extname(item.name))) bestanden.push([rel, await readFile(path.join(map, item.name), 'utf8')]);
  }
}
const bestaat = (rel) => stat(path.join(UIT, rel)).then((s) => s.isFile(), () => false);
// leesbare tekst: zonder opmaak, met gewone spaties
const plat = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

before(async () => {
  await bouw();
  await lees(UIT);
  home = bestanden.find(([p]) => p === 'index.html')[1];
  spelregels = bestanden.find(([p]) => p === 'spelregels.html')[1];
});

test('de naam van het goede doel is overal ingevuld', () => {
  for (const [pad, inhoud] of bestanden) assert.ok(!inhoud.includes('{{'), `in ${pad} staat nog een niet ingevulde instelling`);
  assert.ok(plat(home).includes(INSTELLINGEN.DOEL), 'de naam van het doel staat op de homepage');
  assert.ok(plat(spelregels).includes(INSTELLINGEN.DOEL), 'de naam van het doel staat in de spelregels');
});

test('de teksten van het vorige programma zijn weg', () => {
  const oud = [/\bHans\b/, /Oplaaie/i, /laaiklep/i, /bakwagen/i, /Muziekspeelplaats/i, /exclusief\s+(21%\s+)?btw/i, /staantafel voor acht/i, /bijkopen/i,
    /26(\s|&nbsp;)november/i, /veiling van de eerste rij/i, /onder de hamer/i, /winstoogmerk/i, /1\.600,-/, /2\.400,-/, /eerste-rij/, /\/beheer/, /dertig adressen/i];
  for (const [pad, inhoud] of bestanden) for (const patroon of oud) assert.ok(!patroon.test(inhoud), `in ${pad} staat nog ${patroon}`);
});

test('het aanbod en de prijzen kloppen, inclusief btw', () => {
  const t = plat(home);
  for (const stuk of ['Eigen tafel € 1.500,- per tafel voor tien personen, inclusief btw', '€ 150,- per persoon',
    'Tafel op de eerste rij € 2.000,- per tafel voor tien personen, inclusief btw', 'Zestien tafels', 'Op is op',
    'Bij alles inbegrepen: drinken tot 21.00 uur, eten, het programma en de garderobe. Na 21.00 uur zijn de drankjes voor eigen rekening.', `Van elke tafel gaat € 25,- naar ${INSTELLINGEN.DOEL}.`, '€ 1,- per ticket'])
    assert.ok(t.includes(stuk), 'op de homepage ontbreekt: ' + stuk);
  const s = plat(spelregels);
  for (const stuk of ['€ 1.500,-', '€ 2.000,-', 'Alle prijzen zijn inclusief btw', 'Annuleren kan niet', 'dan krijgt iedereen zijn geld terug'])
    assert.ok(s.includes(stuk), 'in de spelregels ontbreekt: ' + stuk);
  assert.ok(!/hele tafelgeld/i.test(t + s), 'nergens staat dat het hele tafelgeld naar het doel gaat');
});

test('de vaste regels staan erin', () => {
  const t = plat(home);
  for (const regel of ['Wij pruuve veur, heel Lampegat viert mee.', 'Tien aan tafel. De elfde viert thuis mee.', 'Carnaval begint op vrijdag. Wij smokkelen een dag.', 'Joël Borelli praat de avond aan elkaar en zingt hem uit.'])
    assert.ok(t.includes(regel), 'ontbreekt: ' + regel);
  const tafel = home.slice(home.indexOf('<div class="pullen">'), home.indexOf('<div class="blad">'));
  assert.equal((tafel.match(/<svg class="pul"/g) || []).length, 10, 'er staan tien pullen op tafel');
  assert.equal((home.match(/<svg class="pul vol"/g) || []).length, 1, 'en er is een elfde');
  assert.ok(!/17\.11|18\.11/.test(t), 'de tijden 17.11 en 18.11 uur staan er niet in zolang ze niet bevestigd zijn');
});

test('bij de start verkopen we alleen tafels', async () => {
  assert.equal(INSTELLINGEN.LOSSE_TICKETS, false, 'losse tickets staan uit tot er in januari 2027 over besloten is');
  for (const [pad, inhoud] of bestanden) {
    assert.ok(!/losse\s+tickets?/i.test(inhoud) && !/los\s+ticket/i.test(inhoud), `in ${pad} staan nog losse tickets`);
    assert.ok(!/gedeelde\s+tafel/i.test(inhoud), `in ${pad} staat nog een gedeelde tafel`);
    assert.ok(!/170,-/.test(inhoud), `in ${pad} staat nog de prijs van een los ticket`);
    assert.ok(!inhoud.includes('ALS:') && !inhoud.includes('EINDE:'), `in ${pad} staat nog een schakelregel van de bouwstap`);
  }
  assert.equal((home.match(/<div class="card[ "]/g) || []).length, 2, 'er staan twee prijskaarten: de eigen tafel en de eerste rij');
  // De kaart staat klaar in de bron, zodat hij in één keer terug kan.
  const bron = await readFile(path.join(UIT, '..', 'site', 'index.html'), 'utf8');
  assert.match(bron, /<!-- ALS:LOSSE_TICKETS -->[\s\S]*Losse tickets[\s\S]*<!-- EINDE:LOSSE_TICKETS -->/);
});

test('minder of meer dan tien: overal dezelfde tekst, en na 21.00 uur drankjes voor eigen rekening', () => {
  const vast = 'Een tafel is altijd voor tien. Met minder dan tien deel je een tafel met een ander bedrijf, of neem je klanten en relaties mee. Met meer dan tien neem je een tweede tafel.';
  assert.ok(plat(home).split(vast).length - 1 >= 3, 'de vaste tekst staat in de korte spelregels en bij beide vragen');
  assert.ok(plat(spelregels).includes(vast), 'de vaste tekst staat in de spelregels');
  for (const [naam, tekst] of [['de homepage', plat(home)], ['de spelregels', plat(spelregels)]])
    for (const stuk of tekst.split(/drinken tot 21\.00 uur/i).slice(1))
      assert.ok(stuk.slice(0, 160).includes('Na 21.00 uur zijn de drankjes voor eigen rekening.'), `op ${naam} ontbreekt de zin over de drankjes na 21.00 uur bij: drinken tot 21.00 uur${stuk.slice(0, 60)}`);
});

test('de speelse onderdelen staan erin, en werken ook zonder script', () => {
  // De elfde inschenken: de knop staat verborgen in de pagina en wordt door het script getoond.
  // Zonder script is de uitkomst dus gewoon te lezen.
  assert.match(home, /<div class="elfde-actie" hidden>[\s\S]*?<button[^>]*id="schenk"[^>]*>Schenk de elfde in<\/button>/);
  const uitkomst = plat(home.slice(home.indexOf('id="elfdeUitkomst"'), home.indexOf('</section>', home.indexOf('id="elfdeUitkomst"'))));
  assert.ok(uitkomst.includes(`Dat doet jouw tafel. Van elke tafel gaat € 25,- naar ${INSTELLINGEN.DOEL}.`), 'de uitkomst van de elfde staat in de pagina');
  assert.ok(uitkomst.includes('Zet je tafel neer'));
  // De medaille is een knop, de pul bij de tijden en de aftelling staan klaar.
  assert.match(home, /<button class="medaille" id="medaille" type="button" aria-label="[^"]*confetti[^"]*">/);
  assert.match(home, /<li class="meeloper" aria-hidden="true">/);
  assert.match(home, /<div class="aftel" id="aftel" hidden aria-hidden="true">/);
  for (const [naam, pad] of [['het blok', 'programma-2027/blok.js'], ['de confetti', 'site.js']])
    assert.match(bestanden.find(([p]) => p === pad)[1], /prefers-reduced-motion/, `${naam} houdt rekening met wie animaties uit heeft staan`);
});

test('de afgesproken veelgestelde vragen staan erin', () => {
  const vragen = [...home.matchAll(/<summary>(.*?)<\/summary>/g)].map((m) => m[1]);
  for (const vraag of ['Wat kost het per persoon?', 'Wat zit erin?', 'We zijn met minder dan tien. Wat dan?', 'Wie staat er op het podium?', 'Tot hoe laat duurt het?',
    `Wat is ${INSTELLINGEN.DOEL}?`, 'Gaat mijn tafelgeld ook naar het goede doel?', 'Hoe werkt het rondje van de zaak?', 'Kan ik annuleren, en krijg ik een factuur?',
    'Is dit hetzelfde als Roet Korte Put?', 'Wat als het niet doorgaat?'])
    assert.ok(vragen.includes(vraag), 'de vraag ontbreekt: ' + vraag);
});

test('de verkoop start op dinsdag 1 december 2026 om 11.11 uur', async () => {
  const js = bestanden.find(([p]) => p === 'home.js')[1];
  assert.match(js, /VERKOOP_START = '2026-12-01T11:11:00\+01:00'/);
  assert.equal(new Date('2026-12-01T11:11:00+01:00').toLocaleDateString('nl-NL', { weekday: 'long', timeZone: 'Europe/Amsterdam' }), 'dinsdag');
  const ics = bestanden.find(([p]) => p === 'agenda/verkoopstart.ics')[1];
  assert.match(ics, /DTSTART:20261201T101100Z/);
  assert.ok(plat(home).includes('De verkoop start op dinsdag 1 december 2026 om 11.11 uur'));
  for (const [pad, inhoud] of bestanden) assert.ok(!/4(\s|&nbsp;)december/.test(inhoud) && !/vrijdag 4/.test(inhoud), `in ${pad} staat nog de oude startdatum`);
});

test('alle links en plaatjes op de pagina\'s bestaan', async () => {
  const doorverwijzingen = new Set(['/', '/spelregels', '/bedankt']);   // Netlify toont spelregels.html ook als /spelregels
  for (const [pad, metOpmerkingen] of bestanden.filter(([p]) => p.endsWith('.html'))) {
    const inhoud = metOpmerkingen.replace(/<!--[\s\S]*?-->/g, '');   // wat in een opmerking staat, is nog niet in gebruik
    const ids = new Set([...inhoud.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, soort, doel] of inhoud.matchAll(/\s(href|src|action)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(doel)) continue;
      const [route, anker] = doel.split('#');
      if (route === '' ) { assert.ok(ids.has(anker), `${pad}: het anker #${anker} bestaat niet`); continue; }
      if (doorverwijzingen.has(route)) {
        if (anker && route === '/') assert.ok(new RegExp(`\\sid="${anker}"`).test(home), `${pad}: het anker /#${anker} bestaat niet op de homepage`);
        if (anker && route === '/spelregels') assert.ok(new RegExp(`\\sid="${anker}"`).test(spelregels), `${pad}: het anker ${doel} bestaat niet`);
        continue;
      }
      assert.ok(await bestaat(route.replace(/^\//, '')), `${pad}: ${soort} ${doel} bestaat niet`);
    }
  }
  for (const [pad, inhoud] of bestanden.filter(([p]) => p.endsWith('.css')))
    for (const [, doel] of inhoud.matchAll(/url\((\/[^)]+)\)/g)) assert.ok(await bestaat(doel.replace(/^\//, '')), `${pad}: ${doel} bestaat niet`);
});

test('de formulieren lopen via Netlify Forms', () => {
  assert.match(home, /<form[^>]*name="contact"[^>]*data-netlify="true"/);
  assert.match(home, /<form[^>]*name="verkoopstart"[^>]*data-netlify="true"/);
  assert.ok(plat(home).includes('info@veurpruuve.nl'));
});
