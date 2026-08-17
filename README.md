# Meldetool Schulsport Meißen

Online-Meldung und Übersicht für die Schulsportwettbewerbe im Schulbereich Meißen –
ersetzt den bisherigen Excel-Anhang-per-Mail-Ablauf.

## Was es tut

- `/melden/grundschule` – Formular für Grundschulen (Schule per Dropdown, dann ankreuzen).
- `/melden/weiterfuehrend` – Formular für Oberschulen/Gymnasien/BSZ.
- `/uebersicht` – passwortgeschützte Übersicht (zwei Tabellen: Grundschulen,
  weiterführende Schulen), Zellen sind klickbar für nachträgliche Korrekturen,
  Summenzeile je Wettkampf.
- Ein erneutes Absenden eines Formulars ersetzt die vorherige Meldung dieser Schule.

Schulliste und Wettkampf-Struktur stehen in `src/lib/schools.ts` und
`src/lib/slots.ts` – dort auch anpassen, wenn sich für eine neue Saison Schulen
oder Wettkämpfe ändern (kein Admin-UI dafür, bewusst aus Zeitgründen).

## Lokal entwickeln

Voraussetzung: eine lokale Postgres-Datenbank läuft (z.B. via `brew install postgresql@16`).

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, SITE_PASSWORD, SESSION_SECRET eintragen
npm run seed                 # legt Tabellen an und befüllt Schulen/Wettkämpfe
npm run dev
```

Öffnet auf http://localhost:3000.

## Deployment (Vercel)

1. Bei [vercel.com](https://vercel.com) mit GitHub-Account anmelden (kostenlos).
2. Dieses Projekt in ein GitHub-Repo pushen, dann in Vercel „Add New Project" und
   das Repo auswählen (Root Directory: `meldetool`, falls im Monorepo).
3. Im Vercel-Projekt unter „Storage" eine Postgres-Datenbank hinzufügen (Neon,
   kostenlos) – verbindet `DATABASE_URL` automatisch.
4. Unter „Settings → Environment Variables" zusätzlich setzen:
   - `SITE_PASSWORD` – das gemeinsame Passwort für die Übersicht.
   - `SESSION_SECRET` – ein zufälliger langer String (z.B. `openssl rand -hex 32`).
5. Deployen. Einmalig danach lokal mit der Produktions-`DATABASE_URL` in
   `.env.local` `npm run seed` laufen lassen, um Schulen/Wettkämpfe einzuspielen.
6. Die beiden Formular-Links (`/melden/grundschule`, `/melden/weiterfuehrend`) per
   Mail an die Schulen verschicken wie bisher, nur statt der Excel-Datei.
