# SDD (Spec-Driven Development) Policies

## SDD Phase Workflow Rules
- **Phase 1: Explore (`/sdd-explore`)**: Analyze codebase, locate dependencies, identify risks, and gather contextual details. Do not edit source code.
- **Phase 2: Propose (`/sdd-propose`)**: Formulate architectural options, weigh trade-offs, and recommend the optimal solution.
- **Phase 3: Spec (`/sdd-spec`)**: Write exact functional, security, and technical requirements.
- **Phase 4: Design (`/sdd-design`)**: Define data schemas, API contracts, interfaces, and function signatures.
- **Phase 5: Implement (`/sdd-implement`)**: Write code strictly guided by the spec and test suite.
- **Phase 6: Verify (`/sdd-verify`)**: Run automated tests, check linting, build pipelines, and validate against original requirements.

## Approval Protocol
- Pause for user review between `Design` and `Implement` phases for any breaking changes or major architectural decisions.
