# Asset List Item — Library Component

_Task 4 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Overview

The Library list item is a table row. It is the most repeated element in the application — every design decision here multiplies across potentially hundreds of visible rows. The priorities in order are: information density, selection clarity, and keyboard operability. Nothing else.

This component covers anatomy, states, hover behavior, keyboard interaction, and the plugin-agnostic rendering contract. Selection mechanics (multi-select, range, add-to-Working-Set gesture) are covered in Tasks 6 and 7.

---

## Anatomy

The row maps directly to the three-tier column model defined in Task 2. The component does not know which tier a column belongs to — it receives an ordered list of cells and renders them uniformly.

### Name cell (always pinned)

The Name cell is the only cell with two lines. All other cells are single-line.

```
  groove-01                           ← primary line: filename without extension
  samples/2024/ambient/               ← secondary line: folder path
```

| Line | Content | Style |
|---|---|---|
| Primary | Filename without extension | `--text-primary`, normal weight |
| Secondary | Folder path relative to library root | `--text-small`, `--fog` |

The secondary line is always visible — it is not hover-revealed. The folder path is how a user with a deep directory structure distinguishes files with identical names. Hiding it on default degrades scanning in exactly the collections this tool is built for.

**Truncation:** Both lines truncate with `…` if the Name column is narrower than the content. Hovering the Name cell shows a tooltip with the full filename and full path on separate lines.

### All other cells

Single line, vertically centered. Content is the field value as rendered by its data type:

| Type | Rendering |
|---|---|
| `string` | Left-aligned, `--text-primary` |
| `numeric` | Right-aligned, `--font-mono`, `--text-small` |
| `duration` | Right-aligned, `--font-mono`, `--text-small`, `mm:ss` format |
| `date` | Right-aligned, `--text-small` — `May 22` current year, `2024-11-03` prior years |
| Tags | Pill labels, left-aligned, `--text-small`. Truncated after N pills fit; remainder shown as `+3` overflow count |

**Null / not-applicable values:** When a field has no value for a given file, the cell is **empty** — no `—` placeholder, no zero. An empty cell reads faster than a repeated placeholder across hundreds of rows. Placeholders add visual noise without adding information.

*Exception:* Duration cells show `—` only when the file type is expected to have a duration but does not (e.g., a corrupted audio file). A file type that never has a duration (JPEG, MD) simply has an empty Duration cell.

---

## Row Height

**~46px effective.** Base height is `--row-h-compact` (32px); the secondary folder path line in the Name cell expands the row. All cells stretch to fill the row height — the two-line Name cell sets the cadence.

For a uniform row height regardless of Name column width, the secondary path line is clamped to one line even if the path is long (truncated with `…`).

---

## States

A row can be in exactly one primary state at a time. Hover and focus are layered on top of the primary state.

### Default (unselected)

```
│ groove-01      MIDI  3:38  42 KB  ambient  May 22  │
│ samples/                                           │
```

- Background: `--surface` (the list background)
- No left indicator

### Hovered

```
│▌groove-01      MIDI  3:38  42 KB  ambient  May 22  [→]│
│▌samples/                                              │
```

- Background: `--surface-raised` (one step above surface — subtle lift, not a strong fill)
- A transfer affordance `[→]` appears at the far right of the row, within the scrollable area. It is the primary hover action. Its mechanics (click behavior, keyboard equivalent) are defined in Task 7. Its presence here is the discovery affordance.
- The `[→]` is `--fog` at rest on hover; brightens to `--text-primary` on hover of the affordance itself.

**No additional fields are revealed on hover.** All content is always visible in its column. Hover serves two purposes: row highlight for orientation while scanning, and surfacing the transfer affordance.

### Focused (keyboard focus, unselected)

```
┌───────────────────────────────────────────────────────┐
│ groove-01      MIDI  3:38  42 KB  ambient  May 22      │
│ samples/                                               │
└───────────────────────────────────────────────────────┘
```

- 2px `--amber` focus ring around the entire row (inset, not outset — does not shift adjacent rows)
- Background: `--surface` (unchanged — focus ring alone is the indicator)
- Focus ring meets WCAG 2.1 AA focus visibility: minimum 3:1 contrast against adjacent background

### Selected (single)

```
▌ groove-01      MIDI  3:38  42 KB  ambient  May 22  │
▌ samples/                                           │
```

- 3px `--amber` left inset border (the non-color indicator)
- Background: `--amber` at 10% opacity fill
- The left border + fill combination ensures the selected state is distinguishable on a monochrome display (the border is a shape/position change; the fill is secondary reinforcement)

### Selected + focused

```
┌─▌─────────────────────────────────────────────────────┐
│▌ groove-01      MIDI  3:38  42 KB  ambient  May 22     │
│▌ samples/                                              │
└───────────────────────────────────────────────────────┘
```

