# Caterly Core Leads - Product & Domain Design

## Mission

Make Caterly Leads good enough that a professional catering sales team wants to run its complete human-driven sales workflow inside Caterly.

Core Leads is not a deliberately limited CRM. It owns the fundamental workflow from inquiry through a booked event. Caterly Leads Pro later adds automation, acquisition, optimization, and intelligence.

The Core workflow is:

**Inquiry -> Qualification -> Proposal -> Follow-up -> Won/Lost -> Client + Event -> Operations**

The governing rule is:

> Every useful fact captured during the lead process should flow forward. The operator should not type the same information into the Lead, Proposal, and Event separately.

---

# 1. Core vs Leads Pro Boundary

## Core Leads

Core includes:

- Manual/internal inquiry creation.
- Contact and company information.
- Event type.
- Event date and date flexibility.
- Guest count.
- Venue/location and venue-confirmed state.
- Service style.
- Approximate event time where known.
- Budget / budget per guest where known.
- Lead source.
- Notes and special requirements.
- Sales owner.
- Next action and follow-up date.
- Pipeline stages.
- Lost reasons.
- Lead activity/history.
- Existing-client/duplicate detection.
- Proposal templates.
- One-click base proposal creation.
- Proposal editing.
- Proposal versions.
- Proposal status.
- Lead-to-client/event conversion.
- Basic source/conversion reporting.

## Leads Pro

Leads Pro should make the sales organization exceptional rather than fix missing Core functionality. Candidates include:

- Embeddable website inquiry forms.
- Multiple custom inquiry forms by event type/brand/location.
- Automated lead routing.
- Automated acknowledgements.
- Email/SMS sequences.
- Automatic follow-up.
- Advanced campaign attribution.
- Response-time analytics.
- Salesperson performance analytics.
- Lead scoring.
- Capacity-aware qualification.
- Advanced forecasting.
- Historical proposal recommendations.
- Conversion intelligence.
- Marketing ROI.
- Lead-generation services/marketplace capabilities if strategically justified later.

---

# 2. Inquiry Capture

The initial inquiry must be fast. Caterly should accept incomplete opportunities rather than forcing the salesperson or client to invent information.

## Contact fields

- Contact name - required.
- Company - optional.
- Email - optional but strongly encouraged.
- Phone - optional but strongly encouraged.
- Preferred contact method - optional.

## Event fields

- Event type - Wedding, Corporate, Social, Fundraiser, Celebration, Holiday, Other, plus future company configuration.
- Event date - optional.
- Date flexible - optional boolean.
- Guest count - optional.
- Venue - optional existing Venue reference.
- General location - free text when venue is unknown.
- Venue confirmed - optional boolean.
- Service style - Drop-off, Buffet, Plated, Family Style, Cocktail/Canape, Stations, Other.
- Approximate start time - optional.
- Budget - optional.
- Budget per guest - optional/future derived convenience.

## Inquiry context

- Lead source.
- General notes/message.
- Special requests.
- Dietary considerations if already known.

Only genuinely necessary fields should block lead creation. A name plus partial event information is still a valid lead.

---

# 3. Lead Workspace

A Lead should become a dedicated workspace rather than remaining only a card in a pipeline.

Header example:

**Sarah & David Wedding**
June 14, 2027 - 150 guests - Plated - Pitt Meadows Golf Club

Primary sections:

- Overview
- Contact
- Event
- Proposal
- Activity
- Tasks / Follow-up

The workspace should answer quickly:

- Who is the client/contact?
- What are they planning?
- When and where?
- How many guests?
- What service style?
- What is the estimated value?
- Who owns the lead?
- What happened last?
- What needs to happen next?
- Has a proposal been created/sent?

---

# 4. Pipeline

Recommended initial stages:

1. NEW
2. CONTACTED
3. QUALIFIED
4. PROPOSAL
5. FOLLOW_UP
6. DECISION
7. WON
8. LOST

Core should use meaningful operational stages rather than arbitrary CRM labels.

## Stage intent

### New
Inquiry has arrived and needs human attention.

### Contacted
Initial outreach/communication has happened.

### Qualified
Enough information exists to determine that the opportunity is real and serviceable.

### Proposal
A proposal is being prepared or has been sent.

