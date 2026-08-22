# Phase 1B - Event, Menu & Production Integrity

## Mission
Make Caterly's catering engine correct, connected and trustworthy.

Phase 1B establishes the Event as the authoritative operational record and ensures changes flow correctly through menus, packages, production, packing, staffing, financials and documents.

## Core rule
Enter an operational fact once. Every dependent Core workflow consumes that same authoritative fact.

## Event source of truth
The Event owns or references authoritative facts including client, venue/location, date/time, guest count, status, service style, menu, pricing terms, notes, staffing requirements/assignments, payments and tasks.

Changing guest count must not require separate edits to kitchen sheets, BEOs and financial views. Derived information is recalculated from the event.

## Event lifecycle
Support prospective, tentative, definite, completed and cancelled states with clearly defined behavior. Status changes should be centralized domain operations and later feed audit/automation systems.

Define what cancellation means for scheduled payments, staffing, reporting and future automation without deleting history.

## Event creation
Creation should capture only what is required to establish the event and allow progressive completion. Avoid giant forms that force unnecessary information before a record can exist.

Support fast creation from a client and eventually direct lead conversion without duplicate entry.

## Event copying
Copying must intentionally define which data carries forward: client optionally, event structure, menu, package relationships, pricing, notes/templates and staffing requirements. Payments, completed tasks, historical audit records and staff assignments should not blindly copy.

Copy behavior must be tested.

## Event menu snapshots
Event menu lines must preserve the commercial and operational state agreed for that event even when the master menu later changes.

Store/reconstruct event-specific name, description, quantity, unit price, tax behavior, category and master-menu relationship where applicable.

Master menu edits must not silently alter historical event pricing or descriptions.

## Packages
Fix package architecture early.

A package cannot be represented only as an opaque text line if its components drive production. Applying a package must preserve the underlying menu-item components and the commercial package relationship.

Requirements:
- Package identity remains visible.
- Included items remain structurally linked.
- Components feed recipe/packing production.
- Event-specific substitutions are possible.
- Removing/replacing an item has predictable pricing behavior.
- Package-level price can remain distinct from individual component retail prices.
- Historical event package content remains stable after the master package changes.

Acceptance: a four-item package added for 150 guests generates correct production requirements for all four underlying items.

## Quantity semantics
Define what quantity means for every event line. Per-person items, trays, platters, dozens, each, litres and custom units cannot be treated ambiguously.

Core should support clear selling/production quantity semantics and avoid silently assuming every menu item is one unit per guest.

## Recipes
Core recipe capability must be sufficient to operate events:
- Menu item recipe lines.
- Ingredient/prep component name.
- Quantity.
- Unit.
- Yield/serving basis defined clearly enough to calculate event requirement.
- Sub-recipe architecture anticipated even if advanced costing waits for later modules.

A recipe must specify whether its quantity is per serving, per recipe batch, or another explicit basis. Avoid hidden assumptions.

## Production rollup
Production logic belongs in a domain/service layer, not a print page.

Inputs: event menu components, event quantities, recipes and production rules.
Outputs: production list and consolidated ingredient/prep requirements.

The same production calculation should feed kitchen views, printouts and future Production/Supply modules.

## Packing rollup
Packing/equipment requirements must similarly be derived from event menu and operational requirements.

Support equipment name, quantity, unit and eventual category/source. Duplicate requirements should consolidate correctly when appropriate.

## Guest-count propagation
Acceptance scenario:
1. Event is 120 guests.
2. Package/menu production is generated.
3. Guest count changes to 143.
4. Every guest-count-dependent menu/production calculation updates from the authoritative event fact.
5. Fixed-quantity lines remain fixed when that is their defined behavior.
6. BEO and operational documents show the new authoritative count.

No duplicate guest-count fields should drift apart.

## Pricing
Centralize and test subtotal, discounts, service charges, taxes, total, paid and balance.

Define rounding rules explicitly. Preserve event-specific pricing snapshots. Prepare for company-configurable financial rules in Phase 1C/1D without overbuilding them now.

## Payments
Core supports received payments and scheduled payments. Payments must update event paid/balance consistently.

Define deletion/correction behavior and preserve future auditability. Payment-plan automation is deferred to a premium module, but Core data should not block it.

## Staffing integrity
Basic event staffing remains Core:
- Required position.
- Shift start/end.
- Staff assignment.
- Conflict detection.
- Hourly rate/labour visibility where available.

Scheduling conflict logic must be reusable domain logic. Workforce optimization remains a later module.

## Tasks and notes
Tasks and operational notes must remain attached to authoritative events and available without document-specific duplication.

Separate client-facing, kitchen and staffing notes where operationally useful.

## Documents
BEO, kitchen sheet, packing sheet and invoice must derive from authoritative event data.

A document should not require the operator to re-enter information already on the event.

Prepare for future document snapshots/versioning so a finalized/issued document can be distinguished from a live editable event.

## Kitchen acceptance scenario
Create a realistic 185-person plated wedding with a package, substitutions, fixed-quantity add-ons, kitchen notes and equipment requirements. Change guest count and one menu component. Production and packing must remain mathematically and operationally correct.

## Financial acceptance scenario
Create an event with taxable/non-taxable lines, discount, service charge, tax, multiple received payments and scheduled deposits. Totals must be consistent on event view, invoice and reports.

## Staffing acceptance scenario
Assign a staff member to overlapping events and confirm conflict detection. Valid adjacent/non-overlapping shifts must remain possible according to defined boundary behavior.

## Historical integrity
Changing a master menu item/package after an event is confirmed must not unexpectedly rewrite the historical event's commercial terms or agreed menu content.

## Explicitly deferred
Advanced ingredient costing, live supplier pricing, inventory, purchase orders, advanced workforce scheduling, automated billing, restaurant forecasting and advanced analytics remain outside Phase 1B.

## Completion gate
- [ ] Event is the authoritative source for core operational facts.
- [ ] Event copying has intentional/tested semantics.
- [ ] Event menu snapshots protect historical/commercial integrity.
- [ ] Packages preserve component structure.
- [ ] Package components feed production correctly.
- [ ] Quantity semantics are explicit.
- [ ] Production calculation is reusable outside print pages.
- [ ] Packing calculation is reusable outside print pages.
- [ ] Guest-count changes propagate correctly.
- [ ] Pricing calculations are centralized and tested.
- [ ] Payments consistently update balances.
- [ ] Staffing conflict logic is centralized and tested.
- [ ] BEO/kitchen/packing/invoice derive from authoritative event data.
- [ ] Realistic wedding scenario passes end-to-end.

**Gate statement:** Caterly can represent and operate a real catering event without disconnected copies of the same information.
