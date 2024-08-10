import * as z from "zod";

export const DEDAULT_SCHEMA = z.object({
  type: z.literal("1.0"),
  data: z.object({
    name: z.string(),
    description: z.string().optional(),
    responsabilities: z
      .array(
        z.object({
          label: z.string(),
          description: z.string().optional(),
          link: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .optional(),
    authorities: z
      .array(
        z.object({
          label: z.string(),
          description: z.string().optional(),
          link: z.string().optional(),
          imageUrl: z.string().optional(),
          gate: z.string().optional(),
        })
      )
      .optional(),
  }),
});
