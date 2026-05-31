// Plugin-author contract. Bundled plugins (MIDI in v1) implement these interfaces.
// The renderer never imports this file — plugins are registered in the main process only.
// The shell interacts with plugin data through AppServices, not through these interfaces directly.

import type { AssetId } from './types/asset';
import type { OperationDefinition, ParameterValues, FileOperationStatus } from './types/operation';

// ──────────────────────────────────────
// Column model (plugin side)
// ──────────────────────────────────────

// Plugin columns do not include 'tags' — that is a core shell-managed column type.
export type PluginColumnType = 'string' | 'numeric' | 'duration' | 'date';

export interface PluginColumnDeclaration {
  id: string;                          // unique within the plugin; becomes the AssetCell.columnId
  label: string;                       // column header text (rendered verbatim by shell)
  type: PluginColumnType;
  defaultWidth: number;                // px
  defaultVisible: boolean;
  // Spec (asset-list-item, library-layout): "—" shown only when a file type is EXPECTED to have
  // the value but doesn't (e.g. corrupted audio). For types that never have this field, empty cell.
  showDashWhenNull?: boolean;
}
// Registration constraint: max 10 total columns per plugin, max 3 with defaultVisible === true.
// Enforced at plugin registration time; plugins exceeding either limit are rejected.

// ──────────────────────────────────────
// Filter field model (plugin side)
// ──────────────────────────────────────

// Decisions log (Gap 2): controlType is one of four values; presetOptions only for 'preset'.
export interface PluginFilterField {
  columnId: string;
  controlType: 'range' | 'multiselect' | 'comparison' | 'preset';
  presetOptions?: string[];            // only for controlType === 'preset'
}

// ──────────────────────────────────────
// Execution callback
// ──────────────────────────────────────

// fileIndex corresponds to position in the filePaths array passed to executeOperation.
// The main-process service maps fileIndex back to AssetId for OperationProgress.
export type ProgressCallback = (
  fileIndex: number,
  status: FileOperationStatus,
  errorReason?: string,
) => void;

// ──────────────────────────────────────
// Metadata plugin (one per file extension)
// ──────────────────────────────────────

export interface MetadataPlugin {
  readonly id: string;
  readonly name: string;
  readonly supportedTypes: string[];   // file extensions, e.g. ["mid", "midi"]
  readonly columns: readonly PluginColumnDeclaration[]; // max 10; max 3 defaultVisible
  readonly filterFields: readonly PluginFilterField[];
  // Decisions log (Gap 1): if true, shell shows "—" for null duration (file type expected to have
  // duration but doesn't — e.g. corrupted file). If false, shell renders an empty cell.
  readonly providesDuration: boolean;
  // Optional: override the raw extension display label for the Type column (e.g. "mid" → "MIDI")
  getFileTypeLabel?(extension: string): string;
  // Returns plugin-specific field values for a single file, keyed by PluginColumnDeclaration.id
  extractFields(absolutePath: string): Promise<Record<string, unknown>>;
}

// ──────────────────────────────────────
// Operation plugin (multiple per file extension allowed)
// ──────────────────────────────────────

export interface OperationPlugin {
  readonly id: string;
  readonly name: string;
  readonly operations: readonly OperationDefinition[];
  // filePaths: absolute paths of WS items in Working Set order.
  // outputPath: resolved destination folder (Flavor A) or null (Flavor B).
  executeOperation(
    operationId: string,
    filePaths: readonly string[],
    params: ParameterValues,
    outputPath: string | null,
    onProgress: ProgressCallback,
  ): Promise<void>;
}

// ──────────────────────────────────────
// Bundled plugin (may provide both metadata and operations)
// ──────────────────────────────────────

export interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly metadata?: MetadataPlugin;
  readonly operations?: OperationPlugin;
}
