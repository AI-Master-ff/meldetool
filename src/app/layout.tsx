import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meldetool Schulsport Meißen",
  description: "Online-Meldung und Übersicht für Schulsportwettbewerbe im Schulbereich Meißen",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
