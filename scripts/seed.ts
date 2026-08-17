import { config } from "dotenv";
import { join } from "node:path";

config({ path: join(__dirname, "..", process.env.SEED_ENV_FILE ?? ".env.local") });

import { Pool } from "pg";
import { runSeed } from "../src/lib/seed";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { schoolCount, slotCount } = await runSeed(pool);
  console.log(`Seed fertig: ${schoolCount} Schulen, ${slotCount} Slots.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
