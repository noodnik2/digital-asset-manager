# Operation Palette

_Task 8 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

The operation palette is the **first step of the operation modal** — the view where the user browses and selects what to do with their Working Set.

> **Plan deviation:** §Task 8 in the design plan described the palette as "a fixed panel, always visible, not triggered or modal." Subsequent user direction (2026-05-23, decisions log) established the button-triggered modal model: "No fixed operation zone in Working Set" and "Operation execution lives in a modal (config → running → complete)." This spec follows the later decisions.

**Scope:** This spec covers the palette step only. The modal's config, running, and complete states are defined in Tasks 9 and 10. The operation button that triggers the modal is defined in Task 3.

---

## Modal Context

The operation modal is a single persistent overlay with four internal states:

| Step | State | Task |
|---|---|---|
| 1 | **Palette** — browse and select an operation | This spec |
| 2 | **Config** — configure parameters | Task 9 |
| 3 | **Running** — operation in progress | Task 10 |
| 4 | **Complete** — outcome summary | Task 10 |

The modal does not close between steps. It transitions internally. `Escape` closes the modal at any step except Running (where it opens an inline abort confirmation per Task 10).

---

## Entry Points

| Trigger | Modal opens at |
|---|---|
| Button click: `[⚡ Select Operation ▾]` (no operation configured) | Palette step |
| Button click: `[⚡ Operation Name ▾]` (operation configured) | Config step (Task 9) |
| `← Change operation` link from Config step | Palette step, with current operation focused |

When returning from Config to Palette: the previously selected operation is focused in the list. Scroll position is adjusted to make the focused item visible. The search input is empty.

---

## Dimensions & Appearance

| Property | Value | Rationale |
|---|---|---|
| Width | 480px | Wider than inspector panels (280–320px); modal is a focused overlay, not chrome. Fits the longest expected operation name + description without truncation. |
| Max-height | 60vh | List scrolls internally; modal height doesn't grow unbounded |
| Border-radius | `--r-lg` (8px) | |
| Backdrop | `rgba(0,0,0,0.6)` — no blur | Per taste profile: "Blur reads as consumer iOS; we want tool." |
| Shadow | `--shadow-2` (`0 8px 24px rgba(0,0,0,0.5)`) | Modal elevation |
| Background | `--panel` | One step up from canvas |
| Open animation | `opacity: 0→1 + translateY(4px→0)`, 180ms, `--ease` | Per taste profile: `--dur-base`, fade + 4px translate |
| Open animation (reduced motion) | Instant | |

---

## Layout

```
┌───────────────────────────────────────────────────────┐
│  Select Operation                              [×]    │  ← header, 48px
│  ───────────────────────────────────────────────────  │
│  [🔍 Search operations...                        ]    │  ← search, 36px
│  ───────────────────────────────────────────────────  │
│                                                       │
│  SAVED                                                │  ← section label (shown only if user has saved ops)
│    ★  [Named Config A]                                │
│       Brief description of what this saves            │  ← 48px rows
│    ★  [Named Config B]                                │
│       Brief description                               │
│  ───────────────────────────────────────────────────  │
│  AVAILABLE                                            │  ← section label
│    [Operation A]                                      │
│       Brief description, truncated if long…           │  ← 48px rows
│    [Operation B]                                      │
│       Brief description                               │
│    [Operation C]                                      │
│       Brief description                               │
│                                  ↑ scrollable region  │
└───────────────────────────────────────────────────────┘
```

The search and header are fixed. The list below the search divider is the scroll region.

---

## Section Structure

### SAVED

User-named operation configurations (created in Task 9). Displayed first, before the Available list.

- **Shown only when the user has at least one saved configuration.** Hidden when empty — there is no "You have no saved operations" placeholder inside the section. If both the user and the current file type combination produce no saved ops, the section is simply absent.
- **Sorted alphabetically** by the user-assigned name.
- **Prefix:** `★` (Unicode, `--amber`) before the operation name.
- The SAVED section is designed into the palette now; the creation flow is defined in Task 9.

### AVAILABLE

All operations compatible with the current Working Set content.

