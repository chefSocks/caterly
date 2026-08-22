# Phase 1D - Workflow & Operator Experience

## Mission
Make Caterly feel natural to an experienced catering operator.

Phase 1D is where technically correct Core workflows become unusually efficient. The objective is not visual decoration; it is fewer clicks, less searching, less duplicate entry and faster movement through repeated daily work.

## Operator-first rule
For every workflow ask:
1. What is the operator trying to accomplish?
2. What information does Caterly already know?
3. Why are we asking them to enter it again?
4. What is the fastest safe path?
5. What would an experienced caterer expect to happen next?

## Global search
Create fast access across clients, events, leads, menu items and eventually staff/venues.

Requirements:
- Accessible from anywhere.
- Keyboard shortcut such as Ctrl/Cmd+K.
- Search by useful identifiers including event number, event/client name and dates where practical.
- Results grouped/ranked clearly.
- Keyboard navigation.
- Recent records.
- Quick actions where appropriate.

## Command palette
Build on global search with commands such as new event, new lead, new client, open today's events, unpaid balances and upcoming staffing.

Commands should be discoverable; shortcuts should accelerate experts without being mandatory.

## Event workspace
The event page should become an operational workspace rather than one giant form.

Prioritize:
- identity/status/date/client/guest count immediately visible;
- clear sections for menu, details, financials, staffing, tasks/notes and documents;
- save behavior that is obvious and fast;
- minimal full-page blocking;
- navigation that preserves context;
- destructive actions separated from routine actions.

Consider inline editing or focused edit modes where they reduce friction without creating accidental changes.

## Fast event creation
Create an event with the minimum required facts, then progressively enrich it.

Support sensible company defaults. Creating a tentative inquiry should not require information only known after confirmation.

## Lead to client to event
This flow must exemplify CONNECTED.

When a lead is won/converted:
- reuse contact/company data;
- reuse event date/type/guest count/budget/notes where relevant;
- create/link the client intelligently;
- create the event without duplicate typing;
- preserve lead source for attribution.

Avoid duplicate clients through search/match prompts rather than silently creating copies.

## Leads Core polish
Core should include useful pipeline behavior without becoming Leads Pro:
- owner/assignee;
- follow-up date;
- source;
- status;
- lost reason;
- quick notes;
- overdue follow-up visibility;
- basic conversion reporting.

Automated campaigns and advanced lead scoring remain premium/future.

## Client workspace
A client should quickly answer:
- Who are they?
- How do I contact them?
- What events do they have?
- What do they owe?
- What is upcoming?
- What happened recently?

Support organization/company clients and anticipate multiple contacts.

## Calendar
Improve operational usefulness:
- Fast month/week navigation.
- Clear event status.
- Guest count/location at useful density.
- Open event quickly.
- Filters that do not require expensive reloads.
- Prepare for venue/resource views later.

## Dashboard
The dashboard is an action surface, not a wall of charts.

Prioritize:
- today's events;
- upcoming events;
- overdue tasks;
- payment/deposit attention;
- lead follow-ups;
- operational exceptions.

Secondary analytics should not delay primary operational content.

## Tasks
Make tasks useful enough to replace sticky notes for basic event administration:
- assignee;
- due date;
- event link;
- quick completion;
- overdue state;
- dashboard visibility;
- fast creation from an event.

## Defaults and templates
Company defaults should remove repetitive typing while remaining overridable.

Candidates:
- tax/service charge;
- common service type;
- standard notes/templates;
- payment schedule later;
- staffing position names;
- event naming assistance;
- document identity.

## Notifications and alerts
Core should focus on high-signal operational attention rather than noisy notifications.

Potential Core alerts:
- overdue task;
- scheduled payment overdue;
- staffing conflict;
- event missing critical information close to event date.

Advanced rules belong in Caterly Automation.

## Accessibility and input efficiency
- Logical tab order.
- Visible focus states.
- Keyboard-operable search/select controls.
- Forms usable without precision mouse work.
- Clear validation near the relevant field.
- Avoid tiny click targets.
- Responsive layouts for laptop/tablet operational use.

## Destructive-action safety
Deleting/cancelling events, payments and important records should be intentional. Prefer archive/cancel where operational history matters. Avoid confirmation friction on harmless routine actions.

## Empty states
Empty states should tell the operator what to do next rather than merely state that nothing exists.

## Language
Use hospitality terminology consistently. Avoid technical/database language in operator-facing UI.

## Workflow measurement
Measure workflows in actions/time, not just page speed.

Example benchmark tasks:
- Find an event from its client name.
- Create a lead.
- Convert lead to event.
- Add a package.
- Change guest count.
- Record a deposit.
- Assign staff.
- Print/open BEO.

Track how many interactions and how much waiting each requires.

## Acceptance scenarios
An experienced user should be able to perform common tasks rapidly without hunting through navigation or waiting for unrelated data.

Run timed usability scenarios and record friction. Any repeated workaround becomes product input.

## Explicitly deferred
Advanced automation, marketing campaigns, employee mobile app, restaurant scheduling, supplier ordering and advanced analytics are outside Phase 1D.

## Completion gate
- [ ] Global search works across primary Core records.
- [ ] Keyboard navigation works for search and primary selectors.
- [ ] Event workspace prioritizes operational information.
- [ ] Event creation is progressive and fast.
- [ ] Lead conversion reuses known information.
- [ ] Core lead pipeline supports assignment/follow-up/source/lost reason.
- [ ] Client workspace exposes history/upcoming/financial context efficiently.
- [ ] Dashboard prioritizes action over decorative analytics.
- [ ] Calendar supports fast operational navigation.
- [ ] Tasks are quick to create/complete and surface when overdue.
- [ ] Company defaults reduce repeated entry.
- [ ] Destructive actions are protected without slowing normal work.
- [ ] Common workflows have measured interaction/time benchmarks.

**Gate statement:** experienced catering operators can move through Caterly naturally and become faster as they learn the system.
