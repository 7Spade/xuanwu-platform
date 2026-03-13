# Architecture — Single Source of Truth / 架構文件總覽

> GitHub Copilot agents read this file to understand domain boundaries, layer responsibilities, and business rules before making changes.
> This is the SSOT (Single Source of Truth) entrypoint for the **xuanwu-platform** project.

---

## Project Overview / 專案概覽

**xuanwu-platform** is a Next.js 15 platform built with **Modular Domain-Driven Design (Modular DDD)** and parallel routing, implementing the Serena operational work management system.

**Modular DDD** means every bounded context lives in its own self-contained feature slice under `src/features/`. Slices expose a single public `index.ts` barrel; no slice imports the internal files of another. This modular boundary is enforced in addition to the 4-layer DDD direction rules (Presentation → Application → Domain ← Infrastructure).

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router, parallel routing) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Design System | Three-tier: primitives / components / patterns (see [Design System](#design-system)) |
| Drag and Drop | `@atlaskit/pragmatic-drag-and-drop` + Visual Indicators (VIs) |
| Validation | Zod |
| Backend / DB | Firebase (Firestore, Auth, Storage, App Check) |
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
| **Domain** | `src/features/<slice>/domain.<aggregate>/` | Entities, value objects, aggregates, domain events, port interfaces | None (pure business logic) |
| **Application** | `src/features/<slice>/core/_use-cases.ts`, `_actions.ts`, `_queries.ts` | Use cases, application services, DTOs, command/query objects | Domain layer only |
| **Infrastructure** | `src/features/<slice>/infra.<adapter>/` | Repository implementations, external API adapters, Firebase integration, persistence | Domain + Application port interfaces |
| **UI / Presentation** | `src/features/<slice>/_components/`, `src/app/` | React components, Next.js pages and route handlers | Application layer (via DTOs) |

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
| Organization | `src/features/org.slice/` | SaaS | Org, Namespace, Team |
| Workspace | `src/features/workspace.slice/` | Workspace | Workspace, WBS, Issues, CR |
| File & Intel | `src/features/file.slice/` | Workspace | Files, Document Parsing, Object Extraction |
| Settlement | `src/features/settlement.slice/` | SaaS | AR, AP, Settlement records |

> Expand this table as slices are implemented. Each slice is self-contained — ports, value objects, and infrastructure adapters live inside the slice, not in shared global directories.

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

## Design System

The design system lives in `src/design-system/` and follows a three-tier hierarchy:

| Tier | Location | Contents |
|------|----------|----------|
| **primitives** | `src/design-system/primitives/` | Raw shadcn/ui components (Button, Input, Dialog, …). Configured via `components.json` with new-york style and Tailwind v4 CSS variables. |
| **components** | `src/design-system/components/` | Project-specific wrappers that compose or extend primitives with Xuanwu branding and behaviour. |
| **patterns** | `src/design-system/patterns/` | Higher-order composites built from components (e.g. data tables, sidebars, command palettes). |

```
import { Button }      from "@/design-system/primitives";
import { SearchField } from "@/design-system/components";
import { LoginForm }   from "@/design-system/patterns";
```

### Drag and Drop — `@atlaskit/pragmatic-drag-and-drop`

Drag-and-drop interactions use **`@atlaskit/pragmatic-drag-and-drop`** (Atlassian's low-level, framework-agnostic DnD library). It provides:

- `draggable()` / `dropTargetForElements()` — core event adapters
- `@atlaskit/pragmatic-drag-and-drop-hitbox` — edge / center hitbox helpers for tree and list reordering
- `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` — **Visual Indicators (VIs)**: rendered drop-indicator lines and boxes that provide visible drag feedback

**Visual Indicators (VIs)** are the visual feedback elements shown during a drag operation (e.g. a blue line between list items, a border highlight on a drop zone). They are always rendered by the Presentation layer and must not contain business logic.

Usage pattern:
```typescript
// Presentation layer — drag source
draggable({ element: ref.current, getInitialData: () => ({ id }) });

// Presentation layer — drop target with VI
dropTargetForElements({
  element: ref.current,
  onDragEnter: () => setDragOver(true),
  onDragLeave: () => setDragOver(false),
  onDrop: ({ source }) => onDrop(source.data.id),
});
// Render <DropIndicator /> from @atlaskit/pragmatic-drag-and-drop-react-drop-indicator
```

---

## Firebase Integration

Firebase (`xuanwu-i-00708880-4e2d8`) is the primary backend infrastructure. Services used:

| Service | Purpose |
|---------|---------|
| Firestore | Document database — persistent domain aggregates |
| Firebase Auth | Identity provider (Google, GitHub, Email/Password) |
| Firebase Storage | File and asset storage |
| Firebase App Check | Request attestation (ReCaptcha Enterprise) |
| Firebase Messaging | Push notifications |
| Firebase Analytics | Event tracking |

**Firebase code lives inside feature slice infrastructure adapters** (`src/features/<slice>/infra.<adapter>/`), not in a global shared directory. Each adapter implements the port interface defined in the same slice's domain layer.

For server-side operations use the **Firebase Admin SDK** in Server Actions or Route Handlers. For client-side real-time subscriptions use the **Firebase Web SDK** in Client Components.

---


| ID | Decision | Status | Date |
|----|----------|--------|------|
| ADR-001 | Adopt DDD 4-layer architecture | Accepted | — |
| ADR-002 | Use Next.js App Router with parallel routing | Accepted | — |
| ADR-003 | Use Tailwind CSS v4 with shadcn/ui | Accepted | — |
| ADR-004 | Use Firebase (Firestore + Auth + Storage) as infrastructure | Accepted | — |
| ADR-005 | Use Event Bus for SaaS ↔ Workspace boundary crossing | Accepted | — |
| ADR-006 | Adopt Modular DDD — each slice is self-contained, no shared global domain directory | Accepted | — |
| ADR-007 | Use `@atlaskit/pragmatic-drag-and-drop` for drag-and-drop interactions + VIs | Accepted | — |

See [ADR README](./adr/README.md) for writing rules and full history.
