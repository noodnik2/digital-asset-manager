# Operation Naming & Copy Standards

_Task 12 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

This spec is the canonical reference for every string the application shell renders. It collects labels already established across Tasks 1–11, formalises the plugin copy contract, and defines patterns for strings not yet covered (error messages, accessibility announcements gaps).

**The central rule:** The application shell never constructs, interprets, or hardcodes domain-specific strings. Every asset-type or operation-specific term visible to the user comes from a plugin. Core copy uses only generic verbs and counts.

---

## What's new in this spec vs. prior work

Most of this spec canonicalizes strings already established in Tasks 1–11. These sections are new material that needs explicit review before treating as decided:

**Plugin field length caps** — `name ≤ 40 chars`, `description ≤ 100 chars`, `param label ≤ 30 chars`, `helper text ≤ 60 chars`. These are proposed constraints with no prior basis in the specs. Tighter or looser caps are both defensible; flag if any feel wrong given the palette/config UI.

**Core error message catalog** — The plan asked for the *pattern* (two-sentence format, generic language). I also wrote specific error scenarios. "Plugin failed to load" has been removed — external plugin loading is not in v1 scope (see Plugin Loading Model below). Remaining scenarios are v1-realistic.

**"files" as the status message unit noun** — Progress strings say `[N] of [M] items` and `[N] items processed`. Superseded by user direction 2026-05-25: use "items" throughout. Updated below.

**`Browse…` aria-label override** — Proposed as `aria-label="Choose output folder"`. Minor but new.

---

## Principles

1. **Generic by default.** Core copy must work for any asset type — MIDI files today, images or audio next. If a string would need to change for a future asset type, it belongs in the plugin, not the shell.

2. **Grade 8 reading level or below.** No jargon, no technical identifiers, no compound sentences with multiple clauses. Short statements; direct language.

3. **What happened, then what to do.** Error messages and status messages always answer two questions: what occurred, and what the user can do. A message that only answers the first question is incomplete.

4. **Count over label.** When the state is communicated by a number, show the number. Do not substitute it with a word like "several" or "many."

5. **No redundant negatives.** If the UI already communicates absence (an empty list, a disabled button), do not add text that says the same thing. "No items" appears only when it is the only signal.

6. **Framing is not a suggestion.** Post-operation affordances ("Load output into Working Set") are tools the user reaches for, not next-step recommendations. Language and placement must reflect this.

---

## Plugin Copy Contract

The plugin declares all domain-specific strings. The application shell renders them verbatim using generic UI affordances. The shell never transforms, concatenates, or interprets plugin strings.

### Required declarations

| Field | Type | Used in | Constraints |
|---|---|---|---|
| `name` | string | Palette row title, Config header, Running header, Complete header, status bar, screen reader announcements | Max 40 characters. No format strings or technical identifiers. Must be a human-readable label. |
| `description` | string | Palette row subtitle, Config empty-parameter area | Max 100 characters. One or two sentences. No HTML. |
| `destructive` | boolean | Config step: whether the destructive warning banner appears | — |
| `flavor` | enum: `"A"` \| `"B"` | Determines Complete state layout and absence/presence of load-output affordance | See Tasks 9–10 |

### Optional declarations

| Field | Type | Used in | Notes |
|---|---|---|---|
| `outputLocator` | string | Flavor A Complete state: pre-populates Library search link | A search term, filename suffix, or tag (e.g., `"_normalized"`). If absent, app uses a time-based fallback. |
| `parameters[].label` | string | Config step: parameter input label | Required per parameter. Max 30 characters. |
| `parameters[].helperText` | string | Config step: parameter helper text | Optional. Max 60 characters. One line only. |

### Plugin loading model (v1)

In v1, all plugins are bundled — they ship compiled into the application binary. There is no runtime plugin discovery, no external plugin loading, and no plugin management UI (install/uninstall/update).

The plugin contract (interface + registration) is defined and enforced from day one. MIDI support implements this contract as a bundled plugin. The core app never imports from the MIDI package directly; the dependency arrow always points inward (plugin → core, never core → plugin).

