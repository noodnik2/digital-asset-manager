# Kickoff Prompt

The initial prompt given to Claude Code after the design documents were copied:

## Prompt

You are beginning implementation of a Digital Asset Manager desktop application. Before writing any code, read the following in full:

1. CLAUDE.md — tech stack, development rules, and the UI-First approach
2. docs/architecture.md — source folder structure
3. docs/design/design-state.md — 148 recorded design decisions with rationale; authoritative source on every "why"
4. docs/design/specs/shell/app-shell.md
5. docs/design/reference/taste.md — visual language: color tokens, spacing, typography
6. All remaining files under docs/design/specs/
7. docs/design/reference/plan.md — read for context only; see precedence rule below

Precedence rule: The component specs (docs/design/specs/) and the decisions log in design-state.md are authoritative. Where they
conflict with plan.md, the specs and decisions log win — plan.md is the design-phase plan, not an implementation roadmap, and some
details were superseded by later decisions. One known example: plan.md describes the operation palette as a fixed panel; the
decisions log and operation-palette.md establish it as a button-triggered modal. The modal wins.

Working norm: Build only what the specs define. Where a spec is silent on something, flag it and ask — do not fill gaps by invention.
This is not a suggestion; it is a rule.

  ---
Your first task is in two steps with a checkpoint between them.

Step 1 — Confirm your understanding (no code yet):

After reading all the docs, write a short restatement of these four decisions in your own words:

1. Why the core application must contain zero MIDI vocabulary, and where domain-specific names live instead
2. What the Working Set is, what it is not, and what "session-only" means for its type definition
3. The three-tier column system: what each tier is, who owns it, and what constraints apply at registration — note that runtime
   enforcement is deferred, but the type model must be complete now because the UI renders columns
4. The operation modal's three steps and what state each step owns

Also flag any contradictions or ambiguities you found across the docs. Then propose the contents of these four files — not stubs,
actual complete types:

- src/shared/services.ts — the AppServices interface: technology-agnostic service contract in domain terms; this is what the renderer
  depends on and what the mock implements
- src/shared/plugin-interface.ts — the plugin-author contract; the column and operation types defined here feed into AppServices
- src/shared/types/asset.ts
- src/shared/types/operation.ts

Stop here and wait for review before proceeding.

  ---
Step 2 — Scaffold (after type contract is approved):

Once the shared types are confirmed:

1. Scaffold the project with electron-vite's React + TypeScript template
2. Reorganize into the folder structure in docs/architecture.md
3. Implement the mock AppServices in the renderer — every method returns realistic static data shaped to the approved types
4. Implement src/renderer/src/App.tsx — two-pane shell matching the app-shell spec: Library pane left (~58%), Working Set pane right
   (~42%), status bar fixed at bottom (28px), active pane indicated by 2px amber top inset
5. Apply the color and spacing tokens from docs/design/reference/taste.md

Deliverable for Step 2: vite running standalone (no Electron required) renders the shell with mock data. No main process code, no
database, no file system access yet.
