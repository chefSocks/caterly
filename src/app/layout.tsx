import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { WebVitals } from "@/components/WebVitals";

export const metadata: Metadata = {
  title: "Caterly — catering & event management",
  description:
    "Fast catering management: leads, events, menus, BEOs, staffing and invoicing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <WebVitals />
        <div className="md:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 print:px-0 print:py-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
