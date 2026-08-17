"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get("password");
  const next = formData.get("next");
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/uebersicht";

  if (typeof password !== "string" || !(await checkPassword(password))) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  await createSession();
  redirect(nextPath);
}