### Follow-up
Proposal/contact exists and the next step is follow-up.

### Decision
Client is actively deciding, negotiating, contracting, or otherwise close to a booking decision.

### Won
The opportunity is accepted and should be linked/converted to Client + Event.

### Lost
The opportunity will not proceed. Preserve the record and reason.

Pipeline stages should eventually be company-configurable, but Core should begin with strong catering-native defaults rather than building a complex workflow designer immediately.

---

# 5. Sales Ownership & Next Action

Every active lead should support:

- Owner/salesperson.
- Next action.
- Follow-up date/time.
- Overdue state.

The sales team's daily view should emphasize action, not merely lead count.

Examples:

- New inquiries needing response.
- Proposals to prepare/send.
- Follow-ups due today.
- Overdue follow-ups.
- Leads awaiting revised proposals.

Until Phase 1C users exist, ownership may remain optional/free-text or be deferred structurally. The model should be designed so ownership can become a User relation cleanly.

---

# 6. Lead Source

Core should capture source consistently enough to support basic reporting.

Suggested defaults:

- Website
- Google
- Instagram
- Facebook
- Wedding marketplace
- Venue referral
- Planner referral
- Past client
- Corporate referral
- Phone
- Walk-in
- Other

Long term, company-defined sources are preferable to unrestricted free text because reporting quality matters.

Core reporting should eventually answer:

- Leads by source.
- Won leads by source.
- Conversion rate by source.
- Booked revenue by source after conversion.

Advanced attribution/marketing ROI belongs in Leads Pro.

---

# 7. Lost Reasons

Do not delete normal lost opportunities. Set status LOST and capture a quick reason.

Suggested reasons:

- Price
- Date unavailable
- Venue issue
- Menu/service mismatch
- Went with competitor
- No response
- Client cancelled event
- Budget
- Internal capacity
- Other

Notes remain optional for context.

Lost-reason data should later help operators understand why business is not converting.

---

# 8. Duplicate / Existing Client Detection

Before creating a new Client from a Lead, Caterly should search for likely matches using available information such as:

- Email.
- Phone.
- Contact name.
- Company name.

Caterly should present likely matches and allow the salesperson to link the Lead to an existing Client rather than silently creating duplicates.

Example:

> Sarah Smith appears to be an existing client with 3 previous events.

Actions:

- Link existing client.
- Create new client anyway.

Do not merge records automatically based on weak similarity.

---

# 9. Proposal as a First-Class Entity

A Proposal must be a real Caterly domain entity, not merely a generated PDF.

A Lead can have one or more Proposal versions.

Proposal should support:

- Lead relationship.
- Proposal number/reference.
- Version number.
- Status.
- Guest count snapshot.
- Event date snapshot.
- Venue/location snapshot/reference.
- Service style snapshot.
- Menu/package lines.
- Custom lines.
- Pricing terms.
- Discount.
- Service charge.
- Tax.
- Notes/terms.
- Created timestamp.
- Sent timestamp.
- Accepted/rejected timestamp.
- Superseded/version relationship where appropriate.

Potential statuses:

- DRAFT
- READY
- SENT
- VIEWED (future/client portal)
- ACCEPTED
- REJECTED
- SUPERSEDED

Proposal financial/menu content must remain historically stable after it is sent. Editing a sent proposal should create a new version rather than silently rewriting what the client received.

---

# 10. Proposal Templates

Companies should define reusable starting structures.

Examples:

Wedding:
- Standard Plated
- Premium Plated
- Buffet
- Cocktail Reception

Corporate:
- Breakfast
- Lunch Buffet
- Boxed Lunch
- Reception

A template may define:

- Applicable event types.
- Applicable service styles.
- Default menu package/items.
- Choice placeholders such as Choose 2 Canapes.
- Default custom/service lines.
- Default notes/terms.
- Default pricing rules.
- Optional staffing assumptions later.

Templates should accelerate sales without locking the proposal. Event-specific editing remains expected.

---

# 11. One-Click Create Proposal

This is a Core feature and a primary FAST workflow.

From a qualified Lead, the salesperson clicks:

**Create Proposal**

Caterly uses known Lead facts to identify appropriate company-defined templates based primarily on:

