"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { createSlot, deleteSlot, updateSlot } from "@/lib/dbSlots";
import type { SchoolType } from "@/lib/schools";

async function requireAuth() {
  if (!(await isAuthed())) {
    throw new Error("Nicht angemeldet");
  }
}

function readSlotFields(formData: FormData) {
  const section = formData.get("section");
  const groupLabel = formData.get("groupLabel");
  const subLabelRaw = formData.get("subLabel");
  const meta = formData.get("meta");
  const sortOrderRaw = formData.get("sortOrder");
  const notes = formData.get("notes");

  if (section !== "bund" && section !== "gleich") throw new Error("Ungültiger Bereich");
  if (typeof groupLabel !== "string" || groupLabel.trim().length === 0) {
    throw new Error("Sportart/Wettkampf darf nicht leer sein");
  }
  const subLabel = typeof subLabelRaw === "string" && subLabelRaw.trim() !== "" ? subLabelRaw.trim() : null;
  const metaValue = typeof meta === "string" ? meta.trim() : "";
  const sortOrder = Number(sortOrderRaw);
  const notesValue = typeof notes === "string" ? notes.trim() : "";

  return {
    section,
    groupLabel: groupLabel.trim(),
    subLabel,
    meta: metaValue,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    notes: notesValue,
  };
}

function redirectWithError(message: string): never {
  redirect(`/uebersicht/wettkaempfe?error=${encodeURIComponent(message)}`);
}

export async function updateSlotAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Ungültige ID");

  try {
    const fields = readSlotFields(formData);
    await updateSlot(id, fields);
  } catch {
    redirectWithError("Speichern fehlgeschlagen (evtl. gibt es diese Kombination schon).");
  }

  revalidatePath("/uebersicht/wettkaempfe");
  revalidatePath("/uebersicht");
}

export async function deleteSlotAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Ungültige ID");

  await deleteSlot(id);

  revalidatePath("/uebersicht/wettkaempfe");
  revalidatePath("/uebersicht");
}

export async function createSlotAction(formData: FormData): Promise<void> {
  await requireAuth();
  const type = formData.get("type");
  if (type !== "GS" && type !== "WF") throw new Error("Ungültiger Typ");

  try {
    const fields = readSlotFields(formData);
    await createSlot({ type: type as SchoolType, ...fields });
  } catch {
    redirectWithError("Anlegen fehlgeschlagen (evtl. gibt es diese Kombination schon).");
  }

  revalidatePath("/uebersicht/wettkaempfe");
  revalidatePath("/uebersicht");
}
