"use server";

import { isAuthed, destroySession } from "@/lib/auth";
import { schoolsForType, type SchoolType } from "@/lib/schools";
import { findSchoolId, findSlotId, setEntry, setSchoolComment } from "@/lib/entries";
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
  if (!school) {
    throw new Error("Unbekannte Schule");
  }
  const sep = slotKeyValue.indexOf("::");
  const groupLabel = sep === -1 ? slotKeyValue : slotKeyValue.slice(0, sep);
  const subLabelRaw = sep === -1 ? "" : slotKeyValue.slice(sep + 2);
  const subLabel = subLabelRaw === "" ? null : subLabelRaw;

  const schoolId = await findSchoolId(type, school.name, school.ort);
  const slotId = await findSlotId(type, groupLabel, subLabel);
  if (!schoolId || !slotId) {
    throw new Error("Datensatz nicht gefunden");
  }

  await setEntry(schoolId, slotId, checked);
  return { ok: true };
}

export async function updateComment(
  type: SchoolType,
  schoolKeyValue: string,
  comment: string,
): Promise<{ ok: boolean }> {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }

  const school = schoolsForType(type).find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!school) {
    throw new Error("Unbekannte Schule");
  }
  const schoolId = await findSchoolId(type, school.name, school.ort);
  if (!schoolId) {
    throw new Error("Datensatz nicht gefunden");
  }

  await setSchoolComment(schoolId, comment);
  return { ok: true };
}
