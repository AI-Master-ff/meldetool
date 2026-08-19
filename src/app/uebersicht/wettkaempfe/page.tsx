import Link from "next/link";
import { getSlots, type DbSlot } from "@/lib/dbSlots";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createSlotAction, deleteSlotAction, updateSlotAction } from "./actions";

export const dynamic = "force-dynamic";

const GRID_COLS = "grid-cols-[1.6fr_1.6fr_1.8fr_110px_90px_150px]";

function SlotEditor({ type, slots }: { type: "GS" | "WF"; slots: DbSlot[] }) {
  const nextSortOrder = slots.length > 0 ? Math.max(...slots.map((s) => s.sortOrder)) + 1 : 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <div className={`grid ${GRID_COLS} min-w-[900px] gap-x-3 gap-y-1 p-3`}>
        <div className="text-xs font-semibold text-slate-500">Sportart / Wettkampf</div>
        <div className="text-xs font-semibold text-slate-500">Detail (z.B. Altersklasse)</div>
        <div className="text-xs font-semibold text-slate-500">Termin / Ort</div>
        <div className="text-xs font-semibold text-slate-500">Bereich</div>
        <div className="text-xs font-semibold text-slate-500">Reihenfolge</div>
        <div className="text-xs font-semibold text-slate-500">Aktionen</div>

        {slots.map((slot) => (
          <form key={slot.id} action={updateSlotAction} className="contents">
            <input type="hidden" name="id" value={slot.id} />
            <input
              name="groupLabel"
              defaultValue={slot.groupLabel}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              name="subLabel"
              defaultValue={slot.subLabel ?? ""}
              placeholder="—"
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              name="meta"
              defaultValue={slot.meta}
              placeholder="Termin / Ort"
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <select name="section" defaultValue={slot.section} className="rounded border border-slate-300 px-2 py-1 text-sm">
              <option value="bund">Bundeswettbewerb</option>
              <option value="gleich">Gleichgestellt</option>
            </select>
            <input
              type="number"
              name="sortOrder"
              defaultValue={slot.sortOrder}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Speichern
              </button>
              <ConfirmButton
                formAction={deleteSlotAction}
                confirmMessage={`"${slot.groupLabel}${slot.subLabel ? " / " + slot.subLabel : ""}" wirklich löschen? Vorhandene Meldungen dazu werden mitgelöscht.`}
                className="rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Löschen
              </ConfirmButton>
            </div>
          </form>
        ))}

        <form action={createSlotAction} className="contents">
          <input type="hidden" name="type" value={type} />
          <input name="groupLabel" placeholder="Neue Sportart / Wettkampf" required className="rounded border border-slate-300 px-2 py-1 text-sm" />
          <input name="subLabel" placeholder="Detail (optional)" className="rounded border border-slate-300 px-2 py-1 text-sm" />
          <input name="meta" placeholder="Termin / Ort (optional)" className="rounded border border-slate-300 px-2 py-1 text-sm" />
          <select name="section" defaultValue="gleich" className="rounded border border-slate-300 px-2 py-1 text-sm">
            <option value="bund">Bundeswettbewerb</option>
            <option value="gleich">Gleichgestellt</option>
          </select>
          <input type="number" name="sortOrder" defaultValue={nextSortOrder} className="rounded border border-slate-300 px-2 py-1 text-sm" />
          <button
            type="submit"
            className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
          >
            + Hinzufügen
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const allSlots = await getSlots();
  const gsSlots = allSlots.filter((s) => s.type === "GS");
  const wfSlots = allSlots.filter((s) => s.type === "WF");

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wettkämpfe verwalten</h1>
          <p className="mt-1 text-sm text-slate-500">
            Änderungen wirken sich sofort auf die Meldeformulare und die Übersicht aus.
          </p>
        </div>
        <Link href="/uebersicht" className="text-sm font-medium text-blue-600 hover:underline">
          ← Zurück zur Übersicht
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Grundschulen</h2>
        <SlotEditor type="GS" slots={gsSlots} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Weiterführende Schulen (Oberschule / Gymnasium / BSZ)
        </h2>
        <SlotEditor type="WF" slots={wfSlots} />
      </section>
    </main>
  );
}
