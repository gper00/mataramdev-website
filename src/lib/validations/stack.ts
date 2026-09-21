import { z } from "zod";

export const stackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama stack wajib diisi")
    .max(50, "Nama stack maksimal 50 karakter"),
});

export type StackInput = z.infer<typeof stackSchema>;
