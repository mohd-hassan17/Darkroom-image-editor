"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useHistory } from "@/hooks/useHistory";
import type { ImageMeta, ToolId } from "@/types/editor";

interface EditorContextValue extends ReturnType<typeof useFabricCanvas> {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;

  imageMeta: ImageMeta | null;
  setImageMeta: (meta: ImageMeta | null) => void;
  hasImage: boolean;

  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  recordSnapshot: () => void;
  resetHistory: () => void;

  cropApplied: boolean;
  markCropApplied: () => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const fabricCanvas = useFabricCanvas();
  const history = useHistory(fabricCanvas.canvas);

  const [activeTool, setActiveTool] = useState<ToolId>("upload");
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [cropApplied, setCropApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const value: EditorContextValue = {
    ...fabricCanvas,
    activeTool,
    setActiveTool,
    imageMeta,
    setImageMeta,
    hasImage: imageMeta !== null,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    recordSnapshot: history.recordSnapshot,
    resetHistory: history.reset,
    cropApplied,
    markCropApplied: () => setCropApplied(true),
    isLoading,
    setIsLoading,
    errorMessage,
    setErrorMessage,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
}
