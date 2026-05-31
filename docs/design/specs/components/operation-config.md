# Operation Configuration Panel

_Task 9 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

The configuration panel is the second step of the operation modal. It is where the user answers: what will this do, with what settings, and where will the output go — before anything runs.

**Design criterion:** Every critical question must be answerable at a glance, without scrolling or hovering. The fixed zones (header, item count, destructive warning, output destination, footer) are always visible. Only parameter inputs scroll.

**Scope:** This spec covers the Config step. The Running and Complete states are Task 10. The Palette step (operation selection) is Task 8.

---

## Modal Zones (Top to Bottom)

```
┌─────────────────────────────────────────────────────────┐
│  Header                                     (fixed)     │
│  ────────────────────────────────────────────────────   │
│  Item count                                 (fixed)     │
│  ────────────────────────────────────────────────────   │
│  Destructive warning                        (fixed, conditional)
│  ────────────────────────────────────────────────────   │
│  Parameter area                             (scrollable)│
│  ────────────────────────────────────────────────────   │
│  OUTPUT                                     (fixed)     │
│  ────────────────────────────────────────────────────   │
│  Footer                                     (fixed)     │
└─────────────────────────────────────────────────────────┘
```

The parameter area is the only scrolling region. Everything else is fixed so that the user can always see the operation name, item count, output destination, and run trigger regardless of how many parameters an operation exposes.

---

## Header

```
  ← Change operation     [Operation Name]                [×]
```

| Element | Style | Behavior |
|---|---|---|
| `← Change operation` | `--fog`, 13px, hover → `--snow`. Left-aligned. | Navigates back to Palette step. Clears current parameter config — returning to palette means selecting a different operation. |
| Operation name | `--snow`, 14px, weight 600. Centered. | Static label. Not interactive. |
| `[×]` | `--fog`, hover → `--snow`. Right-aligned. | Closes modal. Parameter values are preserved for next open (see State Persistence). |

Header height: 48px. Same height as the palette step header — the modal does not resize between steps.

---

## Item Count

```
  [N] items in Working Set
```

Immediately below the header divider. `--fog`, `--font-mono`, `--text-small`. Left-aligned with 16px padding. Fixed.

This is the "what am I about to operate on" confirmation. The user sees the Working Set count before touching any parameter.

---

## Destructive Warning

Shown only for operations that modify or replace source files (declared by the plugin). Hidden for all other operations.

```
  ⚠  This operation modifies source files. The change cannot be undone.
```

| Property | Value |
|---|---|
| Background | `--amber-bg` (`rgba(232, 160, 48, 0.08)`) |
| Left border | 2px solid `--amber` |
| Icon | Lucide `alert-triangle`, 14px, `--amber` |
| Text | `--snow`, 14px, DM Sans |
| Padding | 10px 16px |
| Placement | Fixed, directly below item count. Always visible while config is open. |

The warning is not dismissible. It is not a one-time nag — it is factual information the user needs every time they run a destructive operation.

---

## Parameter Area

The scrollable section between the warning (or item count, if no warning) and the output destination zone. Takes all remaining modal height up to `max-height: 60vh`.

### Empty parameter area (no-parameter operations)

Some operations require no configuration. When a plugin declares zero parameters, the parameter area shows the plugin-provided operation description instead:

```
  [One or two sentences describing what the operation does and what the output
   will look like. Provided by the plugin; rendered verbatim by the app.]
```

`--fog`, 14px, leading-normal. 16px padding. This prevents a visually hollow modal and gives the user context before running.

### Parameter layout

Each parameter follows this vertical structure:

```
  [Label]                             ← required indicator if applicable
  [Input control]
  [Helper text — optional]
  [Error text — conditional]
```

| Element | Style |
|---|---|
| Label | `--snow`, 13px, weight 500 |
| Required indicator | `—  Required` in `--rose`, 12px. Right-aligned on the same line as the label. Shown only before the user has filled a required field. |
| Input control | See Input Patterns section |
| Helper text | `--fog`, 12px. One line only. Describes constraints or expectations (e.g., "Integer between 0 and 127"). |
| Error text | `--rose`, 12px. Replaces helper text position. Describes the specific problem. |

