"use client";

import { useRef, useState } from "react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  FileJson,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { buildExportJSON, downloadDataUrl, downloadJSON, exportImage, getBaseImage } from "@/lib/fabric-helpers";
import { Button } from "@/components/ui/Button";

const IMAGE_FORMATS = [
  { format: "png" as const, label: "PNG" },
  { format: "jpeg" as const, label: "JPEG" },
  { format: "webp" as const, label: "WebP" },
];

export function Topbar() {
  const {
    canvas,
    canvasSize,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    hasImage,
    imageMeta,
    cropApplied,
  } = useEditor();
  const [exportOpen, setExportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseName = (imageMeta?.fileName ?? "edited-image").replace(/\.[^.]+$/, "");

  const handleImageExport = (format: "png" | "jpeg" | "webp") => {
    if (!canvas) return;
    const dataUrl = exportImage(canvas, canvasSize.width, canvasSize.height, format, 0.92);
    downloadDataUrl(dataUrl, `${baseName}.${format === "jpeg" ? "jpg" : format}`);
    setExportOpen(false);
  };

  const handleJSONExport = () => {
    if (!canvas) return;
    const rotation = getBaseImage(canvas)?.angle ?? 0;
    const json = buildExportJSON(canvas, imageMeta, Math.round(rotation), cropApplied);
    downloadJSON(json, `${baseName}.json`);
    setExportOpen(false);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-panel px-5">
      <div className="flex items-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-display text-sm font-medium tracking-wide">Darkroom</span>
        <span className="ml-1 text-xs text-text-tertiary">image editor</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-md border border-border-subtle p-0.5">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 rounded-md border border-border-subtle p-0.5">
          <Button variant="ghost" size="sm" onClick={zoomOut} disabled={!hasImage} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={resetZoom}
            disabled={!hasImage}
            title="Reset zoom"
            className="w-12 cursor-pointer font-mono text-xs text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button variant="ghost" size="sm" onClick={zoomIn} disabled={!hasImage} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative" ref={menuRef}>
          <Button
            variant="primary"
            size="sm"
            disabled={!hasImage}
            onClick={() => setExportOpen((o) => !o)}
          >
            <Download className="h-4 w-4" />
            Export
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>

          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-md border border-border-subtle bg-raised py-1.5 shadow-xl">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">
                  Image · {canvasSize.width}×{canvasSize.height}
                </p>
                {IMAGE_FORMATS.map(({ format, label }) => (
                  <button
                    key={format}
                    onClick={() => handleImageExport(format)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-primary hover:bg-hover cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-text-tertiary" />
                    {label}
                  </button>
                ))}
                <div className="my-1 border-t border-border-subtle" />
                <button
                  onClick={handleJSONExport}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-primary hover:bg-hover cursor-pointer"
                >
                  <FileJson className="h-3.5 w-3.5 text-text-tertiary" />
                  Annotation data (JSON)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
