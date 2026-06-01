export interface SelectionState {
  committed: Set<string>   // locked via click / cmd-click gestures
  shiftRange: Set<string>  // tentative: most recent shift gesture; recalculated on each shift-click
  anchor: string | null
}

export type SelectionGesture = 'click' | 'cmd-click' | 'shift-click' | 'cmd-shift-click'

export function emptySelection(): SelectionState {
  return { committed: new Set(), shiftRange: new Set(), anchor: null }
}

export function clearSelection(): SelectionState {
  return emptySelection()
}

/** Returns the full set of selected IDs (committed ∪ shiftRange). */
export function getSelectedIds(state: SelectionState): Set<string> {
  if (state.shiftRange.size === 0) return state.committed
  return new Set([...state.committed, ...state.shiftRange])
}

function rangeSet(anchorId: string, clickedId: string, visibleIds: string[]): Set<string> {
  const ai = visibleIds.indexOf(anchorId)
  const ci = visibleIds.indexOf(clickedId)
  if (ai === -1 || ci === -1) return new Set([clickedId])
  const [start, end] = ai <= ci ? [ai, ci] : [ci, ai]
  return new Set(visibleIds.slice(start, end + 1))
}

/**
 * Pure state transition for a pointer selection gesture.
 *
 * - click:           select only the clicked item; set anchor
 * - cmd-click:       commit shiftRange, then toggle clicked item; set anchor
 * - shift-click:     replace shiftRange with range(anchor, clicked); committed unchanged
 * - cmd-shift-click: commit shiftRange, then replace shiftRange with new range; committed keeps all
 */
export function applyGesture(
  state: SelectionState,
  clickedId: string,
  gesture: SelectionGesture,
  visibleIds: string[],
): SelectionState {
  switch (gesture) {
    case 'click':
      return { committed: new Set([clickedId]), shiftRange: new Set(), anchor: clickedId }

    case 'cmd-click': {
      const merged = new Set([...state.committed, ...state.shiftRange])
      if (merged.has(clickedId)) merged.delete(clickedId)
      else merged.add(clickedId)
      return { committed: merged, shiftRange: new Set(), anchor: clickedId }
    }

    case 'shift-click': {
      const effectiveAnchor = state.anchor ?? clickedId
      const r = rangeSet(effectiveAnchor, clickedId, visibleIds)
      return { committed: state.committed, shiftRange: r, anchor: state.anchor }
    }

    case 'cmd-shift-click': {
      const committed = new Set([...state.committed, ...state.shiftRange])
      const effectiveAnchor = state.anchor ?? clickedId
      const r = rangeSet(effectiveAnchor, clickedId, visibleIds)
      return { committed, shiftRange: r, anchor: state.anchor }
    }
  }
}
