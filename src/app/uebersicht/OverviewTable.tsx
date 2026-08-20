"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleEntry, updateEntryComment, updateSchoolAction } from "./actions";
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

const SCHOOL_COL_WIDTH = 220;

export function OverviewTable({
  type,
  schools,
  groups,
  initialChecked,
  initialComments,
}: {
  type: SchoolType;
  schools: OverviewSchool[];
  groups: OverviewSlotGroup[];
  initialChecked: string[];
  initialComments: [string, string][];
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked));
  const [comments, setComments] = useState<Map<string, string>>(() => new Map(initialComments));
  const [, startTransition] = useTransition();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [editingSchool, setEditingSchool] = useState<string | null>(null);
  const [commentEditor, setCommentEditor] = useState<{
    schoolKey: string;
    slotKey: string;
    schoolName: string;
    label: string;
    value: string;
  } | null>(null);

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

  function openCommentEditor(
    school: OverviewSchool,
    slot: { key: string; subLabel: string | null },
    groupLabel: string,
  ) {
    const ck = cellKey(school.key, slot.key);
    const label = `${groupLabel}${slot.subLabel ? " / " + slot.subLabel : ""}`;
    setCommentEditor({
      schoolKey: school.key,
      slotKey: slot.key,
      schoolName: school.name,
      label,
      value: comments.get(ck) ?? "",
    });
  }

  function saveCommentEditor(value: string) {
    if (!commentEditor) return;
    const ck = cellKey(commentEditor.schoolKey, commentEditor.slotKey);
    const trimmed = value.trim();

    setComments((prev) => {
      const copy = new Map(prev);
      if (trimmed === "") copy.delete(ck);
      else copy.set(ck, trimmed);
      return copy;
    });
    setCommentEditor(null);

    startTransition(async () => {
      await updateEntryComment(type, commentEditor.schoolKey, commentEditor.slotKey, trimmed);
    });
  }

  function saveSchoolEdit(school: OverviewSchool, name: string, ort: string) {
    startTransition(async () => {
      await updateSchoolAction(type, school.key, name, ort);
      window.location.reload();
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

  const rowSums = useMemo(() => {
    const map = new Map<string, number>();
    for (const school of schools) {
      let count = 0;
      for (const slot of flatSlots) {
        if (checked.has(cellKey(school.key, slot.key))) count++;
      }
      map.set(school.key, count);
    }
    return map;
  }, [checked, schools, flatSlots]);

  const grandTotal = useMemo(() => Array.from(rowSums.values()).reduce((a, b) => a + b, 0), [rowSums]);

  return (
    <>
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th
              rowSpan={2}
              style={{ width: SCHOOL_COL_WIDTH }}
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
            <th
              rowSpan={2}
              className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-center font-semibold text-slate-700"
            >
              Summe
            </th>
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
          {schools.map((school) => {
            const isEditing = editingSchool === school.key;
            return (
              <tr key={school.key} className="odd:bg-white even:bg-slate-50/50">
                <td
                  style={{ width: SCHOOL_COL_WIDTH }}
                  className="sticky left-0 z-10 border-r border-b border-slate-200 bg-inherit px-3 py-1.5 font-medium text-slate-800"
                >
                  {isEditing ? (
                    <SchoolEditForm
                      school={school}
                      onCancel={() => setEditingSchool(null)}
                      onSave={(name, ort) => {
                        setEditingSchool(null);
                        saveSchoolEdit(school, name, ort);
                      }}
                    />
                  ) : (
                    <div className="group flex items-center gap-1.5">
                      <span className="truncate">
                        {school.name}
                        {school.ort && school.ort !== school.name ? (
                          <span className="text-slate-400"> · {school.ort}</span>
                        ) : null}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingSchool(school.key)}
                        className="shrink-0 text-slate-300 opacity-0 hover:text-slate-600 group-hover:opacity-100"
                        aria-label="Schule bearbeiten"
                        title="Schule bearbeiten"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </td>
                {flatSlots.map((slot) => {
                  const ck = cellKey(school.key, slot.key);
                  const isChecked = checked.has(ck);
                  const isPending = pendingKeys.has(ck);
                  const comment = comments.get(ck);
                  const groupLabel = groups.find((g) => g.items.some((it) => it.key === slot.key))?.groupLabel ?? "";
                  return (
                    <td key={slot.key} className="border-r border-b border-slate-200 p-0 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(school.key, slot.key)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          openCommentEditor(school, slot, groupLabel);
                        }}
                        aria-pressed={isChecked}
                        title={comment ? `Kommentar: ${comment}` : "Rechtsklick für Kommentar"}
                        className={`h-8 w-full transition-colors ${
                          isChecked
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : comment
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "text-transparent hover:bg-slate-100"
                        } ${isPending ? "opacity-50" : ""}`}
                      >
                        {isChecked ? "✓" : comment ? "●" : "·"}
                      </button>
                    </td>
                  );
                })}
                <td className="border-b border-slate-200 text-center font-semibold text-slate-700">
                  {rowSums.get(school.key) ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-semibold text-slate-700">
            <td
              style={{ width: SCHOOL_COL_WIDTH }}
              className="sticky left-0 z-10 border-r border-t border-slate-200 bg-slate-100 px-3 py-1.5"
            >
              Summe
            </td>
            {flatSlots.map((slot) => (
              <td key={slot.key} className="border-r border-t border-slate-200 text-center">
                {sums.get(slot.key) ?? 0}
              </td>
            ))}
            <td className="border-t border-slate-200 text-center">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    {commentEditor ? (
      <CommentEditorModal
        schoolName={commentEditor.schoolName}
        label={commentEditor.label}
        initialValue={commentEditor.value}
        onSave={saveCommentEditor}
        onCancel={() => setCommentEditor(null)}
      />
    ) : null}
    </>
  );
}

function SchoolEditForm({
  school,
  onSave,
  onCancel,
}: {
  school: OverviewSchool;
  onSave: (name: string, ort: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(school.name);
  const [ort, setOrt] = useState(school.ort ?? "");

  return (
    <div className="flex flex-col gap-1">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="rounded border border-slate-300 px-1.5 py-0.5 text-xs"
      />
      <input
        value={ort}
        onChange={(e) => setOrt(e.target.value)}
        placeholder="Ort"
        className="rounded border border-slate-300 px-1.5 py-0.5 text-xs"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(name, ort)}
          className="rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

function CommentEditorModal({
  schoolName,
  label,
  initialValue,
  onSave,
  onCancel,
}: {
  schoolName: string;
  label: string;
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-slate-900">Kommentar</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {schoolName} · {label}
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          rows={3}
          placeholder="z.B. abgesagt wegen Krankheit"
          className="mt-3 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onSave(value)}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
