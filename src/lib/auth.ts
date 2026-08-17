import { cookies } from "next/headers";
import { COOKIE_NAME, MAX_AGE_SECONDS, makeToken, verifyToken } from "./auth-token";

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function checkPassword(password: string): Promise<boolean> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) throw new Error("SITE_PASSWORD fehlt in den Umgebungsvariablen");
  return password === expected;
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const token = await makeToken(expiresAt);
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
