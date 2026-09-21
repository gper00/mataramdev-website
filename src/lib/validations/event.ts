import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Judul harus minimal 3 karakter")
      .max(200, "Judul maksimal 200 karakter"),
    excerpt: z.string().max(300, "Excerpt maksimal 300 karakter").optional(),
    description: z.string().optional(),
    status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
    startTime: z.string().min(1, "Waktu mulai wajib diisi"),
    endTime: z.string().optional(),
    locationName: z.string().max(200).optional(),
    locationUrl: z
      .string()
      .url("URL tidak valid")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.endTime && data.startTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "Waktu selesai harus setelah waktu mulai",
      path: ["endTime"],
    }
  );

export type EventInput = z.infer<typeof eventSchema>;
