"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;
const CONTAINER_PADDING = 64;
const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

export function useFabricCanvas() {
  const elRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [zoom, setZoom] = useState(1);

  // Create the canvas exactly once.
  useEffect(() => {
    if (!elRef.current) return;
    const fc = new Canvas(elRef.current, {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      backgroundColor: "#e8e0d5",
      preserveObjectStacking: true,
      selection: true,
      controlsAboveOverlay: true,
    });
    setCanvas(fc);
    return () => {
      fc.dispose();
    };
  }, []);

  const applyZoom = useCallback(
    (nextZoom: number) => {
      if (!canvas) return;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
      canvas.setDimensions(
        { width: canvasSize.width * clamped, height: canvasSize.height * clamped },
        { backstoreOnly: false }
      );
      canvas.setZoom(clamped);
      canvas.calcOffset();
      canvas.requestRenderAll();
      setZoom(clamped);
    },
    [canvas, canvasSize]
  );

  const fitToContainer = useCallback(() => {
    if (!canvas || !containerRef.current) return;
    const cw = Math.max(containerRef.current.clientWidth - CONTAINER_PADDING, 100);
    const ch = Math.max(containerRef.current.clientHeight - CONTAINER_PADDING, 100);
    const scale = Math.min(cw / canvasSize.width, ch / canvasSize.height, 1);
    applyZoom(scale);
  }, [canvas, canvasSize, applyZoom]);

  const setLogicalSize = useCallback((width: number, height: number) => {
    setCanvasSize({ width, height });
  }, []);

  useEffect(() => {
    fitToContainer();
  }, [canvasSize, canvas]);

  useEffect(() => {
    window.addEventListener("resize", fitToContainer);
    return () => window.removeEventListener("resize", fitToContainer);
  }, [fitToContainer]);

  const zoomIn = useCallback(
    () => applyZoom((canvas?.getZoom() ?? 1) + ZOOM_STEP),
    [canvas, applyZoom]
  );
  const zoomOut = useCallback(
    () => applyZoom((canvas?.getZoom() ?? 1) - ZOOM_STEP),
    [canvas, applyZoom]
  );

  return {
    elRef,
    containerRef,
    canvas,
    canvasSize,
    setLogicalSize,
    fitToContainer,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom: fitToContainer,
  };
}
