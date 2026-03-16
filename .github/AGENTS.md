# Xuanwu Platform --- AI Development Rules

This repository follows **Model-Driven Domain Discovery (MDDD)**
combined with\
**Domain-Driven Design (DDD)** and **Hexagonal Architecture (Ports &
Adapters)**.

The **Domain Model is the centre of the system**.\
Frameworks, databases, and UI are replaceable details.

Authoritative architecture reference: docs/architecture.md

If any documentation conflicts, **follow this file first**.

------------------------------------------------------------------------

# 1 Architecture Overview

Xuanwu uses a **4-layer Hexagonal Architecture**.

Presentation → Application → Domain\
Infrastructure interacts via Ports

## Layers

### Presentation

Location

src/app/\
src/modules/\*/\_components/

Responsibilities

-   UI rendering
-   React components
-   user interaction

Must NOT contain

-   business logic
-   database queries
-   domain rules

------------------------------------------------------------------------

### Application

Location

src/modules/\*/core/

Responsibilities

-   Use Cases
-   Server Actions
-   orchestration

Typical flow

load aggregate\
→ call domain logic\
→ persist via repository\
→ emit events

Must NOT contain

-   business invariants
-   direct database queries

------------------------------------------------------------------------

### Domain

Location

src/modules/*/domain.*

Responsibilities

-   Entities
-   Aggregates
-   Value Objects
-   Domain Services
-   Domain Events

Rules

-   Domain must be **framework independent**
-   Domain must NOT import
    -   React
    -   Firebase
    -   Redis
    -   Next.js

All **business invariants live here**.

------------------------------------------------------------------------

### Infrastructure

Location

src/modules/*/infra.*\
src/infrastructure/

Responsibilities

-   Repository implementations
-   cache
-   event publishing
-   database access

Infrastructure implements **Ports defined in Domain**.

------------------------------------------------------------------------

# 2 Dependency Rules

Allowed dependency direction

Presentation\
↓\
Application\
↓\
Domain

Infrastructure → Domain (via ports)

Forbidden

Domain → Infrastructure\
Domain → React\
Domain → Next.js\
Application → database\
UI → database

------------------------------------------------------------------------

# 3 Bounded Context Rules

Each module is a **Bounded Context**.

src/modules/{context}.module/

Rules

-   Do NOT import internal files from another module
-   Only import from its `index.ts`
-   Cross-context communication uses
    -   DTO
    -   Domain Events

------------------------------------------------------------------------

# 4 Aggregate Rules

-   Each Aggregate has **one Aggregate Root**
-   External references use **ID only**
-   Repositories operate only on Aggregate Roots

Example

Task { workspaceId: string }

Never

Task { workspace: Workspace }

------------------------------------------------------------------------

# 5 Ports & Adapters

Outbound ports are defined in domain

Example

interface TaskRepository { save(task: Task): Promise`<void>`{=html} }

Infrastructure implements the interface (e.g. FirestoreTaskRepository).

Adapters must contain **no business logic**.

------------------------------------------------------------------------

# 6 Naming Conventions

Domain events

{domain}.{entity}.{verb}

Example

wbs.task.created\
workspace.member.invited\
task.state.changed

Identifiers must follow **Ubiquitous Language** defined in the glossary.

------------------------------------------------------------------------

# 7 Anti-Patterns (Never Do)

Do NOT introduce

-   MVC controllers with business logic
-   database queries inside React components
-   business rules inside Server Actions
-   cross-module deep imports
-   mutable Value Objects

------------------------------------------------------------------------

# 8 Preferred Technology Stack

Framework

-   Next.js (App Router)

Language

-   TypeScript

Infrastructure

-   Firebase / Firestore
-   Upstash Redis
-   QStash
-   Vector search

These must be used through **Ports & Adapters**.

------------------------------------------------------------------------

# 9 When Adding New Features

Follow this order

1 Define or extend **Domain Model**\
(entity, value object, aggregate)

2 Define **ports**\
(repository, event bus)

3 Implement **use case**\
(core/\_use-cases.ts)

4 Implement **infrastructure adapter**\
(infra.firestore/)

5 Add **UI**\
(\_components/)

Domain model must exist **before UI or database code**.

------------------------------------------------------------------------

# 10 Architecture Priority

When making design decisions follow this order

Domain Model\
↓\
Use Case\
↓\
Ports\
↓\
Infrastructure\
↓\
UI

Never reverse this order.
