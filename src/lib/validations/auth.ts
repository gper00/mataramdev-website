import { z } from "zod";

export const registerSchema = z
  .object({
    fullname: z
      .string()
      .min(2, "Nama harus minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password harus minimal 8 karakter")
      .max(128, "Password maksimal 128 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
