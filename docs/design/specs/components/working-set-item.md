# Asset Item — Working Set Component

_Task 5 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Overview

The Working Set item is a leaner, action-oriented row. Where the Library item is a browsing unit — rich with metadata, sortable columns, selection state — the Working Set item is a basket entry. Its job is to confirm identity (what file is this) and provide the one action available on it (remove it from the basket).

The Working Set is typically small and focused. Information density is less critical here than in the Library. The row can breathe slightly.

---

## Origin — Why There Is No Origin Distinction

The plan asks how Working Set items communicate their origin (selected from Library, output of an operation, or both). This question resolves cleanly given a locked decision from the strategy phase: **output from an operation lands in the Library; the Working Set is not auto-updated.**

All items in the Working Set were placed there by the user, manually, from the Library. There is no mechanism by which an item arrives in the Working Set any other way. A user who wants to operate on operation output adds those output files from the Library — at which point they are Library selections, indistinguishable from any other Library selection.

**No origin indicators are needed.** No "input" badge, no "output" badge, no provenance trail. The Working Set is a basket; everything in it was put there on purpose.

---

## Anatomy

```
  [MIDI]  groove-01                              3:38  [×]
  [WAV]   session-a                              4:02  [×]
  [JPEG]  cover-art                                    [×]
```

Left to right:

| Element | Width | Notes |
|---|---|---|
| **Type badge** | ~48px | File type label (MIDI, WAV, JPEG, etc.). Same badge as Library Type column — same token, same style. |
| **Filename** | flexible | Filename **without** extension. The Type badge carries the type signal; the extension is redundant. No secondary folder path line — the Working Set is not a browsing surface. |
| **Duration** | 48px | Shared field — `mm:ss` in `--font-mono --text-small`. **Absent entirely** when not applicable (images, documents). No placeholder. |
| **Remove button `×`** | 32px | Always visible at `--fog` opacity. Brightens on hover and focus. 32×32px click/tap target (glyph is smaller — padding provides the target). |

**Row height:** `--row-h-compact` (32px). Single line per row. The Working Set doesn't need the two-line Name treatment — no folder path means no reason to expand.

**Filename truncation:** Truncates with `…` if the Working Set pane is narrow. No tooltip — if the user needs to inspect the full name, they find it in the Library.

---

## Comparison with Library Item

| Aspect | Library item | Working Set item |
|---|---|---|
| Structure | Multi-column table row | Flat list row |
| Height | ~46px (two-line Name) | 32px (single line) |
| Filename | Without extension | Without extension |
| Secondary line | Folder path, always visible | None |
| Type | Separate Type column | Inline Type badge |
| Metadata | All columns in scope | Duration only |
| Plugin-specific fields | Yes, in single-type view | No |
| Selection state | Amber fill + 3px left border | None — items are not selectable |
| Remove | Not available | `[×]`, always visible |
| Transfer affordance | `[→]` on hover | Not applicable |
| `Space` | Toggle selection | No action |
| `Delete` | Not applicable | Remove from Working Set |
| `Enter` | Open in default app | Open in default app |

The most important difference: **Working Set items have no selection state.** Selection is a Library concept — you select in the Library to build the Working Set. Within the Working Set, items are either present or removed. There is no subset-selection within the basket.

---

## States

### Default

```
  [MIDI]  groove-01                              3:38  [×]
```

- Background: `--surface` (matches the pane background)
- `[×]` at `--fog` (low opacity, always present)

### Hovered

```
  [MIDI]  groove-01                              3:38  [×]
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
```

- Background: `--surface-raised` (same one-step lift as Library hover)
- `[×]` brightens to `--text-primary`
- No additional elements revealed — no transfer affordance (the item is already in the Working Set), no metadata expansion

### Focused (keyboard focus)

```
┌────────────────────────────────────────────────────┐
│  [MIDI]  groove-01                         3:38  [×] │
└────────────────────────────────────────────────────┘
```

- 2px `--amber` focus ring around the row (inset, same as Library item focus)
- Background: `--surface` (unchanged)
- `[×]` brightens to `--text-primary` (focus on the row, not the button — the button separately gets its own focus state when tabbed to)

### `[×]` button focused directly

When the user tabs to the remove button itself:

- 2px `--amber` focus ring around the `[×]` button only (not the whole row)
- `[×]` at full `--text-primary` weight

This is a distinct focus target from the row itself. Tab order within a row: row focus → `[×]` button focus → next row.

---

## Remove Affordance

### Behavior

Removing an item from the Working Set is **non-destructive** — the file remains in the Library. No confirmation is required or shown.

The `[×]` is not styled as a destructive action (no red, no warning weight). It is a low-stakes basket management action.

### Availability

| State | `[×]` availability |
|---|---|
| Normal | Available |
| During operation (modal open) | **Unavailable.** The modal overlay prevents interaction with the Working Set pane. The `[×]` buttons are not individually disabled — the overlay handles this. |
| After operation, modal dismissed | Available again |

The overlay during operation is the mechanism that makes `[×]` unavailable — no additional per-button disabled state is needed.

### On removal

When an item is removed:
1. The row disappears immediately (no animation in v1 — snappy is correct here).
2. The Working Set count in the status bar updates live.
3. If the Working Set becomes empty, the empty state appears.
4. Screen reader announces: `"[filename] removed. [N] items remain in Working Set."` or `"[filename] removed. Working Set is empty."` if the last item was removed.

---

## Keyboard Interaction

| Key | Action |
|---|---|
| `↑` | Move focus to the previous item. Stops at the top (no wrap). |
| `↓` | Move focus to the next item. Stops at the bottom (no wrap). |
| `Delete` / `Backspace` | Remove the focused item from the Working Set. Focus moves to the next item below; if none, to the item above; if none, to the `[Clear]` toolbar button. |
| `Tab` (on focused row) | Move focus to the `[×]` button of the focused row. |
| `Tab` (on `[×]` button) | Move focus to the next row, or out of the list if last. |
| `Space` / `Enter` (on `[×]` button) | Remove the item. Same behavior as clicking `[×]`. |
| `Enter` (on focused row) | Open the file in its default system application. |
| `Space` (on focused row) | No action. Items are not selectable within the Working Set. |
| `Escape` | Move focus to the operation button in the toolbar. |

**No wrap on `↑`/`↓`.** The Working Set is a short, focused list. Wrapping adds confusion in a small list — the user knows when they've reached the top or bottom.

---

## Accessibility Checklist

- [ ] Each item is a `<li>` within a `<ul aria-label="Working Set contents">`
- [ ] Item accessible name: `"[filename], [type], [duration if present]"` — not filename alone
- [ ] No origin/status indicators (none needed — no color-only signals to check)
- [ ] `[×]` button accessible name: `"Remove [filename] from Working Set"`
- [ ] `[×]` is not `aria-disabled` during operation — the modal overlay (`aria-modal="true"`) prevents interaction at the container level
- [ ] Removal announced: `aria-live="polite"` on the list container — `"[filename] removed. 4 items remain in Working Set."` / `"[filename] removed. Working Set is empty."`
- [ ] Working Set count in status bar is a separate live region (already specified in Task 3) — updates independently of the removal announcement
- [ ] `Delete`/`Backspace` to remove is documented (not visible in UI — keyboard-only convention for power users)
- [ ] Focus management on removal: moves predictably (next item, then previous, then toolbar) — announced as focus lands

---

## Open Questions

_None. Raised by agent if anything surfaces during implementation._

---

_Next: Task 6 — Selection Model & Interaction_
