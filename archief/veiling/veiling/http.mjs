// Hulpjes voor de serverfuncties: antwoorden, het wachtwoord van de
// beheerpagina en de inlogsessie. Het wachtwoord staat als geheime instelling
// BEHEER_WACHTWOORD in Netlify en nergens in de code.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const SESSIE_UREN = 12;
const KOEKJE = 'oplaaie_beheer';

export function json(status, inhoud, extra = {}) {
  return new Response(JSON.stringify(inhoud), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra },
  });
}

export async function leesJson(req, maxTekens = 8000) {
  const tekst = await req.text();
  if (tekst.length > maxTekens) return null;
  try {
    const data = JSON.parse(tekst);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// Een verzoek moet van onze eigen pagina komen, niet van een andere site.
export function eigenHerkomst(req) {
  const herkomst = req.headers.get('origin');
  if (!herkomst) return true;
  try {
    return new URL(herkomst).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

function wachtwoord() {
  return (globalThis.Netlify?.env?.get('BEHEER_WACHTWOORD') ?? process.env.BEHEER_WACHTWOORD ?? '').trim();
}

export function wachtwoordIngesteld() {
  return wachtwoord().length >= 8;
}

function hash(tekst) {
  return createHash('sha256').update(tekst).digest();
}

// We bewaren nooit het internetadres zelf, alleen een onomkeerbare afdruk ervan.
export function ipAfdruk(context) {
  const ip = context?.ip || '';
  if (!ip) return '';
  return createHmac('sha256', hash('oplaaie-ip|' + wachtwoord())).update(ip).digest('hex').slice(0, 32);
}

export function wachtwoordKlopt(poging) {
  if (!wachtwoordIngesteld() || typeof poging !== 'string') return false;
  return timingSafeEqual(hash('p|' + poging), hash('p|' + wachtwoord()));
}

function teken(verloopt) {
  return createHmac('sha256', hash('oplaaie-sessie|' + wachtwoord())).update(String(verloopt)).digest('hex');
}

export function sessieKoekje() {
  const verloopt = Date.now() + SESSIE_UREN * 3600 * 1000;
  return `${KOEKJE}=${verloopt}.${teken(verloopt)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSIE_UREN * 3600}`;
}

export function leegKoekje() {
  return `${KOEKJE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function ingelogd(req) {
  if (!wachtwoordIngesteld()) return false;
  const koekjes = req.headers.get('cookie') || '';
  const m = new RegExp('(?:^|;\\s*)' + KOEKJE + '=(\\d+)\\.([0-9a-f]{64})(?:;|$)').exec(koekjes);
  if (!m) return false;
  const verloopt = Number(m[1]);
  if (!Number.isFinite(verloopt) || verloopt < Date.now()) return false;
  const verwacht = Buffer.from(teken(verloopt), 'hex');
  const gekregen = Buffer.from(m[2], 'hex');
  return verwacht.length === gekregen.length && timingSafeEqual(verwacht, gekregen);
}
