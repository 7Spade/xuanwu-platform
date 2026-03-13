# PR #7 — feat: add agent-memory MCP + port PR #8 into fix-mcp-server-start-errors branch

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Added redis/agent-memory-server MCP to both VS Code and Coding Agent configs. Also ported PR #8 content into this branch and fixed stale MCP invocations in mcp.md.

## Key Changes

### VS Code `.vscode/mcp.json`
- Added top-level `inputs` block for secure password prompts:
  - `redis-url` (Redis TLS connection string)
  - `openai-api-key` (OpenAI API key)
- Added `agent-memory` server: `uvx --from agent-memory-server agent-memory mcp`

### Coding Agent `.github/copilot/mcp-coding-agent.json`
- Added `agent-memory` entry with:
  - `REDIS_URL: "$COPILOT_MCP_REDIS_URL"` — Copilot environment secret
  - `OPENAI_API_KEY: "$COPILOT_MCP_OPENAI_API_KEY"` — Copilot environment secret
  - `DISABLE_AUTH: "true"` — safe for stdio-only deployment (no network port)

### `mcp.md` documentation
- Added agent-memory to paste-in JSON
- Added compatibility verification section (✅ 100% compatible with Coding Agent stdio mode)
- Documents `DISABLE_AUTH: "true"` safety rationale
- Added required secrets table
- Updated 用途速查 (usage lookup) table

### `copilot-instructions.md`
- Added `agent-memory` to the uvx dependency table
- Added Available MCP Tools table

### Fixed stale invocations in `mcp.md`
- Two stale MCP invocations that were missed in the original PR #7 pass

## Lessons learned
- VS Code uses `inputs` with `promptString` type for secure values (no env var needed)
- Coding Agent uses `$COPILOT_MCP_*` environment secrets
- `DISABLE_AUTH=true` is safe ONLY in stdio mode (no network port is exposed)
