# Veurpruuve

De site van Veurpruuve, de zakelijke carnavalsavond van Lampegat op de donderdag voor carnaval. In 2027 is dat donderdag 4 februari 2027 in de Bavaria Bierhal op het Stadhuisplein in Eindhoven, met op het programma Oplaaie mee Hans. De vaste formule is: Veurpruuve x Oplaaie mee Hans.

Veurpruuve is het feest dat elk jaar terugkomt. Oplaaie mee Hans is wat er in 2027 op het programma staat. De avond heet naar buiten altijd Veurpruuve.

## Hoe de site is opgebouwd

De hele site heeft de stijl van Veurpruuve: blauw en ivoor met oranje. Op de homepage zit één blok in een eigen stijl, het blok "x Oplaaie mee Hans", met papier, handschrift en de bakwagen. Dat blok staat in een eigen map, zodat het volgend jaar vervangen kan worden zonder de rest aan te raken.

| Map of bestand | Wat het is |
| --- | --- |
| `site/index.html` | De homepage van Veurpruuve. Het blok van Hans staat erin tussen de regels `BLOK 2027 BEGIN` en `BLOK 2027 EINDE`. |
| `site/home.js` | Het script van de homepage: de melding van de verkoopstart, de ticketshop en het contactformulier. |
| `site/site.js` | Het menu op een telefoon, voor alle pagina's. |
| `site/stijl/veurpruuve.css` | De huisstijl voor alle pagina's: kleuren, lettertypen, knoppen, de kop en de voet. Een kleur of lettertype overal aanpassen doe je hier bovenaan. |
| `site/stijl/home.css` | De opmaak van de onderdelen van de homepage. |
| `site/oplaaie-2027/` | Het blok "x Oplaaie mee Hans": de opmaak (`blok.css`), het script (`blok.js`) en de plaatjes (`img/`). Alles in `blok.css` geldt alleen binnen het blok. |
| `site/spelregels.html` | De spelregels, de voorwaarden en de privacytekst. |
| `site/bedankt.html` en `site/404.html` | De pagina na het contactformulier en de pagina voor een adres dat niet bestaat. |
| `site/img/` | Het logo, de medaille, de foto's en het deelplaatje `og.jpg`, dat WhatsApp en LinkedIn tonen als iemand de link deelt. |
| `site/eerste-rij/` | De biedpagina van de veiling en de pagina met de veilingvoorwaarden. |
| `site/beheer/` | De beheerpagina, met een eigen donkere stijl. Zonder wachtwoord zie je alleen het inlogscherm. |
| `bron/veurpruuve/` | De Veurpruuve-site van 23 oktober 2026, waar de stijl uit is overgenomen. Deze map wordt niet gepubliceerd. |
| `ontwerp/richting-c/` | Het ontwerp waar het blok van Hans op gebaseerd is. Deze map wordt niet gepubliceerd. |
| `veiling/spelregels.mjs` | Alle spelregels van de veiling op één plek: bodembedrag, stappen, aantal plekken, openings- en sluitmoment. |
| `veiling/kern.mjs` | De regels van de veiling zoals de server ze uitvoert. |
| `netlify/functions/` | De serverfuncties: de stand, een bod uitbrengen en het beheer. |
| `netlify/database/migrations/` | De opzet van de database. |
| `test/` | De tests die de spelregels naspelen. |

## Het blok van volgend jaar

Het blok "x Oplaaie mee Hans" zit op drie plekken in `site/index.html`, elk gemarkeerd met `BLOK 2027`:

1. Bovenin, de regels die de lettertypen en `blok.css` laden.
2. In het midden, alles tussen `BLOK 2027 BEGIN` en `BLOK 2027 EINDE`.
3. Onderaan, de regel die `blok.js` laadt.

Een nieuw blok maak je in een nieuwe map naast `site/oplaaie-2027/`. Vervang daarna die drie stukken. De rest van de homepage blijft staan. Teksten buiten het blok die het programma noemen, zoals de kop bovenaan, de veelgestelde vragen en de voet, loop je daarna na op de naam "Oplaaie mee Hans".

## De brief van Hans

De tekst van de uitnodiging in het blok is in de ik-vorm van Hans geschreven. Pas die tekst niet aan zonder akkoord.

De foto `site/oplaaie-2027/img/zanger-hans.webp` is Zanger Hans, uitgeknipt uit een hoesfoto, voor achter de laaiklep. Komt er een grotere foto, vervang dan dit bestand.

## De verkoop en de ticketshop

Bovenaan in `site/home.js` staan twee instellingen:

- `VERKOOP_START`: het moment waarop de verkoop begint. Tot dat moment toont de site een melding met de startdatum en wordt de ticketshop niet geladen.
- `WEEZTIX_SHOP`: het adres van de ticketshop van Weeztix voor de staantafels en de losse kaarten.

Wil je de shop vóór de start bekijken, zet dan `?shop=1` achter het adres van de homepage.

## Een spelregel van de veiling aanpassen

Open `veiling/spelregels.mjs`, pas de waarde aan en zet de wijziging live. De bedragen op de biedpagina komen vanzelf mee. Lopende tekst waarin een regel is uitgeschreven, zoals "zestien" of een datum, staat in `site/eerste-rij/index.html`, `site/eerste-rij/voorwaarden/index.html`, `site/spelregels.html` en `site/index.html`.

## De formulieren

Het contactformulier op de homepage en de melding bij een nieuw bod lopen via Netlify Forms. Naar welk adres de meldingen gaan, stel je in bij Netlify, onder Forms en dan Form notifications. Het adres is info@veurpruuve.nl.

## Het wachtwoord van de beheerpagina

Dat staat niet in deze bestanden. Het is de geheime instelling `BEHEER_WACHTWOORD` in Netlify (minimaal acht tekens). Na een wijziging moet de site opnieuw worden uitgerold.

## Live zetten

Dit gebeurt pas na akkoord. De stappen:

1. Het voorstel op GitHub samenvoegen met `main`. Netlify rolt de site dan uit op het project `oplaaie`.
2. In Netlify het eigen wachtwoord van de beheerpagina instellen en de meldingen van de formulieren naar info@veurpruuve.nl laten gaan.
3. Het domein veurpruuve.nl loskoppelen van het oude Netlify-project `veurpruuve` en koppelen aan het project `oplaaie`, als hoofddomein.
4. Het domein oplaaie.nl op dezelfde manier aan het project `oplaaie` koppelen, als extra domein. De doorverwijzing van oplaaie.nl naar veurpruuve.nl staat al klaar in `netlify.toml` en werkt vanaf dat moment vanzelf.
5. Controleren dat veurpruuve.nl de nieuwe site toont, dat oplaaie.nl doorverwijst en dat het slotje (https) op beide werkt.

Tussen stap 3 en het moment dat Netlify het domein heeft omgezet, kan de site een paar minuten onbereikbaar zijn. Doe dit dus op een rustig moment.

## Testen op je eigen computer

```bash
npm install
```

```bash
npm test
```

```bash
node test/lokaal.mjs
```

Het laatste commando start de hele site op http://localhost:8899. Het wachtwoord van de beheerpagina is daar `proefwachtwoord`.
