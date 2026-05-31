# Keyboard Navigation Map

_Task 13 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

This is the canonical keyboard map for the Digital Asset Manager. It is the source of truth for implementation and accessibility review. Every shortcut in the core loop is documented here. Gaps and unresolved decisions are identified explicitly — gaps requiring a decision are in **Open Questions**; gaps that are structural (no keyboard path yet exists) are flagged inline.

**Core loop covered:** Select assets → transfer to Working Set → choose operation → configure → run → inspect outcome → recurse.

**Scope:** Application shell, Library pane, Working Set pane, Operation modal (Palette, Config, Running, Complete). macOS only (v1).

---

## Decisions Resolved Here

These open questions were explicitly forwarded to Task 13 from prior specs.

### `⌘→` conflict check (forwarded from Task 7)

**Resolved: `⌘→` is safe to use for transfer.**

In macOS, `⌘→` is "move cursor to end of line" in text editing contexts. It has no standard binding in custom list views (NSTableView or equivalent). The Library asset list is a custom list component; `⌘→` is unassigned in that context. No conflict with the other established shortcuts in this app (`Enter`, `Space`, `⌘A`, `⌘1`, `⌘2`, `Escape`).

`⌘→` is confirmed as the primary transfer shortcut.

### Escape precedence in Library search input (forwarded from Task 6)

**Resolved: two-step Escape in search.**

| State | Escape behavior |
|---|---|
| Search input focused, field has text | Clears the search text. Focus stays on the search input. The list updates to show all items (or all filtered items if filters are active). |
| Search input focused, field is empty | Moves focus to the asset list. Selects nothing. |
| Asset list focused (no modal open) | Deselects all. Focus stays on the current list item. Anchor cleared. |

This resolves the precedence question from Task 6: "if focus is in the list and search is active, Escape clears search (not selection)." Corrected here: if focus is **in the search input**, Escape acts on the search field. If focus is in the **list**, Escape deselects. These are separate states — focus determines which action fires.

### `Home` / `End` in the Operation Palette list (forwarded from Task 8)

**Resolved: confirmed.**

`Home` and `End` jump to the first and last items in the palette operation list. Standard list navigation; no reason to exclude. Also applies to the Library asset list and the Working Set item list.

### Library search focus shortcut

**Resolved: `⌘F` focuses the Library search input.**

Used without definition in verification scenarios in Tasks 6 and 7. Formally defined here. Fires from anywhere in the Library pane; also fires from the Working Set pane (cross-pane shortcut, consistent with `⌘1`/`⌘2` for pane switching). Focus moves to the Library search input and the Library pane becomes active.

`⌘F` is a standard "Find" shortcut on macOS; the user will expect it to go to search. If the search input is already focused, `⌘F` is a no-op.

### Modal entry shortcut (forwarded from Task 8)

**Resolved: `Return` when Working Set items list has focus.**

