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
  for (const stuk of ['Eigen tafel € 1.500,- per tafel voor tien personen, inclusief btw', '€ 150,- per persoon', 'Losse tickets € 170,- per persoon, inclusief btw', 'Vanaf vier tickets per bestelling',
    'Tafel op de eerste rij € 2.000,- per tafel voor tien personen, inclusief btw', 'Zestien tafels', 'Op is op',
    'Bij alles inbegrepen: drinken tot 21.00 uur, eten, het programma en de garderobe.', `Van elke tafel gaat € 25,- naar ${INSTELLINGEN.DOEL}.`, '€ 1,- per ticket'])
    assert.ok(t.includes(stuk), 'op de homepage ontbreekt: ' + stuk);
  const s = plat(spelregels);
  for (const stuk of ['€ 1.500,-', '€ 170,-', '€ 2.000,-', 'Alle prijzen zijn inclusief btw', 'Annuleren kan niet', 'dan krijgt iedereen zijn geld terug'])
    assert.ok(s.includes(stuk), 'in de spelregels ontbreekt: ' + stuk);
  assert.ok(!/hele tafelgeld/i.test(t + s), 'nergens staat dat het hele tafelgeld naar het doel gaat');
});

test('de vaste regels staan erin', () => {
  const t = plat(home);
  for (const regel of ['Wij pruuve veur, heel Lampegat viert mee.', 'Tien aan tafel. De elfde viert thuis mee.', 'Carnaval begint op vrijdag. Wij smokkelen een dag.', 'Joël Borelli praat de avond aan elkaar en zingt hem uit.'])
    assert.ok(t.includes(regel), 'ontbreekt: ' + regel);
  assert.equal((home.match(/<svg class="pul"/g) || []).length, 11, 'het beeld van de elfde heeft tien pullen en een elfde');
  assert.ok(!/17\.11|18\.11/.test(t), 'de tijden 17.11 en 18.11 uur staan er niet in zolang ze niet bevestigd zijn');
});

test('de afgesproken veelgestelde vragen staan erin', () => {
  const vragen = [...home.matchAll(/<summary>(.*?)<\/summary>/g)].map((m) => m[1]);
  for (const vraag of ['Wat kost het per persoon?', 'Wat zit erin?', 'We zijn met minder dan tien. Wat dan?', 'Wie staat er op het podium?', 'Tot hoe laat duurt het?',
    `Wat is ${INSTELLINGEN.DOEL}?`, 'Gaat mijn tafelgeld ook naar het goede doel?', 'Hoe werkt het rondje van de zaak?', 'Kan ik annuleren, en krijg ik een factuur?',
    'Is dit hetzelfde als Roet Korte Put?', 'Wat als het niet doorgaat?'])
    assert.ok(vragen.includes(vraag), 'de vraag ontbreekt: ' + vraag);
});

test('de verkoop start op vrijdag 4 december 2026 om 11.11 uur', async () => {
  const js = bestanden.find(([p]) => p === 'home.js')[1];
  assert.match(js, /VERKOOP_START = '2026-12-04T11:11:00\+01:00'/);
  assert.equal(new Date('2026-12-04T11:11:00+01:00').toLocaleDateString('nl-NL', { weekday: 'long', timeZone: 'Europe/Amsterdam' }), 'vrijdag');
  const ics = bestanden.find(([p]) => p === 'agenda/verkoopstart.ics')[1];
  assert.match(ics, /DTSTART:20261204T101100Z/);
  assert.ok(plat(home).includes('De verkoop start op vrijdag 4 december 2026 om 11.11 uur'));
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
