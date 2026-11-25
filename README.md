# Veurpruuve

De site van Veurpruuve, de zakelijke carnavalsavond van Lampegat op de donderdag voor carnaval. In 2027 is dat donderdag 4 februari 2027 in de Bavaria Bierhal op het Stadhuisplein in Eindhoven.

De hoofdregel van 2027 is: "Wij pruuve veur, heel Lampegat viert mee." Het goede doel is Lampegat voor Iedereen, van de Federatie Eindhovens Carnaval. Die naam heeft de federatie op 25 november 2026 opgegeven; hij staat op één plek, in `instellingen.mjs`. De gastheer is Joël Borelli.

## Hoe de site is opgebouwd

De bron van de site staat in de map `site`. Bij elke uitrol draait Netlify een kleine bouwstap, `bouw.mjs`. Die kopieert `site` naar `_site` en vult daarbij de instellingen uit `instellingen.mjs` in. Netlify toont de map `_site`. Die map staat niet in GitHub, hij wordt elke keer opnieuw gemaakt.

| Map of bestand | Wat het is |
| --- | --- |
| `instellingen.mjs` | Instellingen die op veel plekken terugkomen: de naam van het goede doel, en of de losse tickets aan staan. |
| `bouw.mjs` | De bouwstap die de instellingen invult. |
| `site/index.html` | De homepage. Het programma van 2027 staat erin tussen de regels `BLOK 2027 BEGIN` en `BLOK 2027 EINDE`. |
| `site/home.js` | Het script van de homepage: de melding van de verkoopstart, de ticketshop en het contactformulier. |
| `site/site.js` | Het menu op een telefoon, het seintje bij de verkoopstart en de knoppen om de uitnodiging door te sturen. |
| `site/stijl/veurpruuve.css` | De huisstijl voor alle pagina's: kleuren, lettertypen, knoppen, de kop en de voet. Een kleur of lettertype overal aanpassen doe je hier bovenaan. |
| `site/stijl/home.css` | De opmaak van de onderdelen van de homepage. |
| `site/programma-2027/` | Het blok voor 2027: de elfde, met het verhaal van het goede doel, en de avond met de gastheer. Met de opmaak (`blok.css`), het script (`blok.js`) en het handschrift (`letters.css`). |
| `site/spelregels.html` | De spelregels, de voorwaarden en de privacytekst. |
| `site/agenda/` | De agendabestanden voor de verkoopstart en voor de avond. |
| `site/bedankt.html` en `site/404.html` | De pagina na het contactformulier en de pagina voor een adres dat niet bestaat. |
| `site/img/` | Het logo, de medaille, de foto's en het deelplaatje `og.jpg`, dat WhatsApp en LinkedIn tonen als iemand de link deelt. |
| `site/fonts/` | De lettertypen. Ze komen van de eigen site, niet van Google. |
| `test/` | De tests voor de site. |
| `archief/` | Wat niet meer op de site staat, maar bewaard is. Zie hieronder. |
| `bron/veurpruuve/` | De Veurpruuve-site van 23 oktober 2026, waar de stijl uit is overgenomen. Wordt niet gepubliceerd. |

## De naam van het goede doel

De naam staat op één plek: in `instellingen.mjs`, bij `DOEL`. In de pagina's staat overal `{{DOEL}}`, en de bouwstap zet daar de naam neer. Verandert de naam, pas hem dan in `instellingen.mjs` aan en rol de site opnieuw uit.

De hoofdregel "Wij pruuve veur, heel Lampegat viert mee." is een aparte tekst. Die verandert niet vanzelf mee. Hij staat in `site/index.html`, in de voet van elke pagina, in `site/site.js` en op het deelplaatje.

## Het blok voor 2027

Het programma van het jaar zit op drie plekken in `site/index.html`, elk gemarkeerd met `BLOK 2027`:

1. Bovenin, de regels die het handschrift en `blok.css` laden.
2. In het midden, alles tussen `BLOK 2027 BEGIN` en `BLOK 2027 EINDE`.
3. Onderaan, de regel die `blok.js` laadt.

Het blok heeft twee speelse onderdelen, allebei in `blok.js`:

- De elfde. De bezoeker tikt op "Schenk de elfde in". De tien pullen kantelen, de elfde loopt vol en licht op, en dan verschijnt wat een tafel doet voor het goede doel.
- De avond. Een pul schuift langs de tijden mee terwijl je scrolt.

