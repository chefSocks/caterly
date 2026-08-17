"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { cn } from "@/components/ui";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/events", label: "Events", icon: ClipboardList },
  { href: "/leads", label: "Leads", icon: Sparkles },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/staff", label: "Staff", icon: ChefHat },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:h-dvh md:w-56 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-4 dark:border-slate-800 dark:bg-slate-900 print:hidden">
      <Link
        href="/"
        className="mb-2 hidden items-center gap-2 px-2 text-lg font-semibold tracking-tight md:flex"
      >
        <UtensilsCrossed className="size-5" />
        Caterly
      </Link>
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
