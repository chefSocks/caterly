# Caterly Phase 1 - Core Foundation

## Purpose

Phase 1 exists to turn Caterly from a promising working MVP into a dependable operational core that can support real catering work every day.

The objective is not to add every future feature. The objective is to make the basic operating loop complete, fast, connected, understandable, safe, and extensible.

Caterly Phase 1 should prove that a professional catering team can run a real event lifecycle inside Caterly without the software slowing them down or forcing repeated entry of the same information.

The product standard for Phase 1 is defined by three principles:

> **FAST** - Caterly never gets in the operator's way.
>
> **CONNECTED** - Enter information once and let it flow everywhere it is needed.
>
> **INDUSTRY-NATIVE** - Caterly behaves the way an experienced catering operator thinks.

---

# 1. Phase 1 Outcome

At the end of Phase 1, Caterly should be able to support this real-world operating sequence:

1. A lead enters Caterly.
2. The lead is qualified and worked by sales.
3. The lead is converted into a client and event without duplicate entry.
4. The event is built with accurate date, time, venue, room, guest count, service style, notes, and contacts.
5. A menu or package is assigned.
6. Event-specific menu changes can be made without damaging the master menu library.
7. Pricing is calculated consistently.
8. Deposits and payments are tracked.
9. Staffing can be assigned without schedule conflicts.
10. Kitchen production requirements are generated from the event menu.
11. Packing requirements are generated from the same event data.
12. BEO, kitchen sheet, packing information, and invoice are generated from the same source of truth.
13. Event changes propagate to the downstream areas that depend on them.
14. Users can search and navigate quickly without loading huge reference lists.
15. Important changes are traceable.
16. Heavy work does not freeze the application.
17. Multiple companies can eventually exist safely in the same Caterly platform without sharing data.

If this flow is not reliable, Phase 1 is not complete even if every screen exists.

---

# 2. Phase 1 Non-Goals

The following are intentionally not required to complete Phase 1:

- Full supplier API integrations
- Full inventory management
- Advanced live food-cost synchronization
- Restaurant forecasting
- Full Nowsta-style employee scheduling
- Time clock
- Advanced lead-generation services
- Full client portal
- Automated payment processing
- Full accounting integrations
- Advanced rentals platform
- Advanced logistics routing
- AI-driven recommendations
- Native mobile applications
- Microservice architecture
- Complex distributed infrastructure

Phase 1 should create the foundation that allows these modules to be added later without rewriting Core.

---

# 3. Phase 1 Priority Order

The work should generally be completed in this order:

1. Event as source of truth
2. Performance and perceived speed foundation
3. Domain architecture cleanup
4. Menu, package, recipe, and production integrity
5. Organization tenancy
6. Authentication and permissions
7. Audit/activity history
8. Core client and lead workflow hardening
9. Financial workflow hardening
10. Staffing workflow hardening
11. Operational documents
12. Reporting scalability
13. Testing, monitoring, and reliability
14. Real-event dogfooding and final Core polish

The reason for this order is intentional. The system should first know what the truth is, then make that truth fast to access, then connect every dependent workflow to it.

---

# 4. Event as the Central Source of Truth

The Event is the central operational record in Caterly.

Every part of Phase 1 should be designed around the principle that there is one authoritative event record and other workflows derive from it.

## 4.1 Event data requirements

Each event should support at minimum:

- Unique event ID
- Human-readable event number
- Event name
- Organization/company ownership
- Client
- Primary contact
- Venue
- Room
- Site address
- Event type
- Service style
- Status
- Guest count
- Load-in/arrival time
- Start time
- End time
- Optional additional timeline markers where required by real operations
- Client-facing notes
- Internal event notes
- Kitchen notes
- Staffing notes
- Billing notes where appropriate
- Created date
- Updated date
- Created by user
- Updated by user

## 4.2 Event status

Phase 1 should support a clear lifecycle such as:

- Prospective
- Tentative
- Definite
- Completed
- Cancelled

Status should not merely be decorative. It should eventually influence filtering, reporting, operational visibility, and future automation.

## 4.3 Event edits

Editing a core event fact should update dependent workflows where applicable.

Examples:

### Guest count change

Changing 120 guests to 150 should be reflected in:

