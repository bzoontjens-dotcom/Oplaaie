# Opdracht voor Claude Code: het nieuwe ontwerp van Oplaaie doorvoeren

Versie 16 november 2026. Deze opdracht staat op de branch `ontwerp-richting-c`. Werk op die branch verder.

## Met wie je werkt

Ik ben Bart Zoontjens van Bravo B.V. Ik ben niet technisch. Dat betekent:

- Schrijf in het Nederlands, met je. Geen gedachtestreepjes, geen emoji's, geen uitroeptekens, geen kopjes in hoofdletters.
- Leg bij elke keuze in gewone taal uit wat je doet, waarom, en of het de beste manier is.
- Zet niets live. Laat mij het resultaat zien op een testadres van Netlify. Pas na mijn akkoord gaat het naar oplaaie.nl.
- Vraag akkoord voordat je iets verwijdert, een account aanmaakt of kosten maakt.
- Begin met een kort plan in gewone taal en je vragen aan mij. Bouw pas als ik het plan goedkeur.

## Wat er al ligt

Op deze branch staat het werk van de vorige sessie: de homepage met de laaiklep in de donkere stijl (`site/index.html`), de veiling van de eerste rij (`site/eerste-rij/`, `veiling/`, `netlify/functions/`), de beheerpagina en de tests. Dat werkt en blijft werken. Lees eerst `README.md`.

Nieuw op deze branch is de map `ontwerp/richting-c/`. Daarin staat `index.html` met de map `img`: het nieuwe ontwerp van de homepage, met alle teksten, een werkende laaiklep en een werkende kaart. De map `ontwerp` wordt niet gepubliceerd, want Netlify toont alleen de map `site`.

## Wat er verandert

De site was donker en stoer. Hij wordt vriendelijk, carnavalesk en persoonlijk: de homepage is een handgeschreven uitnodiging van Hans. De veiling blijft werken zoals hij werkt en krijgt dezelfde nieuwe stijl.

## Het ontwerp

