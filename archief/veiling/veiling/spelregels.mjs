// De spelregels van de veiling van de eerste rij.
//
// Dit is de enige plek waar de regels staan. De server rekent ermee en de
// biedpagina krijgt ze van de server. Wil je een regel aanpassen, dan is dit
// het bestand. Tijden staan in Nederlandse tijd (+01:00 is de wintertijd).

export const SPELREGELS = {
  // Geld
  bodem: 2400,              // bodembedrag per zittafel in euro, exclusief btw
  stap: 100,                // bieden gaat in stappen van dit bedrag
  btwProcent: 21,
  maxBod: 100000,           // hoger dan dit nemen we niet aan via de site (vangnet tegen typefouten)

  // Plekken
  plekken: 16,              // zoveel tafels staan er op de eerste rij
  plekkenPerRij: 8,         // twee rijen van acht
  // Op welke kolom staat plek 1, 2, 3 ... Plek 1 en 2 staan in het midden,
  // recht voor de laaiklep, daarna waaiert het naar buiten uit.
  kolomVolgorde: [4, 5, 3, 6, 2, 7, 1, 8],

  // De klok
  opent: '2026-11-26T11:11:00+01:00',   // donderdag 26 november 2026, 11.11 uur
  sluit: '2026-12-15T11:11:00+01:00',   // dinsdag 15 december 2026, 11.11 uur
  verlengMinuten: 5,        // een bod in de laatste zoveel minuten verlengt de veiling met evenveel minuten

  // De openbare stand
  drempelStand: 5,          // de plattegrond gaat pas open bij zoveel bevestigde biedingen

  // De tafel zelf (alleen voor de teksten, dit regelen we na de veiling)
  personenPerTafel: 8,
  maxPersonenPerTafel: 10,
  bijkopenPerPersoon: 200,
  staantafelPrijs: 1600,    // wie buiten de eerste rij valt, krijgt als eerste een staantafel aangeboden

  // Bescherming tegen misbruik
  maxBiedingenPerUurPerAansluiting: 20, // per internetaansluiting; ruim, want op een kantoor of borrel delen mensen er één
  maxBiedingenPerUurPerEmail: 5,        // per e-mailadres
  maxInlogPogingen: 8,      // foute wachtwoorden per kwartier op de beheerpagina
};

// Hoe lang de openbare stand bij Netlify klaar mag blijven staan zonder dat de
// database wakker wordt. Bij elke wijziging wordt hij meteen ververst; dit is
// alleen het vangnet voor als dat verversen een keer mislukt.
export const STAND_BEWAAR_SECONDEN = 3600;
// Rond de sluiting is dat vangnet strakker: de stand blijft dan hooguit een zesde van de
// resterende tijd staan, met deze ondergrens in seconden. Zo ziet iedereen een verlenging
// door een laat bod snel, ook als het verversen een keer mislukt.
export const STAND_BEWAAR_MINIMUM = 10;
// Na de sluiting, zolang de eindstand nog niet is vastgesteld, in seconden.
export const STAND_BEWAAR_NA_SLUITING = 30;
