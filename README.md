# Oplaaie

De site van Oplaaie, de zakelijke carnavalsavond van Lampegat op donderdag 4 februari 2027, en de veiling van de eerste rij.

## Waar staat wat

| Map of bestand | Wat het is |
| --- | --- |
| `site/index.html` | De homepage met de laaiklep. |
| `site/og.jpg` | Het plaatje dat WhatsApp en LinkedIn tonen als iemand de link deelt. |
| `site/eerste-rij/` | De biedpagina van de veiling en de pagina met de voorwaarden. |
| `site/beheer/` | De beheerpagina. Zonder wachtwoord zie je alleen het inlogscherm. |
| `veiling/spelregels.mjs` | Alle spelregels op één plek: bodembedrag, stappen, aantal plekken, openings- en sluitmoment. |
| `veiling/kern.mjs` | De regels van de veiling zoals de server ze uitvoert. |
| `netlify/functions/` | De serverfuncties: de stand, een bod uitbrengen en het beheer. |
| `netlify/database/migrations/` | De opzet van de database. |
| `test/` | De tests die de spelregels naspelen. |

## Een spelregel aanpassen

Open `veiling/spelregels.mjs`, pas de waarde aan en zet de wijziging live. De bedragen op de biedpagina komen vanzelf mee. Lopende tekst waarin een regel is uitgeschreven, zoals "zestien" of een datum, staat in `site/eerste-rij/index.html`, `site/eerste-rij/voorwaarden/index.html` en `site/index.html`.

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