WS items have no other `Return` action (they don't open anything). `Return` means "I'm done building this set — proceed." Disabled (no-op) when the Working Set is empty, consistent with the operation button being disabled when the WS is empty.

This shortcut fires only when focus is within the WS items list. When focus is on the `[⚡ Select Operation ▾]` button itself, `Space` or `Return` activates the button normally (standard button behavior).

### Working Set item keyboard removal (forwarded from Task 8 / Task 5)

**Resolved: `Delete` or `Backspace` when a WS list item has focus.**

Standard macOS list removal pattern (Finder, Notes, Reminders). Faster than Tab-navigating to each × button. `Delete` is not defined in the Library list — it is specific to the Working Set, where items can be removed. Fires the same action as clicking ×. Announces: `"Removed. [N] items remain in Working Set."` No undo — consistent with the no-undo decision from Task 11.

---

## Global Shortcuts

These fire from anywhere in the app (outside of the operation modal).

| Shortcut | Action | Notes |
|---|---|---|
| `⌘1` | Activate Library pane; focus restores to last-focused element in that pane | Focus goes to search input if no previous element focused |
| `⌘2` | Activate Working Set pane; focus restores to last-focused element | Focus goes to `[⚡ Select Operation ▾]` button if no previous element focused |
| `⌘F` | Focus Library search input; Library pane becomes active | No-op if search input already focused |
| `⌘→` | Transfer (see Library Pane — Asset List) | Only fires when Library pane is active and list has focus |

---

## Library Pane

### Search Input

| Key | Action |
|---|---|
| Any printable character | Enters search mode; list filters as user types |
| `↓` | Moves focus from search input to first item in the asset list |
| `Escape` (field has text) | Clears the search text; focus stays on search input |
| `Escape` (field is empty) | Moves focus to asset list; no selection change |
| `Tab` | Moves focus forward: search input → filter button → sort control → asset list → settings icon |
| `Shift+Tab` | Reverse tab order |

### Asset List

The asset list is a single tab stop. Arrow keys navigate within it.

| Key | Action | Notes |
|---|---|---|
| `↑` | Move focus up one item | No selection change; no wrap at top |
| `↓` | Move focus down one item | No selection change; no wrap at bottom |
| `Home` | Move focus to first item in the list | — |
| `End` | Move focus to last item in the list | — |
| `Page Up` | Move focus up by approximately one viewport of items | Platform scroll behavior |
| `Page Down` | Move focus down by approximately one viewport of items | Platform scroll behavior |
| `Space` | Toggle selection of focused item (additive) | Does not change focus |
| `Shift+↑` | Extend selection range upward from anchor | Anchor does not move |
| `Shift+↓` | Extend selection range downward from anchor | Anchor does not move |
| `⌘A` | Select all items in current view (filtered set, or full library) | Announces: `"All [N] items selected"` or `"All [N] filtered items selected"` |
| `Escape` | Deselect all; anchor cleared; focus stays on current item | Announces: `"Selection cleared"` |
| `Enter` | Open focused item in default system app | Does not change selection |
| `⌘→` | Transfer selected items to Working Set (or focused item if no selection) | See Transfer section below |

#### Transfer via `⌘→`

| Library state | Result |
|---|---|
| One or more items selected | Transfers the full selection in Library visual order |
| No items selected; focus on a list item | Transfers the focused item only |
| Library empty | No-op; no announcement |

Announcement fires via `aria-live="assertive"`. See Task 7 for full announcement strings (duplicate handling, mixed cases).

---

## Working Set Pane

### Pane-Level

| Key | Action |
|---|---|
| `Tab` | Cycles: `[⚡ Select Operation ▾]` → `[Clear]` → WS items list → back to `[⚡ Select Operation ▾]` |
| `Shift+Tab` | Reverse cycle |

The `[⚡ Select Operation ▾]` button opens the modal at:
- Palette step — if no operation is currently configured
- Config step — if an operation is already configured

`[Clear]` is only enabled when the Working Set has items. Fires immediately, no confirmation. Announces: `"Working Set cleared."` Status bar count updates to `0`.

### Working Set Items List

| Key | Action | Notes |
|---|---|---|
| `↑` | Move focus to previous item | No wrap at top |
| `↓` | Move focus to next item | No wrap at bottom |
| `Home` | Move focus to first item | — |
| `End` | Move focus to last item | — |
| `Return` | Open the operation modal | Palette step if no operation configured; Config step if operation configured. No-op when WS is empty. |
| `Delete` or `Backspace` | Remove focused item from Working Set | Announces: `"Removed. [N] items remain in Working Set."` No undo. |

When the list becomes empty, it announces: `"Working Set is empty."`

---

## Operation Modal

The modal is a single container that transitions between four internal states. Escape closes the modal in all states except Running (where it triggers the abort confirmation).

### Palette Step

| Key | Context | Action |
|---|---|---|
| (modal opens) | — | Focus moves to search input |
| Any printable character | Search focused | Filters operation list instantly |
| `↓` | Search focused | Moves focus to first list item |
| `↑` | First list item focused | Returns focus to search input |
| `↑` | Other list item focused | Moves focus to previous item |
| `↓` | List item focused | Moves focus to next item; no wrap at bottom |
| `Home` | List focused | Moves focus to first list item |
| `End` | List focused | Moves focus to last list item |
| `Return` | List item focused | Selects operation; transitions modal to Config step |
| `Return` | Search focused, exactly one result visible | Selects that result; transitions to Config step |
| `Tab` | Anywhere in palette | Cycles: search input → list (as single stop) → `[×]` → back to search |
| `Shift+Tab` | Anywhere in palette | Reverse cycle |
| `Escape` | Any | Closes modal; focus returns to `[⚡ Select Operation ▾]` button |
| `Backspace` | Search focused | Deletes last character in search field (standard text editing) |

Search result count is announced via `aria-live="polite"` as the list changes.

### Config Step

| Key | Action | Notes |
|---|---|---|
| (step opens) | Focus → first parameter input; or `← Change operation` if no parameters | — |
| `Tab` | Cycle forward: `← Change operation` → parameter inputs (in DOM order) → `[Browse…]` (if Flavor A) → `Save as named…` → `[Run ⚡]` → `[×]` → back to `← Change operation` | — |
| `Shift+Tab` | Reverse cycle | — |
| `⌘Return` | Run the operation; transitions modal to Running state | Fires from anywhere in the Config step (handler on modal container) |
| `Escape` | Close modal; parameter values preserved | If save-as input is active: closes the input only; modal remains open |
| `↑` / `↓` (in numeric field) | Increment / decrement by plugin-declared step | — |
| `Shift+↑` / `Shift+↓` (in numeric field) | 10× step | — |
| `Space` (on toggle) | Toggle the value | — |
| `Return` (in save-as name input) | Confirm save | — |
| `Escape` (in save-as name input) | Cancel save; modal stays open | — |

Focus returns to `[⚡ Select Operation ▾]` button when modal is closed via Escape or `[×]`.

`← Change operation` navigates back to Palette step. Clears current parameter config. Focus moves to search input in the Palette step.

### Running State

| Key | Action | Notes |
|---|---|---|
| `Tab` | Cycles to `[Abort]` button and `[×]` | `[×]` is renamed `Abort` in aria-label during this state |
| `Escape` | Opens inline abort confirmation | Does not close modal |
| `[Abort]` activated (Space/Return) | Opens inline abort confirmation | — |
| `[×]` activated (Space/Return) | Same as `[Abort]` | |

**Abort confirmation (inline footer):**

| Key | Action |
|---|---|
| (confirmation appears) | Focus → `[Keep running]` button |
| `Tab` | Cycles between `[Keep running]` and `[Abort]` buttons |
| `Space` / `Return` on `[Keep running]` | Dismisses confirmation; operation continues |
| `Space` / `Return` on `[Abort]` | Confirms abort; operation stops |
| `Escape` | Dismisses confirmation; equivalent to `[Keep running]` |

### Complete / Cancelled State

| Key | Action | Notes |
|---|---|---|
| (state opens) | Focus → `[Close]` button | Announced via assertive live region |
| `Tab` | Cycles to `[Load output into Working Set]` link (Flavor A only), then `[Close]` | — |
| `Space` / `Return` on `[Close]` | Closes modal; focus returns to `[⚡ Select Operation ▾]` button | — |
| `Escape` | Closes modal | Same as `[Close]` |
| `Space` / `Return` on `[Load output into Working Set]` | Transfers output items to Working Set; modal closes | Flavor A only |

---

## Tab Order — Each Major Surface

### Application (no modal)

```
[Library search input]
  → [+ Filter ▾]
  → [Sort control]
  → [Library asset list]       (↑/↓ navigate within)
  → [⚙ settings icon]
  → [⚡ Select Operation ▾]
  → [Clear]
  → [WS items list]            (↑/↓ navigate within)
  → [Library search input]     (wraps)
```

The status bar has no interactive elements and is excluded from the tab order.

The pane divider is decorative and excluded from the tab order.

### Operation Modal — Palette Step

```
[Search input]                 (auto-focused on open)
  → [List]                     (single tab stop; ↑/↓ within; Home/End to first/last)
  → [×]
  → [Search input]             (wraps)
```

### Operation Modal — Config Step

```
[← Change operation]
  → [Parameter input 1]
  → [Parameter input 2]        (…additional inputs in declaration order)
  → [Browse…]                  (Flavor A output destination only)
  → [Save as named…]
  → [Run ⚡]
  → [×]
  → [← Change operation]      (wraps)
```

When the save-as input is active, it inserts after `[Save as named…]`:

```
[Save as named…]
  → [Name input]
  → [✓ confirm]
  → [× cancel]
  → [Run ⚡]
```

### Operation Modal — Running State

```
[Abort]
  → [×]
  → [Abort]                    (wraps)
```

When abort confirmation appears:

```
[Keep running]
  → [Abort]
  → [Keep running]             (wraps)
```

### Operation Modal — Complete / Cancelled State

```
[Close]                        (focused on transition)
  → [Load output into Working Set]   (Flavor A only)
  → [Close]                    (wraps)
```

---

## Focus Indicators

All interactive elements use the amber outline pattern established across Tasks 7–9.

| Element type | Focus indicator |
|---|---|
| Asset list item | `outline: 1px solid var(--amber); outline-offset: -1px` (inset) |
| WS list item | Same as asset list item |
| Operation palette row | `outline: 1px solid var(--amber); outline-offset: -1px` |
| Text inputs, numeric fields, file path field | `outline: 1px solid var(--amber); outline-offset: 2px` (outset) |
| Buttons (primary, ghost, text-weight) | `outline: 2px solid var(--amber); outline-offset: 2px` |
| Toggle | `outline: 2px solid var(--amber); outline-offset: 2px` |
| Links and text-weight affordances | `outline: 1px solid var(--amber); outline-offset: 2px` |

**WCAG 2.1 AA compliance:** Amber (`--amber`: `#E8A030` approximately) against the dark panel background (`--panel`: approximately `#1A1A1A`) achieves a contrast ratio well above the 3:1 minimum for non-text focus indicators (WCAG 2.1 SC 1.4.11). The 1px minimum is the floor; 2px is preferred for buttons.

**Inactive pane dimming:** When a pane is inactive (`opacity: 0.85`), focused elements within it must still meet contrast requirements at the dimmed opacity. Amber at 85% opacity against the dark panel still passes 3:1. If pane dimming becomes more aggressive in a future iteration, this must be re-evaluated.

---

## Core Loop End-to-End Walkthrough (Keyboard Only)

Starting condition: app launched, focus on Library search input, Working Set empty.

### Phase 1: Find and Select Assets

1. **Type a search query** in the focused search input → Library filters to matching items
2. `Escape` (field non-empty) → clears search text; or `Escape` (field empty) → focus moves to asset list
3. `⌘F` → re-focus search if needed; `Escape` → back to list
4. `↓` → navigate to first target item
5. `Space` → select it; count updates: `"1 item selected"`
6. `↓` (N times) → move focus to next target item
7. `Space` → add to selection
8. Repeat until selection complete; or `⌘A` to select all filtered items

### Phase 2: Build the Working Set

9. `⌘→` → transfers selection to Working Set
10. Announcement: `"[N] items added. Working Set now contains [N] items."`
11. Repeat Phases 1–2 as needed (sorting, re-filtering, adding more)

### Phase 3: Choose and Configure an Operation

12. `Return` (WS list focused) → operation modal opens at Palette step; focus on search input
13. Type operation name → list filters
14. `↓` → focus on target operation
15. `Return` → Config step opens; focus on first parameter input
16. Configure parameters via `Tab` and input-specific keys
17. Check output destination; `Tab` to `[Browse…]` and activate if needed

### Phase 4: Run

18. `⌘Return` → operation starts; modal transitions to Running state

### Phase 5: Inspect Outcome

19. When operation completes: announcement fires; focus moves to `[Close]`
20. Review outcome summary (announced via assertive live region on transition)
21. `Return` or `Escape` → closes modal; status bar shows last-op outcome
22. `⌘F` → focus Library search to find output (or use search hint link if Flavor A)

### Phase 6: Recurse

23. Select new assets in Library → `⌘→` to transfer → modal shortcut → run again
24. Or: `⌘2` → activate Working Set pane → modal shortcut → re-run same operation on existing WS contents

---

## One-Handed Accessibility

The following shortcuts require two keys to be pressed simultaneously:

| Shortcut | Hand requirement |
|---|---|
| `⌘→` (transfer) | Left hand (Cmd) + right hand (→) — or one hand if Cmd is sticky |
| `⌘Return` (run) | Both hands on standard keyboard; one hand possible (thumb + index/middle) |
| `⌘A`, `⌘F`, `⌘1`, `⌘2` | Both reachable left-hand-only |
| `Shift+↑/↓` (range selection) | One hand possible on standard keyboard |

**macOS Sticky Keys** (System Settings → Accessibility → Keyboard) enables one-handed chords. With Sticky Keys active, the user presses Cmd, releases it, then presses the second key. All shortcuts in this map work with Sticky Keys enabled.

No interaction in this app requires three simultaneous keys. No interaction requires simultaneous presses that are impossible on a standard 104-key keyboard with one hand (the most demanding is `⌘→`, which is achievable left-hand on some keyboard layouts).

**Note on `⌘→` for motor-impaired users:** `⌘→` requires coordination across the keyboard. If a user reports difficulty with this chord, the documented alternatives are:
- Tab to the `[⚡ Select Operation ▾]` button and open the modal without selecting items first — only works if the WS already has items
- Activate accessibility keyboard (macOS on-screen keyboard) — no chord constraints
- Switch Focus Mode (future: drag-only path via mouse, which some users with motor impairments handle better than key chords)

No new shortcuts are introduced for v1 to address this. If usage data shows `⌘→` is a barrier, a single-key transfer shortcut (e.g., `T` when Library list has focus) can be added in a future iteration.

---

## Gaps Identified

| Surface | Gap | Status |
|---|---|---|
| Library pane | Import mechanism (keyboard path to add files) | Out of scope — depends on import spec (flagged in Task 12 open questions) |
| Settings panel | No keyboard shortcut to open settings beyond Tab to settings icon | Not a gap for v1 — Tab access is sufficient; shortcut can be added with settings spec |
| Select dropdown (Config) | Native macOS `<select>` — keyboard behavior is platform-native, not specified here | Not a gap — macOS select keyboard behavior (arrow keys, Space to open) is platform-defined |

---

## Accessibility Checklist

- [ ] All shortcuts in this map are documented in the implementation keyboard shortcut registry
- [ ] `Return` in WS list fires modal-open only when WS is non-empty; no-op when empty
- [ ] `Delete`/`Backspace` in WS list fires only when WS list has focus (not in Library list)
- [ ] `⌘→` is bound only when Library asset list has focus (not in search input, not in modals)
- [ ] `⌘Return` fires Run only when the operation modal is open at the Config step
- [ ] `Escape` Behaviour is context-sensitive and follows the two-step precedence for search input
- [ ] Focus returns to the triggering element when modals close (the `[⚡ Select Operation ▾]` button)
- [ ] Tab order matches the documented order for each surface
- [ ] Focus indicators meet WCAG 2.1 AA contrast at both active and inactive pane opacity
- [ ] `Home`/`End` are implemented in Library list, WS list, and Palette list
- [ ] Screen reader announcements fire for all keyboard actions listed in Task 7 (transfer), Task 6 (selection), and Task 10 (operation progress)
- [ ] Sticky Keys tested: all shortcuts work without simultaneous key press

---

---

_Next: post-Task-13 review; plan assessment of remaining work._
