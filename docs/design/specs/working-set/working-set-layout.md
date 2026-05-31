# Working Set Pane — Layout & Zone Structure

_Task 3 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Overview

The Working Set is a session basket. The user fills it deliberately from the Library, chooses an operation, and runs it. Output lands in the Library. The Working Set then sits ready for the next iteration of the loop — the user adds more, changes the operation, or clears it and starts fresh.

The pane has two zones:

1. **Toolbar** — the operation interface: one button that opens the operation modal, one button that clears the basket. Fixed at the top.
2. **Contents list** — the basket itself: everything the user has added. Takes all remaining height. The only scrolling zone in the pane.

There is no persistent operation zone within the pane. The operation palette, configuration, execution progress, and completion summary all live in the Operation Modal (specified in Task 1, detailed in Tasks 8–10). The pane's job is to hold the basket and surface the entry point to operating on it.

---

## Pane Structure

```
┌──────────────────────────────────────┐
│  [⚡ Normalize Velocity ▾]  [Clear]   │  ← toolbar, fixed
│  ──────────────────────────────────  │
│  groove-01.mid   MIDI   3:38         │
│  groove-02.mid   MIDI   2:15         │
│  session-a.mid   MIDI   4:02         │
│                                      │
│                                      │  ← contents list, scrollable
│                                      │
└──────────────────────────────────────┘
```

---

## Toolbar

Fixed at the top of the pane. Same height as the Library toolbar so the two toolbars sit on the same horizontal baseline across the split — a single visual band across the full window width.

### Operation button

```
[⚡ Select Operation ▾]       ← empty or no operation configured
[⚡ Normalize Velocity ▾]     ← operation configured
```

**States:**

| State                                          | Appearance                                    | Behavior                                                       |
|------------------------------------------------|-----------------------------------------------|----------------------------------------------------------------|
| Working Set empty                              | Disabled — muted weight, no interaction       | Not clickable                                                  |
| Working Set has items, no operation configured | Enabled — full weight, `⚡ Select Operation ▾` | Opens operation modal at the palette step                      |
| Operation configured                           | Enabled — full weight, shows operation name   | Opens operation modal pre-loaded with the configured operation |

The button label updates to show the selected operation name as soon as one is chosen — even if the modal was dismissed without running. This answers the verification criterion: the user can see *what operation they're about to run* by glancing at the button, without opening the modal.

The `▾` always indicates that the operation can be changed. The `⚡` icon is part of the button in all states — it is the visual anchor for "this is the action trigger."

**Maximum label length:** Operation names provided by plugins are displayed verbatim. If the name exceeds the available button width, it truncates with an ellipsis: `⚡ Normalize Veloci…`. The full name is shown in the modal. No tooltip on the button itself — the modal is the right place to confirm.

### Clear button

```
[Clear]
```

**States:**

| State                 | Appearance              | Behavior                                             |
|-----------------------|-------------------------|------------------------------------------------------|
| Working Set empty     | Disabled — muted weight | Not clickable                                        |
| Working Set has items | Enabled                 | Empties the Working Set immediately, no confirmation |

Clearing the Working Set is non-destructive — assets remain in the Library. No confirmation required. The operation button resets to `[⚡ Select Operation ▾]` (disabled) after clearing.

**Configured operation on clear:** The selected operation is *not* cleared when the Working Set is cleared. If the user clears the basket, re-adds files, and the operation button still shows `[⚡ Normalize Velocity ▾]`, that is correct and useful — the user may want to run the same operation on a different selection.

---

## Contents List

Everything below the toolbar. Scrollable when contents exceed pane height. Items appear in **order of addition** — the order the user added them from the Library.

No sort control. The Working Set is not a query result — it reflects deliberate choices in the user's own sequence.

### Item anatomy

Each row shows:

```
  [type]  filename                     [duration]  [×]
```

| Element               | Notes                                                                                                                                      |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **Type badge**        | Compact file type label (e.g., MIDI, WAV, JPEG). Same badge as Library Type column.                                                        |
| **Filename**          | Full filename including extension. Primary weight. No folder path — the Working Set is about what you're operating on, not where it lives. |
| **Duration**          | Shared field — `mm:ss` if available, absent entirely if not applicable (no `—` placeholder here; the cell is simply empty).                |
| **Remove button `×`** | Removes the item from the Working Set. Always visible at low opacity (`--fog`); full opacity on hover/focus. Does not delete from Library. |

No secondary metadata line (unlike Library items which show folder path). The Working Set row is intentionally leaner — the user already knows where the files came from.

