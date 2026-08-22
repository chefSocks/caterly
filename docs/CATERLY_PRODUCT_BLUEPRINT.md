# Caterly Product Blueprint

## Product Definition

**Caterly is an Operational Intelligence System for catering, hospitality, and food-service operations.**

It is not just a catering database, event calendar, CRM, scheduling tool, or invoicing platform. Caterly should connect the full operating workflow so information is entered once, understood in context, and propagated everywhere it is needed.

The long-term goal is to replace fragmented, slow, legacy hospitality software with one fast, connected, industry-native operating system built by people who understand the work.

## Product Principles

Every Caterly feature, architectural decision, workflow, and module should be evaluated against three principles.

### FAST

**Caterly never gets in the operator's way.**

Speed is not an optional feature. It is a core product requirement.

Caterly should:

- Launch quickly and remain responsive under load.
- Give immediate visual feedback to user actions.
- Avoid blocking the full application while one query, report, integration, or background process is running.
- Prefer indexed search and command-style access over huge dropdowns and long lists.
- Use optimistic interactions when failure can be safely recovered.
- Cache frequently used reference data where appropriate.
- Move expensive aggregation and reporting to the database or background compute layer.
- Keep heavy exports, reports, integrations, synchronization, and recalculations isolated from the interactive user experience.
- Degrade gracefully when an external service is unavailable.
- Support keyboard-heavy workflows for experienced operators.
- Treat perceived speed as seriously as measured backend speed.

The user should almost never feel like they are waiting for Caterly.

### CONNECTED

**Enter information once and let it flow everywhere it is needed.**

Caterly should maintain one connected operating model rather than a collection of disconnected tools.

Examples:

- A guest-count change should flow into menu quantities, recipes, food requirements, production, purchasing, staffing, packing, financial projections, and profitability where applicable.
- A menu change should update kitchen and production requirements without duplicate entry.
- A payment should update the event balance, billing status, reporting, and client account automatically.
- A supplier price change should update ingredient costs, recipe costs, menu food cost, margin, and suggested selling prices where those modules are enabled.
- An event time change should flow to staffing, production timing, logistics, venue usage, and customer-facing documents where applicable.

Caterly modules must share one underlying operational data model. They should not become separate applications that happen to share a brand.

### INDUSTRY-NATIVE

**Caterly behaves the way an experienced catering operator thinks.**

The product should model real hospitality concepts directly and make the common workflow natural.

Caterly should understand concepts such as:

- Leads and bookings
- Clients and contacts
- Events and functions
- Guest counts
- Venues and rooms
- Service styles
- Menus and packages
- BEOs
- Recipes and sub-recipes
- Prep and production
- Packing and rentals
- Staffing and labour
- Deposits and payment schedules
- Food cost and prime cost
- Supplier products and pack sizes
- Event timelines
- Forecasting and pars
- Event profitability

The product should reward industry experience instead of forcing experienced operators to adapt to generic software patterns.

---

# 1. Caterly Core

Caterly Core is the base operating package. It must be complete enough that a professional catering company can run its day-to-day event workflow without purchasing additional modules.

Core should not be intentionally crippled to create artificial upgrade pressure. Paid modules should add deeper operational capabilities rather than withholding basic functionality.

## 1.1 Dashboard

Core dashboard capabilities:

- Upcoming events
- Today's and this week's events
- Open tasks
- Outstanding balances
- Scheduled deposits and overdue payments
- Lead pipeline summary
- Booked revenue summary
- At-a-glance operational alerts
- Fast navigation to recently viewed or high-priority records

Future dashboard work should favor compact, actionable information rather than expensive, blocking analytics queries.

## 1.2 Leads and Basic CRM

Core lead capabilities:

- New leads
- Lead source
- Lead contact information
- Event date
- Estimated guest count
- Estimated budget
- Notes
- Status pipeline
  - New
  - Contacted
  - Proposal sent
  - Won
  - Lost
- Lead search and filters
- Convert a lead to client/event without re-entering information
- Basic follow-up tasks
- Basic source and conversion reporting

