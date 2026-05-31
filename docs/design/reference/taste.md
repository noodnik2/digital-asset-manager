# Taste Profile — Digital Asset Manager

_Extracted from the MIDI Workbench design system (Claude Design, May 2026). Asset-type-agnostic layer only. MIDI-specific screens, domain vocabulary, and product branding are excluded._

**Confirmed accent:** `#e8a030` (amber)
**Extracted:** 2026-05-23

---

## Aesthetic Posture

**Dark workstation.** Think Ableton Live's mixer, Bitwig's clip view, Logic's bottom dock. The interface is dense by web-app standards — close to a DAW's information density — but deliberately so: this is a power-user tool. The mood is **calm, controlled, technical**. No glassmorphism, no animated gradients, no purple-blue hype. Depth comes from value steps in the background hierarchy, never from hue shifts or gradients.

> _"A dark studio workstation. Deep near-black backgrounds, warm amber accents, monospace data, the calm authority of a tool you'd actually use professionally."_

---

## Color Tokens

```css
/* Backgrounds — layered by value, never by hue */
--canvas:   #0d0d0f;   /* deepest — app bg */
--panel:    #141418;   /* sidebars, fixed chrome */
--surface:  #1a1a21;   /* cards, table rows, inputs */
--raised:   #22222c;   /* hover, selected row */
--line:     #2a2a35;   /* borders, dividers */

/* Accents */
--amber:    #e8a030;   /* primary — CTAs, selection, brand */
--amber-bg: rgba(232, 160, 48, 0.08);
--amber-hi: #f4b850;   /* hover state of amber */
--jade:     #4ade80;   /* success / running / active */
--jade-bg:  rgba(74, 222, 128, 0.10);
--rose:     #f87171;   /* error / failed / destructive */
--rose-bg:  rgba(248, 113, 113, 0.10);

/* Text */
--snow:     #e8e8f0;   /* primary */
--fog:      #6b7080;   /* secondary, labels, placeholder */
--slate:    #a0aec0;   /* data values — filenames, numbers, identifiers */

/* Semantic aliases */
--fg:            var(--snow);
--fg-muted:      var(--fog);
--fg-data:       var(--slate);
--bg:            var(--canvas);
--border:        var(--line);
--border-strong: #3a3a48;
--accent:        var(--amber);
--success:       var(--jade);
--danger:        var(--rose);
```

**Principle:** Backgrounds layer in steps. Canvas → Panel → Surface → Raised builds depth purely through value. Never use hue shifts or gradients between background layers.

---

## Typography

Three families. All Google Fonts.

| Family | Role | Notes |
|---|---|---|
| **DM Serif Display** | Headings, display numbers, brand name | Editorial. Use at 24px+ only — apertures collapse below 20px |
| **DM Sans** | Body UI, labels, buttons | Default. Clean geometric sans |
| **JetBrains Mono** | Data values, identifiers, filenames, counts | Use at weight 500 to compensate for monospace airiness |

```css
--font-display: 'DM Serif Display', serif;
--font-sans:    'DM Sans', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;

--text-display: 2.5rem;    /* 40px — hero numbers */
--text-h1:      1.75rem;   /* 28px — page titles */
--text-h2:      1.25rem;   /* 20px — section headers */
--text-h3:      0.875rem;  /* 14px — uppercase group labels */
--text-body:    0.875rem;  /* 14px — body, table cells */
--text-small:   0.75rem;   /* 12px — helper text, metadata */
--text-mono:    0.8125rem; /* 13px — data, identifiers */

--leading-tight:  1.2;
--leading-normal: 1.5;
--tracking-tight: -0.01em;  /* serif at large sizes */
--tracking-wide:  0.1em;    /* uppercase labels */
```

**Scale rules:**
- Serif (DM Serif Display) at `h1` and `display` only
- `h3` / group labels: uppercase + `tracking-wide`, rendered in `--fog`
- Monospace is the "data" voice — anything queryable, sortable, or technical

---

## Spacing

4px base grid.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-14: 56px;
--space-20: 80px;

