# Phase 1A - Performance & Architecture Foundation

## Mission
Make Caterly fast before making Caterly bigger.

Phase 1A establishes the technical rules protecting Caterly's primary competitive advantage: an operator should almost never feel like they are waiting for the software.

## Outcomes
- Common navigation and event interactions feel immediate.
- Normal pages do not load entire large reference tables merely to populate selectors.
- One slow query, report, or optional integration cannot freeze the application.
- Expensive business logic has a clear home outside React page components.
- Critical queries are indexed and measurable.
- Performance can be observed rather than guessed.
- Caterly has explicit performance budgets and regression criteria.
- Heavy future work has a defined background-processing boundary without premature microservices.

## Performance budgets
Initial product targets:
- Interaction feedback: 50-100 ms perceived.
- Search results beginning to appear: around 200 ms where infrastructure permits.
- Typical simple write acknowledgement: around 300 ms where practical.
- Navigation must immediately acknowledge user intent even when destination data is still loading.
- Heavy reports and exports must not block global navigation.
- Optional integrations must never make Core unusable.

Required work:
- Server timing instrumentation around major data operations.
- Client web-vital monitoring.
- Database slow-query visibility.
- Baselines for dashboard, event list/detail, client/menu search, calendar and reports.
- Repeatable performance test dataset.

## Search-first selection
Large dropdowns are incompatible with Caterly's long-term design. Growth-sensitive data includes clients, contacts, events, leads, menu items, staff and venues.

Selectors should render without downloading the whole dataset, accept typing immediately, use controlled/debounced indexed queries, return a small ranked result set, support keyboard navigation, allow quick-create where appropriate, and optionally cache recent selections.

The event page should stop requiring all clients, venues, active menu items and staff simply to render.

Anticipate indexes such as organization plus client name/email, event number/name/date, menu item name, staff name, venue name and lead status/date.

Large-data acceptance fixture: at least 25,000 clients, 50,000 historical events, 2,000 menu items and 1,000 staff. Opening an event must not transfer those datasets merely to render selectors.

## Non-blocking interaction model
Classify work as immediate local interaction, fast server mutation, or heavy/background operation.

Safe mutations should provide immediate feedback and reconcile with the server. Optimistic changes must recover correctly if rejected and must never silently lose input.

Large reports, exports, supplier/accounting synchronization, bulk email, large PDF work and future forecasting should be asynchronous when sufficiently expensive.

Acceptance: deliberately slowing a report or optional service cannot prevent navigation to and editing of an event.

## Loading and rendering
- Stable application chrome appears immediately.
- Use route/section loading boundaries where useful.
- Split expensive secondary sections from critical event information when needed.
- Prefer useful skeleton states over blank screens.
- Prefetch likely navigation where beneficial.
- Do not fetch data that is not required for the visible workflow.
- Parallelize independent database reads safely.

Critical event facts are identity, date/time, status, client, guest count and location. Secondary sections may load independently if necessary.

## Domain/service boundary
Remain a Next.js monolith for now; do not introduce microservices.

Logical direction:
UI/routes -> application actions/services -> Caterly domain logic -> persistence/integrations.

Domain areas include events, menus, packages, production, pricing, payments, staffing and leads.

React components focus on presentation and interaction. Server actions validate intent, authorize, invoke services, persist and return/revalidate. Calculations should be pure/testable where possible. Future workers must be able to invoke the same domain rules as the web UI.

Initial extraction targets: scheduling conflicts, event copying, package application, production rollups and future payment-plan logic. Pricing totals remain centralized.

Acceptance: critical business rules can be unit tested without rendering a Next.js page.

## Database discipline
- Review primary list/detail queries.
- Eliminate obvious N+1 patterns.
- Select only required columns for search/list results.
- Paginate/cursor large lists.
- Add indexes based on actual access patterns.
- Move large reporting aggregation toward PostgreSQL.
- Establish query-plan inspection for slow queries.
- Avoid unbounded findMany calls on growth-sensitive tables.

Detail queries may be rich. List queries must be bounded. Search queries must be small and indexed. Reports should aggregate near the data.

## Caching
Good candidates include company configuration, role definitions, static reference data, menu categories, selected venue metadata, recent selections and short-lived non-critical dashboard summaries.

Use caution with guest count, event menu, payments, staffing, status and production requirements. Operational correctness beats stale speed. Cache invalidation must be deliberate.

## Background work boundary
Do not overbuild infrastructure yet. Future jobs should support queued, running, completed, failed and retrying states and carry organization, initiating user, type, reference/input, timestamps, retries and useful failure context.

The key requirement is architectural: future heavy work must not assume it belongs in a blocking page request.

## Error isolation
- Route/section error boundaries.
- Useful user-facing errors.
- Structured server logging.
- Request/correlation identifiers where practical.
- Optional integration failures isolated from Core.
- Failed background work visible/retryable.
- Secondary dashboard failures cannot blank the application.

## Keyboard foundation
Prepare reusable primitives for global search, Ctrl/Cmd+K command palette, keyboard-selectable results, quick create and recently opened records. Phase 1D will polish the workflow.

## Large development fixture
Create reproducible non-production seed data approximating a mature operator: 25,000 clients, 50,000 events, 2,000 menu items, 1,000 staff, 500 venues, plus realistic event items, payments, shifts and tasks.

Use it to test boot/navigation, search, event open, client history, calendar, reports, menu lookup and staff lookup.

## Testing and CI
Add tests for pricing, extracted scheduling conflicts, package application, production rollups, search behavior, pagination boundaries and important failure behavior.

CI gates: type checking, lint, unit tests and production build. Expensive performance/load checks may initially run separately.

## Explicitly deferred
Microservices, Kubernetes, Kafka, broad Redis infrastructure, supplier APIs, accounting APIs, native mobile apps, advanced analytics and advanced workforce scheduling are not required in Phase 1A.

## Completion gate
- [ ] Performance baselines exist.
- [ ] Slow-query visibility exists.
- [ ] Performance budgets are documented.
- [ ] Growth-sensitive selectors use search/bounded loading.
- [ ] Large lists are bounded/paginated.
- [ ] Critical queries have appropriate indexes.
- [ ] Major domain rules have begun moving out of route/UI files.
- [ ] Extracted domain logic is independently testable.
- [ ] Heavy work has a defined asynchronous boundary.
- [ ] Error boundaries prevent secondary failures taking down the application.
- [ ] CI protects type/lint/test/build quality.
- [ ] A realistic large test dataset exists.
- [ ] Caterly remains responsive during a deliberately slow secondary operation.

**Gate statement:** Caterly has a measurable architecture for staying fast as data and features grow.
