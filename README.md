# Oplaaie

De site van Oplaaie, de zakelijke carnavalsavond van Lampegat op donderdag 4 februari 2027, en de veiling van de eerste rij.

## Waar staat wat

| Map of bestand | Wat het is |
| --- | --- |
| `site/index.html` | De homepage: de uitnodiging van Hans met de laaiklep. |
| `site/home.js` | Het script van de homepage: de laaiklep, de confetti, de kaart, de knop naar Weeztix en het contactformulier. |
| `site/stijl/basis.css` | De huisstijl voor alle pagina's: kleuren, lettertypen, knoppen en vellen papier. Een kleur of lettertype overal aanpassen doe je hier bovenaan. |
| `site/stijl/home.css` en `site/stijl/wagen.css` | De opmaak van de homepage en van de bakwagen. |
| `site/img/` | Het logo en de foto's. De foto's zijn bijgesneden en klein opgeslagen, zodat gasten niet herkenbaar in beeld zijn. `zanger-hans.webp` is Zanger Hans, uitgeknipt uit een hoesfoto, voor achter de laaiklep. Komt er een grotere foto, vervang dan dit bestand. |
| `site/og.jpg` | Het plaatje dat WhatsApp en LinkedIn tonen als iemand de link deelt. |
| `site/eerste-rij/` | De biedpagina van de veiling en de pagina met de voorwaarden. |
| `site/beheer/` | De beheerpagina, met een eigen donkere stijl. Zonder wachtwoord zie je alleen het inlogscherm. |
| `ontwerp/richting-c/` | Het ontwerp waar de huidige stijl op gebaseerd is. Deze map wordt niet gepubliceerd. |
| `veiling/spelregels.mjs` | Alle spelregels op één plek: bodembedrag, stappen, aantal plekken, openings- en sluitmoment. |
| `veiling/kern.mjs` | De regels van de veiling zoals de server ze uitvoert. |
| `netlify/functions/` | De serverfuncties: de stand, een bod uitbrengen en het beheer. |
| `netlify/database/migrations/` | De opzet van de database. |
| `test/` | De tests die de spelregels naspelen. |

## Een spelregel aanpassen

Open `veiling/spelregels.mjs`, pas de waarde aan en zet de wijziging live. De bedragen op de biedpagina komen vanzelf mee. Lopende tekst waarin een regel is uitgeschreven, zoals "zestien" of een datum, staat in `site/eerste-rij/index.html`, `site/eerste-rij/voorwaarden/index.html` en `site/index.html`.

## De link naar Weeztix

Die staat bovenaan in `site/home.js`, bij `WEEZTIX`. Zolang die leeg is, of zolang de verkoop nog niet gestart is, toont de knop "Reserveer een staantafel" een melding met de startdatum.

## De brief van Hans

De tekst van de uitnodiging op de homepage is in de ik-vorm van Hans geschreven. Pas die tekst niet aan zonder akkoord.

## Het wachtwoord van de beheerpagina

Dat staat niet in deze bestanden. Het is de geheime instelling `BEHEER_WACHTWOORD` in Netlify (minimaal acht tekens). Na een wijziging moet de site opnieuw worden uitgerold.

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