- 3px `--amber` left inset border + 10% fill (selected state)
- 2px `--amber` focus ring (focus state, layered)
- The focus ring is the outer boundary; the left border is inside it

### Selected + hovered

- 3px `--amber` left inset border + 10% fill (selected)
- `--surface-raised` background (hover lift, composited over the amber fill)
- Transfer affordance `[→]` appears (same as default hover)

---

## Multi-Select Visual

When multiple rows are selected, each selected row independently shows the amber fill + left border. There is no additional visual grouping between selected rows — they are a set by virtue of each showing the selected state, not by a bracket or highlight spanning them.

The selection count is displayed elsewhere (status bar, Working Set context) and announced to screen readers. It does not appear within individual rows.

**Range selection** (Shift+click or Shift+Arrow): all rows in the range show the selected state immediately. There is no "preview before confirm" highlight — the selection is applied.

---

## Plugin-Agnostic Rendering Contract

The row component receives a data structure shaped approximately as:

```
{
  id: string,
  cells: [
    { columnId: "name",     value: "groove-01",   secondaryValue: "samples/2024/ambient/" },
    { columnId: "type",     value: "MIDI" },
    { columnId: "duration", value: 218 },          // seconds; component formats to mm:ss
    { columnId: "size",     value: 43008 },         // bytes; component formats to "42 KB"
    { columnId: "tags",     value: ["ambient"] },
    { columnId: "modified", value: "2026-05-22T..." },
    { columnId: "bpm",      value: 120 },           // plugin-declared — component doesn't know what this is
    { columnId: "tracks",   value: 4 },             // plugin-declared — same
  ],
  selected: boolean,
  columnOrder: ["name", "type", "duration", "size", "bpm", "tracks", "tags", "modified"]
}
```

The component:
- Renders cells in `columnOrder`
- Applies type-based formatting (`numeric` → right-aligned mono, `duration` → `mm:ss`, etc.) declared in the column schema
- Does not branch on column identity (no `if columnId === "bpm"` logic)
- Is unaware of which tier a column belongs to

Plugin-specific cells are visually identical to core/shared cells. The plugin's vocabulary appears only in the column header label — never in the component itself.

---

## Keyboard Interaction

| Key | Action |
|---|---|
| `↑` | Move focus to the previous row. If at the top, wraps to the last row or stops (TBD in Task 6). |
| `↓` | Move focus to the next row. If at the bottom of visible rows, scrolls to reveal the next. |
| `Space` | Toggle selection of the focused row. Does not move focus. |
| `Shift+Space` | Extend selection from the last selected row to the focused row (range select). |
| `Enter` | Open the focused file in its default system application. Does not change selection state. |
| `⌘+Enter` | Add the focused item to the Working Set (keyboard transfer — mechanics in Task 7). |
| `Escape` | Deselect all. Focus remains on the currently focused row. |

**`↑` / `↓` do not change selection** — they move focus only. Selection requires an explicit `Space`. This matches the standard list keyboard model (macOS Finder, Ableton browser, etc.) and allows keyboard navigation without accidentally accumulating a selection.

**`Enter` opens in default app.** For a power user, the most useful action on a file is to open it — in Logic for MIDI, Preview for images, Marked for Markdown. The app delegates this to the OS. There is no in-app inspector in v1.

---

## Accessibility Checklist

- [ ] Each row is a `<tr>` with `role="row"` and `aria-selected="true/false"`
- [ ] Selected state communicated via `aria-selected` — not color alone
- [ ] Focus indicator meets WCAG 2.1 AA: 2px `--amber` ring with minimum 3:1 contrast against `--surface`
- [ ] Selected amber fill (10% opacity) does not drop row text below WCAG AA contrast against `--surface`
- [ ] Accessible name for each row: `"[filename], [type], [duration if present], [tags if present]"` — not filename alone
- [ ] Multi-select count announced on change: `"3 items selected"` via `aria-live="polite"` on the parent list
- [ ] `Space` to select is communicated: the list container has `aria-multiselectable="true"`
- [ ] `Enter` to open is communicated in screen reader context (documented shortcut, not a visible label)
- [ ] Transfer affordance `[→]` has accessible name: `"Add [filename] to Working Set"` — visible only on hover but always present in the DOM with `aria-label`
- [ ] Truncated values have `title` attributes with full content for screen readers and pointer users

---

## Open Questions

- **`↑` at the top of the list:** wrap to last row, or stop and announce "Beginning of list"? Defer to Task 6 (selection model).
- **`Enter` on a file type with no default app registered:** OS handles the error; the app does not intercept.

---

_Next: Task 5 — Asset Item — Working Set Component_
