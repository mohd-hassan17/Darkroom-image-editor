import { Canvas, FabricImage, FabricObject, Circle, Line, Rect, Triangle } from "fabric";
import type { EditorExport, ImageMeta, ShapeKind } from "@/types/editor";

const MAX_DIMENSION = 2400;

/** Read a File the user picked and resolve it to an HTMLImageElement-backed data URL. */
export function readImageFile(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("That file doesn't look like a valid image."));
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}

/** Clamp an image's natural size down to MAX_DIMENSION on its longest side, preserving aspect ratio. */
export function clampDimensions(width: number, height: number) {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) return { width, height };
  const scale = width > height ? MAX_DIMENSION / width : MAX_DIMENSION / height;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Loads an image onto the canvas as the base layer. If a base image already
 * exists (re-upload), it is replaced; any annotations already on the canvas
 * are left alone.
 */
export async function placeBaseImage(
  canvas: Canvas,
  url: string,
  logicalWidth: number,
  logicalHeight: number
) {
  const existing = canvas.getObjects().find((obj) => obj.get("isBaseImage"));
  if (existing) canvas.remove(existing);

  const fabricImage = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  const scaleX = logicalWidth / (fabricImage.width ?? logicalWidth);
  const scaleY = logicalHeight / (fabricImage.height ?? logicalHeight);

  fabricImage.set({
    left: logicalWidth / 2,
    top: logicalHeight / 2,
    originX: "center",
    originY: "center",
    scaleX,
    scaleY,
    selectable: true,
    evented: true,
  });
  fabricImage.set("isBaseImage", true);

  canvas.add(fabricImage);
  canvas.sendObjectToBack(fabricImage);
  canvas.setActiveObject(fabricImage);
  canvas.requestRenderAll();
  return fabricImage;
}

export function getBaseImage(canvas: Canvas): FabricImage | null {
  const objects = canvas.getObjects();
  const tagged = objects.find((obj) => obj.get("isBaseImage"));
  if (tagged) return tagged as FabricImage;
  return (objects.find((obj) => obj.type === "image") as FabricImage) ?? null;
}

/** Returns the selected image if there is one, otherwise falls back to the base image. */
export function getActiveImage(canvas: Canvas): FabricImage | null {
  const active = canvas.getActiveObject();
  if (active && active.type === "image") return active as FabricImage;
  return getBaseImage(canvas);
}

const SHAPE_DEFAULTS = {
  fill: "transparent",
  stroke: "#e8923a",
  strokeWidth: 3,
};

export function addShape(
  canvas: Canvas,
  kind: ShapeKind,
  options: { stroke: string; fill: string; strokeWidth: number }
) {
  const center = canvas.getCenterPoint();
  const common = {
    left: center.x,
    top: center.y,
    originX: "center" as const,
    originY: "center" as const,
    stroke: options.stroke,
    fill: options.fill,
    strokeWidth: options.strokeWidth,
  };

  let shape: FabricObject;
  switch (kind) {
    case "circle":
      shape = new Circle({ ...common, radius: 60 });
      break;
    case "triangle":
      shape = new Triangle({ ...common, width: 120, height: 110 });
      break;
    case "line":
      shape = new Line([center.x - 80, center.y, center.x + 80, center.y], {
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        originX: "center",
        originY: "center",
      });
      break;
    case "rectangle":
    default:
      shape = new Rect({ ...common, width: 140, height: 100 });
      break;
  }

  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.requestRenderAll();
  return shape;
}

export { SHAPE_DEFAULTS };

/** Rotate an object by a relative number of degrees around its own center. */
export function rotateBy(object: FabricObject, deltaDegrees: number) {
  const current = object.angle ?? 0;
  object.rotate((current + deltaDegrees + 360) % 360);
  object.setCoords();
}

export function setRotation(object: FabricObject, degrees: number) {
  object.rotate(((degrees % 360) + 360) % 360);
  object.setCoords();
}

/**
 * Renders the canvas at full logical resolution (ignoring the on-screen fit
 * scale) and returns a PNG/JPEG/WebP data URL. The canvas is restored to its
 * previous zoom/size afterwards so editing can continue uninterrupted.
 */
export function exportImage(
  canvas: Canvas,
  logicalWidth: number,
  logicalHeight: number,
  format: "png" | "jpeg" | "webp" = "png",
  quality = 1
): string {
  const previousZoom = canvas.getZoom();
  const previousWidth = canvas.getWidth();
  const previousHeight = canvas.getHeight();
  const previousTransform = canvas.viewportTransform ? [...canvas.viewportTransform] as typeof canvas.viewportTransform : undefined;

  canvas.setZoom(1);
  if (previousTransform) canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width: logicalWidth, height: logicalHeight });
  canvas.requestRenderAll();

  const dataUrl = canvas.toDataURL({ format, quality, multiplier: 1 });

  canvas.setDimensions({ width: previousWidth, height: previousHeight });
  canvas.setZoom(previousZoom);
  if (previousTransform) canvas.setViewportTransform(previousTransform);
  canvas.requestRenderAll();

  return dataUrl;
}

/** Builds the metadata + annotation JSON described in the assignment's "Export" requirement. */
export function buildExportJSON(
  canvas: Canvas,
  imageMeta: ImageMeta | null,
  rotationDegrees: number,
  cropApplied: boolean
): EditorExport {
  return {
    version: 1,
    image: imageMeta,
    edit: {
      rotationDegrees,
      cropApplied,
      zoomLevel: canvas.getZoom(),
      lastModified: new Date().toISOString(),
    },
    canvasObjects: canvas.toJSON() as Record<string, unknown>,
  };
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, fileName);
  URL.revokeObjectURL(url);
}
