// De openbare stand. Alleen bevestigde biedingen, alleen bedrijfsnaam, bedrag
// en plek. Het antwoord blijft bij Netlify klaarstaan tot er iets verandert,
// zodat de database niet bij elke bezoeker wakker hoeft te worden.
import { pool } from '../../veiling/db.mjs';
import { stand } from '../../veiling/kern.mjs';

export default async () => {
  try {
    const { stand: inhoud, bewaar } = await stand(pool());
    return new Response(JSON.stringify(inhoud), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'netlify-cdn-cache-control': `public, durable, s-maxage=${bewaar}`,
        'netlify-cache-tag': 'stand',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (fout) {
    console.error('De stand ophalen is mislukt:', fout);
    return new Response(JSON.stringify({ fout: 'De stand is even niet beschikbaar.' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
};

export const config = { path: '/api/stand', method: 'GET' };