This is a meaningful Core differentiator because many legacy catering platforms handle lead management poorly or treat it as an afterthought.

## 1.3 Clients and Contacts

Core client capabilities:

- Person and company clients
- Primary contact details
- Email and phone
- Address
- Notes
- Client event history
- Lifetime booked revenue
- Outstanding balances
- Search-first client access
- Fast create/edit workflow

Future development should support multiple contacts per organization without forcing users to duplicate client records.

## 1.4 Events

The Event is the central operating record in Caterly.

Core event capabilities:

- Unique event number
- Event name
- Client
- Venue
- Room
- Site address
- Event type
- Service style
- Status
  - Prospective
  - Tentative
  - Definite
  - Completed
  - Cancelled
- Guest count
- Arrival/load-in time
- Start time
- End time
- Client notes
- Kitchen notes
- Staffing notes
- Tasks
- Event copying/duplication
- Search and filtering
- Calendar visibility
- Event-level activity/history in a future Core phase

The Event should become the single source of truth from which downstream operational work is generated.

## 1.5 Menu Library

Core menu capabilities:

- Menu item name
- Category
- Description
- Selling unit
- Selling price
- Basic cost field
- Active/inactive status
- Search and filters
- Menu item event usage
- Basic recipe lines
- Basic packing requirements

Core supports recipes because kitchen production is fundamental to catering. Advanced ingredient costing, suppliers, purchase units, yield analysis, and supply-chain features belong in advanced modules.

## 1.6 Menu Packages

Core package capabilities:

- Named packages
- Package description
- Price per guest
- Package menu items
- Active/inactive state
- Apply package to an event
- Preserve the relationship between package and included event items
- Allow event-specific substitutions and modifications
- Correctly expand package components into kitchen production requirements

**Important architecture requirement:** packages must not become opaque single-line event items that lose their underlying menu-item relationships. Production, recipe, cost, reporting, and substitution logic must be able to see the package components.

## 1.7 Event Menu Builder

Core event menu capabilities:

- Add from menu library
- Add from package
- Add custom event line
- Edit event-specific name and description
- Quantity
- Unit price
- Taxable/non-taxable
- Sort/order lines
- Event-specific changes should not mutate the master menu library
- Event records should preserve commercial snapshots where necessary so later master-menu changes do not alter historical contracts

## 1.8 Pricing and Event Financials

Core pricing capabilities:

- Subtotal
- Discount
- Service charge
- Tax
- Event total
- Payments received
- Outstanding balance
- Scheduled deposits
- Basic payment methods
- Basic payment references/notes

Future Core hardening should support configurable company pricing and tax rules rather than assuming all companies and jurisdictions calculate fees identically.

## 1.9 BEO and Operational Documents

Core documents:

- Banquet Event Order (BEO)
- Kitchen production sheet
- Packing sheet
- Invoice
- Browser print/PDF support

Documents should read directly from the event source of truth rather than require duplicate document-specific entry.

## 1.10 Kitchen and Production Basics

Core production capabilities:

- Event production list
- Recipe rollup
- Prep/shopping requirement rollup
- Packing/equipment rollup
- Kitchen notes
- Production quantities based on event menu quantities

Core production should be strong enough to operate a real event. More advanced production planning, batch prep, purchasing, station assignments, and multi-event consolidation can live in later modules.

## 1.11 Basic Staffing

Core staffing capabilities:

- Staff roster
- Position
- Contact details
- Hourly rate
- Active/inactive status
- Add shifts to events
- Assign staff
- Detect overlapping assignments/double bookings
- Event staffing notes
- Basic labour-cost visibility

Advanced workforce management belongs in Caterly Workforce.

## 1.12 Tasks

Core task capabilities:

- Event-linked tasks
- General tasks
- Due date
- Assignee
- Complete/incomplete state
- Dashboard visibility

Future improvements can add templates, automation, dependencies, notifications, and recurring operational workflows.

## 1.13 Calendar

Core calendar capabilities:

- Month/event calendar
- Status visibility
- Fast open event
- Basic date filtering
- Future support for venue/room views and resource conflicts

## 1.14 Core Reporting

