import type { ReactNode } from "react";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { Button } from "@/components/ui";

export const COMPANY = {
  name: "Your Catering Co.",
  tagline: "Catering & Events",
  email: "events@yourcatering.co",
  phone: "(555) 010-2030",
};

export function PrintSheet({
  docTitle,
  backHref,
  children,
}: {
  docTitle: string;
  backHref: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex justify-between gap-2 print:hidden">
        <Link href={backHref}>
          <Button variant="ghost">← Back to event</Button>
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="mb-6 flex items-start justify-between border-b border-slate-300 pb-4">
          <div>
            <h1 className="text-xl font-semibold">{COMPANY.name}</h1>
            <p className="text-sm text-slate-500">{COMPANY.tagline}</p>
            <p className="text-xs text-slate-500">
              {COMPANY.email} · {COMPANY.phone}
            </p>
          </div>
          <p className="text-lg font-semibold uppercase tracking-wide">{docTitle}</p>
        </header>
        {children}
      </article>
    </div>
  );
}

export function InfoGrid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="mb-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-dotted border-slate-200 pb-1">
          <dt className="text-slate-500">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
