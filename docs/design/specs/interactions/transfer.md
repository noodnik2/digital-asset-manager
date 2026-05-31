# Library → Working Set Transfer

_Task 7 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

Transfer is the gesture that moves Library items into the Working Set. It is performed constantly — many times per session — so it must be fast, predictable, and fully keyboard-operable without ceremony.

**Scope:** This spec covers the act of moving items from the Library into the Working Set. Selection of those items is defined in Task 6. Working Set item anatomy is defined in Task 5. Operation execution is defined in Task 10.

---

## Conceptual Model

Transfer always reads from the Library selection. If items are selected, the shortcut transfers the full selection. If no items are selected, the shortcut transfers the focused item — preventing a no-op on the common single-item case where the user is looking at one file and wants to add it without a separate select step.

Items enter the Working Set in **Library visual order at the time of transfer** — top-to-bottom as currently displayed. Sort order at transfer time determines Working Set order. Selection order (the sequence in which the user accumulated items via Space/click) does not affect Working Set order — Library order is the stable, predictable reference.

---

## Primary Transfer Gesture

**Keyboard shortcut: `⌘→`**

The Working Set is spatially to the right of the Library. `⌘→` maps directly to that direction. This is unambiguous with all established shortcuts: `Enter` (opens in system app), `Space` (toggles selection), `⌘A` (select all), `Escape` (deselect).

Task 13 owns the canonical keyboard map; `⌘→` is the candidate assigned here and must be confirmed there.

---

## Secondary Gesture: Drag and Drop

Drag-and-drop is supported as a secondary affordance.

**Drag source:** Any Library list item — selected or not.

**Drop target:** Anywhere in the Working Set contents list. The toolbar is not a drop target.

**What drags:**

| Drag source state | What transfers |
|---|---|
| Drag a selected item | The full current selection (all selected items) |
| Drag an item not in the selection | That item only — does not expand or replace the current selection |

Dragging an unselected item transfers that item only. This matches macOS convention and prevents accidentally transferring a large selection when the user intended a single-item drag.

**Drop feedback:** The Working Set contents list shows a drop-acceptance state (2px amber top border, matching the active-pane indicator convention) when a valid drag enters the target. The cursor changes to indicate acceptance.

**Keyboard alternative:** `⌘→` (above). No other alternative needed — drag-and-drop is a convenience affordance, not the primary path.

---

## No Row-Level Hover Affordance

There is no `[+]` button on Library rows. Row-level add buttons would add interactive noise to a list that may show hundreds of items, contradicting the scan-density principles established in Task 4 (null fields render as empty cells; no "—" filler). The shortcut and drag cover all single-item and multi-item cases without row-level decoration.

---

## What Transfers

| Library state | Gesture | What transfers |
|---|---|---|
| Items selected | `⌘→` | The full selection |
| No items selected, focus on an item | `⌘→` | The focused item only |
| Library empty (no items at all) | `⌘→` | No-op, no announcement |
| Items selected | Drag any selected item | The full selection |
| Items selected | Drag an unselected item | That item only |
| No items selected | Drag an item | That item only |

---

## Duplicate Handling

The Working Set never contains duplicate items. If an item being transferred is already in the Working Set, it is silently skipped.

The transfer announcement accurately reflects what actually changed:

| Situation | Announcement |
|---|---|
| All items new | `"[N] items added. Working Set now contains [total] items."` |
| Mixed (some new, some duplicates) | `"Added [N] items. [M] already in Working Set."` |
| All duplicates | `"All [N] selected items already in Working Set."` |
| Single item, new | `"1 item added. Working Set now contains [total] items."` |
| Single item, duplicate | `"[filename] already in Working Set."` |

No visual indicator flashes on the existing row. A duplicate is a non-event; motion on a non-event is noise.

---

## Feedback

### Status Bar

The Working Set count in the status bar updates immediately on transfer. This is already a `aria-live="polite"` region (established in Task 3). No additional live region is needed for the count — the status bar owns it.

### Screen Reader Announcement

