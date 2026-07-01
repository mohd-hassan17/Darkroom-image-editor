"use client";

import { useState } from "react";
import { Square, Circle as CircleIcon, Triangle as TriangleIcon, Minus, Trash2 } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { addShape } from "@/lib/fabric-helpers";
import { Button } from "@/components/ui/Button";
import { PanelSection, SliderRow } from "@/components/ui/Field";
import type { ShapeKind } from "@/types/editor";

const SHAPES: { kind: ShapeKind; label: string; icon: typeof Square }[] = [
  { kind: "rectangle", label: "Rectangle", icon: Square },
  { kind: "circle", label: "Circle", icon: CircleIcon },
  { kind: "triangle", label: "Triangle", icon: TriangleIcon },
  { kind: "line", label: "Line", icon: Minus },
];

export function ShapesPanel() {
  const { canvas } = useEditor();
  const [stroke, setStroke] = useState("#e8923a");
  const [fill, setFill] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [filled, setFilled] = useState(false);

  const handleAdd = (kind: ShapeKind) => {
    if (!canvas) return;
    addShape(canvas, kind, { stroke, fill: filled ? fill : "transparent", strokeWidth });
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  return (
    <div className="space-y-6">
      <PanelSection title="Add shape">
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map(({ kind, label, icon: Icon }) => (
            <Button key={kind} onClick={() => handleAdd(kind)} className="justify-start">
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Style">
        <SliderRow
          label="Stroke width"
          value={strokeWidth}
          min={1}
          max={20}
          unit="px"
          onChange={setStrokeWidth}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Stroke color</span>
          <input
            type="color"
            value={stroke}
            onChange={(e) => setStroke(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border border-border-strong bg-transparent p-0"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={filled}
              onChange={(e) => setFilled(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Fill shape
          </label>
          {filled && (
            <input
              type="color"
              value={fill === "transparent" ? "#e8923a" : fill}
              onChange={(e) => setFill(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded-full border border-border-strong bg-transparent p-0"
            />
          )}
        </div>
      </PanelSection>

      <PanelSection title="Selection">
        <Button variant="danger" className="w-full" onClick={deleteSelected}>
          <Trash2 className="h-4 w-4" />
          Delete selected
        </Button>
      </PanelSection>
    </div>
  );
}
