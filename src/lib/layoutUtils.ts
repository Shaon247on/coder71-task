import { v4 as uuidv4 } from "uuid";
import {
  LayoutNode,
  LayoutSplitNode,
  SplitDirection,
  isLeaf,
  isSplitNode,
} from "@/types/layout";
import { generateColor } from "@/lib/colors";

export function createLeafNode(color?: string): LayoutNode {
  return {
    id: uuidv4(),
    color: color ?? generateColor(),
  };
}

export function createInitialTree(): LayoutNode {
  return createLeafNode();
}

export function splitNode(
  tree: LayoutNode,
  nodeId: string,
  direction: SplitDirection
): LayoutNode {
  if (tree.id === nodeId) {
    if (!isLeaf(tree)) return tree;

    const firstChild: LayoutNode = {
      id: tree.id,
      color: tree.color,
    };

    const secondChild: LayoutNode = createLeafNode();

    const splitContainer: LayoutSplitNode = {
      id: uuidv4(),
      color: tree.color,
      direction,
      splitRatio: 0.5,
      children: [firstChild, secondChild],
    };

    return splitContainer;
  }

  if (!isSplitNode(tree)) {
    return tree;
  }

  const splitTree: LayoutSplitNode = tree;

  return {
    ...splitTree,
    children: [
      splitNode(splitTree.children[0], nodeId, direction),
      splitNode(splitTree.children[1], nodeId, direction),
    ],
  };
}

export function updateSplitRatio(
  tree: LayoutNode,
  nodeId: string,
  ratio: number
): LayoutNode {
  if (tree.id === nodeId) {
    if (!isSplitNode(tree)) return tree;

    return {
      ...tree,
      splitRatio: clampRatio(ratio),
    };
  }

  if (!isSplitNode(tree)) {
    return tree;
  }

  const splitTree: LayoutSplitNode = tree;

  return {
    ...splitTree,
    children: [
      updateSplitRatio(splitTree.children[0], nodeId, ratio),
      updateSplitRatio(splitTree.children[1], nodeId, ratio),
    ],
  };
}

export function removeNode(tree: LayoutNode, nodeId: string): LayoutNode {
  const result = removeNodeInternal(tree, nodeId);
  return result ?? tree;
}

function removeNodeInternal(tree: LayoutNode, nodeId: string): LayoutNode | null {
  if (!isSplitNode(tree)) {
    return tree.id === nodeId ? null : tree;
  }

  const [leftChild, rightChild] = tree.children;
  

  const nextLeft = removeNodeInternal(leftChild, nodeId);
  const nextRight = removeNodeInternal(rightChild, nodeId);

  if (nextLeft === null && nextRight === null) {
    return null;
  }

  if (nextLeft === null && nextRight !== null) {
    return nextRight;
  }

  if (nextLeft !== null && nextRight === null) {
    return nextLeft;
  }

  return {
    ...tree,
    children: [nextLeft, nextRight] as [LayoutNode, LayoutNode],
  };
}

export function clampRatio(ratio: number): number {
  return Math.min(0.95, Math.max(0.05, ratio));
}

export function applySnap(ratio: number, threshold = 0.025): number {
  const snapPoints = [0.25, 0.5, 0.75];

  for (const point of snapPoints) {
    if (Math.abs(ratio - point) <= threshold) {
      return point;
    }
  }

  return ratio;
}