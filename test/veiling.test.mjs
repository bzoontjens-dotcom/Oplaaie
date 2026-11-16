// De testgevallen uit de opdracht, nagespeeld tegen een echte (tijdelijke) database.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startDatabase, bod } from './hulp.mjs';
import {
  plaatsBod, bevestig, wijsAf, trekIn, corrigeer, voerIn, veilingActie, stand, overzicht, exportCsv, VeilingFout,
} from '../veiling/kern.mjs';

let omgeving, pool;
before(async () => { omgeving = await startDatabase(); pool = omgeving.pool; });
after(async () => { await omgeving.stop(); });

async function opnieuw() {
  await pool.query('TRUNCATE biedingen, logboek, meldingen, pogingen RESTART IDENTITY CASCADE');
  await pool.query('UPDATE veiling SET opent_op = NULL, sluit_op = NULL, verlengd = FALSE, eindstand_vast = FALSE');
  // De veiling open zetten: geopend sinds een uur, sluit over een dag.
  await veilingActie(pool, 'openmoment', new Date(Date.now() - 3600e3).toISOString());
  await veilingActie(pool, 'sluitmoment', new Date(Date.now() + 86400e3).toISOString());
}
const fout = (code) => (e) => e instanceof VeilingFout && e.code === code;
const bevestigdBod = async (naam, bedrag) => { const u = await plaatsBod(pool, bod(naam, bedrag)); await bevestig(pool, u.id); return u; };

test('een bod onder het minimum of niet in stappen van € 100,- wordt geweigerd', async () => {
  await opnieuw();
  await assert.rejects(plaatsBod(pool, bod('Laag', 2300)), fout('onder_bodem'));
  await assert.rejects(plaatsBod(pool, bod('Scheef', 2450)), fout('geen_stap'));
  await assert.rejects(plaatsBod(pool, bod('Geen akkoord', 2500, { akkoord: false })), fout('akkoord'));
  await assert.rejects(plaatsBod(pool, bod('Geen mail', 2500, { email: 'geen-adres' })), fout('email'));
  const tekst = await plaatsBod(pool, bod('Scheef', 2450)).catch((e) => e.message);
  assert.match(tekst, /stappen van € 100,-.*€ 2\.500,-/);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM biedingen')).rows[0].n, 0);
});

test('een nieuw bod staat pas in de stand na bevestiging', async () => {
  await opnieuw();
  for (const [naam, bedrag] of [['Een', 2400], ['Twee', 2500], ['Drie', 2600], ['Vier', 2700]]) await bevestigdBod(naam, bedrag);
  const nieuw = await plaatsBod(pool, bod('Vijf', 3000));
  let s = (await stand(pool)).stand;
  assert.equal(s.zichtbaar, false, 'onder de drempel van vijf blijft de plattegrond dicht');
  assert.deepEqual(s.rij, []);
  assert.equal(s.binnen, 5);
  assert.equal(s.wacht, 1);
  assert.ok(!JSON.stringify(s).includes('Vijf'), 'een bod dat wacht staat nergens in de openbare gegevens');
  await bevestig(pool, nieuw.id);
  s = (await stand(pool)).stand;
  assert.equal(s.zichtbaar, true);
  assert.equal(s.rij[0].bedrijf, 'Vijf');
  assert.equal(s.fec, 600 + 300 + 200 + 100);
});

test('twee biedingen op hetzelfde moment komen allebei goed binnen', async () => {
  await opnieuw();
  // Veertig bedrijven bieden tegelijk, in de laatste minuten van de veiling.
  await veilingActie(pool, 'sluitmoment', new Date(Date.now() + 2 * 60e3).toISOString());
  const namen = Array.from({ length: 40 }, (_, i) => 'Gelijktijdig ' + (i + 1));
  const uit = await Promise.all(namen.map((n, i) => plaatsBod(pool, bod(n, 2600), { ipHash: 'bezoeker-' + i })));
  assert.equal(new Set(uit.map((u) => u.id)).size, 40, 'elk bod heeft een eigen nummer');
  const rijen = (await pool.query('SELECT id, bedrijf, ingediend_op FROM biedingen ORDER BY id')).rows;
  assert.equal(rijen.length, 40, 'er is geen bod verloren gegaan');
  assert.equal(new Set(rijen.map((r) => r.bedrijf)).size, 40, 'er is geen bod overschreven');
  for (let i = 1; i < rijen.length; i++) assert.ok(rijen[i].ingediend_op > rijen[i - 1].ingediend_op, 'de volgorde van binnenkomst ligt vast');
  // Elk laat bod schuift de sluiting op naar vijf minuten na dat bod. Na veertig late biedingen sluit de veiling dus vijf minuten na het laatste.
  assert.ok(uit.every((u) => u.verlengd));
  const sluit = new Date((await stand(pool)).stand.sluit).getTime();
  const laatste = rijen[rijen.length - 1].ingediend_op.getTime();
  assert.equal(sluit, laatste + 5 * 60e3, 'de veiling sluit vijf minuten na het laatste bod');
  assert.equal((await pool.query(`SELECT count(*)::int AS n FROM logboek WHERE soort = 'bod_ingediend'`)).rows[0].n, 40);
  // En tegelijk bevestigen op de beheerpagina loopt ook niet door elkaar.
  await Promise.all(uit.map((u) => bevestig(pool, u.id)));
  const s = (await stand(pool)).stand;
  assert.deepEqual(s.rij.map((r) => r.bedrijf), rijen.slice(0, 16).map((r) => r.bedrijf), 'bij gelijke biedingen staan de eerste zestien bieders vooraan, in volgorde van binnenkomst');
});

