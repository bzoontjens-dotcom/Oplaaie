// Het hart van de veiling. Alles wat hier gebeurt, gebeurt op de server en
// met de klok van de database. De browser beslist nergens over.
//
// Elke wijziging zet eerst de ene regel in de tabel 'veiling' op slot. Daardoor
// worden biedingen één voor één verwerkt, ook als ze in dezelfde seconde
// binnenkomen. Er kan dus niets verloren gaan of door elkaar lopen.

import { SPELREGELS as R, STAND_BEWAAR_SECONDEN } from './spelregels.mjs';

export class VeilingFout extends Error {
  constructor(code, bericht, veld = '', status = 400) {
    super(bericht);
    this.code = code;
    this.veld = veld;
    this.status = status;
  }
}

// ---------- kleine hulpjes ----------

export function euro(n) {
  return '€ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',-';
}

const DATUM = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const TIJD = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const KORT = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

// "dinsdag 15 december 2026 om 11.11 uur"
export function datumTekst(d) {
  return DATUM.format(d) + ' om ' + TIJD.format(d).replace(':', '.') + ' uur';
}
function datumKort(d) {
  return d ? KORT.format(d).replace(',', '') : '';
}

// Twee schrijfwijzen van dezelfde bedrijfsnaam moeten als één bedrijf tellen:
// "Bravo B.V.", "bravo bv" en "Bravo" geven dezelfde sleutel.
export function bedrijfSleutel(naam) {
  const kaal = String(naam).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' en ');
  const zonderVorm = kaal.replace(/\b(b\.?\s?v\.?|n\.?\s?v\.?|v\.?\s?o\.?\s?f\.?)(?![a-z0-9])/g, ' ').replace(/[^a-z0-9]+/g, '');
  return zonderVorm || kaal.replace(/[^a-z0-9]+/g, '');
}

export function bonnummer(id) {
  return '2027-' + String(id).padStart(4, '0');
}

function netjes(waarde, max) {
  return String(waarde ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Leest een bedrag zoals mensen het typen: 2500, 2.500, € 2.500,- of 2500,00.
export function leesBedrag(waarde) {
  if (typeof waarde === 'number') return Number.isInteger(waarde) ? waarde : NaN;
  const t = String(waarde ?? '').replace(/[€\s]/g, '');
  const m = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(?:-|00))?$/.exec(t);
  return m ? parseInt(m[1].replace(/\./g, ''), 10) : NaN;
}

// Controleert wat iemand heeft ingevuld. 'beheer' is waar als het bod op de
// beheerpagina wordt ingevoerd: dan mogen e-mailadres en telefoon leeg blijven.
export function leesInvoer(invoer, { beheer = false } = {}) {
  const bedrijf = netjes(invoer.bedrijf, 60);
  const contact = netjes(invoer.contact, 80);
  const email = netjes(invoer.email, 120).toLowerCase();
  const telefoon = netjes(invoer.telefoon, 30);
  const bedrag = leesBedrag(invoer.bod ?? invoer.bedrag);

  if (bedrijf.length < 2 || bedrijf.length > 40) throw new VeilingFout('bedrijf', 'Vul je bedrijfsnaam in, die komt op je tafel te staan. Maximaal veertig tekens.', 'bedrijf');
  if (!bedrijfSleutel(bedrijf)) throw new VeilingFout('bedrijf', 'Vul een bedrijfsnaam in met letters of cijfers.', 'bedrijf');
  if (contact.length < 2 || contact.length > 60) throw new VeilingFout('contact', 'Vul de naam van de contactpersoon in.', 'contact');
  if (email || !beheer) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || email.length > 100) throw new VeilingFout('email', 'Vul een geldig e-mailadres in.', 'email');
  }
  if (telefoon || !beheer) {
    const cijfers = telefoon.replace(/\D/g, '');
    if (!/^[\d\s()+-]+$/.test(telefoon) || cijfers.length < 8 || cijfers.length > 15) throw new VeilingFout('telefoon', 'Vul een telefoonnummer in waarop we je kunnen bereiken.', 'telefoon');
  }
  if (!Number.isFinite(bedrag)) throw new VeilingFout('bedrag', 'Vul een bod in als heel bedrag in euro, bijvoorbeeld 2.600.', 'bod');
  controleerBedrag(bedrag);
  if (!beheer && invoer.akkoord !== true) throw new VeilingFout('akkoord', 'Vink aan dat je akkoord gaat met de voorwaarden. Een bod is bindend.', 'akkoord');
  return { bedrijf, contact, email, telefoon, bedrag };
}

