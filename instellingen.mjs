// Instellingen die op veel plekken in de site terugkomen.
// Pas je hier iets aan, dan vult de bouwstap (bouw.mjs) het bij de volgende uitrol overal in.

export const INSTELLINGEN = {
  // De naam van het goede doel, opgegeven door de Federatie Eindhovens Carnaval op 25 november 2026.
  // Het is de missie van de federatie en de naam in hun aanvraag bij het Cultuurfonds. De hoofdregel
  // "Wij pruuve veur, heel Lampegat viert mee" is onze eigen slogan en blijft zoals hij is.
  // In de pagina's staat op elke plek {{DOEL}}; daar komt deze naam te staan.
  DOEL: 'Lampegat voor Iedereen',

  // Losse tickets. Bij de start verkopen we alleen tafels. In januari 2027 beslissen we of er losse tickets komen.
  // Zet dit op true en de kaart "Losse tickets" staat weer tussen de andere kaarten op de homepage.
  // In de pagina's staat de kaart tussen de regels ALS:LOSSE_TICKETS en EINDE:LOSSE_TICKETS.
  LOSSE_TICKETS: false,
};
