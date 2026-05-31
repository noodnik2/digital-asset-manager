# Operation Execution, Progress & Outcome

_Task 10 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

This spec covers the third and fourth states of the operation modal: Running and Complete. The modal does not close between states — it transitions internally. The Config step (Task 9) delivers the user here when they press Run or `⌘Return`.

**Scope:** Running state, abort flow, transition to Complete, completion summary (both operation flavors), error and partial-failure states, cancelled state, and the convenience affordance for loading output into the Working Set. The Config step is Task 9. The Palette step is Task 8.

**Operation flavors carry through from Task 9.** Task 9 defined two flavors — Flavor A (creates new files; output lands in Library) and Flavor B (modifies source files in place). The Complete state differs substantially between them. Both are specced here.

---

## Modal Flow

| Step | State | Task |
|---|---|---|
| 1 | Palette — browse and select | Task 8 |
| 2 | Config — configure parameters | Task 9 |
| **3** | **Running — operation in progress** | **This spec** |
| **4** | **Complete — outcome summary** | **This spec** |

---

## Running State

### Header

```
  [Operation Name] — Running                              [×]
```

| Element | Style | Behavior |
|---|---|---|
| Operation name | `--snow`, 14px, weight 600. Left-centered. | Static. Not interactive. |
| `— Running` | `--fog`, 14px, weight 400, appended to name. | Static indicator of modal state. |
| `[×]` | `--fog`, hover → `--snow`. Right-aligned. | Triggers the abort confirmation (same as `[Abort]`). Does not close immediately. |

`← Change operation` is absent — the operation has begun and cannot be changed mid-run.

Header height: 48px. Same as Palette and Config steps.

---

### File List

The file list shows **all Working Set items from the start of the operation**, each with a status indicator. This gives honest progress: the user sees the full scope (all N files) before a single file has been processed, not a growing list that obscures how much work remains.

```
  ·  pending-file-a.ext
  ·  pending-file-b.ext
  ⟳  current-file-c.ext         ← currently processing
  ✓  processed-file-a.ext
  ✗  failed-file-b.ext          — Plugin error: reason truncated…
```

| Indicator | Meaning | Color | Motion |
|---|---|---|---|
| `·` (U+00B7 middle dot) | Pending — not yet processed | `--fog` | None |
| `⟳` (U+27F3) | Currently processing | `--amber` | 1 full rotation per 1.2s |
| `✓` | Processed successfully | `--jade` | None |
| `✗` | Failed | `--rose` | None |

**Row anatomy:**

```
  [indicator]  [filename]                   [error reason — failed rows only]
```

- Indicator: 16px fixed-width column
- Filename: `--snow` for success/current; `--fog` for pending; `--rose` for failed. `--font-sans`, 13px.
- Error reason (failed rows only): `--rose`, 12px, truncated at 50 characters with ellipsis. Plugin-provided.

**Layout and scroll:**
- Row height: 32px (`--row-h-compact`). Dense — this is a status surface, not a selection surface.
- The file list is the only scrollable region in the Running state. Header, progress bar, and footer are fixed.
- Auto-scrolls to keep the `⟳` (current) item visible. Manual scrolling (drag or keyboard) temporarily overrides auto-scroll; auto-scroll resumes on the next file transition.

**Working Set contents are unchanged.** The WS behind the modal backdrop still shows the source items. The operation does not modify or clear the WS — output lands in the Library per the decisions log ("Output lands in Library after operation completes; Working Set is not auto-updated"). This is always true, for both flavors.

**Reduced motion:** The `⟳` rotation stops; the indicator displays as a static `◌` (U+25CB). All status transitions (pending → done) are data updates, not decorative animation — they apply normally.

---

### Progress Bar

```
  [████████████████░░░░░░░░░░░░░░░░░░░]   64 of 200 files
```

| Property | Value |
|---|---|
| Height | 4px |
| Fill | `--amber` |
| Track | `--surface` |
| Border-radius | 2px |
| Placement | Fixed zone, below the file list, above the footer |
| Label | `64 of 200 files` — `--fog`, 12px, `--font-mono`. Right-aligned, inline with the bar. |

The progress bar is always determinate. The WS item count is known before the operation starts, so 0–100% progress is calculable from the start.

