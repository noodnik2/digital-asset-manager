// Mock implementation of AppServices — renderer-only; no Electron, no DB, no filesystem.
// Used by `npm run dev:renderer` to validate the shell UI without a real backend.

import type { AppServices, WorkingSetItem } from '@shared/appservices'
import type {
  Asset,
  AssetRow,
  AssetCell,
  ColumnDefinition,
  LibraryQuery,
  LibraryViewState,
} from '@shared/types/asset'
import type {
  OperationDefinition,
  OperationResult,
  SavedOperationConfig,
} from '@shared/types/operation'

// ── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: ColumnDefinition[] = [
  { id: 'name',     label: 'Name',     type: 'string',   tier: 'core',   defaultWidth: 240, minWidth: 120, visible: true, pinned: true, sortable: true },
  { id: 'type',     label: 'Type',     type: 'string',   tier: 'core',   defaultWidth: 56,  visible: true, sortable: true },
  { id: 'duration', label: 'Duration', type: 'duration', tier: 'shared', defaultWidth: 72,  visible: true, sortable: true },
  { id: 'size',     label: 'Size',     type: 'numeric',  tier: 'shared', defaultWidth: 72,  visible: true, sortable: true },
  { id: 'tags',     label: 'Tags',     type: 'tags',     tier: 'core',   defaultWidth: 128, visible: true, sortable: false },
  { id: 'modified', label: 'Modified', type: 'date',     tier: 'core',   defaultWidth: 96,  visible: true, sortable: true },
]

// ── Raw assets ───────────────────────────────────────────────────────────────
// Mixed types to exercise: two-line Name cell, null durations, mixed folder paths,
// varied tags, a 2025 date (triggers YYYY-MM-DD format vs "May 22").

const ASSETS: Asset[] = [
  {
    id: '1',
    filename: 'groove-01',
    extension: 'mid',
    fileType: 'MIDI',
    folderPath: 'packs/ambient/',
    absolutePath: '/Users/marty/sounds/packs/ambient/groove-01.mid',
    tags: ['ambient', 'slow'],
    modifiedAt: '2026-05-28T14:23:00Z',
    size: 43520,
    duration: 218,
    pluginFields: { bpm: 84, tracks: 4, key: 'Cm', timeSig: '4/4' },
  },
  {
    id: '2',
    filename: 'bass-loop-03',
    extension: 'mid',
    fileType: 'MIDI',
    folderPath: 'sessions/2026-03/',
    absolutePath: '/Users/marty/sounds/sessions/2026-03/bass-loop-03.mid',
    tags: ['bass'],
    modifiedAt: '2026-03-15T09:47:00Z',
    size: 12288,
    duration: 135,
    pluginFields: { bpm: 120, tracks: 2, key: 'Am', timeSig: '4/4' },
  },
  {
    id: '3',
    filename: 'session-a-chords',
    extension: 'mid',
    fileType: 'MIDI',
    folderPath: 'sessions/2026-03/',
    absolutePath: '/Users/marty/sounds/sessions/2026-03/session-a-chords.mid',
    tags: ['chords', 'session'],
    modifiedAt: '2026-03-20T17:05:00Z',
    size: 28672,
    duration: 242,
    pluginFields: { bpm: 95, tracks: 6, key: 'F', timeSig: '3/4' },
  },
  {
    id: '4',
    filename: 'arp-v2-final',
    extension: 'mid',
    fileType: 'MIDI',
    folderPath: 'packs/ambient/',
    absolutePath: '/Users/marty/sounds/packs/ambient/arp-v2-final.mid',
    tags: ['arp', 'ambient', 'final'],
    modifiedAt: '2026-05-22T11:30:00Z',
    size: 18944,
    duration: 96,
    pluginFields: { bpm: 110, tracks: 3, key: 'Gmaj', timeSig: '4/4' },
  },
  {
    id: '5',
    filename: 'kick-pattern-04',
    extension: 'mid',
    fileType: 'MIDI',
    folderPath: 'drums/',
    absolutePath: '/Users/marty/sounds/drums/kick-pattern-04.mid',
    tags: ['drums', 'kick'],
    modifiedAt: '2025-11-03T08:15:00Z',
    size: 8192,
    duration: 32,
    pluginFields: { bpm: 140, tracks: 1, key: null, timeSig: '4/4' },
  },
  {
    id: '6',
    filename: 'cover-art',
    extension: 'jpg',
    fileType: 'JPEG',
    folderPath: 'packs/ambient/',
    absolutePath: '/Users/marty/sounds/packs/ambient/cover-art.jpg',
    tags: ['ref'],
    modifiedAt: '2026-04-10T16:00:00Z',
    size: 2457600,
    duration: null,
    pluginFields: {},
  },
  {
    id: '7',
    filename: 'session-notes',
    extension: 'md',
    fileType: 'MD',
    folderPath: 'sessions/2026-03/',
    absolutePath: '/Users/marty/sounds/sessions/2026-03/session-notes.md',
    tags: ['notes'],
    modifiedAt: '2026-03-21T10:00:00Z',
    size: 4096,
    duration: null,
    pluginFields: {},
  },
]

// ── Operations ───────────────────────────────────────────────────────────────
// One of each flavor so both Complete-state paths are reachable later.

