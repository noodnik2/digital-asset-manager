# Milestone 2 — Renderer Scaffold + Test Infrastructure

**Date:** 2026-05-31  
**Branch:** `feature/implementation`  
**Status:** COMPLETE

---

## What Was Done

### Scaffold (carried from WIP)

Full renderer shell built and verified:

| File                                                         | Purpose                                                                 |
|--------------------------------------------------------------|-------------------------------------------------------------------------|
| `package.json`                                               | electron-vite project manifest with test scripts                        |
| `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` | TypeScript project references                                           |
| `electron.vite.config.ts`                                    | Electron-vite config with `@shared` alias                               |
| `vite.renderer.config.ts`                                    | Standalone renderer config (`npm run dev:renderer`)                     |
| `src/main/index.ts` / `src/preload/index.ts`                 | Electron stubs                                                          |
| `src/renderer/index.html`                                    | Renderer HTML entry                                                     |
| `src/renderer/src/main.tsx`                                  | React root                                                              |
| `src/renderer/src/styles/base.css`                           | Design tokens (copied from `docs/design/reference/colors_and_type.css`) |
| `src/renderer/src/styles/app.css`                            | App shell + component styles                                            |
| `src/renderer/src/services/mock.ts`                          | Mock AppServices — 7 assets, 2 operations, in-memory WS                 |
| `src/renderer/src/services/context.tsx`                      | `ServicesContext` + `useServices()` hook                                |
| `src/renderer/src/App.tsx`                                   | Two-pane shell; ⌘1/⌘2 switching; active pane amber inset                |
| `src/renderer/src/components/shell/StatusBar.tsx`            | 28px status bar; WS count; keyboard hint                                |
| `src/renderer/src/components/library/LibraryPane.tsx`        | Library pane: toolbar, table, settings icon                             |
| `src/renderer/src/components/library/AssetListItem.tsx`      | Table row: two-line Name, type-based cell formatting                    |
| `src/renderer/src/components/working-set/WorkingSetPane.tsx` | WS pane: empty state, item list, clear/remove                           |
| `src/renderer/src/components/working-set/WorkingSetItem.tsx` | WS row: type badge, filename, duration, × remove                        |

### Test Infrastructure (this session)

**Packages added:** `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`

**Config:** `vitest.config.ts` — jsdom env, `@shared` alias, 80% line+branch thresholds enforced (build fails if dropped)

**Setup:** `src/test-setup.ts` — jest-dom matchers

**8 test files, 116 tests — all passing:**

| Test File                                        | What It Covers                                                       |
|--------------------------------------------------|----------------------------------------------------------------------|
| `services/mock.test.ts`                          | library query/search/filter/date-format, workingSet CRUD, operations |
| `services/context.test.tsx`                      | `useServices` — throws outside provider, returns value inside        |
| `components/shell/StatusBar.test.tsx`            | Count display, pluralization, separator                              |
| `components/working-set/WorkingSetItem.test.tsx` | Render, duration format, keyboard events (Delete/Backspace), aria    |
| `components/library/AssetListItem.test.tsx`      | All cell types, selection, invisible columns, missing cells          |
| `components/working-set/WorkingSetPane.test.tsx` | Empty state, item list, remove, clear, disabled button states        |
| `components/library/LibraryPane.test.tsx`        | Column headers, `colClass`, search query, count label, loading null  |
| `App.test.tsx`                                   | ⌘1/⌘2 pane switching, click-to-focus, listener cleanup               |

**Coverage achieved:**
- Statements: **98.35%**
- Branches: **93.54%**
- Functions: **95.71%**
- Lines: **98.01%**

### Dev Server Verified

`npm run dev:renderer` → confirmed shell renders correctly in browser.

### `.gitignore` Updated

Added `out/`, `*.tsbuildinfo`, `.DS_Store`. Removed `tsconfig.web.tsbuildinfo` from git tracking.

### CLAUDE.md Updated

Testing section added documenting commands, TDD rule, thresholds, and file layout.

---

## Open Flags (Carry Forward)

- `dateModifiedPreset` values need enumeration before filter UI is built
- Verify `Asset.absolutePath` ownership (shared type vs. main-process-only)
- Verify `getSavedQuery` / `saveQuery` is the right persistence mechanism

---

## TDD Reminder

Per `docs/rules/testing.md`: **write the failing test first**, then write code to pass it. Run `npm run test:coverage` after every change to confirm ≥80% is maintained. The threshold is enforced in `vitest.config.ts` — it will fail if dropped.

---

## Next Session: Milestone 3 — Library Selection + Add to Working Set

### Goal

Wire up the core Library → Working Set interaction loop so the user can:

1. Click a Library row to select it (single selection)
2. Add selected asset(s) to the Working Set (keyboard shortcut or button)
3. See rows visually highlighted as selected
4. See the Working Set update live

This is still UI-only — mock services only. No Electron IPC, no SQLite.

### Before writing any code

Read `docs/design/specs/` to confirm exact interaction spec for:
- Single-click vs. ⇧-click range selection
- Keyboard shortcut for "Add to Working Set"
- What visual state a selected row shows (class `row-selected` already styled)
- Whether multi-select is scoped to this milestone

### What will need to change

1. **`mock.ts`** — `selectedIds` set is currently never populated by any service call. Add `selectAsset(id)` / `deselectAsset(id)` / `toggleAsset(id)` / `clearSelection()` to `LibraryService` in `AppServices` interface — OR handle selection as pure renderer state (no service call). **Check design spec first.** If selection is renderer-only state (likely), the service interface does NOT change.

2. **`LibraryPane.tsx`** — handle row click, maintain `selectedIds` state, pass selection down to rows (or query reflects it).

3. **`AssetListItem.tsx`** — wire click handler; `row.selected` already drives `row-selected` class + `aria-selected`.

4. **"Add to Working Set" affordance** — per spec: identify the trigger (toolbar button? keyboard shortcut? drag?). Call `services.workingSet.addAssets(selectedIds)`.

5. **Tests first** — unit tests for selection state logic; component tests for click → selection → add flow.

### Resume Checklist

1. Read this file (`docs/milestones/milestone-2.md`)
2. Read `docs/design/specs/` — focus on library-pane and working-set specs for selection + add interaction
3. Read `docs/design/design-state.md` — search for "select" decisions
4. Draft Milestone 3 scope (confirm with user if unclear)
5. Write failing tests first, then implement
6. Run `npm run test:coverage` — confirm ≥80%
7. Run `npm run dev:renderer` — verify visually