**No time estimate in v1.** The file count and progress bar are sufficient feedback. Time estimates for local file operations are unreliable until multiple samples are available; for fast operations they are noise. This can be revisited once usage shows operations where elapsed-time prediction adds value.

---

### Footer — Running

```
                                                [Abort]
```

| Element | Style |
|---|---|
| `[Abort]` | Ghost button. `--snow` text, `--line` border. Hover: border → `--rose`, text → `--rose`. Right-aligned. |

`[Abort]` is not amber (amber = execute/affirm) and not `--rose` at rest — it is a neutral ghost button whose hover state signals destructive potential.

---

### Abort Confirmation

When the user clicks `[Abort]` or `[×]` during Running, the footer transforms inline. The file list and progress bar remain visible and the operation continues momentarily while the user decides.

```
  Abort? [N] files already processed. Output is in the Library.   [Keep running] [Abort]
```

| Element | Style |
|---|---|
| Warning text | `--fog`, 13px, left-aligned in footer |
| `[Keep running]` | Ghost button. Dismisses confirmation; operation continues. |
| `[Abort]` | `--rose` background, white text, weight 600. Right-aligned. Confirms abort. |

**Behavior:**
- `[Keep running]` or `Escape`: dismiss confirmation; restore original `[Abort]` footer; operation continues uninterrupted
- `[Abort]` or `Return` (while focus is on `[Abort]`): operation stops after the current file finishes (no mid-file interrupt); modal transitions to Cancelled state (see below)
- On confirmation appear: focus moves to `[Keep running]`

The confirmation text uses `role="alert"` — announced immediately to screen readers on appearance.

---

## Transition: Running → Complete

When all files have been processed (or the last file finishes after an abort is confirmed):

1. The `⟳` indicator resolves to `✓` or `✗` for the final file
2. Progress bar reaches 100% (or the percentage reached for cancelled)
3. After a 400ms pause: the header text updates from `— Running` to `— Complete` (or `— Cancelled`)
4. The footer updates: `[Abort]` → `[Close]` (and the load-output affordance, if applicable for Flavor A)
5. Focus moves to `[Close]`

The 400ms pause is a timing gate, not an animation — it ensures the user registers "done" before the summary appears. No content animation on the transition; the data update (final status indicators settling) is the signal.

**Reduced motion:** The 400ms pause applies unchanged. It is not an animation.

---

## Complete State — Flavor A (Creates New Files)

### Header

```
  [Operation Name] — Complete                             [×]
```

`[×]` closes the modal with no confirmation — the operation is finished; nothing is in-progress.

---

### Summary

**All succeeded:**

```
  ✓  200 files processed
```

**With failures:**

```
  ✓  186 files processed
  ✗  14 files failed
```

`✓` in `--jade`; `✗` in `--rose`. Counts in `--snow`, 14px, weight 500.

**Failure detail** (shown below summary when any files failed):

```
  ✗  bad-file-01.ext   — Corrupted header; could not read
  ✗  bad-file-02.ext   — Plugin error: unexpected time signature
  ✗  bad-file-03.ext   — Permission denied
  …
```

`--rose`, 13px. Error reason: plugin-provided, truncated at 50 characters with ellipsis. If there are more than 10 failures: list the first 10 then append `and [N] more.` A full error log is out of scope for v1.

---

### Library Output Hint

```
  OUTPUT
  Your output is in the Library.    [Search for recent output →]
```

| Element | Style |
|---|---|
| `OUTPUT` label | Uppercase, `--fog`, `--text-h3`, `--tracking-wide` — same section label pattern as Config output zone |
| Body text | `--fog`, 13px |
| `[Search for recent output →]` | `--amber`, 13px, underline on hover. Activates a pre-filled Library search. |

**Output-locator contract:**

The operation plugin MAY declare an `outputLocator` string — a search term, filename suffix, or tag that identifies its output (e.g., `"_normalized"`). If declared, the search link populates the Library search with that value.

If the plugin does not declare an `outputLocator`, the app falls back to a time-based locator: files added to the Library since the operation started. The link text in this case reads `Search: files added this session`.

Clicking the search link closes the modal and focuses the Library search input with the pre-populated query.

---

### Footer — Flavor A Complete

```
  Load output into Working Set                            [Close]
```

