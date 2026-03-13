# Architecture — Single Source of Truth

> This document is the business logic and domain architecture SSOT (Single Source of Truth) for the **xuanwu-platform** project.
> GitHub Copilot agents read this file to understand domain boundaries, layer responsibilities, and business rules before making changes.

## Project Overview

**xuanwu-platform** is a Next.js 15 platform built with Domain-Driven Design (DDD) and parallel routing.

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Validation**: Zod

---

## DDD Layer Architecture

This project follows a strict 4-layer DDD architecture within each domain slice.

### Layer Responsibilities

| Layer | Location | Responsibility | Allowed dependencies |
|-------|----------|----------------|----------------------|
| **Domain** | `src/<domain>/domain/` | Entities, value objects, aggregates, domain events, repository interfaces | None (pure business logic) |
| **Application** | `src/<domain>/application/` | Use cases, application services, DTOs, command/query objects | Domain layer only |
| **Infrastructure** | `src/<domain>/infrastructure/` | Repository implementations, external API adapters, persistence | Domain + Application interfaces |
| **UI / Presentation** | `src/<domain>/ui/` and `src/app/` | React components, Next.js pages and route handlers | Application layer (via DTOs) |

### Layer Direction Rules

```
UI → Application → Domain
Infrastructure → Domain interfaces (implements)
```

- UI components must NOT import directly from Domain or Infrastructure.
- Domain layer must NOT depend on any other layer.
- Infrastructure implements Domain interfaces (dependency inversion).

---

## Domain Slices

> **Add your domain slices here as the project grows.**

| Slice | Location | Description |
|-------|----------|-------------|
| Shared Kernel | `src/shared/` | Cross-cutting types, UI components, utilities |

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

## Business Rules

> **Add domain-specific business rules here as they are discovered.**

---

## Glossary

> **Add domain terminology in Traditional Chinese (台灣) and English here.**

| Term (Chinese) | Term (English) | Definition |
|----------------|----------------|------------|
| | | |

---

## Architecture Decision Records (ADR)

> **Add ADRs here as architecture decisions are made.**

| ID | Decision | Status | Date |
|----|----------|--------|------|
| ADR-001 | Adopt DDD 4-layer architecture | Accepted | — |
| ADR-002 | Use Next.js App Router with parallel routing | Accepted | — |
| ADR-003 | Use Tailwind CSS v4 with shadcn/ui | Accepted | — |
