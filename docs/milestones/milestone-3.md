# Milestone 3 — Library Selection + Working Set Transfer

**Date:** 2026-05-31  
**Branch:** `feature/implementation`  
**Status:** COMPLETE

---

## What Was Done

### Scope (Pointer-First MVP)

Per user decision: click/Cmd-click/Shift-click/Cmd-Shift-click selection + count display +
clear-on-search + `⌘→` transfer. Full keyboard focus model, `⌘A`, Space toggle, Shift+arrows,
drag-and-drop, and entrance animation are deferred to a later milestone.

---

### New File: `selection.ts` + `selection.test.ts`

Pure, framework-free selection state reducer.

**State model:**
```
SelectionState { committed: Set<string>, shiftRange: Set<string>, anchor: string | null }
```

- `committed` — items locked in via click/cmd-click gestures
- `shiftRange` — tentative range from the most recent shift gesture (recalculated each time)
- Derived selected set = `committed ∪ shiftRange`

This model correctly handles range contraction (Shift+Click closer to anchor removes items
that were only in the previous shift range) and Cmd-click before/after shift-click sequences.

**Exports:** `emptySelection`, `clearSelection`, `getSelectedIds`, `applyGesture`

**27 tests** — all passing. Covers all four pointer gestures, range direction, anchor
behavior, contraction, out-of-list fallback, and count deduplication.

---

### Changes to `AssetListItem.tsx`

Added optional `onRowClick?: (id: string, e: React.MouseEvent) => void` prop. Wired to
`<tr onClick>`.

---

### Changes to `LibraryPane.tsx`

- Selection state (`SelectionState`) tracked in `useState`
- `visibleIdsRef` (`useRef`) holds current visible ID order for shift-click range calculation
- `handleRowClick` maps `MouseEvent` modifiers to `SelectionGesture` and calls `applyGesture`
- Count label updated: `"3 selected · 7 items"` / `"3 selected · 5 of 7"` / base form
- `handleSearch` calls `clearSelection()` before updating query (filter change clears selection)
- `⌘→` document-level listener: transfers `getSelectedIds(sel)` if non-empty, else `anchor`; calls `onAssetsTransferred?.()` after transfer
- New prop: `onAssetsTransferred?: () => void`
- Rows rendered with `selected` overlaid from renderer state (mock always returns `selected: false`)

---

### Changes to `mock.ts`

- Removed module-level `selectedIds` `Set` — it was never populated and is now dead code
- `assetToRow` no longer takes a `selectedIds` parameter; always returns `selected: false`

---

### Changes to `WorkingSetPane.tsx`

- Added `refreshKey?: number` prop
- `useEffect(() => { refresh() }, [refresh, refreshKey])` — re-fetches on key increment

---

### Changes to `App.tsx`

- Added `wsRefreshKey` state counter
- `handleAssetsTransferred` callback increments `wsRefreshKey`
- `LibraryPane` receives `onAssetsTransferred={handleAssetsTransferred}`
- `WorkingSetPane` receives `refreshKey={wsRefreshKey}`

---

### Test Files Updated

| File | What Was Added |
|---|---|
| `selection.test.ts` | 27 tests for the pure selection reducer (new file) |
| `AssetListItem.test.tsx` | 2 tests for `onRowClick` prop |
| `LibraryPane.test.tsx` | 15 tests: row selection, count label, search clear, ⌘→ transfer |
| `WorkingSetPane.test.tsx` | 1 test for `refreshKey` re-fetch trigger |

**Test totals:** 158 tests, all passing. Coverage: 97.57% statements / 93.9% branches.

---

## Open Flags (Carry Forward from M2)

- `dateModifiedPreset` values need enumeration before filter UI is built
- Verify `Asset.absolutePath` ownership (shared type vs. main-process-only)
- Verify `getSavedQuery` / `saveQuery` is the right persistence mechanism

---

## Deferred to Future Milestone

| Feature | Spec reference |
|---|---|
| Keyboard focus model (↑/↓ separate from selection) | selection.md |
| `Space` toggle, `Shift+↑/↓` range extension, `⌘A` select all | selection.md |
| `Escape` deselect all | selection.md |
| Entrance animation on WS add (150ms opacity+translate stagger) | transfer.md |
| Drag-and-drop transfer | transfer.md |
| Screen reader live-region announcements on transfer | transfer.md |
| `⌘→` shortcut confirmation vs. full keyboard map (Task 13) | transfer.md |

---

## Next Session: Milestone 4

TBD — likely operation palette or sort/filter UI. Read design specs before deciding scope.