function controleerBedrag(bedrag) {
  if (bedrag < R.bodem) throw new VeilingFout('onder_bodem', `Bieden kan vanaf ${euro(R.bodem)}. Een lager bod nemen we niet aan.`, 'bod');
  if (bedrag % R.stap !== 0) throw new VeilingFout('geen_stap', `Bieden gaat in stappen van ${euro(R.stap)}. Maak er bijvoorbeeld ${euro(Math.ceil(bedrag / R.stap) * R.stap)} van.`, 'bod');
  if (bedrag > R.maxBod) throw new VeilingFout('te_hoog', `Een bod boven ${euro(R.maxBod)} nemen we niet via de site aan. Mail naar info@oplaaie.nl, dan bellen we je.`, 'bod');
}

// ---------- de klok ----------

export function tijden(v) {
  return {
    opent: v.opent_op ? new Date(v.opent_op) : new Date(R.opent),
    sluit: v.sluit_op ? new Date(v.sluit_op) : new Date(R.sluit),
  };
}

// 'voor' = nog niet open, 'open' = er kan geboden worden, 'gesloten' = de hamer is gevallen
export function fase(nu, v) {
  const { opent, sluit } = tijden(v);
  if (nu >= sluit) return 'gesloten';
  if (nu < opent) return 'voor';
  return 'open';
}

// ---------- database ----------

async function metSlot(pool, werk) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const v = (await client.query('SELECT * FROM veiling WHERE id = 1 FOR UPDATE')).rows[0];
    if (!v) throw new Error('De tabel veiling is leeg. Is de database goed aangemaakt?');
    const nu = new Date((await client.query('SELECT clock_timestamp() AS nu')).rows[0].nu);
    const uit = await werk(client, v, nu);
    const versie = Number((await client.query('UPDATE veiling SET versie = versie + 1 WHERE id = 1 RETURNING versie')).rows[0].versie);
    await client.query('COMMIT');
    return uit && typeof uit === 'object' ? { ...uit, versie } : uit;
  } catch (fout) {
    try { await client.query('ROLLBACK'); } catch { /* de verbinding is al weg */ }
    if (fout && fout.code === '23505' && String(fout.constraint || '').includes('een_per_bedrijf')) {
      throw new VeilingFout('dubbel', 'Er staat al een bevestigd bod van een bedrijf met deze naam in de stand. Kies bij het bevestigen dat dit een verhoging is, of pas de bedrijfsnaam aan.');
    }
    throw fout;
  } finally {
    client.release();
  }
}

async function log(client, nu, soort, bodId, details = {}) {
  await client.query('INSERT INTO logboek (op, soort, bod_id, details) VALUES ($1, $2, $3, $4)', [nu, soort, bodId, JSON.stringify(details)]);
}

// De stand: alle bevestigde biedingen, hoogste eerst. Bij een gelijk bod gaat voor wie het eerst bood.
async function rangorde(db) {
  const { rows } = await db.query(
    `SELECT id, bedrijf, bedrijf_sleutel, contact, email, telefoon, bedrag, ingediend_op, beslist_op, bron, vervangt
       FROM biedingen WHERE status = 'bevestigd'
      ORDER BY bedrag DESC, ingediend_op ASC, id ASC`);
  return rows.map((b) => ({ ...b, id: Number(b.id) }));
}

// Wat moet je minimaal bieden. 'anderen' is de stand zonder het eigen bod van de bieder.
function minimumBod(anderen, eigen) {
  const instap = anderen.length >= R.plekken ? anderen[R.plekken - 1].bedrag + R.stap : R.bodem;
  return Math.max(instap, eigen ? eigen.bedrag + R.stap : R.bodem);
}

async function haalBod(client, id) {
  const { rows } = await client.query('SELECT * FROM biedingen WHERE id = $1 FOR UPDATE', [id]);
  if (!rows[0]) throw new VeilingFout('onbekend', 'Dit bod bestaat niet (meer). Ververs de pagina.', '', 404);
  return { ...rows[0], id: Number(rows[0].id) };
}

