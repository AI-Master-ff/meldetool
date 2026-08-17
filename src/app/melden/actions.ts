"use server";

import { redirect } from "next/navigation";
import { schoolsForType, type SchoolType } from "@/lib/schools";
import { slotsForType } from "@/lib/slots";
import { findSchoolId, findSlotId, replaceSchoolEntries } from "@/lib/entries";

export async function submitMeldung(formData: FormData): Promise<void> {
  const type = formData.get("type");
  if (type !== "GS" && type !== "WF") {
    throw new Error("Ungültiger Formulartyp");
  }
  const schoolKeyValue = formData.get("school");
  if (typeof schoolKeyValue !== "string" || schoolKeyValue.length === 0) {
    throw new Error("Bitte eine Schule auswählen");
  }

  const validSchool = schoolsForType(type as SchoolType).find(
    (s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue,
  );
  if (!validSchool) {
    throw new Error("Unbekannte Schule");
  }

  const schoolId = await findSchoolId(type as SchoolType, validSchool.name, validSchool.ort);
  if (!schoolId) {
    throw new Error("Schule nicht in der Datenbank gefunden – bitte Admin kontaktieren");
  }

  const typeSlots = slotsForType(type as SchoolType);
  const selectedSlotIds: number[] = [];
  for (const slot of typeSlots) {
    const key = `${slot.groupLabel}::${slot.subLabel ?? ""}`;
    if (formData.get(`slot:${key}`) === "on") {
      const slotId = await findSlotId(type as SchoolType, slot.groupLabel, slot.subLabel);
      if (slotId) selectedSlotIds.push(slotId);
    }
  }

  await replaceSchoolEntries(schoolId, selectedSlotIds);

  const params = new URLSearchParams({
    schule: validSchool.name,
    anzahl: String(selectedSlotIds.length),
  });
  redirect(`/melden/danke?${params.toString()}`);
}
