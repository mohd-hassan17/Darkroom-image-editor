"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Canvas } from "fabric";

const MAX_HISTORY = 30;
const DEBOUNCE_MS = 400;

/**
 * Undo/redo implemented as a stack of full canvas-state snapshots.
 *
 * This is the simplest correct approach for a small editor like this one:
 * Fabric's own toJSON()/loadFromJSON() already know how to serialize every
 * object type we use (paths, shapes, text, images), so we don't need a
 * custom command/diff system — we just snapshot after each meaningful
 * change and restore wholesale on undo/redo.
 */
export function useHistory(canvas: Canvas | null) {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isApplyingHistory = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const snapshot = useCallback(() => {
    if (!canvas) return "";
    return JSON.stringify(canvas.toJSON());
  }, [canvas]);

  /** Throw away history and start fresh from the canvas's current state. */
  const reset = useCallback(() => {
    if (!canvas) return;
    undoStack.current = [snapshot()];
    redoStack.current = [];
    syncFlags();
  }, [canvas, snapshot, syncFlags]);

  const recordSnapshot = useCallback(() => {
    if (!canvas || isApplyingHistory.current) return;
    const state = snapshot();
    if (undoStack.current[undoStack.current.length - 1] === state) return;
    undoStack.current.push(state);
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
    redoStack.current = [];
    syncFlags();
  }, [canvas, snapshot, syncFlags]);

  const scheduleSnapshot = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(recordSnapshot, DEBOUNCE_MS);
  }, [recordSnapshot]);

  useEffect(() => {
    if (!canvas) return;
    canvas.on("object:added", scheduleSnapshot);
    canvas.on("object:modified", scheduleSnapshot);
    canvas.on("object:removed", scheduleSnapshot);
    canvas.on("path:created", scheduleSnapshot);
    return () => {
      canvas.off("object:added", scheduleSnapshot);
      canvas.off("object:modified", scheduleSnapshot);
      canvas.off("object:removed", scheduleSnapshot);
      canvas.off("path:created", scheduleSnapshot);
    };
  }, [canvas, scheduleSnapshot]);

  const applyState = useCallback(
    async (state: string) => {
      if (!canvas) return;
      isApplyingHistory.current = true;
      await canvas.loadFromJSON(JSON.parse(state));
      canvas.requestRenderAll();
      // loadFromJSON fires its own object:added events; give them a tick to
      // settle before we start listening for "real" user changes again.
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 50);
    },
    [canvas]
  );

  const undo = useCallback(async () => {
    if (!canvas || undoStack.current.length <= 1) return;
    const current = undoStack.current.pop() as string;
    redoStack.current.push(current);
    const previous = undoStack.current[undoStack.current.length - 1];
    await applyState(previous);
    syncFlags();
  }, [canvas, applyState, syncFlags]);

  const redo = useCallback(async () => {
    if (!canvas || redoStack.current.length === 0) return;
    const next = redoStack.current.pop() as string;
    undoStack.current.push(next);
    await applyState(next);
    syncFlags();
  }, [canvas, applyState, syncFlags]);

  return { undo, redo, canUndo, canRedo, recordSnapshot, reset };
}