**Consequence for error copy:** "Plugin failed to load" is not a valid v1 user-facing state — there is nothing to load at runtime. The only plugin-related empty state is the palette showing no compatible operations when a file type has no registered plugin (see Empty States).

When a second asset type is added in a future version, it implements the same interface and ships bundled. External/third-party plugin loading is explicitly out of v1 scope.

### Error strings (plugin-provided)

When a plugin operation fails on a specific file, the plugin provides the error reason string. The application shell renders it but does not alter it.

- **Inline (Running state file list):** Truncated at 50 characters with ellipsis. Shown to the right of the filename in `--rose`, 12px.
- **Detail (Complete state failure list):** Same truncation. Listed beneath the summary counts.

Plugin error strings may use domain language (e.g., "Corrupted MIDI header," "Invalid time signature"). This is the one surface where domain vocabulary is permitted — it is the plugin's surface.

**Core app errors** (file permission, output folder, library folder inaccessible) use only generic language — see Error Message Patterns below.

---

## Core UI Action Labels

Canonical labels for all interactive controls rendered by the application shell. These are the authoritative forms; specs for individual components reference this table.

### Operation modal

| Action | Canonical label | Notes |
|---|---|---|
| Open modal — no operation selected | `⚡ Select Operation ▾` | Button in Working Set toolbar. `⚡` is the operation anchor icon established in Task 3. |
| Open modal — operation configured | `⚡ [Operation Name] ▾` | Same button; label updates to show the plugin-provided name. |
| Return to palette from config | `← Change operation` | Text-weight link in Config header. Lowercase "operation" — not the plugin-provided name. |
| Close modal (not running) | `×` | Icon button. `aria-label="Close"`. |
| Close modal (running, triggers abort) | `×` | Same button; `aria-label="Abort operation"` during Running state. |
| Run the operation | `Run ⚡` | Primary amber button. Keyboard: `⌘Return`. |
| Stop a running operation | `Abort` | Ghost button, footer of Running state. |
| Dismiss abort confirmation, continue | `Keep running` | Ghost button. Takes focus on confirmation appear. |
| Confirm abort | `Abort` | `--rose` button inside the abort confirmation. |
| Dismiss complete or cancelled modal | `Close` | Ghost button. Takes focus on transition to Complete/Cancelled. |
| Save configuration with a name | `Save as named…` | Text-weight link in Config footer. |
| Choose a folder via native picker | `Browse…` | Ghost button next to output path field. |
| Load output into Working Set | `Load output into Working Set` | Text-weight link in Flavor A Complete footer. Full label — not shortened. |
| Search Library for operation output | `Search for recent output →` | `--amber`, 13px. When plugin declares `outputLocator`: label unchanged. When app uses time-based fallback: `Search: items added this session`. |

### Library pane

| Action | Canonical label | Notes |
|---|---|---|
| Search the library | placeholder: `Search…` | Search input in the Library toolbar. |
| Add or remove filters | `+ Filter ▾` | Dropdown trigger. The `+` symbol is an affordance, not a count. |
| Clear active search | `Clear search` | Text button inside the no-results empty state. |
| Clear active filters | `Clear filters` | Text button inside the no-results empty state. |
| Clear active search and filters | `Clear search and filters` | Used when both are active. |
| Open settings | `⚙` icon | No visible label. `aria-label="Library settings"`. |

### Working Set pane

| Action | Canonical label | Notes |
|---|---|---|
| Clear the Working Set | `Clear` | Button in Working Set toolbar. Confirmed in Task 3. Not "Clear Working Set" — context makes "Working Set" implicit. |
| Remove an item from the Working Set | `×` | Per-item remove button. `aria-label="Remove [filename] from Working Set"`. |

---

## Status Messages

All status messages use `[Operation Name]` as a placeholder for the plugin-provided operation name. The app substitutes the actual name at render time. If the operation name is unavailable (edge case: plugin unloaded mid-session), the placeholder reads `Operation`.

### Modal header states

