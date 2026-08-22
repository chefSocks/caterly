# Phase 1A.1 - Performance Baseline Runbook

## Purpose

Phase 1A.1 gives Caterly a repeatable way to measure performance before optimization work begins.

The goal is to answer three separate questions instead of treating a slow screen as one problem:

1. How long did PostgreSQL/Prisma queries take?
2. How long did server-side application calculations take?
3. How did the page feel in the browser?

## Instrumentation added

### Database query timing

The shared Prisma client records every Prisma operation when `CATERLY_PERF_LOG=1`.

Log shape:

```json
{
  "type": "caterly.db_query",
  "model": "Event",
  "operation": "findMany",
  "durationMs": 42.7,
  "slow": false
}
```

`CATERLY_SLOW_QUERY_MS` controls the threshold used to mark a query as slow. The initial default is 100 ms.

### Server operation timing

`src/lib/performance.ts` provides `measureAsync` and `measureSync` for route/service operations that include more than one database query or significant application-side calculations.

The Dashboard is the first benchmark route and reports:

- `dashboard.data`
- `dashboard.derive`

Log shape:

```json
{
  "type": "caterly.server_timing",
  "name": "dashboard.data",
  "durationMs": 81.2
}
```

### Browser Core Web Vitals

The application shell reports Next.js Core Web Vitals when `NEXT_PUBLIC_CATERLY_PERF_LOG=1`.

Metrics include LCP, INP, CLS and other metrics reported by Next.js.

## Enabling baseline logging

Set the following in the local environment:

```env
CATERLY_PERF_LOG="1"
CATERLY_SLOW_QUERY_MS="100"
NEXT_PUBLIC_CATERLY_PERF_LOG="1"
```

Restart the application after changing client-visible environment variables.

## Baseline routes

Record at least five runs for each route after one warm-up navigation.

| Workflow | Route | Primary concern |
| --- | --- | --- |
| Dashboard | `/` | broad company-history queries and derived balances |
| Event list | `/events` | search/filter query and event totals |
| Event detail | `/events/:id` | large reference-table selector loads |
| New event | `/events/new` | all clients/venues/packages loaded before wizard |
| Clients | `/clients` | unbounded clients plus full event histories |
| Client detail | `/clients/:id` | full historical event relationship |
| Menu | `/menu` | unbounded menu list |
| Packages | `/menu/packages` | full active-menu selector |
| Staff | `/staff` | all staff plus all future shifts and venues |
| Calendar | `/calendar` | unnecessary items/payments loaded for calendar events |
| Reports | `/reports` | broad relational load and Node-side aggregation |

## What to record

For each workflow capture:

- Server data timing where instrumented.
- Number of Prisma queries.
- Slowest Prisma query.
- Total visible database-query time as a directional signal.
- Browser LCP.
- Browser INP after interacting with the page.
- Any visible blocking/freeze behavior.
- Approximate number of records represented in the database.

Do not add individual Prisma query durations together and treat that as wall-clock page time when queries execute concurrently. The values are diagnostic signals, not a substitute for route timing.

## Baseline table

Populate before changing the associated route.

| Workflow | Dataset | Server/data ms | Slowest DB ms | LCP ms | INP ms | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Dashboard | seed | TBD | TBD | TBD | TBD | |
| Event list | seed | TBD | TBD | TBD | TBD | |
| Event detail | seed | TBD | TBD | TBD | TBD | |
| New event | seed | TBD | TBD | TBD | TBD | |
| Clients | seed | TBD | TBD | TBD | TBD | |
| Menu | seed | TBD | TBD | TBD | TBD | |
| Calendar | seed | TBD | TBD | TBD | TBD | |
| Reports | seed | TBD | TBD | TBD | TBD | |

Repeat the same table after the Phase 1A large-data fixture exists.

## Performance targets

Initial product targets from the Phase 1A milestone:

- Immediate user feedback: approximately 50-100 ms perceived.
- Search results beginning to appear: approximately 200 ms where infrastructure permits.
- Typical simple write acknowledgement: approximately 300 ms where practical.
- Heavy reporting must never block global navigation.
- Optional integrations must never freeze Core.

These are product targets. Baselines may be slower; the point of Phase 1A is to identify and remove the causes.

## Optimization discipline

For each P0/P1 performance issue:

1. Record baseline.
2. Change one architectural/query pattern.
3. Verify output correctness.
4. Record the same measurements again.
5. Document the improvement or regression.
6. Commit the change separately enough to understand what caused the result.

## First benchmark

Dashboard is the first target because it is the default landing screen and currently reads broad event history for outstanding balances.

After collecting its baseline, Phase 1A should optimize that data path and compare the before/after values before moving to Event Detail and New Event selectors.