- Per-person event menu quantities where configured
- Package quantities
- Kitchen production quantities
- Recipe requirement rollups
- Packing requirement rollups where quantity-based
- Event pricing where quantity-based
- Future staffing recommendations
- Future purchasing requirements

The Phase 1 system does not need every advanced downstream module, but the data model must make this propagation possible.

### Date/time change

Changing the event date/time should be reflected in:

- Calendar
- Staffing shifts where rules support relative scheduling
- Payment-plan dates in future automated billing
- Operational document timestamps
- Conflict detection
- Activity history

### Venue change

Changing the venue should update:

- Event details
- BEO
- Operational documents
- Future logistics and venue-specific rules

## 4.4 Event copy

Copying an event should be intentional and predictable.

A copied event should:

- Receive a new event ID and event number
- Default to a non-final status
- Copy menu lines
- Preserve event-specific descriptions and prices
- Copy appropriate notes
- Copy staffing role requirements but not blindly assign employees if that creates scheduling problems
- Copy times using a clear date offset or require new dates
- Never copy payments
- Never copy completed accounting history
- Never cause historical records to mutate

Acceptance criteria:

- A copied event is operationally independent from the original.
- Editing the copy cannot change the source event.

---

# 5. Performance and Perceived Speed Foundation

Performance is a Phase 1 feature, not post-launch optimization.

The primary reason Caterly exists is to remove the friction caused by slow, unresponsive legacy software.

## 5.1 Performance principles

Caterly should:

- Show the application shell immediately.
- Keep navigation responsive even when data sections are loading.
- Avoid loading unnecessary large datasets.
- Avoid giant select controls that preload thousands of records.
- Use search-driven selectors for large reference datasets.
- Prefetch likely next screens where beneficial.
- Use caching for stable reference data when safe.
- Use optimistic updates when a failed action can be safely rolled back.
- Keep expensive reporting and integration work outside the main interactive path.
- Fail locally instead of freezing globally.

## 5.2 Search instead of large dropdowns

Any dataset expected to become large should use search-first selection.

Priority targets:

- Clients
- Contacts
- Menu items
- Events
- Leads
- Staff
- Venues

A selector should not require downloading all 25,000 clients to edit one event.

Search controls should support:

- Typing immediately on focus
- Fast partial-name search
- Keyboard selection
- Recent items
- Optional create-new action where appropriate
- Clear empty state
- Clear loading state
- Clear no-results state

## 5.3 Non-blocking page structure

Complex pages should be segmented so one expensive section does not block all interaction.

Example event page sections:

- Event header and identity
- Event details
- Menu
- Financials
- Staffing
- Tasks
- Activity

Where practical, sections should be independently loadable and recoverable.

## 5.4 Optimistic interactions

Good candidates:

- Task complete/incomplete
- Basic status change
- Simple assignment updates
- Reordering lines
- Non-financial toggles

Use optimism only when rollback is safe and understandable.

Financial operations, destructive actions, and high-risk domain changes should favor confirmed server truth.

## 5.5 Background work

The following should not freeze the application when they become expensive:

- Large reports
- Large exports
- Future supplier synchronization
- Future accounting synchronization
- Batch document generation
- Large production rollups
- Bulk notifications

## 5.6 Phase 1 performance budgets

Initial targets:

- Interaction feedback: approximately 50-100 ms perceived
- Search response beginning: target under approximately 200 ms in normal operating conditions
- Typical simple write acknowledgment: target under approximately 300 ms where practical
- Navigation: immediate shell transition with loading isolated to required content
- No single page should require loading an entire company dataset solely to populate controls

These numbers are product targets, not contractual guarantees. Their purpose is to prevent design choices that inherently create slow experiences.

## 5.7 Performance instrumentation

Phase 1 should begin measuring:

- Page/server render duration
- Database query duration
- Slow-query count
- Error count
- Failed mutations
- Search latency
- Heavy report duration
- Client-side navigation responsiveness where measurable

Acceptance criteria:

- We can identify the slowest routes and queries instead of guessing.
- A slow report cannot make normal event editing unresponsive.

---

# 6. Domain Architecture

Caterly's operational knowledge should not live primarily inside UI components.

## 6.1 Goal

Move important business logic into reusable domain/service modules.

Examples:

- Pricing calculations
- Tax calculations
- Service-charge calculations
- Package expansion
- Recipe explosion
- Production rollups
- Staffing conflict rules
- Event copy rules
- Lead conversion rules
- Payment schedule rules
- Event status rules

