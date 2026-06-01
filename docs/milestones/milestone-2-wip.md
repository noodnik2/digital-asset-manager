# Milestone 2-WIP — Step 2 Scaffold (In Progress)

**Date:** 2026-05-31
**Branch:** `feature/implementation`
**Status:** Scaffold written and tsc-clean. Dev server NOT yet verified. Tests NOT yet written (TDD violation — must be rectified next session before milestone is complete).

---

## What Was Done This Session

### Questions answered (important for continuity)

**`colors_and_type.css` modification:** Correct and intentional. Previous session added `--row-h-item: 32px` and fixed `.row-selected` to `inset 3px` (was 2px) per approved design decisions. The file in `docs/design/reference/` is the design source of truth and was rightly modified. For the renderer, tokens are **copied** to `src/renderer/src/styles/base.css` so `docs/` remains documentation. The renderer never imports from `docs/`.

**`flavor` (`OperationFlavor`):** Two values, both defined in `src/shared/types/operation.ts`:
- `'creates-files'` — Flavor A: produces new output files in a destination folder. Complete screen shows Library output hint + "Load output into Working Set" affordance.
- `'modifies-in-place'` — Flavor B: modifies source files in place. Always destructive; Config step shows non-dismissible warning. Complete screen has no Library hint and no load-output affordance.
- `isDestructive` was intentionally omitted from `OperationDefinition` — it is derived: `flavor === 'modifies-in-place'`.

**`dateModifiedPreset`:** In `LibraryFilter.dateModifiedPreset?: string` — a filter that narrows results by last-modified date using human-friendly presets (e.g., `'today' | 'last7' | 'last30' | 'last90'`). Typed as `string` because exact values are not yet enumerated; will be finalized when the filter UI is built (a Step 2 open flag, carried forward).

**Stale path fix:** `docs/rules/workflow.md` project root corrected from `~/repos/noodnik2/midi-manager` → `~/repos/noodnik2/digital-asset-manager`.

### Files created

| File                                                         | Purpose                                                                                             |
|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| `package.json`                                               | electron-vite project manifest; `dev:renderer` script for browser-only dev                          |
| `tsconfig.json`                                              | Root project references config                                                                      |
| `tsconfig.node.json`                                         | Main process + shared TS config                                                                     |
| `tsconfig.web.json`                                          | Renderer TS config (JSX, DOM lib)                                                                   |
| `electron.vite.config.ts`                                    | Electron-vite config with `@shared` alias                                                           |
| `vite.renderer.config.ts`                                    | **Standalone renderer config** — `npm run dev:renderer` serves renderer in browser without Electron |
| `src/main/index.ts`                                          | Electron main process stub                                                                          |
| `src/preload/index.ts`                                       | Electron preload stub                                                                               |
| `src/renderer/index.html`                                    | Renderer HTML entry                                                                                 |
| `src/renderer/src/main.tsx`                                  | React root — imports base.css + app.css                                                             |
| `src/renderer/src/styles/base.css`                           | Design tokens + base element styles (copied from `docs/design/reference/colors_and_type.css`)       |
| `src/renderer/src/styles/app.css`                            | App shell + component styles                                                                        |
| `src/renderer/src/services/mock.ts`                          | Mock `AppServices` — 7 assets, 2 operations, in-memory WS state                                     |
| `src/renderer/src/services/context.tsx`                      | `ServicesContext` + `useServices()` hook                                                            |
| `src/renderer/src/App.tsx`                                   | Two-pane shell; ⌘1/⌘2 pane switching; active pane amber top inset                                   |
| `src/renderer/src/components/shell/StatusBar.tsx`            | 28px status bar; WS count; keyboard hint                                                            |
| `src/renderer/src/components/library/LibraryPane.tsx`        | Library pane with toolbar, table, settings icon                                                     |
| `src/renderer/src/components/library/AssetListItem.tsx`      | Table row — two-line Name, type-based cell formatting                                               |
| `src/renderer/src/components/working-set/WorkingSetPane.tsx` | WS pane; empty state; item list; clear/remove                                                       |
| `src/renderer/src/components/working-set/WorkingSetItem.tsx` | WS row — type badge, filename, duration, × remove                                                   |

### Mock data seeded

7 assets: 5 MIDI (groove-01, bass-loop-03, session-a-chords, arp-v2-final, kick-pattern-04) + 1 JPEG (cover-art) + 1 MD (session-notes). Exercises: mixed types, null durations, varied folder paths, 2025-dated file, multi-tag rows.

