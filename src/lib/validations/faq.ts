import { z } from "zod";

export const faqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "Pertanyaan minimal 5 karakter")
    .max(300, "Pertanyaan maksimal 300 karakter"),
  answer: z
    .string()
    .trim()
    .min(5, "Jawaban minimal 5 karakter")
    .max(5000, "Jawaban maksimal 5.000 karakter"),
});

export type FaqInput = z.infer<typeof faqSchema>;
