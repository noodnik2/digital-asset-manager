// Technology-agnostic service contract for the renderer.
// The renderer depends only on this interface. Transport (IPC, mock) is injected at runtime —
// the renderer never imports from tRPC, Electron, or any specific transport.
//
// The interface grows only to support features defined in the design specs or explicitly requested.

import type { AssetId, LibraryQuery, LibraryViewState, ColumnDefinition, IntegrityCheckResult } from './types/asset';
import type {
  OperationId,
  SavedOperationId,
  OperationDefinition,
  SavedOperationConfig,
  ParameterValues,
  OperationProgress,
  OperationResult,
} from './types/operation';

// ──────────────────────────────────────
// Working Set item (view type for the renderer)
// ──────────────────────────────────────

export interface WorkingSetItem {
  assetId: AssetId;
  filename: string;            // without extension
  extension: string;           // raw extension, e.g. "mid"
  fileType: string;            // display label, e.g. "MIDI"
  duration: number | null;     // seconds; null if not applicable
}

// ──────────────────────────────────────
// LibraryService
// ──────────────────────────────────────

export interface LibraryService {
  // Returns the current view of the library for the given query.
  // Result includes rows, counts, and the active column set.
  query(query: LibraryQuery): Promise<LibraryViewState>;

  // Column layout management — changes persist across sessions.
  getColumns(): Promise<ColumnDefinition[]>;
  setColumnWidth(columnId: string, width: number): Promise<void>;
  setColumnVisible(columnId: string, visible: boolean): Promise<void>;

  // Persist and restore the last-used sort/filter/search state across sessions.
  // NOTE: these methods are assumed necessary per the session persistence spec but were not
  // explicitly defined as service methods in the design docs — verify if the mechanism should
  // be different (e.g. handled by the transport layer instead).
  getSavedQuery(): Promise<LibraryQuery>;
  saveQuery(query: LibraryQuery): Promise<void>;

  // Pre-execution integrity gate: compares each asset's current filesystem mtime and size
  // against the indexed values. Returns immediately; does not re-index.
  // 'modified' = mtime or size differs; 'missing' = file not found at absolutePath.
  checkIntegrity(assetIds: AssetId[]): Promise<IntegrityCheckResult>;
}

// ──────────────────────────────────────
// WorkingSetService
// ──────────────────────────────────────

export interface WorkingSetService {
  // Returns items in insertion order (Working Set order of addition).
  getItems(): Promise<WorkingSetItem[]>;

  // Adds assets to the Working Set; silently deduplicates.
  // Returns which assetIds were actually added vs already present.
  addAssets(assetIds: AssetId[]): Promise<{ added: AssetId[]; skipped: AssetId[] }>;

  removeAsset(assetId: AssetId): Promise<void>;
  clear(): Promise<void>;
}

// ──────────────────────────────────────
// OperationService
// ──────────────────────────────────────

export interface OperationService {
  // Returns operations compatible with ALL content types in contentTypes.
  // contentTypes: array of file extensions currently in the Working Set.
  getAvailable(contentTypes: string[]): Promise<OperationDefinition[]>;

  // Saved named configurations.
  getSavedConfigs(operationId?: OperationId): Promise<SavedOperationConfig[]>;
  saveConfig(
    name: string,
    operationId: OperationId,
    params: ParameterValues,
    outputPath?: string,
  ): Promise<SavedOperationConfig>;
  deleteSavedConfig(id: SavedOperationId): Promise<void>;

  // Resolve the default output path for Flavor A operations given the current Working Set.
  // Rule: if all WS items share one folder → that folder; else → app-wide output folder (settings).
  resolveOutputPath(assetIds: AssetId[]): Promise<string>;

  // Execute an operation. onProgress is called on every file status transition.
  // Resolves with the final OperationResult when the operation completes or is aborted.
  execute(
    operationId: OperationId,
    assetIds: AssetId[],
    params: ParameterValues,
    outputPath: string | null,
    onProgress: (progress: OperationProgress) => void,
  ): Promise<OperationResult>;

  // Signals the running operation to stop after the current file completes.
  // The execute() promise will resolve with outcome === 'cancelled'.
  abort(): Promise<void>;
}

// ──────────────────────────────────────
// AppServices — the single injection point
// ──────────────────────────────────────

export interface AppServices {
  library: LibraryService;
  workingSet: WorkingSetService;
  operations: OperationService;
}