Core reporting should remain useful and lightweight:

- Booked revenue
- Collected revenue
- Outstanding balance
- Event count
- Guest count
- Average revenue per guest
- Basic food and labour cost
- Revenue by month
- Top menu items
- Top clients
- Event range reports

**Performance rule:** reporting calculations should increasingly move to database-side aggregations, cached summaries, or background compute as dataset size grows. Heavy reporting must never make the interactive shell unresponsive.

## 1.15 Core Platform Requirements

Before broad deployment, Core must also include:

- Company/Organization tenancy
- User authentication
- Role-based permissions
- Company settings
- Company-specific tax/service-charge defaults
- Audit trail / event activity history
- Data isolation by organization
- Production-safe error handling
- Automated tests for critical domain rules
- CI checks for type safety, linting, tests, and builds
- Backups and recovery strategy
- Performance monitoring
- Search architecture that does not depend on massive dropdowns

---

# 2. Performance and Application Architecture

Caterly's architecture must protect responsiveness as the system grows.

## 2.1 Thin Interactive Shell

The interactive application should remain lightweight and responsive.

The shell is responsible for:

- Navigation
- Displaying current data
- Capturing user intent
- Immediate interaction feedback
- Lightweight local state
- Search and command access

Expensive work should not block it.

## 2.2 Domain Layer

Business rules should increasingly move out of React pages and large server-action files into dedicated domain/service modules.

Examples:

- Event lifecycle rules
- Pricing
- Tax/service-charge rules
- Package expansion
- Recipe explosion
- Production calculations
- Labour calculations
- Scheduling conflict detection
- Payment-plan calculations
- Profitability calculations

This keeps Caterly's operational knowledge reusable across the web UI, background workers, APIs, integrations, and future mobile interfaces.

## 2.3 Background Compute

Appropriate workloads should run outside the blocking request path:

- Large reports
- Large exports
- PDF generation where required
- Supplier synchronization
- Accounting synchronization
- Bulk email
- Large production rollups
- Forecasting
- Advanced cost recalculation
- Automated workflows

The user should be able to continue operating Caterly while these jobs execute.

## 2.4 Graceful Failure

External failures must remain isolated.

Examples:

- Sysco API unavailable: Caterly still operates with the last known price and clearly marks its freshness.
- Accounting integration unavailable: event operations continue and the sync retries separately.
- Report generation fails: the rest of Caterly remains usable.
- Email provider fails: the invoice remains valid and the user can retry sending.

No optional integration should be capable of freezing the core application.

## 2.5 Search-First UX

As datasets grow, Caterly should use indexed searches rather than downloading full reference sets.

Priority search targets:

- Clients
- Contacts
- Events
- Leads
- Menu items
- Ingredients
- Suppliers
- Staff
- Venues
- Invoices

Search should begin returning useful results quickly and support keyboard navigation.

## 2.6 Keyboard-First Experienced Workflow

Caterly should support experienced users becoming dramatically faster over time.

Potential capabilities:

- Global command palette
- Ctrl/Cmd+K search
- Quick-create commands
- Keyboard navigation through search results
- Shortcut to new event/client/lead
- Quick access to unpaid invoices, today's events, upcoming staffing, etc.
- Contextual shortcuts on event screens

Mouse/touch remains fully supported; keyboard use becomes a productivity accelerator.

## 2.7 Performance Targets

These are initial product targets rather than rigid technical guarantees:

- Immediate interaction feedback: approximately 50-100 ms perceived
- Common search results beginning to appear: target under approximately 200 ms where infrastructure permits
- Typical write acknowledgment: target under approximately 300 ms where practical
- Navigation should feel immediate through prefetching/caching/skeleton states where appropriate
- Heavy queries should stream, defer, or run asynchronously rather than block the whole interface

Performance regressions should eventually be treated as product defects.

---

# 3. Optional Expansion Modules

Modules are built only after Core is stable, fast, connected, and capable of operating real catering events.

Modules share Core data rather than duplicating it.

---

# 3.1 Caterly Food Cost

Purpose: turn menus and recipes into live operational costing intelligence.

Features:

