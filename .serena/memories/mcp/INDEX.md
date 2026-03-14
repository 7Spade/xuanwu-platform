# MCP Servers — Index

## Overview

Xuanwu Platform configures **13 MCP servers** in `.vscode/mcp.json` (VS Code) and `.github/copilot/mcp-coding-agent.json` (Coding Agent).  
Each server provides tools that agents reference via `<server-name>/*`.

## Server Inventory

| Server key | Memory file | Category | Primary use |
|------------|-------------|----------|-------------|
| `serena` | [serena.md](serena.md) | Code Intelligence | Symbol search, code edit, project memory |
| `firebase-mcp-server` | [firebase-mcp-server.md](firebase-mcp-server.md) | Infrastructure | Firestore, Auth, Security Rules, Hosting |
| `agent-memory` | [agent-memory.md](agent-memory.md) | Memory / Knowledge | Redis-backed cross-session semantic recall |
| `context7` | [context7.md](context7.md) | Documentation | Version-accurate framework docs lookup |
| `repomix` | [repomix.md](repomix.md) | Codebase Analysis | Pack repo/remote repo into AI-readable format |
| `playwright` | [playwright.md](playwright.md) | Browser Automation | E2E testing, UI automation, screenshots |
| `next-devtools` | [next-devtools.md](next-devtools.md) | Next.js Diagnostics | Dev-server runtime, error, route inspection |
| `shadcn` | [shadcn.md](shadcn.md) | UI Components | shadcn/ui registry lookup and install |
| `filesystem` | [filesystem.md](filesystem.md) | File I/O | Local file read/write in allowed directories |
| `markitdown` | [markitdown.md](markitdown.md) | Document Conversion | URL/file → Markdown conversion |
| `sequential-thinking` | [sequential-thinking.md](sequential-thinking.md) | Reasoning | Step-by-step structured problem solving |
| `software-planning` | [software-planning.md](software-planning.md) | Planning | Implementation plans and todo tracking |
| `everything` | [everything.md](everything.md) | Testing / Utilities | MCP protocol testing and general utilities |

## Tool Selection Priority (this project)

```
Serena (code intelligence) > firebase-mcp-server (Firebase inspection)
> agent-memory (cross-session recall) > context7 (docs)
> repomix (full snapshot) > playwright (browser)
> next-devtools (Next.js runtime) > shadcn (UI)
> filesystem (files) > markitdown (convert)
> sequential-thinking (reasoning) > software-planning (planning)
> everything (testing)
```

## Agent ↔ MCP Assignment Guide

| Agent | Assigned MCPs |
|-------|--------------|
| `xuanwu-research` | `serena/*`, `context7/*`, `repomix/*`, `agent-memory/*`, `filesystem/*`, `markitdown/*` |
| `xuanwu-orchestrator` | `serena/*`, `agent-memory/*`, `sequential-thinking/*`, `software-planning/*` |
| `xuanwu-architect` | `serena/*`, `context7/*`, `repomix/*`, `sequential-thinking/*` |
| `xuanwu-implementer` | `serena/*`, `context7/*`, `filesystem/*`, `shadcn/*` |
| `xuanwu-ui` | `serena/*`, `shadcn/*`, `playwright/*`, `next-devtools/*` |
| `xuanwu-test-expert` | `playwright/*`, `next-devtools/*`, `serena/*` |
| `xuanwu-ops` | `firebase-mcp-server/*`, `serena/*`, `filesystem/*` |
| `xuanwu-docs` | `serena/*`, `repomix/*`, `markitdown/*`, `filesystem/*` |
| `xuanwu-quality` | `serena/*`, `context7/*`, `sequential-thinking/*` |

## Infrastructure Notes

- Servers using `uvx`: `serena`, `markitdown`, `agent-memory` — require `uv` installed via `astral-sh/setup-uv@v5` in `copilot-setup-steps.yml`
- Servers using `npx`: all others — Node.js required
- Firebase secrets: `COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH` env secret
- agent-memory secrets: `COPILOT_MCP_REDIS_URL` + `COPILOT_MCP_OPENAI_API_KEY` env secrets
