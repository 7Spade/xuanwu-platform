# Architecture — Single Source of Truth / 架構文件總覽

> GitHub Copilot agents read this file to understand domain boundaries, layer responsibilities, and business rules before making changes.
> This is the SSOT (Single Source of Truth) entrypoint for the **xuanwu-platform** project.

---

## Project Overview / 專案概覽

**xuanwu-platform** is a Next.js 15 platform built with **Modular Domain-Driven Design (Modular DDD)** and parallel routing, implementing the Serena operational work management system.

**Modular DDD** means every bounded context lives in its own self-contained **Domain Module** under `src/modules/`. Each module exposes a single public `index.ts` barrel; no module imports the internal files of another. This modular boundary is enforced in addition to the 4-layer DDD direction rules (Presentation → Application → Domain ← Infrastructure).

The structural backbone is **Hexagonal Architecture (Ports & Adapters)**: the domain model is surrounded by inbound ports (driven by UI and API) and outbound ports (implemented by infrastructure adapters). Business rules live exclusively in the Domain layer; infrastructure is a plug-in concern. The full design philosophy is documented in the [Model-Driven Hexagonal Architecture guide](./model-driven-hexagonal-architecture.md).

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router, parallel routing) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Design System | Five-tier: primitives / components / patterns / tokens / layout (see [Design System](#design-system)) |
| Drag and Drop | `@atlaskit/pragmatic-drag-and-drop` + Visual Indicators (VIs) |
| Validation | Zod |
| Backend / DB | Firebase (Firestore, Auth, Storage, App Check) |
| AI Pipeline | Genkit |

---

## Navigation / 文件導覽

- [**Model-Driven Hexagonal Architecture Guide**](./model-driven-hexagonal-architecture.md) — MDDD design philosophy, Ports & Adapters, Context Mapping, and development guide *(start here for architecture questions)*
- [**Architecture Overview**](./overview.md) — Quick reference for developers new to the repository
- [**Architecture Issues**](./issues.md) — Known architecture issues and resolution status
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

This project follows a strict 4-layer DDD architecture within each Domain Module.

### Layer Responsibilities

| Layer | Location | Responsibility | Allowed dependencies |
|-------|----------|----------------|----------------------|
| **Domain** | `src/modules/<module>/domain.<aggregate>/` | Entities, value objects, aggregates, domain events, port interfaces, domain services | None (pure business logic) |
| **Application** | `src/modules/<module>/core/_use-cases.ts`, `_actions.ts`, `_queries.ts` | Use cases, application services, DTOs, command/query objects | Domain layer only |
| **Infrastructure** | `src/modules/<module>/infra.<adapter>/` | Repository implementations, external API adapters, Firebase integration, persistence | Domain + Application port interfaces |
| **UI / Presentation** | `src/modules/<module>/_components/`, `src/app/` | React components, Next.js pages and route handlers | Application layer (via DTOs) |

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
┌──────────────────────────────────────────────────────────────────────────┐
│                            SaaS Layer                                    │
│  Identity · Account (+ Teams/Membership) · Namespace  ·  Settlement  ·  │
│  Social  ·  Notification  ·  Achievement  ·  Audit  ·  Search           │
│              ┌──────────────────────┐                                    │
│              │  Workforce Scheduling │  ← Bridge                        │
│              └──────────────────────┘                                    │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  Crossed via: Event Bus + typed contracts
┌───────────────────────────────▼──────────────────────────────────────────┐
│                        Workspace Layer                                   │
│  Workspace · WBS · Issue · CR · QA · Acceptance · Baseline ·            │
│  Files · Intelligence Pipeline · Work Items/Milestones · Fork Network · │
│  Collaboration (Comments · Presence · Co-editing)                        │
└──────────────────────────────────────────────────────────────────────────┘
```

See [Service Boundary](./catalog/service-boundary.md) for crossing protocols and ownership rules.

---

## Domain Modules / 領域模組

| Module | Location | Layer | Description |
|--------|----------|-------|-------------|
| Identity | `src/modules/identity.module/` | SaaS (cross-cutting) | Authentication · Credentials · Sessions · Identity Providers (replaces raw Firebase Auth) |
| Account | `src/modules/account.module/` | SaaS | Unified Account entity (AccountType: personal \| organization) · Public profile · Team + Membership governance (absorbed from removed org.module) |
| Namespace | `src/modules/namespace.module/` | SaaS | Namespace (shared path-resolution: org account namespaces + personal account namespaces) |
| Workspace | `src/modules/workspace.module/` | Workspace | Workspace, WBS, Issue, CR, QA, Acceptance, Baseline |
| File & Intel | `src/modules/file.module/` | Workspace | Files, Document Parsing, Object Extraction, Intelligence Pipeline |
| Work | `src/modules/work.module/` | Workspace | Work Items, Milestones, Dependencies |
| Fork | `src/modules/fork.module/` | Workspace | Fork Network (planning branches + merge-back proposals) |
| Workforce Scheduling | `src/modules/workforce.module/` | Bridge | Workforce Scheduling (SaaS ↔ Workspace bridge) |
| Settlement | `src/modules/settlement.module/` | SaaS | AR, AP, Settlement records |
| Notification | `src/modules/notification.module/` | SaaS (cross-cutting) | Notification Engine, Inbox, Email, Mobile Push |
| Social | `src/modules/social.module/` | SaaS | Social Graph (Star/Watch/Follow), Feed, Dashboard, Discovery |
| Achievement | `src/modules/achievement.module/` | SaaS | Achievement Rules, Badge Unlocking (projected to account.module via IAccountBadgeWritePort) |
| Collaboration | `src/modules/collaboration.module/` | Workspace (cross-cutting) | Comments, Reactions, Presence, Co-editing sessions |
| Search | `src/modules/search.module/` | SaaS (cross-cutting) | Full-text + semantic search index, unified query surface |
| Audit | `src/modules/audit.module/` | SaaS (cross-cutting) | Audit trail (immutable), Policy automation (Sec), Compliance reports |
| Causal Graph | `src/modules/causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal nodes, cause-effect edges, impact scope, causal path analysis |

> Each module is self-contained — ports, value objects, and infrastructure adapters live inside the module, not in shared global directories.
> Every module folder contains a `README.md` documenting its bounded context, aggregates, and cross-module dependencies.
> See [`core-logic.mermaid`](./diagrams/core-logic.mermaid) for the full interaction sequence that drove this module decomposition.
>
> **Removed modules:** `org.module` (→ `account.module`), `profile.module` (→ `account.module`), `feature.module` (removed PR #12 — feature flag infrastructure belongs in `src/infrastructure/` or Firebase Remote Config, not a standalone BC).

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

The design system lives in `src/design-system/` and follows a **five-tier hierarchy**:

| Tier | Location | Contents |
|------|----------|----------|
| **primitives** | `src/design-system/primitives/` | Raw shadcn/ui components (Button, Input, Dialog, …). Configured via `components.json` with new-york style and Tailwind v4 CSS variables. |
| **components** | `src/design-system/components/` | Project-specific wrappers that compose or extend primitives with Xuanwu branding and behaviour. |
| **patterns** | `src/design-system/patterns/` | Higher-order composites built from components (e.g. data tables, sidebars, command palettes). |
| **tokens** | `src/design-system/tokens/` | Design-token constants: colours, spacing, typography, radii, shadows, z-index, and motion values. Mirrors the CSS custom-properties in `globals.css` / `tailwind.config.ts`. |
| **layout** | `src/design-system/layout/` | Structural layout shells (base shell, marketing layouts). Composed from lower-tier components. |

`src/design-system/providers/` houses React context providers (e.g. ThemeProvider) consumed across tiers.

```typescript
import { Button }        from "@/design-system/primitives";
import { SearchField }   from "@/design-system/components";
import { LoginForm }     from "@/design-system/patterns";
import { colorBrand }    from "@/design-system/tokens";
import { HomeLayout }    from "@/design-system/layout";
```

### Drag and Drop — `@atlaskit/pragmatic-drag-and-drop`

Drag-and-drop interactions use **`@atlaskit/pragmatic-drag-and-drop`** (Atlassian's low-level, framework-agnostic DnD library). It provides:

- `draggable()` / `dropTargetForElements()` — core event adapters
- `@atlaskit/pragmatic-drag-and-drop-hitbox` — edge / center hitbox helpers for tree and list reordering
- `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` — **Visual Indicators (VIs)**: rendered drop-indicator lines and boxes that provide visible drag feedback

**Visual Indicators (VIs)** are the visual feedback elements shown during a drag operation (e.g. a blue line between list items, a border highlight on a drop zone). They live in the module's Presentation layer (`src/modules/<module>/_components/`) and must not contain business logic.

**vis-date + Firebase collaboration:**  
`VisDateMetadata` (defined in `@/shared/interfaces`) carries the temporal position of a draggable item resolved from Firestore. Server Actions fetch and cache these values via `cacheAside` and pass them as serialised props. The Presentation layer reads these props to render `<DateDropIndicator>` at the correct timeline position — **without making any additional DB calls**.

```
Firestore (source of truth)
  └→ Server Action (cacheAside read from @/infrastructure/firebase/admin/db/cacheLayer)
      └→ serialised VisDateMetadata props
          └→ Presentation layer renders <DateDropIndicator> at correct date position
```

Usage pattern:
```typescript
// Presentation layer — drag source
draggable({ element: ref.current, getInitialData: () => ({ id, visDate }) });

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

## Shared Layer / 共享層

Cross-cutting utilities, types, errors, and i18n that are NOT domain-specific live in `src/shared/`.

**All shared imports should use the unified barrel entry point:**

```typescript
import { AppError, formatDate, PaginatedResponse, ok, fail } from "@/shared";
import { useTranslation } from "@/shared"; // i18n translate function
```

**Client-side hooks** carry a `"use client"` directive and must be imported separately from within Client Components only:

```typescript
import { useToggle, useDebounce, useLocalStorage } from "@/shared/directives";
```

| Sub-module | Alias | Contents |
|------------|-------|---------|
| `constants/` | `@/shared` | `APP_NAME`, `DEFAULT_LOCALE`, `SUPPORTED_LOCALES`, date format tokens |
| `errors/` | `@/shared` | `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `toAppError` |
| `interfaces/` | `@/shared` | `ApiResponse`, `ApiError`, `PaginationQuery`, `PaginatedResult`, `FirestoreDocument`, `VisDateMetadata` |
| `i18n/` | `@/shared` | `isSupportedLocale`, `resolveLocale`, `useTranslation`, `getMessages` |
| `pipes/` | `@/shared` | `Pipe`, `schemaPipe`, `transformPipe`, `composePipes`, `trimPipe` |
| `types/` | `@/shared` | `UuidSchema`, `PaginationSchema`, `LocaleSchema`, `Result`, `ok`, `fail`, Zod primitives |
| `utils/` | `@/shared` | `formatDate`, `formatDateTime`, `capitalise`, `toKebabCase`, `omit`, `pick`, `unique`, `chunk` |
| `directives/` | `@/shared/directives` | React hooks: `useToggle`, `useDebounce`, `useLocalStorage`, `usePrevious`, `useIsMounted` (client only) |

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
| Remote Config | Dynamic feature flags and configuration |

### Infrastructure Location

Firebase adapters live in **`src/infrastructure/firebase/`**, split into two sub-surfaces:

| Sub-path | SDK | Runtime | Use in |
|----------|-----|---------|--------|
| `src/infrastructure/firebase/client/` | Firebase Web SDK | Browser | Client Components |
| `src/infrastructure/firebase/admin/` | Firebase Admin SDK | Node.js | Server Actions, Route Handlers |

```typescript
// Client Component — Web SDK
import { getFirebaseAuth } from "@/infrastructure/firebase/client";

// Server Action — Admin SDK
import { verifyIdToken }   from "@/infrastructure/firebase/admin/auth";
import { cacheAside }      from "@/infrastructure/firebase/admin/db/cacheLayer";
import { commitBatch }     from "@/infrastructure/firebase/admin/db/batchWrite";
```

### Cost Control Strategy

| Strategy | Implementation |
|----------|---------------|
| Reduce Firestore write count | Batch writes via `commitBatch()` — auto-chunks at 490 ops |
| Reduce read latency & cost | Cache-aside reads via `cacheAside()` — default TTL 5 min |
| Reduce frontend subscriptions | Prefer one-time fetches + cache over `onSnapshot` |
| Optimize Storage uploads | Use resumable upload for large files |
| Dynamic config | Remote Config with 12 h fetch interval |

See [`src/infrastructure/firebase/README.md`](../../src/infrastructure/firebase/README.md) for the full design guide.

---


| ID | Decision | Status | Date |
|----|----------|--------|------|
| ADR-001 | Adopt DDD 4-layer architecture | Accepted | — |
| ADR-002 | Use Next.js App Router with parallel routing | Accepted | — |
| ADR-003 | Use Tailwind CSS v4 with shadcn/ui | Accepted | — |
| ADR-004 | Use Firebase (Firestore + Auth + Storage) as infrastructure | Accepted | — |
| ADR-005 | Use Event Bus for SaaS ↔ Workspace boundary crossing | Accepted | — |
| ADR-006 | Adopt Modular DDD — each module is self-contained, no shared global domain directory | Accepted | — |
| ADR-007 | Use `@atlaskit/pragmatic-drag-and-drop` for drag-and-drop interactions + VIs | Accepted | — |

See [ADR README](./adr/README.md) for writing rules and full history.
