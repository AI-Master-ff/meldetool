import { pool } from "./db";

const REGISTRATION_LOCKED_KEY = "registration_locked";

export async function isRegistrationLocked(): Promise<boolean> {
  const res = await pool.query<{ value: string }>(`SELECT value FROM app_settings WHERE key = $1`, [
    REGISTRATION_LOCKED_KEY,
  ]);
  return res.rows[0]?.value === "true";
}

export async function setRegistrationLocked(locked: boolean): Promise<void> {
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [REGISTRATION_LOCKED_KEY, locked ? "true" : "false"],
  );
}
