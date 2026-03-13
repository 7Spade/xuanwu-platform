# PR #2 — feat: Sync MCP config for Coding Agent + VS Code, add .vscode/mcp.json, wire firebase tools

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Fixed MCP schema validation failures for the GitHub Coding Agent and created the VS Code `.vscode/mcp.json` config. Promoted serena and firebase-mcp-server from optional to required.

## Key Changes

### Schema fix (Coding Agent)
- Added `"type": "local"` and `"tools": ["*"]` to ALL Coding Agent entries — required by GitHub MCP schema
- Without `type`, the Coding Agent rejected the config with `missing required property 'type'`

### New file: `.vscode/mcp.json`
VS Code Copilot Chat uses a DIFFERENT schema:
| Field | Coding Agent | VS Code |
|-------|--------------|---------|
| Root key | `mcpServers` | `servers` |
| Type value | `"local"` | `"stdio"` |
| `tools` field | required | absent |
| filesystem path | `"."` | `"${workspaceFolder}"` |

### Agent tool wiring
- `ddd-infrastructure.agent.md` — added firebase-mcp-server to its tools list
- `xuanwu-architect.agent.md` — added firebase-mcp-server for Firestore inspection

### Servers configured (12 total)
agent-memory, filesystem, repomix, context7, sequential-thinking, software-planning, playwright, next-devtools, shadcn, markitdown, everything, serena, firebase-mcp-server

## Lessons learned
- VS Code and Coding Agent have different MCP JSON schemas — must maintain two files
- Serena and firebase-mcp-server are critical (not optional) for this project
- `COPILOT_MCP_*` prefix required for Coding Agent secrets
