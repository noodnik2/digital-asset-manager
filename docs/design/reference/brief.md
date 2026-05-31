# Design Brief: Digital Asset Manager

_Designpowers — Discovery completed 2026-05-17_

---

## Problem Statement

Creative and technical users accumulate large collections of digital assets — files with inherent structure, metadata, and transformation potential — that are poorly served by generic filesystem tools. The result is manual workarounds: ad-hoc folder hierarchies, hand-maintained selection lists, and one-off scripts to orchestrate transformations and exports. This system creates compounding overhead and leaves the collection's latent value unrealized.

The goal is a purpose-built platform for **organizing, selecting, transforming, and exporting** digital asset collections — one that makes the core workflow loop (select → operate → inspect → operate again) fast, clear, and repeatable for any asset type. The first vertical is **MIDI files** and their audio derivatives, with an architecture explicitly designed to extend to images, video, documents, or any other asset class without redesign.

---

## Users

### Primary User (v1)
**The power-user owner-operator.** Tech-savvy, comfortable running a local single-user application, likely familiar with the command line. In the specific case of this project: also the developer. Has a large existing collection of assets and a well-developed sense of what they want the tool to do — they just don't want to have to build it themselves every time.

Key characteristics:
- Operates the tool frequently, with a large and growing collection
- Values efficiency and workflow clarity over visual polish
- Comfortable with a steeper learning curve if the payoff is real power
- Does not need things simplified, but does need them to be *coherent*

### Long-Term User (SaaS horizon)
**The non-technical creative.** A musician, photographer, or other creative professional who has a collection of assets but no appetite for local infrastructure. Expects a cloud-hosted, sign-in-and-go experience. This user is not the design target for v1 but shapes architectural decisions now — the data model, permission layer, and pipeline model must not require redesign to serve them later.

### Ability Spectrum Considerations
- **Keyboard-first navigation** is a requirement for the primary user (power users rely on it); also critical for motor-accessibility
- **Screen reader support** must be designed in from the start, not retrofitted — particularly for list views, selection states, and operation feedback
- **Cognitive load:** Large collections create inherent complexity. The design must surface structure and reduce the cost of orientation — clear hierarchy, persistent context, no dead ends
- **Color independence:** Status indicators (operation progress, success/error states) must never rely on color alone
- **Motion sensitivity:** Any animations (pipeline progress, transition effects) must respect `prefers-reduced-motion`

---

## Design Direction

**Approach 3: Library + Working Set**

The application has two persistent surfaces:

**The Library** — the full collection, always present. Browsable, searchable, filterable. The library is the source of truth for what exists. It does not change as you work.

**The Working Set** — a dynamic staging area. You pull assets from the library into the Working Set, apply an operation, and the output lands back in the Working Set (or is exported directly). The recursive loop is the default behavior: output becomes the new Working Set input without extra steps. The Working Set is not a project or session — it is a persistent, mutable workspace that exists between operations.

**Why this direction:**
The Working Set model directly mirrors the stated core loop — select → operate → inspect → operate again. The recursion is natural because the output is always present and operable. There is no session overhead, no import/export between contexts. The user is always in one place, doing one kind of thing.

**Key UX implications:**
- The Working Set must clearly communicate its current state: what's in it, what operation was last run, what the output was
- Moving assets from Library → Working Set and from Working Set → export must feel effortless — single gestures, not multi-step wizards
- Operation history within a Working Set session should be visible and reversible where possible
- The Library and Working Set must coexist visually without competing — the user's attention should always be clearly anchored to one or the other

---

## Constraints

**Architectural (hard requirements):**
- The core data model, selection system, and transformation pipeline must be **asset-type agnostic**. MIDI support is implemented as a module on top of a generic foundation — not baked into the foundation itself. Adding a new asset type must require only plugin/module work, with no changes to core.
- The permission and data model must support **multi-user tenancy** from the start, even if v1 is single-user. Retrofitting auth into a single-user architecture is a costly rewrite.

**Platform:**
- macOS is the initial development and deployment target
- The application must be deployable cross-platform (implies web-based frontend, or a framework like Electron/Tauri — to be resolved in strategy)
- v1 is local/self-hosted; SaaS deployment must be achievable without architectural changes

**Scope:**
- v1 covers MIDI files and their audio derivatives only (as the first asset class)
- v1 is single-user; multi-user is a future state, not a v1 feature

**Accessibility:**
- WCAG 2.1 AA minimum across all interactive surfaces
- Keyboard navigation for all core workflows (no mouse-only interactions)

**No existing design system.** One will need to be established or a foundation chosen during the design phase.

---

## Existing Design System

None. A visual language and component foundation will be established during the UI composition phase. Aesthetic direction TBD via `design-taste` calibration — the primary reference space is likely creative/professional tools (not consumer apps), but this has not yet been explored.

---

## Taste Direction (Early Signal)

- **Feeling:** "Created for me" — purposeful, not generic. The interface should feel like it was built by someone who understood the workflow before they opened a design tool.
- **Tone:** Professional tool aesthetic, not consumer app. Closer to Ableton, Raycast, or Figma than to Apple Music or Spotify.
- **No explicit references provided yet** — full taste calibration via `design-taste` is the next recommended step before visual design begins.

---

## Success Criteria

1. **Discovery:** The user can find a specific asset or subset of assets from a collection of hundreds without maintaining manual lists or remembering folder paths.
2. **Selection:** The user can define a subset — by search, filter, browse, or saved criteria — in under 60 seconds for common cases.
3. **Operation:** The user can apply a well-defined transformation to the entire Working Set without writing a script. The operation's intent is clear before it runs.
4. **Inspection:** The user can verify the output of an operation inline, without leaving the application or opening external tools, before committing to the next step.
5. **Recursion:** The output of an operation can become the input to the next operation in one gesture. The loop does not require navigation or re-setup.
6. **Export:** The user can export the Working Set (or a subset of it) in a chosen format — individual files into a folder, bundled as a .zip, pushed to a target location like Apple Music — without scripting.
7. **Extensibility:** A second asset type can be added to the platform by implementing a new module, with no changes to core application code or data model.

---

## Out of Scope (v1)

- Multi-user collaboration, sharing, or permissions management
- Cloud sync or remote storage
- Non-MIDI asset type *implementations* (architecture must support them; v1 does not implement them)
- Real-time audio playback, editing, or DAW-adjacent functionality — this is a manager and pipeline tool, not a creative instrument
- Any specific second asset class (images, video, documents) — these inform architecture but are not built in v1
- Mobile (phone/tablet) interface — macOS desktop is the only v1 target

---

_Next: `design-state.md` creation → `design-strategy`_
