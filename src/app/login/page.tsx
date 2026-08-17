import { loginAction } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-xl font-bold text-slate-900">Übersicht – Login</h1>
      <p className="mt-1 text-sm text-slate-500">Gemeinsames Passwort eingeben.</p>

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/uebersicht"} />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {error ? <p className="text-sm text-red-600">Falsches Passwort.</p> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Anmelden
        </button>
      </form>
    </main>
  );
}
