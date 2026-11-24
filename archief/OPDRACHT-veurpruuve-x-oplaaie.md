# Opdracht voor Claude Code: Veurpruuve x Oplaaie mee Hans

Versie 16 november 2026. Deze opdracht staat op de branch `veurpruuve-x-oplaaie` en vervangt `OPDRACHT-nieuw-ontwerp.md`. Werk op deze branch verder.

## Met wie je werkt

Ik ben Bart Zoontjens van Bravo B.V. Ik ben niet technisch. Dat betekent:

- Schrijf in het Nederlands, met je. Geen gedachtestreepjes, geen emoji's, geen uitroeptekens, geen kopjes in hoofdletters.
- Leg bij elke keuze in gewone taal uit wat je doet, waarom, en of het de beste manier is.
- Zet niets live. Laat mij het resultaat zien op een testadres van Netlify. Pas na mijn akkoord gaat het naar veurpruuve.nl.
- Vraag akkoord voordat je iets verwijdert, een account aanmaakt of kosten maakt.
- Begin met een kort plan in gewone taal en je vragen aan mij. Bouw pas als ik het plan goedkeur.

## Wat er veranderd is

Op 16 november 2026 is besloten dat het evenement weer Veurpruuve heet. Veurpruuve is het vaste feest dat elk jaar terugkomt: de zakelijke carnavalsavond van Lampegat, op de donderdag voor carnaval in de Bavaria Bierhal. Oplaaie mee Hans is wat er in 2027 op het programma staat. Over een paar jaar kan daar iets anders staan, zonder dat de naam, het logo of de site van Veurpruuve verandert.

De vaste formule, overal: **Veurpruuve x Oplaaie mee Hans**. Met een gewone letter x, en "mee" in plaats van "met".

Naar buiten heet de avond altijd Veurpruuve. Oplaaie is nooit de naam van het evenement.

## Wat er al ligt

- Op deze branch staat de site van Oplaaie zoals die tot nu toe gebouwd is: de uitnodiging van Hans met de laaiklep en de route (`site/`), de veiling van de eerste rij (`site/eerste-rij/`, `veiling/`, `netlify/functions/`), de beheerpagina en de tests. Lees eerst `README.md`.
- Nieuw is de map `bron/veurpruuve/`. Daarin staat de complete Veurpruuve-site van 23 oktober 2026: de homepage, de spelregels, het logo met de pullen, de medaille en de foto's. Die map wordt niet gepubliceerd, want Netlify toont alleen de map `site`.

## Wat je bouwt

1. **De homepage wordt weer die van Veurpruuve.** Neem de opzet, de stijl, het logo en de medaille over uit `bron/veurpruuve/`. De stijl van Veurpruuve is de stijl van de hele site.
2. **Daarin komt één blok "x Oplaaie mee Hans"** in de stijl van Oplaaie, dus met het papier, het handschrift en de bakwagen. In dat blok staan de brief van Hans, de laaiklep die opengaat en de route met de adressen, zoals ze nu in `site/` staan. Het blok moet er zo in zitten dat het volgend jaar door een ander blok vervangen kan worden zonder de rest van de site aan te raken.
3. **Het aanbod wordt dat van Oplaaie, met losse kaarten erbij.** Staantafel voor acht voor € 1.600,-, bijkopen tot tien personen voor € 200,- per persoon, een losse kaart voor € 200,-, en de zittafels op de eerste rij via de veiling vanaf € 2.400,-. Alles exclusief btw.
4. **Wat uit de oude Veurpruuve-site vervalt:** de tafel voor tien, de oude prijzen (€ 1.500,- per tafel en € 150,- per kaart), de partnerpakketten en alles wat daarnaar verwijst, ook in de spelregels en de veelgestelde vragen. Losse kaarten blijven, voor de nieuwe prijs.
5. **Een blok over de twee goede doelen,** in de stijl van Veurpruuve.
6. **De veiling van de eerste rij** blijft werken zoals hij werkt en krijgt de stijl van Veurpruuve, omdat het een verkooppagina is. Er komen geen tafels op naam van prinsen.
7. **De spelregels en de veelgestelde vragen** van Veurpruuve werk je bij op het nieuwe aanbod.
8. **Het deelplaatje en de teksten voor zoekmachines** maak je opnieuw, met de formule erin.

## De teksten

