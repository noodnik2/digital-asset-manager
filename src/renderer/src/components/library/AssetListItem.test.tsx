import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssetListItem } from './AssetListItem'
import type { AssetRow, ColumnDefinition } from '@shared/types/asset'

function col(overrides: Partial<ColumnDefinition> & { id: string }): ColumnDefinition {
  return {
    label: overrides.id,
    type: 'string',
    tier: 'core',
    defaultWidth: 100,
    visible: true,
    sortable: true,
    ...overrides,
  }
}

function row(cells: AssetRow['cells'], selected = false): AssetRow {
  return {
    id: 'test',
    cells,
    selected,
    columnOrder: cells.map(c => c.columnId),
  }
}

function wrap(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>)
}

describe('AssetListItem', () => {
  describe('name column', () => {
    it('renders primary value', () => {
      wrap(<AssetListItem row={row([{ columnId: 'name', value: 'groove-01', secondaryValue: 'packs/' }])} columns={[col({ id: 'name' })]} />)
      expect(screen.getByText('groove-01')).toBeInTheDocument()
    })

    it('renders secondary value (folder path)', () => {
      wrap(<AssetListItem row={row([{ columnId: 'name', value: 'groove-01', secondaryValue: 'packs/ambient/' }])} columns={[col({ id: 'name' })]} />)
      expect(screen.getByText('packs/ambient/')).toBeInTheDocument()
    })

    it('omits secondary value when not provided', () => {
      wrap(<AssetListItem row={row([{ columnId: 'name', value: 'groove-01' }])} columns={[col({ id: 'name' })]} />)
      expect(screen.queryByText('packs/')).toBeNull()
    })

    it('sets title attribute combining primary and secondary', () => {
      const { container } = wrap(
        <AssetListItem
          row={row([{ columnId: 'name', value: 'groove-01', secondaryValue: 'packs/' }])}
          columns={[col({ id: 'name' })]}
        />
      )
      expect(container.querySelector('td[title]')?.getAttribute('title')).toBe('groove-01\npacks/')
    })

    it('title is undefined for non-name columns', () => {
      const { container } = wrap(
        <AssetListItem
          row={row([{ columnId: 'type', value: 'MIDI' }])}
          columns={[col({ id: 'type' })]}
        />
      )
      expect(container.querySelector('td')?.getAttribute('title')).toBeNull()
    })
  })

  describe('type column', () => {
    it('renders value inside type-badge span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'type', value: 'MIDI' }])} columns={[col({ id: 'type' })]} />)
      expect(screen.getByText('MIDI')).toHaveClass('type-badge')
    })
  })

  describe('duration column', () => {
    it('formats seconds as m:ss', () => {
      wrap(<AssetListItem row={row([{ columnId: 'duration', value: 218 }])} columns={[col({ id: 'duration', type: 'duration' })]} />)
      expect(screen.getByText('3:38')).toBeInTheDocument()
    })

    it('renders empty when value is null', () => {
      wrap(<AssetListItem row={row([{ columnId: 'duration', value: null }])} columns={[col({ id: 'duration', type: 'duration' })]} />)
      expect(screen.queryByText(/:/)).toBeNull()
    })

    it('renders empty when value is non-numeric', () => {
      wrap(<AssetListItem row={row([{ columnId: 'duration', value: 'n/a' as unknown as number }])} columns={[col({ id: 'duration', type: 'duration' })]} />)
      expect(screen.queryByText('n/a')).toBeNull()
    })

    it('formats 0 seconds as 0:00', () => {
      wrap(<AssetListItem row={row([{ columnId: 'duration', value: 0 }])} columns={[col({ id: 'duration', type: 'duration' })]} />)
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })
  })

  describe('size column', () => {
    it('formats bytes >= 1 000 000 as MB', () => {
      wrap(<AssetListItem row={row([{ columnId: 'size', value: 2_457_600 }])} columns={[col({ id: 'size', type: 'numeric' })]} />)
      expect(screen.getByText('2.5 MB')).toBeInTheDocument()
    })

    it('formats bytes < 1 000 000 as KB', () => {
      wrap(<AssetListItem row={row([{ columnId: 'size', value: 43_520 }])} columns={[col({ id: 'size', type: 'numeric' })]} />)
      expect(screen.getByText('43 KB')).toBeInTheDocument()
    })

    it('renders empty when value is null', () => {
      wrap(<AssetListItem row={row([{ columnId: 'size', value: null }])} columns={[col({ id: 'size', type: 'numeric' })]} />)
      const td = screen.getAllByRole('cell')[0]
      expect(td.textContent).toBe('')
    })
  })

  describe('tags column', () => {
    it('renders each tag as a span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'tags', value: ['ambient', 'slow'] }])} columns={[col({ id: 'tags', type: 'tags' })]} />)
      expect(screen.getByText('ambient')).toBeInTheDocument()
      expect(screen.getByText('slow')).toBeInTheDocument()
    })

    it('renders empty when value is null', () => {
      wrap(<AssetListItem row={row([{ columnId: 'tags', value: null }])} columns={[col({ id: 'tags', type: 'tags' })]} />)
      expect(screen.queryByRole('cell')?.textContent).toBe('')
    })

    it('renders empty when value is not an array', () => {
      wrap(<AssetListItem row={row([{ columnId: 'tags', value: 'bad' as unknown as string[] }])} columns={[col({ id: 'tags', type: 'tags' })]} />)
      expect(screen.queryByText('bad')).toBeNull()
    })
  })

  describe('modified column', () => {
    it('renders date string', () => {
      wrap(<AssetListItem row={row([{ columnId: 'modified', value: 'May 28' }])} columns={[col({ id: 'modified', type: 'date' })]} />)
      expect(screen.getByText('May 28')).toBeInTheDocument()
    })
  })

  describe('default/plugin columns', () => {
    it('unknown string column renders plain span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'key', value: 'Cm' }])} columns={[col({ id: 'key', type: 'string', tier: 'plugin' })]} />)
      expect(screen.getByText('Cm')).toBeInTheDocument()
    })

    it('plugin numeric column renders cell-numeric span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'bpm', value: 120 }])} columns={[col({ id: 'bpm', type: 'numeric', tier: 'plugin' })]} />)
      expect(screen.getByText('120')).toHaveClass('cell-numeric')
    })

    it('plugin duration column renders cell-duration span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'myDur', value: '3:38' }])} columns={[col({ id: 'myDur', type: 'duration', tier: 'plugin' })]} />)
      expect(screen.getByText('3:38')).toHaveClass('cell-duration')
    })

    it('plugin date column renders cell-date span', () => {
      wrap(<AssetListItem row={row([{ columnId: 'created', value: '2026-01-01' }])} columns={[col({ id: 'created', type: 'date', tier: 'plugin' })]} />)
      expect(screen.getByText('2026-01-01')).toHaveClass('cell-date')
    })
  })

  describe('row selection', () => {
    it('applies row-selected class when selected', () => {
      wrap(<AssetListItem row={row([{ columnId: 'name', value: 'x' }], true)} columns={[col({ id: 'name' })]} />)
      expect(screen.getByRole('row')).toHaveClass('row-selected')
      expect(screen.getByRole('row')).toHaveAttribute('aria-selected', 'true')
    })

    it('no row-selected class when not selected', () => {
      wrap(<AssetListItem row={row([{ columnId: 'name', value: 'x' }], false)} columns={[col({ id: 'name' })]} />)
      expect(screen.getByRole('row')).not.toHaveClass('row-selected')
      expect(screen.getByRole('row')).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('invisible columns', () => {
    it('hides columns where visible is false', () => {
      const columns: ColumnDefinition[] = [
        col({ id: 'name', visible: true }),
        col({ id: 'type', visible: false }),
      ]
      wrap(<AssetListItem
        row={row([{ columnId: 'name', value: 'groove-01' }, { columnId: 'type', value: 'MIDI' }])}
        columns={columns}
      />)
      expect(screen.getByText('groove-01')).toBeInTheDocument()
      expect(screen.queryByText('MIDI')).toBeNull()
    })
  })

  describe('missing cell', () => {
    it('renders empty cell when no matching cell exists for column', () => {
      wrap(<AssetListItem row={row([])} columns={[col({ id: 'name' })]} />)
      // Should not crash; td should be present with no content
      expect(screen.getByRole('row')).toBeInTheDocument()
    })
  })
})
