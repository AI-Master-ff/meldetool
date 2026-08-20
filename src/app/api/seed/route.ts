import { pool } from "@/lib/db";
import { runSeed } from "@/lib/seed";
import { schools } from "@/lib/schools";

// Einmaliger, geschützter Endpoint zum Anwenden von Schema-Änderungen/Seeds auf
// die Produktions-DB. Nach Gebrauch wieder entfernen.
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SESSION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runSeed(pool);
  return Response.json(result);
}

// Einmaliger, genereller Fix für Duplikate: pro (type, name) mit mehreren
// Zeilen wird die Zeile mit den meisten Meldungen behalten (und ihr Ort auf den
// Standardwert aus der statischen Konfiguration gesetzt), alle anderen (leeren)
// Duplikate werden gelöscht.
export async function PUT(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SESSION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const dupes = await pool.query<{ type: string; name: string }>(
    `SELECT type, name FROM schools GROUP BY type, name HAVING count(*) > 1`,
  );

  const fixed: unknown[] = [];
  for (const { type, name } of dupes.rows) {
    const rows = await pool.query<{ id: number; ort: string | null; entry_count: string }>(
      `SELECT s.id, s.ort, (SELECT count(*) FROM entries e WHERE e.school_id = s.id) AS entry_count
       FROM schools s WHERE s.type = $1 AND s.name = $2 ORDER BY entry_count DESC`,
      [type, name],
    );
    const [keep, ...rest] = rows.rows;
    if (!keep || rest.length === 0) continue;

    const staticMatch = schools.find((s) => s.type === type && s.name === name);
    const correctOrt = staticMatch ? staticMatch.ort : keep.ort;

    for (const dupe of rest) {
      await pool.query(`DELETE FROM schools WHERE id = $1`, [dupe.id]);
    }
    await pool.query(`UPDATE schools SET ort = $2 WHERE id = $1`, [keep.id, correctOrt]);
    fixed.push({ type, name, keptId: keep.id, correctOrt, deletedIds: rest.map((r) => r.id) });
  }

  return Response.json({ fixed });
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SESSION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await pool.query(`
    SELECT id, type, name, ort, sort_order,
      (SELECT count(*) FROM entries e WHERE e.school_id = schools.id) AS entry_count
    FROM schools
    WHERE (type, name) IN (
      SELECT type, name FROM schools GROUP BY type, name HAVING count(*) > 1
    )
    ORDER BY type, name, ort NULLS FIRST
  `);
  return Response.json(res.rows);
}
