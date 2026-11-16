// Draait de hele site op deze computer, om te testen zonder Netlify.
// Gebruik: node test/lokaal.mjs   en open daarna http://localhost:8899
// Het wachtwoord van de beheerpagina is hier "proefwachtwoord".
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { startDatabase } from './hulp.mjs';

const POORT = Number(process.env.POORT || 8899);
const SITE = path.resolve('site');
const SOORT = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

const omgeving = await startDatabase();
process.env.NETLIFY_DB_URL = omgeving.verbinding;
process.env.BEHEER_WACHTWOORD ||= 'proefwachtwoord';
process.env.OPLAAIE_LOKAAL = '1';

const functies = [
  ['/api/tijd', (await import('../netlify/functions/tijd.mjs')).default],
  ['/api/stand', (await import('../netlify/functions/stand.mjs')).default],
  ['/api/bod', (await import('../netlify/functions/bod.mjs')).default],
  ['/api/beheer', (await import('../netlify/functions/beheer.mjs')).default],
];

async function bestand(pad) {
  const kandidaten = [pad, pad + '.html', path.join(pad, 'index.html')];
  for (const k of kandidaten) {
    const vol = path.join(SITE, k);
    if (!vol.startsWith(SITE)) continue;
    try { if ((await stat(vol)).isFile()) return vol; } catch { /* volgende */ }
  }
  return null;
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost:' + POORT);
    const functie = functies.find(([p]) => url.pathname === p || url.pathname.startsWith(p + '/'));
    if (functie) {
      const brokken = [];
      for await (const b of req) brokken.push(b);
      const verzoek = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(brokken) });
      const antwoord = await functie[1](verzoek, { ip: req.headers['x-test-ip'] || req.socket.remoteAddress, waitUntil: (p) => { Promise.resolve(p).catch(() => {}); } });
      const koppen = {};
      antwoord.headers.forEach((v, k) => { koppen[k] = v; });
      res.writeHead(antwoord.status, koppen);
      res.end(Buffer.from(await antwoord.arrayBuffer()));
      return;
    }
    const vol = await bestand(decodeURIComponent(url.pathname));
    if (!vol) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Niet gevonden'); return; }
    res.writeHead(200, { 'content-type': SOORT[path.extname(vol)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(await readFile(vol));
  } catch (fout) {
    console.error(fout);
    res.writeHead(500); res.end('Fout');
  }
}).listen(POORT, () => console.log('De site draait op http://localhost:' + POORT));