// Kijkt wie er door een wijziging een slechtere plek heeft gekregen en zet
// die mensen op de bellijst van de beheerpagina.
async function verwerkVerschuivingen(client, nu, voor, na, { veroorzaker = null, vervangenId = null } = {}) {
  const plekNa = new Map(na.map((b, i) => [b.id, i + 1]));
  for (let i = 0; i < voor.length; i++) {
    const b = voor[i];
    const van = i + 1;
    const naar = plekNa.get(b.id);
    if (b.id === veroorzaker || b.id === vervangenId || !naar) continue;
    if (naar > van && van <= R.plekken) {
      const soort = naar > R.plekken ? 'eraf' : 'opgeschoven';
      const open = (await client.query('SELECT id, van_plek FROM meldingen WHERE bod_id = $1 AND afgehandeld_op IS NULL', [b.id])).rows[0];
      if (open) await client.query('UPDATE meldingen SET soort = $1, naar_plek = $2, bijgewerkt_op = $3 WHERE id = $4', [soort, naar, nu, open.id]);
      else await client.query('INSERT INTO meldingen (bod_id, soort, van_plek, naar_plek, aangemaakt_op, bijgewerkt_op) VALUES ($1, $2, $3, $4, $5, $5)', [b.id, soort, van, naar, nu]);
    }
  }
  // Openstaande meldingen die niet meer kloppen ruimen we vanzelf op.
  const open = (await client.query(
    `SELECT m.id, m.bod_id, m.van_plek, m.naar_plek, b.status FROM meldingen m JOIN biedingen b ON b.id = m.bod_id WHERE m.afgehandeld_op IS NULL`)).rows;
  for (const m of open) {
    const plek = plekNa.get(Number(m.bod_id));
    let hoe = '';
    if (m.status === 'vervangen') hoe = 'heeft zelf opnieuw geboden';
    else if (m.status !== 'bevestigd') hoe = 'het bod is vervallen';
    else if (plek <= m.van_plek) hoe = 'staat weer op de oude plek';
    if (hoe) await client.query('UPDATE meldingen SET afgehandeld_op = $1, afgehandeld_hoe = $2 WHERE id = $3', [nu, hoe, m.id]);
    else if (plek !== m.naar_plek) await client.query('UPDATE meldingen SET naar_plek = $1, soort = $2, bijgewerkt_op = $3 WHERE id = $4', [plek, plek > R.plekken ? 'eraf' : 'opgeschoven', nu, m.id]);
  }
}

// Een bod in de laatste minuten verlengt de veiling.
async function verlengAlsLaat(client, v, nu, bodId) {
  if (fase(nu, v) !== 'open') return false;
  const venster = R.verlengMinuten * 60 * 1000;
  const { sluit } = tijden(v);
  if (sluit.getTime() - nu.getTime() >= venster) return false;
  const nieuw = new Date(nu.getTime() + venster);
  await client.query('UPDATE veiling SET sluit_op = $1, verlengd = TRUE WHERE id = 1', [nieuw]);
  v.sluit_op = nieuw;
  v.verlengd = true;
  await log(client, nu, 'verlengd', bodId, { was: sluit.toISOString(), wordt: nieuw.toISOString() });
  return true;
}

// ---------- bieden via de site ----------

export async function plaatsBod(pool, invoer, { ipHash = '' } = {}) {
  const bod = leesInvoer(invoer);
  const sleutel = bedrijfSleutel(bod.bedrijf);
  return metSlot(pool, async (client, v, nu) => {
    const f = fase(nu, v);
    const { opent } = tijden(v);
    if (f === 'voor') throw new VeilingFout('nog_niet_open', `De veiling opent op ${datumTekst(opent)}. Tot dan kun je nog niet bieden.`, '', 409);
    if (f === 'gesloten') throw new VeilingFout('gesloten', 'De veiling is gesloten. Bieden kan niet meer.', '', 409);

    const sinds = new Date(nu.getTime() - 3600 * 1000);
    const perAansluiting = ipHash ? (await client.query(
      `SELECT count(*)::int AS n FROM biedingen WHERE bron = 'site' AND ingediend_op > $1 AND ip_hash = $2`, [sinds, ipHash])).rows[0].n : 0;
    const perEmail = (await client.query(
      `SELECT count(*)::int AS n FROM biedingen WHERE bron = 'site' AND ingediend_op > $1 AND lower(email) = $2`, [sinds, bod.email])).rows[0].n;
    if (perAansluiting >= R.maxBiedingenPerUurPerAansluiting || perEmail >= R.maxBiedingenPerUurPerEmail) {
      throw new VeilingFout('te_vaak', 'Je hebt het afgelopen uur al een paar keer geboden. Probeer het later opnieuw of mail naar info@oplaaie.nl.', '', 429);
    }

    const stand = await rangorde(client);
    const eigen = stand.find((b) => b.bedrijf_sleutel === sleutel || (b.email && b.email.toLowerCase() === bod.email)) || null;
    const anderen = stand.filter((b) => b !== eigen);
    const minimum = minimumBod(anderen, eigen);
    if (bod.bedrag < minimum) {
      if (eigen && eigen.bedrag + R.stap >= minimum) throw new VeilingFout('niet_hoger', `Je bod moet hoger zijn dan je vorige bod van ${euro(eigen.bedrag)}. Bied minimaal ${euro(minimum)}.`, 'bod');
      throw new VeilingFout('onder_minimum', `De eerste rij is vol. Bied minimaal ${euro(minimum)} om erbij te komen.`, 'bod');
    }

    const { rows } = await client.query(
      `INSERT INTO biedingen (bedrijf, bedrijf_sleutel, contact, email, telefoon, bedrag, status, bron, ingediend_op, ip_hash)
       VALUES ($1, $2, $3, $4, $5, $6, 'wacht', 'site', $7, $8) RETURNING id`,
      [bod.bedrijf, sleutel, bod.contact, bod.email, bod.telefoon, bod.bedrag, nu, ipHash]);
    const id = Number(rows[0].id);
    await log(client, nu, 'bod_ingediend', id, { bedrijf: bod.bedrijf, bedrag: bod.bedrag });
    const verlengd = await verlengAlsLaat(client, v, nu, id);
    return {
      id, bonnummer: bonnummer(id), bedrijf: bod.bedrijf, contact: bod.contact, email: bod.email, telefoon: bod.telefoon,
      bedrag: bod.bedrag, verhoging: Boolean(eigen), verlengd, sluit: tijden(v).sluit.toISOString(), nu: nu.toISOString(),
    };
  });
}

