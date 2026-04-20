// src/components/layout/LayoutBlock.tsx

"use client";

import { useRef } from "react";
import { LayoutNode, LayoutSplitNode, isLeaf } from "@/types/layout";
import { BlockToolbar } from "@/components/layout/BlockToolbar";
import { ResizeHandle } from "@/components/layout/ResizeHandle";
import { PercentageBadge } from "@/components/layout/PercentageBadge";
import { useResizeSnap } from "@/hooks/useResizeSnap";

interface LayoutBlockProps {
  node: LayoutNode;
  isRoot?: boolean;
  onSplit: (nodeId: string, direction: "horizontal" | "vertical") => void;
  onDelete: (nodeId: string) => void;
  onUpdateRatio: (nodeId: string, ratio: number) => void;
}

export function LayoutBlock({
  node,
  isRoot = false,
  onSplit,
  onDelete,
  onUpdateRatio,
}: LayoutBlockProps) {
  if (isLeaf(node)) {
    return (
      <LayoutLeafBlock
        node={node}
        isRoot={isRoot}
        onSplit={onSplit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <LayoutSplitBlock
      node={node}
      onSplit={onSplit}
      onDelete={onDelete}
      onUpdateRatio={onUpdateRatio}
    />
  );
}

interface LayoutLeafBlockProps {
  node: Extract<LayoutNode, { color: string; id: string }>;
  isRoot: boolean;
  onSplit: (nodeId: string, direction: "horizontal" | "vertical") => void;
  onDelete: (nodeId: string) => void;
}

function LayoutLeafBlock({
  node,
  isRoot,
  onSplit,
  onDelete,
}: LayoutLeafBlockProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-white/30"
      style={{ backgroundColor: node.color }}
    >
      <BlockToolbar
        canDelete={!isRoot}
        onSplit={(direction) => onSplit(node.id, direction)}
        onDelete={() => onDelete(node.id)}
      />
    </div>
  );
}

interface LayoutSplitBlockProps {
  node: LayoutSplitNode;
  onSplit: (nodeId: string, direction: "horizontal" | "vertical") => void;
  onDelete: (nodeId: string) => void;
  onUpdateRatio: (nodeId: string, ratio: number) => void;
}

function LayoutSplitBlock({
  node,
  onSplit,
  onDelete,
  onUpdateRatio,
}: LayoutSplitBlockProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { isDragging, currentRatio, handleMouseDown } = useResizeSnap({
    direction: node.direction,
    containerRef,
    onRatioChange: (ratio) => onUpdateRatio(node.id, ratio),
  });

  const activeRatio = currentRatio ?? node.splitRatio;
  const firstSize = `${activeRatio * 100}%`;
  const secondSize = `${(1 - activeRatio) * 100}%`;
  const isHorizontal = node.direction === "horizontal";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-md"
    >
      <div className={`flex h-full w-full ${isHorizontal ? "flex-row" : "flex-col"}`}>
        <div
          className="relative min-h-0 min-w-0"
          style={isHorizontal ? { width: firstSize } : { height: firstSize }}
        >
          <LayoutBlock
            node={node.children[0]}
            onSplit={onSplit}
            onDelete={onDelete}
            onUpdateRatio={onUpdateRatio}
          />
        </div>

        <div
          className="relative min-h-0 min-w-0"
          style={isHorizontal ? { width: secondSize } : { height: secondSize }}
        >
          <LayoutBlock
            node={node.children[1]}
            onSplit={onSplit}
            onDelete={onDelete}
            onUpdateRatio={onUpdateRatio}
          />
        </div>
      </div>

      <ResizeHandle
        direction={node.direction}
        ratio={activeRatio}
        onMouseDown={handleMouseDown}
      />

      {isDragging &&
        (isHorizontal ? (
          <>
            <div className="absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PercentageBadge ratio={activeRatio} side="first" />
            </div>
            <div className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PercentageBadge ratio={activeRatio} side="second" />
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2">
              <PercentageBadge ratio={activeRatio} side="first" />
            </div>
            <div className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2">
              <PercentageBadge ratio={activeRatio} side="second" />
            </div>
          </>
        ))}
    </div>
  );
}