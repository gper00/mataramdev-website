"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validations/auth";
import type { ActionResult } from "@/types";

export async function register(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    fullname: formData.get("fullname") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = registerSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        fullname: validated.data.fullname,
      },
    },
  });

  if (error) {
    const message =
      error.message.includes("already registered")
        ? "Email sudah terdaftar"
        : error.message.includes("valid email")
          ? "Format email tidak valid"
          : "Gagal mendaftar. Silakan coba lagi.";

    return { success: false, error: message };
  }

  redirect("/login?registered=true");
}

export async function login(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    const message =
      error.message.includes("Invalid login credentials")
        ? "Email atau password salah"
        : "Gagal login. Silakan coba lagi.";

    return { success: false, error: message };
  }

  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