// ---------- de beheerpagina ----------

async function bevestigIntern(client, nu, bod, vervangtId) {
  const voor = await rangorde(client);
  let oud = null;
  if (vervangtId) {
    oud = voor.find((b) => b.id === Number(vervangtId)) || null;
    if (!oud) throw new VeilingFout('onbekend', 'Het bod dat je wilt vervangen staat niet meer in de stand. Ververs de pagina.');
  } else {
    oud = voor.find((b) => b.bedrijf_sleutel === bod.bedrijf_sleutel) || null;
  }
  if (oud) {
    if (bod.bedrag <= oud.bedrag) throw new VeilingFout('niet_hoger', `${oud.bedrijf} staat al in de stand met ${euro(oud.bedrag)}. Dit bod van ${euro(bod.bedrag)} is niet hoger. Verlagen kan alleen met Corrigeren.`);
    await client.query(`UPDATE biedingen SET status = 'vervangen', beslist_op = $1 WHERE id = $2`, [nu, oud.id]);
  }
  await client.query(`UPDATE biedingen SET status = 'bevestigd', beslist_op = $1, vervangt = $2 WHERE id = $3`, [nu, oud ? oud.id : null, bod.id]);
  const na = await rangorde(client);
  await verwerkVerschuivingen(client, nu, voor, na, { veroorzaker: bod.id, vervangenId: oud ? oud.id : null });
  const plek = na.findIndex((b) => b.id === bod.id) + 1;
  await log(client, nu, 'bevestigd', bod.id, { bedrijf: bod.bedrijf, bedrag: bod.bedrag, plek, vervangt: oud ? oud.id : null });
  return { plek, verhoging: Boolean(oud) };
}

export async function bevestig(pool, id, vervangtId = null) {
  return metSlot(pool, async (client, v, nu) => {
    const bod = await haalBod(client, id);
    if (bod.status !== 'wacht') throw new VeilingFout('status', 'Dit bod wacht niet meer op bevestiging. Ververs de pagina.');
    return bevestigIntern(client, nu, bod, vervangtId);
  });
}

export async function wijsAf(pool, id, reden = '') {
  return metSlot(pool, async (client, v, nu) => {
    const bod = await haalBod(client, id);
    if (bod.status !== 'wacht') throw new VeilingFout('status', 'Alleen een bod dat op bevestiging wacht kun je afwijzen. Een bevestigd bod trek je in.');
    await client.query(`UPDATE biedingen SET status = 'afgewezen', beslist_op = $1, notitie = $2 WHERE id = $3`, [nu, netjes(reden, 300), id]);
    await log(client, nu, 'afgewezen', id, { reden: netjes(reden, 300) });
    return {};
  });
}

export async function trekIn(pool, id, reden = '') {
  return metSlot(pool, async (client, v, nu) => {
    const bod = await haalBod(client, id);
    if (bod.status !== 'bevestigd' && bod.status !== 'wacht') throw new VeilingFout('status', 'Dit bod is al afgewezen, ingetrokken of vervangen.');
    const voor = await rangorde(client);
    await client.query(`UPDATE biedingen SET status = 'ingetrokken', beslist_op = $1, notitie = $2 WHERE id = $3`, [nu, netjes(reden, 300), id]);
    const na = await rangorde(client);
    await verwerkVerschuivingen(client, nu, voor, na);
    await log(client, nu, 'ingetrokken', id, { was: bod.status, reden: netjes(reden, 300) });
    return {};
  });
}