Parameter spacing: 20px between parameter groups. 16px padding on left/right.

---

## Input Patterns

The application shell renders these input types. The plugin declares which type each parameter uses. No other input types are supported in v1.

### Text input

```
┌─────────────────────────────────────────────────────┐
│  value text                                         │
└─────────────────────────────────────────────────────┘
```

- Full width within padding
- DM Sans, 14px
- Background: `--surface`; border: 1px `--line`; border-radius: `--r-sm`
- Focus: `outline: 1px solid var(--amber); outline-offset: 2px`
- Error state: border → `--rose`
- Height: 36px

### Numeric input

```
┌──────────┐
│   80   ↑ │
│        ↓ │
└──────────┘
```

- JetBrains Mono, 14px, weight 500 (data value)
- Right-aligned value in the field
- Stepper arrows (Lucide `chevron-up` / `chevron-down`, 12px) stacked on the right edge, always visible
- Arrow keys `↑`/`↓` when the field is focused: increment/decrement by the plugin-declared step
- `Shift+↑`/`Shift+↓`: 10× step
- Constraints enforced on blur, not on each keystroke (allows the user to delete and retype a value without intermediate errors)
- Width: fit to expected value range (min 80px, max 160px). Not full-width — numeric fields are narrow by convention.
- No slider. The numeric text input is the only numeric pattern in v1. Sliders add interaction overhead for values that are better typed.

### Select / dropdown

```
┌──────────────────────────────────────────────────────┐
│  Option A                                         ▾  │
└──────────────────────────────────────────────────────┘
```

- Full width
- DM Sans, 14px
- Same border and focus treatment as text input
- The `▾` (Lucide `chevron-down`, 14px) is always visible — not revealed on hover
- Native select element in v1 (platform-native dropdown on macOS)

### Toggle

```
  [●───] Label       ← on (amber)
  [───○] Label       ← off (--fog)
```

- Toggle switch: 32px × 18px
- On: amber thumb + amber track (`--amber-bg`)
- Off: fog thumb + fog track (`--line`)
- Space bar toggles when the control is focused
- Label appears to the right of the toggle
- Toggle comes before the label in the DOM (label is associated via `for`/`id`)

### File picker

```
┌──────────────────────────────────────────┐  ┌──────────┐
│  /path/to/file.ext                       │  │ Browse…  │
└──────────────────────────────────────────┘  └──────────┘
```

- Text field (read-only — path is set via Browse, not typed) + Browse button
- Browse button opens the native macOS file picker
- File field shows the resolved path or is empty if no file selected
- Empty required file picker: "Required" adornment on label + Run disabled
- Error on blur if path doesn't exist (e.g., file moved since last use)

---

## Output Destination

Fixed zone, always visible, directly above the footer. The user must always be able to see where output will go before running.

The app declares two operation flavors; the plugin specifies which applies:

### Flavor A — creates new files (default)

```
  OUTPUT
  /Users/marty/sounds/output/               [Browse…]
```

| Element | Style |
|---|---|
| `OUTPUT` label | Uppercase, `--fog`, `--text-h3`, `--tracking-wide` — section label pattern |
| Path field | JetBrains Mono, 13px, `--slate`. Shows the resolved path — never a label like "(default)". |
| `[Browse…]` | Ghost button. Opens native folder picker. |

**Default path resolution:**
- All WS items share the same source folder → that folder is the default
- WS items come from multiple folders → the project-wide output folder (set in app settings; falls back to home directory on first run)

The resolved path is always shown. If the user sees `/Users/marty/sounds`, they know output goes there. If they see `/Users/marty`, they know to change it.

Parameter values and output destination are **preserved on modal close** (Escape or [×]). The user may open, inspect, partially configure, close, and return without losing work. Values are cleared when:
- The operation runs to completion
- `← Change operation` is clicked (new operation = new config)

