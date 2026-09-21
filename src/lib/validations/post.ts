import { z } from "zod";
import { POST_CATEGORIES, POST_STATUSES } from "@/lib/postStatus";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul harus minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  excerpt: z
    .string()
    .trim()
    .max(300, "Ringkasan maksimal 300 karakter")
    .optional(),
  content: z
    .string()
    .trim()
    .min(50, "Isi artikel minimal 50 karakter")
    .max(50000, "Isi artikel maksimal 50.000 karakter"),
  category: z.enum(POST_CATEGORIES, {
    error: "Pilih kategori artikel",
  }),
  status: z.enum(POST_STATUSES),
});

export type PostInput = z.infer<typeof postSchema>;
