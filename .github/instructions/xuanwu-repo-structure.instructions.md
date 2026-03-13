---
name: Xuanwu Repository Structure
description: Standard repository structure and module organization
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Repository Structure Rules

Follow a clear and modular project structure.

## Top-level folders

Use the following structure when possible:

- src/ — application source code
- src/modules/ — Domain Modules (Bounded Contexts, Modular DDD — lives inside `src/`)
- src/shared/ — shared utilities and infrastructure helpers
- docs/ — documentation
- scripts/ — build or automation scripts

## Module organization

Each Domain Module should contain:

- index file (public exports)
- implementation files
- test files
- documentation if complex

Example

src/modules/<name>.module/
  index.ts
  domain.<aggregate>/_entity.ts
  core/_use-cases.ts
  infra.<adapter>/_repository.ts
  _components/<ComponentName>.tsx

## Rules

- Avoid deeply nested directories.
- Group code by feature rather than by technical layer when possible.
- Keep modules small and cohesive.