# Milestone 1 — Shared Type Contracts

**Date:** 2026-05-31  
**Branch:** `feature/implementation`  
**Status:** Complete — approved by user. Ready for Step 2.

---

## What Was Done

Wrote the four shared type files that form the type contract between the renderer, the plugin layer, and the service interface. Also applied two recorded CSS corrections and updated the architecture doc.

### Files created

| File | Purpose |
|---|---|
| `src/shared/types/asset.ts` | `Asset`, `AssetRow`, `AssetCell`, `ColumnDefinition`, `LibraryFilter`, `LibraryQuery`, `LibraryViewState` |
| `src/shared/types/operation.ts` | `OperationDefinition`, `ParameterDefinition`, `ParameterValues`, `SavedOperationConfig`, `OperationProgress`, `OperationResult`, `FileOperationProgress` |
| `src/shared/plugin-interface.ts` | `MetadataPlugin`, `OperationPlugin`, `Plugin`, `PluginColumnDeclaration`, `PluginFilterField`, `ProgressCallback` |
| `src/shared/appservices.ts` | `AppServices` (composed of `LibraryService`, `WorkingSetService`, `OperationService`) + `WorkingSetItem` |

### Files modified

| File | Change |
|---|---|
| `docs/design/reference/colors_and_type.css` | Added `--row-h-item: 32px`; fixed `.row-selected` to `inset 3px` (was 2px) |
| `docs/architecture.md` | Added `appservices.ts`, `plugin-interface.ts`, and annotated `types/` entries in the `shared/` listing |

---

## Decisions Applied

All 5 decisions from the previous session (recorded in memory `type-contract-decisions.md`) were implemented:

1. `providesDuration: boolean` on `MetadataPlugin`
2. `PluginFilterField` shape: `columnId`, `controlType: 'range' | 'multiselect' | 'comparison' | 'preset'`, `presetOptions?: string[]`
3. Service file is `src/shared/appservices.ts`; interface is `AppServices`
4. `appservices.ts` added to `docs/architecture.md`
5. `--row-h-item: 32px` added to CSS; `.row-selected` fixed to 3px

## Additional Decisions Made (User Approved)

6. **`Asset.absolutePath`** included in the shared `Asset` type (needed by plugin execution). Flag raised: verify it belongs here vs. main-process-only.
7. **`LibraryService.getSavedQuery()` / `saveQuery()`** added to support cross-session sort/filter persistence. Flag raised: verify mechanism is correct.
8. **`dateModifiedPreset?: string`** in `LibraryFilter` — left as `string` pending enumeration of actual preset values. Flag raised before filter UI is built.
9. **`isDestructive` omitted** from `OperationDefinition` — derived from `flavor === 'modifies-in-place'`.
10. **`PluginColumnType`** (plugin side, excludes `'tags'`) is separate from shell's `ColumnType` (includes `'tags'`).
11. **`WorkingSetItem`** lives in `appservices.ts` as a view type (not in `types/asset.ts`).

---

## Open Flags (Carry Forward)

These were flagged during type review and remain unresolved:

- `dateModifiedPreset` values need enumeration before the filter UI is built
- Verify `Asset.absolutePath` ownership (shared type vs. main-process-only)
- Verify `getSavedQuery` / `saveQuery` is the right persistence mechanism for sort/filter state

---

## Next Step: Step 2 Scaffold

Per the kickoff prompt (`docs/prompts/kickoff.md`):

1. Scaffold the project with electron-vite's React + TypeScript template
2. Reorganize into the folder structure in `docs/architecture.md`
3. Implement mock `AppServices` in the renderer — every method returns realistic static data shaped to the approved types
4. Implement `src/renderer/src/App.tsx` — two-pane shell matching the app-shell spec:
   - Library pane left (~58%), Working Set pane right (~42%)
   - Status bar fixed at bottom (28px, `--row-h-compact`)
   - Active pane indicated by 2px amber top inset, inactive pane at `opacity: 0.85`
5. Apply color and spacing tokens from `docs/design/reference/colors_and_type.css` (now includes `--row-h-item: 32px`)

**Deliverable:** `vite` running standalone (no Electron) renders the shell with mock data.

### Key constraints for Step 2

- Renderer imports `AppServices` from `../../shared/appservices` — never from tRPC or Electron
- Mock is in the renderer (`src/renderer/src/services/mock.ts` or similar)
- No main-process code, no DB, no filesystem access in Step 2
- Status bar height: `--row-h-compact` (28px) — not `--row-h-item`
- Active pane top inset: 2px amber (shell spec) — different from 3px row selection rail
- Pane split: ~58% / ~42% (CSS `flex` or `grid`; not draggable in v1)
- Font imports: DM Sans, DM Serif Display, JetBrains Mono (Google Fonts, per `colors_and_type.css`)
- Settings icon (Lucide `settings`, 16px, `--fog`) fixed bottom-left of Library pane

### Step 2 open question (to answer before or during scaffold)

- Should the mock data file be seeded with realistic MIDI-like assets, or minimal placeholder data? Either works for validating the shell layout.

---

## Context Notes

- `workflow.md` project root corrected to `~/repos/noodnik2/digital-asset-manager` (was stale `midi-manager` reference from a prior project).
- `docs/milestones/` did not exist before this session. Workflow rule requires a milestone doc per milestone — this file satisfies that for Milestone 1.