test('bij een gelijk bod staat de eerste bieder bovenaan', async () => {
  await opnieuw();
  const eerste = await plaatsBod(pool, bod('Eerst', 3000));
  const tweede = await plaatsBod(pool, bod('Daarna', 3000));
  await bevestig(pool, tweede.id); // de tweede wordt het eerst bevestigd, dat mag niets uitmaken
  await bevestig(pool, eerste.id);
  for (const n of ['A', 'B', 'C']) await bevestigdBod('Vuller ' + n, 2400);
  const s = (await stand(pool)).stand;
  assert.deepEqual(s.rij.slice(0, 2).map((r) => r.bedrijf), ['Eerst', 'Daarna']);
});

test('het zeventiende bod rijdt het laagste eraf en de beheerpagina meldt wie we moeten bellen', async () => {
  await opnieuw();
  for (let i = 1; i <= 16; i++) await bevestigdBod('Bedrijf ' + i, 2400 + i * 100); // 2500 t/m 4000
  await assert.rejects(plaatsBod(pool, bod('Te laag', 2500)), fout('onder_minimum'));
  const tekst = await plaatsBod(pool, bod('Te laag', 2500)).catch((e) => e.message);
  assert.match(tekst, /minimaal € 2\.600,-/);
  const zeventien = await plaatsBod(pool, bod('Nieuwkomer', 2600));
  await bevestig(pool, zeventien.id);
  const s = (await stand(pool)).stand;
  assert.equal(s.rij.length, 16);
  assert.equal(s.rij[15].bedrijf, 'Nieuwkomer');
  assert.deepEqual(s.buiten.map((b) => b.bedrijf), ['Bedrijf 1']);
  assert.equal(s.instap, 2700);
  const o = await overzicht(pool);
  const eraf = o.meldingen.filter((m) => m.soort === 'eraf');
  assert.equal(eraf.length, 1);
  assert.equal(o.meldingen[0], eraf[0], 'wie van de eerste rij af is staat bovenaan de bellijst');
  assert.equal(eraf[0].bedrijf, 'Bedrijf 1');
  assert.equal(eraf[0].telefoon, '040 123 45 67');
  assert.equal(eraf[0].terugOpRij, 2700);
  assert.equal(o.meldingen.filter((m) => m.soort === 'opgeschoven').length, 14, 'wie een plek is opgeschoven staat er ook, lager op de lijst');
  // Biedt het bedrijf zelf opnieuw, dan verdwijnt het vanzelf van de bellijst.
  const terug = await plaatsBod(pool, bod('Bedrijf 1', 2700));
  await bevestig(pool, terug.id);
  const o2 = await overzicht(pool);
  assert.ok(!o2.meldingen.some((m) => m.bedrijf === 'Bedrijf 1'));
  assert.ok(o2.meldingen.some((m) => m.bedrijf === 'Nieuwkomer' && m.soort === 'eraf'));
});

test('één bod per bedrijf: verhogen kan, verlagen alleen via de beheerpagina', async () => {
  await opnieuw();
  await bevestigdBod('Bravo B.V.', 3000);
  await assert.rejects(plaatsBod(pool, bod('bravo bv', 3000)), fout('niet_hoger'));
  await assert.rejects(plaatsBod(pool, bod('Bravo', 2800)), fout('niet_hoger'));
  const hoger = await plaatsBod(pool, bod('Bravo', 3200));
  assert.equal(hoger.verhoging, true);
  await bevestig(pool, hoger.id);
  const rijen = (await pool.query(`SELECT status, bedrag FROM biedingen ORDER BY id`)).rows;
  assert.deepEqual(rijen.map((r) => r.status + ' ' + r.bedrag), ['vervangen 3000', 'bevestigd 3200']);
  await corrigeer(pool, hoger.id, { bod: 2600, reden: 'afgesproken aan de telefoon' });
  assert.equal((await pool.query(`SELECT bedrag FROM biedingen WHERE status = 'bevestigd'`)).rows[0].bedrag, 2600);
  const log = (await pool.query(`SELECT details FROM logboek WHERE soort = 'gecorrigeerd'`)).rows[0].details;
  assert.equal(log.was.bedrag, 3200);
});

