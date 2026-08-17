import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ schule?: string; anzahl?: string }>;
}) {
  const { schule, anzahl } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-xl border border-green-200 bg-green-50 p-8">
        <h1 className="text-2xl font-bold text-slate-900">Meldung gespeichert</h1>
        <p className="mt-3 text-slate-700">
          {schule ? (
            <>
              Danke! Die Meldung für <span className="font-semibold">{schule}</span> wurde mit{" "}
              {anzahl ?? "0"} ausgewählten Wettkämpfen gespeichert.
            </>
          ) : (
            "Danke, die Meldung wurde gespeichert."
          )}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Falls sich noch etwas ändert, kann das Formular einfach erneut ausgefüllt und abgeschickt
          werden – die vorherige Meldung wird dann ersetzt.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
          Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
