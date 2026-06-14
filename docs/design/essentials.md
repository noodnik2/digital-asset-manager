# Design Essentials — Digital Asset Manager

Compact token and pattern reference for component implementation. Read this for any UI work.

For aesthetic rationale, layout principles, voice/copy rules, or the full reference: [`docs/design/reference/taste.md`](reference/taste.md).  
Authoritative CSS tokens (source of truth): [`src/renderer/src/styles/colors_and_type.css`](../../src/renderer/src/styles/colors_and_type.css).

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

Backgrounds layer Canvas → Panel → Surface → Raised. Never hue shifts or gradients between layers.

---

## Typography

| Family | Role |
|---|---|
| **DM Serif Display** | Headings, display numbers (24px+ only) |
| **DM Sans** | Body UI, labels, buttons (default) |
| **JetBrains Mono** | Data values, identifiers, filenames, counts |

```css
--font-display: 'DM Serif Display', serif;
--font-sans:    'DM Sans', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;

--text-display: 2.5rem;    /* 40px */
--text-h1:      1.75rem;   /* 28px */
--text-h2:      1.25rem;   /* 20px */
--text-h3:      0.875rem;  /* 14px — uppercase group labels */
--text-body:    0.875rem;  /* 14px */
--text-small:   0.75rem;   /* 12px */
--text-mono:    0.8125rem; /* 13px */

--leading-tight:  1.2;
--leading-normal: 1.5;
--tracking-tight: -0.01em;
--tracking-wide:  0.1em;   /* uppercase labels */
```

- `h3` / group labels: uppercase + `tracking-wide`, `--fog` color
- Monospace for anything queryable, sortable, or technical
- Serif at `h1` / `display` only

---

## Spacing

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

--sidebar-w:      200px;
--inspector-w:    320px;
--row-h:           36px;
--row-h-compact:   28px;
```

4px base grid. DAW-level density — not generous whitespace.

---

## Shape & Borders

```css
--r-sm:   4px;   /* inputs, buttons */
--r-md:   6px;   /* cards */
--r-lg:   8px;   /* large panels */
--r-pill: 999px; /* tag chips only */
```

1px borders in `--line` only. Never 2px. Tables: horizontal row dividers only, no vertical column lines.

---

## Shadows

```css
--shadow-1:         0 2px 8px rgba(0,0,0,0.4);      /* dropdowns, popovers */
--shadow-2:         0 8px 24px rgba(0,0,0,0.5);      /* modals */
--shadow-glow:      0 0 0 1px var(--amber), 0 0 12px rgba(232,160,48,0.25);  /* focused CTAs */
--shadow-glow-jade: 0 0 12px rgba(74,222,128,0.35);
```

Shadows lift overlays only — never on resting cards.

---

## Interactive States

| State | Treatment |
|---|---|
| Hover (rows, cards) | Background → `--raised`. No translate, no scale. |
| Hover (text links) | Color → `--amber`. Underline on focus only. |
| Hover (icon-only) | Color: `--fog` → `--snow` |
| Press | `transform: translateY(1px)` on buttons. No scale. |
| Focus (keyboard) | `outline: 1px solid var(--amber); outline-offset: 2px`. Never browser-default blue. |
| Selected (row) | Background `--raised` + `box-shadow: inset 2px 0 0 var(--amber)` (selection rail) |
| Active/running | `--jade` dot with glow pulse |
| Disabled | `opacity: 0.4`, no other change |

---

## Animation

```css
--ease:     cubic-bezier(0.2, 0, 0, 1);
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

- Stroked, `currentColor`, 1.5–2px stroke
- `★` / `☆` are the only Unicode glyphs permitted in product UI

| Context | Size |
|---|---|
| Inline next to text | 14px |
| Sidebar nav / toolbar | 18px |
| Icon-only buttons | 16px |
| Empty-state hero | 32–40px |

---

## Component Patterns

### Selection Rail (DAW pattern — non-obvious)
Selected rows: `box-shadow: inset 2px 0 0 var(--amber)` on the left edge + background `--raised`. Not a full background fill.

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

### Primary Button
`--amber` background, `#1a1206` text, weight 600, `border-radius: var(--r-sm)`. Hover: `--amber-hi`. Active: `translateY(1px)`.

### Ghost Button
Transparent background, `--line` border, `--fog` label. Hover: `--snow` label, `--border-strong` border.
