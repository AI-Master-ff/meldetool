import { pool } from "./db";
import type { SchoolType } from "./schools";

export interface DbSchool {
  id: number;
  type: SchoolType;
  subtype: "OS" | "GY" | null;
  name: string;
  ort: string | null;
  sortOrder: number;
}

interface SchoolRow {
  id: number;
  type: SchoolType;
  subtype: string | null;
  name: string;
  ort: string | null;
  sort_order: number;
}

function toDbSchool(row: SchoolRow): DbSchool {
  return {
    id: row.id,
    type: row.type,
    subtype: row.subtype === "OS" || row.subtype === "GY" ? row.subtype : null,
    name: row.name,
    ort: row.ort,
    sortOrder: row.sort_order,
  };
}

export async function getSchools(type?: SchoolType): Promise<DbSchool[]> {
  const res = type
    ? await pool.query<SchoolRow>(
        `SELECT id, type, subtype, name, ort, sort_order FROM schools WHERE type = $1 ORDER BY sort_order`,
        [type],
      )
    : await pool.query<SchoolRow>(`SELECT id, type, subtype, name, ort, sort_order FROM schools ORDER BY type, sort_order`);
  return res.rows.map(toDbSchool);
}

export async function updateSchool(id: number, input: { name: string; ort: string | null }): Promise<void> {
  await pool.query(`UPDATE schools SET name = $2, ort = $3 WHERE id = $1`, [id, input.name, input.ort]);
}
