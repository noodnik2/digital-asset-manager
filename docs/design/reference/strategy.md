# Design Strategy: Digital Asset Manager

_Designpowers — Strategy in progress as of 2026-05-21_
_Brief: `docs/designpowers/briefs/2026-05-17-digital-asset-manager-discovery.md`_

---

## Design Principles

### 1. The loop is the product
**The principle:** Every feature exists to serve the select → operate → inspect cycle. Anything that doesn't serve that cycle doesn't belong.
**What this means in practice:** Features are evaluated against the loop, not against a feature checklist. If adding something makes the loop slower or more complicated, it fails — regardless of how capable it is in isolation.
**What this means we will NOT do:** Add features for completeness, add onboarding flows that interrupt the loop, or design affordances that choreograph the user's next action.

### 2. The collection knows itself
**The principle:** Assets have structure, metadata, relationships, and history. The app surfaces what's already there — it does not ask the user to re-describe what they already know.
**What this means in practice:** No import wizards. No mandatory tagging before the library is usable. The app indexes and infers; the user corrects and refines.
**What this means we will NOT do:** Gate library value behind setup steps. Ask the user to recreate knowledge the files already contain.

### 3. Operations are first-class objects
**The principle:** A transformation is a named, saveable, composable thing — not a menu option.
**What this means in practice:** Operations can be named, saved, and reused. The pipeline is as manageable as the assets themselves. Users build a vocabulary of operations over time.
**What this means we will NOT do:** Treat operations as ephemeral settings that evaporate after they run. Bury transformation options inside format-specific dialogs.

### 4. Mastery rewards speed
**The principle:** This is a power tool. The interface should be immediately coherent to a new user and significantly faster for a practiced one.
**What this means in practice:** Keyboard-first. Direct manipulation. No unnecessary confirmation dialogs. Accessibility and keyboard navigation are the primary interaction model, not an accommodation.
**What this means we will NOT do:** Optimize for discoverability at the cost of speed. Add friction for the practiced user to protect the new one.

### 5. The core speaks no asset type
**The principle:** MIDI is a module. The interface vocabulary — library, working set, operation, export — belongs to the platform, not to any specific file format.
**What this means in practice:** No MIDI-specific concepts in core UI copy, affordances, or data structures. A future image or video module requires no changes to what the user already knows.
**What this means we will NOT do:** Let MIDI terminology leak into core interfaces. Design affordances that assume audio as the asset type.

---

## The Working Set Model

The Working Set is a **basket the user fills**. It is not a query result and it is not automatically managed by the app. A query is one mechanism for filling the basket — alongside manual selection, drag-and-drop, and any other selection tools the app provides. The user decides what goes in, when, and why.

After an operation completes, the app presents the output and stops. It does not suggest what the user should do next. The user knows what they're doing.

This is a hard constraint, not a preference. Every design decision that touches the Working Set — how it's populated, how output is presented, what happens after an operation — must honor it.

---

## Experience Map

### Entry — App opens
The library is already present. The user pointed the app at their folders on first run; from that point forward, opening the app means seeing the collection — indexed, browsable, no setup required. The Working Set is empty, available.
_Emotional state: relief. "My stuff is here."_
_Inclusive design: library renders correctly for screen readers; asset count announced; no interaction required before the collection is visible and navigable._

### Filling the Working Set
The user populates the Working Set however they choose: search, filter, browse, manual selection, or any other mechanism the app provides. There is no prescribed path. The Working Set reflects the user's intent, not the app's suggestion.
_Emotional state: confidence. "I have exactly what I want."_
_Inclusive design: selection state communicated beyond color; keyboard shortcuts for common selection patterns; multi-select fully keyboard-accessible._

### Choosing and configuring an operation
An operation palette surfaces what can be done with the current Working Set. Operations have plain-language names ("Export to M4A," "Normalize velocity," "Convert to audio") — not technical format strings. The user picks one, configures parameters if needed, and runs it.
_Emotional state: clarity. "I know what this will do before I do it."_
_Inclusive design: operation names written in plain language; parameters have clear labels and defaults; destructive operations require confirmation._

### Execution
Progress is visible and non-blocking. The user can see what's happening. Output lands where the operation specifies — the destination is always clear before the operation runs, never a surprise after.
_Emotional state: trust. "It's doing what I expected."_
_Inclusive design: progress communicated in text and count, not color alone; completion announced for screen readers._

### Output
The operation completes. The output is presented. The app stops. What happens next is the user's decision.
_Emotional state: verification. "Let me look at this."_
_Inclusive design: inline inspection (e.g., audio playback) is fully keyboard-accessible; before/after comparison navigable without a mouse._

### Friction points to design against
- **First run:** Pointing the app at an existing folder structure should be a single action
- **Operation discovery:** Users need to know what's available without hunting; the operation palette must be fast to scan
- **Working Set orientation:** As the basket grows or changes, the user must always be able to see what's in it and why
- **Output location:** Where output lands must be declared before an operation runs, not discovered after

---

## Constraints and Trade-offs

**What we are explicitly NOT optimizing for:**

- **Discoverability for new users** at the cost of speed for practiced ones. This is a power tool. New users will invest in learning it.
- **Workflow guidance or suggestions.** The app enables; it does not direct. Users who want suggestions are not the target.
- **Consumer aesthetic.** This is a professional tool. Visual decisions should serve density, clarity, and efficiency — not approachability.
- **Feature breadth in v1.** MIDI + audio is the complete asset scope for v1. The architecture is open; the implementation is narrow.
- **Mobile.** Desktop only for v1. The interaction model (keyboard-first, dense information) does not translate to touch without a redesign.

---

## Success Metrics

_To be defined — session paused here on 2026-05-21._

---

_Next session: complete success metrics, then proceed to `writing-design-plans`._
