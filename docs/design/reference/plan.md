# Design Plan: Digital Asset Manager

> **For agentic workers:** REQUIRED: Use designpowers:designpowers-critique to review completed work against this plan.

**Goal:** Design the core Library + Working Set application — the two persistent surfaces and the loop that connects them — for a single MIDI-first power user.

**Design Direction:** `docs/design/reference/brief.md` and `docs/design/reference/strategy.md`

**Personas:** Primary — power-user owner-operator (brief §Users). Formal inclusive-personas pass is pending and must run before visual design begins. Ability spectrum requirements are in brief §Ability Spectrum Considerations.

---

## Task 1: App Shell & Navigation Model

**Files:** `docs/design/specs/shell/app-shell.md` (spec), component scaffolding TBD

Define the top-level application structure: two persistent surfaces (Library, Working Set), how they coexist spatially, and what global chrome exists (if any).

- [ ] Define the two-pane relationship: fixed split layout referencing professional tool conventions (Ableton, Raycast, Figma norms); panes are fixed in position and size in v1 with the expectation of user-adjustable layout in a future iteration
- [ ] Determine whether any persistent chrome exists beyond the two panes (title bar, global toolbar, status bar)
- [ ] Define how focus/attention moves between panes — what signals which pane is "active"
- [ ] Specify what persists across sessions (last Library position, column widths — Working Set does NOT persist across sessions)

**Accessibility check:** Focus management between panes must be fully keyboard-operable. The active pane must be communicated beyond visual highlight (ARIA roles, landmarks, or announced transitions).

**Verification:** A user can reach every surface from keyboard alone. The two-pane relationship is unambiguous — at no point is it unclear which pane owns the user's current action.

---

## Task 2: Library Pane — Layout & Information Architecture

**Files:** `docs/design/specs/library/library-layout.md`

Define how the collection is presented and navigated. The Library is the source of truth — always present, never mutated by operations.

- [ ] Define the primary browsing view (list vs. grid — and whether both are supported)
- [ ] Identify which metadata fields are surfaced in the default view vs. revealed on expand/hover
- [ ] Define the search and filter surface: where it lives, how it behaves, what it filters on
- [ ] Define sort options and their defaults
- [ ] Specify how the Library communicates the current filtered state (how many items shown, active filters visible)

**Accessibility check:** Column headers (if table view) must be proper `<th>` with sort state announced. Filter state must be communicated to screen readers. Collection size and filtered count must be announced when they change.

**Verification:** A user can find a specific asset in a collection of hundreds using only search/filter without remembering folder paths. The current view state (filters active, sort order) is always visible.

---

## Task 3: Working Set Pane — Layout & Zone Structure

**Files:** `docs/design/specs/working-set/working-set-layout.md`

Define the Working Set surface. It has two zones: current contents and the operation interface. Output artifacts land in the Library — there is no output zone in the Working Set.

- [ ] Define the two zones and their spatial relationship (contents / operation interface)
- [ ] Determine how zone prominence shifts as the user moves through the loop (selecting → operating)
- [ ] Define the empty Working Set state — what the user sees before anything is added
- [ ] Specify what metadata is shown per item in the Working Set (may differ from Library view)

**Accessibility check:** The Working Set count must update live and be accessible. Operation state changes must be announced to screen readers.

**Verification:** At any point in the loop, the user can answer: what's in my Working Set, and what operation am I about to run? Without scrolling or hunting.

---

## Task 4: Asset List Item — Library Component

**Files:** `docs/design/specs/components/asset-list-item.md`

The repeating unit in the Library. Every design decision here compounds across the entire collection view.

- [ ] Define the anatomy: which fields are always visible, which are secondary
- [ ] Define selection state (single, multi, range) — visual and non-visual indicators
- [ ] Define hover state and what (if anything) it reveals
- [ ] Define keyboard interaction (arrow navigation, space to select, enter to open/inspect)
- [ ] Specify how MIDI-specific metadata is shown without coupling the component to MIDI (plugin concern, not core)

**Accessibility check:** Selection state must not rely on color alone. Multi-select state must be announced (`X items selected`). Item must have a meaningful accessible name beyond filename.

**Verification:** The component works identically with no mouse input. Selected vs. unselected is distinguishable by a user with color-blindness or on a monochrome display.

---

## Task 5: Asset Item — Working Set Component

**Files:** `docs/design/specs/components/working-set-item.md`

Working Set items may need to differ from Library items — they carry operation context (was this input? output? modified?), and the set is typically smaller and more focused than the full Library.