| Modal state | Header text |
|---|---|
| Palette step | `Select Operation` |
| Config step | `[Operation Name]` |
| Running | `[Operation Name] — Running` |
| Complete (all succeeded) | `[Operation Name] — Complete` |
| Complete (with failures) | `[Operation Name] — Complete` |
| Cancelled | `[Operation Name] — Cancelled` |

The em dash with surrounding spaces ( ` — ` ) is the separator between the operation name and the state word in all cases.

### Progress messages (Running state)

| Element | String | Notes |
|---|---|---|
| Progress bar label | `[N] of [M] items` | `[N]` = processed; `[M]` = total. Monospace. |
| Abort confirmation | `Abort? [N] items already processed. Output is in the Library.` | `[N]` = successfully processed items at the moment the confirmation appears. "Output is in the Library." is always true for Flavor A; omitted for Flavor B (no output files are created). |

### Complete state — success summary

**Flavor A — creates new files:**

| Outcome | Summary line(s) |
|---|---|
| All succeeded | `✓  [N] items processed` |
| With failures | `✓  [N] items processed` `✗  [M] items failed` |
| All failed | `✗  [N] items failed` |

**Flavor B — modifies source files:**

| Outcome | Summary line(s) |
|---|---|
| All succeeded | `✓  [N] items modified in place` |
| With failures | `✓  [N] items modified in place` `✗  [M] items failed` |
| All failed | `✗  [N] items failed` |

"Modified in place" is the only place where the Flavor B outcome is expressed in copy. "Modified" communicates what happened without implying output went elsewhere.

### Cancelled state — summary

```
◌  Cancelled after [N] of [M] items

[N] items were processed before cancellation.
Partial output is in the Library.
```

"Partial output is in the Library." applies to Flavor A only. Omit for Flavor B (source files are the output; nothing extra was created).

### Status bar — last operation outcome (Task 11)

| Outcome | Right-region string | Color |
|---|---|---|
| Running | `[Operation Name] — [N] of [M]` | `--fog` |
| Complete, all succeeded | `[Operation Name] — complete` | `--jade` (fades after 4s, then `--fog`) |
| Complete, with failures | `[Operation Name] — complete with errors` | `--rose` (persists) |
| Cancelled | `[Operation Name] — cancelled` | `--fog` (fades after 4s) |
| All items failed | `[Operation Name] — failed` | `--rose` (persists) |
| No operation run this session | _(empty)_ | — |

Status bar strings use lowercase state words (`complete`, `cancelled`, `failed`) to distinguish them visually from the modal header strings (`— Complete`, `— Cancelled`) which use title case.

### Screen reader announcement strings

Reproduced from Task 10 for reference. These are the exact strings used in live region announcements.

| Moment | Announcement | Region type |
|---|---|---|
| Operation starts | `"[Operation name] started. [N] items queued."` | `aria-live="polite"` |
| Every 25% complete | `"[N] of [M] items processed."` | `aria-live="polite"` |
| Abort confirmation appears | `"Abort operation? [N] items already processed. Output is in the Library."` | `role="alert"` |
| Cancelled | `"[Operation name] cancelled. [N] of [M] items processed."` | `aria-live="assertive"` |
| Complete, no errors | `"[Operation name] complete. [N] items processed."` | `aria-live="assertive"` |
| Complete, with errors | `"[Operation name] complete. [N] processed, [M] failed."` | `aria-live="assertive"` |
| Working Set becomes empty | `"Working Set is empty."` | `aria-live="polite"` |
| Items transferred to Working Set | `"[N] items added. Working Set now contains [M] items."` | `aria-live="polite"` |
| Item removed from Working Set | `"Removed. [M] items remain in Working Set."` | `aria-live="polite"` |

The 25% milestone throttle does not apply for operations with fewer than 8 items — completion is announced only (per Task 10).

---

## Empty States

### Library — no assets

Shown when the library contains no files.

```
  No assets yet.
  Drop files here, or use File → Import.
```

`--fog`, centered in the asset list area. No illustration, no emoji.

