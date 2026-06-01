import { describe, it, expect, beforeEach } from 'vitest'
import { mockServices } from './mock'

// ── library ──────────────────────────────────────────────────────────────────

describe('mockServices.library', () => {
  describe('query', () => {
    it('returns all 7 assets with no filter', async () => {
      const result = await mockServices.library.query({})
      expect(result.totalCount).toBe(7)
      expect(result.filteredCount).toBe(7)
      expect(result.items).toHaveLength(7)
    })

    it('filters by search term on filename', async () => {
      const result = await mockServices.library.query({ search: 'groove' })
      expect(result.filteredCount).toBe(1)
      expect(result.items[0].cells[0].value).toBe('groove-01')
    })

    it('filters by search term matching tags', async () => {
      // 'ambient' appears in tags of groove-01 and arp-v2-final
      const result = await mockServices.library.query({ search: 'ambient' })
      expect(result.filteredCount).toBe(2)
    })

    it('search is case-insensitive', async () => {
      const result = await mockServices.library.query({ search: 'GROOVE' })
      expect(result.filteredCount).toBe(1)
    })

    it('returns totalCount regardless of filter', async () => {
      const result = await mockServices.library.query({ search: 'groove' })
      expect(result.totalCount).toBe(7)
    })

    it('filters by assetType extension', async () => {
      const result = await mockServices.library.query({ filter: { assetTypes: ['jpg'] } })
      expect(result.filteredCount).toBe(1)
      expect(result.items[0].cells[0].value).toBe('cover-art')
    })

    it('filters by multiple asset types', async () => {
      // jpg and md
      const result = await mockServices.library.query({ filter: { assetTypes: ['jpg', 'md'] } })
      expect(result.filteredCount).toBe(2)
    })

    it('returns empty when assetType matches nothing', async () => {
      const result = await mockServices.library.query({ filter: { assetTypes: ['wav'] } })
      expect(result.filteredCount).toBe(0)
    })

    it('passes through empty filter (no assetTypes filter)', async () => {
      const result = await mockServices.library.query({ filter: {} })
      expect(result.filteredCount).toBe(7)
    })

    it('formats same-year date as "Mon D" or "Mon DD"', async () => {
      // groove-01: 2026-05-28 — current year 2026 → locale short format
      const result = await mockServices.library.query({ search: 'groove-01' })
      const modifiedCell = result.items[0].cells.find(c => c.columnId === 'modified')
      expect(typeof modifiedCell?.value).toBe('string')
      expect(String(modifiedCell?.value)).toMatch(/^[A-Z][a-z]+ \d+$/)
    })

    it('formats prior-year date as YYYY-MM-DD', async () => {
      // kick-pattern-04: 2025-11-03 — prior year → ISO date slice
      const result = await mockServices.library.query({ search: 'kick-pattern' })
      const modifiedCell = result.items[0].cells.find(c => c.columnId === 'modified')
      expect(String(modifiedCell?.value)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('maps null duration to null in cells', async () => {
      // cover-art (id 6) has duration: null
      const result = await mockServices.library.query({ search: 'cover-art' })
      const durationCell = result.items[0].cells.find(c => c.columnId === 'duration')
      expect(durationCell?.value).toBeNull()
    })

    it('includes columns in view state', async () => {
      const result = await mockServices.library.query({})
      expect(result.columns).toHaveLength(6)
      expect(result.columns[0].id).toBe('name')
    })

    it('all rows have selected:false (no selection service yet)', async () => {
      const result = await mockServices.library.query({})
      expect(result.items.every(row => !row.selected)).toBe(true)
    })

    it('name cell has secondaryValue (folderPath)', async () => {
      const result = await mockServices.library.query({ search: 'groove-01' })
      const nameCell = result.items[0].cells.find(c => c.columnId === 'name')
      expect(nameCell?.secondaryValue).toBe('packs/ambient/')
    })
  })

  describe('getColumns', () => {
    it('returns 6 column definitions', async () => {
      const columns = await mockServices.library.getColumns()
      expect(columns).toHaveLength(6)
    })

    it('includes name column pinned and visible', async () => {
      const columns = await mockServices.library.getColumns()
      const name = columns.find(c => c.id === 'name')
      expect(name?.pinned).toBe(true)
      expect(name?.visible).toBe(true)
    })
  })

  describe('getSavedQuery / saveQuery', () => {
    it('default saved query sorts by modified desc', async () => {
      const q = await mockServices.library.getSavedQuery()
      expect(q.sortColumn).toBe('modified')
      expect(q.sortDirection).toBe('desc')
    })

    it('round-trips a saved query', async () => {
      await mockServices.library.saveQuery({ sortColumn: 'name', sortDirection: 'asc' })
      const q = await mockServices.library.getSavedQuery()
      expect(q.sortColumn).toBe('name')
      expect(q.sortDirection).toBe('asc')
      // restore default for other tests
      await mockServices.library.saveQuery({ sortColumn: 'modified', sortDirection: 'desc' })
    })
  })

  describe('setColumnWidth / setColumnVisible', () => {
    it('resolves without error', async () => {
      await expect(mockServices.library.setColumnWidth('name', 300)).resolves.toBeUndefined()
      await expect(mockServices.library.setColumnVisible('type', false)).resolves.toBeUndefined()
    })
  })
})

// ── workingSet ───────────────────────────────────────────────────────────────

describe('mockServices.workingSet', () => {
  beforeEach(async () => {
    await mockServices.workingSet.clear()
  })

  it('returns empty list after clear', async () => {
    const items = await mockServices.workingSet.getItems()
    expect(items).toHaveLength(0)
  })

  it('adds assets and returns added list', async () => {
    const result = await mockServices.workingSet.addAssets(['1', '2'])
    expect(result.added).toEqual(['1', '2'])
    expect(result.skipped).toEqual([])
    const items = await mockServices.workingSet.getItems()
    expect(items).toHaveLength(2)
  })

  it('skips duplicate assets on re-add', async () => {
    await mockServices.workingSet.addAssets(['1'])
    const result = await mockServices.workingSet.addAssets(['1', '2'])
    expect(result.added).toEqual(['2'])
    expect(result.skipped).toEqual(['1'])
  })

  it('silently ignores unknown asset IDs', async () => {
    const result = await mockServices.workingSet.addAssets(['unknown-999'])
    expect(result.added).toHaveLength(0)
    const items = await mockServices.workingSet.getItems()
    expect(items).toHaveLength(0)
  })

  it('populates WorkingSetItem from asset data', async () => {
    await mockServices.workingSet.addAssets(['1'])
    const items = await mockServices.workingSet.getItems()
    expect(items[0]).toMatchObject({
      assetId: '1',
      filename: 'groove-01',
      extension: 'mid',
      fileType: 'MIDI',
      duration: 218,
    })
  })

  it('removes a single asset by id', async () => {
    await mockServices.workingSet.addAssets(['1', '2'])
    await mockServices.workingSet.removeAsset('1')
    const items = await mockServices.workingSet.getItems()
    expect(items).toHaveLength(1)
    expect(items[0].assetId).toBe('2')
  })

  it('getItems returns a copy (not the internal reference)', async () => {
    await mockServices.workingSet.addAssets(['1'])
    const a = await mockServices.workingSet.getItems()
    const b = await mockServices.workingSet.getItems()
    expect(a).not.toBe(b)
  })

  it('preserves insertion order', async () => {
    await mockServices.workingSet.addAssets(['3', '1', '2'])
    const items = await mockServices.workingSet.getItems()
    expect(items.map(i => i.assetId)).toEqual(['3', '1', '2'])
  })

  it('includes null duration for non-audio assets', async () => {
    await mockServices.workingSet.addAssets(['6']) // cover-art, duration: null
    const items = await mockServices.workingSet.getItems()
    expect(items[0].duration).toBeNull()
  })
})

// ── operations ───────────────────────────────────────────────────────────────

describe('mockServices.operations', () => {
  it('returns both midi operations for mid type', async () => {
    const ops = await mockServices.operations.getAvailable(['mid'])
    expect(ops).toHaveLength(2)
  })

  it('returns no operations for unsupported type', async () => {
    const ops = await mockServices.operations.getAvailable(['jpg'])
    expect(ops).toHaveLength(0)
  })

  it('requires all content types to match (intersection)', async () => {
    const ops = await mockServices.operations.getAvailable(['mid', 'jpg'])
    expect(ops).toHaveLength(0)
  })

  it('getSavedConfigs returns empty array', async () => {
    const configs = await mockServices.operations.getSavedConfigs()
    expect(configs).toEqual([])
  })

  it('getSavedConfigs with operationId still returns empty', async () => {
    const configs = await mockServices.operations.getSavedConfigs('midi-normalize-velocity')
    expect(configs).toEqual([])
  })

  it('saveConfig returns a config with a generated id', async () => {
    const config = await mockServices.operations.saveConfig(
      'my-preset',
      'midi-normalize-velocity',
      { min: 10, max: 100 },
    )
    expect(config.id).toBeTruthy()
    expect(config.name).toBe('my-preset')
    expect(config.operationId).toBe('midi-normalize-velocity')
    expect(config.parameterValues).toEqual({ min: 10, max: 100 })
  })

  it('saveConfig with outputPath includes it', async () => {
    const config = await mockServices.operations.saveConfig(
      'with-path',
      'midi-export-wav',
      { sampleRate: '44100' },
      '/output/',
    )
    expect(config.outputPath).toBe('/output/')
  })

  it('deleteSavedConfig resolves without error', async () => {
    await expect(mockServices.operations.deleteSavedConfig('any-id')).resolves.toBeUndefined()
  })

  it('resolveOutputPath returns a string path', async () => {
    const path = await mockServices.operations.resolveOutputPath(['1', '2'])
    expect(typeof path).toBe('string')
    expect(path).toContain('/')
  })

  it('execute returns success outcome', async () => {
    const result = await mockServices.operations.execute(
      'midi-normalize-velocity',
      ['1'],
      { min: 20, max: 110 },
      null,
      () => {},
    )
    expect(result.outcome).toBe('success')
    expect(result.operationId).toBe('midi-normalize-velocity')
    expect(result.operationName).toBe('Normalize Velocity')
  })

  it('execute with unknown operationId falls back to id as name', async () => {
    const result = await mockServices.operations.execute(
      'unknown-op',
      ['1'],
      {},
      null,
      () => {},
    )
    expect(result.operationName).toBe('unknown-op')
    expect(result.outcome).toBe('success')
  })

  it('abort resolves without error', async () => {
    await expect(mockServices.operations.abort()).resolves.toBeUndefined()
  })
})
