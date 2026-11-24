// Instellingen die op veel plekken in de site terugkomen.
// Pas je hier iets aan, dan vult de bouwstap (bouw.mjs) het bij de volgende uitrol overal in.

export const INSTELLINGEN = {
  // De naam van het goede doel. De Federatie Eindhovens Carnaval moet deze naam nog bevestigen.
  // In de pagina's staat op elke plek {{DOEL}}; daar komt deze naam te staan.
  DOEL: 'Heel Lampegat viert mee',

  // Losse tickets. Bij de start verkopen we alleen tafels. In januari 2027 beslissen we of er losse tickets komen.
  // Zet dit op true en de kaart "Losse tickets" staat weer tussen de andere kaarten op de homepage.
  // In de pagina's staat de kaart tussen de regels ALS:LOSSE_TICKETS en EINDE:LOSSE_TICKETS.
  LOSSE_TICKETS: false,
};
