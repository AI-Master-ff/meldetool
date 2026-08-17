import { pool } from "@/lib/db";
import { runSeed } from "@/lib/seed";

// Einmaliger, geschützter Endpoint zum Befüllen von Schulen/Wettkämpfen in der
// Produktions-DB (kein lokaler DB-Zugriff nötig). Nach Gebrauch wieder entfernen.
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SESSION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runSeed(pool);
  return Response.json(result);
}
