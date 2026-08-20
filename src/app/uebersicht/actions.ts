"use server";

import { revalidatePath } from "next/cache";
import { isAuthed, destroySession } from "@/lib/auth";
import type { SchoolType } from "@/lib/schools";
import { getSchools, updateSchool } from "@/lib/dbSchools";
import { findSlotId, setEntry, setEntryComment } from "@/lib/entries";
import { setRegistrationLocked } from "@/lib/settings";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

function parseSlotKey(slotKeyValue: string): { groupLabel: string; subLabel: string | null } {
  const sep = slotKeyValue.indexOf("::");
  const groupLabel = sep === -1 ? slotKeyValue : slotKeyValue.slice(0, sep);
  const subLabelRaw = sep === -1 ? "" : slotKeyValue.slice(sep + 2);
  return { groupLabel, subLabel: subLabelRaw === "" ? null : subLabelRaw };
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

  const schools = await getSchools(type);
  const school = schools.find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!school) {
    throw new Error("Unbekannte Schule");
  }
  const { groupLabel, subLabel } = parseSlotKey(slotKeyValue);
  const slotId = await findSlotId(type, groupLabel, subLabel);
  if (!slotId) {
    throw new Error("Wettkampf nicht gefunden");
  }

  await setEntry(school.id, slotId, checked);
  return { ok: true };
}

export async function updateEntryComment(
  type: SchoolType,
  schoolKeyValue: string,
  slotKeyValue: string,
  comment: string,
): Promise<{ ok: boolean }> {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }

  const schools = await getSchools(type);
  const school = schools.find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!school) {
    throw new Error("Unbekannte Schule");
  }
  const { groupLabel, subLabel } = parseSlotKey(slotKeyValue);
  const slotId = await findSlotId(type, groupLabel, subLabel);
  if (!slotId) {
    throw new Error("Wettkampf nicht gefunden");
  }

  await setEntryComment(school.id, slotId, comment);
  return { ok: true };
}

export async function updateSchoolAction(
  type: SchoolType,
  schoolKeyValue: string,
  newName: string,
  newOrt: string,
): Promise<{ ok: boolean }> {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }
  if (newName.trim().length === 0) {
    throw new Error("Name darf nicht leer sein");
  }

  const schools = await getSchools(type);
  const school = schools.find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!school) {
    throw new Error("Unbekannte Schule");
  }

  await updateSchool(school.id, { name: newName.trim(), ort: newOrt.trim() === "" ? null : newOrt.trim() });
  revalidatePath("/uebersicht");
  revalidatePath("/melden/grundschule");
  revalidatePath("/melden/weiterfuehrend");
  return { ok: true };
}

export async function toggleRegistrationLockAction(locked: boolean): Promise<{ ok: boolean }> {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }

  await setRegistrationLocked(locked);
  revalidatePath("/uebersicht");
  revalidatePath("/melden/grundschule");
  revalidatePath("/melden/weiterfuehrend");
  return { ok: true };
}
