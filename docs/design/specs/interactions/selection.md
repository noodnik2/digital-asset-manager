# Selection Model & Interaction

_Task 6 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Overview

Selection is the user's primary act in the Library. Everything else — operations, Working Set management — depends on it. The selection model must handle single items, large non-contiguous multi-selects, and range selects with equal confidence, entirely from the keyboard if needed.

**Scope:** This spec covers selection within the Library list. Working Set items are not selectable (established in Task 5). The transfer gesture — moving selected items into the Working Set — is covered in Task 7.

---

## Conceptual Model

Selection state lives on Library items. An item is either selected or not. There is no "focused-but-not-selected" ambiguity in the count or in the Working Set — only explicitly selected items count.

**Anchor:** Range selection requires a reference point — the anchor. The anchor is the item from which a `Shift` gesture extends. It is set on single clicks, `Cmd+Click`, and `Space` toggles. It is not reset by arrow-key navigation (focus moves independently of anchor).

**Focus vs. selection:** These are independent. Focus is the keyboard cursor — it determines which item receives keyboard actions. Selection is the set of items being accumulated for an operation. You can navigate (move focus) extensively without touching your selection.

---

## Pointer Gestures

| Gesture | Result | Anchor |
|---|---|---|
| **Click** | Select clicked item; deselect all others | Set to clicked item |
| **Cmd+Click** | Toggle clicked item; all other selections unchanged | Set to toggled item |
| **Shift+Click** | Select the range from anchor to clicked item; items outside the range that were individually selected via Cmd+Click remain selected | Unchanged |
| **Cmd+Shift+Click** | Add the range from anchor to clicked item to the existing selection | Unchanged |

**Click always clears other selections.** This is intentional and standard. The user who wants to add a single item without clearing uses Cmd+Click.

**Shift+Click range:** The range includes both the anchor item and the clicked item. Direction (up or down from anchor) is determined by which item was clicked relative to the anchor. The range always selects, never deselects — use Cmd+Click to remove individual items from a multi-select.

---

## Keyboard Gestures

| Key | Action | Anchor |
|---|---|---|
| `↑` / `↓` | Move focus. Selection unchanged. | Unchanged |
| `Space` | Toggle selection of the focused item. Other selections unchanged. | Set to focused item if toggling on; cleared if toggling off last selected item |
| `Shift+↑` | Extend range upward from anchor. Focus moves up. | Unchanged |
| `Shift+↓` | Extend range downward from anchor. Focus moves down. | Unchanged |
| `⌘A` | Select all items in the current view (the filtered set, or all items if no filter). Focus unchanged. | Set to first item in view |
| `Escape` | Deselect all. Focus stays on current item. Anchor cleared. | Cleared |

**`↑`/`↓` do not move selection.** The user navigates freely without disturbing their accumulated selection. This enables selecting 50 non-contiguous items: Space to select, ↓ to move, Space again, repeat.

**`Shift+↑`/`Shift+↓` extend the range from the anchor,** not from the current focus. If the anchor is item 5 and focus is on item 10 (moved there via ↓), pressing `Shift+↑` selects the range 5–9 with focus at 9 — it contracts the downward range rather than extending upward past the anchor. This matches macOS list behavior.

**Shift+Arrow always selects.** There is no Shift+Arrow gesture that deselects. To remove items from a range selection, use Cmd+Click on individual items.

---

## ⌘A and "Add All Filtered" Action

### ⌘A — select all in current view

`⌘A` selects all items currently visible in the Library — the filtered set if filters are active, or the full library if not. It does not add them to the Working Set; it selects them. The transfer is a separate step (Task 7).

`⌘A` is the primary path to "add all filtered results to Working Set" — filter to a subset, then `⌘A` to select all, then transfer (Task 7).

### Direct "add all" shortcut

For the common case where the user wants to add everything currently visible to the Working Set without an intermediate select step, a direct action is available via keyboard shortcut (exact key defined in Task 13). This is semantically equivalent to `⌘A` + transfer — it is a composed accelerator, not a different concept.

No dedicated "Add all" button in the toolbar. The toolbar is at capacity (search, filter, sort, count). `⌘A` + transfer is composable, learnable, and sufficient.

---

## Selection Count Display

The selection count lives in the Library toolbar, in the item count position. It does not occupy a separate region.

| State | Display |
|---|---|
| No selection, no filter | `247 items` |
| No selection, filtered | `12 of 247` |
| Selection active, no filter | `3 selected · 247 items` |
| Selection active, filtered | `3 selected · 12 of 247` |
| All visible items selected | `247 selected · 247 items` or `12 selected · 12 of 247` |

