import { z } from "zod";

export const communitySettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Nama komunitas wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  keywords: z.string().optional(), // comma-separated, parsed server-side
  address: z.string().max(200).optional(),
  mapsLocation: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

export type CommunitySettingsInput = z.infer<typeof communitySettingsSchema>;
