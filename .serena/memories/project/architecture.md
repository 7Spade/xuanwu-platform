# Xuanwu Platform — Architecture Reference

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

**Active modules (16 total — feature.module removed per PR #12 decision):**

| Module | Layer | Bounded Context |
|--------|-------|-----------------|
| `identity.module/` | SaaS (cross-cutting) | Auth · Sessions · Credentials · Identity Providers (replaces raw Firebase Auth) |
| `account.module/` | SaaS | Unified Account (personal\|org) · Profile · Team · Membership |
| `namespace.module/` | SaaS | Namespace path-resolution for account handles |
| `workspace.module/` | Workspace | WBS · Issue · CR · QA · Acceptance · Baseline |
| `file.module/` | Workspace | Files · DocParse · ObjExtract · Intelligence |
| `work.module/` | Workspace | Work Items · Milestones · Dependencies |
| `fork.module/` | Workspace | Fork Network (planning branches + merge-back) |
| `workforce.module/` | Bridge | Workforce Scheduling (SaaS ↔ Workspace) |
| `settlement.module/` | SaaS | Settlement · AR · AP |
| `notification.module/` | SaaS (cross-cutting) | Notification Engine · Inbox · Push |
| `social.module/` | SaaS | Social Graph · Feed · Discovery |
| `achievement.module/` | SaaS | Achievement Rules · Badge Unlocking → account.module |
| `collaboration.module/` | Workspace (cross-cutting) | Comments · Reactions · Presence · Co-editing |
| `search.module/` | SaaS (cross-cutting) | Full-text + semantic search index + query |
| `audit.module/` | SaaS (cross-cutting) | Audit trail (immutable) · Sec policy automation |
| `causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal nodes · Cause-effect edges · Impact scope analysis |

**Removed modules:**
- `org.module/` — removed; Team/Membership absorbed into `account.module` (AccountType: organization)
- `profile.module/` — removed; public profile is a sub-aggregate of `account.module`
- `feature.module/` — removed (PR #12); too vague to locate clearly; runtime feature flag infrastructure can live in `src/infrastructure/` or be handled via Firebase Remote Config if needed

## DDD Layer Rules
- **Domain**: pure, no I/O, no framework imports
- **Application**: orchestrates domain via port interfaces; no direct DB/UI
- **Infrastructure**: implements Domain port interfaces; no business rules
- **Presentation**: React components; calls Application only; no direct DB access

## Design System (`src/design-system/`)
```
design-system/
├── primitives/   ← shadcn/ui components (57 total — see full list below)
│   ├── ui/       ← 56 component files (accordion → tooltip)
│   ├── hooks/    ← use-mobile.ts
│   └── lib/      ← utils.ts (cn helper)
├── components/   ← wrappers/enhanced primitives
├── patterns/     ← composite UI patterns
└── tokens/       ← design constants (color, spacing, typography)
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