A separate `aria-live="assertive"` announcement fires with the transfer result string (see Duplicate Handling table above). `assertive` is appropriate here: transfer is a deliberate, user-initiated action and the result should interrupt to confirm completion.

### Motion — Default (prefers-reduced-motion: no preference)

Items append to the Working Set list with an entrance animation:

- **Duration:** 150ms
- **Properties:** `opacity: 0 → 1` and `transform: translateY(-4px) → translateY(0)` — items "settle down" into their position
- **Stagger (multi-item):** 30ms between each item, applied top-to-bottom in Working Set order
- **Compositing:** transform + opacity only — GPU-composited, no layout triggers

The animation is brief enough to feel responsive, slow enough to confirm that something happened.

### Motion — Reduced (`prefers-reduced-motion: reduce`)

No entrance animation. Items appear immediately at full opacity in their final position. The count update and screen reader announcement still fire — count change is not motion.

---

## Transfer While Operation Modal Is Open

The operation modal sets `aria-modal="true"` on its container, blocking all Library and Working Set pane interaction (established in Task 1). Transfer is unavailable while the modal is open:

- `⌘→` has no effect
- No drag-and-drop target is active in the Working Set

This is consistent with the "operations are modal and synchronous" constraint. There is no need to communicate unavailability — the modal's blocking behavior is self-evident.

---

## Accessibility

- [ ] `⌘→` fires a `aria-live="assertive"` announcement with the transfer result (see Duplicate Handling table)
- [ ] Working Set count in the status bar is a live region — updates immediately and is read automatically
- [ ] Drag-and-drop has `⌘→` as a documented keyboard alternative (Task 13 must map this explicitly)
- [ ] Drop target communicates acceptance state visually (2px amber border) and via live announcement: `"Drop to add to Working Set"` on drag-enter, cleared on drag-leave
- [ ] The focused-item-transfers-when-nothing-selected path is keyboard-native and requires no additional accessibility work — it produces the same announcement as a single-item selection transfer
- [ ] Every pointer transfer path has a keyboard equivalent:

| Pointer | Keyboard |
|---|---|
| Drag selected items to WS | `⌘→` with selection active |
| Drag single unselected item to WS | Navigate with ↑/↓, then `⌘→` (no selection = focused item transfers) |

---

## Verification Scenario: 20 Items, No Mouse

**Path A — Non-contiguous selection then transfer:**

1. `⌘F` → focus Library search input
2. Type a query → list filters to matching items
3. `Escape` → return focus to Library list (filter remains active)
4. `↓` → move focus to first candidate item
5. `Space` → select it; announcement: `"1 item selected"`
6. `↓` (N times) → navigate to next candidate
7. `Space` → add to selection; announcement: `"2 items selected"`
8. Repeat until 20 items selected
9. `⌘→` → transfer
10. Announcement: `"20 items added. Working Set now contains 20 items."`
11. Status bar updates immediately: `"20 items"`
12. Working Set list shows 20 items in Library visual order, each with a 150ms entrance animation (or instant if reduced-motion)

**Path B — Select all filtered then transfer:**

1. `⌘F` → search input
2. Type a query that returns ~20 matching items
3. `Escape` → list focus
4. `⌘A` → select all filtered items; announcement: `"All 20 filtered items selected"`
5. `⌘→` → transfer
6. Announcement: `"20 items added. Working Set now contains 20 items."`

Both paths complete in under 30 keystrokes for 20 items. No mouse required at any step.

---

## Open Questions

- **`⌘→` confirmation:** Task 13 must validate this shortcut against the full keyboard map for conflicts. If a conflict exists, `⌘↩` is the fallback candidate.
- **Large batch performance:** Transferring 200+ items via `⌘A` + `⌘→` — the animation stagger (30ms × 200 = 6 seconds) must be capped. Proposed cap: stagger applies to the first 10 items only; remaining items append instantly after the last animated item settles. This keeps the animation meaningful without being punishing.

---

_Next: Task 8 — Operation Palette_
