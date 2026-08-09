# Gentle AI Harness Guidelines

## Core Principles
1. **No Vibe Coding**: Never generate code without a clear spec, architecture verification, or defined requirements.
2. **Spec-Driven Development (SDD)**: Always execute phases in sequence: `Explore` -> `Propose` -> `Spec` -> `Design` -> `Implement` -> `Verify`.
3. **Agentic TDD**: Write failing unit/integration tests before writing implementation code. Verify Red state before moving to Green.
4. **Persistent Memory Integration**: Query Engram for session memory before starting tasks and save architectural decisions to Engram upon task completion.
5. **CodeGraph Navigation**: Prefer querying CodeGraph AST index for symbol lookups and dependency graph analysis instead of loading full source files.

## Behavior Constraints
- Do not refactor code outside the scope of the target task.
- Do not swallow errors or substitute dummy fallback values.
- Verify every implementation step with automated tests or runtime verification scripts.
