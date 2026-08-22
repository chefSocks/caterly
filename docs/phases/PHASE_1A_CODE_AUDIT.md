# Phase 1A Code Audit

## Purpose

This audit evaluates the current Caterly codebase against the Phase 1A goal: **make Caterly measurably fast, non-blocking, scalable, and architecturally ready to grow without recreating legacy-software performance problems.**

The current code is a good early MVP: simple Next.js server components, server actions, Prisma, and PostgreSQL with very little unnecessary infrastructure. The main Phase 1A issue is not an overcomplicated stack. It is that many pages were correctly optimized for speed of development and small seed data, but now rely on unbounded queries, broad relational includes, and in-memory calculations that will become expensive as real data accumulates.

The recommendation is to keep the stack simple and fix query shape, data access boundaries, domain extraction, instrumentation, pagination/search, and loading/error isolation before introducing additional infrastructure.

---

# Severity Definitions

## P0 - Fix first

A pattern that directly threatens Caterly's core speed objective at realistic company scale or creates a foundation that becomes expensive to reverse later.

## P1 - Fix during Phase 1A

A meaningful scaling, architecture, observability, or responsiveness problem that should be addressed before Phase 1A closes.

## P2 - Improve after P0/P1

Useful efficiency or maintainability work that is not currently the primary bottleneck.

---

# Executive Findings

## P0-1: Dashboard outstanding-balance query is unbounded

Current behavior:

The Dashboard requests every event with status DEFINITE or COMPLETED and includes each event's full client, items, and payments collections. Application code then calculates totals for every event, filters those with balances, sorts them, sums them, and finally displays only a small subset.

Why this matters:

At 50,000 historical events, opening the Dashboard can become proportional to the company's entire operational history. This is exactly the type of startup/landing-page degradation Caterly is intended to avoid.

Required direction:

- Move total/balance aggregation closer to PostgreSQL.
- Only retrieve the events actually needed for the displayed balance list.
- Consider materialized/derived financial summary strategy later if calculation complexity requires it.
- Keep dashboard primary content bounded.

Priority: **P0**

---

## P0-2: Client list is fully unbounded and loads full event financial history

Current behavior:

The Clients page performs `client.findMany` without a `take`, cursor, or page boundary. For every client returned it includes every event, and every included event includes all items and payments. Lifetime value is calculated in application memory.

Why this matters:

With 25,000 clients and years of event history, this becomes a very large relational read simply to render a client table.

Required direction:

- Paginate/search clients.
- Return only display fields in the list query.
- Compute event count and lifetime value with database aggregation or a purpose-built summary query.
- Avoid loading event items/payments for every client on the list screen.

Priority: **P0**

---

## P0-3: Event detail loads entire client, venue, menu-item, and staff reference datasets

Current behavior:

Opening one event queries the event and its operational relationships, then in parallel loads:

- every client;
- every venue;
- every active menu item;
- every active staff member.

These datasets are used to populate selectors/forms.

Why this matters:

This creates an O(company-size) cost on the single most important page in Caterly. Event Detail should remain fast even if the company has tens of thousands of clients, thousands of menu items, and large staff lists.

Required direction:

- Replace growth-sensitive selectors with search-first controls.
- Load the current selected record plus small search result pages, not the full table.
- Create reusable async search/select primitives.
- Keep event-detail critical data independent from selector datasets.

Priority: **P0**

---

## P0-4: New Event page also loads complete reference datasets

Current behavior:

The New Event route loads all clients, all venues, and all active packages before rendering the booking wizard.

Why this matters:

Event creation is a primary workflow. Its startup cost should not grow linearly with the customer database.

Required direction:

- Search client and venue on demand.
- Packages can remain bounded if package count is known to stay small; otherwise use search as well.
- Preserve support for a preselected client via URL without loading all clients.

Priority: **P0**

---

## P0-5: Leads board loads every lead into one server-rendered page

Current behavior:

The Leads page loads all leads and then repeatedly filters the in-memory array into pipeline columns.

Why this matters:

A growing sales database will steadily increase route payload and render work. Won/lost historical leads should not permanently increase the cost of opening the active sales pipeline.

Required direction:

- Default pipeline should focus on active/recent leads.
- Add bounded queries by status with counts/aggregate pipeline value.
- Provide history/search views separately.
- Add pagination or cursor loading for large stages.