Op de rest van de homepage zitten er nog twee, in `site/home.js`: een tik op de medaille strooit confetti, en bij Bestellen loopt een aftelling naar de verkoopstart. Op het moment van de start verschijnt de ticketshop vanzelf.

Zonder script, en voor wie animaties heeft uitgezet, staat alles er meteen in de eindstand: de elfde is vol en de tekst is te lezen.

In het blok is ruimte gelaten voor wat nog komt. Zoek in `site/index.html` op `RUIMTE VOOR`:

- De foto en de quote van de gastheer. Zet de foto in `site/programma-2027/img/` en haal de commentaartekens weg.
- Een voorbeeld en een foto van het goede doel, in het verhaal bij de elfde.
- Bij de elfde staat een kaart met een voorbeeld ("Neem iemand van zesentachtig"). Dat is een bedacht voorbeeld, geen bestaand persoon. Een echt voorbeeld van de federatie komt daarvoor in de plaats.

## De volgorde van de homepage

Sinds 25 november 2026 is de volgorde: de opening, wat is het, de elfde, de avond, de tafels, bestellen, de veelgestelde vragen, de spelregels, contact en een slot met de elfde. De ticketshop staat dus direct onder de prijzen.

Het losse blok "Het goede doel" is opgegaan in de elfde. Wat er stond, staat nu op drie plekken: bij de uitkomst van de elfde (de € 111,- per tafel), bij de tijden van de avond (het rondje van de zaak) en onder de prijskaarten ("De rest van het tafelgeld betaalt de avond."). Het adres `/#doel` komt uit bij de elfde.

Op de kaart bij de elfde staat één mens, niet drie. Het inschenken eindigt met: "Jullie zijn met elf. Jouw tafel neemt iemand mee die er zelf niet bij kan zijn."

## De elfde en het bedrag per tafel

Van elke tafel gaat € 111,- naar het goede doel. Sinds 25 november 2026 staat dat vroeg en zichtbaar op de homepage, zonder dat je hoeft te tikken of een vraag open te klappen:

- in de opening, onder de prijs;
- direct onder de kop van de elfde, met wat het doel is;
- op beide prijskaarten ("Inclusief € 111,- voor de elfde") en in de regel eronder;
- bij Bestellen;
- in het slot onder het contactformulier;
- in de voorvertoning die je ziet als iemand de site deelt.

Er zijn drie vaste vormen. Kort: "€ 111,- per tafel voor de elfde." Warm: "Daarmee geeft de federatie ongeveer elf mensen per verkochte tafel een mooie carnaval." (altijd met "per verkochte tafel" of "jouw tafel" erbij, anders lijkt het alsof de hele avond maar elf mensen helpt) Zakelijk, voor de spelregels en de voorwaarden: "Van elke tafel gaat € 111,- naar Lampegat voor Iedereen."

Twee zinnen horen erbij. "Het zit in de prijs, jij betaalt niets extra", zodat niemand denkt dat het erbovenop komt. En "De rest van het tafelgeld betaalt de avond", één keer bij de prijzen en één keer bij de vraag, zodat het niet groter lijkt dan het is. De tests bewaken dit.

Verandert het bedrag, zoek dan op "111" in `site/`, `linkedin/teksten.md` en `test/site.test.mjs`.

## Wat de federatie heeft aangeleverd (25 november 2026)

- De naam van het doel: Lampegat voor Iedereen.
- Wat het doel doet: meer mensen laten meedoen, van de optocht tot het feest zelf, en carnaval brengen naar wie niet naar Lampegat kan komen, met optredens, middagen vol muziek en bezoek van de Stadsprins.
- Wat het kost: ongeveer € 10,- per persoon. Daarom staat er dat een tafel ongeveer elf mensen een mooie carnaval geeft (€ 111,- gedeeld door € 10,-). Het is een schatting van de federatie; schrijf altijd "ongeveer". Verandert het bedrag per tafel, pas dan ook dit aantal aan.
- Het voorbeeld op de kaart bij de elfde: het bezoek van de Stadsprins en de Stadshofkapel aan het Máxima Medisch Centrum. De foto volgt als het ziekenhuis akkoord is.
- Twee kavels voor het rondje van de zaak: een optreden van de Stadshofkapel en een schilderij op maat van Peer Retera.
- Het logo van de federatie mag op de site. Het bestand is nog niet binnen.

## De feedback van de federatie op de teksten (25 november 2026, avond)

Naomi van de federatie heeft de testversie nagelopen met een marketingblik. Haar lijn: de avond moet zichzelf verkopen ("hier moet ik bij zijn"), het goede doel vertel je één keer goed en daarna licht. Daarom:

