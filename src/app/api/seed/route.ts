import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { runSeed } from "@/lib/seed";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runSeed(pool);
  return NextResponse.json(result);
}
