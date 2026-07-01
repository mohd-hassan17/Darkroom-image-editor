"use client";

import { useEffect, useState } from "react";
import { IText } from "fabric";
import {
  Type,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { Button } from "@/components/ui/Button";
import { PanelSection, SliderRow } from "@/components/ui/Field";

const FONT_FAMILIES = ["Arial", "Georgia", "Courier New", "Verdana", "Impact"];
const DEFAULT_SIZE = 28;

export function TextPanel() {
  const { canvas } = useEditor();
  const [selected, setSelected] = useState<IText | null>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);
  const [color, setColor] = useState("#f3ece2");
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const syncFromSelection = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === "i-text") {
        const text = active as IText;
        setSelected(text);
        setFontFamily(text.fontFamily ?? "Arial");
        setFontSize(text.fontSize ?? DEFAULT_SIZE);
        setColor((text.fill as string) ?? "#f3ece2");
        setAlign((text.textAlign as "left" | "center" | "right") ?? "left");
      } else {
        setSelected(null);
      }
    };

    canvas.on("selection:created", syncFromSelection);
    canvas.on("selection:updated", syncFromSelection);
    canvas.on("selection:cleared", () => setSelected(null));
    syncFromSelection();

    return () => {
      canvas.off("selection:created", syncFromSelection);
      canvas.off("selection:updated", syncFromSelection);
    };
  }, [canvas]);

  const addText = () => {
    if (!canvas) return;
    const center = canvas.getCenterPoint();
    const text = new IText("Edit this text", {
      left: center.x,
      top: center.y,
      originX: "center",
      originY: "center",
      fontFamily,
      fontSize: DEFAULT_SIZE,
      fill: color,
      textAlign: align,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    setTimeout(() => {
      text.enterEditing();
      text.selectAll();
    }, 50);
  };

  const update = (props: Partial<IText>) => {
    if (!selected || !canvas) return;
    selected.set(props);
    canvas.requestRenderAll();
    forceRerender((n) => n + 1);
  };

  const deleteSelected = () => {
    if (!selected || !canvas) return;
    canvas.remove(selected);
    canvas.requestRenderAll();
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <PanelSection title="Add text">
        <Button variant="primary" className="w-full" onClick={addText}>
          <Type className="h-4 w-4" />
          Add text box
        </Button>
        <p className="text-xs text-text-tertiary">
          Double-click any text on the canvas to edit its content directly.
        </p>
      </PanelSection>

      {selected && (
        <PanelSection title="Edit selected text">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs text-text-secondary">Font family</span>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  update({ fontFamily: e.target.value });
                }}
                className="w-full rounded-md border border-border-subtle bg-panel px-2.5 py-1.5 text-sm text-text-primary"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <SliderRow
              label="Font size"
              value={fontSize}
              min={8}
              max={120}
              unit="px"
              onChange={(v) => {
                setFontSize(v);
                update({ fontSize: v });
              }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Color</span>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  update({ fill: e.target.value });
                }}
                className="h-7 w-7 cursor-pointer rounded-full border border-border-strong bg-transparent p-0"
              />
            </div>

            <div className="flex gap-1.5">
              {([
                ["left", AlignLeft],
                ["center", AlignCenter],
                ["right", AlignRight],
              ] as const).map(([value, Icon]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={align === value ? "primary" : "outline"}
                  onClick={() => {
                    setAlign(value);
                    update({ textAlign: value });
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              ))}
              <Button
                size="sm"
                variant={selected.fontWeight === "bold" ? "primary" : "outline"}
                onClick={() =>
                  update({ fontWeight: selected.fontWeight === "bold" ? "normal" : "bold" })
                }
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={selected.fontStyle === "italic" ? "primary" : "outline"}
                onClick={() =>
                  update({ fontStyle: selected.fontStyle === "italic" ? "normal" : "italic" })
                }
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={selected.underline ? "primary" : "outline"}
                onClick={() => update({ underline: !selected.underline })}
              >
                <Underline className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="danger" className="w-full" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4" />
              Delete text
            </Button>
          </div>
        </PanelSection>
      )}
    </div>
  );
}
