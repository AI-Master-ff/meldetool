"use server";

import { redirect } from "next/navigation";
import { schoolsForType } from "@/lib/schools";
import { getSlots } from "@/lib/dbSlots";
import { findSchoolId, replaceSchoolEntries } from "@/lib/entries";

export async function submitMeldung(formData: FormData): Promise<void> {
  const type = formData.get("type");
  if (type !== "GS" && type !== "WF") {
    throw new Error("Ungültiger Formulartyp");
  }
  const schoolKeyValue = formData.get("school");
  if (typeof schoolKeyValue !== "string" || schoolKeyValue.length === 0) {
    throw new Error("Bitte eine Schule auswählen");
  }

  const validSchool = schoolsForType(type).find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!validSchool) {
    throw new Error("Unbekannte Schule");
  }

  const schoolId = await findSchoolId(type, validSchool.name, validSchool.ort);
  if (!schoolId) {
    throw new Error("Schule nicht in der Datenbank gefunden – bitte Admin kontaktieren");
  }

  const typeSlots = await getSlots(type);
  const selectedSlotIds: number[] = [];
  for (const slot of typeSlots) {
    const key = `${slot.groupLabel}::${slot.subLabel ?? ""}`;
    if (formData.get(`slot:${key}`) === "on") {
      selectedSlotIds.push(slot.id);
    }
  }

  await replaceSchoolEntries(schoolId, selectedSlotIds);

  const params = new URLSearchParams({
    schule: validSchool.name,
    anzahl: String(selectedSlotIds.length),
  });
  redirect(`/melden/danke?${params.toString()}`);
}
