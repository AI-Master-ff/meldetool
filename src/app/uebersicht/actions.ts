"use server";

import { isAuthed, destroySession } from "@/lib/auth";
import { schoolsForType, type SchoolType } from "@/lib/schools";
import { slotsForType } from "@/lib/slots";
import { findSchoolId, findSlotId, setEntry } from "@/lib/entries";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function toggleEntry(
  type: SchoolType,
  schoolKeyValue: string,
  slotKeyValue: string,
  checked: boolean,
): Promise<{ ok: boolean }> {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }

  const school = schoolsForType(type).find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  const slot = slotsForType(type).find((s) => `${s.groupLabel}::${s.subLabel ?? ""}` === slotKeyValue);
  if (!school || !slot) {
    throw new Error("Unbekannte Schule oder Wettkampf");
  }

  const schoolId = await findSchoolId(type, school.name, school.ort);
  const slotId = await findSlotId(type, slot.groupLabel, slot.subLabel);
  if (!schoolId || !slotId) {
    throw new Error("Datensatz nicht gefunden");
  }

  await setEntry(schoolId, slotId, checked);
  return { ok: true };
}
