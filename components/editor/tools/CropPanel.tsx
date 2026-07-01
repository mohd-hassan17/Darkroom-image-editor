"use client";

import { useEffect, useRef, useState } from "react";
import { FabricImage, Rect } from "fabric";
import {
  Check,
  X,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Maximize,
} from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { getActiveImage } from "@/lib/fabric-helpers";
import { Button } from "@/components/ui/Button";
import { PanelSection } from "@/components/ui/Field";

const ASPECT_RATIOS = [
  { label: "Free", value: null, icon: Maximize },
  { label: "Square", value: 1, icon: Square },
  { label: "Wide 16:9", value: 16 / 9, icon: RectangleHorizontal },
  { label: "Portrait 4:5", value: 4 / 5, icon: RectangleVertical },
  { label: "Story 9:16", value: 9 / 16, icon: Smartphone },
] as const;

interface OriginalProps {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  selectable: boolean;
  evented: boolean;
}

/**
 * "Crop mode" is derived directly from activeTool — there's no separate
 * isCropMode state to fall out of sync. While activeTool === "crop", the
 * effect below owns setting up/tearing down the crop overlay rectangle as
 * an external-system side effect (the canvas), not as React state.
 */
export function CropPanel() {
  const { canvas, activeTool, setActiveTool, markCropApplied } = useEditor();
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const targetImage = useRef<FabricImage | null>(null);
  const cropRect = useRef<Rect | null>(null);
  const originalProps = useRef<OriginalProps | null>(null);
  const isCropMode = activeTool === "crop";

  const removeAllCropRectangles = (c: NonNullable<typeof canvas>) => {
    c.getObjects()
      .filter((obj) => obj.get("isCropRectangle"))
      .forEach((obj) => c.remove(obj));
    c.requestRenderAll();
  };

  const teardown = (c: NonNullable<typeof canvas>) => {
    removeAllCropRectangles(c);
    cropRect.current = null;
    if (targetImage.current && originalProps.current) {
      targetImage.current.set({ ...originalProps.current });
      c.setActiveObject(targetImage.current);
    }
    targetImage.current = null;
    originalProps.current = null;
    setSelectedRatio(null);
    c.requestRenderAll();
  };

  const createCropRectangle = (c: NonNullable<typeof canvas>, image: FabricImage) => {
    const bounds = image.getBoundingRect();
    const rect = new Rect({
      left: bounds.left + bounds.width * 0.1,
      top: bounds.top + bounds.height * 0.1,
      width: bounds.width * 0.8,
      height: bounds.height * 0.8,
      fill: "transparent",
      stroke: "#e8923a",
      strokeWidth: 2,
      strokeDashArray: [6, 4],
      cornerColor: "#e8923a",
      cornerSize: 11,
      transparentCorners: false,
      cornerStyle: "circle",
      borderColor: "#e8923a",
    });
    rect.set("isCropRectangle", true);
    c.add(rect);
    c.setActiveObject(rect);
    cropRect.current = rect;
  };

  // Set up / tear down the crop overlay whenever the crop tool becomes
  // active or inactive. This talks to the canvas (an external system),
  // which is exactly what effects are for.
  useEffect(() => {
    if (!canvas) return;

    if (isCropMode) {
      const image = getActiveImage(canvas);
      if (!image) return;
      removeAllCropRectangles(canvas);
      originalProps.current = {
        left: image.left ?? 0,
        top: image.top ?? 0,
        scaleX: image.scaleX ?? 1,
        scaleY: image.scaleY ?? 1,
        angle: image.angle ?? 0,
        selectable: image.selectable ?? true,
        evented: image.evented ?? true,
      };
      targetImage.current = image;
      image.set({ selectable: false, evented: false });
      createCropRectangle(canvas, image);
      canvas.requestRenderAll();

      return () => teardown(canvas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, isCropMode]);

  const applyAspectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (!cropRect.current || ratio === null) return;
    const rect = cropRect.current;
    const currentWidth = rect.width! * rect.scaleX!;
    const newHeight = currentWidth / ratio;
    rect.set({ height: newHeight / rect.scaleY! });
    canvas?.requestRenderAll();
  };

  const applyCrop = () => {
    if (!canvas || !targetImage.current || !cropRect.current) return;
    const image = targetImage.current;
    const rect = cropRect.current;

    try {
      const cropBounds = rect.getBoundingRect();
      const imageBounds = image.getBoundingRect();

      const cropX = Math.max(0, cropBounds.left - imageBounds.left);
      const cropY = Math.max(0, cropBounds.top - imageBounds.top);
      const cropWidth = Math.min(cropBounds.width, imageBounds.width - cropX);
      const cropHeight = Math.min(cropBounds.height, imageBounds.height - cropY);

      const scaleX = image.scaleX ?? 1;
      const scaleY = image.scaleY ?? 1;

      const cropped = new FabricImage(image.getElement() as HTMLImageElement, {
        left: cropBounds.left + cropBounds.width / 2,
        top: cropBounds.top + cropBounds.height / 2,
        originX: "center",
        originY: "center",
        cropX: cropX / scaleX,
        cropY: cropY / scaleY,
        width: cropWidth / scaleX,
        height: cropHeight / scaleY,
        scaleX,
        scaleY,
      });
      cropped.set("isBaseImage", image.get("isBaseImage") === true);

      canvas.remove(image);
      canvas.add(cropped);
      canvas.setActiveObject(cropped);

      // Clear refs before leaving crop mode so the cleanup effect doesn't
      // try to restore the (now-removed) original image.
      targetImage.current = null;
      cropRect.current = null;
      originalProps.current = null;
      removeAllCropRectangles(canvas);
      canvas.requestRenderAll();

      markCropApplied();
      setActiveTool("rotate");
    } catch {
      setActiveTool("rotate");
    }
  };

  if (!canvas) return null;

  const activeImage = getActiveImage(canvas);
  if (!activeImage) {
    return <p className="text-xs text-text-tertiary">Upload an image first to crop it.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-accent/30 bg-accent-dim/30 p-3">
        <p className="text-xs font-medium text-accent-strong">Crop mode active</p>
        <p className="mt-1 text-xs text-text-secondary">
          Drag the handles to set the crop area.
        </p>
      </div>

      <PanelSection title="Aspect ratio">
        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIOS.map(({ label, value, icon: Icon }) => (
            <button
              key={label}
              onClick={() => applyAspectRatio(value)}
              className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 text-center transition-colors cursor-pointer ${
                selectedRatio === value
                  ? "border-accent bg-accent-dim/30"
                  : "border-border-subtle hover:border-border-strong"
              }`}
            >
              <Icon className="h-4 w-4 text-text-secondary" />
              <span className="text-[10px] text-text-secondary">{label}</span>
            </button>
          ))}
        </div>
      </PanelSection>

      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" onClick={applyCrop}>
          <Check className="h-4 w-4" />
          Apply
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setActiveTool("rotate")}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