- De homepage is een brief van Hans. Op een wit vel, licht gedraaid, staat de uitnodiging in de ik-vorm, met de kop in handschrift en ondertekend met Hans. Daarnaast staat de bakwagen met de laaiklep, met eronder twee foto's als polaroids met een stukje gele tape. Onder de brief hangen drie gele memobriefjes.
- Kleuren: papier #F4EBDA als ondergrond, wit #FFFEFA voor vellen en kaarten, inkt #2B2118 voor tekst, rood #C81E16 voor koppen en de hoofdknop, geel #FFD84D voor markeringen, memo's en de tweede knop.
- Lettertypen: Caveat voor alles wat handgeschreven is (koppen, aanhef, ondertekening, bijschriften, memo's, de namen op de kaart), Rubik voor de leestekst. Alleen op de bakwagen staan Barlow Condensed en Saira Stencil One.
- Tafels staan op laadbonnen met een gestippelde rand. Knoppen hebben een licht scheve, met de hand getekende vorm.
- Volgorde van de pagina: de uitnodiging met de laaiklep, de memobriefjes, de dertig adressen, de twee goede doelen, het verloop van de avond met wat is inbegrepen, de tafels, goed om te weten, het contactformulier, de afsluiter.
- De foto's zijn gemaakt in de Bavaria Bierhal tijdens carnaval, niet op Oplaaie. Dat staat erbij en blijft erbij staan. Gebruik geen foto's waarop gasten herkenbaar in beeld zijn.
- Alles moet op een telefoon net zo goed werken als op een laptop.

## Wat je doet

1. Vervang de homepage door het nieuwe ontwerp. Neem opzet, teksten en vormgeving over uit `ontwerp/richting-c/index.html` en maak er nette, onderhoudbare code van, met de stijlen in een eigen bestand in plaats van op elk element. Kopieer de afbeeldingen naar de map `site`.
2. Houd wat op de huidige homepage al goed geregeld is: het contactformulier via Netlify Forms naar info@oplaaie.nl, de koppeling met Weeztix voor de staantafels (de constante WEEZTIX, de link krijg je van mij), het sitepictogram, de privacytekst en de gegevens voor zoekmachines en voor het delen van de link.
3. De laaiklep en de kaart met de dertig adressen in het ontwerp zijn vereenvoudigde versies van die op de huidige homepage. Neem de versie uit het ontwerp als basis. Zorg dat je op een telefoon over de wagen heen kunt blijven scrollen. Vraag mij of het geluid, de confetti, de wagen die het beeld in rijdt en het naar beneden trekken van de klep terug moeten komen.
4. Geef de biedpagina en de voorwaarden van de veiling dezelfde stijl: papier, Caveat en Rubik, de plattegrond als papieren kaart, de biedbon als laadbon. De werking, de spelregels en de serverfuncties blijven zoals ze zijn. De tests moeten blijven slagen.
5. De beheerpagina hoeft niet mooi, alleen goed leesbaar. Daar verandert niets, tenzij een tekst hieronder er ook staat.
6. Voer de nieuwe teksten overal door: homepage, biedpagina, voorwaarden, deelbericht voor LinkedIn, e-mailmeldingen, de tekst die WhatsApp en LinkedIn tonen en het deelplaatje. Maak een nieuw deelplaatje in de nieuwe stijl en laat het mij zien.
7. Zoek aan het eind in alle bestanden of de oude regels en woorden echt weg zijn, en laat mij de uitkomst zien.

## De nieuwe teksten

- Campagneregel, overal: "Hans kwam altijd naar jou. Nu ga jij naar Hans." De oude regel "Hans komt niet naar jou. Jij gaat naar Hans." vervalt.
- Slogan: "Lampegat in lichterlaaie". Kreet: "Salaai! Oplaaie!" Alleen in die kreet staan uitroeptekens.
- Naar buiten alleen de naam Zanger Hans. De naam van de man achter Hans staat nergens op de site.
- Oplaaie steunt twee goede doelen. Alles wat de avond na aftrek van de kosten overhoudt, gaat naar de Muziekspeelplaats Eindhoven. Alles wat in de veiling boven € 2.400,- per tafel wordt geboden, gaat naar de Federatie Eindhovens Carnaval. Wordt er op de avond zelf ook geveild, dan gaat die opbrengst ook naar de federatie.
- De Muziekspeelplaats Eindhoven bestaat nog niet. Hij komt er, mede dankzij wat deze avond opbrengt. Schrijf er dus over in de toekomende tijd. Het woord "gratis" en de opsomming van wat kinderen er doen vervallen.
- Gebruik het woord "winstoogmerk" niet en schrijf niet dat de organisatie er niets aan verdient. De toon is: we doen dit om te helpen. Gebruik de formuleringen uit het ontwerp en maak ze niet groter of stelliger.
- Het programma van de avond is nog niet rond. Noem geen aantallen acts en geen namen. Bij 18.00 uur staat alleen dat het programma begint, bij 23.00 uur dat de laaiklep dichtgaat.
- Prijzen: staantafel voor acht € 1.600,-, bijkopen € 200,- per persoon, bieden op een zittafel vanaf € 2.400,-. Alles exclusief btw. De verkoop start op donderdag 26 november 2026 om 11.11 uur.
- Data altijd met jaartal. Bedragen als € 2.400,-.
- Geen foto's van internet, geen songteksten of melodieën van bestaande nummers.
- Contact alleen via het formulier en info@oplaaie.nl.

## Vragen die je mij eerst stelt

1. Moeten het geluid, de confetti en de rijdende wagen van de oude laaiklep terugkomen?
2. De tekst van de brief is in de ik-vorm van Hans. De man achter Hans leest hem nog na, dus verander die tekst niet zelf. Vraag of er al een akkoord is voordat de site live gaat.
3. De officiële schrijfwijze van de naam van de Federatie Eindhovens Carnaval.
4. Komt er op de avond zelf een veiling? Zo niet, dan vervalt die zin.
5. Mag het aantal plekken op de eerste rij (zestien) op de site blijven staan?

## Testen voordat je het mij laat zien

- De homepage, de biedpagina en de voorwaarden zien er op een iPhone en op een laptop goed uit, zonder dat je opzij hoeft te scrollen.
- De laaiklep gaat open en dicht, ook met het toetsenbord. De dertig stipjes komen binnen en de teller loopt mee.
- Het contactformulier komt aan op info@oplaaie.nl.
- Bieden, bevestigen, overboden worden, verlengen en sluiten werken zoals voorheen. Alle bestaande tests slagen.
- De oude campagneregel, "winstoogmerk", "gratis" en "Drie acts" komen nergens meer voor.

## Klaar is het wanneer

Ik op het testadres de nieuwe homepage en de veiling in de nieuwe stijl kan bekijken en uitproberen, en jij mij in gewone taal hebt uitgelegd wat er veranderd is, wat nog open staat en hoe ik het daarna live zet.
