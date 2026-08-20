import type { Pool } from "pg";
import { schools } from "./schools";
import { slots } from "./slots";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('GS', 'WF')),
  subtype TEXT,
  name TEXT NOT NULL,
  ort TEXT,
  sort_order INT NOT NULL,
  UNIQUE NULLS NOT DISTINCT (type, name, ort)
);

CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('GS', 'WF')),
  section TEXT NOT NULL,
  group_label TEXT NOT NULL,
  sub_label TEXT,
  meta TEXT,
  sort_order INT NOT NULL,
  UNIQUE NULLS NOT DISTINCT (type, group_label, sub_label)
);

CREATE TABLE IF NOT EXISTS entries (
  school_id INT NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  slot_id INT NOT NULL REFERENCES slots (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (school_id, slot_id)
);

ALTER TABLE entries ADD COLUMN IF NOT EXISTS checked BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS comment TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value) VALUES ('registration_locked', 'false') ON CONFLICT (key) DO NOTHING;
`;

export async function runSeed(pool: Pool): Promise<{ schoolCount: number; slotCount: number }> {
  await pool.query(SCHEMA_SQL);

  // Schulen werden nach dem ersten Seed über die Verwaltungsseite bearbeitet
  // (z.B. umbenannt); ein erneuter Seed darf das nicht überschreiben.
  for (const s of schools) {
    await pool.query(
      `INSERT INTO schools (type, subtype, name, ort, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (type, name, ort) DO NOTHING`,
      [s.type, s.subtype ?? null, s.name, s.ort, s.sortOrder],
    );
  }

  // Slots werden nach dem ersten Seed über die Verwaltungsseite bearbeitet;
  // ein erneuter Seed darf bestehende (evtl. manuell geänderte) Zeilen nicht
  // überschreiben, sondern nur fehlende ergänzen.
  for (const sl of slots) {
    await pool.query(
      `INSERT INTO slots (type, section, group_label, sub_label, meta, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (type, group_label, sub_label) DO NOTHING`,
      [sl.type, sl.section, sl.groupLabel, sl.subLabel, sl.meta, sl.sortOrder],
    );
  }

  const schoolCount = await pool.query("SELECT count(*) FROM schools");
  const slotCount = await pool.query("SELECT count(*) FROM slots");
  return { schoolCount: Number(schoolCount.rows[0].count), slotCount: Number(slotCount.rows[0].count) };
}
