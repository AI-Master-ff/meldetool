import Link from "next/link";
import { schoolKey } from "@/lib/schools";
import { groupSlots, slotKey } from "@/lib/slots";
import { getSlots } from "@/lib/dbSlots";
import { getSchools } from "@/lib/dbSchools";
import { getCheckedKeys, getEntryComments } from "@/lib/entries";
import { isRegistrationLocked } from "@/lib/settings";
import { OverviewTable } from "./OverviewTable";
import { RegistrationLockToggle } from "./RegistrationLockToggle";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

async function buildSection(type: "GS" | "WF") {
  const [dbSchools, dbSlots, checkedSet, entryComments] = await Promise.all([
    getSchools(type),
    getSlots(type),
    getCheckedKeys(type),
    getEntryComments(type),
  ]);
  const schools = dbSchools.map((s) => ({
    key: schoolKey(s),
    name: s.name,
    ort: s.ort,
  }));
  const groups = groupSlots(dbSlots).map((g) => ({
    groupLabel: g.groupLabel,
    items: g.items.map((it) => ({ key: slotKey(it), subLabel: it.subLabel })),
  }));
  return {
    schools,
    groups,
    initialChecked: Array.from(checkedSet),
    initialComments: Array.from(entryComments.entries()),
  };
}

export default async function Page() {
  const [gs, wf, locked] = await Promise.all([buildSection("GS"), buildSection("WF"), isRegistrationLocked()]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Übersicht Meldungen</h1>
          <p className="mt-1 text-sm text-slate-500">
            Zellen sind klickbar – Änderungen werden sofort gespeichert. Rechtsklick auf eine Zelle
            für einen Kommentar (z.B. „abgesagt wegen Krankheit&quot;).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RegistrationLockToggle initialLocked={locked} />
          <Link href="/uebersicht/wettkaempfe" className="text-sm font-medium text-blue-600 hover:underline">
            Wettkämpfe verwalten
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Abmelden
            </button>
          </form>
        </div>
      </div>
      {locked ? (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Die Meldung ist für Schulen aktuell gesperrt – die Formulare zeigen nur einen Hinweis an.
        </p>
      ) : null}

      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Grundschulen</h2>
        <OverviewTable
          type="GS"
          schools={gs.schools}
          groups={gs.groups}
          initialChecked={gs.initialChecked}
          initialComments={gs.initialComments}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Weiterführende Schulen (Oberschule / Gymnasium / BSZ)
        </h2>
        <OverviewTable
          type="WF"
          schools={wf.schools}
          groups={wf.groups}
          initialChecked={wf.initialChecked}
          initialComments={wf.initialComments}
        />
      </section>
    </main>
  );
}
