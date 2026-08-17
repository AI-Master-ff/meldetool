export type SchoolType = "GS" | "WF";

export interface SchoolDef {
  name: string;
  ort: string | null;
  type: SchoolType;
  subtype?: "OS" | "GY";
  sortOrder: number;
}

// Grundschulen (Meldeliste "Grundschulen")
const grundschulen: Omit<SchoolDef, "type" | "sortOrder">[] = [
  { name: "Burkhardswalde", ort: "Burkhardswalde" },
  { name: "Coswig-Brockwitz", ort: "Coswig" },
  { name: "EVS Coswig (Primarstufe)", ort: "Coswig" },
  { name: "Mitte Coswig", ort: "Coswig" },
  { name: "West Coswig", ort: "Coswig" },
  { name: "Freinet-Schule Friedewald", ort: "Friedewald" },
  { name: "Krögis/OT Käbschütztal", ort: "Käbschütztal" },
  { name: "Klipphausen", ort: "Klipphausen" },
  { name: "Lommatzsch", ort: "Lommatzsch" },
  { name: "Afra-Meißen", ort: "Meißen" },
  { name: "Freie Werkschule Meißen", ort: "Meißen" },
  { name: "Johannes-Meißen", ort: "Meißen" },
  { name: "Questenberg-Meißen", ort: "Meißen" },
  { name: "Arita-Grundschule Meißen", ort: "Meißen" },
  { name: "Moritzburg", ort: "Moritzburg" },
  { name: "Naustadt", ort: "Naustadt" },
  { name: "Niederau", ort: "Niederau" },
  { name: "Nossen", ort: "Nossen" },
  { name: "Evang. GS Radebeul (Evang. Schulzentrum R.)", ort: "Radebeul" },
  { name: "Kötzschenbroda Radebeul", ort: "Radebeul" },
  { name: "Naundorf Radebeul", ort: "Radebeul" },
  { name: "Niederlößnitz Radebeul", ort: "Radebeul" },
  { name: "Oberlößnitz Radebeul", ort: "Radebeul" },
  { name: "Schiller Radebeul", ort: "Radebeul" },
  { name: "Radeburg", ort: "Radeburg" },
  { name: "Raußlitz", ort: "Raußlitz" },
  { name: "Reichenberg", ort: "Reichenberg" },
  { name: "Weinböhla", ort: "Sörnewitz" },
  { name: "Zadel", ort: "Weinböhla" },
];

// Oberschulen
const oberschulen: Omit<SchoolDef, "type" | "sortOrder">[] = [
  { name: "Boxdorf", ort: "Boxdorf" },
  { name: "EVS Coswig (Sek.-stufe)", ort: "Coswig" },
  { name: "OS Kötitz", ort: "Coswig" },
  { name: "L. - F. Coswig", ort: "Coswig" },
  { name: "Evang. OS Klipphausen", ort: "Klipphausen" },
  { name: "Lommatzsch", ort: "Lommatzsch" },
  { name: "Freie Werkschule Meißen", ort: "Meißen" },
  { name: "Pesta Meißen", ort: "Meißen" },
  { name: "Triebischtal Meißen", ort: "Meißen" },
  { name: "Nossen", ort: "Nossen" },
  { name: "Kötzschenbroda Radebeul", ort: "Radebeul" },
  { name: "Radebeul - Mitte", ort: "Radebeul" },
  { name: "Radeburg", ort: "Radeburg" },
  { name: "Weinböhla", ort: "Weinböhla" },
];

// Gymnasien / BSZ
const gymnasien: Omit<SchoolDef, "type" | "sortOrder">[] = [
  { name: "Gymnasium Coswig", ort: "Coswig" },
  { name: "Franziskaneum Meißen", ort: "Meißen" },
  { name: "Gym. Luisenstift Radebeul", ort: "Radebeul" },
  { name: "Lößnitzgrundgym. Radebeul", ort: "Radebeul" },
  { name: "Gymnasium Nossen", ort: "Nossen" },
  { name: "Sä. LG St Afra Meißen", ort: "Meißen" },
  { name: "BSZ Meißen", ort: null },
  { name: "BSZ Radebeul", ort: null },
  { name: "Freies Gymnasium Weinböhla", ort: "Weinböhla" },
];

function withOrder<T>(items: T[]): (T & { sortOrder: number })[] {
  return items.map((item, i) => ({ ...item, sortOrder: i }));
}

export const schools: SchoolDef[] = [
  ...withOrder(grundschulen.map((s) => ({ ...s, type: "GS" as const }))),
  ...withOrder([
    ...oberschulen.map((s) => ({ ...s, type: "WF" as const, subtype: "OS" as const })),
    ...gymnasien.map((s) => ({ ...s, type: "WF" as const, subtype: "GY" as const })),
  ]),
];

export function schoolKey(s: { name: string; ort: string | null }): string {
  return `${s.name}::${s.ort ?? ""}`;
}

export function schoolsForType(type: SchoolType): SchoolDef[] {
  return schools.filter((s) => s.type === type);
}
