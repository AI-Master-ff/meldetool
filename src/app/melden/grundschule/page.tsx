import { MeldeForm } from "../MeldeForm";
import { getSlots } from "@/lib/dbSlots";
import { getSchools } from "@/lib/dbSchools";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [slots, schoolOptions] = await Promise.all([getSlots("GS"), getSchools("GS")]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MeldeForm type="GS" title="Meldeliste Grundschulen" slots={slots} schoolOptions={schoolOptions} />
    </main>
  );
}
