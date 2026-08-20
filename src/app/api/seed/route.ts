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
