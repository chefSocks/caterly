"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/ui";

export type DashboardStatus = "PROSPECTIVE" | "TENTATIVE" | "DEFINITE" | "COMPLETED";

const statuses: { value: DashboardStatus; label: string }[] = [
  { value: "PROSPECTIVE", label: "Prospective" },
  { value: "TENTATIVE", label: "Tentative" },
  { value: "DEFINITE", label: "Definite" },
  { value: "COMPLETED", label: "Completed" },
];

export function DashboardEventFilters({ selected }: { selected: DashboardStatus[] }) {
  const router = useRouter();
  const [active, setActive] = useState<DashboardStatus[]>(selected);
  const [isPending, startTransition] = useTransition();

  async function toggle(status: DashboardStatus) {
    const next = active.includes(status)
      ? active.filter((value) => value !== status)
      : [...active, status];

    setActive(next);

    const response = await fetch("/api/dashboard-preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ statuses: next }),
    });

    if (!response.ok) {
      setActive(active);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Dashboard event filters">
      <span className="mr-1 text-xs font-medium text-slate-500">Show:</span>
      {statuses.map((status) => {
        const enabled = active.includes(status.value);
        return (
          <button
            key={status.value}
            type="button"
            aria-pressed={enabled}
            disabled={isPending}
            onClick={() => toggle(status.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60",
              enabled
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800",
            )}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}
