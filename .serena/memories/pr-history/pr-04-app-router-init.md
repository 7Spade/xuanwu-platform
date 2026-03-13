# PR #4 — [WIP] Initialize App Router directory structure for multi-tenant SaaS

**Status**: Closed but NOT merged (draft/WIP)
**Branch**: (not merged to main)

## Summary
WIP PR that planned the initial Next.js App Router directory structure for the multi-tenant SaaS application. This was a checklist-based scaffolding plan.

## Planned Structure
```
src/app/
├── (marketing)/         — public marketing pages
├── (auth)/
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (invite)/
│   └── invite/[token]/
├── (shared)/
│   └── share/[shareId]/
├── (admin)/
├── (main)/
│   ├── layout.tsx       — AccountProvider stub
│   ├── onboarding/
│   ├── (account)/       — profile, security, notifications, organizations
│   ├── [slug]/
│   │   ├── layout.tsx   — SlugProvider stub
│   │   ├── settings/
│   │   └── workspaces/
│   └── [slug]/[workspaceId]/
│       ├── layout.tsx   — WorkspaceProvider stub
│       ├── (workspace)/
│       │   └── wbs/     — Work Breakdown Structure
│       └── (standalone)/
│           └── editor/
```

## Notes
- PR was not merged — may have been superseded by direct commits or another PR
- The structure it described is the current canonical App Router layout
- `AccountProvider`, `SlugProvider`, `WorkspaceProvider` are context providers in the layout hierarchy
