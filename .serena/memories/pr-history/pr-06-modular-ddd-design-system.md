# PR #6 — docs + refactor: integrate Modular DDD, design-system, DnD, Firebase restructure

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Major architectural refactor: introduced Modular DDD, design-system 4-tier hierarchy, @atlaskit/pragmatic-drag-and-drop, restructured Firebase infrastructure, and **deleted** both `src/shared-kernel/` and `src/shared-infra/`.

## Key Changes

### Deleted directories
- `src/shared-kernel/` — ports, shared domain contracts → moved into each module's domain layer
- `src/shared-infra/` — shared infrastructure → moved into `src/infrastructure/firebase/`

### New Firebase infrastructure structure
```
src/infrastructure/firebase/
├── client/    ← Web SDK (browser)
└── functions/ ← Admin SDK (server-side / Cloud Functions)
```

### Modular DDD adoption
- Each `src/features/<name>/` is fully self-contained Bounded Context
- Slices communicate ONLY through their public `index.ts` barrel
- Documented in architecture README + ADR-006
- **Note**: At this point still using `src/features/` (renamed to `src/modules/` in PR #10)

### Design System 4-tier hierarchy
```
design-system/
├── primitives/   ← shadcn/ui
├── components/   ← wrappers
├── patterns/     ← composites
└── presentation/ ← DnD + Visual Indicators (later renamed to tokens/ in PR #10)
```

### DnD + Visual Indicators (VIs)
- Adopted `@atlaskit/pragmatic-drag-and-drop` as DnD library
- VIs = drop indicator elements from `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator`
- Both are Presentation-layer only components
- ADR-007 added for this decision

### New documentation added
- Architecture README updated with all 4 concepts
- `src/design-system/presentation/README.md` — Vis+PDnD implementation guide

## Lessons learned
- Shared-kernel/shared-infra anti-pattern was removed early — correct call
- `src/infrastructure/` naming makes Firebase a project-level (not module-level) concern
