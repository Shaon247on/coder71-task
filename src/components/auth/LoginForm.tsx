// hooks/useResizeSnap.ts
// Purpose: Handles all mouse/touch drag logic for the resize handle.
// Calculates ratio from pixel positions, applies snap-to-grid, and emits updates.

"use client";

import { useRef, useState, useCallback } from "react";
import { applySnap } from "@/lib/layoutUtils";
import { SplitDirection } from "@/types/layout";

interface UseResizeSnapOptions {
  direction: SplitDirection;
  onRatioChange: (ratio: number) => void;
}

interface UseResizeSnapReturn {
  isDragging: boolean;
  currentRatio: number | null;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useResizeSnap({
  direction,
  onRatioChange,
}: UseResizeSnapOptions): UseResizeSnapReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [currentRatio, setCurrentRatio] = useState<number | null>(null);

  // We store the container ref so we can calculate ratio relative to it
  const containerRef = useRef<Element | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();

      // Walk up to find the split container element (parent of the handle)
      const handle = e.currentTarget;
      const container = handle.parentElement;
      if (!container) return;

      containerRef.current = container;
      setIsDragging(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const rect = containerRef.current!.getBoundingClientRect();
        let rawRatio: number;

        if (direction === "horizontal") {
          // Horizontal split: ratio is X position within container
          rawRatio = (moveEvent.clientX - rect.left) / rect.width;
        } else {
          // Vertical split: ratio is Y position within container
          rawRatio = (moveEvent.clientY - rect.top) / rect.height;
        }

        // Clamp to prevent zero-size panels
        const clamped = Math.min(0.95, Math.max(0.05, rawRatio));
        // Apply snap assistance
        const snapped = applySnap(clamped);

        setCurrentRatio(snapped);
        onRatioChange(snapped);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        setCurrentRatio(null);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [direction, onRatioChange]
  );

  return { isDragging, currentRatio, handleMouseDown };
}