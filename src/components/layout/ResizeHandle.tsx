// src/components/layout/ResizeHandle.tsx

"use client";

import { SplitDirection } from "@/types/layout";
import { cn } from "@/lib/utils";

interface ResizeHandleProps {
  direction: SplitDirection;
  ratio: number;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ResizeHandle({
  direction,
  ratio,
  onMouseDown,
}: ResizeHandleProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        "absolute z-20 bg-white/90 shadow-sm transition hover:bg-white",
        isHorizontal
          ? "top-0 bottom-0 w-2 -translate-x-1/2 cursor-col-resize"
          : "left-0 right-0 h-2 -translate-y-1/2 cursor-row-resize"
      )}
      style={
        isHorizontal
          ? { left: `${ratio * 100}%` }
          : { top: `${ratio * 100}%` }
      }
    />
  );
}