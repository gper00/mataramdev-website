import { z } from "zod";

export const profileSchema = z.object({
  fullname: z
    .string()
    .min(2, "Nama harus minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  username: z
    .string()
    .min(3, "Username harus minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-z0-9_]+$/,
      "Username hanya boleh huruf kecil, angka, dan underscore"
    ),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform wajib diisi"),
  url: z
    .string()
    .url("URL tidak valid")
    .min(1, "URL wajib diisi"),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
