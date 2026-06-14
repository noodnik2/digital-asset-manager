# Asset Integrity Check

_Pre-execution gate for the operation modal._  
_Spec written: 2026-06-14_

---

## Overview

Before any operation runs, the application verifies that each Working Set asset still exists at
its indexed path and has not changed in size or modification time since it was last scanned.
If all assets pass, the operation proceeds silently. If any asset has changed or is missing, the
user is shown the integrity-check step and must make a deliberate choice before execution continues.

The check is:
- **Triggered by:** pressing `Run ⚡` (or `⌘Return`) in the Config step
- **Silent on success:** no extra step, no user friction when all assets are clean
- **Blocking on failure:** the modal does not advance to Running until the user explicitly chooses
  an action

---

## Detection Model

The check compares each asset's current filesystem state against two fields already stored in the
library index:

| Field compared | Source in index | Filesystem equivalent |
|---|---|---|
| Modification time | `Asset.modifiedAt` | `mtime` from `stat()` |
| File size | `Asset.size` | `size` from `stat()` |

- **`missing`** — `stat()` fails or the file is not found at `Asset.absolutePath`
- **`modified`** — `stat()` succeeds but mtime or size differs from the indexed values
- **`ok`** — both fields match; no issue

This is a filesystem fingerprint, not a cryptographic hash. It detects moves, deletions, overwrites,
and most corruption cases without the cost of reading file content. It does not detect byte-level
corruption that preserves mtime and size (e.g., in-place patching of unused padding bytes) — that
is acceptable for v1.

---

## Silent Path (All OK)

When `checkIntegrity` returns `{ allOk: true }`:

1. The modal transitions directly from Config to Running
2. No intermediate step is shown
3. No announcement is made — the absence of an interruption is the signal

---

## Integrity-Check Step (Issues Found)

When `checkIntegrity` returns `{ allOk: false }`, the modal content replaces the Config step with
the integrity-check step. The modal container (header, close button) stays in place.

### Modal header

```
[Operation Name] — Files Changed                               [×]
```

The `[×]` button at the integrity-check step behaves the same as `[Cancel]` — it returns the user
to the Config step (it does not close the modal entirely).

### Body

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  These items have changed since they were added to      │
│  your library. Review them before running the           │
│  operation.                                             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ◉ missing   groove-01.mid                        │  │
│  │ ◉ modified  bass-loop-03.mid                     │  │
│  │ ...                                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  If you proceed, results may be unexpected.             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Introductory text:** `--fog`, 14px, `--leading-normal`. Always shown above the file list.

**File list:**
- One row per affected asset (assets that returned `ok` are not listed)
- Row height: 36px (`--row-h`), consistent with Library list density
- No horizontal scroll; rows do not overflow — filenames truncate with ellipsis if necessary
- List is scrollable if it exceeds available height (max height: `40vh`)

**Status badge** (left of filename):

| Status | Label | Color | Background |
|---|---|---|---|
| `missing` | `missing` | `--rose` | `--rose-bg` |
| `modified` | `modified` | `--amber` | `--amber-bg` |

Badge style: same `.tag` pattern from design essentials — `--r-pill`, `--font-mono`, `--text-small`.

**Filename** (right of badge): full filename including extension. `--slate`, `--font-mono`, 13px.
No folder path — the Working Set context is already established.

**Caution line:** `--fog`, 14px. Always shown below the file list.

### Footer

```
  [Update Index]            [Cancel]    [Proceed Anyway]
```

Three affordances, left to right:

| Affordance | Style | Action |
|---|---|---|
| `Update Index` | Text-weight link (`--fog`, 13px, underline on hover) | Re-scans the affected assets; see [Update Index behavior](#update-index-behavior) |
| `Cancel` | Ghost button | Returns to Config step. No data is changed. |
| `Proceed Anyway` | Primary amber button | Advances to the Running step without re-scanning. |

**Focus on step entry:** `[Cancel]` (the safer default). `[Proceed Anyway]` is reachable by Tab.

**Keyboard:**
- `Escape` → same as `[Cancel]` (returns to Config; does not close modal)
- `Tab` cycles: `[Cancel]` → `[Proceed Anyway]` → `[Update Index]` → `[×]` → `[Cancel]`

---

## Update Index Behavior

When the user activates `[Update Index]`:

1. The footer shows a brief inline loading state: `Updating…` in `--fog`, 13px, replacing the three
   affordances. No spinner — text is sufficient for a fast operation.
2. The service re-scans the affected assets (not the full library).
3. **If all re-scanned assets are now OK:** The modal transitions directly to the Running step (silent
   success — same as the initial silent path).
4. **If issues remain or new issues are found:** The file list refreshes with the updated results.
   The same three footer affordances reappear. The `[Update Index]` link is available again.

There is no explicit "success" message for the update — silence communicates success, consistent
with the pattern for the silent path.

---

## Accessibility

- [ ] The integrity-check step uses `role="alertdialog"` on the modal content area — it is an alert
  that requires user action before proceeding
- [ ] `aria-labelledby` points to the modal header (`[Operation Name] — Files Changed`)
- [ ] `aria-describedby` points to the introductory text paragraph
- [ ] Focus moves to `[Cancel]` on step entry (safer default)
- [ ] Status badges are announced as text — `aria-label` is not needed; the badge label text is
  sufficient for screen readers when read in context with the filename
- [ ] `[Proceed Anyway]` button: `aria-describedby` pointing to the caution line beneath the file
  list — screen reader users hear the warning before activating
- [ ] `[Update Index]` link: `aria-label="Update index for changed files"` — the visible label is
  brief; the accessible label adds context
- [ ] The file list is a `<ul>` with `<li>` rows; no role override needed
- [ ] After `[Update Index]` triggers a re-scan, focus returns to `[Cancel]` when the list refreshes
  (or advances to Running if all OK)

---

## Verification

- [ ] Pressing `Run ⚡` with all Working Set assets OK → modal advances directly to Running (no
  integrity-check step shown)
- [ ] Pressing `Run ⚡` with one `missing` asset → integrity-check step shown; file listed with
  `missing` badge in `--rose`
- [ ] Pressing `Run ⚡` with one `modified` asset → integrity-check step shown; file listed with
  `modified` badge in `--amber`
- [ ] Assets that returned `ok` do not appear in the file list
- [ ] `[Cancel]` and `Escape` both return to Config step; modal does not close; Config state
  (parameters, output path) is preserved
- [ ] `[Proceed Anyway]` advances to Running step; operation executes against original file paths
- [ ] `[Update Index]` with a now-fixed asset → modal advances to Running silently
- [ ] `[Update Index]` with still-broken asset → list refreshes; same step remains
- [ ] `[×]` during integrity-check step returns to Config (same as `[Cancel]`)
- [ ] Focus lands on `[Cancel]` on step entry
- [ ] Screen reader announces modal label and description on step entry

---

## Open Questions

- **`[×]` vs. close:** Current spec has `[×]` returning to Config at the integrity-check step (not
  closing the modal). This matches the convention for Running state where `[×]` triggers an inline
  confirmation rather than a direct close. If users expect `[×]` to always close the modal, reconsider
  — but returning to Config is the safer, less destructive behavior here.
- **Large issue lists:** If 50+ assets are flagged, the scrollable list is the only affordance. A
  summary count above the list (`3 items missing, 12 items modified`) may aid orientation in large
  sets. Deferred to a future iteration once the feature is in use.
