# Opdracht voor Claude Code: Veurpruuve, heel Lampegat viert mee

Versie 24 november 2026. Deze opdracht hoort op de branch `veurpruuve-x-oplaaie` en vervangt `OPDRACHT-veurpruuve-x-oplaaie.md`. Werk op deze branch verder.

Bijgewerkt op 24 november 2026 met vijf besluiten van dezelfde dag: de verkoop start op dinsdag 1 december 2026, we verkopen bij de start alleen tafels, er is één vaste tekst voor minder of meer dan tien, en bij "drinken tot 21.00 uur" hoort altijd de zin over de drankjes na 21.00 uur.

Bijgewerkt op 25 november 2026 met vier besluiten: van elke tafel gaat € 111,- naar het goede doel in plaats van € 25,-, de verkoopregel is "Een dag voordat 3 Uurkes Vurraf begint, gaan wij al veurpruuve." in plaats van "Carnaval begint op vrijdag. Wij smokkelen een dag.", de tap "staat open" in plaats van "loopt", en de toiletten staan bij wat inbegrepen is.

## Met wie je werkt

Ik ben Bart Zoontjens van Bravo B.V. Ik ben niet technisch. Dat betekent:

- Schrijf in het Nederlands, met je. Geen gedachtestreepjes, geen emoji's, geen uitroeptekens, geen kopjes in hoofdletters.
- Leg bij elke keuze in gewone taal uit wat je doet, waarom, en of het de beste manier is.
- Zet niets live. Laat mij het resultaat zien op een testadres van Netlify. Pas na mijn akkoord gaat het naar veurpruuve.nl.
- Vraag akkoord voordat je iets verwijdert, een account aanmaakt of kosten maakt.
- Begin met een kort plan in gewone taal en je vragen aan mij. Bouw pas als ik het plan goedkeur.

## Wat er veranderd is

Op 24 november 2026 is het programma van 2027 veranderd. Veurpruuve blijft wat het is: de zakelijke carnavalsavond van Lampegat, op de donderdag voor carnaval in de Bavaria Bierhal. De naam, het logo met de pullen, de medaille en de stijl blijven.

Wat vervalt:

- Zanger Hans, de laaiklep, de bakwagen, de route met de dertig adressen en de naam Oplaaie. De formule "Veurpruuve x Oplaaie mee Hans" bestaat niet meer.
- De Muziekspeelplaats Eindhoven als goed doel.
- De veiling van de eerste rij. De tafels vooraan hebben nu een vaste prijs.
- De staantafel voor acht, het bijkopen tot tien en alle prijzen exclusief btw.
- Losse tickets, bij de start. In januari 2027 beslissen we of ze er komen. Tot die tijd worden ze nergens op de site genoemd.

Wat ervoor in de plaats komt:

- **De gastheer is Joël Borelli**, onder zijn eigen naam. Hij praat de avond aan elkaar en zingt hem uit. Andere artiesten maken we later bekend.
- **Eén goed doel: Heel Lampegat viert mee**, van de Federatie Eindhovens Carnaval. De federatie brengt carnaval naar mensen die er zelf niet naartoe kunnen: ouderen in een verzorgingshuis, mensen met een beperking en kinderen die opgroeien in armoede.
- **De elfde.** Een tafel is voor tien. De elfde gast is iemand die er zelf niet bij kan zijn. Van elke tafel gaat € 111,- naar Heel Lampegat viert mee. Elf is het getal van carnaval, en dat is de rode draad van de site.
- **Het rondje van de zaak.** Zo heet de veiling van de federatie op de avond zelf. De opbrengst gaat naar hetzelfde doel.
- **De verkoop start op dinsdag 1 december 2026 om 11.11 uur.**

## Wat er al ligt

- Op deze branch staat de site zoals hij op 17 november 2026 was. Lees eerst `README.md`.
- Het programma van 2027 zit in één vervangbaar blok: de map `site/oplaaie-2027/` en de drie plekken in `site/index.html` die met `BLOK 2027` gemarkeerd zijn. Dat blok vervang je.
- De veiling van de eerste rij staat in `site/eerste-rij/`, `veiling/`, `netlify/functions/` en `netlify/database/`, met een beheerpagina in `site/beheer/`.
- De tijdelijke pagina die nu op veurpruuve.nl en oplaaie.nl staat, komt uit de repository `veurpruuve` en blijft staan tot ik akkoord geef op de livegang.

## Wat je bouwt