--sidebar-w:     200px;
--inspector-w:   320px;
--row-h:          36px;   /* dense, DAW-like */
--row-h-compact:  28px;
```

---

## Layout Principles

Specific surface arrangement is defined per-product (not here). These principles constrain any layout derived from this aesthetic.

- **Fixed panels, not floating chrome.** Persistent UI surfaces are fixed in position — they don't float, collapse, or animate in by default. A panel is either present or it isn't.
- **Only one region scrolls.** In any given view, exactly one pane is the scroll target. Fixed panels do not scroll with content.
- **No floating action buttons.** All actions live in a toolbar, a fixed panel, or a contextual row menu. Nothing drifts over content.
- **DAW-level density.** Row height, spacing, and type sizing are tuned for information density — closer to a professional desktop tool than a web app. Generous whitespace is not a goal; clarity at density is.
- **Panels slide, not pop.** Secondary surfaces (inspectors, config panels, detail views) animate in on a single axis at `200ms`. They don't appear from nowhere.
- **Nav lives in a fixed left panel, not a top bar.** Page/section titles belong to the nav, not to a header spanning the content area. This preserves vertical space — a DAW convention.
- **Sizing reference (not prescription):** The source system used 200px fixed nav panels and 280–320px inspector/config panels. These are reasonable starting constraints for any layout derived from this aesthetic; adjust as the specific surface requires.

---

## Shape & Borders

- Radii are small. `4px` inputs/buttons, `6px` cards, `8px` large panels, `999px` tag chips only.
- **1px borders** in `--line`. Never 2px. Borders separate surfaces; shadows lift overlays.
- Tables: horizontal row dividers only. No vertical column lines (DAW convention).
- No glassmorphism, no frosted-glass effects. Modal backdrop is `rgba(0,0,0,0.6)` — solid, no blur. ("Blur reads as consumer iOS; we want tool.")

```css
--r-sm:   4px;
--r-md:   6px;
--r-lg:   8px;
--r-pill: 999px;
```

---

## Shadows

Used to lift overlays only — never on resting cards.

```css
--shadow-1:    0 2px 8px rgba(0,0,0,0.4);       /* dropdowns, popovers */
--shadow-2:    0 8px 24px rgba(0,0,0,0.5);       /* modals */
--shadow-glow: 0 0 0 1px var(--amber), 0 0 12px rgba(232,160,48,0.25);  /* focused CTAs, active selection */
--shadow-glow-jade: 0 0 12px rgba(74,222,128,0.35);
```

No inner shadows. Depth from background hierarchy, not shadows.

---

## Interactive States

| State | Treatment |
|---|---|
| Hover (rows, cards) | Background → `--raised`. No translate, no scale. |
| Hover (text links) | Color → `--amber`. Underline on focus only, not hover. |
| Hover (icon-only) | Color: `--fog` → `--snow` |
| Press | `transform: translateY(1px)` on buttons. No scale. |
| Focus (keyboard) | `outline: 1px solid var(--amber); outline-offset: 2px`. Never browser-default blue. |
| Selected (row) | Background `--raised` + `box-shadow: inset 2px 0 0 var(--amber)` (selection rail — DAW pattern) |
| Active/running | `--jade` dot with glow pulse |
| Disabled | `opacity: 0.4`, no other change |

---

## Animation

**Functional, fast, restrained.** Single easing curve throughout. No bouncing, no parallax, no scroll-triggered reveals.

```css
--ease:     cubic-bezier(0.2, 0, 0, 1);  /* soft snap */
--dur-fast: 120ms;
--dur-base: 180ms;
--dur-slow: 240ms;
```

| Context | What | Duration |
|---|---|---|
| Hover background | Color tween | 120ms |
| Panel slide-in | Width + opacity | 200ms |
| Modal open | Fade + 4px translate-up | 180ms |
| Status pulse (running) | Opacity 0.4 ↔ 1.0 | 1200ms loop |

**Reduced motion:** Snap all transitions to `0ms`. Kill any looping animations.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

## Iconography

**Lucide only.** No other icon systems, no icon fonts, no emoji in product UI.

- Stroked, not filled. 1.5–2px stroke depending on size.
- `currentColor` — icons inherit text color.
- Geometric, slightly rounded caps and joins.

| Context | Size |
|---|---|
| Inline next to text | 14px |
| Sidebar nav | 18px |
| Toolbar | 18px |
| Icon-only buttons | 16px |
| Empty-state hero | 32–40px |

**Emoji:** Not used in product UI. The only Unicode glyphs permitted are `★` / `☆` for marking favorites.

---

## Voice & Copy

**Pragmatic and operator-aware.** This is a tool a single user runs locally. Copy reads like a professional tool's UI, not a brand site.

- No exclamation points. No emoji. No "Let's get started!".
- **You** for direct instructions. No "we".
- **Imperatives** for actions: "Import Files", "Run Operation", "Export".
- **Title Case** for nav items, page titles, primary buttons.
- **Sentence case** for body, helper text, descriptions.
- **UPPERCASE + tracking** for section labels in sidebars and panels — recurring motif from DAW UIs.

| Avoid | Prefer |
|---|---|
| "Awesome! Your file is ready 🎉" | "Operation complete." |
| "Oops, something went wrong" | "Failed: [specific error message]" |
| "Let's get you set up" | "Choose a file" |
| "Click here to upload" | "Import Files" |

---

## Backgrounds, Imagery, Textures

- **Flat dark fills only.** No gradients on backgrounds.
- **No hero imagery**, no stock photos, no illustrations.
- **No decorative patterns or textures.** The texture comes from the data itself — lists, grids, tag chips, identifiers.
- When user-provided thumbnails or artwork are displayed: `filter: saturate(0.85)` at rest, full color on hover. Keeps the dark UI calm.

---

## Component Patterns

### Tag Chip
```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: var(--text-small);
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--amber);
  background: var(--amber-bg);
  border-radius: var(--r-pill);
}
```

### Status Pill
Dot indicator + label. States: running (jade + glow pulse), complete (jade), failed (rose), pending (fog).

### Selection Rail
Selected rows use `box-shadow: inset 2px 0 0 var(--amber)` on the left edge instead of a full background change. Background also shifts to `--raised`. This is the DAW convention for "selected."

### Primary Button
Amber background, dark text (`#1a1206`), weight 600, `border-radius: var(--r-sm)`. Hover: `--amber-hi`. Active: `translateY(1px)`.

### Ghost Button
Transparent background, `--line` border, `--fog` label. Hover: snow label, `--border-strong` border.

---

## What This Profile Is Not

- It does not define specific screens, routes, or surface-level layout for any particular asset type.
- It does not define domain vocabulary (that belongs in the plugin/asset-type layer).
- It does not define asset-type-specific icons (e.g., file-music, piano, waveform).
- The logo/brand glyph is TBD — the waveform glyph from the MIDI Workbench design is a placeholder for that product only.
