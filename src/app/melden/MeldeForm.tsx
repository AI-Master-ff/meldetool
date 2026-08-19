import { schoolsForType, type SchoolType } from "@/lib/schools";
import type { DbSlot } from "@/lib/dbSlots";
import { SlotChecklist } from "@/components/SlotChecklist";
import { submitMeldung } from "./actions";

export function MeldeForm({ type, title, slots }: { type: SchoolType; title: string; slots: DbSlot[] }) {
  const schoolOptions = schoolsForType(type);
  const bundSlots = slots.filter((s) => s.section === "bund");
  const gleichSlots = slots.filter((s) => s.section === "gleich");

  const osOptions = schoolOptions.filter((s) => s.subtype === "OS");
  const gyOptions = schoolOptions.filter((s) => s.subtype === "GY");
  const hasSubtypes = osOptions.length > 0 && gyOptions.length > 0;

  return (
    <form action={submitMeldung} className="space-y-8">
      <input type="hidden" name="type" value={type} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Meldeliste für Schuljahr 2026/2027 – Schulbereich Meißen. Bitte Schule auswählen und
          ankreuzen, an welchen Wettkämpfen teilgenommen werden soll.
        </p>
      </div>

      <div>
        <label htmlFor="school" className="block text-sm font-medium text-slate-700">
          Schule
        </label>
        <select
          id="school"
          name="school"
          required
          defaultValue=""
          className="mt-1 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            Bitte wählen …
          </option>
          {hasSubtypes ? (
            <>
              <optgroup label="Oberschulen">
                {osOptions.map((s) => (
                  <option key={`${s.name}::${s.ort ?? ""}`} value={`${s.name}::${s.ort ?? ""}`}>
                    {s.name}
                    {s.ort ? ` (${s.ort})` : ""}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Gymnasien / BSZ">
                {gyOptions.map((s) => (
                  <option key={`${s.name}::${s.ort ?? ""}`} value={`${s.name}::${s.ort ?? ""}`}>
                    {s.name}
                    {s.ort ? ` (${s.ort})` : ""}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            schoolOptions.map((s) => (
              <option key={`${s.name}::${s.ort ?? ""}`} value={`${s.name}::${s.ort ?? ""}`}>
                {s.name}
                {s.ort ? ` (${s.ort})` : ""}
              </option>
            ))
          )}
        </select>
      </div>

      {bundSlots.length > 0 && (
        <SlotChecklist title="Bundeswettbewerb der Schulen" items={bundSlots} />
      )}
      {gleichSlots.length > 0 && (
        <SlotChecklist title="Gleichgestellte Wettkämpfe" items={gleichSlots} />
      )}

      <div className="flex items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Meldung absenden
        </button>
        <p className="text-sm text-slate-500">
          Ein erneutes Absenden ersetzt eine vorherige Meldung dieser Schule.
        </p>
      </div>
    </form>
  );
}
