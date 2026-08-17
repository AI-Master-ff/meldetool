import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: join(__dirname, "..", ".env.local") });

import { Pool } from "pg";
import { schools } from "../src/lib/schools";
import { slots } from "../src/lib/slots";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const schema = readFileSync(join(__dirname, "..", "src", "lib", "schema.sql"), "utf-8");
  await pool.query(schema);

  for (const s of schools) {
    await pool.query(
      `INSERT INTO schools (type, subtype, name, ort, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (type, name, ort) DO UPDATE SET sort_order = EXCLUDED.sort_order, subtype = EXCLUDED.subtype`,
      [s.type, s.subtype ?? null, s.name, s.ort, s.sortOrder],
    );
  }

  for (const sl of slots) {
    await pool.query(
      `INSERT INTO slots (type, section, group_label, sub_label, meta, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (type, group_label, sub_label) DO UPDATE SET meta = EXCLUDED.meta, sort_order = EXCLUDED.sort_order, section = EXCLUDED.section`,
      [sl.type, sl.section, sl.groupLabel, sl.subLabel, sl.meta, sl.sortOrder],
    );
  }

  const schoolCount = await pool.query("SELECT count(*) FROM schools");
  const slotCount = await pool.query("SELECT count(*) FROM slots");
  console.log(`Seed fertig: ${schoolCount.rows[0].count} Schulen, ${slotCount.rows[0].count} Slots.`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
