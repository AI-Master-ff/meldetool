import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schulsportwettbewerbe Meißen</h1>
        <p className="mt-2 text-slate-600">
          Meldeliste für Schuljahr 2026/2027 – Schulbereich Meißen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/melden/grundschule"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">Grundschulen</h2>
          <p className="mt-1 text-sm text-slate-500">Meldeliste für Grundschulen ausfüllen</p>
        </Link>
        <Link
          href="/melden/weiterfuehrend"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">Weiterführende Schulen</h2>
          <p className="mt-1 text-sm text-slate-500">
            Meldeliste für Oberschulen, Gymnasien und BSZ ausfüllen
          </p>
        </Link>
      </div>

      <Link href="/uebersicht" className="text-sm font-medium text-blue-600 hover:underline">
        Zur Übersicht →
      </Link>
    </main>
  );
}
