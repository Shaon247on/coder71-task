// validators/layoutSchema.ts
// Purpose: Zod schema for validating the layout tree payload sent to the save endpoint.
// Uses z.lazy() to handle the self-referential recursive LayoutNode structure.

import { z } from "zod";

// Recursive Zod schema for LayoutNode
// z.lazy() is required because the type references itself.
const layoutNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    color: z.string(),
    direction: z.enum(["horizontal", "vertical"]).optional(),
    splitRatio: z.number().min(0).max(1).optional(),
    children: z.tuple([layoutNodeSchema, layoutNodeSchema]).optional(),
  })
);

export const saveLayoutSchema = z.object({
  tree: layoutNodeSchema,
});

export type SaveLayoutInput = z.infer<typeof saveLayoutSchema>;