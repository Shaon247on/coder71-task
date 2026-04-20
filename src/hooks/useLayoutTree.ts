// src/hooks/useLayoutTree.ts

"use client";

import { useCallback, useState } from "react";
import { LayoutNode, SplitDirection } from "@/types/layout";
import {
  createInitialTree,
  removeNode,
  splitNode,
  updateSplitRatio,
} from "@/lib/layoutUtils";

interface UseLayoutTreeReturn {
  tree: LayoutNode;
  setTree: React.Dispatch<React.SetStateAction<LayoutNode>>;
  split: (nodeId: string, direction: SplitDirection) => void;
  remove: (nodeId: string) => void;
  updateRatio: (nodeId: string, ratio: number) => void;
  resetTree: () => void;
}

export function useLayoutTree(initialTree?: LayoutNode): UseLayoutTreeReturn {
  const [tree, setTree] = useState<LayoutNode>(initialTree ?? createInitialTree());

  const split = useCallback((nodeId: string, direction: SplitDirection) => {
    setTree((currentTree) => splitNode(currentTree, nodeId, direction));
  }, []);

  const remove = useCallback((nodeId: string) => {
    setTree((currentTree) => removeNode(currentTree, nodeId));
  }, []);

  const updateRatio = useCallback((nodeId: string, ratio: number) => {
    setTree((currentTree) => updateSplitRatio(currentTree, nodeId, ratio));
  }, []);

  const resetTree = useCallback(() => {
    setTree(createInitialTree());
  }, []);

  return {
    tree,
    setTree,
    split,
    remove,
    updateRatio,
    resetTree,
  };
}