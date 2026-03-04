# AGENTS.md

This repository is used to experiment with AI-assisted development (GitHub Copilot agents).

Agents MUST follow the rules below when implementing features or fixes.

---

## 1. Architecture Rules (Strict)

### Domain Layer (`packages/domain`)
- Contains ALL business logic.
- Must remain framework-agnostic.
- Must not depend on:
  - Fastify
  - React
  - Zod (unless explicitly required for shared schemas)
  - Any external runtime dependency
- Must expose a clean public API via `src/index.ts`.
- No direct imports from other packages.

### API Layer (`apps/api`)
- Thin orchestration layer.
- Validates input.
- Calls domain.
- Must NOT duplicate business logic.

### Web Layer (`apps/web`)
- UI only.
- Must not implement business rules.
- Calls API.

---

## 2. Dependency Rules

- Do NOT add dependencies to `packages/domain` without explicit justification.
- Keep new dependencies minimal.
- Avoid large libraries unless required.

---

## 3. TypeScript Rules

- TypeScript strict mode is enabled.
- Do not weaken type safety.
- Do not use `any` unless absolutely necessary (justify it).
- ESM + NodeNext are enforced.
- Local imports must use `.js` extension in ESM context.

---

## 4. Testing Requirements

All new business logic MUST include tests.

Before finishing a task, ensure:


pnpm -r build
pnpm -r test
pnpm lint
pnpm format


All must pass.

Tests must:
- Cover edge cases
- Cover boundary conditions
- Not rely on implementation details

---

## 5. PR Scope Discipline

Each PR must:
- Solve one clearly defined problem
- Avoid unrelated refactors
- Avoid renaming files without reason
- Not modify other packages unless required

---

## 6. Formatting & Linting

Prettier and ESLint are mandatory.

If CI fails due to formatting:
- Run Prettier
- Commit formatting changes only

Do not mix formatting fixes with logic changes.

---

## 7. When Unsure

If architectural decisions are unclear:
- Do not guess.
- Prefer minimal implementation.
- Add a short comment explaining assumptions.

---

## 8. Definition of Done

A task is complete only if:
- Code builds
- Tests pass
- Lint passes
- Format passes
- Scope is respected
- No duplicated business logic exists

---

End of agent instructions.