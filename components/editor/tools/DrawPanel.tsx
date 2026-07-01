"use client";

import { useEffect, useRef, useState } from "react";
import { PencilBrush } from "fabric";
import { useEditor } from "@/context/EditorContext";
import { PanelSection, SliderRow } from "@/components/ui/Field";

const COLORS = ["#f3ece2", "#e8923a", "#d9624a", "#5b8a72", "#4a7fb5", "#0e0c0a"];

export function DrawPanel() {
  const { canvas, activeTool } = useEditor();
  const [color, setColor] = useState("#e8923a");
  const [width, setWidth] = useState(4);
  const brushRef = useRef<PencilBrush | null>(null);

  useEffect(() => {
    if (!canvas) return;
    const isActive = activeTool === "draw";
    canvas.isDrawingMode = isActive;
    if (isActive) {
      if (!brushRef.current) {
        brushRef.current = new PencilBrush(canvas);
      }
      brushRef.current.color = color;
      brushRef.current.width = width;
      canvas.freeDrawingBrush = brushRef.current;
    }
    return () => {
      canvas.isDrawingMode = false;  
    };
  }, [canvas, activeTool, color, width]);

  return (
    <div className="space-y-6">
      <PanelSection title="Pencil">
        <p className="text-xs text-text-tertiary">
          Draw freehand directly on the canvas. Switch tools to stop drawing.
        </p>
        <SliderRow label="Brush size" value={width} min={1} max={40} unit="px" onChange={setWidth} />
      </PanelSection>

      <PanelSection title="Color">
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer ${
                color === c ? "border-accent scale-110" : "border-border-strong"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Use color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border border-border-strong bg-transparent p-0"
            aria-label="Custom color"
          />
        </div>
      </PanelSection>
    </div>
  );
}
