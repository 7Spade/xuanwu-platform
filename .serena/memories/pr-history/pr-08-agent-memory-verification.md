# PR #8 — feat: add redis/agent-memory-server MCP (compatibility verification)

**Status**: Closed but NOT merged (superseded by PR #7)
**Branch**: (not merged to main — content ported into PR #7)

## Summary
Verified `redis/agent-memory-server` as an MCP server 100% compatible with GitHub Copilot Coding Agent, then configured it. This PR's content was ported into PR #7 which was merged instead.

## Compatibility Evidence
| Condition | Source |
|-----------|--------|
| Coding Agent accepts `type: "stdio"` / `type: "local"` | GitHub Copilot Coding Agent MCP docs |
| `agent-memory-server` exposes stdio MCP mode | `uvx --from agent-memory-server agent-memory mcp` |
| `uvx` available on runner | `copilot-setup-steps.yml` installs `uv` via `astral-sh/setup-uv@v5` |
| Secrets via `COPILOT_MCP_*` env vars | Standard Coding Agent secret mechanism |

## Key Verification
Before any config was written, the following was confirmed:
1. `redis/agent-memory-server` README confirms stdio mode: `uvx --from agent-memory-server agent-memory mcp`
2. GitHub Copilot Coding Agent MCP docs confirm it accepts local stdio processes
3. `copilot-setup-steps.yml` already installs `uv` via `astral-sh/setup-uv@v5`
4. `DISABLE_AUTH=true` is safe in stdio mode — no network port is exposed

## Notes
- PR #8 was NOT merged directly — its content was ported into PR #7 which went through the normal merge process
- The agent-memory-server package name: `agent-memory-server` (from agent-memory-server PyPI/package)
- Redis Cloud TLS URL format: `rediss://default:PASSWORD@host:port`