## 6.2 Desired layering

Conceptually:

UI / Routes / Server Actions
-> Application Services
-> Domain Rules
-> Data Access
-> PostgreSQL / external services

This does not require microservices.

The application can remain a Next.js application while still separating responsibilities cleanly.

## 6.3 Why this matters

The same domain rule may eventually be used by:

- Web interface
- Background worker
- API
- Integration
- Import process
- Mobile application
- Scheduled automation

If the rule exists only inside a React page or route action, Caterly becomes harder to extend and easier to break.

## 6.4 Phase 1 refactor targets

At minimum, extract and centralize:

- Event pricing
- Event summary calculations
- Event copy logic
- Package application
- Kitchen/production rollups
- Staffing conflict detection
- Lead conversion

Acceptance criteria:

- Critical domain calculations can be unit-tested without rendering a page.
- UI code primarily coordinates input/output rather than defining business truth.

---

# 7. Menu Library

The menu library should serve as reusable master data while event menus preserve event-specific commercial and operational truth.

## 7.1 Menu item requirements

Each menu item should support:

- Name
- Category
- Description
- Selling unit
- Selling price
- Basic cost
- Active/inactive status
- Basic recipe
- Basic packing requirements
- Created/updated metadata
- Organization ownership

## 7.2 Event menu snapshots

When a menu item is used on an event, the event should preserve event-specific values such as:

- Name
- Description
- Quantity
- Selling price
- Taxability
- Sort position

Changing the master menu later should not silently rewrite an existing event contract.

## 7.3 Event-specific editing

Users should be able to customize an event menu item without changing the menu library.

Examples:

- "Braised Short Rib" becomes "Red Wine Braised Short Rib"
- Event price differs from current menu price
- Description is customized for the client
- Quantity differs from guest count

Acceptance criteria:

- Historical event pricing remains stable when master menu pricing changes.
- Event-specific description changes do not alter the library item.

---

# 8. Menu Packages

Package architecture is a critical Phase 1 requirement.

## 8.1 Current problem to eliminate

A package cannot exist only as a single opaque event line with included menu items stored as plain text.

Doing so breaks:

- Kitchen production
- Recipe expansion
- Cost calculations
- Ingredient rollups
- Substitutions
- Reporting
- Future purchasing

## 8.2 Required behavior

Applying a package should retain:

- Package identity
- Package selling price
- Package guest quantity
- Included menu items
- Event-specific substitutions
- Event-specific additions/removals
- Component relationship to menu library where appropriate

## 8.3 Pricing vs production

Package commercial structure and production structure may differ.

Example:

The customer buys:

- Wedding Package at $75/person

Production needs to see:

- Caesar Salad
- Short Rib
- Potato Pavé
- Seasonal Vegetables
- Dessert

Caterly should preserve both truths.

Possible design:

- EventPackage
- EventPackageComponent

or another model that preserves the package sale while exposing operational components.

## 8.4 Substitutions

A user should be able to replace one package component with another while preserving the package record.

Example:

- Replace Short Rib with Chicken Supreme

The production system should use Chicken Supreme.

The invoice may still show the package name unless a company chooses to display component detail.

Acceptance criteria:

- Package events generate correct kitchen production.
- Package substitutions affect production.
- Package commercial pricing remains understandable.

---

# 9. Recipes and Core Production

Phase 1 recipes are not intended to be a full inventory system.

They are intended to make booked events operationally executable.

## 9.1 Recipe requirements

Core recipes should support:

- Ingredient/recipe-line name
- Quantity
- Unit
- Association with menu item
- Basic notes where needed

A future schema should leave room for:

- Ingredient master records
- Sub-recipes
- Yields
- Supplier products
- Purchase units
- Cost synchronization

## 9.2 Recipe quantity basis

The system must make quantity meaning explicit.

Examples:

- 0.15 kg beef per event menu quantity
- 1 bun per sandwich
- 0.05 L sauce per guest

Undefined quantity logic is dangerous because recipe rollups can appear mathematically correct while being operationally wrong.

## 9.3 Production rollup

For an event, Caterly should be able to calculate:

Event item quantity x recipe-line quantity = event ingredient/prep requirement

Requirements sharing the same item and compatible unit should consolidate.