// Zet een afgewezen of ingetrokken bod terug in de wachtrij, voor als er een vergissing is gemaakt.
export async function zetTerug(pool, id) {
  return metSlot(pool, async (client, v, nu) => {
    const bod = await haalBod(client, id);
    if (bod.status !== 'afgewezen' && bod.status !== 'ingetrokken') throw new VeilingFout('status', 'Alleen een afgewezen of ingetrokken bod kun je terugzetten.');
    await client.query(`UPDATE biedingen SET status = 'wacht', beslist_op = NULL WHERE id = $1`, [id]);
    await log(client, nu, 'teruggezet', id, { was: bod.status });
    return {};
  });
}

export async function corrigeer(pool, id, wijziging) {
  return metSlot(pool, async (client, v, nu) => {
    const bod = await haalBod(client, id);
    if (bod.status !== 'bevestigd' && bod.status !== 'wacht') throw new VeilingFout('status', 'Alleen een bod dat wacht of bevestigd is kun je corrigeren.');
    const nieuw = leesInvoer({
      bedrijf: wijziging.bedrijf ?? bod.bedrijf, contact: wijziging.contact ?? bod.contact,
      email: wijziging.email ?? bod.email, telefoon: wijziging.telefoon ?? bod.telefoon, bod: wijziging.bod ?? bod.bedrag,
    }, { beheer: true });
    const voor = await rangorde(client);
    await client.query(
      'UPDATE biedingen SET bedrijf = $1, bedrijf_sleutel = $2, contact = $3, email = $4, telefoon = $5, bedrag = $6 WHERE id = $7',
      [nieuw.bedrijf, bedrijfSleutel(nieuw.bedrijf), nieuw.contact, nieuw.email, nieuw.telefoon, nieuw.bedrag, id]);
    const na = await rangorde(client);
    await verwerkVerschuivingen(client, nu, voor, na, { veroorzaker: Number(id) });
    await log(client, nu, 'gecorrigeerd', id, {
      was: { bedrijf: bod.bedrijf, contact: bod.contact, email: bod.email, telefoon: bod.telefoon, bedrag: bod.bedrag },
      wordt: nieuw, reden: netjes(wijziging.reden, 300),
    });
    return {};
  });
}

// Een bod dat telefonisch binnenkomt. Het staat meteen als bevestigd in de stand.
export async function voerIn(pool, invoer) {
  const bod = leesInvoer(invoer, { beheer: true });
  const sleutel = bedrijfSleutel(bod.bedrijf);
  return metSlot(pool, async (client, v, nu) => {
    const { rows } = await client.query(
      `INSERT INTO biedingen (bedrijf, bedrijf_sleutel, contact, email, telefoon, bedrag, status, bron, ingediend_op, notitie)
       VALUES ($1, $2, $3, $4, $5, $6, 'wacht', 'beheer', $7, $8) RETURNING *`,
      [bod.bedrijf, sleutel, bod.contact, bod.email, bod.telefoon, bod.bedrag, nu, netjes(invoer.notitie, 300)]);
    const nieuw = { ...rows[0], id: Number(rows[0].id) };
    await log(client, nu, 'ingevoerd', nieuw.id, { bedrijf: bod.bedrijf, bedrag: bod.bedrag });
    const uit = await bevestigIntern(client, nu, nieuw, invoer.vervangtId || null);
    const verlengd = await verlengAlsLaat(client, v, nu, nieuw.id);
    return { ...uit, id: nieuw.id, bonnummer: bonnummer(nieuw.id), verlengd };
  });
}

function leesMoment(waarde) {
  const d = new Date(waarde);
  if (!waarde || Number.isNaN(d.getTime())) throw new VeilingFout('moment', 'Vul een geldige datum en tijd in.');
  return d;
}

