// Start een tijdelijke database op deze computer, met dezelfde opzet als bij Netlify.
import { NetlifyDB } from '@netlify/database-dev';
import pg from 'pg';

export async function startDatabase() {
  // Staat TEST_DATABASE_URL ingesteld, dan testen we tegen die (echte) Postgres-database.
  // Dat is nodig voor de test met gelijktijdige biedingen: de ingebouwde
  // oefendatabase verwerkt alles achter elkaar en kan dat niet nabootsen.
  if (process.env.TEST_DATABASE_URL) {
    const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 12 });
    return { pool, echt: true, verbinding: process.env.TEST_DATABASE_URL, async stop() { await pool.end(); } };
  }
  const db = new NetlifyDB();
  const verbinding = await db.start();
  await db.applyMigrations('./netlify/database/migrations');
  const pool = new pg.Pool({ connectionString: verbinding, max: 1 });
  return { db, pool, echt: false, verbinding, async stop() { await pool.end(); await db.stop(); } };
}

export const bod = (bedrijf, bedrag, extra = {}) => ({
  bedrijf, contact: 'Test Persoon', email: bedrijf.toLowerCase().replace(/[^a-z0-9]/g, '') + '@voorbeeld.nl',
  telefoon: '040 123 45 67', bod: bedrag, akkoord: true, ...extra,
});
