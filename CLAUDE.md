# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Local-first desktop Digital Asset Manager for power users with large file collections. macOS-first, cross-platform
goal, SaaS in the long-term roadmap.

The core model is: select from Library → Working Set → run operation → inspect output.  The application shell
is asset-type agnostic; all domain knowledge lives in the plugin layer.  MIDI is the first plugin.

Full design context, decisions, and rationale: `docs/design/`.

## Principle Guidance

Agents MUST read and follow guidelines provided here and elsewhere, as they become relevant; e.g.:

- [Making changes](docs/rules/workflow.md)
- [Editing files](docs/rules/editing.md)  
- [Reviewing changes](docs/rules/reviewing.md) 
- [Testing changes](docs/rules/testing.md)

## Current Phase of Development

The current phase of development is planning implementation based upon the [design specifications](#design-specs).

## Evolution of This File

Claude MUST work to keep this file updated during the project's development so that it can work efficiently,
maintain a correct understanding of the evolving codebase, and focus on implementing the design specifications.

## Design specs

All implementation must conform to the approved design. Before writing any UI code, read:

- [Decisions with rationale; authoritative on any "why"](docs/design/design-state.md) 
- [Component and interaction specs for every surface](docs/design/specs/) 
- [Visual language (colors, spacing, typography)](docs/design/reference/taste.md) 
- [Design principles that govern tradeoffs](docs/design/reference/strategy.md)

## Tech stack

- Container: Electron
- Build tooling: electron-vite
- Language: TypeScript (strict mode) throughout
- Frontend: React, TanStack Table, TanStack Query
- Main ↔ renderer bridge: electron-trpc (IPC — no HTTP server)
- Local store: better-sqlite3 (SQLite)
- Client state: Zustand
- No Express, no HTTP server in v1

## UI-First Approach

Implement the UI first to validate UX before building backend logic.

- Implement UI using `docs/design/specs/`.
- All backend interactions are mediated through a technology-agnostic `AppServices` interface defined in
  `src/shared/appservices.ts`. This interface is expressed in domain terms only (e.g., `LibraryService`,
  `WorkingSetService`, `OperationService`, etc.) — it has no dependency on tRPC or any transport.
- The renderer depends only on the `AppServices` interface. Transport (IPC, mock) is injected — the renderer never
  imports from tRPC or Electron directly.
- Maintain a mock implementation of the `AppServices` interface in the renderer so the UI can run with `vite` alone,
  without Electron or IPC.
- The `AppServices` interface grows only to support features defined in the design specs or explicitly requested.
  Do not expand it speculatively.

### Source Code Organization

See `docs/architecture.md` for the source code folder structure.


## Testing

**Runner:** Vitest (configured in `vitest.config.ts`)  
**Component tests:** `@testing-library/react` with jsdom  
**Coverage:** `@vitest/coverage-v8`

| Command | Purpose |
|---|---|
| `npm test` | Watch mode |
| `npm run test:run` | Single run |
| `npm run test:coverage` | Run + coverage report (enforces 80% threshold) |

Coverage thresholds (lines and branches) are enforced by `vitest.config.ts`. **Do not lower them.**

### TDD Enforcement

Per `docs/rules/testing.md`: for every new feature or bug fix, write a failing test first, then write the minimum code to pass it. Never add code without a corresponding test. The 80% branch/line minimum must be maintained at all times — run `npm run test:coverage` after each change to verify.

### Test file layout

- Unit: `*.test.ts` colocated with source
- Component: `*.test.tsx` colocated with component
- Setup: `src/test-setup.ts` (jest-dom matchers)
- Excluded from coverage: `src/renderer/src/main.tsx`, styles, type-only shared files

