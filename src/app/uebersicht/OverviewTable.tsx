"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleEntry } from "./actions";
import type { SchoolType } from "@/lib/schools";

export interface OverviewSchool {
  key: string;
  name: string;
  ort: string | null;
}

export interface OverviewSlotGroup {
  groupLabel: string;
  items: { key: string; subLabel: string | null }[];
}

export function OverviewTable({
  type,
  schools,
  groups,
  initialChecked,
}: {
  type: SchoolType;
  schools: OverviewSchool[];
  groups: OverviewSlotGroup[];
  initialChecked: string[];
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked));
  const [, startTransition] = useTransition();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  const flatSlots = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  function cellKey(schoolKey: string, slotKey: string) {
    return `${schoolKey}||${slotKey}`;
  }

  function toggle(schoolKey: string, slotKey: string) {
    const ck = cellKey(schoolKey, slotKey);
    const wasChecked = checked.has(ck);

    setChecked((prev) => {
      const next = new Set(prev);
      if (wasChecked) next.delete(ck);
      else next.add(ck);
      return next;
    });
    setPendingKeys((prev) => new Set(prev).add(ck));

    startTransition(async () => {
      try {
        await toggleEntry(type, schoolKey, slotKey, !wasChecked);
      } catch {
        // Fehlgeschlagen: Änderung zurücknehmen
        setChecked((prev) => {
          const next = new Set(prev);
          if (wasChecked) next.add(ck);
          else next.delete(ck);
          return next;
        });
      } finally {
        setPendingKeys((prev) => {
          const next = new Set(prev);
          next.delete(ck);
          return next;
        });
      }
    });
  }

  const sums = useMemo(() => {
    const map = new Map<string, number>();
    for (const slot of flatSlots) {
      let count = 0;
      for (const school of schools) {
        if (checked.has(cellKey(school.key, slot.key))) count++;
      }
      map.set(slot.key, count);
    }
    return map;
  }, [checked, schools, flatSlots]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700"
            >
              Schule
            </th>
            {groups.map((g) => (
              <th
                key={g.groupLabel}
                colSpan={g.items.length}
                className="border-b border-r border-slate-200 bg-slate-100 px-2 py-1 text-center font-semibold text-slate-700"
              >
                {g.groupLabel}
              </th>
            ))}
          </tr>
          <tr>
            {flatSlots.map((slot) => (
              <th
                key={slot.key}
                className="min-w-[3.5rem] whitespace-nowrap border-b border-r border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-normal text-slate-500"
              >
                {slot.subLabel ?? "✓"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <tr key={school.key} className="odd:bg-white even:bg-slate-50/50">
              <td className="sticky left-0 z-10 border-r border-b border-slate-200 bg-inherit px-3 py-1.5 font-medium text-slate-800">
                {school.name}
                {school.ort ? <span className="text-slate-400"> · {school.ort}</span> : null}
              </td>
              {flatSlots.map((slot) => {
                const ck = cellKey(school.key, slot.key);
                const isChecked = checked.has(ck);
                const isPending = pendingKeys.has(ck);
                return (
                  <td key={slot.key} className="border-r border-b border-slate-200 p-0 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(school.key, slot.key)}
                      aria-pressed={isChecked}
                      className={`h-8 w-full transition-colors ${
                        isChecked ? "bg-blue-600 text-white hover:bg-blue-700" : "text-transparent hover:bg-slate-100"
                      } ${isPending ? "opacity-50" : ""}`}
                    >
                      {isChecked ? "✓" : "·"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-semibold text-slate-700">
            <td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-slate-100 px-3 py-1.5">
              Summe
            </td>
            {flatSlots.map((slot) => (
              <td key={slot.key} className="border-r border-t border-slate-200 text-center">
                {sums.get(slot.key) ?? 0}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
