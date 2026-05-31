# Operation History & Session State

_Task 11 of the Digital Asset Manager design plan._
_Spec written: 2026-05-25_

---

## Overview

This spec defines what the app remembers within a session, what persists across sessions, and what happens to the status bar after an operation modal is dismissed.

**What is not in this spec:** A session history log, an undo stack, and a history UI surface are all out of scope for v1. The operation modal (Tasks 8–10) is the operation's reference surface while it is open. Once dismissed, that operation's detail is gone.

---

## Session State Model

### What persists within a session (until app quits)

| State | Lifecycle | Reference |
|---|---|---|
| Working Set contents | Until explicitly cleared or app quits | Task 3 |
| Selected operation name | Until a different operation is selected | Task 8 |
| Operation parameters and output destination | Until run, or until `← Change operation` is pressed | Task 9 |
| Status bar last-op indicator | Until the next operation starts, or app quits | This spec |

### What persists across sessions (survives app restart)

| State | Notes |
|---|---|
| Library column widths | Stored in app settings |
| Library sort order and active filters | Stored in app settings |

### What does not persist across sessions

| State | Notes |
|---|---|
| Working Set contents | Each session starts with an empty Working Set — by design |
| Library selection | Starts cleared each session |
| Operation selection and parameters | Cleared on app quit |
| Status bar last-op indicator | No last-op shown at launch |

The empty Working Set on launch is expected behavior, not a loss. There is no need to communicate this to the user beyond the Working Set empty state (already specced in Task 3).

---

## Operation History

No operation history log in v1.

The operation modal (Tasks 9–10) is the user's reference for what just ran — summary counts, failure detail, and the output location hint are all available in the Complete state while the modal is open. Once the user closes the modal, that record is gone.

There is no session log, no history panel, and no cross-operation summary view in this version.

---

## Status Bar: Last Operation Outcome

After the operation modal is dismissed, the status bar's right-hand region retains the last operation's outcome. This extends the status bar behavior specced in Task 10.

The status bar has two regions:

```
  12 items                         Normalize Velocity — 47 complete
  └── left: WS count              └── right: last-op outcome
```

### Last-op indicator states

| Outcome | Right-region content | Color |
|---|---|---|
| Complete, all succeeded | `[Operation Name] — [N] complete` | `--fog` (settled/historical) |
| Complete, with failures | `[Operation Name] — [N] complete · [M] failed` | `--rose` |
| Cancelled | `[Operation Name] — cancelled` | `--fog` |
| All files failed | `[Operation Name] — failed` | `--rose` |
| No operation run this session | _(empty)_ | — |

**Relationship to Task 10's status bar spec:**

Task 10 defines the status bar during an operation (running, transitioning). The "fades after 4s" behavior in Task 10 describes the completion flash — the brief transition as the operation finishes. After that transition, the content persists at `--fog` until cleared. Task 11 governs the persistent post-modal state; Task 10 governs the live-operation state.

### When the last-op indicator clears

The right region reverts to empty when:

- The operation palette opens (a new operation is being selected)
- The app restarts

**WS Clear does not clear the last-op indicator.** The status bar reflects what last ran, independent of current WS contents. The user may clear the basket and still want to see what the previous operation produced.

---

## Undo

No undo in v1.

Pre-run disclosure — the only mechanism for communicating irreversibility — is handled by the destructive warning in the Config step (Task 9). That warning is shown for any operation that modifies files in place and is not dismissible.

If an operation produced unexpected output, the user's paths are:

- Inspect output in the Library (using the search hint in the Complete modal, or Library search manually)
- Remove unwanted output files from the Library manually
- Re-run with adjusted parameters on the same or a revised Working Set

---

## "Start Fresh"

Within a session, the Clear Working Set button (Task 3) empties the basket. This is the primary "start fresh" gesture.

**After WS Clear:**
- Working Set is empty
- Selected operation name and parameters are retained (per Task 9: they persist through WS Clear)
- Status bar last-op indicator persists

A fully clean session state requires quitting and relaunching the app. No in-session "reset everything" action exists.

---

## Accessibility

- [ ] The status bar last-op indicator is static display — not a live region; it does not interrupt screen reader announcements when it updates
- [ ] When the operation modal closes (`[Close]` or `[×]`), focus returns to the `[⚡ Operation Name]` button in the Working Set toolbar (the element that originally opened the modal)
- [ ] The last-op indicator text is readable as static text when the status bar region is focused; it is not announced on change
- [ ] Screen reader completion announcements from Task 10 fire at operation completion, inside the modal — the status bar indicator does not duplicate those announcements

---

## Verification

**From the plan:** A user can review what operations they ran in the current session and undo the last operation if it produced unexpected output. A user who closes and reopens the app starts with a clean Working Set — this is expected behavior, not a loss.

| Plan criterion | Status | Notes |
|---|---|---|
| Review operations run this session | Partial — last op visible in status bar; full session log is out of scope v1 | |
| Undo last operation | Not in v1 | Pre-run disclosure (Task 9) handles irreversibility |
| Clean Working Set on relaunch | Met — Working Set does not persist across sessions | |
| App restart is understood as a clean start, not a loss | Met — empty state on launch is the designed behavior | |

---

## Open Questions

None.

---

_Next: Task 12 — Operation Naming & Copy Standards_