- [ ] Determine how Working Set items communicate their origin (selected from library, output of operation, or both)
- [ ] Define how output items differ visually from input items, if at all
- [ ] Define remove-from-working-set affordance (and whether it's available mid-operation)
- [ ] Specify keyboard interaction within the Working Set list

**Accessibility check:** Origin/status indicators (input, output, modified) must not rely on color alone. Remove action must be keyboard-accessible and must announce the result (`Removed. 4 items remain in Working Set`).

**Verification:** A user can distinguish, at a glance, which items are original selections vs. operation outputs.

---

## Task 6: Selection Model & Interaction

**Files:** `docs/design/specs/interactions/selection.md`

Selection is the entry point to everything. It must be fast, flexible, and unambiguous.

- [ ] Define the full selection interaction set: click, shift-click (range), cmd-click (multi), keyboard equivalents for each
- [ ] Define the "add all filtered results to Working Set" action
- [ ] Define "clear Working Set" — when it's available and what confirmation (if any) it requires
- [ ] Define selection count display and where it lives
- [ ] Specify what happens to selection state when Library filters change (does selection persist or reset?)

**Accessibility check:** Every selection gesture must have a keyboard equivalent. Selection count must be live-announced. Range selection via keyboard (`Shift+Arrow`) must work correctly.

**Verification:** A user can select 50 non-contiguous items using only a keyboard. The count is visible and accurate throughout.

---

## Task 7: Library → Working Set Transfer

**Files:** `docs/design/specs/interactions/transfer.md`

The gesture(s) for moving assets from Library into the Working Set. Must feel effortless — this is performed constantly.

- [ ] Define the primary transfer gesture (drag? button? keyboard shortcut?)
- [ ] Define the secondary/backup gesture for keyboard-only users
- [ ] Specify feedback when items are added (Working Set count updates, animation if motion is appropriate)
- [ ] Define what happens when an item already in the Working Set is added again (ignore, duplicate, or alert)
- [ ] Specify reduced-motion behavior for any add animation

**Accessibility check:** Transfer must be fully operable without a mouse. Completion of the transfer must be announced (`3 items added. Working Set now contains 7 items`). Drag-and-drop, if used, must have a keyboard alternative.

**Verification:** A power user can transfer 20 items from Library to Working Set without touching a mouse. The Working Set reflects the addition immediately and accurately.

---

## Task 8: Operation Palette

**Files:** `docs/design/specs/components/operation-palette.md`

The surface where the user chooses what to do with the Working Set. Operations are first-class objects — the palette is how the user builds their vocabulary.

- [ ] Define the palette as a fixed panel (always visible, not triggered or modal); dynamic configuration controls surface within or alongside the panel when an operation is selected
- [ ] Define how operations are listed and grouped (by type? by recency? by asset compatibility?)
- [ ] Define how saved/named operations appear vs. built-in operations
- [ ] Define the search/filter within the palette for large operation sets
- [ ] Specify what information is shown per operation before selection (name, description, last-used date?)

**Accessibility check:** Palette must be keyboard-navigable. Operation names must be in plain language (not format strings or technical identifiers). Each operation must have an accessible description.

**Verification:** A user can find and launch an operation using only the keyboard in under 5 keystrokes for common cases. The palette is scannable — a user can tell at a glance what operations are available without reading every item.

---

## Task 9: Operation Configuration Panel

**Files:** `docs/design/specs/components/operation-config.md`

After an operation is selected, the user configures its parameters before running. This is where "I know what this will do before I do it" lives or dies.

- [ ] Define the configuration panel layout: where it appears, how it relates to the palette and the Working Set
- [ ] Define parameter input patterns (dropdowns, numeric fields, file pickers, toggles) and their defaults
- [ ] Define the output destination declaration — where output will land must be set here, not discovered after
- [ ] Define the run trigger (button, keyboard shortcut, or both)
- [ ] Specify what a "save as named operation" interaction looks like

**Accessibility check:** All inputs must have explicit labels. Defaults must be visible before the user interacts. Destructive operations must require confirmation. The run trigger must be keyboard-accessible.

**Verification:** A user can configure and run an operation without ambiguity about what will happen or where output will go. The output destination is declared before the run, never after.

---

## Task 10: Operation Execution, Progress & Outcome

**Files:** `docs/design/specs/components/operation-progress.md`

Operations are synchronous and modal. When an operation runs, that is the current thing. When it finishes, the surface transitions inline to a completion summary — then the app stops. The user decides what to do next. Output artifacts land in the Library.

- [ ] Define the progress surface: where it appears within the Working Set pane, what it shows (file count processed, percentage, time estimate)
- [ ] Define cancellation — is it available mid-operation, and what does a cancelled operation produce?
- [ ] Define the inline transition from "running" to "complete" — the outcome summary replaces or extends the progress surface without navigation
- [ ] Define the completion summary: files processed, errors encountered (with links to a detail log), and a note that output is available in the Library
- [ ] Define error and partial-failure states (some files fail, others succeed) — the summary must make the split clear
- [ ] Define a convenience affordance for loading recent operation output into the Working Set — low priority, not prominent; the user can always find output in the Library via search

**Accessibility check:** Progress must be communicated in text and count, not color or animation alone. Completion and errors must be announced to screen readers. Any progress animation must respect `prefers-reduced-motion`. The completion summary must be reachable by keyboard without requiring a mouse interaction.

**Verification:** A user running an operation on 200 files sees honest progress, can cancel if needed, and on completion sees a clear summary of what succeeded, what failed, and where to find the output — without leaving the Working Set pane or taking any required action.

---

## Task 11: Operation History & Session State

**Files:** `docs/design/specs/interactions/history.md`

The Working Set does not persist across sessions — each session starts with an empty Working Set. Within a session, operations have history. This task defines what is remembered during a session and how the user navigates it.

- [ ] Define what operation history is retained within a session (last N operations? full session log?)
- [ ] Define how history is displayed (log format? undo stack? timeline?)
- [ ] Define what can be undone vs. what is irreversible — and how that distinction is communicated before the operation runs, not discovered after
- [ ] Specify what "start fresh" looks like (clear Working Set and session history)

**Accessibility check:** History log must be navigable by keyboard. Undone state changes must be announced. Irreversible actions must be clearly labeled as such before execution, not in the history log.

**Verification:** A user can review what operations they ran in the current session and undo the last operation if it produced unexpected output. A user who closes and reopens the app starts with a clean Working Set — this is expected behavior, not a loss.

---

## Task 12: Operation Naming & Copy Standards

**Files:** `docs/design/specs/content/operation-copy.md`

Every operation name, label, and status string the user sees. Core UI vocabulary is generic — domain-specific language belongs to the plugin/module layer, not to the application shell.

- [ ] Define the naming convention for core UI actions (generic verbs: "Run", "Configure", "Cancel", "Clear Working Set" — not asset-type terms)
- [ ] Define how operation names are sourced: the plugin/module provides the operation's display name (e.g., "Normalize Velocity") and description; the core app renders it using generic affordances — the application shell never constructs or hardcodes these strings
- [ ] Define status messages for execution states (running, complete, partial failure, cancelled) — these must work for any asset type
- [ ] Define empty state copy for Library (no assets found) and Working Set (nothing added yet) — generic, not MIDI-specific
- [ ] Define error message patterns (actionable, specific, no stack traces) — core errors in generic language; plugin errors may use domain language in detail views

**Accessibility check:** All core copy must be written at Grade 8 reading level or below. Error messages must state what happened and what the user can do — not just that something failed.

**Verification:** Every string rendered by the application shell is asset-type agnostic. A future image module requires zero changes to core copy. Domain-specific strings appear only in plugin-provided surfaces.

---

## Task 13: Keyboard Navigation Map

**Files:** `docs/design/specs/accessibility/keyboard-map.md`

A complete map of keyboard interactions for the full core loop. This is the source of truth for implementation and accessibility review.

- [ ] Document every keyboard shortcut in the core loop (Library navigation, selection, transfer, palette, run, inspect, recurse)
- [ ] Identify any gaps — interactions that currently have no keyboard path
- [ ] Define tab order for each major surface
- [ ] Specify focus indicators: what focused elements look like (must meet WCAG 2.1 AA focus visibility)
- [ ] Validate that no interaction requires simultaneous key combinations that are inaccessible to one-handed users

**Accessibility check:** This task *is* the accessibility check for keyboard navigation. All gaps found here must be resolved before the plan is considered complete.

**Verification:** A user can complete the full core loop (select → add to Working Set → choose operation → configure → run → inspect → recurse) without touching a mouse. Every step is documented in this map.

---

## Pending Before Visual Design

The following must happen before `ui-composition` begins — they are not tasks in this plan but are dependencies:

- **`design-taste`** — visual language and aesthetic direction have not been calibrated. The brief names Ableton/Raycast/Figma as reference space; formal calibration is required before color, type, and component styling decisions are made.
- **`inclusive-personas`** — formal persona definitions are pending. The brief's ability spectrum notes are a starting point, not a substitute. Personas are required before the heuristic-evaluator and synthetic-user-testing passes.

---

_Plan written: 2026-05-23. Updated 2026-05-23 with user decisions on layout model, operation modality, output routing, session persistence, palette model, and copy standards. Ready for user approval before execution._