test('een bod in de laatste vijf minuten verlengt de klok, na sluiting kan niemand meer bieden', async () => {
  await opnieuw();
  await veilingActie(pool, 'sluitmoment', new Date(Date.now() + 2 * 60e3).toISOString());
  const voor = new Date((await stand(pool)).stand.sluit).getTime();
  const laat = await plaatsBod(pool, bod('Laatkomer', 2500));
  assert.equal(laat.verlengd, true);
  const na = new Date((await stand(pool)).stand.sluit).getTime();
  assert.ok(na - Date.now() > 4.9 * 60e3 && na - Date.now() <= 5 * 60e3 + 1000, 'de veiling loopt nu nog vijf minuten');
  assert.ok(na > voor);
  // Een bod ruim voor het einde verlengt niet.
  await veilingActie(pool, 'sluitmoment', new Date(Date.now() + 3600e3).toISOString());
  assert.equal((await plaatsBod(pool, bod('Op tijd', 2500))).verlengd, false);
  // Sluiten.
  await veilingActie(pool, 'nu_sluiten');
  await assert.rejects(plaatsBod(pool, bod('Te laat', 5000)), fout('gesloten'));
  await assert.rejects(veilingActie(pool, 'eindstand_vast'), fout('wacht'));
});

test('voor de opening kan niemand bieden', async () => {
  await opnieuw();
  await veilingActie(pool, 'spelregels');
  const e = await plaatsBod(pool, bod('Te vroeg', 2500)).catch((x) => x);
  assert.ok(fout('nog_niet_open')(e));
  assert.match(e.message, /donderdag 26 november 2026 om 11\.11 uur/);
});

test('de openbare stand bevat geen contactgegevens', async () => {
  await opnieuw();
  for (let i = 1; i <= 18; i++) await bevestigdBod('Zaak ' + i, 2400 + i * 100);
  await plaatsBod(pool, bod('Wachtend Bedrijf', 9000, { contact: 'Geheime Naam', email: 'geheim@voorbeeld.nl', telefoon: '06 99 88 77 66' }));
  const tekst = JSON.stringify((await stand(pool)).stand);
  for (const verboden of ['Test Persoon', '@voorbeeld.nl', '040 123', 'Geheime', '06 99', 'Wachtend', 'contact', 'email', 'telefoon', 'ip_hash']) {
    assert.ok(!tekst.includes(verboden), 'de stand mag dit niet bevatten: ' + verboden);
  }
  const sleutels = new Set(JSON.parse(tekst).rij.flatMap((r) => Object.keys(r)));
  assert.deepEqual([...sleutels].sort(), ['bedrag', 'bedrijf', 'plek']);
});

test('een telefonisch bod invoeren, afwijzen, intrekken en exporteren', async () => {
  await opnieuw();
  const tel = await voerIn(pool, { bedrijf: 'Bellers BV', contact: 'Jan Beller', telefoon: '', email: '', bod: 3500 });
  assert.equal(tel.plek, 1);
  const weg = await plaatsBod(pool, bod('Afwijzen', 2500));
  await wijsAf(pool, weg.id, 'niet bereikbaar');
  const in1 = await bevestigdBod('Intrekken', 2600);
  await trekIn(pool, in1.id, 'op verzoek');
  await bevestigdBod('=cmd() Gevaarlijk', 2400);
  const csv = await exportCsv(pool);
  const regels = csv.trim().split('\r\n');
  assert.match(regels[0], /Plek";"Status";"Bedrijf".*"Tafeldeel";"Deel voor de FEC"/);
  assert.match(regels[1], /^"1";"bevestigd";"Bellers BV";"Jan Beller";"";"";"3500";"2400";"1100";"4235"/);
  assert.ok(csv.includes(`"'=cmd() Gevaarlijk"`), 'een naam die op een formule lijkt wordt onschadelijk gemaakt');
  assert.ok(csv.includes('"afgewezen";"Afwijzen"') && csv.includes('"ingetrokken";"Intrekken"'));
  const o = await overzicht(pool);
  assert.equal(o.fec, 1100);
});

test('te veel biedingen van dezelfde bezoeker worden afgeremd', async () => {
  await opnieuw();
  // per e-mailadres: vijf per uur
  for (let i = 0; i < 5; i++) await plaatsBod(pool, bod('Veelbieder ' + i, 2500, { email: 'zelfde@voorbeeld.nl' }), { ipHash: 'bezoeker-' + i });
  await assert.rejects(plaatsBod(pool, bod('Veelbieder 6', 2500, { email: 'zelfde@voorbeeld.nl' }), { ipHash: 'bezoeker-6' }), fout('te_vaak'));
  // per internetaansluiting: twintig per uur
  for (let i = 0; i < 20; i++) await plaatsBod(pool, bod('Kantoorgenoot ' + i, 2500), { ipHash: 'kantoor' });
  await assert.rejects(plaatsBod(pool, bod('Kantoorgenoot 21', 2500), { ipHash: 'kantoor' }), fout('te_vaak'));
  await plaatsBod(pool, bod('Iemand anders', 2500), { ipHash: 'ander' });
});