1. **De kop van de homepage.** De titel wordt "Veurpruuve", met de regel "Wij pruuve veur, heel Lampegat viert mee." De slogan "Doar zedde U tege" blijft bij het logo. Haal "x Oplaaie mee Hans" overal weg: in de kop, het menu, de voet, de deelknoppen, de titels en de teksten voor zoekmachines.
2. **Een nieuw blok voor 2027, in plaats van het blok van Hans.** Zet het in een nieuwe map naast `site/oplaaie-2027/` en vervang de drie gemarkeerde stukken. Het blok heeft de stijl van Veurpruuve, met het handschrift (Caveat) voor de accenten. Geen papier, geen bakwagen. In het blok staan vier onderdelen:
   - Het verhaal van Heel Lampegat viert mee (tekst hieronder).
   - De elfde, in beeld: een tafel met tien pullen en één elfde pul die oplicht, in de stijl van het logo. Houd het licht en speels, en zorg dat het ook werkt voor wie animaties heeft uitgezet.
   - De gastheer, Joël Borelli, met ruimte voor een foto en een korte quote. Die lever ik aan. Tot die tijd staat er alleen tekst.
   - De avond in tijden (hieronder).
3. **Het aanbod.** Twee kaarten, alle prijzen inclusief btw. We verkopen bij de start alleen tafels:
   - Eigen tafel voor tien: € 1.500,- per tafel, € 150,- per persoon. Een staantafel met je bedrijfsnaam erop.
   - Tafel op de eerste rij voor tien: € 2.000,- per tafel. Zestien zittafels vlak voor het podium. Vaste prijs, op is op.
   - Onder de kaarten: "Bij alles inbegrepen: drinken tot 21.00 uur, eten, het programma, de garderobe en de toiletten. Na 21.00 uur zijn de drankjes voor eigen rekening." En: "Van elke tafel gaat € 111,- naar Heel Lampegat viert mee."
   - In de ticketshop komen er servicekosten van Weeztix bij: € 1,- per ticket, dus € 10,- per tafel.
   - Losse tickets staan niet op de site: geen kaart, geen knop, geen vraag, geen spelregel en geen zin over gedeelde tafels. De kaart staat wel klaar in de code, zodat hij in één keer terug kan. Dat regel je met `LOSSE_TICKETS` in `instellingen.mjs`.
4. **De veiling van de eerste rij gaat van de site.** De biedpagina, de veilingvoorwaarden en alle links ernaartoe verdwijnen. Het adres `/eerste-rij/` verwijst door naar het aanbod op de homepage. Verwijder de code, de serverfuncties, de database en de beheerpagina niet zonder mijn akkoord. Leg mij eerst uit wat de nette manier is om ze uit te zetten en wat er gebeurt met de tests.
5. **Het blok over het goede doel.** Eén doel, in de stijl van Veurpruuve. Het blok over de twee goede doelen vervalt.
6. **De spelregels, de voorwaarden en de veelgestelde vragen** werk je bij op het nieuwe aanbod en de prijzen inclusief btw.
7. **De verkoopstart.** In `site/home.js` wordt `VERKOOP_START` `'2026-12-01T11:11:00+01:00'`. Pas ook het agendabestand `site/agenda/verkoopstart.ics`, het seintje bij de verkoopstart en de mails die daarbij horen aan. De link naar de ticketshop blijft dezelfde.
8. **Het deelplaatje en de teksten voor zoekmachines** maak je opnieuw, zonder Hans en met de nieuwe regel.
9. **De README** werk je bij, zodat hij klopt met wat er staat.

## De teksten

Vaste regels, overal gelijk:

- Hoofdregel: "Wij pruuve veur, heel Lampegat viert mee."
- De elfde: "Tien aan tafel. De elfde viert thuis mee."
- Bij het logo: "Doar zedde U tege".
- Om te verkopen: "Een dag voordat 3 Uurkes Vurraf begint, gaan wij al veurpruuve."
- Minder of meer dan tien: "Een tafel is altijd voor tien. Met minder dan tien deel je een tafel met een ander bedrijf, of neem je klanten en relaties mee. Met meer dan tien neem je een tweede tafel."
- Bij "drinken tot 21.00 uur", op elke plek: "Na 21.00 uur zijn de drankjes voor eigen rekening."

Het verhaal, voor in het blok:

> Met carnaval is iedereen gelijk. Directeur of stagiair, in een boerenkiel zie je het verschil niet. Eén verschil blijft: je moet er wel naartoe kunnen.
>
> Wie in een verzorgingshuis woont, wie een beperking heeft of wie opgroeit in een gezin waar elke euro telt, hoort de optocht hooguit in de verte. De Federatie Eindhovens Carnaval draait het daarom om. Kun jij niet naar carnaval, dan komt carnaval naar jou.
>
> Op Veurpruuve proeft zakelijk Eindhoven als eerste. En wie als eerste proeft, zorgt dat de rest ook wat krijgt.
>
> Daarom is een tafel voor tien. De elfde nemen we mee.

