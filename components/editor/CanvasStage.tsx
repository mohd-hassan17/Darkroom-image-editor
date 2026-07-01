"use client";

import { useCallback, useEffect, useState } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { useImageUpload } from "@/hooks/useImageUpload";

export function CanvasStage() {
  const {
    elRef,
    containerRef,
    canvas,
    activeTool,
    hasImage,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useEditor();
  const { uploadFile } = useImageUpload();
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    if (!canvas) return;
    if (activeTool === "crop") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else if (activeTool === "draw") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    }
  }, [canvas, activeTool]);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 4500);
    return () => clearTimeout(t);
  }, [errorMessage, setErrorMessage]);

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={onDrop}
      className="checker-bg relative flex flex-1 items-center justify-center overflow-hidden bg-base"
    >
      <div className="rounded-sm shadow-2xl shadow-black/40">
        <canvas ref={elRef} />
      </div>

      {!hasImage && !isLoading && (
        <UploadEmptyState isDraggingFile={isDraggingFile} />
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base/80 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <p className="text-sm text-text-secondary">Loading image…</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-danger/30 bg-panel px-3.5 py-2.5 text-sm text-danger shadow-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}

function UploadEmptyState({ isDraggingFile }: { isDraggingFile: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`flex flex-col items-center gap-3 rounded-lg border border-dashed px-10 py-12 text-center transition-colors ${
          isDraggingFile ? "border-accent bg-accent-dim/30" : "border-border-strong"
        }`}
      >
        <UploadCloud className="h-7 w-7 text-text-tertiary" />
        <div>
          <p className="text-sm text-text-tertiary">Drop an image here</p>
          <p className="mt-1 text-xs text-text-tertiary">
            or use Upload in the sidebar — PNG, JPG, WebP
          </p>
        </div>
      </div>
    </div>
  );
}