## 9.4 Custom event items

If an event line is completely custom and has no recipe, the kitchen sheet should make that clear instead of silently pretending production data exists.

## 9.5 Production output

Phase 1 kitchen output should include:

- Event identity
- Date and service time
- Venue/location
- Guest count
- Menu production list
- Consolidated recipe/prep requirements
- Kitchen notes
- Clear identification of items missing recipes

Acceptance criteria:

- Changing event/menu quantities changes production quantities correctly.
- Packages contribute their component recipes.
- Missing recipe data is visible.

---

# 10. Packing Requirements

Packing is part of real event execution and belongs in Core.

## 10.1 Packing line requirements

Menu items may define reusable packing/equipment requirements such as:

- Chafing dish
- Serving utensil
- Cambro
- Sheet tray
- Heat lamp
- Service platter
- Beverage dispenser

Each line should support:

- Equipment/item name
- Quantity
- Unit
- Menu item association

## 10.2 Event rollup

Packing requirements should consolidate across event items where appropriate.

## 10.3 Future compatibility

The Phase 1 design should leave room for a future Rentals module with actual inventory, availability, allocation, breakage, and external rental vendors.

Acceptance criteria:

- Packing output reflects event menu quantities.
- Duplicate requirements consolidate correctly.
- Package components contribute packing requirements.

---

# 11. Leads and Core CRM

The lead funnel should remain a strong part of Core.

## 11.1 Core lead fields

At minimum:

- Contact name
- Company name
- Email
- Phone
- Lead source
- Event date
- Guest count estimate
- Budget estimate
- Notes
- Status
- Assigned user in later Phase 1
- Follow-up date/task in later Phase 1
- Created date
- Updated date
- Organization ownership

## 11.2 Lead statuses

Core statuses:

- New
- Contacted
- Proposal Sent
- Won
- Lost

## 11.3 Conversion

Converting a lead should:

- Create or link a client
- Create an event when appropriate
- Carry contact information forward
- Carry event date forward
- Carry guest estimate forward
- Carry relevant notes forward
- Preserve source attribution
- Mark the lead as won/converted
- Link back to the created event

Duplicate re-entry should be avoided.

## 11.4 Lost lead data

Add a basic lost reason field or extensible structure.

Potential reasons:

- Price
- Date unavailable
- Venue issue
- Chose competitor
- No response
- Cancelled event
- Not qualified
- Other

This information is important for future Leads Pro intelligence.

Acceptance criteria:

- A sales user can turn a qualified inquiry into an event with minimal repeated entry.

---

# 12. Clients and Contacts

## 12.1 Client requirements

Core should support:

- Individual or company
- Client name
- Primary contact
- Email
- Phone
- Address
- Notes
- Event history
- Financial summary
- Organization ownership

## 12.2 Multiple contacts

The current simple client model can evolve during Phase 1 or immediately after if required by implementation sequencing.

The architecture should support multiple contacts under one company/client.

Example:

ABC Corporation

- Jane - Executive Assistant
- Mark - Accounts Payable
- Chris - Event Contact

The system should not force the creation of three unrelated clients to represent this.

## 12.3 Client history

Client page should eventually show:

- Past events
- Upcoming events
- Total booked revenue
- Outstanding balances
- Notes
- Relevant lead history

Acceptance criteria:

- Client data is easy to find and not duplicated unnecessarily.

---

# 13. Financial Core

Financial calculations are operationally sensitive and must be deterministic and tested.

## 13.1 Event pricing

Core should support:

- Line quantities
- Unit prices
- Taxable flag
- Subtotal
- Discount
- Service charge
- Tax
- Total
- Payments
- Balance

## 13.2 Configuration

Phase 1 should begin moving company assumptions into settings.

At minimum:

- Default tax rate
- Default service charge
- Currency
- Company timezone

Future compatibility:

- Multiple tax categories
- Gratuity
- Admin fees
- Delivery fees
- Alcohol-specific rules
- Rental-specific tax treatment

## 13.3 Payments

Core payment records should support:

- Amount
- Method
- Received date
- Reference
- Note
- Event association
- Created metadata

## 13.4 Scheduled payments

Core should support:

- Label
- Amount
- Due date
- Paid/unpaid state

Phase 1 should structure this so future automated billing can generate schedules relative to event date.