Priority: **P0** for preventing unbounded active-route growth.

---

## P0-6: Menu library and staff/venue administration are unbounded

Current behavior:

The Menu library loads every matching menu item with recipe/packing counts and has no page bound. Staff administration loads all staff with all upcoming shifts and all venues. Menu Packages loads all packages with components and every active menu item into a multi-select.

Why this matters:

Menu and staff are explicit Phase 1A scale-test datasets. These routes will become expensive and the package multi-select will become unusable long before the database itself becomes a problem.

Required direction:

- Paginate menu/staff/venue lists.
- Search package components rather than render every menu item in a large multi-select.
- Limit upcoming staff shift lookahead or fetch shift details on demand.
- Use narrow `select` shapes for list screens.

Priority: **P0/P1**, with package item selection and menu pagination treated as P0 before scale testing.

---

# P1 Findings

## P1-1: Event list is bounded but not actually paginated

Current behavior:

Events are limited to 200 records. The list includes complete item and payment collections for each event solely so application code can compute totals and balances.

Risks:

- Results after 200 silently disappear instead of being navigable.
- Each list record carries child rows that are not displayed individually.
- Text search uses case-insensitive `contains`, which may not use existing B-tree indexes effectively for arbitrary substrings.

Required direction:

- Cursor/page navigation.
- Purpose-built summary query for event totals/balance.
- Select only fields displayed.
- Review search strategy/indexes, likely PostgreSQL trigram/full-text style indexes where appropriate.

Priority: **P1**

---

## P1-2: Reports load the full operational graph and aggregate in Node

Current behavior:

Reports query all non-cancelled events in a selected date range and include clients, event items/menu items, payments, shifts, and staff. Revenue, food cost, labour cost, month totals, top items, and top clients are calculated with JavaScript loops.

Risks:

Large date ranges transfer and instantiate large object graphs in application memory and make report time proportional to raw record volume.

Required direction:

- Move SUM/GROUP BY style metrics into PostgreSQL.
- Split independent report cards/sections so one expensive metric does not block all report content.
- Run genuinely expensive future analytics asynchronously.

Priority: **P1**

---

## P1-3: Calendar loads items and payments for every event in the month

Current behavior:

Calendar displays event name/time/guest count/status but also loads all event items and payments in order to calculate a monthly booked-revenue subtitle.

Required direction:

- Calendar event query should select only calendar fields.
- Monthly booked revenue should be calculated separately/aggregated near the database.

Priority: **P1**

---

## P1-4: Client detail loads complete lifetime event child data

Current behavior:

A client detail page loads the client's entire event history, including every event's items and payments, to calculate lifetime value and display history.

Required direction:

- Aggregate lifetime value separately.
- Paginate event history.
- Load only list fields plus precomputed/queried total.

Priority: **P1**

---

## P1-5: All major routes are force-dynamic with no explicit cache strategy

Current behavior:

Dashboard, events, clients, leads, menu, staff, calendar, reports and event detail use `dynamic = "force-dynamic"`.

Why this matters:

Fresh operational state is important, so dynamic rendering is not inherently wrong. However, the current code has no differentiated strategy between highly volatile event state and safe reference/configuration data.

Required direction:

- Keep critical operational facts fresh.
- Introduce deliberate caching only for appropriate reference/configuration data.
- Avoid global cache-first behavior.
- Document invalidation policy.

Priority: **P1**

---

## P1-6: Broad `revalidatePath` fan-out after event mutations

Current behavior:

Event mutations call a shared refresh helper that revalidates `/events`, `/calendar`, `/`, and the event detail route. This occurs for many small operations including menu items, payments, shifts and tasks.

Risk:

As routes become richer, broad invalidation can generate unnecessary recomputation and undermine optimistic/local interaction patterns.

Required direction:

- Measure actual effect before changing behavior.
- Prefer targeted refresh/invalidation based on what changed.
- Introduce optimistic UI for safe high-frequency actions where appropriate.
- Keep financial/event authority on server.

Priority: **P1**

---

## P1-7: Business logic is concentrated in route/action files

Current behavior:

`src/app/events/actions.ts` contains event creation/update/status, deletion, copying, menu-line handling, package application, payments, scheduled payments, staffing conflict logic and tasks. Production rollup logic lives in the Kitchen print page.

Risk:

Future workers, APIs and modules will either import route-layer logic awkwardly or duplicate business rules.

Required extraction order:

1. production rollup;
2. package application;
3. staffing conflict detection;
4. event copy semantics;
5. pricing/payment-domain rules as they grow.

Priority: **P1**

---

## P1-8: No performance/query instrumentation

Current behavior:

The Prisma client is instantiated cleanly but has no application-level slow-query logging/timing hooks. No application performance instrumentation is present in the current tree.

Required direction:

- Introduce dev/staging query timing and slow-query logging.
- Add route/service timing helpers where useful.
- Capture web vitals/perceived performance baseline.
- Define baseline metrics before claiming improvements.

Priority: **P1 and first implementation task**

---

## P1-9: Database indexes are too sparse for planned search patterns

Current state:

Useful basic indexes exist on fields such as Client name, MenuItem name/category, Event startAt/clientId, EventItem eventId, Payment eventId, shifts and tasks. However, the application commonly uses case-insensitive substring search and will later add Organization scoping.

Required direction:

- Audit all query plans with realistic data.
- Add composite Organization + common sort/search indexes once tenancy exists.
- Consider PostgreSQL `pg_trgm`/GIN indexes for substring name/email searches if retained.
- Index lead status/date and venue/staff lookup patterns as needed.
- Do not add speculative indexes without measuring query plans.

Priority: **P1**

---

## P1-10: No test runner/test script and no visible CI workflow

Current behavior:

`package.json` provides dev/build/start/lint/typecheck/migrate/seed scripts but no test script. The repository tree does not contain test files or a `.github/workflows` CI configuration.

Required direction:

- Choose a lightweight test runner.
- Add domain unit tests during extraction.
- Add CI for typecheck, lint, tests and production build.
- Add performance/load testing separately from normal CI initially.

Priority: **P1**

---

## P1-11: No route-level loading boundaries visible in repository

Current behavior:

There is a root `error.tsx` and `not-found.tsx`, but no `loading.tsx` files are present in the current application tree.

Required direction:

- Add loading boundaries to high-value routes once query shaping is corrected.
- Avoid using skeletons to hide bad queries; fix query cost first.
- Event critical header/data should not wait unnecessarily on secondary sections.

Priority: **P1**

---

# P2 Findings

## P2-1: Multiple queries retrieve broader row shapes than needed

Examples include full client/event/menu/staff objects where only IDs/names or display fields are used.

Required direction:

Adopt purpose-specific `select` shapes for list/search queries. This reduces serialization, memory and accidental coupling.

---

## P2-2: Page-level calculations repeat summary work

`summarize(event)` is called repeatedly in loops and across routes. The function itself is lightweight, but at high record counts the larger issue is that the raw child rows must first be loaded.

Required direction:

Solve data aggregation first. Avoid micro-optimizing function calls until query volume is fixed.

---

## P2-3: Package management UI will not scale ergonomically

The multi-select of every active menu item is both a performance and UX issue. Replace it with searchable add/remove package composition.

---

# Positive Findings to Preserve

## 1. Stack simplicity

Next.js + Prisma + PostgreSQL is appropriate. No architectural rewrite is justified.

## 2. Parallel data loading already appears in important routes

The code frequently uses `Promise.all` for independent queries, which is a good pattern.

## 3. Data model has useful baseline indexes

The schema is not completely unindexed; foundational indexes already exist on several foreign keys and common fields.

## 4. Central pricing utilities already exist

Financial total calculations are already centralized rather than duplicated everywhere. Preserve this approach and expand it into broader domain boundaries.

## 5. Prisma client lifecycle is correctly guarded in development

The global Prisma singleton pattern prevents unnecessary client creation during development hot reload.

## 6. Basic error/not-found boundaries already exist

This provides a starting point for finer-grained failure isolation.

---

# Recommended Phase 1A Implementation Order

## 1A.1 - Instrument before optimization

Deliverables:

- Query timing/slow-query visibility.
- Route/service timing helper.
- Baseline document for key routes.
- Web-vital/perceived-performance capture strategy.

Measure:

- Dashboard.
- Event list.
- Event detail.
- New event.
- Clients.
- Menu.
- Calendar.
- Reports.

Reason:

Without a baseline we cannot prove that Phase 1A changes improve Caterly.

---

## 1A.2 - Fix the worst unbounded reads

