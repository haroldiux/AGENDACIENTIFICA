# Agentic TDD Guardrails

## Red-Green-Refactor Protocol
1. **Red Phase**: Write unit/integration tests that fail for the expected reason before writing any production code. Run the test runner to prove failure.
2. **Green Phase**: Write the minimum amount of code necessary to pass the failing tests. Run the test suite to confirm all tests pass.
3. **Refactor Phase**: Clean up and optimize code structure without altering behavior. Verify tests remain 100% green.

## Rules
- Never write implementation code prior to test creation.
- Never alter assertions to force a failing test to pass.
- Maintain isolated, fast-executing unit tests.
