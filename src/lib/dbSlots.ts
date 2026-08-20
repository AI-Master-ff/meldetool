import { pool } from "./db";
import type { SchoolType } from "./schools";

export interface DbSlot {
  id: number;
  type: SchoolType;
  section: string;
  groupLabel: string;
  subLabel: string | null;
  meta: string;
  sortOrder: number;
  notes: string;
}

interface SlotRow {
  id: number;
  type: SchoolType;
  section: string;
  group_label: string;
  sub_label: string | null;
  meta: string | null;
  sort_order: number;
  notes: string | null;
}

function toDbSlot(row: SlotRow): DbSlot {
  return {
    id: row.id,
    type: row.type,
    section: row.section,
    groupLabel: row.group_label,
    subLabel: row.sub_label,
    meta: row.meta ?? "",
    sortOrder: row.sort_order,
    notes: row.notes ?? "",
  };
}

const SELECT_FIELDS = "id, type, section, group_label, sub_label, meta, sort_order, notes";

export async function getSlots(type?: SchoolType): Promise<DbSlot[]> {
  const res = type
    ? await pool.query<SlotRow>(
        `SELECT ${SELECT_FIELDS} FROM slots WHERE type = $1 ORDER BY section, sort_order`,
        [type],
      )
    : await pool.query<SlotRow>(`SELECT ${SELECT_FIELDS} FROM slots ORDER BY type, section, sort_order`);
  return res.rows.map(toDbSlot);
}

export async function createSlot(input: Omit<DbSlot, "id">): Promise<void> {
  await pool.query(
    `INSERT INTO slots (type, section, group_label, sub_label, meta, sort_order, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [input.type, input.section, input.groupLabel, input.subLabel, input.meta, input.sortOrder, input.notes],
  );
}

export async function updateSlot(id: number, input: Omit<DbSlot, "id" | "type">): Promise<void> {
  await pool.query(
    `UPDATE slots SET section = $2, group_label = $3, sub_label = $4, meta = $5, sort_order = $6, notes = $7 WHERE id = $1`,
    [id, input.section, input.groupLabel, input.subLabel, input.meta, input.sortOrder, input.notes],
  );
}

export async function deleteSlot(id: number): Promise<void> {
  await pool.query(`DELETE FROM slots WHERE id = $1`, [id]);
}