> **Open question:** The secondary line references `File → Import` — a menu bar item not yet specced. If the import mechanism changes (drag-only, or a toolbar button), this string will need updating. Flag for the Library pane spec.

### Library — search or filter returns no results

```
  No results.
  [Clear search and filters] to see all [N] items.
```

The link label adapts:
- Only search active: `[Clear search]`
- Only filters active: `[Clear filters]`
- Both active: `[Clear search and filters]`

`[N]` is the total unfiltered item count at the time the empty state is shown.

### Working Set — empty

```
  Select assets from
  the Library to begin.
```

`--fog`, `--text-small`, centered in the contents area. No icon, no emoji. Two-line layout is established in Task 3.

### Operation palette — no compatible operations

```
  No operations available for the current items.

  A plugin that supports this file type is required.
```

`--fog`, 14px, centered in the list area. Established in Task 8. Reproduced here as canonical.

### Operation palette — search returns no results

```
  No operations match.
```

`--fog`, 14px, centered in the list area. Established in Task 8. Reproduced here as canonical.

---

## Error Message Patterns

### Structure

All core error messages follow this two-sentence pattern:

> **[What happened.]** **[What the user can do next.]**

Both sentences are required. A message that states the problem without a next step leaves the user with no path forward.

- Present or past tense, never future ("your file cannot be opened" — not "your file will not be able to be opened")
- Sentence case. No exclamation marks.
- No error codes in primary surfaces. No stack traces anywhere visible to the user.
- Maximum one subordinate clause per sentence.

### Core app error messages

These are produced by the application shell. They appear in modal footers, inline in the Config step, or as system-level alerts.

| Situation | Copy |
|---|---|
| Output folder does not exist | `The output folder was not found. Choose a different folder and try again.` |
| Output folder is read-only | `The output folder cannot be written to. Check permissions, then try again.` |
| Item in Working Set was moved or deleted | `One or more items in your Working Set could not be found. Remove them and try again.` |
| Library folder inaccessible | `Your library folder could not be read. Check that it exists and you have permission to access it.` |
| Operation failed to start (not an item-level failure) | `The operation could not start. Check the configuration and try again.` |
| File picker: path does not exist (typed by user) | `This path does not exist. Type a valid path or use Browse… to choose one.` |
| Save configuration: name already in use | `A saved configuration with this name already exists.` _(no second sentence — the action required is already visible: rename the input)_ |

### Plugin error messages

Plugin errors appear in two surfaces (described in Plugin Copy Contract above). The shell does not filter or translate them. If a plugin provides a well-formed error string, the shell renders it as-is.

**App-level guidance to plugin authors** (for documentation, not a runtime constraint):

- Follow the two-sentence pattern when possible
- Domain language is permitted: "Corrupted MIDI header" is acceptable in a plugin error
- Keep error reasons under 50 characters so they render without truncation in the Running state inline display
- Do not include file paths or line numbers — those belong in a log file

### Error placement

| Error type | Where it appears |
|---|---|
| Config-level errors (output folder, missing required field) | Inline below the relevant input, or in a banner above the footer |
| File-level failures during run | Inline in the file list row (truncated) and in the Complete state failure detail list |
| Operation-level start failure | Inline in the footer above `[Run ⚡]`, replacing the `Save as named…` link |
| Library/system errors | System-level alert (native macOS `NSAlert`) — outside the modal flow |

No toasts. No transient notifications. All errors are persistent until the user addresses them or dismisses the modal.

---

## Accessibility