- **Always present** when the palette is open, unless no compatible operations exist (see Empty State).
- **Sorted alphabetically** by operation name. No grouping by category in v1 — search handles large sets.
- Section label shown even when SAVED is absent (the label provides orientation, especially when returning from Config with a focused item).

No "Recent" section in v1. For a power user who knows their operation vocabulary, search by name is faster than scanning a recency list. The common case — returning from Config to change an operation — already pre-focuses the last-selected operation. Recency as a UI section is ceremony; it can be added if usage shows genuine churn between operations.

---

## Operation Row Anatomy

Each operation occupies a **48px two-line row**. This departs from the 36px dense standard (`--row-h`) used in Library and Working Set lists. The departure is intentional: the palette is a focused selection modal, not a persistent scanning surface, and operations need enough vertical space for names and descriptions to scan without crowding. Legibility here prevents wrong selections.

```
  [name]                                               ← --snow, --font-sans, 14px, weight 500
  [Description from plugin. Truncated with … if long]  ← --fog, --font-sans, 12px
```

| Element | Style |
|---|---|
| Name | `--snow`, `--font-sans`, 14px, weight 500 |
| Description | `--fog`, `--font-sans`, 12px, single line, truncated at row edge |
| Row background (rest) | `--surface` |
| Row background (hover) | `--raised` |
| Row background (keyboard focused) | `--raised` + amber outline: `outline: 1px solid var(--amber); outline-offset: -1px` |
| Row background (selected, on return from Config) | `--raised` + 2px amber left inset (selection rail pattern) |
| Padding | 12px 16px |

Named operation rows follow the same anatomy, with `★ ` prepended to the name in `--amber`.

No "last used" indicator per row. If the SAVED section is not present and Recent is absent, there is no recency signal in the palette — that is acceptable. The user selects by name.

---

## Content-Type Filtering

An operation appears in the palette **only if it declares compatibility with ALL item types present in the Working Set.**

- WS contains only type A → palette shows operations compatible with A
- WS contains types A and B → palette shows operations compatible with A **and** B
- WS contains a type with no registered plugin → no operations qualify from that type's requirements

This rule is strict. It means the palette shows exactly what will execute without ambiguity. Mixed-type Working Sets narrow the palette. The user may need to clear one type from the Working Set if they want an operation that only supports a subset.

Filtering is **implicit** — the list shows what is available, with no explanation of what was excluded and why. The power user who gets a shorter list than expected knows to check their Working Set composition.

---

## Search

**Search input is autofocused when the palette step opens.**

Behavior:
- Instant filter as the user types — no debounce (local data, no network)
- Filters on both operation name and description text
- Case-insensitive, matches anywhere in the string (not just prefix)
- When filtering is active: section headers (SAVED, AVAILABLE) are hidden; results appear as a flat list, Saved operations still shown first (with `★`) followed by Available matches, alphabetical within each group
- Clearing the search query: section structure returns

Navigation from search:
- `↓`: focus moves to the first list item
- `Escape`: closes the modal (does not clear search first — no intermediate step)

Navigation returning to search:
- `↑` from the first list item: focus returns to the search input

### Empty Search Results

```
  No operations match.
```

Centered in the list area, `--fog`, 14px. No icon. No call to action. If there are truly no matching operations, the user clears the search (Backspace) and looks again.

---

## Empty Palette State (No Compatible Operations)

When the Working Set has items but no operations are registered that are compatible with all types in the basket:

```
  No operations available for the current items.

  A plugin that supports this file type is required.
```

Centered in the list area. `--fog`, 14px. Two lines: the problem, then the path forward. No button, no link — the user must dismiss the modal and address the plugin situation outside it.

---

## Keyboard Navigation

| Key | Context | Action |
|---|---|---|
| (modal opens) | — | Focus → search input |
| `↓` | Search focused | Move focus to first list item |
| `↓` | List item focused | Move focus to next item; no wrap at bottom |
| `↑` | First list item focused | Return focus to search input |
| `↑` | Other list item focused | Move focus to previous item |
| `Return` | List item focused | Select operation → advance to Config step |
| `Return` | Search focused, one result visible | Select that result → advance to Config step |
| `Escape` | Any (palette step) | Close modal. Operation state unchanged. |
| `Tab` | Anywhere in palette | Cycles: search → list items → [×] → back to search |
| `Shift+Tab` | Anywhere in palette | Reverse cycle |

