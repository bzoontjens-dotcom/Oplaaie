// De verbinding met de database. Eén keer aanmaken en daarna hergebruiken,
// zodat niet elk bezoek een nieuwe verbinding opent.
import { getDatabase } from '@netlify/database';

let gedeeld = null;

export function pool() {
  if (!gedeeld) gedeeld = getDatabase().pool;
  return gedeeld;
}
