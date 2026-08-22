# Phase 1E - Reliability, Scale & Dogfooding

## Mission
Prove that Caterly Core can be trusted under real operational conditions.

Phase 1E is not a final polish pass. It is the evidence milestone: Caterly must survive realistic data volume, failures, concurrency and full event lifecycles before Core is considered locked.

## Reliability principle
A fast application that produces incorrect data or becomes unavailable during service is not fast. Reliability is part of perceived speed because operators cannot afford recovery work.

## Automated domain test suite
Critical rules require deterministic tests:
- event totals/rounding;
- taxes/service charges/discounts;
- package expansion;
- guest-count propagation;
- recipe/production rollup;
- packing rollup;
- event copying;
- payment/balance calculations;
- staffing conflicts;
- tenant isolation;
- authorization;
- lead conversion;
- historical snapshot behavior.

## Integration tests
Test realistic multi-step flows through persistence boundaries rather than only isolated functions.

Examples:
- create client -> event -> menu -> payment -> invoice;
- package -> components -> production;
- lead -> client -> event;
- organization A/B access isolation;
- event update -> audit record.

## End-to-end operational scenarios
Maintain canonical scenarios representing real catering work.

### Scenario A: plated wedding
185 guests, package, substitutions, multiple courses, kitchen notes, equipment, staffing, deposit schedule, guest-count changes, final payment.

### Scenario B: corporate drop-off
Recurring corporate client, fast event duplication, delivery address, simple menu, fixed delivery fee, invoice/payment.

### Scenario C: multi-event Saturday
Several simultaneous events competing for staff and operational attention. Confirm search, calendar, staffing conflicts and application responsiveness.

### Scenario D: late event change
Definite event changes guest count/menu shortly before service. Confirm downstream production/documents update and audit history records the change.

### Scenario E: cancelled event
Cancel after payments/tasks/staffing exist. Preserve history and apply defined reporting/operational behavior.

## Large-data load testing
Use the Phase 1A fixture and expand where useful.

Measure:
- application startup/deployment cold behavior;
- dashboard;
- global search;
- event search;
- event detail;
- client history;
- menu search;
- staff search;
- calendar;
- reports;
- concurrent writes.

Track percentile latency where tooling permits, not just best-case averages.

## Concurrency
Test multiple users editing operational data.

Identify high-risk conflicts:
- guest count;
- event menu;
- payments;
- status;
- staffing;
- notes.

At minimum, avoid silent destructive overwrites where feasible. Determine where optimistic concurrency/version checks or clearer last-write behavior are needed.

## Failure injection
Deliberately test failures:
- database query timeout;
- secondary report failure;
- email failure later;
- optional integration timeout later;
- background job failure;
- network interruption during save;
- duplicate form submission;

Caterly should recover clearly and avoid corrupt/duplicate records.

## Idempotency and duplicate actions
Protect financially or operationally sensitive actions from accidental duplicate submission where appropriate, particularly payment-related operations and future external integrations.

## Monitoring
Production-ready Core needs visibility into:
- application errors;
- slow requests;
- slow database queries;
- failed jobs;
- resource pressure;
- availability;
- key web vitals/performance regressions.

Alerts should be actionable rather than noisy.

## Logging
Use structured logs with enough context to diagnose failures while avoiding sensitive secrets. Include organization/user/entity/request identifiers where appropriate.

## Backup and recovery
Define and test:
- database backups;
- backup retention;
- restore procedure;
- responsible ownership;
- recovery expectations.

A backup strategy is incomplete until restoration has been tested.

## Deployment safety
- CI must pass before deployment.
- Database migrations are reviewed and reversible/recoverable where practical.
- Avoid destructive schema changes without migration plans.
- Have a rollback/recovery strategy for failed releases.
- Separate development/test/production configuration and data.

## Data integrity checks
Create checks or queries for impossible/suspicious states, such as orphaned event components, cross-organization references, invalid shift ranges, inconsistent package links or payment totals that violate defined rules.

## Security verification
Re-run tenant-isolation and permission tests as part of release readiness. Review public endpoints and sensitive operations.

## Dogfooding program
Before presenting Caterly as complete, operate realistic internal events through it.

For each event record:
- what was entered twice;
- what required another application/spreadsheet;
- what was difficult to find;
- what felt slow;
- what produced uncertainty;
- what information was missing;
- what Caterly could have inferred automatically.

Every workaround is product evidence.

## Dogfooding rule
Do not immediately solve every request with another feature. Determine whether the problem is missing capability, poor workflow, missing connection between existing data, bad defaults, or insufficient training/discoverability.

## Performance regression gate
Establish representative benchmarks and compare meaningful releases. A major regression in event opening, search or common mutations blocks Core completion unless explicitly accepted with a remediation plan.

## Core exit criteria
Core is ready to move into premium-module development when a competent catering team can run the basic lifecycle from inquiry through final payment without depending on Caterease, spreadsheets or duplicate data entry for the fundamental workflow.

The goal is not that every specialized business process is present. The goal is that Core is dependable enough to become the foundation for modules rather than modules being used to compensate for Core weaknesses.

## Completion gate
- [ ] Critical domain tests pass reliably.
- [ ] Integration tests cover primary Core flows.
- [ ] Canonical end-to-end scenarios pass.
- [ ] Large-data benchmarks meet Phase 1A expectations or have accepted remediation plans.
- [ ] Multi-user/concurrency risks are tested and documented.
- [ ] Failure injection does not produce silent corruption.
- [ ] Sensitive duplicate submissions are controlled where needed.
- [ ] Monitoring and structured logging exist.
- [ ] Database backup and restore procedure has been tested.
- [ ] Deployment/migration recovery procedures exist.
- [ ] Tenant/security tests pass.
- [ ] Realistic internal events have been dogfooded.
- [ ] Dogfooding friction has been triaged and critical Core gaps resolved.
- [ ] Performance regression checks protect key workflows.

**Gate statement:** Caterly Core has demonstrated that it is fast, connected, industry-native and trustworthy under realistic operating conditions.
