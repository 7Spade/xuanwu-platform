# xuanwu-platform

> Tags: `quickstart` `overview` `mcp` `agents` `architecture` `design-system`

A Next.js 15 platform with **parallel routing** and **Modular Domain-Driven Design (Modular DDD)** architecture, fully configured for GitHub Copilot Coding Agent browser-environment development.

---

## 🧭 Quick Start

```bash
npm install
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type check |

---

## 🤖 GitHub Copilot Coding Agent — MCP Configuration

Configure the following MCP servers at **[Settings → Copilot → Coding Agent](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent)** to unlock the full GitHub Copilot Coding Agent browser development experience for this Next.js + DDD project.

> The full ready-to-paste JSON is in [`docs/copilot/mcp.md`](./docs/copilot/mcp.md). The equivalent VS Code local config is in [`.vscode/mcp.json`](./.vscode/mcp.json).
>
> **Format note:** GitHub Coding Agent config (below and in `docs/copilot/mcp.md`) uses `"type": "stdio"` with a required `"tools"` field. VS Code `.vscode/mcp.json` uses the `"servers"` root key with `"type": "stdio"` and no `"tools"` field. Both formats resolve to the same MCP servers.

### ✅ Essential MCP Servers

| Priority | Server Name | npm / install | Why it matters for this project |
|----------|-------------|---------------|----------------------------------|
| ⭐⭐⭐ | **Agent Memory** | `uvx --from agent-memory-server agent-memory mcp` | Persistent cross-session memory (Redis-backed semantic search) — agents retain context across separate sessions |
| ⭐⭐⭐ | **Filesystem** | `npx @modelcontextprotocol/server-filesystem` | Read and write local project files — required for any code-editing agent task |
| ⭐⭐⭐ | **Repomix** | `npx repomix --mcp` | Pack the full repository into an AI-readable snapshot; enables agents to understand the entire DDD layer structure at once |
| ⭐⭐⭐ | **Context7** | `npx @upstash/context7-mcp` | Retrieve version-accurate Next.js 15, React 19, and Tailwind v4 documentation on demand |
| ⭐⭐⭐ | **Sequential Thinking** | `npx @modelcontextprotocol/server-sequential-thinking` | Multi-step structured reasoning — essential for DDD layer decomposition, domain modeling, and debugging complex route boundaries |
| ⭐⭐⭐ | **Software Planning** | `npx github:NightTrek/Software-planning-mcp` | Implementation plan and todo tracking across DDD modules and parallel route features |
| ⭐⭐⭐ | **Serena** | `uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide` | Deep TypeScript symbol navigation, cross-file rename, and persistent per-project memory across sessions |
| ⭐⭐⭐ | **Firebase** | `npx -y firebase-tools@latest mcp` | Firebase CLI-backed MCP for Firestore, Firebase Auth, and Firebase App Hosting management |

### 🔧 Recommended MCP Servers

| Priority | Server Name | npm / install | Why it matters for this project |
|----------|-------------|---------------|----------------------------------|
| ⭐⭐ | **Playwright** | `npx @playwright/mcp@latest` | Browser automation for end-to-end testing of Next.js parallel routes and intercepting routes |
| ⭐⭐ | **Next.js DevTools** | `npx next-devtools-mcp@latest` | Next.js dev-server diagnostics, route inspection, and runtime performance analysis |
| ⭐⭐ | **shadcn/ui** | `npx shadcn@latest` | Install and compose shadcn/ui components without leaving Copilot — accelerates UI layer implementation |
| ⭐⭐ | **Markitdown** | `npx markitdown-mcp` | Convert external URLs and design docs to Markdown for AI consumption during research and architecture tasks |
| ⭐ | **Everything** | `npx @modelcontextprotocol/server-everything` | General-purpose MCP protocol testing and utility tasks |

### Full Configuration (JSON — paste into GitHub Coding Agent settings)

```json
{
  "mcpServers": {
    "agent-memory":        { "type": "stdio", "command": "uvx", "args": ["--from", "agent-memory-server", "agent-memory", "mcp"], "env": { "REDIS_URL": "$COPILOT_MCP_REDIS_URL", "OPENAI_API_KEY": "$COPILOT_MCP_OPENAI_API_KEY", "DISABLE_AUTH": "true" }, "tools": ["*"] },
    "filesystem":          { "type": "stdio", "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "."], "tools": ["*"] },
    "repomix":             { "type": "stdio", "command": "npx", "args": ["-y", "repomix", "--mcp"], "tools": ["*"] },
    "context7":            { "type": "stdio", "command": "npx", "args": ["-y", "@upstash/context7-mcp"], "tools": ["*"] },
    "sequential-thinking": { "type": "stdio", "command": "npx", "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"], "tools": ["*"] },
    "software-planning":   { "type": "stdio", "command": "npx", "args": ["-y", "github:NightTrek/Software-planning-mcp"], "tools": ["*"] },
    "playwright":          { "type": "stdio", "command": "npx", "args": ["-y", "@playwright/mcp@latest"], "tools": ["*"] },
    "next-devtools":       { "type": "stdio", "command": "npx", "args": ["-y", "next-devtools-mcp@latest"], "tools": ["*"] },
    "shadcn":              { "type": "stdio", "command": "npx", "args": ["-y", "shadcn@latest", "mcp"], "tools": ["*"] },
    "markitdown":          { "type": "stdio", "command": "uvx", "args": ["markitdown-mcp"], "tools": ["*"] },
    "everything":          { "type": "stdio", "command": "npx", "args": ["-y", "@modelcontextprotocol/server-everything"], "tools": ["*"] },
    "serena":              { "type": "stdio", "command": "uvx", "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "ide", "--project", "."], "tools": ["*"] },
    "firebase-mcp-server": { "type": "stdio", "command": "npx", "args": ["-y", "firebase-tools@latest", "mcp"], "tools": ["*"] }
  }
}
```

> **Why these MCPs?** The GitHub Copilot Coding Agent browser environment operates without a local IDE. MCP servers provide the agent with tools to read/write files, fetch documentation, plan multi-step implementations, and validate changes — all remotely. For a DDD + Next.js parallel routing project, Repomix (codebase snapshot), Context7 (framework docs), Serena (TypeScript symbol intelligence), Sequential Thinking (layered reasoning), and Agent Memory (cross-session persistence) are the highest-leverage additions.
>
> **`filesystem` path note:** The Coding Agent config above uses `"."` (execution dir = repo root). The VS Code local config in `.vscode/mcp.json` uses `"${workspaceFolder}"` (VS Code variable substitution). Both resolve to the repo root — the format differs by environment.
>
> **`firebase-mcp-server` note:** This workspace invokes Firebase MCP through the Firebase CLI entrypoint `npx -y firebase-tools@latest mcp`. The MCP JSON no longer hardcodes `FIREBASE_PROJECT_ID` or `SERVICE_ACCOUNT_KEY_PATH`; Firebase project selection and authentication are expected to come from the Firebase CLI environment you run under.
>
> **`agent-memory` secrets:** Add `COPILOT_MCP_REDIS_URL` (format: `rediss://default:PASSWORD@host:port`) and `COPILOT_MCP_OPENAI_API_KEY` to **Settings → Copilot → Coding agent → Secrets** before using this entry.

---

## 🗂 GitHub Copilot Customization Layout

This repository ships a complete set of GitHub Copilot customizations under `.github/`. They were sourced from [platform-xuanwu](https://github.com/7Spade/platform-xuanwu) and adapted for this project.

```
.github/
├── copilot-instructions.md          ← Always-on project-wide rules
├── agents/                          ← Custom Copilot agents (21 agents)
├── instructions/                    ← Scoped coding instructions (13 files)
├── prompts/                         ← Reusable slash-command workflows (21 prompts)
└── skills/                          ← On-demand agent skills (20 skills)
```

### Agents (`@agent-name`)

| Agent | Role |
|-------|------|
| `@xuanwu-orchestrator` | Multi-agent task coordinator — start here for complex features |
| `@xuanwu-commander` | Intent clarification and task dispatch to specialized agents |
| `@xuanwu-architect` | Architecture design and layer boundary decisions |
| `@xuanwu-architecture-chief` | Architecture documentation refinement |
| `@xuanwu-implementer` | Feature implementation following DDD patterns |
| `@xuanwu-ui` | UI component implementation with shadcn/ui and Tailwind |
| `@xuanwu-product` | Product requirements and feature definition |
| `@xuanwu-research` | Technical research and library evaluation |
| `@xuanwu-docs` | Documentation authoring and synchronization |
| `@xuanwu-quality` | Code review and quality analysis |
| `@xuanwu-test-expert` | Test strategy, unit tests, and E2E tests |
| `@xuanwu-ops` | DevOps, CI/CD, and deployment configuration |
| `@xuanwu-sequential-thinking` | Step-by-step reasoning for complex problems |
| `@xuanwu-software-planner` | Implementation planning with todo tracking |
| `@xuanwu-repo-browser` | Read-only architecture and codebase analysis |
| `@xuanwu-diagram-designer` | Mermaid architecture diagram creation |
| `@xuanwu-architecture-refactor` | Architecture document restructuring |
| `@ddd-orchestrator` | DDD delivery coordinator — entry point for DDD tasks |
| `@ddd-domain-modeler` | Domain Layer: entities, value objects, aggregates |
| `@ddd-application-layer` | Application Layer: use cases and application services |
| `@ddd-infrastructure` | Infrastructure Layer: repository adapters and external services |

### Prompts (`/command`)

| Command | Purpose |
|---------|---------|
| `/xuanwu-orchestrator` | Start a multi-agent orchestrated task |
| `/xuanwu-architect` | Architecture consultation and decision |
| `/xuanwu-implementer` | Feature implementation plan + code |
| `/xuanwu-ui` | UI component design and implementation |
| `/xuanwu-planning` | Quick implementation plan via software planner |
| `/xuanwu-refactor` | Refactor guidance with DDD compliance check |
| `/xuanwu-code-review` | Structured code review |
| `/xuanwu-debug` | Step-by-step debugging session |
| `/xuanwu-docs` | Documentation authoring |
| `/xuanwu-research` | Technical research task |
| `/xuanwu-test-expert` | Test strategy and test generation |
| `/xuanwu-ops` | Infrastructure and deployment task |
| `/xuanwu-product` | Product feature definition |
| `/xuanwu-architecture-realign` | Align architecture docs with code reality |
| `/xuanwu-ssot-sync` | Sync docs with single source of truth |
| `/ddd-slice-scaffold` | Scaffold a new DDD module (all 4 layers) |
| `/ddd-domain-model` | Design or refine a domain model |
| `/ddd-application-service` | Create or update an application service |
| `/ddd-infrastructure-adapter` | Create a repository adapter or external service |
| `/ddd-layer-audit` | Audit layer boundaries for DDD violations |
| `/ddd-progressive-layering` | Plan incremental DDD migration for a module |

### Instructions (auto-applied by file pattern)

| File | Scope |
|------|-------|
| `xuanwu-application-architecture` | All files — DDD architectural boundaries |
| `xuanwu-code-quality` | All files — quality and review standards |
| `xuanwu-coding-style` | `**/*.{ts,tsx,js,jsx}` — TypeScript/React style |
| `xuanwu-customization-authoring` | Copilot customization files |
| `xuanwu-ddd-layers` | `src/**` — 4-layer DDD boundary enforcement |
| `xuanwu-ddd-progressive-migration` | `src/**` — incremental DDD migration workflow |
| `xuanwu-documentation` | `**/*.md` — documentation standards |
| `xuanwu-github-workflows` | `.github/workflows/**` — CI/CD rules |
| `xuanwu-repo-structure` | `src/**` — repository structure conventions |
| `xuanwu-security` | `**/*.{ts,tsx,js,jsx,json,yaml,yml}` — security rules |
| `xuanwu-task-tracking` | All files — issue and task tracking |
| `xuanwu-test-expert` | `**/*.{test,spec}.*` — test authoring rules |
| `xuanwu-typescript-platform` | `**/*.{ts,tsx}` — TypeScript platform rules |

### Skills (on-demand capabilities)

| Skill | Description |
|-------|-------------|
| `ddd-architecture` | 4-layer DDD pattern library with Next.js integration examples |
| `ddd-progressive-layering` | Step-by-step DDD migration for existing slices |
| `next-best-practices` | Next.js 15 App Router patterns (parallel routes, RSC, caching, etc.) |
| `breakdown-plan` | Planning and backlog decomposition |
| `breakdown-epic-arch` | Architecture-level epic breakdown |
| `breakdown-epic-pm` | Product requirements and tech spec authoring |
| `refactor` | Safe refactoring workflows |
| `prompt-builder` | Copilot customization authoring |
| `create-readme` | README and documentation generation |
| `create-technical-spike` | Technical spike documentation |
| `chrome-devtools` | Chrome DevTools usage for debugging |
| `agent-governance` | AI agent safety and governance review |
| `web-design-reviewer` | UI/UX design review |
| `first-ask` | Initial project onboarding questions |
| `memory-merger` | Merge and consolidate agent memory |
| `quasi-coder` | Lightweight code generation |
| `x-framework-guardian` | Framework best-practice enforcement |
| `apple-appstore-reviewer` | App Store review guidelines |
| `xuanwu-docs-index` | Repository documentation index |
| `xuanwu-test-expert` | Test strategy and generation skill |

---

## 🏗 Architecture Overview

This project follows a **Modular Domain-Driven Design (Modular DDD)** architecture with **Next.js 15 parallel routing**. Each bounded context is a self-contained **Domain Module** under `src/modules/`; modules communicate only through their public `index.ts` barrel.

### Design System

```
src/design-system/
├── primitives/    ← shadcn/ui components (Button, Input, Dialog, …)
├── components/    ← project-specific wrappers
├── patterns/      ← higher-order composites (tables, sidebars, …)
└── tokens/        ← design-token constants (colours, spacing, typography, …)
```

Import from the appropriate tier:
```ts
import { Button }        from "@/design-system/primitives";
import { SearchField }   from "@/design-system/components";
import { LoginForm }     from "@/design-system/patterns";
import { colorBrand }    from "@/design-system/tokens";
```

Drag-and-drop interactions use **`@atlaskit/pragmatic-drag-and-drop`**. Visual Indicators (VIs) — the visible drop-indicator lines and zone highlights rendered during a drag operation — come from `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` and live in each module's presentation layer.

### DDD Layer Structure

```
src/
├── app/                   # Next.js App Router (UI + route handlers only)
│   ├── @modal/            # Parallel route: modal slot
│   ├── @sidebar/          # Parallel route: sidebar slot
│   └── (features)/        # Feature-grouped route segments
├── modules/               # Domain Modules (Bounded Contexts)
│   └── <name>.module/     # e.g., org.module, workspace.module
│       ├── index.ts       # Public barrel — only export from here
│       ├── domain.<aggregate>/  # Domain layer (entities, VOs, ports, events)
│       ├── core/          # Application layer (use cases, actions, queries)
│       ├── infra.<adapter>/    # Infrastructure layer (Firestore, etc.)
│       └── _components/   # Presentation layer (React components)
├── design-system/         # Four-tier UI system (primitives/components/patterns/tokens)
├── infrastructure/        # Shared infrastructure (Firebase client + Admin SDK)
└── shared/                # Cross-cutting utilities (constants, i18n, interfaces, types, utils)
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, parallel routes) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4 |
| Design System | Four-tier (`primitives` → shadcn/ui, `components` → wrappers, `patterns` → composites, `tokens` → design tokens) |
| Drag and Drop | `@atlaskit/pragmatic-drag-and-drop` + Visual Indicators (VIs) |
| Validation | Zod |
| Backend / DB | Firebase (Firestore, Auth, Storage, App Check) |
| Testing | (to be configured) |

---

## 📖 Documentation

| 層次 / Level | 文件 / Document | 職責 / Role |
|---|---|---|
| ⭐ Architecture SSOT | [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](./docs/architecture/notes/model-driven-hexagonal-architecture.md) | MDDD 設計哲學、Hexagonal Architecture、DDD 詞彙、層次定義、Port/Adapter 目錄、開發指南 |
| ⭐ Copilot SSOT | [`docs/copilot/README.md`](./docs/copilot/README.md) | 代理架構、六步驟意圖管道、MCP 工具矩陣、Slash 指令速查 |
| 📚 核心知識 | [`docs/architecture/`](./docs/architecture/) | 業務實體、事件目錄、服務邊界、術語表、ADR |
| 🔧 問題管理 | [`docs/management/`](./docs/management/) | 架構問題追蹤、文件治理索引 |
| 🗂 文件總索引 | [`docs/README.md`](./docs/README.md) | 4 層文件階層導覽 |

---

## 📖 Key Resources

- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — Project-wide always-on Copilot rules
- [`.github/agents/`](.github/agents/) — All custom agent definitions
- [`.github/prompts/`](.github/prompts/) — All slash-command prompts
- [`.github/instructions/`](.github/instructions/) — All scoped coding instructions
- [`.github/skills/`](.github/skills/) — All on-demand agent skills
- [GitHub Copilot Coding Agent Settings](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent) — MCP server configuration
- Source configurations from: [platform-xuanwu](https://github.com/7Spade/platform-xuanwu)