**Mixed types:** When the Working Set contains multiple file types, each item shows its own type badge. No plugin-specific metadata is shown (no column for fields that only apply to one type). Only Name, Type badge, and Duration (shared).

### Row interaction

Clicking or keyboard-focusing a Working Set item does not open an inspector or navigate away. Items in the Working Set are not interactive beyond selection state (covered in Task 5) and the remove button. The Working Set is not a browsing surface.

---

## Empty State

When the Working Set contains no items:

```
┌──────────────────────────────────────┐
│  [⚡ Select Operation ▾]  [Clear]     │  ← both disabled
│  ──────────────────────────────────  │
│                                      │
│                                      │
│        Select assets from            │
│        the Library to begin.         │
│                                      │
│                                      │
└──────────────────────────────────────┘
```

- Text is centered vertically in the contents area.
- `--fog` color, `--text-small`. No illustration, no icon, no emoji.
- Two lines: a directive, not a label. "Select assets from the Library to begin." tells the user what to do without explaining why.
- The empty state disappears as soon as the first item is added — it does not persist alongside content.

---

## Zone Prominence Through the Loop

The Working Set pane communicates the user's position in the loop through progressive activation — no layout changes, no panels appearing or disappearing.

| Loop step                | What the pane shows                                                                                                                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Session start**        | Empty state. Both buttons disabled.                                                                                                                                                                  |
| **Adding items**         | Items appear in the list as they are added. Clear becomes enabled. Operation button becomes enabled.                                                                                                 |
| **Operation configured** | Button label updates to show operation name. Pane now answers both questions at a glance: what's in the basket, what happens when I run.                                                             |
| **Modal open**           | Both panes are visible behind the modal overlay. The Working Set pane is not dimmed — it remains readable for reference while the user configures the operation.                                     |
| **Operation running**    | Modal shows progress. The pane is readable but not interactive.                                                                                                                                      |
| **Operation complete**   | Modal shows completion summary. User dismisses modal. The Working Set pane is unchanged — items remain in the basket; the user decides what to do next. The app does not auto-clear or auto-suggest. |
| **User clears, loops**   | `[Clear]` empties the list. Empty state returns. Operation name persists in the button. Loop restarts.                                                                                               |

The pane never hides, collapses, or changes its structure. Prominence shifts are expressed purely through button state (disabled → enabled → labelled) and list content (empty → populated).

---

## Status Bar Behavior (Working Set count)

The status bar at the bottom of the window shows the Working Set count. When the Working Set is empty, the count field shows nothing — not "0 items." The absence of a count communicates emptiness without redundancy alongside the empty state in the pane itself.

When items are present: `3 items` in `--font-mono --text-small --fog`. Updates live on every add/remove.

---

## Accessibility Checklist

- [ ] Contents list is a landmark region (`role="complementary"`, `aria-label="Working Set"`)
- [ ] Working Set item count is a live region: `aria-live="polite"` announces changes — `"1 item added. Working Set now contains 4 items."` / `"Working Set cleared."`
- [ ] Operation button `aria-disabled="true"` when Working Set is empty; `aria-disabled="false"` when enabled
- [ ] Operation button accessible name reflects current state: `"Select operation"` or `"Normalize Velocity — change operation"`
- [ ] Clear button `aria-disabled="true"` when Working Set is empty
- [ ] Each item's remove button has an accessible name: `"Remove groove-01.mid from Working Set"`
- [ ] Remove action announces result: `"groove-01.mid removed. 3 items remain in Working Set."`
- [ ] Empty state text is announced when the list transitions to empty: `"Working Set is empty."`
- [ ] Tab order within the pane: Operation button → Clear button → item 1 (with its remove button) → item 2 → …
- [ ] Operation button state change (disabled → enabled) is announced when the first item is added

---

## Keyboard Interactions (Working Set pane, Task 3 scope)

| Key                                      | Action                                          |
|------------------------------------------|-------------------------------------------------|
| `⌘2`                                     | Focus Working Set pane (activates it)           |
| `Tab` / `Shift+Tab`                      | Navigate between toolbar buttons and list items |
| `Space` / `Enter` on operation button    | Open operation modal                            |
| `Space` / `Enter` on Clear button        | Clear Working Set                               |
| `Delete` / `Backspace` on a focused item | Remove item from Working Set                    |
| `Space` / `Enter` on remove `×` button   | Remove item from Working Set                    |

Full keyboard nav within the list (arrow keys between items, multi-select) is covered in Tasks 5 and 6.

---

## Open Questions

_None. Raised by agent if anything surfaces during implementation._

---

_Next: Task 4 — Asset List Item — Library Component_
