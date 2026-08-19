import { MeldeForm } from "../MeldeForm";
import { getSlots } from "@/lib/dbSlots";

export const dynamic = "force-dynamic";

export default async function Page() {
  const slots = await getSlots("GS");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MeldeForm type="GS" title="Meldeliste Grundschulen" slots={slots} />
    </main>
  );
}
