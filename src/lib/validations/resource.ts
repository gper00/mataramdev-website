import { z } from "zod";
import { RESOURCE_CATEGORIES } from "@/lib/resourceCategory";

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama resource minimal 3 karakter")
    .max(150, "Nama resource maksimal 150 karakter"),
  // Emoji, including multi-codepoint ones like 🧑‍💻 — hence a generous cap.
  icon: z.string().trim().max(16, "Ikon maksimal 16 karakter").optional(),
  category: z.enum(RESOURCE_CATEGORIES, {
    error: "Pilih kategori resource",
  }),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
