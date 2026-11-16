// Wat er na een wijziging nog moet gebeuren: de openbare stand verversen en
// bij een nieuw bod een e-mail naar info@oplaaie.nl laten sturen.
import { purgeCache } from '@netlify/cache';
import { euro, datumTekst } from './kern.mjs';

const wacht = (ms) => new Promise((klaar) => setTimeout(klaar, ms));

// De stand staat klaar bij Netlify. Na elke wijziging gooien we die kopie weg,
// zodat de volgende bezoeker de nieuwe stand krijgt. Lukt dat niet meteen, dan
// proberen we het nog een paar keer.
// Bij het testen op een eigen computer is er geen Netlify om mee te praten.
const lokaal = () => process.env.OPLAAIE_LOKAAL === '1';

export async function ververStand() {
  if (lokaal()) return true;
  for (let poging = 0; poging < 4; poging++) {
    try {
      await purgeCache({ tags: ['stand'] });
      return true;
    } catch (fout) {
      if (poging === 3) console.error('De stand verversen is niet gelukt:', fout?.message || fout);
      // Netlify staat twee keer verversen per vijf seconden toe. Na een weigering wachten we die vijf seconden af.
      else await wacht(5500);
    }
  }
  return false;
}

// De e-mail loopt via Netlify Forms: we vullen het verborgen formulier
// 'bod-melding' in, en Netlify stuurt de melding door naar info@oplaaie.nl.
export async function meldNieuwBod(herkomst, bod) {
  if (lokaal()) return true;
  const velden = new URLSearchParams({
    'form-name': 'bod-melding',
    subject: `Nieuw bod op de eerste rij: ${bod.bedrijf}, ${euro(bod.bedrag)}`,
    bedrijf: bod.bedrijf,
    contact: bod.contact,
    email: bod.email,
    telefoon: bod.telefoon,
    bod: euro(bod.bedrag) + ' exclusief btw',
    bonnummer: bod.bonnummer,
    tijdstip: datumTekst(new Date(bod.nu)),
    soort: bod.verhoging ? 'Verhoging van een bestaand bod' : 'Nieuw bod',
    bericht: `${bod.bedrijf} biedt ${euro(bod.bedrag)} op de eerste rij. Bel ${bod.contact} op ${bod.telefoon} om het bod te bevestigen en bevestig het daarna op de beheerpagina: ${herkomst}/beheer`,
  });
  try {
    const antwoord = await fetch(herkomst + '/', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: velden.toString(),
      signal: AbortSignal.timeout(8000),
    });
    if (!antwoord.ok) console.error('De e-mailmelding gaf een fout:', antwoord.status);
    return antwoord.ok;
  } catch (fout) {
    console.error('De e-mailmelding is niet verstuurd:', fout?.message || fout);
    return false;
  }
}
