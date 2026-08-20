import { pool } from "@/lib/db";
import { runSeed } from "@/lib/seed";

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
