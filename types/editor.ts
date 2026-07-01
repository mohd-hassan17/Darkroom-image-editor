/**
 * Core domain types for the editor.
 * Kept separate from components/hooks so the "shape of the data"
 * is documented in one place (the Model, in MVVM terms).
 */

export type ToolId =
  | "upload"
  | "draw"
  | "shapes"
  | "text"
  | "crop"
  | "rotate"
  | "zoom";

export type ShapeKind = "rectangle" | "circle" | "triangle" | "line";

export interface ImageMeta {
  fileName: string;
  originalWidth: number;
  originalHeight: number;
  mimeType: string;
  uploadedAt: string; // ISO timestamp
}

export interface EditMetadata {
  rotationDegrees: number;
  cropApplied: boolean;
  zoomLevel: number;
  lastModified: string; // ISO timestamp
}

/**
 * Shape of the JSON file produced by "Export JSON".
 * `canvasObjects` is Fabric's own serialization of every annotation/drawing
 * object (paths, shapes, text) — we don't reinvent that format, we just
 * wrap it with the metadata the assignment asks for.
 */
export interface EditorExport {
  version: 1;
  image: ImageMeta | null;
  edit: EditMetadata;
  canvasObjects: Record<string, unknown>;
}

export interface HistorySnapshot {
  json: string; // serialized canvas state (JSON.stringify of canvas.toJSON())
}