### Flavor B — modifies source files in place (destructive)

```
  OUTPUT
  Source files (in place)
```

| Element | Style |
|---|---|
| `OUTPUT` label | Same uppercase label |
| Value | `"Source files (in place)"`, `--fog`, italic. Read-only. No Browse button. |

The output destination is not editable for in-place operations — there is no output file location to choose. The destructive warning banner (above the parameter area) carries the significance of this.

---

## Footer

```
  [Save as named…]                                      [Run ⚡]
```

Fixed at the bottom. Height: 48px. Background: `--panel`. Border-top: 1px `--line`.

### Run button

- **Label:** `Run ⚡` — `⚡` is the operation anchor icon established in Task 3
- **Style:** Primary amber button (`--amber` background, dark text `#1a1206`, weight 600, `--r-sm`)
- **Keyboard:** `⌘Return` — confirmed here, forwarded to Task 13 for the canonical map
- **Disabled only when:** a required parameter field is empty (the only case). All other parameters have plugin-provided defaults; this state should be rare.
- **Behavior:** Clicking Run immediately transitions the modal to the Running state (Task 10). No intermediate confirmation.

### Save as named…

A text-weight affordance, not a button. Does not compete visually with Run.

- **Style:** `--fog`, 13px, underline on hover. Left-aligned in the footer.
- **Label:** `Save as named…`

**Interaction flow:**

1. User clicks or activates `Save as named…`
2. The footer transforms inline:
   ```
   [Name this configuration…    ] [✓] [×]         [Run ⚡]
   ```
   - Text input: `--surface` bg, `--line` border, DM Sans 13px, `--r-sm`
   - `[✓]` confirms (same as pressing Return inside the input)
   - `[×]` cancels (same as pressing Escape inside the input)
3. **On confirm (Return or `[✓]`):** The configuration is saved under the given name. The name input collapses. A brief inline confirmation replaces it: `Saved as "[name]"` in `--fog`, 12px, fades after 2 seconds back to `Save as named…`.
4. **On cancel (Escape or `[×]`):** Input collapses. Nothing is saved.
5. **On duplicate name:** Inline error below the input (not a toast): `A saved configuration with this name already exists.` The save is blocked until the user renames. No "overwrite?" prompt — the existing config is never silently replaced.

The save captures: operation identity + all current parameter values + output destination. Running the operation is not required before saving.

---

## No [Cancel] Button

The modal has no footer `[Cancel]` button. Escape and `[×]` are the two close affordances. A Cancel button signals "this might be doing something I need to back out of" — which doesn't fit a config state where nothing has run yet. Two close affordances (Escape + [×]) are sufficient and conventional.

---

## Keyboard Navigation

| Key | Action |
|---|---|
| (modal opens at Config step) | Focus → first parameter input; or first visible interactive element if no parameters |
| `Tab` | Cycle forward through: `← Change operation`, parameter inputs (in order), output `[Browse…]`, `Save as named…`, `[Run ⚡]`, `[×]`, back to `← Change operation` |
| `Shift+Tab` | Reverse cycle |
| `⌘Return` | Run (equivalent to clicking Run button) |
| `Escape` | Close modal (if save-as input is not active). If save-as input is active: close the input only |
| `↑` / `↓` (in numeric field) | Increment / decrement by step |
| `Shift+↑` / `Shift+↓` (in numeric field) | 10× step |
| `Space` (on toggle) | Toggle the value |
| `Return` (in save-as name input) | Confirm save |
| `Escape` (in save-as name input) | Cancel save (modal does not close) |

---

## State Persistence

Parameter values and output destination persist across modal open/close cycles (Escape or [×]). The user can:
- Open the config
- Set some parameters
- Close (Escape)
- Re-open via the button
- Continue from where they left off

Values are cleared when:
1. The operation runs to completion (the config is "consumed")
2. `← Change operation` is clicked (selecting a new operation discards the previous config)

