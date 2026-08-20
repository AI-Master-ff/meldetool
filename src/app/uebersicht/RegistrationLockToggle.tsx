"use client";

import { useState, useTransition } from "react";
import { toggleRegistrationLockAction } from "./actions";

export function RegistrationLockToggle({ initialLocked }: { initialLocked: boolean }) {
  const [locked, setLocked] = useState(initialLocked);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !locked;
    setLocked(next);
    startTransition(async () => {
      try {
        await toggleRegistrationLockAction(next);
      } catch {
        setLocked(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        locked
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      } ${isPending ? "opacity-50" : ""}`}
      title={
        locked
          ? "Schulen können aktuell nicht mehr melden – klicken zum Öffnen"
          : "Schulen können aktuell melden – klicken zum Sperren"
      }
    >
      {locked ? "Meldung gesperrt" : "Meldung offen"}
    </button>
  );
}
