# Xuanwu Platform — Architecture Reference

> **Design philosophy**: See `docs/architecture/notes/model-driven-hexagonal-architecture.md` — MDDD + Hexagonal Architecture (Ports & Adapters) guide.
> **Domain SSOT**: `docs/architecture/notes/model-driven-hexagonal-architecture.md` (canonical design reference; `docs/architecture/README.md` is the documentation overview index)

## Domain Modules (`src/modules/`)
Each module = one Bounded Context, named `<name>.module/`:
```
src/modules/<name>.module/
├── README.md            ← Bounded context description, aggregates, cross-module deps
├── index.ts             ← ONLY public API surface (barrel exports)
├── domain.<aggregate>/  ← Domain Layer (pure, no I/O; _entity, _value-objects, _ports, _events, _service)
├── core/                ← Application Layer (_use-cases, _actions ['use server'], _queries)
├── infra.<adapter>/     ← Infrastructure Layer (_repository, _mapper)
└── _components/         ← Presentation Layer (React Server / Client components)
```

**Current modules (22 total = 17 implemented + 5 scaffold):**

| Module | Layer | Bounded Context |
|--------|-------|-----------------|
| `identity.module/` | SaaS (cross-cutting) | Auth · Sessions · Credentials · Identity Providers |
| `account.module/` | SaaS | Unified Account (personal\|org) · Profile · Team · Membership |
| `namespace.module/` | SaaS | Namespace path-resolution for account handles |
| `workspace.module/` | Workspace | Workspace, WBS, Issue, CR, QA, Acceptance, Baseline |
| `file.module/` | Workspace | Files, document parsing, intelligence pipeline |
| `work.module/` | Workspace | Work items, milestones, dependencies |
| `fork.module/` | Workspace | Fork network (planning branches + merge-back) |
| `workforce.module/` | Bridge | Workforce scheduling (SaaS ↔ Workspace) |
| `settlement.module/` | SaaS | AR, AP, settlement records |
| `notification.module/` | SaaS (cross-cutting) | Notification engine, inbox, push |
| `social.module/` | SaaS | Social graph, feed, discovery |
| `achievement.module/` | SaaS | Achievement rules, badge unlocking |
| `collaboration.module/` | Workspace (cross-cutting) | Comments, reactions, presence, co-editing |
| `search.module/` | SaaS (cross-cutting) | Full-text + semantic search |
| `audit.module/` | SaaS (cross-cutting) | Audit trail, compliance |
| `causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal nodes, edges, impact scope |
| `governance.module/` | SaaS | Governance rules and policy enforcement *(scaffold)* |
| `knowledge.module/` | Workspace | Knowledge base and document library *(scaffold)* |
| `subscription.module/` | SaaS | Subscription plans and billing cycles *(scaffold)* |
| `taxonomy.module/` | SaaS (cross-cutting) | Tag taxonomy and label hierarchy *(scaffold)* |
| `vector-ingestion.module/` | SaaS (cross-cutting) | Vector embedding ingestion pipeline *(scaffold)* |

**Removed/absorbed modules (historical):**
- `org.module/` → absorbed into `account.module`
- `profile.module/` → absorbed into `account.module`
- `feature.module/` → removed as standalone bounded context

## DDD Layer Rules
- **Domain**: pure, no I/O, no framework imports
- **Application**: orchestrates domain via port interfaces; no direct DB/UI
- **Infrastructure**: implements Domain port interfaces; no business rules
- **Presentation**: React components; calls Application only; no direct DB access

## Design System (`src/design-system/`)

**Five-tier hierarchy** (primitives → components → patterns → tokens → layout) + providers:

```
design-system/
├── primitives/   ← shadcn/ui components (57 total — see full list below)
│   ├── ui/       ← 56 component files (accordion → tooltip)
│   ├── hooks/    ← use-mobile.ts
│   └── lib/      ← utils.ts (cn helper)
├── components/   ← wrappers/enhanced primitives
├── patterns/     ← composite UI patterns
├── tokens/       ← design constants (color, spacing, typography)
├── layout/       ← structural layout shells (base shell, marketing layouts)
└── providers/    ← React context providers (e.g. ThemeProvider)
```

### `primitives/ui/` — Full Component List (shadcn/ui new-york style)
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group,
calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu,
dialog, direction, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group,
input-otp, item, kbd, label, menubar, native-select, navigation-menu, pagination, popover,
progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton,
slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

Import pattern: `import { Button } from "@/design-system/primitives"`

## Firebase Infrastructure (`src/infrastructure/firebase/`)
- `client/` — Web SDK (browser)
- `admin/` — Admin SDK (server-side)

## Shared Utilities (`src/shared/`)
- `i18n/index.ts` — in-code translation dictionary (en + zh-TW)
- `interfaces/` — API contracts

## App Router Structure (`src/app/`)
- `(marketing)/` — public marketing pages
- `(auth)/` — login, register, forgot-password
- `(invite)/` — invite token pages
- `(shared)/` — shareId pages
- `(admin)/` — admin panel
- `(main)/` — authenticated app (parallel routes with @sidebar)
  - `(account)/` — profile, security, notifications, organizations
  - `[slug]/` — organization context
  - `[slug]/[workspaceId]/(workspace)/` — workspace context with WBS
  - `[slug]/[workspaceId]/(standalone)/editor/` — standalone editor