## 13.5 Money handling

Rules:

- Financial calculations must use predictable decimal handling.
- Rounding should be explicit.
- Payments should never disappear because an event menu changes.
- Deleting financial records should eventually be permission-restricted and audited.

Acceptance criteria:

- Event invoice total, payment total, and balance agree everywhere in Caterly.

---

# 14. Basic Staffing

Core staffing should solve event assignment, not attempt to replace a full workforce platform yet.

## 14.1 Staff record

Core fields:

- Name
- Position/role
- Email
- Phone
- Hourly rate
- Active/inactive
- Organization ownership

## 14.2 Event shifts

Shift fields:

- Event
- Position
- Start time
- End time
- Assigned staff member

## 14.3 Conflict detection

The system should detect overlapping assignments for the same person.

Conflict rule:

New shift start < existing shift end
AND
New shift end > existing shift start

The user should receive an understandable error identifying the conflicting event.

## 14.4 Labour visibility

Core should support basic projected labour cost based on scheduled duration and hourly rate.

Future Workforce will extend this into availability, open shifts, weekly scheduling, overtime, time clock, and employee communications.

Acceptance criteria:

- Caterly cannot silently double-book the same staff member into overlapping shifts.

---

# 15. Tasks

Core tasks should remain simple and fast.

Requirements:

- Title
- Event association optional
- Due date optional
- Assignee
- Complete/incomplete
- Created date
- Organization ownership

Useful views:

- My open tasks
- Event tasks
- Overdue tasks
- Upcoming tasks

Tasks should eventually integrate with activity history and automation, but those advanced behaviors are not required initially.

---

# 16. Calendar

The calendar should provide operational awareness without becoming a slow reporting page.

Core requirements:

- Month view
- Event name
- Event status
- Basic time visibility
- Fast open-event action
- Date navigation
- Responsive loading

Future compatibility:

- Venue calendars
- Room calendars
- Staffing overlays
- Resource conflicts
- Multi-location views

Acceptance criteria:

- Opening the calendar does not require loading unnecessary full event graphs.

---

# 17. Operational Documents

Documents are outputs of the event source of truth.

## 17.1 BEO

BEO should include relevant operational facts such as:

- Event number
- Event name
- Client
- Contact
- Date
- Venue
- Room
- Timeline
- Guest count
- Service style
- Menu
- Event notes
- Relevant operational notes

The final exact layout can evolve, but data must remain connected to the event.

## 17.2 Kitchen sheet

Should include:

- Event identity
- Date/time
- Guest count
- Menu production list
- Recipe/prep rollup
- Kitchen notes
- Missing-recipe warnings

## 17.3 Packing sheet

Should include:

- Event identity
- Event location
- Required equipment/items
- Consolidated quantities
- Checklist-friendly presentation

## 17.4 Invoice

Should include:

- Company identity
- Client
- Event
- Event number
- Billable lines
- Discount
- Service charge
- Tax
- Total
- Payments
- Balance

## 17.5 Document consistency

The same event total must not differ between the event page and invoice.

The same guest count must not differ between BEO and kitchen sheet unless there is an explicit separate operational quantity concept.

Acceptance criteria:

- Documents do not require duplicate entry.
- Regenerating a document reflects current source data unless a future snapshot/finalization mechanism intentionally preserves a historical version.

---

# 18. Organization / Multi-Tenant Foundation

This is one of the most important structural Phase 1 changes.

## 18.1 Organization model

Add an Organization/Company entity representing each Caterly customer.

Likely organization-owned records include:

- Users/memberships
- Clients
- Contacts
- Leads
- Events
- Venues
- Menu items
- Menu packages
- Staff
- Tasks
- Settings
- Payments through their associated events

## 18.2 Data isolation

Every query and mutation that touches company data must be scoped to the active organization.

A user from Company A must never be able to retrieve Company B records by guessing an ID or modifying a request.

## 18.3 Organization settings

Initial settings should include:

- Company name
- Address/contact details
- Currency
- Timezone
- Default tax
- Default service charge
- Document branding basics

## 18.4 Future module entitlement

The organization model should leave room for module access/entitlement later.

Example:

Organization
- Core enabled
- Food Cost enabled
- Workforce enabled
- Restaurant disabled

Do not build full billing entitlement logic unless needed, but avoid an architecture that makes it difficult later.