- Ingredient master
- Sub-recipes
- Recipe yields
- Portion yields
- Waste/yield percentages
- Recipe units and conversion factors
- Purchase units vs recipe units
- Current ingredient cost
- Recipe cost
- Per-portion cost
- Menu food-cost percentage
- Target food-cost percentage
- Contribution margin
- Suggested retail/selling price
- Cost history
- Price-change alerts
- Margin-change alerts
- Event theoretical food cost
- Food cost by menu item/category/event
- Menu engineering analytics

Example intelligence:

- Current theoretical cost: $14.21
- Selling price: $48.00
- Food cost: 29.6%
- Target food cost: 28%
- Suggested selling price: $50.75

---

# 3.2 Caterly Supply / Purchasing

Purpose: connect recipes and operational demand directly to suppliers and purchasing.

Potential supplier integrations include Sysco, GFS, and other regional/national vendors where APIs or approved integrations are available.

Features:

- Supplier directory
- Supplier product/SKU mapping
- Pack size
- Pack quantity
- Unit conversions
- Contract/current pricing
- Price synchronization
- Price history
- Preferred supplier
- Alternate suppliers
- Vendor comparison
- Automated purchasing requirements from events
- Purchase-order preparation
- Order guides
- Suggested order quantities
- Receiving
- Invoice/price variance
- Last-known-price fallback
- Price freshness indicator

Longer-term capabilities:

- Compare supplier pricing
- Flag substitutions
- Predict ingredient demand
- Aggregate demand across multiple events/locations
- Detect major cost movements before margin is damaged

---

# 3.3 Caterly Workforce

Purpose: combine event staffing with modern workforce scheduling comparable to dedicated scheduling products.

Features:

- Employee profiles
- Positions/skills
- Availability
- Time-off requests
- Event shifts
- Weekly schedules
- Multi-location schedules
- Shift templates
- Open shifts
- Shift offers
- Employee acceptance/decline
- Shift swaps
- Scheduling conflicts
- Overtime awareness
- Labour budgeting
- Scheduled vs target labour
- Labour-cost projection
- Actual labour when time tracking is enabled
- Time clock
- Break tracking
- Employee communications/notifications
- Mobile employee workflow

Catering scheduling model:

Event -> required positions -> shifts -> staff

Restaurant scheduling model:

Forecast -> labour requirement -> weekly schedule -> staff

Both models should share the same employee and labour data.

---

# 3.4 Caterly Restaurant

Purpose: support restaurants, venues, and hospitality operations that combine daily service with catering/events.

Features:

- Daily/weekly sales forecasting
- Daypart forecasting
- Labour forecasting
- Weekly staffing plans
- Target labour percentage
- Scheduled vs forecast labour
- Menu pars
- Ingredient pars
- Production pars
- Forecast-based prep
- Historical sales comparison
- Catering event demand included in restaurant production planning
- Multi-day/week production planning
- Location performance

Key connected workflow:

Restaurant forecast + booked catering events -> production demand -> purchasing -> labour -> schedule -> actual performance

---

# 3.5 Caterly Billing & Payments Automation

Purpose: automate the financial follow-up surrounding events.

Features:

- Company-defined payment-plan templates
- Payment schedules relative to event date
- Deposits
- Final-payment rules
- Automatic invoice creation
- Automatic payment reminders
- Overdue reminders
- Client payment links
- Receipts
- Payment status tracking
- Failed-payment handling where supported
- Automatic balance updates
- Accounting-system synchronization

Example:

- 25% at signing
- 25% 90 days before event
- 25% 30 days before event
- Balance 7 days before event

Caterly should generate and manage those dates automatically from the event date.

---

# 3.6 Caterly Leads Pro

Purpose: expand Core lead management into a revenue-generation and sales-intelligence product.

Features:

- Website lead forms
- Lead API/webhook capture
- Automatic source tracking
- Campaign/source attribution
- Lead scoring
- Automated acknowledgements
- Follow-up sequences
- Salesperson assignment
- Follow-up reminders
- Proposal tracking
- Lead aging
- Conversion funnel
- Lost-lead reasons
- Revenue by lead source
- Conversion rate by source
- Conversion rate by salesperson
- Venue/referral partner performance
- Marketing ROI
- Lead response-time reporting

