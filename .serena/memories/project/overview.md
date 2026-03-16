# Xuanwu Platform — Project Overview

## Purpose
Xuanwu Platform is a multi-tenant SaaS project management tool built on Next.js App Router, Firebase, and a strict Modular DDD architecture. It supports:
- Organization / workspace / project hierarchy (multi-tenant)
- Work-breakdown structure (WBS) editor
- Drag-and-drop scheduling (Pragmatic DnD + Visual Indicators)
- Firebase-backed real-time data (Firestore + Realtime Database)
- GitHub Copilot AI agents with full MCP server integration

## Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5.x
- **Backend**: Firebase (Firestore, Realtime Database, App Check, Analytics)
- **UI**: shadcn/ui (primitives), Tailwind CSS v4
- **DnD**: @atlaskit/pragmatic-drag-and-drop + VIs
- **i18n**: In-code dictionary at `src/shared/i18n/index.ts` (en + zh-TW)
- **AI/Agents**: GitHub Copilot with 12 MCP servers (serena, firebase, agent-memory, repomix, playwright, etc.)

## Key Architecture Decisions
- **Modular DDD + Hexagonal Architecture**: See `docs/architecture/model-driven-hexagonal-architecture.md`. Domain Modules live in `src/modules/<name>.module/`; each is a Bounded Context with 4 layers (Domain → Application → Infrastructure → Presentation).
- **Design System**: 5-tier — `primitives/` (shadcn), `components/` (wrappers), `patterns/` (composites), `tokens/` (design constants), `layout/` (structural shells); plus `providers/` for React context providers.
- **Firebase infra**: `src/infrastructure/firebase/client/` (Web SDK) + `src/infrastructure/firebase/admin/` (Admin SDK)
- **No shared-kernel / shared-infra**: Deleted in PR #6. Cross-module access only via public `index.ts` barrels.
