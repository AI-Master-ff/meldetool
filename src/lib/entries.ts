import { pool } from "./db";
import { schoolKey, type SchoolType } from "./schools";
import { slotKey } from "./slots";

export async function findSchoolId(type: SchoolType, name: string, ort: string | null): Promise<number | null> {
  const res = await pool.query<{ id: number }>(
    `SELECT id FROM schools WHERE type = $1 AND name = $2 AND ort IS NOT DISTINCT FROM $3`,
    [type, name, ort],
  );
  return res.rows[0]?.id ?? null;
}

export async function findSlotId(
  type: SchoolType,
  groupLabel: string,
  subLabel: string | null,
): Promise<number | null> {
  const res = await pool.query<{ id: number }>(
    `SELECT id FROM slots WHERE type = $1 AND group_label = $2 AND sub_label IS NOT DISTINCT FROM $3`,
    [type, groupLabel, subLabel],
  );
  return res.rows[0]?.id ?? null;
}

// Ersetzt alle Einträge einer Schule (für ihren Typ) durch die übergebene Auswahl.
export async function replaceSchoolEntries(schoolId: number, slotIds: number[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM entries WHERE school_id = $1`, [schoolId]);
    for (const slotId of slotIds) {
      await client.query(
        `INSERT INTO entries (school_id, slot_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [schoolId, slotId],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function setEntry(schoolId: number, slotId: number, checked: boolean): Promise<void> {
  if (checked) {
    await pool.query(`INSERT INTO entries (school_id, slot_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      schoolId,
      slotId,
    ]);
  } else {
    await pool.query(`DELETE FROM entries WHERE school_id = $1 AND slot_id = $2`, [schoolId, slotId]);
  }
}

// Menge aller "schoolKey|slotKey" Kombinationen, die für einen Schultyp angehakt sind.
export async function getCheckedKeys(type: SchoolType): Promise<Set<string>> {
  const res = await pool.query<{
    school_name: string;
    school_ort: string | null;
    group_label: string;
    sub_label: string | null;
  }>(
    `SELECT s.name AS school_name, s.ort AS school_ort, sl.group_label, sl.sub_label
     FROM entries e
     JOIN schools s ON s.id = e.school_id
     JOIN slots sl ON sl.id = e.slot_id
     WHERE s.type = $1`,
    [type],
  );

  const set = new Set<string>();
  for (const row of res.rows) {
    const sk = schoolKey({ name: row.school_name, ort: row.school_ort });
    const slk = slotKey({ groupLabel: row.group_label, subLabel: row.sub_label });
    set.add(`${sk}||${slk}`);
  }
  return set;
}
