# Personas — Digital Asset Manager

_Designpowers inclusive-personas pass. Light pass for v1 — 4 personas. Designed for reference by heuristic-evaluator and synthetic-user-testing._

_Written: 2026-05-23_

---

## Persona 1 — The Developer-Operator (Primary)

**Context:** Owns the tool. Built or is building it for themselves. Has a large MIDI collection — hundreds or thousands of files accumulated over years — and a clear idea of what they want to do with it. Has been managing the collection with ad-hoc scripts and folder structures up to now. The app exists because the tooling they needed didn't.

**Abilities and conditions:** No permanent accessibility considerations. Situationally: often working across multiple windows and applications simultaneously; context-switching is frequent.

**Technology:** macOS desktop, local deployment, command-line comfortable. Keyboard-first by strong preference — reaches for shortcuts before reaching for the mouse. High technical confidence; no tolerance for UI that condescends.

**Goals:**
- Select a specific subset of assets quickly (search, filter, or manual multi-select)
- Run a batch operation on the selection and inspect the output without leaving the app
- Chain operations: output of one run becomes input to the next, in one gesture
- Trust the tool to do what it says and stop — no auto-suggestions, no next-step nudges

**Frustrations:**
- Tools that require confirmation dialogs for actions that are clearly reversible
- Status that requires scrolling or navigation to find
- Anything that assumes they don't know what they're doing

**Environment:** Home office, large monitor, quiet. Often late evening. Not in a hurry on most sessions, but when batch-processing, wants to queue it and step away.

---

## Persona 2 — The Technical Creative (Primary)

**Context:** A musician or sound designer with a large personal sample and MIDI library. Technically literate — comfortable with file systems, has used a DAW for years — but not a developer. Chose this tool over writing their own scripts because they wanted the workflow without the maintenance. Uses the app regularly for collection management and pre-production prep.

**Abilities and conditions:** Red-green color deficiency (deuteranopia). Perceives amber/yellow distinctly from red and green, but cannot distinguish red from green reliably. Status indicators that rely on red/green color alone are ambiguous.

**Technology:** macOS, local deployment. Keyboard shortcuts for common actions; mouse for exploration and selection. Expects things to be discoverable — won't read documentation, but will explore menus.

**Goals:**
- Browse and filter a large library to find assets that match criteria (key, tempo, tag)
- Build a Working Set for a specific session (e.g., "all the sketches in D minor from last year")
- Run an operation and verify the output sounds right before moving on
- Save a named operation so they don't have to reconfigure it next time

**Frustrations:**
- Status indicators that use color alone — can't tell "complete" from "failed" at a glance
- Filters that reset unexpectedly — losing the current view state mid-session
- Operations that start without a clear statement of what they will do and where output will go

**Environment:** Home studio. Multiple windows open — DAW, file manager, browser. Moderate context-switching. Often working in low light.

**Key design implication:** Every status, error, and success state must carry a non-color signal (icon, label, or shape). Color alone is never sufficient.

---

## Persona 3 — The Keyboard-Dependent Operator (Edge Case)

**Context:** A senior developer and longtime MIDI collector with essential tremor. Mouse use is unreliable — fine motor control is limited enough that precise clicking is effortful and error-prone. Has adapted their entire computing workflow to be keyboard-first: browser, editor, file management. Uses this tool because it's the right tool for the job, but won't tolerate mouse-only interactions.

**Abilities and conditions:** Essential tremor (permanent motor condition). Cannot reliably perform precise click targets under ~24px, drag-and-drop interactions, or sustained hover states. Keyboard navigation is not a preference — it is a requirement.

**Technology:** macOS, keyboard-driven workflow. May use assistive keyboard features (sticky keys, slow keys). Does not use a screen reader — is fully sighted.

**Goals:**
- Complete the full core loop (select → Working Set → operation → inspect → recurse) without touching a mouse
- Navigate large library lists using arrow keys and search
- Trigger operations via keyboard shortcut, not button click
- Get confirmation of what happened without needing to hover over elements to reveal status

**Frustrations:**
- Drag-and-drop as the only or primary transfer gesture
- Tooltips or status labels that only appear on hover
- Focus traps — modal dialogs or panels that can't be dismissed via keyboard
- Tab order that skips important controls or follows a non-logical sequence

**Environment:** Same as Persona 1 (home office, desktop). Slower deliberate interaction cadence. Will read labels and status carefully rather than scanning.

**Key design implication:** Every interaction must have a complete keyboard path. Drag-and-drop, if implemented, requires a keyboard alternative of equal capability. Focus management between panes must be explicit and announced.

---

## Persona 4 — The Operator Under Load (Stress Case)

**Context:** Any of the above personas, but running a large batch operation (200–500 files) under time pressure — a release deadline, a client deliverable, a sync window. Has other tasks running in parallel. Is monitoring the operation in the background while doing other work, returning periodically to check progress.

**Abilities and conditions:** Situationally degraded: fatigued, attention divided, potentially stressed. Cognitive load is high. Decision-making capacity is lower than usual — relies more on clear system feedback and less on memory of what they set up.

**Technology:** Same as their base persona. May have the app in a background window, checking in periodically.

**Goals:**
- Know at a glance — without re-reading configuration — what operation is running and on how many files
- Know when it's done (ideally without having to watch)
- Know immediately if something went wrong and what went wrong, without digging
- Be able to cancel cleanly if they realize they configured something incorrectly

**Frustrations:**
- Progress state that requires active watching — no way to step away and come back
- Completion state that is ambiguous — "done" but unclear if it fully succeeded
- Errors buried in a log they have to open — not surfaced prominently
- No cancellation, or cancellation that leaves an ambiguous half-finished state

**Environment:** Variable — may return to the app from another context. App may be in background. Must be able to re-orient quickly ("where was I, what did I start") with minimal scanning.

**Key design implication:** Progress, completion, and error states must be unambiguous from the application window title or a persistent status surface — not buried in a scrollable panel. The current operation and its status must be readable in under 2 seconds of re-orientation after switching back from another window.

---

## Ability Spectrum Summary

| Condition | Persona | Design Requirement |
|---|---|---|
| Red-green color deficiency | Persona 2 | All status states carry a non-color signal (icon + label) |
| Essential tremor / motor | Persona 3 | Full keyboard coverage; no drag-only interactions; no hover-only disclosure |
| Divided attention / fatigue | Persona 4 | Persistent, glanceable status; no buried progress; clear cancellation |
| Cognitive load (large collections) | All | Clear hierarchy; persistent context; no dead ends; current state always visible |
| Motion sensitivity | All | `prefers-reduced-motion` respected on all transitions and progress animations |
| Screen reader (future) | All | ARIA roles, landmarks, and live regions for selection state, operation progress, and list navigation — designed in now, not retrofitted |

---

## Scenario Intersections

- **Persona 2 (color deficiency) + Persona 4 (stress):** Under pressure, color-dependent status is even more unreliable. A color-blind user checking progress from a bright window or a glance is the highest-risk combination for a missed error state.
- **Persona 3 (motor) + Persona 4 (stress):** A keyboard-dependent user under time pressure needs keyboard shortcuts to be fast and consistent — no "I can do this with the keyboard, but it takes 8 keystrokes."
- **All personas + large collection:** Everyone benefits from fast, reliable search and filter. The "no dead ends" requirement is most exposed when a user has 500 items and can't find where they are.

---

_Personas are reference documents for heuristic-evaluator and synthetic-user-testing. Revisit if the user profile changes significantly (e.g., SaaS launch introduces non-technical creatives as a primary audience)._
