# Xuanwu Platform — Architecture Overview

> **Quick reference** for developers new to the repository.  
> Detailed SSOT: [`docs/architecture/README.md`](./docs/architecture/README.md)

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 15 (App Router, parallel routing) |
| Language | TypeScript 5 |
| UI library | React 19 + Tailwind CSS v4 + shadcn/ui |
| Backend / DB | Firebase (Firestore, Auth, Storage, App Check) |
| AI pipeline | Genkit + Gemini 2.5 Flash |
| Queue / async | Upstash (Redis · QStash · Workflow · Vector) |
| Drag-and-drop | `@atlaskit/pragmatic-drag-and-drop` |
| Validation | Zod |

---

## Repository Layout

```
xuanwu-platform/
├── src/
│   ├── app/                  # Next.js App Router — pages & route handlers only
│   ├── design-system/        # UI layer: primitives / components / patterns / tokens / layout
│   ├── modules/              # Domain Modules (Bounded Contexts, Modular DDD)
│   ├── shared/               # Cross-cutting utilities, i18n, types, directives
│   └── infrastructure/       # Firebase & Upstash adapters (server-only)
├── functions/                # Firebase Cloud Functions
├── docs/architecture/        # Architecture SSOT, ADRs, diagrams, glossary
└── architecture.md           # ← You are here (quick reference)
```

---

## DDD 4-Layer Architecture

Each Domain Module under `src/modules/` is self-contained and follows a strict 4-layer hierarchy:

```
┌──────────────────────────┐
│  Presentation (UI)       │  src/app/  ·  src/modules/<m>/_components/
│  React + Next.js         │
└──────────────▲───────────┘
               │ calls
┌──────────────┴───────────┐
│  Application             │  core/_use-cases.ts  ·  _actions.ts  ·  _queries.ts
│  Use cases, DTOs         │
└──────────────▲───────────┘
               │ calls
┌──────────────┴───────────┐
│  Domain                  │  domain.*/_entity.ts  ·  _value-objects.ts
│  Pure business logic     │  _ports.ts  ·  _service.ts
└──────────────▲───────────┘
               │ implements
┌──────────────┴───────────┐
│  Infrastructure          │  infra.<adapter>/  ·  src/infrastructure/
│  Firebase, Upstash, …    │
└──────────────────────────┘
```

**Dependency direction:** Presentation → Application → Domain ← Infrastructure  
No layer may import from a layer above it.

---

## Domain Modules

| Module | Boundary | Key responsibility |
|--------|----------|--------------------|
| `identity.module` | SaaS | Auth, credentials, sessions |
| `account.module` | SaaS | Unified Account (personal / org), teams, membership |
| `namespace.module` | SaaS | Path-resolution for accounts |
| `workspace.module` | Workspace | Workspace, WBS, Issue, CR, QA, Acceptance, Baseline |
| `file.module` | Workspace | Files, document parsing, intelligence pipeline |
| `work.module` | Workspace | Work items, milestones, dependencies |
| `fork.module` | Workspace | Fork network (planning branches) |
| `workforce.module` | Bridge | SaaS ↔ Workspace workforce scheduling |
| `settlement.module` | SaaS | AR / AP / Settlement |
| `notification.module` | SaaS | Notification engine, inbox, push |
| `social.module` | SaaS | Social graph, feed, discovery |
| `achievement.module` | SaaS | Achievement rules, badge unlocking |
| `collaboration.module` | Workspace | Comments, reactions, presence, co-editing |
| `search.module` | SaaS | Full-text + semantic search |
| `audit.module` | SaaS | Immutable audit trail, compliance |
| `causal-graph.module` | Cross-cutting | Causal nodes, impact scope analysis |

---

## Design System Tiers

```
src/design-system/
├── primitives/   ← shadcn/ui raw components (Button, Input, Avatar, …)
├── components/   ← Project-specific wrappers
├── patterns/     ← Higher-order composites (forms, tables, command palettes)
├── tokens/       ← Design-token constants (mirrors globals.css)
└── layout/       ← Page-level layouts (RootShell, HomeLayout, MarketingHeader)
```

---

## Authentication Flow

```
Homepage (/)
  ├─ Not logged in  → "Login" button (top-right)  → /login?callbackUrl=/
  └─ Logged in      → User avatar (top-right)
                         ├─ "Enter Platform"       → /onboarding
                         └─ "Sign Out"             → clientSignOut() → /
```

`useAuthState()` (in `src/shared/directives`) provides a lightweight Firebase `onAuthStateChanged` listener for marketing pages outside the main `<AccountProvider>` tree.

---

## Infrastructure

| Surface | Location | SDK | Runtime |
|---------|----------|-----|---------|
| Firebase Client | `src/infrastructure/firebase/client/` | Web SDK | Browser |
| Firebase Admin | `src/infrastructure/firebase/admin/` | Admin SDK | Server (Actions / Route Handlers) |
| Upstash | `src/infrastructure/upstash/` | Redis · QStash · Vector · Workflow | Server-only |
| Document AI | `src/infrastructure/document-ai/` | Genkit + Gemini | Server-only |

---

## Key Conventions

- **Module public API:** every module exposes only `src/modules/<m>/index.ts`; no cross-module internal imports.
- **Server vs Client:** Server Components are default; add `'use client'` only when browser APIs / interactivity are needed.
- **i18n:** all UI text lives in `src/shared/i18n/index.ts` (zh-TW + en); never hardcode display strings.
- **No secrets in source:** use environment variables (`process.env.*`).
- **Batch writes:** use `commitBatch()` (auto-chunks at 490 ops) for Firestore writes.
- **Cache-aside reads:** use `cacheAside()` (default TTL 5 min) to reduce Firestore read costs.

---

## Further Reading

| Document | Description |
|----------|-------------|
| [`docs/architecture/README.md`](./docs/architecture/README.md) | Full architecture SSOT |
| [`docs/architecture/adr/README.md`](./docs/architecture/adr/README.md) | Architecture Decision Records |
| [`docs/architecture/catalog/`](./docs/architecture/catalog/) | Business entities, events, service boundary |
| [`docs/architecture/glossary/glossary.md`](./docs/architecture/glossary/glossary.md) | Shared terminology |
| [`docs/architecture/diagrams/`](./docs/architecture/diagrams/) | Mermaid architecture diagrams |
| [`src/shared/README.md`](./src/shared/README.md) | Shared layer documentation |
| [`src/infrastructure/firebase/README.md`](./src/infrastructure/firebase/README.md) | Firebase integration guide |