- Event type.
- Service style.
- Guest count where relevant.

If one template is clearly configured as the default, Caterly can create the draft immediately. If multiple templates apply, show a small ranked/template choice rather than forcing the salesperson through the full menu library.

The generated draft inherits known Lead data:

- Contact/client context.
- Date.
- Guest count.
- Venue/location.
- Service style.
- Event type.
- Relevant notes.

Proposal template rules are deterministic. Core does not use AI to invent menu/pricing/commercial terms.

---

# 12. Proposal Editing

After generation, the salesperson edits only what is unique.

Required capabilities:

- Add/remove package/menu lines.
- Add custom lines.
- Change quantities.
- Change prices where permitted.
- Add substitutions/selections.
- Add proposal notes.
- Apply discount/service charge/tax according to company rules.
- Reorder presentation.
- Preview client-facing proposal.

The proposal editor should use the same search-first menu/package architecture established in Phase 1A.

---

# 13. Proposal Versioning

Example:

- V1 - Sent Aug 22 - $18,420
- V2 - Sent Aug 24 - $17,860
- V3 - Accepted Aug 26 - $19,210

Rules:

- Draft may be edited in place until sent/issued.
- Once sent, commercial content is immutable for historical purposes.
- Editing a sent proposal creates a new draft version.
- Only one proposal version should normally be the current active version.
- Acceptance references the exact accepted version.

This provides commercial accountability and later enables proposal analytics.

---

# 14. Lead -> Client + Event Conversion

Winning a Lead should not require re-entry.

On acceptance/win:

1. Confirm/link existing Client or create one.
2. Create Event from authoritative Lead/accepted Proposal facts.
3. Carry forward:
   - Contact/company relationship.
   - Event date/time where known.
   - Guest count.
   - Venue/location.
   - Event type.
   - Service style.
   - Accepted menu/package lines.
   - Accepted pricing.
   - Notes where operationally appropriate.
   - Lead source attribution.
4. Link Lead to created Event.
5. Mark Lead WON.
6. Preserve Lead and Proposal history.
7. Redirect/open the Event Workspace.

The accepted Proposal becomes the commercial source used to initialize the Event. Later event changes do not rewrite the historical accepted proposal.

---

# 15. Activity Timeline

Important lead actions should create activity records suitable for a human-readable timeline.

Examples:

- Inquiry received.
- Lead created.
- Owner assigned.
- Contact attempted/logged.
- Status changed.
- Follow-up scheduled.
- Proposal V1 created.
- Proposal sent.
- Proposal revised.
- Proposal accepted/rejected.
- Lead marked won/lost.
- Client linked/created.
- Event created.

Phase 1C's general audit architecture should be reused where appropriate, but sales activity may require explicit domain events/notes beyond low-level audit changes.

---

# 16. Venue & Capacity Connections

Core should capture venue/location at Lead stage because it becomes useful throughout the lifecycle.

When an existing Venue is selected, Caterly can eventually expose venue notes/context to Sales.

Future intelligence can include:

- Existing events on requested date.
- Confirmed guest load.
- Venue history.
- Staffing/production capacity signals.

Advanced capacity-aware qualification/recommendations belong in Leads Pro, but Core data must support them.

---

# 17. Performance Requirements

Leads must obey Phase 1A.

- Do not load all historical leads into one pipeline.
- Active pipeline queries should focus on active stages.
- Won/lost history should be separately searchable/paginated.
- Pipeline stage counts/value should be database aggregates.
- Lead workspace loads one Lead and relevant bounded relationships.
- Client/venue/menu selection uses bounded search.
- Activity history is paginated/bounded as it grows.
- Proposal versions are loaded intentionally rather than as an unbounded company-wide dataset.

The current implementation loads the entire Lead table and filters it in memory. This must be replaced as part of Leads Core implementation.

---

# 18. Initial Data Model Direction

Exact schema design should be reviewed before migration, but Core likely needs to evolve Lead with concepts such as:

- eventType
- serviceType
- generalLocation
- venueId
- venueConfirmed
- dateFlexible
- approximateStartAt/time
- ownerUserId (after Phase 1C)
- nextAction
- followUpAt
- lostReason
- preferredContactMethod

New entities likely include:

- Proposal
- ProposalItem
- ProposalVersion or versioned Proposal records
- ProposalTemplate
- ProposalTemplateItem
- LeadActivity / sales activity if not adequately represented by the Phase 1C audit model

Avoid putting proposal/menu version history into a single mutable JSON blob if doing so makes pricing, conversion, reporting, or historical integrity difficult.

---

# 19. Implementation Order

## Leads Core A - Performance & Pipeline Foundation

- Replace unbounded lead load.
- Add active-pipeline query/service.
- Add database stage counts and pipeline value.
- Separate Won/Lost history from active pipeline.
- Add dedicated Lead detail/workspace route.

## Leads Core B - Inquiry Model

- Expand Lead fields for event type, service style, venue/location, date flexibility and follow-up.
- Improve New Lead form.
- Add duplicate/existing-client matching.

## Leads Core C - Sales Workflow

- Add qualified/follow-up/decision stages.
- Add next action/follow-up date.
- Add lost reasons.
- Add activity timeline.
- Add ownership after User foundation exists.

## Leads Core D - Proposal Domain

- Add Proposal entity/model.
- Add Proposal templates.
- Add one-click Create Proposal.
- Build proposal editor.
- Reuse search-first menu/package controls.
- Add proposal financial calculations.

## Leads Core E - Versioning & Conversion

- Add sent/issued proposal snapshots/versioning.
- Add accepted proposal state.
- Convert accepted proposal to Client + Event.
- Preserve attribution and history.

## Leads Core F - Dogfooding

Run realistic sales scenarios including:

- Incomplete wedding inquiry.
- Existing corporate client inquiry.
- Unknown venue.
- Multiple proposal revisions.
- Lost lead due to price.
- Accepted proposal converted to event.
- High-volume pipeline with thousands of historical Won/Lost leads.

---

# 20. Acceptance Scenarios

## Wedding inquiry

Sarah submits/phones:

- Wedding
- June 14
- Approximately 150 guests
- Plated
- Venue TBD

Sales can create the Lead without inventing missing fields, qualify it, select a Plated Wedding proposal template, generate a 150-guest base proposal in one action, edit selections, send versions, record follow-up, and convert the accepted version into an Event without retyping the known facts.

## Corporate repeat client

An existing company requests an 85-person lunch buffet. Caterly identifies the existing Client, links the Lead, generates the configured Corporate Lunch proposal, and converts it to an Event while preserving source/history.

## Lost opportunity

A Lead is marked Lost due to price. It disappears from the active pipeline without being deleted and remains available for reporting/history.

## Scale

Thousands of historical Won/Lost leads do not materially slow the active sales pipeline because historical records are not loaded into the active board.

---

# 21. Core Completion Gate

Core Leads is complete when:

- [ ] A partial inquiry can be captured quickly.
- [ ] Lead stores catering-native event context.
- [ ] Active pipeline does not load full historical Lead data.
- [ ] Salesperson can see what requires action next.
- [ ] Follow-up dates/actions are first-class.
- [ ] Lost leads are preserved with reasons.
- [ ] Existing-client duplicate detection exists.
- [ ] Lead has a dedicated workspace/history.
- [ ] Proposal is a first-class domain entity.
- [ ] Company proposal templates exist.
- [ ] A base proposal can be created from a Lead in one action.
- [ ] Known Lead information automatically populates the proposal.
- [ ] Proposal editing uses Caterly menu/package data.
- [ ] Sent proposals preserve version history.
- [ ] Accepted proposal converts to Client + Event without duplicate entry.
- [ ] Lead source survives conversion for reporting.
- [ ] Basic source/conversion reporting exists.
- [ ] Realistic wedding and corporate sales scenarios pass end-to-end.

**Gate statement:** Caterly Core can manage the human-driven sales lifecycle from inquiry through an accepted proposal and operational Event without duplicate data entry.

---

# North Star

Core Leads helps the salesperson operate extremely well.

Leads Pro later helps the company optimize, automate, and win more business.

The long-term intelligence goal is not simply "AI writes proposals." Caterly should understand enough about the operator's own history, capacity, pricing, venues, event types, and conversion patterns to surface useful evidence and recommendations while leaving commercial decisions with the operator.