Long-term opportunity:

- Lead-generation services or marketplace capabilities may become a separate paid offering, provided the product can clearly demonstrate lead quality and attribution.

---

# 3.7 Caterly Analytics

Purpose: transform operational data into management intelligence.

Features:

- Event profitability
- Food cost
- Labour cost
- Prime cost
- Prime cost percentage
- Contribution margin
- Quoted vs actual margin
- Revenue per guest
- Revenue by event type
- Margin by event type
- Margin by menu/package
- Client profitability
- Venue profitability
- Salesperson performance
- Labour efficiency
- Cost trends
- Forecasting
- Benchmarking by location/company
- Exception alerts

Example:

- Revenue: $24,800
- Food cost: $6,150
- Labour: $5,400
- Prime cost: $11,550
- Prime cost: 46.6%

The system should ultimately identify patterns operators can act on, not merely display charts.

---

# 3.8 Caterly Production

Purpose: turn booked event demand into executable kitchen work.

Features:

- Multi-event production planning
- Batch recipes
- Sub-recipes
- Prep quantities
- Prep deadlines
- Station assignments
- Prep assignments
- Production status
- Prep completion tracking
- Consolidated production by day/week
- Event-specific production breakdown
- Yield adjustments
- Waste tracking
- Required-by times based on event timelines
- Production labels/printouts where useful

Connected workflow:

Events -> menu items -> recipes -> production -> purchasing -> completion

---

# 3.9 Caterly Rentals

Purpose: manage internal and third-party rental requirements generated by events.

Features:

- Rental inventory
- Equipment inventory
- Linen
- China
- Glassware
- Tables/chairs
- Internal stock counts
- Event allocation
- Availability/conflict detection
- Third-party rental orders
- Pickup/return dates
- Breakage/loss
- Packing sheets
- Return checklists
- Rental cost and markup

---

# 3.10 Caterly Logistics

Purpose: coordinate how people, food, and equipment physically reach events.

Features:

- Vehicles
- Drivers
- Delivery routes
- Event delivery windows
- Departure times
- Load times
- Pickup times
- Vehicle capacity
- Event load assignments
- Multi-event routes
- Loading order
- Logistics conflicts
- Driver notes
- Proof of delivery where useful

---

# 3.11 Caterly Venue

Purpose: support operators managing their own venues or event spaces.

Features:

- Venues
- Rooms
- Capacities
- Setup/teardown windows
- Room availability
- Simultaneous-event conflict detection
- Venue calendar
- Room fees
- Minimum spends
- Floorplan references
- Room setup requirements
- Venue-specific equipment
- Venue-specific production/logistics notes

---

# 3.12 Caterly Client Portal

Purpose: reduce email back-and-forth and allow clients to interact with their event safely.

Features:

- Proposal review
- Contract acceptance/signature integration
- Invoice/payment access
- Payment links
- Guest-count updates within controlled windows
- Menu selections
- Questionnaire/forms
- Document upload
- Event documents
- Communication history
- Client approvals
- Change requests

Client actions should never bypass internal approval rules or silently alter operationally critical data.

---

# 3.13 Caterly Automation

Purpose: automate repetitive operational administration.

Features:

- Trigger/action rules
- Date-relative event automations
- Status-change automations
- Payment reminders
- Task generation
- Internal notifications
- Client notifications
- Production reminders
- Staffing reminders
- Missing-information alerts
- Workflow templates
- Scheduled reports

Example rules:

- 30 days before a definite event, create final guest-count task.
- 14 days before event, alert if staffing is below requirement.
- 7 days before event, alert if balance is outstanding.
- When guest count changes materially, flag production and staffing for review.

---

# 3.14 Caterly Accounting Integrations

Purpose: connect Caterly's operational truth to accounting platforms without trying to replace full accounting software.

Potential integrations:

- QuickBooks
- Xero
- Other accounting platforms based on market demand

Features:

- Customer synchronization
- Invoice synchronization
- Payment synchronization
- Tax/service-fee mapping
- Chart-of-accounts mapping
- Error/retry queue
- Sync status
- Reconciliation support

Accounting synchronization should run independently and should never block event operations.

---

# 4. Pricing Philosophy

The commercial model should remain flexible until product-market feedback is available.

Current direction:

## Caterly Core

Potential model:

- Company/base subscription
- Per-user charge
- Competitive price point relative to legacy platforms
- No large mandatory one-time license/setup fee as a default product requirement

## Modules

Modules should generally be priced based on the value unit they create.

Examples:

- Food Cost / Supply: per company or location
- Workforce: per company plus active employee/user component
- Restaurant: per location
- Billing automation: company subscription and/or transaction economics
- Leads Pro: company subscription, potentially usage/lead-based services later
- Analytics: company/location tier
- Client Portal: company tier

Pricing should not create unnecessary login-sharing incentives. If a feature creates company-wide value, company/location pricing may be more appropriate than charging merely because another operational employee needs access.

---

# 5. Development Order

## Phase A - Lock Caterly Core

Priority:

1. Make current event workflows complete and reliable.
2. Fix package/component production architecture.
3. Strengthen recipe and production basics.
4. Add company/organization tenancy.
5. Add users, authentication, and permissions.
6. Add audit/activity history.
7. Separate domain logic from UI/server-action files.
8. Replace scale-sensitive dropdown patterns with search-driven controls.
9. Move scale-sensitive reports toward database aggregation/background processing.
10. Add automated tests around critical domain calculations and workflows.
11. Add production monitoring/error recovery.
12. Dogfood Caterly on real events and capture every point where users need another tool.

## Phase B - Core Operational Maturity

Priority areas:

- Production workflow
- Better event timeline
- Robust search
- Keyboard navigation
- Configurable company financial rules
- Better BEO/document control
- Better lead workflow
- Better calendar/resource visibility
- Better operational alerts
- Performance instrumentation and budgets

## Phase C - First Premium Modules

Recommended order based on connection to Core and likely operational value:

1. Caterly Food Cost
2. Caterly Supply / Purchasing
3. Caterly Billing & Payments Automation
4. Caterly Workforce
5. Caterly Analytics
6. Caterly Production
7. Caterly Leads Pro
8. Remaining modules based on customer demand

Restaurant should follow when Core + food-cost + supply + workforce foundations are mature enough to support it cleanly.

---

# 6. Core Architectural Rule for Modules

A module should extend Caterly's shared operational graph rather than create a separate source of truth.

Bad pattern:

- Core guest count = 140
- Production module guest count = 135
- Staffing module guest count = 142
- Billing guest count = 130

Target pattern:

**Event guest count = 140**

Every enabled module consumes the same authoritative fact and derives its own operational requirements from it.

Where modules require different concepts, those differences should be explicit business entities rather than duplicate copies of the same fact.

---

# 7. Caterly's Long-Term Operational Graph

Conceptually:

Lead
-> Client
-> Event
-> Guest Count / Timeline / Venue
-> Menu / Package
-> Recipe / Ingredient
-> Supplier / Purchasing
-> Production
-> Packing / Rentals / Logistics
-> Staffing / Labour
-> Invoice / Payment
-> Food Cost / Prime Cost / Profitability
-> Reporting / Forecasting / Operational Intelligence

Every meaningful change should propagate to the dependent areas that need it.

The result should be an operating system that not only stores what the caterer knows, but actively helps execute the work.

---

# 8. Product North Star

Caterly succeeds when an experienced operator can move faster with the software than without it.

The long-term product is not simply a replacement for Caterease.

It is an **Operational Intelligence System** where the event, kitchen, sales team, purchasing team, staffing team, accounting workflow, and management reporting operate from one connected source of truth.

The product standard remains:

> **FAST** - Caterly never gets in the operator's way.
>
> **CONNECTED** - Enter information once and let it flow everywhere it is needed.
>
> **INDUSTRY-NATIVE** - Caterly behaves the way an experienced catering operator thinks.

Every roadmap decision should preserve those three principles.