Order:

1. Dashboard outstanding balances.
2. Client list.
3. Event Detail reference datasets.
4. New Event reference datasets.
5. Menu library/package item selection.
6. Leads pipeline.
7. Staff/venues.

Introduce bounded list/search patterns and database aggregation.

---

## 1A.3 - Build reusable async search/select primitives

Create a standard fast selector for:

- client;
- venue;
- menu item;
- staff.

Properties:

- small result pages;
- minimum/debounced search where appropriate;
- keyboard navigation;
- loading/error state;
- current selected value support;
- reusable authorization/organization scoping later.

---

## 1A.4 - Pagination/bounded lists

Add proper navigation for:

- clients;
- events;
- menu items;
- leads/history;
- staff/venues where necessary;
- client event history.

Never silently cap results without a way to continue.

---

## 1A.5 - Reporting and aggregate-query refactor

Move dashboard/report/list summary calculations toward PostgreSQL. Keep heavy analytical work separate from interactive route-critical work.

---

## 1A.6 - Extract first domain services

Suggested modules:

- `src/domain/production`
- `src/domain/packages`
- `src/domain/staffing`
- `src/domain/events`

Keep the existing Next.js monolith; this is logical separation, not service infrastructure.

---

## 1A.7 - Loading and error isolation

After query work:

- route loading states;
- independent secondary sections where justified;
- granular error boundaries;
- preserve usable application chrome/navigation during secondary failures.

---

## 1A.8 - Large realistic data fixture

Generate non-production load data approximating:

- 25,000 clients;
- 50,000 events;
- 2,000 menu items;
- 1,000 staff;
- 500 venues;
- realistic items/payments/shifts/tasks.

Use this fixture to verify every P0 fix.

---

## 1A.9 - Tests and CI

Add:

- test runner;
- unit tests for extracted domain code;
- integration tests for important query/service paths;
- CI: typecheck + lint + tests + build.

---

# Route-by-Route Risk Summary

| Route / Area | Risk | Main Issue |
| --- | --- | --- |
| Dashboard | P0 | Unbounded all-history outstanding-balance graph |
| Event Detail | P0 | Loads all clients, venues, menu items and staff |
| New Event | P0 | Loads all clients/venues/packages |
| Clients | P0 | Unbounded clients + full event/item/payment history |
| Leads | P0 | Entire lead history loaded and filtered in memory |
| Menu | P0/P1 | Unbounded item library |
| Menu Packages | P0/P1 | Loads all active menu items into multi-select |
| Staff/Venues | P1 | Unbounded staff + future shifts + venues |
| Events List | P1 | 200 cap without pagination + child financial rows |
| Calendar | P1 | Child items/payments loaded for summary only |
| Reports | P1 | Large operational graph aggregated in Node |
| Client Detail | P1 | Entire lifetime event graph loaded |
| Event Actions | P1 | Broad invalidation + large mixed domain file |
| Kitchen Rollup | P1 | Production domain logic inside print route |
| Database Layer | P1 | No query timing/instrumentation |
| Test/CI | P1 | No test script/workflow visible |

---

# Phase 1A First Coding Recommendation

Do **not** start by adding Redis, queues, microservices, or broad caching.

Start with two small foundation changes:

1. **Add performance/query instrumentation so every following change is measurable.**
2. **Refactor the Dashboard outstanding-balance calculation as the first P0 query.**

The Dashboard is the ideal first optimization because it is the application's landing page and currently contains the clearest all-history unbounded query. This gives Caterly its first before/after performance measurement and establishes the database-aggregation pattern we can reuse on Clients, Events and Reports.

After that, tackle Event Detail search-first selectors because Event Detail is the application's most important long-term workspace.

---

# Audit Conclusion

Caterly does **not** currently have a fundamental technology-stack performance problem.

It has a normal early-MVP data-access problem: broad dynamic routes, unbounded reads, large relation includes, and application-side aggregation.

That is a favorable position. We can preserve the simple architecture and make Caterly substantially more scalable through disciplined query design, PostgreSQL aggregation/indexing, bounded search, domain extraction, and non-blocking UI boundaries.

The most important Phase 1A rule from this audit is:

> **No Core route should become slower merely because the company has accumulated more historical records that are irrelevant to the user's current task.**

That rule should guide the first implementation pass.
