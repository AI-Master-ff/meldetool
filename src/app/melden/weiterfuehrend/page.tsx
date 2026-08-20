import { MeldeForm } from "../MeldeForm";
import { getSlots } from "@/lib/dbSlots";
import { getSchools } from "@/lib/dbSchools";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [slots, schoolOptions] = await Promise.all([getSlots("WF"), getSchools("WF")]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <MeldeForm
        type="WF"
        title="Meldeliste weiterführende Schulen (Oberschule / Gymnasium / BSZ)"
        slots={slots}
        schoolOptions={schoolOptions}
      />
    </main>
  );
}
