import type { SchoolType } from "./schools";

export interface SlotDef {
  type: SchoolType;
  section: "bund" | "gleich";
  groupLabel: string; // Sportart / Wettkampf
  subLabel: string | null; // z.B. "m / WK I", "Kl.3", oder null bei Einzel-Haken
  meta: string; // Termin / Ort, nur zur Anzeige im Formular
  sortOrder: number;
}

// ---------- Grundschulen ----------
// "Bundeswettbewerb der Schulen": ein einzelner Haken pro Wettkampf.
const gsBund: { name: string; meta: string }[] = [
  { name: "Gerätturnen (Regionalfinale)", meta: "m/w/mixed · 26.11.25 · Mi · Pirna" },
  { name: "Schwimmen", meta: "mixed · 23.04.26 · Do · Radebeul" },
  { name: "Leichtathletik (Staffelwettbewerb)", meta: "mixed · 04.12.25 · Do · Meißen" },
  { name: "Sächsischer Schulcup - Crosslauf", meta: "mixed · 02.10.25 · Do · Freital" },
];

// "Gleichgestellte Wettkämpfe": jede Zeile hat nur einen Haken, aber fest bei
// einer bestimmten Klassenstufe (aus der Vorlage per Position der Checkbox
// abgelesen, nicht wählbar für die Schule).
const gsGleich: { name: string; klasse: string; meta: string }[] = [
  { name: "Minibasketball", klasse: "Kl.3", meta: "mixed · ?? · Fr · Coswig" },
  { name: "Leichtathletik Schulpokal (Vierkampf)", klasse: "Kl.3", meta: "mixed · 24.06.2026 · Mi · Coswig" },
  { name: "Fußball", klasse: "Kl.3", meta: "mixed · 27.03.26 · Fr · Meißen" },
  { name: "Völkerball", klasse: "Kl.4", meta: "mixed · 05.03.26 · Do · Meißen" },
  { name: "Athletik", klasse: "Kl.3", meta: "mixed · 15.01.26 Radebeul / 22.01.26 Weinböhla-Meißen" },
  { name: "Crosslauf", klasse: "Kl.3", meta: "13.04.26 · Mo · Coswig" },
  { name: "Floorball", klasse: "Kl.4", meta: "mixed · 19.03.26 · Di · Kl.3/4 Niederau" },
  { name: "Tanz der Schulen", klasse: "Kl.3", meta: "kein Termin in unserem Bereich" },
  { name: "Fummellauf", klasse: "Kl.3", meta: "Termin Mai · Meißen" },
];

// ---------- Weiterführende Schulen (OS/Gymnasium/BSZ) ----------
const WK_LABELS = ["WK I (U20)", "WK II (U18)", "WK III (U16)", "WK IV (U14)"];

// Pro Sportart/Geschlecht: welche der 4 WK-Klassen angeboten werden (true = anklickbar).
const wfBund: { sport: string; gender: string; avail: [boolean, boolean, boolean, boolean] }[] = [
  { sport: "Badminton", gender: "mix", avail: [true, true, true, true] },
  { sport: "Basketball", gender: "m", avail: [true, true, true, true] },
  { sport: "Basketball", gender: "w", avail: [true, true, true, true] },
  { sport: "Beach-Volleyball", gender: "mix", avail: [true, true, true, true] },
  { sport: "Floorball", gender: "mix", avail: [true, true, true, true] },
  { sport: "Fußball", gender: "m", avail: [true, true, true, true] },
  { sport: "Fußball", gender: "w", avail: [true, true, true, true] },
  { sport: "Gerätturnen", gender: "m", avail: [false, true, true, true] },
  { sport: "Gerätturnen", gender: "w", avail: [false, true, true, true] },
  { sport: "Handball", gender: "m", avail: [true, true, true, true] },
  { sport: "Handball", gender: "w", avail: [true, true, true, true] },
  { sport: "Leichtathletik", gender: "m", avail: [true, true, false, false] },
  { sport: "Leichtathletik", gender: "w", avail: [true, true, false, false] },
  { sport: "Leichtathletik", gender: "mix", avail: [false, false, true, true] },
  { sport: "Schwimmen", gender: "m", avail: [true, true, true, true] },
  { sport: "Schwimmen", gender: "w", avail: [true, true, true, true] },
  { sport: "Tennis", gender: "m", avail: [true, true, true, true] },
  { sport: "Tennis", gender: "w", avail: [true, true, true, true] },
  { sport: "Tischtennis", gender: "m", avail: [true, true, true, true] },
  { sport: "Tischtennis", gender: "w", avail: [true, true, true, true] },
  { sport: "Triathlon", gender: "mix", avail: [true, true, true, true] },
  { sport: "Volleyball", gender: "m", avail: [true, true, true, true] },
  { sport: "Volleyball", gender: "w", avail: [true, true, true, true] },
  { sport: "Judo", gender: "m", avail: [true, true, true, true] },
  { sport: "Judo", gender: "w", avail: [true, true, true, true] },
  { sport: "Ergometer-Rudern", gender: "m", avail: [false, false, true, true] },
  { sport: "Ergometer-Rudern", gender: "w", avail: [false, false, true, true] },
];

// "Gleichgestellte Wettkämpfe": ein Haken pro Zeile.
const wfGleich: { name: string; meta: string }[] = [
  { name: "Crosslauf (WK I-IV)", meta: "Coswig/Nossen" },
  { name: "Schülerliga WK I/II Volleyball Mix", meta: "LK Meißen" },
  { name: "Triball Mix WK II (VB, BB, Floorball)", meta: "Meißen" },
  { name: "Streetball m/w/mix WK I-III", meta: "Coswig" },
  { name: "Fummellauf WK I-IV", meta: "Meißen" },
];

function buildSlots(): SlotDef[] {
  let order = 0;
  const slots: SlotDef[] = [];

  for (const item of gsBund) {
    slots.push({ type: "GS", section: "bund", groupLabel: item.name, subLabel: null, meta: item.meta, sortOrder: order++ });
  }
  for (const item of gsGleich) {
    slots.push({ type: "GS", section: "gleich", groupLabel: item.name, subLabel: item.klasse, meta: item.meta, sortOrder: order++ });
  }

  order = 0;
  for (const row of wfBund) {
    row.avail.forEach((available, i) => {
      if (!available) return;
      slots.push({
        type: "WF",
        section: "bund",
        groupLabel: row.sport,
        subLabel: `${row.gender} / ${WK_LABELS[i]}`,
        meta: "",
        sortOrder: order++,
      });
    });
  }
  for (const item of wfGleich) {
    slots.push({ type: "WF", section: "gleich", groupLabel: item.name, subLabel: null, meta: item.meta, sortOrder: order++ });
  }

  return slots;
}

export const slots: SlotDef[] = buildSlots();

export function slotKey(s: { groupLabel: string; subLabel: string | null }): string {
  return `${s.groupLabel}::${s.subLabel ?? ""}`;
}

export function slotsForType(type: SchoolType): SlotDef[] {
  return slots.filter((s) => s.type === type);
}

export interface SlotGroup {
  groupLabel: string;
  items: SlotDef[];
}

// Fasst aufeinanderfolgende Slots mit gleichem groupLabel zusammen, für
// gruppierte Tabellenköpfe (z.B. "Fußball" über "m / WK I", "m / WK II", ...).
export function groupSlots(items: SlotDef[]): SlotGroup[] {
  const groups: SlotGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.groupLabel === item.groupLabel) {
      last.items.push(item);
    } else {
      groups.push({ groupLabel: item.groupLabel, items: [item] });
    }
  }
  return groups;
}
