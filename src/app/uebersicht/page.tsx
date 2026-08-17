import { schoolKey, schoolsForType } from "@/lib/schools";
import { groupSlots, slotKey, slotsForType } from "@/lib/slots";
import { getCheckedKeys } from "@/lib/entries";
import { OverviewTable } from "./OverviewTable";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

async function buildSection(type: "GS" | "WF") {
  const schools = schoolsForType(type).map((s) => ({
    key: schoolKey(s),
    name: s.name,
    ort: s.ort,
  }));
  const groups = groupSlots(slotsForType(type)).map((g) => ({
    groupLabel: g.groupLabel,
    items: g.items.map((it) => ({ key: slotKey(it), subLabel: it.subLabel })),
  }));
  const checkedSet = await getCheckedKeys(type);
  return { schools, groups, initialChecked: Array.from(checkedSet) };
}

export default async function Page() {
  const [gs, wf] = await Promise.all([buildSection("GS"), buildSection("WF")]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Übersicht Meldungen</h1>
          <p className="mt-1 text-sm text-slate-500">
            Zellen sind klickbar – Änderungen werden sofort gespeichert (für Nachmeldungen/Absagen).
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Abmelden
          </button>
        </form>
      </div>

      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Grundschulen</h2>
        <OverviewTable type="GS" schools={gs.schools} groups={gs.groups} initialChecked={gs.initialChecked} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Weiterführende Schulen (Oberschule / Gymnasium / BSZ)
        </h2>
        <OverviewTable type="WF" schools={wf.schools} groups={wf.groups} initialChecked={wf.initialChecked} />
      </section>
    </main>
  );
}
