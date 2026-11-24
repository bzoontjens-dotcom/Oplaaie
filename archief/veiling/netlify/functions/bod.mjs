// Een bod uitbrengen. Alle controles gebeuren hier op de server.
import { pool } from '../../veiling/db.mjs';
import { plaatsBod, VeilingFout } from '../../veiling/kern.mjs';
import { json, leesJson, eigenHerkomst, ipAfdruk } from '../../veiling/http.mjs';
import { ververStand, meldNieuwBod } from '../../veiling/berichten.mjs';

export default async (req, context) => {
  if (!eigenHerkomst(req)) return json(403, { ok: false, bericht: 'Dit verzoek komt niet van veurpruuve.nl.' });
  const data = await leesJson(req);
  if (!data) return json(400, { ok: false, bericht: 'We konden je bod niet lezen. Ververs de pagina en probeer het opnieuw.' });

  // Het onzichtbare veld 'website' vult een mens nooit in, een robot wel.
  // Een robot krijgt een vriendelijk antwoord, maar er wordt niets opgeslagen.
  if (data.website) return json(200, { ok: true, bonnummer: '2027-0000', robot: true });

  try {
    const uit = await plaatsBod(pool(), data, { ipHash: ipAfdruk(context) });
    const herkomst = new URL(req.url).origin;
    context.waitUntil(Promise.allSettled([ververStand(), meldNieuwBod(herkomst, uit)]));
    return json(200, {
      ok: true, bonnummer: uit.bonnummer, bedrijf: uit.bedrijf, bedrag: uit.bedrag,
      verhoging: uit.verhoging, verlengd: uit.verlengd, sluit: uit.sluit, nu: uit.nu, versie: uit.versie,
    });
  } catch (fout) {
    if (fout instanceof VeilingFout) return json(fout.status, { ok: false, code: fout.code, veld: fout.veld, bericht: fout.message });
    console.error('Een bod opslaan is mislukt:', fout);
    return json(500, { ok: false, bericht: 'Er ging iets mis aan onze kant en je bod is niet opgeslagen. Probeer het opnieuw of mail naar info@veurpruuve.nl.' });
  }
};

export const config = { path: '/api/bod', method: 'POST' };
