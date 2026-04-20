// types/layout.ts
// Purpose: Single source of truth for all layout-related TypeScript types.
// These are shared between frontend components, hooks, and API route handlers.

export type SplitDirection = "horizontal" | "vertical";

/**
 * A LayoutNode is either:
 * - A LEAF: has a color, no direction/children
 * - A SPLIT: has direction, splitRatio, and exactly 2 children
 *
 * This recursive union type models the binary tree cleanly.
 */
export type LayoutNode =
  | {
      id: string;
      color: string;
      direction?: never;
      splitRatio?: never;
      children?: never;
    }
  | {
      id: string;
      color: string; // inherited color (not displayed directly for split nodes)
      direction: SplitDirection;
      splitRatio: number; // 0–1: fraction of space given to first child
      children: [LayoutNode, LayoutNode];
    };

/** Type guard: returns true if the node is a leaf (not split) */
export function isLeaf(node: LayoutNode): node is LayoutNode & { direction?: never } {
  return !node.direction;
}

/** The shape of the layout payload sent to/from the API */
export interface LayoutPayload {
  tree: LayoutNode;
}