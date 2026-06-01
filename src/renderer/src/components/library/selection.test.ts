import { describe, it, expect } from 'vitest'
import {
  emptySelection,
  getSelectedIds,
  applyGesture,
  clearSelection,
  type SelectionState,
} from './selection'

const IDS = ['a', 'b', 'c', 'd', 'e']

function selected(state: SelectionState): string[] {
  return [...getSelectedIds(state)].sort()
}

describe('emptySelection', () => {
  it('returns empty committed, shiftRange, and null anchor', () => {
    const s = emptySelection()
    expect(s.committed.size).toBe(0)
    expect(s.shiftRange.size).toBe(0)
    expect(s.anchor).toBeNull()
  })
})

describe('clearSelection', () => {
  it('returns empty state', () => {
    const s = applyGesture(emptySelection(), 'c', 'click', IDS)
    const cleared = clearSelection()
    expect(cleared.committed.size).toBe(0)
    expect(cleared.anchor).toBeNull()
  })
})

describe('getSelectedIds', () => {
  it('returns empty set for empty state', () => {
    expect(getSelectedIds(emptySelection()).size).toBe(0)
  })

  it('returns union of committed and shiftRange', () => {
    const state: SelectionState = {
      committed: new Set(['a', 'b']),
      shiftRange: new Set(['b', 'c']),
      anchor: 'a',
    }
    expect(selected(state)).toEqual(['a', 'b', 'c'])
  })

  it('handles empty shiftRange (returns committed directly)', () => {
    const state: SelectionState = {
      committed: new Set(['a', 'b']),
      shiftRange: new Set(),
      anchor: 'a',
    }
    expect(selected(state)).toEqual(['a', 'b'])
  })
})

describe('click gesture', () => {
  it('selects only the clicked item', () => {
    const s = applyGesture(emptySelection(), 'c', 'click', IDS)
    expect(selected(s)).toEqual(['c'])
  })

  it('sets anchor to clicked item', () => {
    const s = applyGesture(emptySelection(), 'c', 'click', IDS)
    expect(s.anchor).toBe('c')
  })

  it('clears previous selection', () => {
    const prev = applyGesture(emptySelection(), 'a', 'click', IDS)
    const next = applyGesture(prev, 'c', 'click', IDS)
    expect(selected(next)).toEqual(['c'])
  })

  it('clears any existing shift range', () => {
    const withRange: SelectionState = {
      committed: new Set(['a']),
      shiftRange: new Set(['a', 'b', 'c']),
      anchor: 'a',
    }
    const s = applyGesture(withRange, 'd', 'click', IDS)
    expect(s.shiftRange.size).toBe(0)
    expect(selected(s)).toEqual(['d'])
  })
})

describe('cmd-click gesture', () => {
  it('adds an unselected item to the selection', () => {
    const prev = applyGesture(emptySelection(), 'a', 'click', IDS)
    const s = applyGesture(prev, 'c', 'cmd-click', IDS)
    expect(selected(s)).toEqual(['a', 'c'])
  })

  it('removes an already-selected item', () => {
    const prev = applyGesture(emptySelection(), 'a', 'click', IDS)
    const s = applyGesture(prev, 'a', 'cmd-click', IDS)
    expect(selected(s)).toEqual([])
  })

  it('sets anchor to the clicked item', () => {
    const prev = applyGesture(emptySelection(), 'a', 'click', IDS)
    const s = applyGesture(prev, 'c', 'cmd-click', IDS)
    expect(s.anchor).toBe('c')
  })

  it('preserves other selections when adding', () => {
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)
    s = applyGesture(s, 'c', 'cmd-click', IDS)
    s = applyGesture(s, 'e', 'cmd-click', IDS)
    expect(selected(s)).toEqual(['a', 'c', 'e'])
  })

  it('commits existing shiftRange before toggling', () => {
    // Build: click a, shift-click c => committed={a}, shiftRange={a,b,c}
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)
    s = applyGesture(s, 'c', 'shift-click', IDS)
    expect(selected(s)).toEqual(['a', 'b', 'c'])
    // Now cmd-click b => should commit the range and toggle b out
    s = applyGesture(s, 'b', 'cmd-click', IDS)
    expect(selected(s)).toEqual(['a', 'c'])
    expect(s.shiftRange.size).toBe(0)
  })

  it('clears shiftRange', () => {
    const withRange: SelectionState = {
      committed: new Set(['a']),
      shiftRange: new Set(['a', 'b', 'c']),
      anchor: 'a',
    }
    const s = applyGesture(withRange, 'd', 'cmd-click', IDS)
    expect(s.shiftRange.size).toBe(0)
  })
})

