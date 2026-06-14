// Operation and parameter types shared across renderer and main process.

export type OperationId = string;
export type SavedOperationId = string;

// Flavor A: produces new output files in a destination folder (non-destructive).
// Flavor B: modifies source files in place (destructive — always shows warning in Config step).
export type OperationFlavor = 'creates-files' | 'modifies-in-place';

export type ParameterType = 'text' | 'numeric' | 'select' | 'toggle' | 'file-picker';

export type FileOperationStatus = 'pending' | 'running' | 'success' | 'failed';

// 'partial' = some files succeeded, some failed
export type OperationOutcome = 'success' | 'partial' | 'failed' | 'cancelled';

export type OperationModalStep = 'palette' | 'config' | 'integrity-check' | 'running' | 'complete';

// ──────────────────────────────────────
// Parameter model (plugin → shell)
// ──────────────────────────────────────

export interface ParameterDefinition {
  id: string;
  label: string;
  type: ParameterType;
  required: boolean;
  defaultValue: string | number | boolean | null;
  helperText?: string;
  // numeric only
  min?: number;
  max?: number;
  step?: number;
  // select only
  options?: string[];
}

// Values filled by the user; keyed by ParameterDefinition.id
export type ParameterValues = Record<string, string | number | boolean | null>;

// ──────────────────────────────────────
// Operation definition (plugin → shell)
// ──────────────────────────────────────

export interface OperationDefinition {
  id: OperationId;
  name: string;
  description: string;
  supportedTypes: string[];            // file extensions, e.g. ["mid", "midi"]
  flavor: OperationFlavor;
  // Flavor B is always destructive; derived by UI as flavor === 'modifies-in-place'
  parameters: ParameterDefinition[];
  outputLocator?: string;              // Flavor A: search hint for output files (e.g. "_normalized")
}

// ──────────────────────────────────────
// Saved named configuration
// ──────────────────────────────────────

export interface SavedOperationConfig {
  id: SavedOperationId;
  name: string;                        // user-assigned; unique (enforced at creation)
  operationId: OperationId;
  parameterValues: ParameterValues;
  outputPath?: string;
}

// ──────────────────────────────────────
// Execution progress and result
// ──────────────────────────────────────

export interface FileOperationProgress {
  assetId: string;
  filename: string;
  status: FileOperationStatus;
  errorReason?: string;                // plugin-provided; present when status === 'failed'
}

// Snapshot emitted during an operation via the onProgress callback
export interface OperationProgress {
  operationId: OperationId;
  operationName: string;
  files: FileOperationProgress[];
  processedCount: number;
  totalCount: number;
}

// Final result after the operation resolves
export interface OperationResult {
  operationId: OperationId;
  operationName: string;
  outcome: OperationOutcome;
  flavor: OperationFlavor;
  files: FileOperationProgress[];
  outputLocator?: string;              // present when plugin declared one; used for Library search hint
  startedAt: string;                   // ISO 8601
  completedAt: string;                 // ISO 8601
}