export async function veilingActie(pool, actie, waarde) {
  return metSlot(pool, async (client, v, nu) => {
    const { sluit } = tijden(v);
    if (actie === 'nu_openen') {
      if (sluit <= nu) throw new VeilingFout('sluit', 'Het sluitmoment is al voorbij. Stel eerst een nieuw sluitmoment in.');
      await client.query('UPDATE veiling SET opent_op = $1, eindstand_vast = FALSE WHERE id = 1', [nu]);
    } else if (actie === 'nu_sluiten') {
      await client.query('UPDATE veiling SET sluit_op = $1 WHERE id = 1', [nu]);
    } else if (actie === 'sluitmoment') {
      await client.query('UPDATE veiling SET sluit_op = $1, verlengd = FALSE, eindstand_vast = FALSE WHERE id = 1', [leesMoment(waarde)]);
    } else if (actie === 'openmoment') {
      await client.query('UPDATE veiling SET opent_op = $1 WHERE id = 1', [leesMoment(waarde)]);
    } else if (actie === 'spelregels') {
      await client.query('UPDATE veiling SET opent_op = NULL, sluit_op = NULL, verlengd = FALSE, eindstand_vast = FALSE WHERE id = 1');
    } else if (actie === 'eindstand_vast') {
      if (fase(nu, v) !== 'gesloten') throw new VeilingFout('open', 'De veiling is nog niet gesloten. Sluit eerst de veiling.');
      const wacht = (await client.query(`SELECT count(*)::int AS n FROM biedingen WHERE status = 'wacht'`)).rows[0].n;
      if (wacht) throw new VeilingFout('wacht', wacht === 1 ? 'Er wacht nog 1 bod op bevestiging. Bevestig het of wijs het af, dan kun je de eindstand vaststellen.' : `Er wachten nog ${wacht} biedingen op bevestiging. Bevestig ze of wijs ze af, dan kun je de eindstand vaststellen.`);
      await client.query('UPDATE veiling SET eindstand_vast = TRUE WHERE id = 1');
    } else if (actie === 'eindstand_los') {
      await client.query('UPDATE veiling SET eindstand_vast = FALSE WHERE id = 1');
    } else {
      throw new VeilingFout('actie', 'Onbekende handeling.');
    }
    await log(client, nu, 'veiling_' + actie, null, { waarde: waarde || null });
    return {};
  });
}

export async function meldingAfgehandeld(pool, id) {
  return metSlot(pool, async (client, v, nu) => {
    const r = await client.query(`UPDATE meldingen SET afgehandeld_op = $1, afgehandeld_hoe = 'gebeld of gemaild' WHERE id = $2 AND afgehandeld_op IS NULL`, [nu, id]);
    if (!r.rowCount) throw new VeilingFout('onbekend', 'Deze melding is al afgehandeld.');
    await log(client, nu, 'melding_afgehandeld', null, { melding: Number(id) });
    return {};
  });
}

// ---------- de openbare stand ----------
// Let op: hier komen alleen bedrijfsnaam, bedrag, plek en tijdstip in. Nooit contactgegevens.

export async function stand(pool) {
  const v = (await pool.query('SELECT *, clock_timestamp() AS nu FROM veiling WHERE id = 1')).rows[0];
  const nu = new Date(v.nu);
  const rij = await rangorde(pool);
  const tel = Object.fromEntries((await pool.query('SELECT status, count(*)::int AS n FROM biedingen GROUP BY status')).rows.map((r) => [r.status, r.n]));
  const { opent, sluit } = tijden(v);
  const f = fase(nu, v);
  const bevestigd = rij.length;
  const wacht = tel.wacht || 0;
  const verhoogd = tel.vervangen || 0;
  const zichtbaar = f !== 'voor' && bevestigd >= R.drempelStand;
  const eersteRij = rij.slice(0, R.plekken);

  const uit = {
    versie: Number(v.versie),
    gemaakt: nu.toISOString(),
    regels: {
      bodem: R.bodem, stap: R.stap, plekken: R.plekken, plekkenPerRij: R.plekkenPerRij, kolomVolgorde: R.kolomVolgorde,
      btwProcent: R.btwProcent, verlengMinuten: R.verlengMinuten, drempelStand: R.drempelStand, staantafelPrijs: R.staantafelPrijs,
    },
    opent: opent.toISOString(),
    sluit: sluit.toISOString(),
    verlengd: Boolean(v.verlengd),
    eindstandVast: Boolean(v.eindstand_vast),
    zichtbaar,
    binnen: f === 'voor' ? 0 : bevestigd + wacht,
    wacht: f === 'voor' ? 0 : wacht,
    instap: R.bodem,
    rij: [], buiten: [], laatste: [],
  };
  if (zichtbaar) {
    const laatste = (await pool.query(
      `SELECT bedrijf, bedrag, ingediend_op, vervangt FROM biedingen WHERE status IN ('bevestigd', 'vervangen') ORDER BY beslist_op DESC, id DESC LIMIT 6`)).rows;
    Object.assign(uit, {
      bedrijven: bevestigd,
      biedingen: bevestigd + verhoogd,
      verhoogd,
      instap: bevestigd >= R.plekken ? rij[R.plekken - 1].bedrag + R.stap : R.bodem,
      fec: eersteRij.reduce((s, b) => s + Math.max(0, b.bedrag - R.bodem), 0),
      totaal: eersteRij.reduce((s, b) => s + b.bedrag, 0),
      rij: eersteRij.map((b, i) => ({ plek: i + 1, bedrijf: b.bedrijf, bedrag: b.bedrag })),
      buiten: rij.slice(R.plekken, R.plekken + 12).map((b) => ({ bedrijf: b.bedrijf, bedrag: b.bedrag })),
      laatste: laatste.map((b) => ({ bedrijf: b.bedrijf, bedrag: b.bedrag, soort: b.vervangt ? 'verhoogd' : 'bod', op: new Date(b.ingediend_op).toISOString() })),
    });
  }
  // Vóór de opening mag de stand niet langer blijven staan dan tot het moment van openen.
  let bewaar = STAND_BEWAAR_SECONDEN;
  if (f === 'voor') bewaar = Math.max(1, Math.min(bewaar, Math.ceil((opent.getTime() - nu.getTime()) / 1000)));
  return { stand: uit, bewaar };
}

