// Alles wat de beheerpagina doet. Zonder geldig wachtwoord komt hier niets uit.
import { pool } from '../../veiling/db.mjs';
import {
  VeilingFout, overzicht, bevestig, wijsAf, trekIn, zetTerug, corrigeer, voerIn, veilingActie,
  meldingAfgehandeld, exportCsv, teVeelPogingen, noteerPoging, wisTestgegevens,
} from '../../veiling/kern.mjs';
import {
  json, leesJson, eigenHerkomst, ipAfdruk, wachtwoordIngesteld, wachtwoordKlopt, sessieKoekje, leegKoekje, ingelogd,
} from '../../veiling/http.mjs';
import { ververStand } from '../../veiling/berichten.mjs';

const VEILING_ACTIES = ['nu_openen', 'nu_sluiten', 'sluitmoment', 'openmoment', 'spelregels', 'eindstand_vast', 'eindstand_los'];

// Is dit een testadres van Netlify (en dus niet de echte site)? Alleen daar mogen testgegevens gewist worden.
function isTestadres(context) {
  const soort = context?.deploy?.context;
  return Boolean(soort) && soort !== 'production';
}

export default async (req, context) => {
  const pad = new URL(req.url).pathname;

  if (req.method === 'GET' && pad === '/api/beheer/export.csv') {
    if (!ingelogd(req)) return new Response('Niet ingelogd.', { status: 401, headers: { 'cache-control': 'no-store' } });
    const csv = await exportCsv(pool());
    const dag = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="veurpruuve-eerste-rij-${dag}.csv"`,
        'cache-control': 'no-store',
      },
    });
  }

  if (req.method !== 'POST' || pad !== '/api/beheer') return json(404, { ok: false, bericht: 'Niet gevonden.' });
  if (!eigenHerkomst(req) || req.headers.get('x-oplaaie-beheer') !== '1') return json(403, { ok: false, bericht: 'Dit verzoek komt niet van de beheerpagina.' });
  const data = await leesJson(req, 20000);
  if (!data || typeof data.actie !== 'string') return json(400, { ok: false, bericht: 'Onleesbaar verzoek.' });

  try {
    if (data.actie === 'login') {
      if (!wachtwoordIngesteld()) return json(503, { ok: false, bericht: 'Er is nog geen wachtwoord ingesteld. Zet in Netlify de geheime instelling BEHEER_WACHTWOORD (minimaal acht tekens) en rol de site opnieuw uit.' });
      const ip = ipAfdruk(context);
      if (await teVeelPogingen(pool(), ip)) return json(429, { ok: false, bericht: 'Te veel foute pogingen. Wacht een kwartier en probeer het opnieuw.' });
      if (!wachtwoordKlopt(data.wachtwoord)) {
        await noteerPoging(pool(), ip);
        return json(401, { ok: false, bericht: 'Dat wachtwoord klopt niet.' });
      }
      return json(200, { ok: true }, { 'set-cookie': sessieKoekje() });
    }
    if (data.actie === 'logout') return json(200, { ok: true }, { 'set-cookie': leegKoekje() });

    if (!ingelogd(req)) return json(401, { ok: false, code: 'niet_ingelogd', bericht: 'Je bent niet (meer) ingelogd.' });

    let uit = {};
    let gewijzigd = true;
    if (data.actie === 'overzicht') gewijzigd = false;
    else if (data.actie === 'bevestig') uit = await bevestig(pool(), data.id, data.vervangtId || null);
    else if (data.actie === 'wijs_af') uit = await wijsAf(pool(), data.id, data.reden);
    else if (data.actie === 'trek_in') uit = await trekIn(pool(), data.id, data.reden);
    else if (data.actie === 'zet_terug') uit = await zetTerug(pool(), data.id);
    else if (data.actie === 'corrigeer') uit = await corrigeer(pool(), data.id, data.wijziging || {});
    else if (data.actie === 'voer_in') uit = await voerIn(pool(), data.bod || {});
    else if (data.actie === 'melding_klaar') uit = await meldingAfgehandeld(pool(), data.id);
    else if (VEILING_ACTIES.includes(data.actie)) uit = await veilingActie(pool(), data.actie, data.waarde);
    else if (data.actie === 'wis_testgegevens') {
      if (!isTestadres(context)) return json(403, { ok: false, bericht: 'Dit kan alleen op een testadres. Op de echte site wordt er nooit iets gewist.' });
      uit = await wisTestgegevens(pool());
    }
    else return json(400, { ok: false, bericht: 'Onbekende handeling.' });

    if (gewijzigd) context.waitUntil(ververStand());
    return json(200, { ok: true, uit, overzicht: { ...(await overzicht(pool())), testadres: isTestadres(context) } });
  } catch (fout) {
    if (fout instanceof VeilingFout) return json(fout.status, { ok: false, code: fout.code, bericht: fout.message });
    console.error('Een handeling op de beheerpagina is mislukt:', fout);
    return json(500, { ok: false, bericht: 'Er ging iets mis aan onze kant. Er is niets gewijzigd. Probeer het opnieuw.' });
  }
};

export const config = { path: ['/api/beheer', '/api/beheer/export.csv'] };
