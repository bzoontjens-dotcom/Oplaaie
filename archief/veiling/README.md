# De veiling van de eerste rij (archief)

Deze map bevat de veiling van de eerste rij zoals hij op 17 november 2026 werkte. Op 24 november 2026 is de veiling uitgezet: de tafels op de eerste rij hebben nu een vaste prijs. Er is niets weggegooid. Netlify publiceert deze map niet en rolt de serverfuncties en de database niet meer uit.

## Wat er staat

| Map of bestand | Wat het is |
| --- | --- |
| `site/eerste-rij/` | De biedpagina en de veilingvoorwaarden. |
| `site/beheer/` | De beheerpagina. |
| `site/__forms.html` | Het formulier waarmee de server bij een nieuw bod een melding liet sturen. |
| `netlify/functions/` | De serverfuncties: de stand, een bod uitbrengen en het beheer. |
| `netlify/database/migrations/` | De opzet van de database. |
| `veiling/` | De regels van de veiling. `spelregels.mjs` bevat alle instellingen op één plek. |
| `test/` | De tests die de spelregels naspelen, en `lokaal.mjs` om de veiling op je eigen computer te draaien. |

De teksten in deze map zijn van het vorige programma. Ze zijn niet bijgewerkt.

## De tests draaien

Vanuit de hoofdmap van de repo:

```bash
npm run test:veiling
```

Alle 12 tests horen te slagen. Zo blijft aantoonbaar dat de veiling werkt, mocht hij ooit terugkomen.

## De veiling terugzetten

1. Zet `site/eerste-rij`, `site/beheer` en `site/__forms.html` terug in de map `site` van de repo.
2. Zet `netlify/functions`, `netlify/database` en `veiling` terug in de hoofdmap.
3. Zet de drie pakketten uit `package.json` van deze map terug in de `package.json` van de hoofdmap, en in `netlify.toml` de regels voor de serverfuncties en de beheerpagina.
4. Haal in `netlify.toml` de doorverwijzing van `/eerste-rij` weg.
5. Stel in Netlify het wachtwoord van de beheerpagina in (`BEHEER_WACHTWOORD`).
6. Werk de teksten en de opmaak bij op de site van dat moment.