`Home` / `End` to jump to first/last list item is a reasonable addition but left to Task 13 to confirm.

---

## Selecting an Operation

When the user presses `Return` on a list item or clicks a row:

1. The modal content transitions to the Config step (Task 9)
2. Transition: content swap — the modal container does not close or resize; the palette content is replaced by the config content
3. Animation: no transition animation on the content swap. The container is already visible; fading or sliding the interior content adds 180ms of delay to a frequent, deliberate action. The visual change itself is sufficient feedback.
4. Reduced motion: same (no-op — no animation to strip)

---

## Keyboard Shortcut to Open the Modal

A keyboard shortcut to open the operation modal from keyboard focus within the Working Set pane is required for keyboard-only users. The exact key is assigned in Task 13. This spec assumes the shortcut exists; the verification scenario below references it as `[modal shortcut]`.

---

## Accessibility

- [ ] Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the "Select Operation" header
- [ ] On open: focus moves to search input (not to the close button or the list)
- [ ] On close (`Escape` or [×]): focus returns to the `[⚡ Select Operation ▾]` button that triggered it
- [ ] Operations list: `role="listbox"`, `aria-label="Available operations"`
- [ ] Each operation row: `role="option"`, `aria-selected="false"` (none pre-selected) or `aria-selected="true"` when returning from Config with a pre-focused item
- [ ] SAVED / AVAILABLE section headers: `role="presentation"` — decorative labels, not interactive, not part of the option set
- [ ] Search input: `aria-controls` pointing to the operations listbox; `aria-label="Search operations"`
- [ ] Search result count: live region (`aria-live="polite"`) — announces `"3 operations match"` when search is active and results change
- [ ] [×] close button: `aria-label="Close operation palette"`, keyboard-accessible
- [ ] Named operation `★` prefix: the star is decorative; the accessible name of the row is the operation name only, not "star [name]"
- [ ] Empty state ("No operations match"): announced by the live region as the count drops to zero
- [ ] On operation selection: no explicit announcement — the Config step content and its own focus management (Task 9) provides orientation
- [ ] Backdrop click closes the modal; same result as `Escape`

---

## Verification: Find and Launch in ≤ 5 Keystrokes

**Starting condition:** Working Set has items, palette step is open, search is focused. (Modal entry shortcut is defined in Task 13 and is not counted here.)

**Path — user knows the operation name:**

1. Type 3 characters of the operation name → list filters to 1–3 matches (3 keystrokes)
2. `↓` → focus moves to the first result (1 keystroke)
3. `Return` → Config step opens (1 keystroke)

**Total: 5 keystrokes.** Config step is open with the correct operation loaded.

**Path — operation is already configured (most common case):**

When the user clicks `[⚡ Operation Name ▾]` with an operation already configured, the modal opens at Config — the palette is bypassed entirely. This is the zero-keystroke palette path: the user pressed one button and is already at Config.

**Path — browsing without a search term:**

1. (palette opens, focus on search)
2. `↓` → first list item focused (1 keystroke)
3. `↓` (N times) → navigate to the target operation
4. `Return` → select

This is slower than search-by-name and is the fallback for users who don't know the exact name. It is not the optimized path, and the spec makes no claim that it's ≤ 5 keystrokes for a large operation set.

---

## Open Questions

- **Modal entry shortcut:** Which key opens the operation modal from Working Set pane focus? Candidates: `Return` (conflicts with nothing in the WS — WS items aren't interactive beyond `×`), `⌘↩` (affirmative pattern), `O` (mnemonic for "operation"). Task 13 resolves.
- **Operation provider attribution:** Should the palette show which plugin provides an operation (e.g., a small provider label)? Relevant when multiple plugins are installed and share similar operation names. Deferred — not enough data in v1 to know if this adds value or clutter.
- **Named operation name collision:** If two saved configs have the same user-assigned name, how does the SAVED list disambiguate? Probably prevent duplicate names at creation time (Task 9). Flag for Task 9 to address.

---

_Next: Task 9 — Operation Configuration Panel_