// ---------- alles voor de beheerpagina ----------

export async function overzicht(pool) {
  const v = (await pool.query('SELECT *, clock_timestamp() AS nu FROM veiling WHERE id = 1')).rows[0];
  const nu = new Date(v.nu);
  const { opent, sluit } = tijden(v);
  const rij = await rangorde(pool);
  const plek = new Map(rij.map((b, i) => [b.id, i + 1]));
  const alle = (await pool.query('SELECT * FROM biedingen ORDER BY id DESC LIMIT 2000')).rows.map((b) => {
    const id = Number(b.id);
    const eigen = rij.find((r) => r.id !== id && (r.bedrijf_sleutel === b.bedrijf_sleutel || (b.email && r.email && r.email.toLowerCase() === b.email.toLowerCase()))) || null;
    const anderen = rij.filter((r) => r !== eigen && r.id !== id);
    const zouPlek = 1 + anderen.filter((r) => r.bedrag >= b.bedrag).length;
    return {
      id, bonnummer: bonnummer(id), bedrijf: b.bedrijf, contact: b.contact, email: b.email, telefoon: b.telefoon, bedrag: b.bedrag,
      status: b.status, bron: b.bron, ingediend: new Date(b.ingediend_op).toISOString(), beslist: b.beslist_op ? new Date(b.beslist_op).toISOString() : null,
      notitie: b.notitie, vervangt: b.vervangt ? Number(b.vervangt) : null, plek: plek.get(id) || null,
      // alleen zinvol bij een bod dat wacht: lijkt dit een verhoging, en waar komt het uit
      lijktOp: b.status === 'wacht' && eigen ? { id: eigen.id, bedrijf: eigen.bedrijf, bedrag: eigen.bedrag, plek: plek.get(eigen.id), zelfdeNaam: eigen.bedrijf_sleutel === b.bedrijf_sleutel } : null,
      zouPlek: b.status === 'wacht' ? zouPlek : null,
    };
  });
  const meldingen = (await pool.query(
    `SELECT m.id, m.soort, m.van_plek, m.naar_plek, m.aangemaakt_op, b.id AS bod_id, b.bedrijf, b.contact, b.email, b.telefoon, b.bedrag
       FROM meldingen m JOIN biedingen b ON b.id = m.bod_id WHERE m.afgehandeld_op IS NULL ORDER BY (m.soort = 'eraf') DESC, m.aangemaakt_op ASC`)).rows.map((m) => {
    const anderen = rij.filter((r) => r.id !== Number(m.bod_id));
    return {
      id: Number(m.id), soort: m.soort, vanPlek: m.van_plek, naarPlek: m.naar_plek, sinds: new Date(m.aangemaakt_op).toISOString(),
      bodId: Number(m.bod_id), bedrijf: m.bedrijf, contact: m.contact, email: m.email, telefoon: m.telefoon, bedrag: m.bedrag,
      // wat moet dit bedrijf bieden om terug te komen op de eerste rij, en op de oude plek
      terugOpRij: Math.max(minimumBod(anderen, null), m.bedrag + R.stap),
      terugOpPlek: Math.max(anderen[m.van_plek - 1] ? anderen[m.van_plek - 1].bedrag + R.stap : R.bodem, m.bedrag + R.stap),
    };
  });
  const logboek = (await pool.query('SELECT id, op, soort, bod_id, details FROM logboek ORDER BY id DESC LIMIT 80')).rows.map((l) => ({
    id: Number(l.id), op: new Date(l.op).toISOString(), soort: l.soort, bodId: l.bod_id ? Number(l.bod_id) : null, details: l.details,
  }));
  const eersteRij = rij.slice(0, R.plekken);
  return {
    nu: nu.toISOString(), fase: fase(nu, v), opent: opent.toISOString(), sluit: sluit.toISOString(),
    sluitTekst: datumTekst(sluit), opentTekst: datumTekst(opent),
    eigenTijden: { opent: Boolean(v.opent_op), sluit: Boolean(v.sluit_op) },
    verlengd: Boolean(v.verlengd), eindstandVast: Boolean(v.eindstand_vast), versie: Number(v.versie),
    regels: { bodem: R.bodem, stap: R.stap, plekken: R.plekken, drempelStand: R.drempelStand, verlengMinuten: R.verlengMinuten, staantafelPrijs: R.staantafelPrijs },
    fec: eersteRij.reduce((s, b) => s + Math.max(0, b.bedrag - R.bodem), 0),
    totaal: eersteRij.reduce((s, b) => s + b.bedrag, 0),
    instap: rij.length >= R.plekken ? rij[R.plekken - 1].bedrag + R.stap : R.bodem,
    biedingen: alle, meldingen, logboek,
  };
}