De elfde, bij het beeld:

> Elf is het getal van carnaval. Jij staat met tien aan tafel. De elfde is iemand die er zelf niet bij kan zijn. Van elke tafel gaat € 111,- naar Heel Lampegat viert mee. Op de avond zelf geeft de hele tent een rondje, in de veiling van de federatie.

De gastheer:

> Joël Borelli praat de avond aan elkaar en zingt hem uit. Wie er verder op het podium staan, maken we later bekend.

De avond:

- 16.00 uur: inloop.
- 17.00 uur: het programma begint, Joël trapt af.
- In de eerste helft: het rondje van de zaak, de veiling van de Federatie Eindhovens Carnaval.
- 21.00 uur: Veurpruuve is afgelopen. Daarna de letste 3 uurkes: de Bierhal is open voor iedereen en je betaalt je drankjes zelf.
- 00.00 uur: de Bierhal sluit.

De tijden 17.11 uur voor de eerste proost en 18.11 uur voor het rondje van de zaak zijn een idee. Toon ze alleen als ik ze bevestig.

Regels voor alle teksten:

- Alle prijzen zijn inclusief btw. Noem het erbij.
- Schrijf nooit dat het hele tafelgeld naar het goede doel gaat. Het is € 111,- per tafel en de opbrengst van de veiling.
- Noem geen bedrag dat we willen ophalen en geen aantallen tafels of gasten, behalve de zestien tafels op de eerste rij.
- Noem geen artiesten behalve Joël Borelli.
- Beschrijf niet wat er bij een bezoek van de federatie gebeurt en noem geen voorbeelden. Die informatie heb ik nog niet. Bouw het blok zo dat een voorbeeld en een foto er later bij kunnen.
- De naam Heel Lampegat viert mee moet de federatie nog bevestigen. Zet hem op één plek in de code, zodat hij in één keer te wijzigen is.
- Gebruik het woord "winstoogmerk" niet en schrijf niet dat de organisatie er niets aan verdient.
- De avond: donderdag 4 februari 2027, Bavaria Bierhal, Stadhuisplein Eindhoven. Besloten avond, 18 jaar en ouder.
- Data altijd met jaartal. Bedragen als € 1.500,-.
- Geen foto's van internet, geen songteksten of melodieën van bestaande nummers. De foto van Zanger Hans gaat van de site.
- Contact alleen via het formulier en info@veurpruuve.nl.
- Annuleren kan niet. Tickets doorgeven aan een collega, een relatie of een ander bedrijf mag. Gaat de avond niet door, dan krijgt iedereen zijn geld terug.

## De veelgestelde vragen

Neem in elk geval deze vragen op, met de antwoorden uit de teksten hierboven:

- Wat kost het per persoon?
- Wat zit erin?
- We zijn met minder of meer dan tien. Wat dan? Antwoord: de vaste tekst over minder of meer dan tien.
- Wie staat er op het podium?
- Tot hoe laat duurt het?
- Wat is Heel Lampegat viert mee?
- Gaat mijn tafelgeld ook naar het goede doel? Antwoord: een deel. Van elke tafel gaat € 111,- naar Heel Lampegat viert mee, de rest betaalt de avond. De opbrengst van de veiling komt er bovenop.
- Hoe werkt het rondje van de zaak? Antwoord: op de avond zelf veilt de federatie een aantal kavels. Meebieden mag, het moet niet.
- Kan ik annuleren, en krijg ik een factuur?
- Is dit hetzelfde als Roet Korte Put? Antwoord: het idee is hetzelfde. Den Bosch heeft vanaf 2027 de vrijdag, Eindhoven de donderdag.
- Wat als het niet doorgaat?

## Techniek

- De ticketshop van Weeztix is al omgezet. De kaarten heten daar "Eigen tafel (10 personen)" en "Tafel eerste rij (10 personen)". De kaart "Losse tickets (vanaf 4 personen)" hoort bij de start niet te koop te staan.
- Het contactformulier blijft via Netlify Forms lopen.
- De tests moeten blijven slagen, of je legt mij uit welke tests bij de veiling horen en wat je ermee wilt doen.
- Beschrijf voor de livegang wat er nodig is om veurpruuve.nl naar deze site te laten wijzen en oplaaie.nl te laten doorverwijzen naar veurpruuve.nl. Voer dat pas uit na mijn akkoord.
- De site moet klaarstaan voor dinsdag 1 december 2026 om 11.11 uur.
