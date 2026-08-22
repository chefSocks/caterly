# Phase 1C - Organization, Users & Security

## Mission
Turn Caterly from a single-company application into a secure platform foundation without compromising speed or workflow simplicity.

## Organization tenancy
Introduce Organization as the top-level business boundary.

Organization-owned data should include clients, contacts, leads, venues, menu items, packages, events, staff, tasks, company settings and later module data.

Every operational query and mutation must be scoped to the active organization. Tenant isolation is a correctness and security requirement, not a UI filter.

## Migration strategy
Existing development data must be assigned to an initial organization through a controlled migration. Add organization relationships in an order that keeps migrations understandable and testable.

Avoid a state where records can accidentally exist globally when they should be tenant-owned.

## Authentication
Core requires secure login and session handling using an established authentication approach rather than custom password cryptography.

Requirements:
- Sign in/out.
- Secure sessions.
- Password/account recovery where relevant to selected provider.
- Invitation/onboarding path.
- Disabled/revoked users lose access.
- Session handling does not create unnecessary latency on every interaction.

## Organization membership
A user may belong to one or more organizations if future product needs require it. Model membership separately enough to support role and organization status.

A user's access comes from membership, not merely possession of a record identifier.

## Roles
Initial Core roles should be simple and understandable. Suggested starting roles:
- Owner
- Administrator
- Sales/Event Manager
- Operations
- Kitchen
- Accounting
- Staff/limited

Do not build an excessively granular permission designer before real customer needs are understood.

## Permission domains
Define capabilities around domains/actions such as:
- View/edit clients.
- View/edit leads.
- View/edit events.
- Change pricing/discounts.
- View financial totals.
- Record/delete payments.
- View/edit menus.
- View/edit recipes.
- View kitchen production.
- Manage staff/shifts.
- View reports.
- Manage users/settings.

The server enforces permissions. Hiding a button is not security.

## Sensitive financial information
Roles that do not need event pricing/payment information should be capable of operating without seeing it. Kitchen and field staff may need event execution details without financial data.

## Company settings
Introduce organization settings for Core defaults, with room for future growth:
- Company name.
- Branding/contact information.
- Time zone.
- Currency.
- Default tax rate/rules.
- Default service charge.
- Event numbering strategy where appropriate.
- Default event/service values.
- Document/company identity.

Avoid embedding one company's operational assumptions in code.

## Time zones
Event operations are time-sensitive. Store timestamps consistently and render/edit in the organization's relevant time zone. Define behavior for organizations operating across multiple time zones later; do not silently assume server time.

## Audit/activity history
Introduce an append-oriented audit/activity system for important changes.

Capture, where useful:
- Organization.
- Actor/user.
- Entity type/id.
- Action.
- Timestamp.
- Important before/after values or structured change metadata.

Priority event history:
- Guest count.
- Date/time.
- Status.
- Client/venue.
- Menu additions/removals/major edits.
- Pricing/discount/service charge.
- Payments.
- Staffing assignments.

The audit system should support a human-readable event activity feed later without coupling audit storage to UI wording.

## Deletion policy
Operational records often should not be hard-deleted casually.

Define when to use:
- inactive/archive;
- soft deletion;
- cancellation;
- hard deletion for true mistakes/development.

Financial/audit records require especially deliberate behavior.

## Tenant isolation testing
Automated tests must attempt cross-organization access by guessed/known IDs and confirm rejection.

Test read, update, delete and search paths. Search results must never leak names or metadata across organizations.

## Authorization architecture
Authorization should be centralized enough that developers do not repeatedly invent permission logic in every page.

Preferred pattern: authenticated request -> organization context -> permission check -> domain operation -> scoped persistence.

## Security basics
- Validate server-side input.
- Do not trust hidden form fields for authorization.
- Protect secrets through environment/secret management.
- Avoid logging sensitive credentials/tokens.
- Apply dependency/security updates deliberately.
- Rate-limit abuse-prone public/auth endpoints where needed.
- Use least privilege for database/integration credentials where practical.

## Performance constraint
Security cannot become an excuse for slow UX. Organization context and permission checks should be designed efficiently and cached safely where appropriate, while never weakening authorization correctness.

## Explicitly deferred
Enterprise SSO, SCIM, highly granular custom roles, complex multi-organization hierarchies and advanced compliance certifications are not Phase 1C requirements unless an early deployment requires them.

## Completion gate
- [ ] Organization is the top-level tenant boundary.
- [ ] Existing data migrates safely to an initial organization.
- [ ] Growth-sensitive operational records are organization-owned.
- [ ] Authentication is production-appropriate.
- [ ] Membership controls organization access.
- [ ] Initial roles are defined.
- [ ] Server-side authorization protects reads and writes.
- [ ] Cross-tenant access tests pass.
- [ ] Company settings replace key hard-coded assumptions.
- [ ] Time-zone behavior is explicit.
- [ ] Important operational changes produce audit/activity records.
- [ ] Deletion/archive policies are defined for key entities.

**Gate statement:** multiple companies can safely use Caterly without seeing or modifying each other's data, and important changes are attributable.
