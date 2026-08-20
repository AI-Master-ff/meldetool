"use server";

import { redirect } from "next/navigation";
import { getSlots } from "@/lib/dbSlots";
import { getSchools } from "@/lib/dbSchools";
import { replaceSchoolEntries } from "@/lib/entries";
import { isRegistrationLocked } from "@/lib/settings";

export async function submitMeldung(formData: FormData): Promise<void> {
  if (await isRegistrationLocked()) {
    throw new Error("Die Meldefrist ist beendet, es können keine Meldungen mehr abgegeben werden.");
  }

  const type = formData.get("type");
  if (type !== "GS" && type !== "WF") {
    throw new Error("Ungültiger Formulartyp");
  }
  const schoolKeyValue = formData.get("school");
  if (typeof schoolKeyValue !== "string" || schoolKeyValue.length === 0) {
    throw new Error("Bitte eine Schule auswählen");
  }

  const schoolOptions = await getSchools(type);
  const validSchool = schoolOptions.find((s) => `${s.name}::${s.ort ?? ""}` === schoolKeyValue);
  if (!validSchool) {
    throw new Error("Unbekannte Schule");
  }

  const typeSlots = await getSlots(type);
  const selectedSlotIds: number[] = [];
  for (const slot of typeSlots) {
    const key = `${slot.groupLabel}::${slot.subLabel ?? ""}`;
    if (formData.get(`slot:${key}`) === "on") {
      selectedSlotIds.push(slot.id);
    }
  }

  await replaceSchoolEntries(validSchool.id, selectedSlotIds);

  const params = new URLSearchParams({
    schule: validSchool.name,
    anzahl: String(selectedSlotIds.length),
  });
  redirect(`/melden/danke?${params.toString()}`);
}
