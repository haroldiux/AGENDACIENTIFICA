# Project Configuration: Gentle AI Harness for AGENDACIENTIFICA

## Ecosystem Overview
This project is configured with the **Gentle AI Agentic Engineering Harness**:
- **SDD Workflow**: Spec-Driven Development (`Explore` -> `Propose` -> `Spec` -> `Design` -> `Implement` -> `Verify`).
- **TDD Guardrails**: Test-Driven Development (Red-Green-Refactor loop enforced where the stack supports it).
- **Persistent Memory**: Engram MCP Server integration.
- **Code Graph Engine**: CodeGraph AST index for symbol lookups and dependency resolution.
- **Codebase Search**: Semantic and structural code search via Codebase MCP.

## Workspace Rules & Skills
- Rules are located in `.agents/rules/`
- Skills are located in `.agents/skills/`
- MCP Configuration is defined in `.agents/mcp_config.json`

## Global Agent Configuration
- **Gemini CLI / Antigravity**: `~/.gemini/settings.json` and `~/.gemini/GEMINI.md` provide the full Gentle AI orchestrator, SDD skills, and MCP wiring.
- **Kimi Code / OpenCode / VS Code Copilot**: use the workspace `.agents/mcp_config.json` and the skill registry in `.atl/skill-registry.md`.

## Activating the Local Environment
The Go binaries (`gentle-ai`, `engram`, `codebase-memory-mcp`) live in `C:\Users\harol\go\bin\` and are not required to be on the global `PATH`. To use them from a shell session in this project:

- **Git Bash / WSL**: `source .agents/activate`
- **Windows CMD**: `.agents\activate.cmd`

## MCP Servers
The following MCP servers are wired for this project:

| Server | Purpose | Status |
|--------|---------|--------|
| `codebase` | Semantic code search and indexing | operational |
| `codegraph` | AST-based code graph and dependency analysis | operational |
| `engram` | Persistent memory across sessions | operational |
| `openpencil` | OpenPencil integration | requires running OpenPencil instance |
| `context7` | Context7 library docs | requires `CONTEXT7_API_KEY` |

## Guidelines
1. Always check `.agents/skills/` and `.gemini/skills/` for available workflows.
2. Follow the SDD/TDD protocol defined in the loaded skill for the current task.
3. Query Engram for project context before starting substantial work.
4. Prefer CodeGraph for structural/codebase navigation questions.
5. Keep requirements aligned with SDD specifications under `openspec/`.

## Multi-Agent Coexistence
This workspace is shared with another agent ("antigravity"). To avoid interference:
- Do not modify files under `~/.gemini/antigravity/`, `~/.gemini/antigravity-backup/`, or `~/.gemini/antigravity-ide/`.
- Prefer workspace-scoped changes (`.agents/`, `openspec/`) over global config changes.
- When global changes are required, make additive updates only and keep backups in `.gentle-ai-backup/`.