| Element | Style |
|---|---|
| `Load output into Working Set` | Text-weight link. `--fog`, 13px, underline on hover. Left-aligned. |
| `[Close]` | Ghost button. `--snow` text, `--line` border. Right-aligned. |

**`Load output into Working Set` behavior:**
1. Closes the modal
2. Clears the Working Set (the source files from this operation)
3. Loads the output files into the Working Set, in Library visual order

The WS source files are replaced because the user's intent — reaching for this affordance — is to operate on the output next. The modal's `aria-modal` blocked WS modification during the run, so the WS still contains exactly the source files; replacement is clean.

**Framing:** This is a convenience tool the user actively reaches for, not a suggestion the app proposes. Its visual treatment reflects this — text-weight link, low contrast, left side of the footer. The app does not frame it as "next step" language.

**When this affordance is hidden:** If the plugin provides no `outputLocator` and the app cannot reliably identify the exact output file set (edge case: external writes to the watched folder during the operation), the link is hidden. The user can still find output via Library search manually.

**This affordance does not exist for Flavor B.** Flavor B modifies source files in place — the source files are the output. Loading them into the WS would be a no-op (they are already there).

---

## Complete State — Flavor B (Modifies Source Files In Place)

### Header

```
  [Operation Name] — Complete                             [×]
```

Same as Flavor A.

---

### Summary

**All succeeded:**

```
  ✓  200 files modified in place
```

**With failures:**

```
  ✓  186 files modified in place
  ✗  14 files failed
```

Failure detail list follows the same pattern as Flavor A.

---

### No Library Hint

There is no OUTPUT section for Flavor B. The files were modified in place — they are not new Library entries; they were already present. The Library will reflect updated metadata when it next refreshes. Library refresh behavior on external modification is a flag for the Library pane spec (Task 2).

---

### Footer — Flavor B Complete

```
                                                         [Close]
```

`[Close]` only. No load-output affordance.

---

## Cancelled State

When the user confirms an abort:

### Header

```
  [Operation Name] — Cancelled                            [×]
```

### Summary

```
  ◌  Cancelled after [N] of [M] files

  [N] files were processed before cancellation.
  Partial output is in the Library.
```

`◌` (U+25CB, white circle) in `--fog` — neutral indicator for a neutral state. Counts in `--snow`, 14px, weight 500.

The [M−N] unprocessed files have no output. The [N] processed files' output is in the Library and is unaffected by the cancellation.

### Footer — Cancelled

```
                                                         [Close]
```

No load-output affordance. Partial output is an incomplete result set; automatically loading it into the WS without the user explicitly identifying the subset would create ambiguity.

---

## Status Bar During Operations

The status bar (specced in Task 1) carries a secondary progress surface visible behind the modal backdrop. The user can always see operation status even while the file list within the modal is scrolled.

| Phase | Status bar content |
|---|---|
| Running | `[Operation Name] — 64 of 200` + jade pulsing dot |
| Complete, all succeeded | `[Operation Name] — complete` in `--jade`; fades after 4s |
| Complete, with failures | `[Operation Name] — complete with errors` in `--rose`; persists until next operation |
| Cancelled | `[Operation Name] — cancelled` in `--fog`; fades after 4s |
| All files failed | `[Operation Name] — failed` in `--rose`; persists until next operation |

---

## Screen Reader Announcements

Progress announcements are throttled. Announcing every file in a 200-file operation would be intolerably chatty.

| Moment | Announcement | Live region |
|---|---|---|
| Operation starts | `"[Operation name] started. [N] files queued."` | `aria-live="polite"` |
| Every 25% of files complete | `"[N] of [M] files processed."` | `aria-live="polite"` |
| Abort confirmation appears | `"Abort operation? [N] files already processed. Output is in the Library."` | `role="alert"` (`assertive`) |
| Cancelled | `"[Operation name] cancelled. [N] of [M] files processed."` | `aria-live="assertive"` |
| Complete, no errors | `"[Operation name] complete. [N] files processed."` | `aria-live="assertive"` |
| Complete, with errors | `"[Operation name] complete. [N] processed, [M] failed."` | `aria-live="assertive"` |

The 25% milestone equals every 50 files for a 200-file operation. For small operations (fewer than 8 files), the 25% interval fires rapidly — skip milestones for small operations and announce on completion only.

Individual file failures are not announced during the run (too chatty). The failure count is announced in the completion summary.

---

## Accessibility