The `·` separator is `--fog`. The selection count (`3 selected`) is `--text-primary` weight — it is the more important number when items are selected.

The count updates live on every selection change. It is a live ARIA region (see Accessibility section).

---

## Selection State When Library State Changes

| Change | Effect on selection |
|---|---|
| **Sort column / direction changes** | Selection persists. Items remain selected as they reorder. The anchor position in the visual list may shift, but the anchor item identity is preserved. |
| **Filter changes (any filter added, removed, or modified)** | **Selection cleared.** The visible set has changed; invisible selected items would be confusing. The anchor is also cleared. |
| **Search query changes** | **Selection cleared.** Treated the same as a filter change — the visible set changes. |
| **Window resize / column resize** | Selection persists. These are view changes, not content changes. |
| **New items added to Library (import)** | Selection persists. New items are unselected. |

**Why filter changes clear selection:** If the user has 5 items selected and applies a filter that hides 3 of them, the count would show "5 selected" but only 2 are visible. This creates ambiguous state. Clearing on filter change eliminates the problem entirely. The cost is low — the user is changing their view context, which signals intent to start a new selection.

---

## Clear Working Set

Specified in Task 3 (Working Set pane toolbar `[Clear]` button). Repeated here for completeness:

- Available when Working Set has items; disabled when empty.
- Clears immediately, no confirmation.
- Non-destructive — files remain in the Library.
- Does **not** clear Library selection. The user may have selected items in the Library that they haven't transferred yet; clearing the Working Set should not affect that.
- Does **not** clear the configured operation. The operation button retains its label after clearing.

Library selection and Working Set contents are independent state. Clearing one does not affect the other.

---

## Deselecting

| Action | Effect |
|---|---|
| `Escape` | Deselect all, clear anchor. Focus stays on current item. |
| Click on a different item (no modifier) | Deselect all, select clicked item. |
| Click on whitespace below the list | Deselect all, clear anchor. |
| Filter/search change | Deselect all, clear anchor. |

There is no "deselect one" gesture other than `Cmd+Click` on a selected item. `Escape` always deselects everything.

---

## Multi-Select Across a Large Collection

**Verification scenario: select 50 non-contiguous items using only a keyboard.**

1. `⌘F` → focus search input
2. `Escape` → return focus to asset list
3. `↓` (N times) → navigate to first item to select
4. `Space` → select it (anchor set)
5. `↓` (M times) → move to next item
6. `Space` → add it to selection
7. Repeat steps 5–6 until 50 items selected
8. Selection count reads `50 selected · 247 items` throughout

This works because `↓` moves focus without changing selection, and `Space` adds to the selection without moving focus. The two keys compose cleanly for arbitrary non-contiguous multi-select.

---

## Accessibility

- [ ] The Library list is `role="grid"` or `role="listbox"` with `aria-multiselectable="true"`
- [ ] Each item has `aria-selected="true/false"` — the non-color selection indicator
- [ ] Selection count is a live region: `aria-live="polite"` on the count element — announces `"3 items selected"` on change
- [ ] `⌘A` (select all) announces: `"All 247 items selected"` / `"All 12 filtered items selected"`
- [ ] `Escape` (deselect all) announces: `"Selection cleared"`
- [ ] Range selection via `Shift+↓` announces each addition: `"groove-02 added to selection. 4 items selected."` — or a batched announcement if many items added at once
- [ ] Anchor identity is not communicated to screen readers (implementation detail); only the count and per-item selected state matter
- [ ] Filter changes that clear selection announce: `"Filter applied. Selection cleared."`
- [ ] Every pointer gesture has a keyboard equivalent:

| Pointer | Keyboard |
|---|---|
| Click | `↓`/`↑` to focus, then `Escape` to deselect all, then `Space` |
| Cmd+Click | `↓`/`↑` to focus, then `Space` |
| Shift+Click | `↓`/`↑` to focus, then `Shift+↓`/`Shift+↑` to extend |
| Click on whitespace | `Escape` |

---

## Open Questions

- **`Escape` in search input:** clears search (Task 2). If focus is in the list and search is active, `Escape` clears search (not selection). If search is already clear, `Escape` deselects. This precedence is resolved in Task 13.
- **Selection persistence across sessions:** Not preserved. Each session starts with no selection (Working Set is empty, Library selection is cleared). Consistent with Working Set session behavior.

---

_Next: Task 7 — Library → Working Set Transfer_
