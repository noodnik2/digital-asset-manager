# Library Pane — Layout & Information Architecture

_Task 2 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Overview

The Library pane is the source of truth. It shows every asset in the collection. It is always visible, always complete (not filtered by default), and never mutated by operations — output lands back here, it is not removed by operations.

This spec covers: view model, column model, search surface, filter surface, sort model, and how the current view state is communicated.

---

## View Model

**List view only in v1.** No grid view.

The primary use case is selecting assets for operations. That requires scannable metadata in a dense, sortable format. Grid view trades information density for visual identity — useful for image-heavy collections, not for the metadata-first browsing this app requires. Grid view is a future iteration once the plugin layer supports asset-type-specific thumbnails.

**Consequence for the toolbar:** The view toggle (list / grid) defined as TBD in Task 1 is **removed**. The toolbar simplifies without it.

### Revised toolbar contents (left to right)

```
[ 🔍 Search...          ] [+ Filter ▾] [Sort: Date Modified ▾] | 247 items
```

- **Search input** — leftmost, widest element, receives focus on launch
- **[+ Filter ▾]** — button that opens the filter popover; changes to `[Filters ×] (2)` when filters are active — the `(2)` is the count of active filters
- **Sort control** — dropdown with the current sort column + direction arrow (`↓` / `↑`)
- **Separator**
- **Item count** — `247 items` at rest; `12 of 247` when filtered

---

## Column Model

The asset list is a sortable table. Column widths are resizable by dragging the column header border. Column visibility and widths persist across sessions.

Columns are organized in three tiers:

1. **Core** — defined by the app shell; always present for every asset type
2. **Shared** — fields that apply across multiple asset types; reserved and rendered by the app shell, populated by whichever plugin handles each file
3. **Plugin-specific** — declared by the active metadata plugin; only visible when the view contains a single asset type

### Core columns (always present)

| Column | Width (default) | Notes |
|---|---|---|
| **Name** | flexible, min 120px | Filename without extension in primary weight; folder path in `--fog` below it as secondary line. Always pinned — stays visible during horizontal scroll. |
| **Type** | 56px | File type badge derived from extension (e.g., MIDI, WAV, JPEG, MD). Plugins can override the display label. |
| **Tags** | 128px | User-applied tags as pill labels, truncated if multiple |
| **Modified** | 96px | Date modified — `May 22` if current year, `2024-11-03` for older |

### Shared columns (always present)

Fields that apply across multiple asset types. The app shell reserves and renders the column; each plugin populates values for its files. Shows `—` for file types where the field is not applicable.

| Column | Width (default) | Notes |
|---|---|---|
| **Duration** | 72px | Total playback length (`mm:ss`). Populated by audio, video, and MIDI plugins; `—` for images, documents, etc. |
| **Size** | 72px | File size, human-readable (`42 KB`, `8.1 MB`). Sourced from the filesystem; always populated. |

### Plugin-specific columns

Declared by the active metadata plugin for its asset type. Only visible when the current view contains a single asset type — either filtered to it, or the library only contains that type. In mixed-type views these columns are hidden; they would be mostly empty and add noise.

Each plugin-specific field declaration includes:

