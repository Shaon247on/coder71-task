// src/validators/layoutSchema.ts

import { z } from "zod";

type RecursiveLayoutSchema = z.ZodTypeAny;

const layoutNodeSchema: RecursiveLayoutSchema = z.lazy(() =>
  z.union([
    z
      .object({
        id: z.string().uuid(),
        color: z.string().min(1),
      })
      .strict(),
    z
      .object({
        id: z.string().uuid(),
        color: z.string().min(1),
        direction: z.enum(["horizontal", "vertical"]),
        splitRatio: z.number().min(0.05).max(0.95),
        children: z.tuple([layoutNodeSchema, layoutNodeSchema]),
      })
      .strict(),
  ])
);

export const saveLayoutSchema = z.object({
  tree: layoutNodeSchema,
});

export type SaveLayoutInput = z.infer<typeof saveLayoutSchema>;