const OPERATIONS: OperationDefinition[] = [
  {
    id: 'midi-normalize-velocity',
    name: 'Normalize Velocity',
    description: 'Scale all note velocities to a target range.',
    supportedTypes: ['mid', 'midi'],
    flavor: 'modifies-in-place',
    parameters: [
      { id: 'min', label: 'Min velocity', type: 'numeric', required: true, defaultValue: 20, min: 0, max: 127 },
      { id: 'max', label: 'Max velocity', type: 'numeric', required: true, defaultValue: 110, min: 0, max: 127 },
    ],
  },
  {
    id: 'midi-export-wav',
    name: 'Export to WAV',
    description: 'Render MIDI to audio using the system default soundfont.',
    supportedTypes: ['mid', 'midi'],
    flavor: 'creates-files',
    parameters: [
      {
        id: 'sampleRate',
        label: 'Sample rate',
        type: 'select',
        required: true,
        defaultValue: '44100',
        options: ['44100', '48000', '96000'],
      },
    ],
    outputLocator: '_rendered',
  },
]

// ── In-memory Working Set state ──────────────────────────────────────────────
// Pre-seeded with two items so the Working Set pane renders populated on first load.

let workingSetItems: WorkingSetItem[] = [
  { assetId: '1', filename: 'groove-01',    extension: 'mid', fileType: 'MIDI', duration: 218 },
  { assetId: '4', filename: 'arp-v2-final', extension: 'mid', fileType: 'MIDI', duration: 96 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toISOString().split('T')[0]
}

function assetToRow(asset: Asset, selectedIds: Set<string>): AssetRow {
  const cells: AssetCell[] = [
    { columnId: 'name',     value: asset.filename, secondaryValue: asset.folderPath },
    { columnId: 'type',     value: asset.fileType },
    { columnId: 'duration', value: asset.duration },
    { columnId: 'size',     value: asset.size },
    { columnId: 'tags',     value: asset.tags.length > 0 ? asset.tags : null },
    { columnId: 'modified', value: formatDate(asset.modifiedAt) },
  ]
  return {
    id: asset.id,
    cells,
    selected: selectedIds.has(asset.id),
    columnOrder: ['name', 'type', 'duration', 'size', 'tags', 'modified'],
  }
}

function applyQuery(assets: Asset[], query: LibraryQuery): Asset[] {
  let result = [...assets]
  if (query.search) {
    const q = query.search.toLowerCase()
    result = result.filter(
      a =>
        a.filename.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)),
    )
  }
  if (query.filter?.assetTypes?.length) {
    const types = new Set(query.filter.assetTypes.map(t => t.toLowerCase()))
    result = result.filter(a => types.has(a.extension.toLowerCase()))
  }
  return result
}

// ── Mock AppServices ──────────────────────────────────────────────────────────

let savedQuery: LibraryQuery = { sortColumn: 'modified', sortDirection: 'desc' }
const selectedIds = new Set<string>()

export const mockServices: AppServices = {
  library: {
    async query(query: LibraryQuery): Promise<LibraryViewState> {
      const filtered = applyQuery(ASSETS, query)
      return {
        items: filtered.map(a => assetToRow(a, selectedIds)),
        totalCount: ASSETS.length,
        filteredCount: filtered.length,
        columns: COLUMNS,
      }
    },
    async getColumns() {
      return COLUMNS
    },
    async setColumnWidth(_columnId: string, _width: number) {},
    async setColumnVisible(_columnId: string, _visible: boolean) {},
    async getSavedQuery() {
      return savedQuery
    },
    async saveQuery(q: LibraryQuery) {
      savedQuery = q
    },
  },

  workingSet: {
    async getItems() {
      return [...workingSetItems]
    },
    async addAssets(assetIds: string[]) {
      const existing = new Set(workingSetItems.map(i => i.assetId))
      const added: string[] = []
      const skipped: string[] = []
      for (const id of assetIds) {
        if (existing.has(id)) {
          skipped.push(id)
          continue
        }
        const asset = ASSETS.find(a => a.id === id)
        if (!asset) continue
        workingSetItems.push({
          assetId: asset.id,
          filename: asset.filename,
          extension: asset.extension,
          fileType: asset.fileType,
          duration: asset.duration,
        })
        added.push(id)
      }
      return { added, skipped }
    },
    async removeAsset(assetId: string) {
      workingSetItems = workingSetItems.filter(i => i.assetId !== assetId)
    },
    async clear() {
      workingSetItems = []
    },
  },

  operations: {
    async getAvailable(contentTypes: string[]) {
      return OPERATIONS.filter(op =>
        contentTypes.every(t => op.supportedTypes.includes(t.toLowerCase())),
      )
    },
    async getSavedConfigs(_operationId?: string): Promise<SavedOperationConfig[]> {
      return []
    },
    async saveConfig(name, operationId, params, outputPath): Promise<SavedOperationConfig> {
      return {
        id: crypto.randomUUID(),
        name,
        operationId,
        parameterValues: params,
        outputPath,
      }
    },
    async deleteSavedConfig(_id: string) {},
    async resolveOutputPath(_assetIds: string[]) {
      return '/Users/marty/sounds/output/'
    },
    async execute(operationId, _assetIds, _params, _outputPath, _onProgress): Promise<OperationResult> {
      const op = OPERATIONS.find(o => o.id === operationId)
      return {
        operationId,
        operationName: op?.name ?? operationId,
        outcome: 'success',
        flavor: op?.flavor ?? 'creates-files',
        files: [],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      }
    },
    async abort() {},
  },
}