// ---------- export voor de administratie ----------

function csvCel(waarde) {
  let t = String(waarde ?? '');
  // Voorkomt dat Excel een cel als formule gaat uitvoeren. Een gewoon telefoonnummer met + mag blijven.
  if (/^[=+\-@\t\r]/.test(t) && !/^\+[\d\s()-]+$/.test(t)) t = "'" + t;
  return '"' + t.replace(/"/g, '""') + '"';
}

const STATUS_TEKST = { wacht: 'wacht op bevestiging', bevestigd: 'bevestigd', afgewezen: 'afgewezen', ingetrokken: 'ingetrokken', vervangen: 'vervangen door hoger bod' };

export async function exportCsv(pool) {
  const rij = await rangorde(pool);
  const plek = new Map(rij.map((b, i) => [b.id, i + 1]));
  const alle = (await pool.query('SELECT * FROM biedingen ORDER BY id ASC')).rows.map((b) => ({ ...b, id: Number(b.id) }));
  const volgorde = [...rij.map((r) => alle.find((b) => b.id === r.id)), ...alle.filter((b) => !plek.has(b.id))];
  const kop = ['Plek', 'Status', 'Bedrijf', 'Contactpersoon', 'E-mailadres', 'Telefoon', 'Bod exclusief btw', 'Tafeldeel', 'Deel voor de FEC', 'Bod inclusief btw', 'Ingediend', 'Beslist', 'Ingevoerd via', 'Bonnummer', 'Notitie'];
  const regels = [kop.map(csvCel).join(';')];
  for (const b of volgorde) {
    const p = plek.get(b.id);
    const opRij = p && p <= R.plekken;
    regels.push([
      p ? (opRij ? p : 'buiten de eerste rij (' + p + ')') : '',
      STATUS_TEKST[b.status] || b.status, b.bedrijf, b.contact, b.email, b.telefoon, b.bedrag,
      opRij ? R.bodem : '', opRij ? b.bedrag - R.bodem : '',
      Math.round(b.bedrag * (100 + R.btwProcent)) / 100,
      datumKort(new Date(b.ingediend_op)), b.beslist_op ? datumKort(new Date(b.beslist_op)) : '',
      b.bron === 'beheer' ? 'beheerpagina' : 'site', bonnummer(b.id), b.notitie,
    ].map(csvCel).join(';'));
  }
  // Het teken vooraan zorgt dat Excel de letters met accenten goed leest.
  return '﻿' + regels.join('\r\n') + '\r\n';
}

// ---------- inlogpogingen ----------

export async function teVeelPogingen(pool, ipHash) {
  const sinds = new Date(Date.now() - 15 * 60 * 1000);
  const n = (await pool.query('SELECT count(*)::int AS n FROM pogingen WHERE ip_hash = $1 AND op > $2', [ipHash, sinds])).rows[0].n;
  return n >= R.maxInlogPogingen;
}

export async function noteerPoging(pool, ipHash) {
  await pool.query('INSERT INTO pogingen (ip_hash, op) VALUES ($1, clock_timestamp())', [ipHash]);
}