Acceptance criteria:

- All operational data belongs to an organization.
- Cross-organization data access is prevented by design and tests.

---

# 19. Authentication, Users, Roles, Permissions

Phase 1 should create a real user model before broader deployment.

## 19.1 User concepts

Separate concepts should be considered for:

- User identity
- Organization membership
- Role/permissions

This supports one user belonging to multiple organizations in the future if required.

## 19.2 Suggested initial roles

- Owner
- Administrator
- Sales
- Event Manager
- Operations
- Kitchen
- Accounting
- Staff/Read-only as needed

## 19.3 Permission examples

Owner/Admin:

- Full company access

Sales:

- Leads
- Clients
- Events
- Menus
- Pricing
- Proposals/invoices as allowed

Kitchen:

- Event operational information
- Menu
- Kitchen notes
- Production
- Limited/no access to sensitive client financial data

Accounting:

- Invoices
- Payments
- Client financial history
- Limited operational editing

## 19.4 Permission architecture

Do not scatter permission checks randomly throughout components.

Create reusable authorization functions/policies.

Acceptance criteria:

- Restricted users cannot perform unauthorized mutations even if they bypass the visible UI.

---

# 20. Audit Trail and Activity History

Real event operations require knowing what changed.

## 20.1 Why it matters

Examples:

- Who changed guest count from 120 to 145?
- When did the service time move?
- Who changed the menu price?
- Who marked the event definite?
- When was the deposit entered?

## 20.2 Phase 1 activity targets

Track important changes such as:

- Event created
- Status change
- Guest-count change
- Date/time change
- Venue change
- Client change
- Menu item added/removed
- Menu quantity change
- Menu price change
- Important note changes
- Payment added/removed
- Staffing assignment change

## 20.3 Activity record concept

Likely fields:

- Organization
- User
- Entity type
- Entity ID
- Event ID where relevant
- Action
- Timestamp
- Before/after data or meaningful summary

Avoid storing sensitive values unnecessarily.

Acceptance criteria:

- An operator can answer who changed an important event fact and when.

---

# 21. Reporting Foundation

Core reporting should provide useful operational information without becoming a performance liability.

## 21.1 Phase 1 reports

- Booked revenue
- Collected revenue
- Outstanding balance
- Event count
- Guest count
- Average revenue per guest
- Basic food cost
- Basic labour cost
- Revenue by month
- Top clients
- Top menu items
- Events by date range

## 21.2 Database aggregation

Where datasets can become large, use database-side aggregation instead of loading every related row into application memory.

Examples:

- SUM revenue
- SUM payments
- GROUP BY month
- GROUP BY client
- GROUP BY item

## 21.3 Background reporting

Heavy reports and exports should eventually be run as jobs.

Phase 1 should establish architecture that allows this later.

Acceptance criteria:

- A large reporting query cannot make normal event workflows unusable.

---

# 22. Error Handling and Graceful Failure

Caterly should fail in small areas, not catastrophically.

## 22.1 User-facing errors

Errors should explain:

- What failed
- What the user can do next
- Whether their entered data was preserved

Avoid generic crashes where possible.

## 22.2 Integration isolation

Future external integrations should never be allowed to make Core unavailable.

Design principle:

- Core database truth remains usable even when integrations are offline.

## 22.3 Mutation safety

Important writes should:

- Validate required input
- Validate organization ownership
- Validate permission
- Use transactions when multiple writes must succeed together
- Avoid partial state where possible

Acceptance criteria:

- A failed multi-step operation does not leave obviously inconsistent data.

---

# 23. Database Integrity

The database should enforce important truths where practical.

Phase 1 should review:

- Required foreign keys
- Delete behavior
- Unique constraints
- Organization-scoped uniqueness
- Useful indexes
- Search indexes
- Date indexes
- Status indexes where beneficial

Likely indexing priorities:

- Event organization + date
- Event organization + status
- Client organization + normalized name
- Lead organization + status
- Lead organization + event date
- Menu organization + active + name
- Staff organization + active + name

Acceptance criteria:

- Common searches and event date queries have appropriate indexes.

---

# 24. Testing Strategy

Phase 1 should not attempt to test every UI pixel.

Focus testing on business rules that can create operational or financial errors.

## 24.1 Unit tests

Required areas:

- Pricing
- Discounts
- Service charge
- Tax
- Payment balance
- Package expansion
- Recipe production math
- Packing rollups
- Staffing overlap detection
- Event copy behavior
- Lead conversion
- Permission policies

## 24.2 Integration tests

Priority flows:

- Create client -> create event
- Lead -> convert to event
- Package -> event -> production output
- Payment -> balance update
- Staff shift -> conflict detection
- Organization A cannot access Organization B data

## 24.3 Build/CI checks

At minimum:

- Typecheck
- Lint
- Tests
- Production build

Acceptance criteria:

- Critical calculation regressions are caught before deployment.

---

# 25. Reliability and Operational Monitoring

Before internal team rollout, Caterly should have basic production visibility.

Monitor:

- Application errors
- Failed server actions
- Slow database queries
- Deployment failures
- Database availability
- Background job failures once jobs exist

Logging should include useful correlation information without leaking sensitive customer data.

Acceptance criteria:

- When Caterly fails, the development team can determine why without relying only on a user's description.

---

# 26. Backup and Recovery

Core operational software must protect customer data.

Phase 1 deployment planning should include:

- Automated database backups
- Backup retention policy
- Restore procedure
- Migration safety
- Environment separation
- Secrets management

Before team-wide use, perform at least one restore test in a safe environment.

Acceptance criteria:

- A documented recovery path exists for database loss or bad migration scenarios.

---

# 27. Core UX Standards

Caterly should feel like an operations tool, not a generic form database.

## 27.1 Fast creation

Common actions should require minimal navigation:

- New lead
- New client
- New event
- Add menu item
- Add payment
- Add shift
- Add task

## 27.2 Keyboard support

Phase 1 should begin establishing:

- Keyboard-friendly forms
- Logical tab order
- Enter-to-select in search controls
- Escape-to-close overlays
- Global search/command palette if feasible within Phase 1

## 27.3 Dense but readable information

Experienced operators often value seeing useful information together.

Avoid both extremes:

- Legacy screens packed with uncontrolled fields
- Consumer-style interfaces that require ten clicks to see basic event information

Aim for operational density with clear hierarchy.

## 27.4 Save behavior

Users should always understand whether changes are:

- Unsaved
- Saving
- Saved
- Failed

Avoid silent ambiguity.

---

# 28. Real-World Phase 1 Test Scenarios

Phase 1 should be tested with realistic events, not tiny demo records.

## Scenario A - Wedding

- 185 guests
- Definite event
- Venue + room
- Plated service
- Package
- Package substitution
- 5+ menu components
- Deposit schedule
- Multiple payments
- 14 staff
- Kitchen notes
- Packing requirements
- Guest count changes twice
- Final invoice change

Expected:

- All dependent quantities remain correct.
- Documents agree.
- Production remains correct after substitutions.
- Staff conflicts are detected.
- Financial balance remains correct.
- Activity history shows important changes.

## Scenario B - Corporate Drop-Off

- 35 guests
- Repeat client
- Custom event menu
- Delivery/site address
- Same-day payment
- Minimal staffing

Expected:

- Event creation is extremely fast.
- Repeat client selection is quick.
- Menu creation does not require unnecessary workflow.

## Scenario C - High-Volume Day

- 15-25 events in one day
- Multiple venues
- Multiple shared menu items
- Multiple staff assignments

Expected:

- Calendar remains responsive.
- Event searches remain responsive.
- Opening an event does not load the entire company database.
- Staff conflicts remain accurate.

## Scenario D - Large Company Dataset

Seed realistic scale:

- 25,000 clients
- 5,000 leads
- 2,000 menu items
- 1,000 staff records
- 50,000 historical events

Expected:

- Search controls remain usable.
- Event edit page does not preload massive lists.
- Reports use scalable query patterns.

This scenario is especially important because Caterly's competitive promise depends on remaining responsive as data accumulates.

---

# 29. Phase 1 Completion Gate

Phase 1 is complete when the following statements are true.

## Product

- A real catering event can be managed from lead through final payment.
- Menu packages work operationally, not only visually.
- Kitchen production derives correctly from event data.
- Packing derives correctly from event data.
- Core staffing prevents obvious conflicts.
- BEO, kitchen sheet, packing information, and invoice agree with the event record.

## Speed

