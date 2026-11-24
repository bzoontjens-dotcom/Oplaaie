-- De veiling van de eerste rij.
-- biedingen: elk bod is een eigen regel. Een verhoging is een nieuwe regel,
-- de oude regel blijft bewaard met de status 'vervangen'. Er wordt nooit iets weggegooid.

CREATE TABLE biedingen (
  id              BIGSERIAL PRIMARY KEY,
  bedrijf         TEXT NOT NULL,
  bedrijf_sleutel TEXT NOT NULL,
  contact         TEXT NOT NULL,
  email           TEXT NOT NULL DEFAULT '',
  telefoon        TEXT NOT NULL DEFAULT '',
  bedrag          INTEGER NOT NULL CHECK (bedrag > 0),
  status          TEXT NOT NULL CHECK (status IN ('wacht', 'bevestigd', 'afgewezen', 'ingetrokken', 'vervangen')),
  bron            TEXT NOT NULL DEFAULT 'site' CHECK (bron IN ('site', 'beheer')),
  ingediend_op    TIMESTAMPTZ NOT NULL,
  beslist_op      TIMESTAMPTZ,
  vervangt        BIGINT REFERENCES biedingen (id),
  notitie         TEXT NOT NULL DEFAULT '',
  ip_hash         TEXT NOT NULL DEFAULT ''
);

-- Eén bevestigd bod per bedrijf. De database bewaakt dit zelf.
CREATE UNIQUE INDEX biedingen_een_per_bedrijf ON biedingen (bedrijf_sleutel) WHERE status = 'bevestigd';
CREATE INDEX biedingen_status ON biedingen (status);
CREATE INDEX biedingen_ip ON biedingen (ip_hash, ingediend_op);

-- veiling: één regel met de stand van de klok. Elke wijziging aan de veiling
-- zet eerst deze regel op slot, zodat twee biedingen nooit door elkaar lopen.
CREATE TABLE veiling (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  opent_op       TIMESTAMPTZ,          -- leeg = het moment uit de spelregels
  sluit_op       TIMESTAMPTZ,          -- leeg = het moment uit de spelregels
  verlengd       BOOLEAN NOT NULL DEFAULT FALSE,
  eindstand_vast BOOLEAN NOT NULL DEFAULT FALSE,
  versie         BIGINT NOT NULL DEFAULT 0
);
INSERT INTO veiling (id) VALUES (1);

-- logboek: alles wat er gebeurt, in volgorde. Alleen toevoegen, nooit wijzigen.
CREATE TABLE logboek (
  id      BIGSERIAL PRIMARY KEY,
  op      TIMESTAMPTZ NOT NULL,
  soort   TEXT NOT NULL,
  bod_id  BIGINT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- meldingen: wie we moeten bellen of mailen omdat hij is overboden.
CREATE TABLE meldingen (
  id             BIGSERIAL PRIMARY KEY,
  bod_id         BIGINT NOT NULL REFERENCES biedingen (id),
  soort          TEXT NOT NULL CHECK (soort IN ('eraf', 'opgeschoven')),
  van_plek       INTEGER NOT NULL,
  naar_plek      INTEGER NOT NULL,
  aangemaakt_op  TIMESTAMPTZ NOT NULL,
  bijgewerkt_op  TIMESTAMPTZ NOT NULL,
  afgehandeld_op TIMESTAMPTZ,
  afgehandeld_hoe TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX meldingen_een_open_per_bod ON meldingen (bod_id) WHERE afgehandeld_op IS NULL;

-- pogingen: mislukte inlogpogingen op de beheerpagina, om raden af te remmen.
CREATE TABLE pogingen (
  id      BIGSERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  op      TIMESTAMPTZ NOT NULL
);
CREATE INDEX pogingen_ip ON pogingen (ip_hash, op);
