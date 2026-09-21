import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Nama proyek minimal 3 karakter")
    .max(100, "Nama proyek maksimal 100 karakter"),
  content: z
    .string()
    .max(5000, "Deskripsi proyek maksimal 5000 karakter")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("URL GitHub tidak valid")
    .optional()
    .or(z.literal("")),
  demoUrl: z
    .string()
    .url("URL demo tidak valid")
    .optional()
    .or(z.literal("")),
  stackIds: z
    .array(z.string().uuid())
    .min(1, "Pilih minimal 1 stack teknologi"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