2 operations: "Normalize Velocity" (`modifies-in-place`) + "Export to WAV" (`creates-files`) — one of each flavor so both Complete-state paths are reachable later.

Working Set pre-seeded with groove-01 + arp-v2-final so both populated and empty states are reachable in the UI.

### State after npm install

`npm install` succeeded (140 packages). `tsc -p tsconfig.web.json --noEmit` clean. Dev server not yet started.

---

## What Is NOT Done (Must Complete Before Milestone-2 Is Final)

### 1. Write Tests (BLOCKER — TDD violation)

TDD rule from `docs/rules/testing.md`: tests MUST be written first. Implementation was written first — this must be rectified. In the next session, write tests, then verify they pass.

#### Test tooling to add

Add to `package.json` devDependencies:
```json
"vitest": "^3.x",
"@vitest/coverage-v8": "^3.x",
"@testing-library/react": "^16.x",
"@testing-library/user-event": "^14.x",
"@testing-library/jest-dom": "^6.x",
"jsdom": "^26.x"
```

Create `vitest.config.ts` at project root:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/renderer/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, branches: 80 },
      include: ['src/renderer/src/**', 'src/shared/**'],
      exclude: ['src/renderer/src/test-setup.ts', '**/*.test.*'],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
})
```

Create `src/renderer/src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add scripts to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

#### Tests to write

**`src/renderer/src/services/mock.test.ts`** (unit tests — pure functions):
- `applyQuery`: search filters by filename substring (case-insensitive)
- `applyQuery`: search filters by tag substring
- `applyQuery`: assetTypes filter narrows by extension
- `applyQuery`: no query returns all assets
- `assetToRow`: duration cell value is raw seconds (number), not formatted string
- `assetToRow`: size cell value is raw bytes (number)
- `assetToRow`: null duration → null cell value
- `assetToRow`: empty tags array → null cell value
- `formatDate`: current-year date → "May 22" format
- `formatDate`: prior-year date → "YYYY-MM-DD" format
- `mockServices.workingSet.addAssets`: deduplicates; returns correct added/skipped split
- `mockServices.workingSet.removeAsset`: removes item; subsequent getItems() excludes it
- `mockServices.workingSet.clear`: empties list

**`src/renderer/src/components/library/AssetListItem.test.tsx`** (component tests):
- Renders two-line name cell (filename + folder path)
- Renders type badge with correct text
- Formats duration from seconds to mm:ss (218 → "3:38")
- Formats size from bytes (43520 → "42 KB", 2457600 → "2.5 MB")
- Null duration → empty cell (no "—", no text)
- Tags render as `.tag` chips
- `selected: true` → row has class `row-selected`
- `selected: false` → row does not have class `row-selected`

**`src/renderer/src/components/working-set/WorkingSetItem.test.tsx`** (component tests):
- Renders type badge
- Renders filename without extension
- Renders formatted duration when present
- Does NOT render duration when null
- Clicking × calls `onRemove` with the correct assetId
- Delete key calls `onRemove` with the correct assetId
- Backspace key calls `onRemove` with the correct assetId

**`src/renderer/src/components/working-set/WorkingSetPane.test.tsx`** (component tests):
- Shows empty state when items list is empty
- Does NOT show empty state when items list is populated
- Operation button is disabled when Working Set is empty
- Clear button is disabled when Working Set is empty
- Calls `onCountChange(0)` when Working Set is empty
- Calls `onCountChange(2)` when Working Set has 2 items
- Clicking × on an item calls `removeAsset` and re-renders without that item

### 2. Verify dev server

Run `npm run dev:renderer` → confirm http://localhost:5173 renders correctly:
- Two panes visible (58/42 split)
- Amber 2px top inset on active (Library) pane
- Library shows 7 rows; MIDI rows have durations; JPEG/MD rows have empty Duration cell
- Working Set pre-seeded with groove-01 + arp-v2-final
- Clear button removes items; empty state appears

---

## Open Flags (Carry Forward)

- `dateModifiedPreset` values need enumeration before the filter UI is built
- Verify `Asset.absolutePath` ownership (shared type vs. main-process-only)
- Verify `getSavedQuery` / `saveQuery` is the right persistence mechanism

---

## Next Session Checklist

1. Read `docs/milestones/milestone-2-wip.md` (this file)
2. Set up Vitest + Testing Library (instructions above)
3. Write all tests listed above
4. Run `npm test` — all should pass
5. Run `npm run dev:renderer` — verify shell in browser
6. Run `npm run test:coverage` — confirm ≥80% lines/branches
7. Write `docs/milestones/milestone-2.md` (final)
8. Clear context and proceed to Step 3
