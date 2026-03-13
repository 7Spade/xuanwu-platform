# Architecture — Single Source of Truth / 架構文件總覽

> GitHub Copilot agents read this file to understand domain boundaries, layer responsibilities, and business rules before making changes.
> This is the SSOT (Single Source of Truth) entrypoint for the **xuanwu-platform** project.

---

## Project Overview / 專案概覽

**xuanwu-platform** is a Next.js 15 platform built with Domain-Driven Design (DDD) and parallel routing, implementing the Serena operational work management system.

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Validation | Zod |
| Backend / DB | Firebase (Firestore, Auth, Storage) |
| AI Pipeline | Genkit |

---

## Navigation / 文件導覽

- [ADR (Architecture Decision Records)](./adr/README.md) — Architecture decisions and rationale
- [Architecture Catalog](./catalog/index.md) — Entities, events, and service boundaries
- [Glossary](./glossary/glossary.md) — Shared business and technical vocabulary
- [Diagrams](./diagrams/) — Mermaid source diagrams

**Suggested reading order:**
1. [Glossary](./glossary/glossary.md) — align terminology first
2. [Business Entities](./catalog/business-entities.md) — understand domain objects
3. [Service Boundary](./catalog/service-boundary.md) — SaaS ↔ Workspace boundary rules
4. [Event Catalog](./catalog/event-catalog.md) — domain event contracts
5. [ADR README](./adr/README.md) — decision history

---

## DDD Layer Architecture / DDD 層次架構

This project follows a strict 4-layer DDD architecture within each feature slice.

### Layer Responsibilities

| Layer | Location | Responsibility | Allowed dependencies |
|-------|----------|----------------|----------------------|
| **Domain** | `src/<slice>/domain/` | Entities, value objects, aggregates, domain events, repository interfaces | None (pure business logic) |
| **Application** | `src/<slice>/core/_use-cases.ts`, `_actions.ts`, `_queries.ts` | Use cases, application services, DTOs, command/query objects | Domain layer only |
| **Infrastructure** | `src/shared-infra/`, `src/<slice>/infra.*/` | Repository implementations, external API adapters, persistence | Domain + Application interfaces |
| **UI / Presentation** | `src/<slice>/_components/`, `src/app/` | React components, Next.js pages and route handlers | Application layer (via DTOs) |

### Layer Direction Rules

```
UI → Application → Domain
Infrastructure implements → Domain interfaces
```

- UI components must NOT import directly from Domain or Infrastructure.
- Domain layer must NOT depend on any other layer.
- Infrastructure implements Domain interfaces (dependency inversion).

---

## Domain Architecture: SaaS ↔ Workspace Boundary

The system is divided into two primary layers with a governing boundary between them:

```
┌─────────────────────────────────────────────────────────┐
│                     SaaS Layer                          │
│  Organization · Namespace · Team · Settlement · Social  │
│              ┌──────────────────────┐                   │
│              │  Workforce Scheduling │  ← Bridge        │
│              └──────────────────────┘                   │
└──────────────────────┬──────────────────────────────────┘
                       │  Crossed via: Event Bus + typed contracts
┌──────────────────────▼──────────────────────────────────┐
│                  Workspace Layer                         │
│  Workspace · WBS · Issue · CR · Files · Intelligence    │
└─────────────────────────────────────────────────────────┘
```

See [Service Boundary](./catalog/service-boundary.md) for crossing protocols and ownership rules.

---

## Domain Slices / 領域切片

| Slice | Location | Layer | Description |
|-------|----------|-------|-------------|
| Shared Kernel | `src/shared-kernel/` | Cross-cutting | Value objects, ports, data contracts |
| Shared Infra | `src/shared-infra/` | Infrastructure | Firebase client, adapters |
| Organization | `src/features/org.slice/` | SaaS | Org, Namespace, Team |
| Workspace | `src/features/workspace.slice/` | Workspace | Workspace, WBS, Issues, CR |
| File & Intel | `src/features/file.slice/` | Workspace | Files, Document Parsing, Object Extraction |
| Settlement | `src/features/settlement.slice/` | SaaS | AR, AP, Settlement records |

> Expand this table as slices are implemented.

---

## Next.js Parallel Routing Structure

```
src/app/
├── layout.tsx              ← Root layout (receives slot props)
├── page.tsx                ← Default page
├── @modal/                 ← Parallel route: modal slot
│   └── (...)               ← Intercepting routes for modals
├── @sidebar/               ← Parallel route: sidebar slot
│   └── default.tsx
└── (features)/             ← Feature-grouped route segments
```

Parallel routes allow multiple pages to render simultaneously in the same layout. Use `@slotName` folders to define named slots in `layout.tsx`.

---

## Architecture Decision Records

| ID | Decision | Status | Date |
|----|----------|--------|------|
| ADR-001 | Adopt DDD 4-layer architecture | Accepted | — |
| ADR-002 | Use Next.js App Router with parallel routing | Accepted | — |
| ADR-003 | Use Tailwind CSS v4 with shadcn/ui | Accepted | — |
| ADR-004 | Use Firebase (Firestore + Auth + Storage) as infrastructure | Accepted | — |
| ADR-005 | Use Event Bus for SaaS ↔ Workspace boundary crossing | Accepted | — |

See [ADR README](./adr/README.md) for writing rules and full history.
