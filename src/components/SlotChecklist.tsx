import { groupSlots, slotKey, type SlotDef } from "@/lib/slots";

export function SlotChecklist({ title, items }: { title: string; items: SlotDef[] }) {
  const groups = groupSlots(items);

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-slate-900">{title}</legend>
      <div className="space-y-2">
        {groups.map((group) => {
          const singleMeta = group.items.length === 1 ? group.items[0].meta : "";
          return (
            <div key={group.groupLabel} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-medium text-slate-900">{group.groupLabel}</span>
                {singleMeta ? <span className="text-sm text-slate-500">{singleMeta}</span> : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {group.items.map((item) => {
                  const key = slotKey(item);
                  const inputName = `slot:${key}`;
                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name={inputName}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {item.subLabel ?? "Teilnahme"}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