- De opening heeft één boodschap en één knop. De verkoopregel "Een dag voordat 3 Uurkes Vurraf begint, gaan wij al veurpruuve" staat nu bij "Wat is het". Het bedrag voor het doel staat niet in de opening.
- "Wat is het" is haar tekst: "De carnavalsavond voor ondernemers van Lampegat."
- Het blok over het doel opent met "Op Veurpruuve proeft zakelijk Eindhoven als eerste. En wie als eerste proeft, zorgt dat de rest ook wat krijgt." Daaronder het bedrag, wat het doel doet, het logo van de federatie en het voorbeeld van het Máxima. De pullen hebben een eigen kop: "Tien aan tafel. De elfde viert thuis mee."
- Op de prijskaarten staat wat je krijgt. De drank heeft een sterretje: "Drinken is inbegrepen tot 21.00 uur. Na 21.00 uur zijn de drankjes voor eigen rekening." De garderobe en de toiletten staan alleen nog bij de vragen en de spelregels.
- Het blok "Moet je het eerst intern voorleggen?" is weg. Het script voor de doorstuurknoppen staat er nog en doet niets zolang de knoppen er niet zijn.
- Bij Bestellen en in het slot staat het doel niet meer. Het slot is een oproep: "Donderdag 4 februari 2027. Zorg dat je erbij bent."
- Het is statafel, niet staantafel.
- De federatie heet voluit Stichting Federatie Eindhovens Carnaval. Het logo staat in `site/img/fec-logo.webp` en `.png`.

Het bedrag van € 111,- staat nu bij "Wat is het", bij het doel, bij de pullen, op de twee prijskaarten, bij de spelregels en bij de vragen. De drie vaste vormen uit het stuk hierboven gelden nog voor mails en posts; op de site staat de korte stempel niet meer.

## Bestellen op factuur

Bij Bestellen, bij de vraag over annuleren en in de voorwaarden staat dat een bedrijf dat niet online kan afrekenen via het contactformulier een factuur kan aanvragen. Dat is handwerk: iemand maakt de factuur en geeft de tickets uit in Weeztix. Wil je dat niet meer, zoek dan op "niet online afrekenen" en haal de zinnen weg.

## De link naar LinkedIn

De link onderaan gaat naar het vaste adres van de pagina (linkedin.com/company/146742677). Dat blijft werken, ook als de naam in het adres verandert van oplaaie naar veurpruuve.

## Het aanbod

De prijzen staan in `site/index.html` en `site/spelregels.html`, en in de gegevens voor zoekmachines bovenin `site/index.html`. Alle prijzen zijn inclusief btw:

- Eigen tafel voor tien: € 1.500,- per tafel, € 150,- per persoon.
- Tafel op de eerste rij voor tien: € 2.000,- per tafel. Zestien tafels.

Van elke tafel gaat € 111,- naar het goede doel. Weeztix rekent € 1,- servicekosten per ticket, dus € 10,- per tafel.

Twee vaste teksten, overal gelijk:

- Minder of meer dan tien: "Een tafel is altijd voor tien. Met minder dan tien deel je een tafel met een ander bedrijf, of neem je klanten en relaties mee. Met meer dan tien neem je een tweede tafel."
- Bij "drinken tot 21.00 uur" hoort altijd de zin: "Na 21.00 uur zijn de drankjes voor eigen rekening."

## Losse tickets

Bij de start verkopen we alleen tafels. Losse tickets worden nergens op de site genoemd. In januari 2027 wordt besloten of ze er komen.

De kaart "Losse tickets" staat nog wel klaar in `site/index.html`, tussen de regels `ALS:LOSSE_TICKETS` en `EINDE:LOSSE_TICKETS`. Zolang `LOSSE_TICKETS` in `instellingen.mjs` op `false` staat, laat de bouwstap dat stuk weg. Zet je het op `true`, dan staat de kaart bij de volgende uitrol weer tussen de andere twee.

Komen de losse tickets terug, loop dan ook dit na, want daar staan ze nu bewust niet in:

- de prijs en de voorwaarden op de kaart zelf (nu € 170,- per persoon, vanaf vier tickets);
- de vaste tekst over minder of meer dan tien;
- de vragen "Wat kost het per persoon?" en "Wat zit erin?", en de spelregels;
- de regel over de € 111,- per tafel, in het blok over het goede doel en in de spelregels;
- de gegevens voor zoekmachines bovenin `site/index.html`, de doorstuurtekst in `site/site.js` en de voorbeeldmail hieronder;
- de test "bij de start verkopen we alleen tafels" in `test/site.test.mjs`.

