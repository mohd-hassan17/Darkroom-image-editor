"use client";

import { useCallback } from "react";
import { useEditor } from "@/context/EditorContext";
import { clampDimensions, placeBaseImage, readImageFile } from "@/lib/fabric-helpers";

export function useImageUpload() {
  const {
    canvas,
    hasImage,
    canvasSize,
    setLogicalSize,
    setImageMeta,
    setIsLoading,
    setErrorMessage,
    resetHistory,
    fitToContainer,
    setActiveTool,
  } = useEditor();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!canvas) return;
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please choose an image file (PNG, JPG, or WebP).");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { url, width, height } = await readImageFile(file);
        const target = hasImage ? canvasSize : clampDimensions(width, height);

        if (!hasImage) setLogicalSize(target.width, target.height);

        await placeBaseImage(canvas, url, target.width, target.height);

        setImageMeta({
          fileName: file.name,
          originalWidth: width,
          originalHeight: height,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        });

        resetHistory();
        fitToContainer();
        setActiveTool("draw");
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Could not load that image.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      canvas,
      hasImage,
      canvasSize,
      setLogicalSize,
      setImageMeta,
      setIsLoading,
      setErrorMessage,
      resetHistory,
      fitToContainer,
      setActiveTool,
    ]
  );

  return { uploadFile };
}