The configured operation itself (separate from parameter values) persists through Working Set clears — this is an existing decision from Task 3.

---

## Dry-Run / Preview

Not in v1 scope. The config panel shows what the operation is set up to do; it does not simulate or preview the output. The user runs the operation and reviews the output in the Library. Task 10's Complete state provides the post-run output summary.

---

## Accessibility

- [ ] Modal `role="dialog"` with `aria-modal="true"` carries through all steps — already established
- [ ] On transition from Palette → Config: focus moves to first parameter input (or `← Change operation` if no parameters)
- [ ] All parameter inputs have explicit `<label>` elements — never placeholder-only labels
- [ ] Required fields: `aria-required="true"` on the input; "Required" indicator is also in the label text (not only visual)
- [ ] Error text is associated with its input via `aria-describedby`
- [ ] Helper text is associated via `aria-describedby` (shared with error text — error text replaces helper text when present, not appended)
- [ ] Destructive warning: `role="alert"` — announced when the config step opens and the operation is destructive
- [ ] Item count (`[N] items in Working Set`): static text, no live region needed (it doesn't change while the modal is open — the WS is blocked by `aria-modal`)
- [ ] Run button: `aria-disabled="true"` when disabled (not `disabled` attribute alone — `aria-disabled` keeps the button in the tab order so screen readers can reach and describe why it's disabled)
- [ ] Output destination field: `aria-label="Output folder"` or `aria-label="Output location"` (the `OUTPUT` section label is uppercase presentational — it must be mirrored in an ARIA label)
- [ ] Toggle: `role="switch"` with `aria-checked="true/false"`; label is associated via standard `for`/`id`
- [ ] `⌘Return` for Run must be documented in Task 13's keyboard map; it requires a `keydown` handler on the modal container (not just the button)
- [ ] Save-as name input: `aria-label="Configuration name"` when it appears; focus moves to it on activation
- [ ] Collision error: `role="alert"` on the inline error element — announced immediately on appearance

---

## Verification

**Criterion:** Configure and run without ambiguity about what will happen or where output will go.

| Question the user might ask | Where the answer is | Requires scrolling? |
|---|---|---|
| What operation am I running? | Header — operation name | No |
| How many items will be affected? | Item count, below header | No |
| Is this reversible? | Destructive warning banner (if applicable) | No |
| What are the current parameter settings? | Parameter area — pre-filled defaults | Possibly, for long parameter lists |
| Where does the output go? | Output destination zone (fixed) | No |
| Am I ready to run? | Run button — amber, prominent | No |

Critical questions (operation identity, item count, reversibility, output location, run trigger) are all answered in fixed zones. Only parameters may require scrolling — and parameters are the expected part of a config panel. The design passes the criterion.

**Verification walkthrough: configure and run using only keyboard**

Starting condition: palette step, an operation selected (Return pressed), Config step is now active.

1. Focus lands on first parameter input
2. Type or arrow-key the value; Tab to next parameter; repeat until all parameters set
3. Tab to `[Browse…]` in output destination — confirm the path or activate Browse to change
4. `⌘Return` → Run
5. Modal transitions to Running state (Task 10)

Total steps with default values already correct: `⌘Return` immediately (1 keystroke) — defaults are pre-filled and valid.

---

## Open Questions

- **File picker — typed paths:** Should users be able to type a path directly into the file picker field, or is Browse the only input method? Typed paths are faster for power users. Risk: invalid paths, permission errors. Recommendation: allow typed paths, validate on blur.
- **Output destination persistence across sessions:** Is the last-used output folder remembered across app restarts? Reasonable yes — power users have a preferred output folder. The project-wide default (app settings) is the mechanism. Flag for app settings spec.
- **Multi-step operations:** Some operations might expose sub-steps (e.g., "Convert then Normalize"). Not in scope for v1 — the config panel handles a single flat parameter set.

---

_Next: Task 10 — Operation Execution, Progress & Outcome_
