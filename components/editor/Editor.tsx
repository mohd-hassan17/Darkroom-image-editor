"use client";

import { EditorProvider } from "@/context/EditorContext";
import { Topbar } from "@/components/editor/Topbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { CanvasStage } from "@/components/editor/CanvasStage";

export function Editor() {
  return (
    <EditorProvider>
      <div className="flex h-dvh flex-col bg-base">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <CanvasStage />
        </div>
      </div>
    </EditorProvider>
  );
}