- Large reference datasets are accessed through search rather than giant preload dropdowns.
- Normal event work remains responsive while reports or other heavy operations execute.
- Performance can be measured and diagnosed.

## Connected data

- Lead conversion avoids duplicate entry.
- Event changes flow to dependent Core workflows.
- Master menu changes do not silently rewrite historical event commercial data.
- Packages preserve their operational components.

## SaaS foundation

- Data belongs to an organization.
- Users authenticate.
- Permissions are enforced server-side.
- Cross-company access is prevented.

## Reliability

- Critical business rules are tested.
- Production errors are observable.
- Database backups and recovery processes exist.
- Important event changes are auditable.

## Industry-native usability

- Experienced operators can accomplish common event tasks quickly.
- The system does not force unnecessary steps for simple events.
- The system supports enough detail for complex events.

---

# 30. Phase 1 Development Checklist

Use this as the high-level working checklist. Each item should eventually be broken into implementation issues or smaller milestones.

- [ ] Establish Event as authoritative Core record
- [ ] Define downstream update rules for key event fields
- [ ] Replace large event-page reference dropdowns with searchable selectors
- [ ] Establish performance instrumentation
- [ ] Establish UI loading/non-blocking conventions
- [ ] Extract pricing into tested domain layer
- [ ] Extract event-copy rules into domain layer
- [ ] Redesign package/event-package architecture
- [ ] Ensure package components drive production
- [ ] Harden event menu snapshot behavior
- [ ] Harden recipe quantity semantics
- [ ] Harden production rollup
- [ ] Harden packing rollup
- [ ] Add missing-recipe visibility
- [ ] Harden lead conversion
- [ ] Add lost-lead reason
- [ ] Plan/support multiple client contacts
- [ ] Add organization/company model
- [ ] Scope all company data by organization
- [ ] Add organization settings
- [ ] Add authentication
- [ ] Add organization memberships
- [ ] Add role/permission system
- [ ] Enforce authorization server-side
- [ ] Add audit/activity model
- [ ] Log critical event changes
- [ ] Harden payment records
- [ ] Harden scheduled payments
- [ ] Centralize financial calculations
- [ ] Add configurable Core financial defaults
- [ ] Harden staffing conflict logic
- [ ] Add basic labour cost visibility
- [ ] Harden BEO data consistency
- [ ] Harden kitchen sheet data consistency
- [ ] Create/clarify packing output
- [ ] Harden invoice data consistency
- [ ] Move reporting toward database aggregation
- [ ] Add indexes for common company/date/search queries
- [ ] Add unit tests for critical domain rules
- [ ] Add integration tests for critical workflows
- [ ] Add CI typecheck/lint/test/build
- [ ] Add production error monitoring
- [ ] Add slow-query monitoring
- [ ] Establish backups
- [ ] Document recovery process
- [ ] Run restore test
- [ ] Test realistic wedding workflow
- [ ] Test corporate/simple event workflow
- [ ] Test high-volume event day
- [ ] Test large seeded company dataset
- [ ] Dogfood real events internally
- [ ] Record every workflow requiring an external tool or duplicate entry
- [ ] Resolve Core blockers before beginning major premium-module development

---

# 31. Decision Filter During Phase 1

When considering a new Core feature or implementation choice, ask:

## FAST

- Does this make common work faster?
- Could this block the application?
- Are we loading more data than necessary?
- Can the user continue working while this happens?

## CONNECTED

- Are we asking the user to enter something that Caterly already knows?
- Which downstream workflows depend on this fact?
- Are we accidentally creating a second source of truth?

## INDUSTRY-NATIVE

- Is this how an experienced caterer actually thinks about the work?
- Does this handle both a simple drop-off and a complex wedding naturally?
- Are we adding software steps that do not exist in the real operational workflow?

If a design fails one of these tests, it should be reconsidered before becoming part of Core.

---

# 32. Final Phase 1 Standard

Phase 1 is not successful because Caterly has a lot of screens.

Phase 1 is successful when Caterly becomes a trustworthy operating core.

The final test is simple:

> **Can a competent catering team run the basic lifecycle of a real event in Caterly faster, with less duplicate work, and with more confidence than they can in the legacy system they are replacing?**

If the answer is yes, Core is ready for the next phase.

If the answer is no, the solution is not to add more modules. The solution is to finish Core.
