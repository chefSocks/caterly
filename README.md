# Caterly

Catering & event management — a fast, modern replacement for Caterease.

Phase 1 covers the day-to-day workflow: leads → booked event → menu & pricing →
BEO / kitchen sheet / invoice → payments, staffing and tasks.

## Features

- **Dashboard** — booked revenue this month, upcoming events, open tasks, balances owing.
- **Leads pipeline** — new / contacted / proposal sent / won / lost, one-click convert to a booked event.
- **Clients** — contact details, event history, lifetime value.
- **Events** — 3-step booking wizard, list with search/status/date filters, month calendar, event copy.
- **Menu library** — items with price, food cost, margin, recipe lines and equipment packing lines; per-guest packages.
- **Event menu builder** — pull from the library or add custom lines, per-line quantity/price/taxable.
- **Pricing** — service charge %, tax %, discount, live subtotal/total/balance.
- **Money** — payments (cash/check/card/ACH), deposit schedules with due dates and paid flags.
- **Staffing** — roster with hourly rates, per-event shifts, double-booking conflict detection.
- **Prints** — BEO, kitchen production sheet (recipe + packing rollups), invoice. Print/PDF via the browser.
- **Reports** — revenue booked/collected/outstanding, food & labour cost, revenue per guest, revenue by month, top items and clients.

## Stack

Next.js (App Router, server components + server actions), TypeScript, Tailwind CSS,
PostgreSQL, Prisma.

## Local setup

```bash
# 1. Postgres
sudo -u postgres psql -c "CREATE ROLE caterly LOGIN PASSWORD 'caterly';"
sudo -u postgres psql -c "CREATE DATABASE caterly OWNER caterly;"

# 2. Env
cp .env.example .env   # then set the password you used above

# 3. Install, migrate, seed
npm install
npm run db:migrate
npm run db:seed

# 4. Run
npm run dev            # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Sample clients, menu, events, leads, staff |

## Not in phase 1

Auth/users & permissions, Stripe payments, client portal, email sending,
QuickBooks/Xero, Google/Outlook calendar sync, room diagrams, Caterease data import,
company branding settings (see `COMPANY` in `src/components/PrintSheet.tsx`).
