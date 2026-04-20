export type SplitDirection = "horizontal" | "vertical";

export interface LayoutLeafNode {
  id: string;
  color: string;
}

export interface LayoutSplitNode {
  id: string;
  color: string;
  direction: SplitDirection;
  splitRatio: number;
  children: [LayoutNode, LayoutNode];
}

export type LayoutNode = LayoutLeafNode | LayoutSplitNode;

export interface LayoutPayload {
  tree: LayoutNode;
}

export function isSplitNode(node: LayoutNode): node is LayoutSplitNode {
  return "direction" in node && "children" in node && "splitRatio" in node;
}

export function isLeaf(node: LayoutNode): node is LayoutLeafNode {
  return !isSplitNode(node);
}