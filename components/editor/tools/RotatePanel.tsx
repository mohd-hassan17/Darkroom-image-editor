"use client";

import { useEffect, useState } from "react";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { getActiveImage, rotateBy, setRotation } from "@/lib/fabric-helpers";
import { Button } from "@/components/ui/Button";
import { PanelSection, SliderRow } from "@/components/ui/Field";

export function RotatePanel() {
  const { canvas, activeTool } = useEditor();
  const [angle, setAngle] = useState(0);

  // Keep the slider in sync with whichever image is targeted.
  useEffect(() => {
    if (!canvas) return;
    const sync = () => {
      const image = getActiveImage(canvas);
      setAngle(Math.round(image?.angle ?? 0));
    };
    sync();
    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("object:modified", sync);
    return () => {
      canvas.off("selection:created", sync);
      canvas.off("selection:updated", sync);
      canvas.off("object:modified", sync);
    };
  }, [canvas, activeTool]);

  const withImage = (fn: (image: NonNullable<ReturnType<typeof getActiveImage>>) => void) => {
    if (!canvas) return;
    const image = getActiveImage(canvas);
    if (!image) return;
    fn(image);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: image });
    setAngle(Math.round(image.angle ?? 0));
  };

  if (!canvas || !getActiveImage(canvas)) {
    return <p className="text-xs text-text-tertiary">Upload an image first to rotate it.</p>;
  }

  return (
    <div className="space-y-6">
      <PanelSection title="Quick rotate">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => withImage((img) => rotateBy(img, -90))}>
            <RotateCcw className="h-4 w-4" />
            -90°
          </Button>
          <Button onClick={() => withImage((img) => rotateBy(img, 90))}>
            <RotateCw className="h-4 w-4" />
            +90°
          </Button>
          <Button onClick={() => withImage((img) => img.set({ flipX: !img.flipX }))}>
            <FlipHorizontal className="h-4 w-4" />
            Flip H
          </Button>
          <Button onClick={() => withImage((img) => img.set({ flipY: !img.flipY }))}>
            <FlipVertical className="h-4 w-4" />
            Flip V
          </Button>
        </div>
      </PanelSection>

      <PanelSection title="Free rotation">
        <SliderRow
          label="Angle"
          value={angle}
          min={-180}
          max={180}
          unit="°"
          onChange={(v) => {
            setAngle(v);
            withImage((img) => setRotation(img, v));
          }}
        />
        {angle !== 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => withImage((img) => setRotation(img, 0))}
          >
            Reset to 0°
          </Button>
        )}
      </PanelSection>
    </div>
  );
}
