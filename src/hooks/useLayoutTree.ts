// hooks/useLayoutTree.ts
// Purpose: The single source of truth for the layout tree state.
// Exposes typed actions for splitting nodes and updating resize ratios.
// Keeps ALL tree mutation logic out of components.

"use client";

import { useState, useCallback } from "react";
import { LayoutNode, SplitDirection } from "@/types/layout";
import { splitNode, updateSplitRatio, createInitialTree } from "@/lib/layoutUtils";

interface UseLayoutTreeReturn {
  tree: LayoutNode;
  setTree: (tree: LayoutNode) => void;
  split: (nodeId: string, direction: SplitDirection) => void;
  updateRatio: (nodeId: string, ratio: number) => void;
  resetTree: () => void;
}

export function useLayoutTree(initialTree?: LayoutNode): UseLayoutTreeReturn {
  const [tree, setTree] = useState<LayoutNode>(
    initialTree ?? createInitialTree()
  );

  /** Splits a leaf node in the given direction */
  const split = useCallback(
    (nodeId: string, direction: SplitDirection) => {
      setTree((current) => splitNode(current, nodeId, direction));
    },
    []
  );

  /** Updates the drag ratio of a split container during resize */
  const updateRatio = useCallback(
    (nodeId: string, ratio: number) => {
      setTree((current) => updateSplitRatio(current, nodeId, ratio));
    },
    []
  );

  /** Resets the layout to a fresh single-block tree */
  const resetTree = useCallback(() => {
    setTree(createInitialTree());
  }, []);

  return { tree, setTree, split, updateRatio, resetTree };
}