- Formule: Veurpruuve x Oplaaie mee Hans.
- Slogan van Veurpruuve: "Doar zedde U tege". Die hoort bij het logo.
- In het blok van Hans: de regel "Hans kwam altijd naar jou. Nu ga jij naar Hans.", de slogan "Lampegat in lichterlaaie" en de kreet "Salaai! Oplaaie!" Alleen in die kreet staan uitroeptekens.
- Naar buiten alleen de naam Zanger Hans. De naam van de man achter Hans staat nergens.
- Twee goede doelen. Alles wat de avond na aftrek van de kosten overhoudt, gaat naar de Muziekspeelplaats Eindhoven. Alles wat in de veiling boven € 2.400,- per tafel wordt geboden, gaat naar de Federatie Eindhovens Carnaval. Wordt er op de avond zelf ook geveild, dan gaat die opbrengst ook naar de federatie.
- De Muziekspeelplaats Eindhoven bestaat nog niet. Hij komt er, mede dankzij wat deze avond opbrengt. Schrijf er dus over in de toekomende tijd.
- Gebruik het woord "winstoogmerk" niet en schrijf niet dat de organisatie er niets aan verdient. De toon is: we doen dit om te helpen.
- Het programma is nog niet rond. Noem geen aantallen acts en geen namen.
- De avond: donderdag 4 februari 2027, Bavaria Bierhal, Stadhuisplein Eindhoven. Deuren open 16.00 uur, de laaiklep gaat open om 17.30 uur, het programma begint om 18.00 uur, om 22.15 uur maken we bekend wat er is opgehaald, einde 23.00 uur. Besloten avond, 18 jaar en ouder.
- De verkoop start op donderdag 26 november 2026 om 11.11 uur.
- Data altijd met jaartal. Bedragen als € 2.400,-.
- Geen foto's van internet, geen songteksten of melodieën van bestaande nummers.
- Contact alleen via het formulier en info@veurpruuve.nl.

## Techniek

- De link naar de Weeztix-shop voor de staantafels en de losse kaarten krijg je van mij.
- Het contactformulier loopt via Netlify Forms. Vraag mij naar welk adres het moet.
- De tests moeten blijven slagen. De werking, de spelregels en de serverfuncties van de veiling veranderen niet.
- Beschrijf voor de livegang wat er nodig is om veurpruuve.nl naar deze site te laten wijzen en oplaaie.nl te laten doorverwijzen naar veurpruuve.nl. Voer dat pas uit na mijn akkoord.
- Werk `README.md` bij op de nieuwe opzet.

## Vragen die je mij eerst stelt

1. De foto van Zanger Hans achter de laaiklep (`site/img/zanger-hans.webp`) is uitgeknipt uit een hoesfoto. Heeft de man achter Hans die foto zelf aangeleverd en mag hij gebruikt worden? Zo niet, haal hem dan weg tot er een foto van hem zelf is.
2. De tekst van de brief is in de ik-vorm van Hans. Is die al door hem nagelezen? Verander de tekst niet zelf.
3. De officiële schrijfwijze van de naam van de Federatie Eindhovens Carnaval.
4. Komt er op de avond zelf een veiling? Zo niet, dan vervalt die zin.
5. Mag het aantal plekken op de eerste rij (zestien) op de site blijven staan?
6. Naar welk adres gaat het contactformulier: info@veurpruuve.nl of info@oplaaie.nl?
7. Waar staan gasten met een losse kaart: aan gedeelde staantafels, zoals in de oude veelgestelde vragen stond?

## Testen voordat je het mij laat zien

- De homepage, de spelregels, de biedpagina en de voorwaarden zien er op een iPhone en op een laptop goed uit.
- De laaiklep gaat open en dicht en de route loopt, binnen het blok van Hans.
- Het contactformulier komt aan.
- Bieden, bevestigen, overboden worden, verlengen en sluiten werken zoals voorheen. Alle bestaande tests slagen.
- Nergens staan nog een tafel voor tien, partnerpakketten, de prijzen € 1.500,- of € 150,-, of Oplaaie als naam van het evenement.

## Klaar is het wanneer

Ik op het testadres de Veurpruuve-site met het blok van Hans en de veiling kan bekijken en uitproberen, en jij mij in gewone taal hebt uitgelegd wat er veranderd is, wat nog open staat en hoe ik het daarna live zet.