- [ ] All copy in this spec meets Grade 8 reading level or below (Flesch-Kincaid target ≤ 8.0)
- [ ] Error messages: `role="alert"` on inline error containers — announced immediately on appearance
- [ ] Empty states: announced when the list transitions to empty (existing `aria-live` regions in Tasks 2 and 3 cover this)
- [ ] Plugin-provided strings (operation name, description, error reason) must not contain HTML — rendered as text nodes, not innerHTML
- [ ] Operation name in screen reader announcements is the plugin-provided `name` field verbatim — the app does not abbreviate or paraphrase it
- [ ] "Modified in place" (Flavor B Complete summary) requires no additional screen reader supplement — the destructive warning in Config and the Flavor B footer (no load-output affordance) provide the pre-run and post-run context chain
- [ ] `[Search for recent output →]` accessible label: `aria-label="Search Library for operation output"` — the arrow in the visible label is decorative; the accessible name is the full phrase
- [ ] `[Clear search and filters]` and its variants: the visible label is also the accessible label — no additional `aria-label` needed
- [ ] `Browse…` button: `aria-label="Choose output folder"` — "Browse" is a conventional label but "Choose output folder" is more descriptive for screen readers; both are provided via `aria-label` overriding the visible label

---

## Verification

**Criterion:** Every string rendered by the application shell is asset-type agnostic. A future image module requires zero changes to core copy. Domain-specific strings appear only in plugin-provided surfaces.

| String category | Asset-type agnostic? | Notes |
|---|---|---|
| Core UI action labels (`Run ⚡`, `Abort`, `Close`, `Clear`, etc.) | ✅ Yes | Generic verbs throughout |
| Modal header states (`— Running`, `— Complete`, `— Cancelled`) | ✅ Yes | State word only; operation name from plugin |
| Progress counter (`[N] of [M] items`) | ✅ Yes | "items" is intentionally abstract — applies to any asset type |
| Complete summary (`[N] items processed`, `[N] items modified in place`) | ✅ Yes | No asset-type terms |
| Status bar outcome (`[Op Name] — complete`, etc.) | ✅ Yes | Operation name from plugin |
| Screen reader announcements | ✅ Yes | Count-based; operation name from plugin |
| Library empty state (`No assets yet.`) | ✅ Yes | "assets" is intentionally generic |
| Library no-results state (`No results.`) | ✅ Yes | No asset-type reference |
| Working Set empty state (`Select assets from the Library to begin.`) | ✅ Yes | "assets" is generic |
| Palette no-operations state | ✅ Yes | References "file type" generically |
| Core error messages | ✅ Yes | "folder", "items", "plugin" — no asset-type terms |
| Plugin error strings | Plugin-provided — may use domain language | ✅ Correct surface for domain language |
| Plugin operation name | Plugin-provided | ✅ Correct surface for domain language |
| Plugin operation description | Plugin-provided | ✅ Correct surface for domain language |
| Plugin parameter labels | Plugin-provided | ✅ Correct surface for domain language |

**Test: Imagining the image module**

If a user installs a hypothetical image plugin that provides an operation "Export to WebP":

- The palette shows `Export to WebP` (plugin-provided) with the plugin-provided description
- The Config header reads `Export to WebP` — unchanged by the shell
- Running: `Export to WebP — Running` — shell appends ` — Running` generically
- Progress: `3 of 50 items` — applies identically to image or audio items
- Complete: `✓  50 items processed` — generic
- Status bar: `Export to WebP — complete` — shell appends `— complete` generically

Zero core strings change. The shell renders identically for MIDI operations and image operations. ✅

---

## Open Questions

- **File → Import menu item:** The Library empty state secondary line (`Drop files here, or use File → Import.`) references an import mechanism not yet specced. If the Library pane spec establishes a different import flow (drag-only, toolbar button, etc.), update this string. The primary line (`No assets yet.`) is stable regardless.
- **"Items" as the unit noun:** Confirmed by user direction 2026-05-25. Status/progress strings use "items" throughout. "Drop files here" in the Library empty state retains "files" because it describes a physical drag-drop action involving literal files — appropriate for a file-system DAM regardless of the abstract item model.
- **Plugin string validation:** The shell renders plugin-provided strings as text nodes. Should there be a length enforcement at plugin registration time (e.g., reject a plugin whose `name` exceeds 40 characters)? Or truncate at render time? Current spec assumes well-formed plugins; enforcement mechanism deferred to plugin architecture spec.

---

_Next: Task 13 — Keyboard Navigation Map_
