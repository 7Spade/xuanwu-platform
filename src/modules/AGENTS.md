# src/modules Agent Guardrails

Purpose: prevent boundary mistakes across Domain Modules and enforce predictable, reviewable changes.

This file is mandatory guidance for any agent editing code under src/modules.

---

## 0. Non-negotiable Principles

1. One module = one Bounded Context.
2. Keep cohesion high: logic that changes for the same business reason stays in the same module.
3. Dependency direction must be one-way by layer:
	- Presentation -> Application -> Domain
	- Infrastructure implements Domain ports
4. Cross-module access must go through public API only:
	- Allowed: src/modules/<target>.module/index.ts exports
	- Forbidden: direct import from another module's core, domain.*, infra.*, _components
5. Cross-context side effects are event or application orchestration concerns, not direct domain coupling.

---

## 1. Boundary Gate (Run Before Any Edit)

Before writing code, the agent must answer all checks below:

1. Which module owns this business rule?
2. Is the target file in the owning module?
3. Does this edit introduce any cross-module import?
4. If yes, is it from target module public index barrel only?
5. Does the change keep layer direction valid?
6. Is this behavior same-context synchronous invariant, or cross-context eventual propagation?

If any answer is unclear, stop and clarify before editing.

---

## 2. Red Lines (Hard Fail)

Agent must stop and report when any of the following appears:

1. Importing another module internals:
	- src/modules/<other>.module/core/*
	- src/modules/<other>.module/domain.*/*
	- src/modules/<other>.module/infra.*/*
	- src/modules/<other>.module/_components/*
2. Placing Account-specific business logic in workspace.module (or inverse).
3. Placing Infrastructure concerns in Presentation or Domain.
4. Using shortcuts that bypass existing public use-cases and DTO contracts.
5. UI-driven quick fix that silently changes bounded context ownership.

---

## 3. Account vs Workspace Ownership Rule

Use this as the default arbiter:

1. account.module owns:
	- account identity and profile
	- accountType personal|organization semantics
	- active account context switching
	- membership model and account governance
2. workspace.module owns:
	- workspace lifecycle and workspace ACL usage
	- WBS, issue, CR, QA, acceptance, baseline
	- planning and delivery context bound to workspace
3. Workspace UI may consume current account context, but must not own account business rules.

---

## 4. Safe Integration Pattern Across Modules

When module A needs data from module B:

1. Read from module B public API barrel only.
2. Keep module B behavior in B; do not duplicate rules in A.
3. Prefer DTOs and explicit use-cases over internal repository usage.
4. For side effects crossing contexts, use events/application orchestration.
5. Document assumptions where consistency is eventual.

---

## 5. Consistency and Event Flow Rule

1. Aggregate invariants: enforce synchronously inside owning context before persistence.
2. Standard use-case flow:
	- load aggregate -> apply domain rules -> persist -> emit domain event
3. Cross-context updates default to eventual consistency unless explicitly documented otherwise.
4. Do not fake strong consistency by directly mutating another module internals.

---

## 6. Pre-Commit Checklist (Required)

1. No forbidden cross-module internal imports added.
2. Any new cross-module dependency uses public barrel import.
3. Changed logic matches owning bounded context.
4. Layer direction remains valid after edit.
5. i18n and docs are updated if user-facing behavior changed.
6. At least one validation command has been run.

---

## 7. Incident Pattern to Avoid

Never repeat this pattern:

1. Detect boundary issue.
2. Delete component immediately.
3. Forget replacement in correct owning module.

Correct sequence:

1. Confirm ownership.
2. Design replacement target path.
3. Migrate wiring safely.
4. Remove old file last.
5. Validate runtime and imports.

---

## 8. Default Agent Behavior

When uncertain, prefer explicitness over speed:

1. Explain ownership decision first.
2. Propose minimal safe migration steps.
3. Execute in small verifiable diffs.
4. Report what changed, why, and what remains.

This repository values architectural correctness above fast but risky edits.

## Module Documentation Contract

When an agent edits any `src/modules/*.module` directory, it must keep both files present and updated:

- `README.md` must clearly include:
  1. Bounded Context
  2. Core vs Supporting Domain
  3. Context Mapping
  4. Anti-Corruption Layer
  5. Core Business Logic
  6. Operational Flow
  7. Inter-module Contracts
- `AGENTS.md` must include:
  - automation tasks / agent behavior,
  - dependency direction diagram,
  - boundary summary and hard red lines.
