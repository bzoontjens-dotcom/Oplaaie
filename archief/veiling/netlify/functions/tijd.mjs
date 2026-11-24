// Geeft de tijd van de server, zodat de klok op de biedpagina gelijk loopt,
// ook als de klok van iemands telefoon verkeerd staat.
export default async () =>
  new Response(JSON.stringify({ nu: new Date().toISOString() }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const config = { path: '/api/tijd', method: 'GET' };