- **Label** — column header name (the plugin's vocabulary; the app shell renders it verbatim)
- **Type** — `numeric`, `duration`, `string`, `date` — determines sort behavior and filter control type
- **Default width** — in px
- **Default visible** — whether the column appears automatically (`true`) or must be opted into (`false`)
- **Nullable display** — what to show when the field is absent for a given file (`—` is the standard)

The plugin's declared order sets the default column order, inserted between Shared and Tags columns. The user can reorder all columns except Name, which stays pinned.

**Example — MIDI plugin fields (for reference, not part of this spec):**
BPM (numeric, default visible), Tracks (numeric, default visible), Key (string, hidden by default), Time Sig (string, hidden by default), Note Count (numeric, hidden by default)

### Plugin cardinality

Each file type has exactly **one metadata provider plugin** — the plugin that declares columns, populates Library fields, and contributes the plugin filter section. Multiple plugins can support the same file type as **operation providers** — contributing operations to the palette — without affecting Library columns.

If a second plugin attempts to register as a metadata provider for an already-claimed file type, it is rejected at registration time. It can still contribute operations for that type.

### No-plugin fallback

If a file type has no registered metadata provider, the file appears in the Library with core and shared columns only. Duration and Size are populated from the filesystem where possible. Plugin-specific columns are absent. No operations are available for that type in the palette. The Type badge shows the raw file extension.

### Column visibility — automatic and user-overridable

Plugin-specific columns marked `default_visible: true` appear automatically when the plugin's asset type comes into scope — no user setup required. Columns marked `default_visible: false` are available but hidden; the user enables them via right-click on any column header.

### Column constraints

**Per-plugin limits:**

| Constraint | Limit | Rationale |
|---|---|---|
| Max `default_visible: true` columns per plugin | **3** | Prevents plugins from overwhelming the default column set |
| Max total columns declared per plugin | **10** | Caps the "Add Column" submenu at a scannable length |

These are enforced at plugin registration time. Plugins exceeding either limit are rejected with a descriptive error.

**Display limits and overflow:**

There is no hard cap on how many columns the user may enable simultaneously. When enabled columns exceed the available pane width:

- **Name column (120px minimum)** never shrinks further. It is always pinned — it stays on screen as the user scrolls right through other columns. A subtle drop shadow on its right edge signals that the table is scrollable.
- **The asset list becomes horizontally scrollable.** The toolbar — search, filter, sort, item count — stays fixed and does not scroll.
- **No warning is shown** when adding a column causes overflow. The user manages their own layout.

Column widths persist per-session. A user who expands their window benefits from the extra width immediately; no reset required.

### Mixed-type view column behavior

| View state | Columns shown |
|---|---|
| Multiple asset types, no type filter | Core + Shared |
| Filtered to one asset type (or library contains only one type) | Core + Shared + Plugin-specific |

When switching from single-type to mixed view, plugin-specific columns are removed from the header row. Any active sort on a plugin-specific column resets to Modified descending when this happens.

### Column header right-click menu

```
Sort Ascending
Sort Descending
─────────────
Hide Column
Add Column ▶
  ── Core ──────────────────
  File Size
  Date Added
  Path
  ── [Plugin Name] ─────────
  [hidden plugin columns, up to 10 total]
─────────────
Reset Columns to Default
```

"Add Column" is organized by tier. Enabled columns are absent from the submenu. "Reset Columns to Default" restores the initial column set (core + plugin default-visible); it does not reset column widths — use a column resize drag to adjust individually.

### Row height

**Compact:** `--row-h-compact` (32px). One line of text. The secondary folder path in the Name column wraps below in `--text-small --fog`, making the Name column effectively two lines. The row height expands to accommodate: ~46px effective.

For a user with hundreds of assets, information density matters more than breathing room.

---

## Search Surface

### Behavior

- Search input is always visible at top-left of the Library toolbar. Never collapses.
- Results update **instantly** as the user types (debounced 150ms).
- Pressing `Escape` clears the search query and restores the full list.
- `⌘F` / `F` (when Library pane is active) focuses the search input from anywhere in the Library pane. Matches DAW convention.

### Search scope

By default, search matches against:
1. **Filename** (without extension, case-insensitive, substring match)
2. **Tags** (any applied tag that contains the query)

**Advanced search with field prefixes** — power user convention, no UI needed beyond documentation:

| Prefix | Matches |
|---|---|
| `tag:ambient` | Specific tag |
| `field:<value>` | Any plugin-declared field by its label slug (e.g., `bpm:120`, `width:1920`) |
| `field:<min>-<max>` | Range match on numeric/duration fields |
| `field:><value>` | Comparison match on numeric/duration fields |

Core app defines `tag:` only. Plugins register their field slugs so the search parser can route queries correctly. No UI required to discover this in v1; it is documented.

Field prefix syntax only activates when the query contains a recognized prefix — bare queries always search filename + tags.

### Search + filter interaction

Search and filters compose — active filters narrow the set that search operates on. The item count reflects both: `3 of 12 filtered (247 total)` when both are active.

---

## Filter Surface

### Opening the filter popover

`[+ Filter ▾]` button opens a popover below the toolbar. The popover is not a full-width panel — it is a compact overlay that does not push the asset list down.

```
┌──────────────────────────────────┐
│  Add filter                      │
│  ──────────────────────────────  │
│  Asset Type       MIDI, Audio... │  ← multi-select from detected types
│  Tags             ambient, dark  │  ← multi-select from existing tags
│  Date Modified    Last 30 days   │  ← preset options
│  ── [Plugin: MIDI] ────────────  │  ← section header when plugin active
│  [plugin-declared filter fields] │  ← rendered by plugin, same controls
│  ──────────────────────────────  │
│  [Clear All]             [Done]  │
└──────────────────────────────────┘
```

The filter popover has two sections:
1. **Core filters** — Asset Type, Tags, Date Modified. Always present, defined by the app shell.
2. **Plugin filters** — the active plugin declares which of its fields are filterable and what control type to use (range, multi-select, comparison, preset). The plugin section is labelled with the plugin name and only appears when one asset type is in scope (either filtered to it, or it is the only type in the library).

The core app renders plugin-declared filter controls without knowing the field semantics. Control type is declared by the plugin (`type: range`, `type: multiselect`, `type: comparison`).

- Inputs are live — results update as the user adjusts values, even before closing.
- `[Done]` closes the popover; filters remain active. `Escape` also closes.
- `[Clear All]` resets all filter inputs and closes the popover.

### Active filters in toolbar

When any filter is active, the `[+ Filter ▾]` button becomes `[Filters (2) ×]`:
- The `(2)` count reflects active filter dimensions (not value count within a dimension).
- The `×` clears all filters immediately (no confirmation).
- Clicking the button label re-opens the popover to adjust filters.

Individual filter removal is available within the popover only — not as chips in the toolbar. Chips in the toolbar require too much horizontal space as filters accumulate. The toolbar communicates *that* filters are active and *how many* — detail is in the popover.

### Filter persistence

Active filters **persist across sessions** (per the session state table in Task 1). The filter button shows its active count on launch if filters are restored. The count in the toolbar updates immediately: `12 of 247`.

---

## Sort Model

### Sortable columns

All default and optional columns are sortable. Clicking a column header sorts by that column. Clicking the same header again reverses direction. Click states:

- **Unsorted:** column header in default weight, no indicator
- **Sorted ascending:** `▲` indicator after label, header in medium weight
- **Sorted descending:** `▼` indicator after label, header in medium weight

Only one column is sorted at a time. No multi-column sort in v1.

### Sort control (toolbar)

The toolbar sort dropdown is a convenience alias for the column headers — it shows the current sort. Changes in either location update both. The dropdown shows: `Sort: [Column Name] ↓` with the direction arrow toggling.

### Default sort

**Date Modified, descending.** Most-recently-changed files appear first. This is the power-user default — the user is usually looking for what they worked on recently.

### Sort persistence

Sort column and direction persist across sessions.

---

## State Display

### Item count

Always shown in the toolbar, right of the separator:

| State | Display |
|---|---|
| No search, no filter | `247 items` |
| Filter active, no search | `12 of 247` |
| Search active, no filter | `12 of 247` |
| Both active | `3 of 12 filtered (247 total)` |
| Empty library | `No items` (not `0 items`) |

Count updates live as search/filter state changes. No loading spinner — results are local.

### Empty states

**Library is empty** (no assets imported):
```
  No assets yet.
  Drop files here, or use File → Import.
```
Centered in the asset list area. No illustration, no emoji.

**Search or filter returns no results:**
```
  No results.
  [Clear filters] to see all 247 items.
```
The `[Clear filters]` link is a text button that resets both search and active filters. If only search is active, reads `[Clear search]`. If only filters are active, reads `[Clear filters]`. If both, reads `[Clear search and filters]`.

---

## Revised Library Pane Summary

With Task 2 decisions incorporated, the Library pane structure is:

Mixed-type view (core + shared columns only):

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [ 🔍 Search...    ]  [+ Filter ▾]  [Sort: Modified ▾]  | 247 items    │
│  ─────────────────────────────────────────────────────────────────────  │
│  Name ▲          Type   Duration   Size     Tags        Modified        │
│  ─────────────────────────────────────────────────────────────────────  │
│  groove-01       JPEG   —          2.4 MB   ref         May 22         │
│  samples/        ─────────────────────────────────────────────────────  │
│  groove-01       M4A    3:42       8.1 MB   final       May 22         │
│  groove-01       MD     —          4 KB     notes       May 22         │
│  groove-01       MIDI   3:38       42 KB    ambient     May 22         │
│  groove-01       WAV    3:42       38 MB    —           May 22         │
│  [asset rows ...]                                                       │
│                                                          ⚙             │
└─────────────────────────────────────────────────────────────────────────┘
```

Single-type view (core + shared + plugin-specific columns):

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [ 🔍 Search...    ]  [+ Filter ▾]  [Sort: Modified ▾]  | 12 of 247   │
│  ─────────────────────────────────────────────────────────────────────  │
│  Name ▲          Type  Duration  Size  [plugin 1]  [plugin 2]  Tags    │
│  ─────────────────────────────────────────────────────────────────────  │
│  groove-01       MIDI  3:38      42KB  [value]     [value]     ambient  │
│  samples/                                                               │
│  groove-02       MIDI  2:15      28KB  [value]     —           dark    │
│  [asset rows ...]                                                       │
│                                                           ⚙            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Accessibility Checklist

- [ ] Column headers are `<th scope="col">` with `aria-sort="ascending"` / `"descending"` / `"none"` updated on sort change
- [ ] Sort state changes are announced: `"Sorted by [Column Name], ascending"`
- [ ] Item count is a live region — updates are announced when search/filter changes (`aria-live="polite"`)
- [ ] Filter popover traps focus while open; `Escape` closes and returns focus to the filter button
- [ ] `[+ Filter ▾]` button has `aria-expanded="true/false"` on the popover
- [ ] Active filter count is part of the button's accessible name: `"Filters, 2 active"`
- [ ] Empty state text is announced when the list transitions to empty
- [ ] `⌘F` shortcut is communicated in the search input placeholder: `🔍 Search... (⌘F)`
- [ ] Column resize handle meets minimum target size (44×44px touch area via extended hit area)
- [ ] Right-click column header menu is keyboard-accessible: `Enter` on column header opens menu

---

## Keyboard Interactions (Library pane, Task 2 scope)

| Key | Action |
|---|---|
| `⌘F` / `F` (list focused) | Focus search input |
| `Escape` (search focused) | Clear search, return focus to asset list |
| `Escape` (list focused) | Clear search if active; else no-op |
| `Click column header` | Sort by column; toggle direction on second click |
| `Space` on column header | Same as click |
| `Right-click column header` | Open column header context menu |
| `⌘⇧F` | Open filter popover |
| `Escape` (popover open) | Close popover, return focus to filter button |

Full keyboard nav within the asset list (arrow keys, selection, etc.) is covered in Task 6.

---

## Open Questions

_None. Raised by agent if anything surfaces during implementation._

---

_Next: Task 3 — Working Set Pane Layout & Zone Structure_
