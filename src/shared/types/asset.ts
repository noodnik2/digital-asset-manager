// Core asset and library-view types shared across renderer and main process.

export type AssetId = string;

// 'tags' is the shell-managed multi-value column; plugins use the four below.
export type ColumnType = 'string' | 'numeric' | 'duration' | 'date' | 'tags';
export type ColumnTier = 'core' | 'shared' | 'plugin';
export type SortDirection = 'asc' | 'desc';

// ──────────────────────────────────────
// Raw asset — stored in DB, returned by LibraryService
// ──────────────────────────────────────

export interface Asset {
  id: AssetId;
  filename: string;            // without extension
  extension: string;           // lowercase raw extension, e.g. "mid"
  fileType: string;            // display label, e.g. "MIDI" — may be plugin-overridden
  folderPath: string;          // relative to library root, e.g. "samples/2024/ambient/"
  absolutePath: string;        // full filesystem path (used by plugins; omit from renderer when not needed)
  tags: string[];
  modifiedAt: string;          // ISO 8601
  size: number;                // bytes
  duration: number | null;     // seconds; null = not applicable OR not yet extracted
  pluginFields: Record<string, unknown>; // plugin-specific values keyed by PluginColumnDeclaration.id
}

// ──────────────────────────────────────
// Table-row rendering contract (asset-list-item spec)
// ──────────────────────────────────────

export interface AssetCell {
  columnId: string;
  value: string | number | string[] | null;
  secondaryValue?: string;     // name column only: folder path
}

export interface AssetRow {
  id: AssetId;
  cells: AssetCell[];
  selected: boolean;
  columnOrder: string[];       // ordered columnIds matching the visible column set
}

// ──────────────────────────────────────
// Column model
// ──────────────────────────────────────

export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  tier: ColumnTier;
  defaultWidth: number;        // px
  minWidth?: number;           // px; name column enforces 120px minimum
  visible: boolean;
  pinned?: boolean;            // true for name column (always on screen)
  sortable: boolean;
}

// ──────────────────────────────────────
// Library query and filter
// ──────────────────────────────────────

// Plugin filter value shapes keyed by PluginFilterField.controlType
export type RangeFilter = { min?: number; max?: number };
export type ComparisonFilter = { op: '>' | '<' | '>=' | '<='; value: number };
// 'preset' and 'multiselect' carry string values; multiselect is an array
export type PluginFilterValue = RangeFilter | ComparisonFilter | string[] | string;

export interface LibraryFilter {
  assetTypes?: string[];               // file extensions to include, e.g. ["mid", "midi"]
  tags?: string[];                     // items matching any of these tags
  // NOTE: exact dateModifiedPreset values are not yet enumerated in the spec.
  // Using `string` until presets are finalized (e.g. 'today' | 'last7' | 'last30' | 'last90').
  dateModifiedPreset?: string;
  pluginFilters?: Record<string, PluginFilterValue>; // columnId → filter value
}

export interface LibraryQuery {
  search?: string;
  filter?: LibraryFilter;
  sortColumn?: string;
  sortDirection?: SortDirection;
}

// ──────────────────────────────────────
// Library view state (returned by LibraryService.query)
// ──────────────────────────────────────

export interface LibraryViewState {
  items: AssetRow[];
  totalCount: number;
  filteredCount: number;               // after search + filter; equals totalCount when no active query
  columns: ColumnDefinition[];
}
