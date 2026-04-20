// src/hooks/useResizeSnap.ts

"use client";

import { RefObject, useCallback, useState } from "react";
import { applySnap, clampRatio } from "@/lib/layoutUtils";
import { SplitDirection } from "@/types/layout";

interface UseResizeSnapOptions {
  direction: SplitDirection;
  containerRef: RefObject<HTMLDivElement | null>;
  onRatioChange: (ratio: number) => void;
}

interface UseResizeSnapReturn {
  isDragging: boolean;
  currentRatio: number | null;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useResizeSnap({
  direction,
  containerRef,
  onRatioChange,
}: UseResizeSnapOptions): UseResizeSnapReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [currentRatio, setCurrentRatio] = useState<number | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();

        let rawRatio: number;

        if (direction === "horizontal") {
          rawRatio = (moveEvent.clientX - rect.left) / rect.width;
        } else {
          rawRatio = (moveEvent.clientY - rect.top) / rect.height;
        }

        const clampedRatio = clampRatio(rawRatio);
        const snappedRatio = applySnap(clampedRatio);

        setCurrentRatio(snappedRatio);
        onRatioChange(snappedRatio);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        setCurrentRatio(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      setIsDragging(true);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [containerRef, direction, onRatioChange]
  );

  return {
    isDragging,
    currentRatio,
    handleMouseDown,
  };
}