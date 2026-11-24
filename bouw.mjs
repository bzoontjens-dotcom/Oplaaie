// De bouwstap van de site. Hij kopieert de map "site" naar "_site" en vult daarbij de
// instellingen uit instellingen.mjs in: overal waar {{DOEL}} staat, komt de naam van het goede doel.
// Stukken tussen <!-- ALS:NAAM --> en <!-- EINDE:NAAM --> blijven alleen staan als die instelling aan staat.
// Netlify draait dit bij elke uitrol. Zelf draaien kan met: npm run bouw
import { cp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INSTELLINGEN } from './instellingen.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const BRON = path.join(hier, 'site'), DOEL_MAP = path.join(hier, '_site');
const TEKST = new Set(['.html', '.js', '.css', '.ics', '.txt', '.xml', '.svg', '.json']);

export async function bouw() {
  await rm(DOEL_MAP, { recursive: true, force: true });
  await cp(BRON, DOEL_MAP, { recursive: true });
  let ingevuld = 0;
  async function loop(map) {
    for (const item of await readdir(map, { withFileTypes: true })) {
      const pad = path.join(map, item.name);
      if (item.isDirectory()) { await loop(pad); continue; }
      if (!TEKST.has(path.extname(item.name))) continue;
      const tekst = await readFile(pad, 'utf8');
      if (!tekst.includes('{{') && !tekst.includes('ALS:')) continue;
      // stukken die bij een instelling horen die uit staat, gaan er in hun geheel uit
      const zonder = tekst.replace(/[ \t]*<!-- ALS:([A-Z_]+) -->\n?([\s\S]*?)[ \t]*<!-- EINDE:\1 -->\n?/g, (heel, naam, inhoud) => {
        if (!(naam in INSTELLINGEN)) throw new Error(`Onbekende instelling ${naam} in ${path.relative(hier, pad)}. Zet hem in instellingen.mjs.`);
        return INSTELLINGEN[naam] ? inhoud : '';
      });
      const nieuw = zonder.replace(/\{\{([A-Z_]+)\}\}/g, (heel, naam) => {
        if (!(naam in INSTELLINGEN)) throw new Error(`Onbekende instelling ${heel} in ${path.relative(hier, pad)}. Zet hem in instellingen.mjs.`);
        ingevuld++;
        return INSTELLINGEN[naam];
      });
      await writeFile(pad, nieuw);
    }
  }
  await loop(DOEL_MAP);
  return ingevuld;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = await bouw();
  console.log(`De site staat klaar in _site. Instellingen ingevuld op ${n} plekken.`);
}