- [ ] `role="dialog"` with `aria-modal="true"` carries through from Palette/Config — already established in Task 8
- [ ] On transition Config → Running: focus moves to `[Abort]`
- [ ] On transition to Complete/Cancelled: focus moves to `[Close]`
- [ ] On abort confirmation appear: focus moves to `[Keep running]`
- [ ] File list: `role="list"`, each row `role="listitem"`. Not `role="listbox"` — rows are not selectable.
- [ ] Each row's accessible name includes filename and status: e.g., `"current-file.ext — processing"`, `"output-file.ext — complete"`, `"bad-file.ext — failed: Corrupted header"`
- [ ] `⟳` rotation: CSS animation; `prefers-reduced-motion: reduce` → `animation: none`; indicator displays as static `◌`
- [ ] Progress bar: `role="progressbar"`, `aria-valuenow=[n]`, `aria-valuemin="0"`, `aria-valuemax=[total]`, `aria-label="[N] of [M] files processed"`
- [ ] `[Abort]` button: `aria-label="Abort operation"`
- [ ] `[×]` during Running: `aria-label="Abort operation"` — not "Close", because its behavior is abort, not dismiss
- [ ] `[×]` during Complete/Cancelled: `aria-label="Close operation summary"` — reverts to dismiss behavior
- [ ] Abort confirmation text: `role="alert"` — announced immediately on appearance
- [ ] Complete summary counts: static text in a settled state; no live region needed
- [ ] Failure detail list: `role="list"`, each failed file a `role="listitem"` with accessible text including filename and error reason
- [ ] Library search link: `aria-label="Search Library for operation output"`
- [ ] `Load output into Working Set` link: `aria-label="Load operation output into Working Set"` (full description, not just the visible label)
- [ ] Status bar progress: live region announced without requiring focus (already established in Task 1)

---

## Verification

**Criterion:** A user running an operation on 200 files sees honest progress, can cancel if needed, and on completion sees a clear summary of what succeeded, what failed, and where to find the output — without leaving the Working Set pane or taking any required action.

| Question | Where the answer is | Action required? |
|---|---|---|
| How many files total? | File list — all 200 shown from start | No |
| Which file is currently processing? | `⟳` indicator, auto-scrolled into view | No |
| How far along am I? | Progress bar + `64 of 200 files` label | No |
| Did anything fail during the run? | `✗` indicator in file list (visible while running) | No |
| Can I stop this? | `[Abort]` in footer | No |
| What succeeded on completion? | Summary: `✓ 186 files processed` | No |
| What failed? | Failure detail list in Complete summary | No |
| Where did the output go? | Library output hint (Flavor A) | No |
| How do I work with the output next? | `Load output into Working Set` (optional, text link) | Optional |

**Keyboard walkthrough — Config → Complete with no errors:**

Starting from Config, `⌘Return` pressed.

1. Modal transitions to Running; focus → `[Abort]`
2. User observes progress (no action required)
3. Operation finishes; 400ms pause; modal transitions to Complete; focus → `[Close]`
4. `Return` → modal closes; Library and Working Set pane regain interaction
5. Alternative: `Shift+Tab` → `Load output into Working Set` link → `Return` → modal closes, WS reloaded with output

**Keyboard walkthrough — Abort mid-run:**

1. Running state; focus on `[Abort]`; `Return` → abort confirmation appears; focus → `[Keep running]`
2. `Tab` → focus → `[Abort]`; `Return` → operation stops after current file; modal transitions to Cancelled
3. Focus → `[Close]`; `Return` → modal closes

---

## Open Questions

- **Log access for failures:** The spec caps the displayed failure list at 10 items with "and N more." A full error log is useful for operations with many failures. Where does the log surface (disk path, in-app log viewer, a link in the status bar)? Deferred to a future iteration.
- **Library refresh on Flavor B completion:** Source files were modified in place; the Library must reflect updated metadata (modified timestamp, any plugin-declared columns). Is refresh automatic on operation completion, or user-triggered? Flag for the Library pane spec (Task 2) if not addressed there.
- **`outputLocator` race condition:** When the plugin declares no `outputLocator` and the app uses a time-based fallback, files added by an external process during the operation window could appear in the search results. Acceptable edge case for v1; document as a known limitation.

---

_Next: Task 11 — Operation History & Session State_
