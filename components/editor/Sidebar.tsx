"use client";

import {
  UploadCloud,
  Pencil,
  Shapes,
  Type,
  Crop,
  RotateCw,
} from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import type { ToolId } from "@/types/editor";
import { UploadPanel } from "@/components/editor/tools/UploadPanel";
import { DrawPanel } from "@/components/editor/tools/DrawPanel";
import { ShapesPanel } from "@/components/editor/tools/ShapesPanel";
import { TextPanel } from "@/components/editor/tools/TextPanel";
import { CropPanel } from "@/components/editor/tools/CropPanel";
import { RotatePanel } from "@/components/editor/tools/RotatePanel";

const TOOLS: { id: ToolId; label: string; icon: typeof UploadCloud; requiresImage: boolean }[] = [
  { id: "upload", label: "Upload", icon: UploadCloud, requiresImage: false },
  { id: "draw", label: "Draw", icon: Pencil, requiresImage: true },
  { id: "shapes", label: "Shapes", icon: Shapes, requiresImage: true },
  { id: "text", label: "Text", icon: Type, requiresImage: true },
  { id: "crop", label: "Crop", icon: Crop, requiresImage: true },
  { id: "rotate", label: "Rotate", icon: RotateCw, requiresImage: true },
];

const PANELS: Record<ToolId, React.ComponentType> = {
  upload: UploadPanel,
  draw: DrawPanel,
  shapes: ShapesPanel,
  text: TextPanel,
  crop: CropPanel,
  rotate: RotatePanel,
  zoom: UploadPanel,
};

export function Sidebar() {
  const { activeTool, setActiveTool, hasImage } = useEditor();
  const ActivePanel = PANELS[activeTool];

  return (
    <aside className="flex h-full w-72 shrink-0 border-r border-border-subtle bg-panel">
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border-subtle py-4">
        {TOOLS.map(({ id, label, icon: Icon, requiresImage }) => {
          const disabled = requiresImage && !hasImage;
          const isActive = activeTool === id;
          return (
            <button
              key={id}
              disabled={disabled}
              onClick={() => setActiveTool(id)}
              title={label}
              className={`flex w-12 flex-col items-center gap-1 rounded-md py-2.5 text-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 ${
                isActive
                  ? "bg-accent-dim text-accent-strong"
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto p-4">
        <ActivePanel />
      </div>
    </aside>
  );
}
