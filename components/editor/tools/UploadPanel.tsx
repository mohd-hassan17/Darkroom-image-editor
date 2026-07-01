"use client";

import { useRef } from "react";
import { UploadCloud, FileImage } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/Button";
import { PanelSection } from "@/components/ui/Field";

export function UploadPanel() {
  const { imageMeta, hasImage, canvasSize } = useEditor();
  const { uploadFile } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <PanelSection title="Image">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="h-4 w-4" />
          {hasImage ? "Replace image" : "Upload image"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-text-tertiary">
          Replacing keeps your existing annotations in place.
        </p>
      </PanelSection>

      {imageMeta && (
        <PanelSection title="File details">
          <div className="space-y-2 rounded-md border border-border-subtle bg-panel p-3 font-mono text-xs text-text-secondary">
            <DetailRow icon={<FileImage className="h-3.5 w-3.5" />} label={imageMeta.fileName} />
            <DetailRow label={`${imageMeta.originalWidth} × ${imageMeta.originalHeight} px original`} />
            <DetailRow label={`${canvasSize.width} × ${canvasSize.height} px canvas`} />
            <DetailRow label={imageMeta.mimeType} />
          </div>
        </PanelSection>
      )}
    </div>
  );
}

function DetailRow({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 truncate">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}
