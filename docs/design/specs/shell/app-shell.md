# App Shell & Navigation Model

_Task 1 of the Digital Asset Manager design plan._
_Spec written: 2026-05-23_

---

## Structure

The application is two panes plus a thin status bar. No separate nav sidebar.

```
┌─────────────────────────────────────────────────────────────────┐
│  macOS native title bar  [traffic lights]   Digital Asset Mgr   │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                              │
│         LIBRARY PANE             │     WORKING SET PANE         │
│         ~58% width               │     ~42% width               │
│                                  │                              │
│  [search / filter toolbar]       │  ┌────────────────────────┐  │
│  ─────────────────────────────   │  │   CONTENTS ZONE        │  │
│  [asset list — only scroll zone] │  │   (items in basket)    │  │
│                                  │  │                        │  │
│                                  │  ├────────────────────────┤  │
│                                  │  │   OPERATION ZONE       │  │
│                                  │  │   palette + config     │  │
│                                  │  └────────────────────────┘  │
│                                  │                              │
├──────────────────────────────────┴──────────────────────────────┤
│  STATUS BAR  [Working Set count]  [operation name + status]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pane Specifications

### Library Pane (~58% width)

The source of truth. Always present. Never mutated by operations.

**Contents (top to bottom):**
1. **Search / filter toolbar** — fixed at top of pane, does not scroll. Contains: search input, active filter chips, sort control, view toggle (list / grid — TBD in Task 2), item count.
2. **Asset list** — the only scrolling region in the Library pane. Takes all remaining height.
3. **Settings access** — a single settings icon (Lucide `settings`, 16px, `--fog`) in the bottom-left corner of the pane, fixed. Opens a settings panel (modal or slide-in, TBD). Not in a nav sidebar — there is no nav sidebar.

**What does NOT live in the Library pane:**
- No pane title / header ("Library" label) — the search toolbar is sufficient context. Title-in-sidebar is a convention for multi-surface apps; this pane IS the Library.
- No working-set controls — those belong to the Working Set pane.

### Working Set Pane (~42% width)

The basket. Shows what the user has selected for an operation. The pane has one persistent toolbar at the top; everything else is the contents list.

**Toolbar (top of pane, fixed):**
- `[⚡ Select Operation ▾]` — dropdown/popover button. Opens the operation palette filtered to operations compatible with the current Working Set contents. Disabled when Working Set is empty.
- `[Clear]` — empties the Working Set. Requires no confirmation (non-destructive; assets remain in Library).

**Contents list:**
- The list of assets currently in the Working Set.
- Takes all remaining pane height below the toolbar.
- Scroll within the pane if contents exceed height.
- Empty state when nothing is in the Working Set (designed in Task 3).

**No persistent operation zone.** The operation palette, configuration, execution, and output all live in the Operation Modal (see below). The Working Set pane is purely the basket.

---

### Operation Modal

A modal surface that appears over both panes when the user selects and invokes an operation. It owns the full execution experience — configuration, progress, and output — and dismisses cleanly when the user is done.

**Three sequential states, rendered in the same modal without navigation:**

**State 1 — Configuration:**
```
╔══════════════════════════════════════╗
║  [Operation Name]                    ║
║  [N] items in Working Set            ║
║  ────────────────────────────────── ║
║  [parameter inputs]                  ║
║  Output: [destination path/field]    ║
║                                      ║
║  [Cancel]              [Run]         ║
╚══════════════════════════════════════╝
```

**State 2 — Running (modal transforms in-place):**
```
╔══════════════════════════════════════╗
║  [Operation Name] — Running          ║
║  ────────────────────────────────── ║
║  ✓  filename-a.ext                   ║
║  ✓  filename-b.ext                   ║
║  ⟳  filename-c.ext   ← current       ║
║                                      ║
║  [████████████░░░░░░]  2 of 3        ║
║                                      ║
║  [Abort]                             ║
╚══════════════════════════════════════╝
```

**State 3 — Complete:**
```
╔══════════════════════════════════════╗
║  [Operation Name] — Complete         ║
║  ────────────────────────────────── ║
║  ✓  output-a.ext                     ║
║  ✓  output-b.ext                     ║
║  ✓  output-c.ext                     ║
║                                      ║
║  Output in Library — search "[hint]" ║
║                                      ║
║  [Close]                             ║
╚══════════════════════════════════════╝
```

**Abort behaviour:** If the user closes or clicks Abort mid-run, a one-line confirmation appears inline (not a second modal): *"Abort? [N] files already processed. Their output is in the Library."* — `[Cancel]` `[Abort]`. This is the only confirmation in the flow; it exists because partial output already exists in the Library before the abort.

**Error / partial failure:** If some files fail and others succeed, State 3 shows the split clearly — successful outputs listed, failed inputs listed with reason. Not buried in a log.

**Operation palette (the ▾ dropdown):** Lists operations compatible with the current Working Set content type. Incompatible operations are not shown (not greyed — absent). Includes a search input at the top for large operation sets. Keyboard-navigable.

### Status Bar

Thin persistent bar at the bottom of the window. Full-width. Height: 28px (`--row-h-compact`). Background: `--panel`. Border-top: 1px `--line`.

**Contents (left to right):**
- **Working Set count:** `[N] items` in `--font-mono`, `--text-small`, `--fog`. Updates live as items are added/removed.
- **Separator:** `--line` vertical rule.
- **Operation status:** When idle — nothing. When an operation is running: operation name + progress (`[name] — 42 of 200`, jade dot pulse). When complete: `[name] — complete` with jade text, fades after 4s. When failed: `[name] — failed` with rose text, persists until dismissed or next operation.
- **Keyboard shortcut hint (far right):** `⌘1 Library  ⌘2 Working Set` — `--fog`, `--text-small`. Shown at rest; hides during operation. This surfaces pane-switching shortcuts once, persistently, without a tutorial.

**Accessibility:** Status bar content is a live ARIA region (`aria-live="polite"` for normal updates, `aria-live="assertive"` for failures). Screen readers announce status changes without requiring focus.

---

## Global Chrome

- **macOS native title bar:** Used as-is. Window title: `Digital Asset Manager`. No custom title bar chrome, no traffic light repositioning.
- **No global toolbar** spanning both panes. Each pane owns its own toolbar.
- **No floating action buttons** anywhere in the shell.
- **Divider between panes:** 1px `--line`. Not draggable in v1. The resize affordance is a future iteration.

---

## Focus & Attention Model

### Active Pane

Only one pane is "active" at a time. The active pane receives keyboard input for list navigation, selection, and shortcuts.

**Visual indicator:** The active pane's top edge shows a 2px `--amber` inset line (same token as the selection rail). The inactive pane dims slightly: `opacity: 0.85` on the pane content (not the chrome). This is subtle — users should not feel their inactive pane disappears.

**ARIA:** Active pane has `aria-current="true"` on its region element. Inactive pane has `aria-current="false"`. Pane switches are announced: `"Library pane active"` / `"Working Set pane active"`.

### Switching Between Panes

| Action | Behavior |
|---|---|
| `⌘1` | Focus Library pane |
| `⌘2` | Focus Working Set pane |
| `Tab` (from last element in active pane) | Moves focus to first interactive element in the other pane |
| Click anywhere in a pane | Activates that pane, focus goes to clicked element |

Focus returns to the last-focused element within a pane when that pane is re-activated via keyboard shortcut.

### Focus on App Launch

Focus lands in the Library pane search input on every launch. This is the fastest path to finding assets — the expected first action for nearly every session.

### Focus During Operations

While an operation is running:
- Both panes remain visible and navigable.
- The Library pane is read-only (selection changes are queued, not applied mid-operation — TBD in Task 7).
- Focus is not trapped. The user can navigate anywhere.
- The status bar live region announces progress updates without requiring focus.

---

## Session Persistence

| State | Persists? | Notes |
|---|---|---|
| Working Set contents | **No** | Starts empty every session. Intentional — not a bug. |
| Library sort order | **Yes** | Last-used sort column and direction. |
| Library active filters | **Yes** | Restores filter state from previous session. |
| Library scroll position | **Yes** | Returns to last scroll position in the asset list. |
| Library column widths | **Yes** | If column resizing is supported (TBD Task 2). |
| Active pane on launch | **No** | Always launches with Library pane active. |
| Last-used operation | **Yes** | Operation palette pre-selects the last-used operation within a session. Does not persist across sessions. |

**Why Working Set doesn't persist:** This is a hard decision from the strategy phase — the Working Set is a session basket, not a saved state. Users who want to resume a Working Set can do so via saved operations or Library filters. The app does not manage this for them.

---

## Dimensions Reference

| Element | Value |
|---|---|
| Library pane width | ~58% of window width |
| Working Set pane width | ~42% of window width |
| Minimum window width | 960px (below this, layout is undefined for v1) |
| Recommended window width | 1280px+ |
| Status bar height | 28px |
| Pane divider | 1px |
| Settings icon target area | 32×32px (minimum 44×44px tap target via padding) |

---

## Accessibility Checklist

- [ ] Both panes are landmark regions (`role="main"` on Library, `role="complementary"` on Working Set)
- [ ] Active pane state is communicated via `aria-current` and a screen reader announcement on switch
- [ ] Status bar is an `aria-live` region — operation status announced without requiring focus
- [ ] All pane-switching interactions are keyboard-accessible (`⌘1`, `⌘2`, `Tab`)
- [ ] Settings icon meets minimum touch target (44×44px with padding)
- [ ] Focus on launch goes to Library search input — predictable, no hunting
- [ ] Inactive pane dimming (`opacity: 0.85`) does not drop text below WCAG AA contrast
- [ ] Pane divider is purely decorative — no interactive role

---

## Open Questions

_None. Raised by agent if anything surfaces during implementation._

---

_Next: Task 2 — Library Pane Layout & Information Architecture_