describe('shift-click gesture', () => {
  it('selects range from anchor to clicked (forward)', () => {
    let s = applyGesture(emptySelection(), 'b', 'click', IDS) // anchor = b
    s = applyGesture(s, 'd', 'shift-click', IDS)
    expect(selected(s)).toEqual(['b', 'c', 'd'])
  })

  it('selects range from anchor to clicked (backward)', () => {
    let s = applyGesture(emptySelection(), 'd', 'click', IDS) // anchor = d
    s = applyGesture(s, 'b', 'shift-click', IDS)
    expect(selected(s)).toEqual(['b', 'c', 'd'])
  })

  it('does not change the anchor', () => {
    let s = applyGesture(emptySelection(), 'b', 'click', IDS) // anchor = b
    s = applyGesture(s, 'd', 'shift-click', IDS)
    expect(s.anchor).toBe('b')
  })

  it('preserves committed items outside the range (cmd-clicked items)', () => {
    // Click a, cmd-click e (anchors e), then shift-click c from e
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)  // {a}, anchor a
    s = applyGesture(s, 'e', 'cmd-click', IDS)                 // {a,e}, anchor e
    s = applyGesture(s, 'c', 'shift-click', IDS)               // range e-c = {c,d,e}; committed={a,e}
    // selected = {a,e} (committed) ∪ {c,d,e} (range) = {a,c,d,e}
    expect(selected(s)).toEqual(['a', 'c', 'd', 'e'])
  })

  it('contracts a previous shift range when shift-clicking closer', () => {
    // click a, shift-click e => {a,b,c,d,e}
    // shift-click c => range = {a,b,c}, d and e (not in committed) drop out
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)
    s = applyGesture(s, 'e', 'shift-click', IDS)
    expect(selected(s)).toEqual(['a', 'b', 'c', 'd', 'e'])
    s = applyGesture(s, 'c', 'shift-click', IDS)
    expect(selected(s)).toEqual(['a', 'b', 'c'])
  })

  it('uses clicked item as anchor when no anchor is set', () => {
    const s = applyGesture(emptySelection(), 'c', 'shift-click', IDS)
    expect(selected(s)).toEqual(['c'])
    expect(s.anchor).toBeNull() // anchor stays null when using fallback
  })

  it('handles clicked item not in visibleIds — falls back to single item, preserves committed', () => {
    let s = applyGesture(emptySelection(), 'a', 'click', IDS) // committed={a}, anchor=a
    s = applyGesture(s, 'z', 'shift-click', IDS)              // z not in IDS → shiftRange={z}
    // committed={a} is preserved; shiftRange={z} (fallback)
    expect(selected(s)).toEqual(['a', 'z'])
  })
})

describe('cmd-shift-click gesture', () => {
  it('adds range to existing committed selection', () => {
    // click a, cmd-click e, cmd-shift-click c from anchor e
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)  // anchor a
    s = applyGesture(s, 'e', 'cmd-click', IDS)                 // anchor e, committed={a,e}
    s = applyGesture(s, 'c', 'cmd-shift-click', IDS)           // range e-c={c,d,e}; committed={a,e}
    // selected = {a,e} ∪ {c,d,e} = {a,c,d,e}
    expect(selected(s)).toEqual(['a', 'c', 'd', 'e'])
  })

  it('commits existing shiftRange before adding new range', () => {
    let s = applyGesture(emptySelection(), 'a', 'click', IDS)  // anchor a
    s = applyGesture(s, 'c', 'shift-click', IDS)               // shiftRange={a,b,c}
    s = applyGesture(s, 'e', 'cmd-shift-click', IDS)           // commit {a,b,c}, new range a-e={a,b,c,d,e}
    expect(selected(s)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('does not change the anchor', () => {
    let s = applyGesture(emptySelection(), 'b', 'click', IDS)
    s = applyGesture(s, 'd', 'cmd-shift-click', IDS)
    expect(s.anchor).toBe('b')
  })
})

describe('selection count helper', () => {
  it('empty selection has size 0', () => {
    expect(getSelectedIds(emptySelection()).size).toBe(0)
  })

  it('counts deduplicated items across committed and shiftRange', () => {
    const state: SelectionState = {
      committed: new Set(['a', 'b']),
      shiftRange: new Set(['b', 'c', 'd']),
      anchor: 'a',
    }
    expect(getSelectedIds(state).size).toBe(4) // a, b, c, d
  })
})