## De verkoop en de ticketshop

Bovenaan in `site/home.js` staan twee instellingen:

- `VERKOOP_START`: het moment waarop de verkoop begint, dinsdag 1 december 2026 om 11.11 uur. Tot dat moment toont de site een melding met de startdatum en wordt de ticketshop niet geladen.
- `WEEZTIX_SHOP`: het adres van de ticketshop van Weeztix.

Wil je de shop vóór de start bekijken, zet dan `?shop=1` achter het adres van de homepage.

Verandert de startdatum, pas dan ook `site/agenda/verkoopstart.ics` aan en de datum in de teksten van `site/index.html` en `site/site.js`. De test in `test/site.test.mjs` controleert of ze gelijk lopen.

## Het seintje bij de verkoopstart

Bezoekers kunnen hun e-mailadres achterlaten. Die aanmeldingen komen bij Netlify binnen, onder Forms, in het formulier `verkoopstart`. Op de dag van de verkoopstart haal je daar de lijst op en mail je die mensen zelf. Een tekst die je kunt gebruiken:

> Onderwerp: De verkoop van Veurpruuve is gestart
>
> Je vroeg om een seintje. De verkoop van Veurpruuve is vandaag, dinsdag 1 december 2026, om 11.11 uur gestart. Een eigen tafel voor tien kost € 1.500,- inclusief btw en een tafel op de eerste rij kost € 2.000,-. De zestien tafels op de eerste rij zijn op als ze op zijn.
>
> Een tafel is altijd voor tien. Met minder dan tien deel je een tafel met een ander bedrijf, of neem je klanten en relaties mee. Met meer dan tien neem je een tweede tafel.
>
> Bij alles inbegrepen: drinken tot 21.00 uur, eten, het programma, de garderobe en de toiletten. Na 21.00 uur zijn de drankjes voor eigen rekening.
>
> Bestellen kan op https://veurpruuve.nl
>
> Groet, het team van Veurpruuve

## De formulieren

Het contactformulier en het seintje lopen via Netlify Forms. Naar welk adres de meldingen gaan, stel je in bij Netlify, onder Forms en dan Form notifications. Het adres is info@veurpruuve.nl.

## Het archief

In `archief` staat wat van de site af is, maar bewaard blijft. Netlify publiceert deze map niet.

| Map | Wat het is |
| --- | --- |
| `archief/veiling/` | De veiling van de eerste rij, uitgezet op 24 november 2026. Met de biedpagina, de voorwaarden, de beheerpagina, de serverfuncties, de opzet van de database en de tests. Zie `archief/veiling/README.md`. |
| `archief/oplaaie-2027/` | Het vorige blok voor 2027, met de brief, de bakwagen en de route. |
| `archief/ontwerp-richting-c/` | Het ontwerp waar dat blok op gebaseerd was. |
| `archief/OPDRACHT-*.md` | De eerdere opdrachten. |

Het adres `/eerste-rij/` verwijst door naar het aanbod op de homepage. Dat staat in `netlify.toml`.

## Live zetten

Dit gebeurt pas na akkoord. De stappen:

1. Het voorstel op GitHub samenvoegen met `main`. Netlify rolt de site dan uit op het project `oplaaie`.
2. In Netlify de meldingen van de formulieren naar info@veurpruuve.nl laten gaan.
3. Het domein veurpruuve.nl loskoppelen van het oude Netlify-project `veurpruuve` en koppelen aan het project `oplaaie`, als hoofddomein.
4. Het domein oplaaie.nl op dezelfde manier aan het project `oplaaie` koppelen, als extra domein. De doorverwijzing van oplaaie.nl naar veurpruuve.nl staat al klaar in `netlify.toml` en werkt vanaf dat moment vanzelf.
5. Controleren dat veurpruuve.nl de nieuwe site toont, dat oplaaie.nl doorverwijst en dat het slotje (https) op beide werkt.

Tussen stap 3 en het moment dat Netlify het domein heeft omgezet, kan de site een paar minuten onbereikbaar zijn. Doe dit dus op een rustig moment, ruim voor de verkoopstart.

## Testen op je eigen computer

De site bouwen en de tests draaien:

```bash
npm test
```

De site bouwen en bekijken op http://localhost:8080:

```bash
npm run bouw && npx --yes serve _site -l 8080
```

De tests van de veiling in het archief draaien:

```bash
npm run test:veiling
```
