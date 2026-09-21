"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stackSchema } from "@/lib/validations/stack";
import type { ActionResult } from "@/types";

/** Stacks show up in the showcase filters and in the submission form. */
function revalidateStackViews() {
  revalidatePath("/admin/stack");
  revalidatePath("/proyek");
  // Every project detail page renders stack badges.
  revalidatePath("/proyek/[slug]", "page");
  // The submission form loads the stack list (separate route group).
  revalidatePath("/proyek/baru");
}

type AdminContext =
  | { supabase: Awaited<ReturnType<typeof createClient>> }
  | { error: string };

/** Middleware only knows whether a session exists — the role is checked here. */
async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login" };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: "Gagal memverifikasi akun Anda" };
  }

  if (profile?.role !== "admin") {
    return { error: "Hanya admin yang bisa mengelola stack" };
  }

  return { supabase };
}

export async function createStack(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = stackSchema.safeParse({ name: formData.get("name") ?? "" });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  const { error } = await admin.supabase
    .from("stacks")
    .insert({ name: validated.data.name });

  if (error) {
    // 23505 = unique_violation (stacks.name is unique)
    if (error.code === "23505") {
      return {
        success: false,
        error: `Stack "${validated.data.name}" sudah ada`,
      };
    }
    return { success: false, error: "Gagal menambahkan stack" };
  }

  revalidateStackViews();
  return { success: true, data: null };
}

export async function renameStack(
  stackId: string,
  name: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = stackSchema.safeParse({ name });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  const { error } = await admin.supabase
    .from("stacks")
    .update({ name: validated.data.name })
    .eq("id", stackId);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: `Stack "${validated.data.name}" sudah ada`,
      };
    }
    return { success: false, error: "Gagal mengganti nama stack" };
  }

  revalidateStackViews();
  return { success: true, data: null };
}

/**
 * Deletes a stack and detaches it from every project that uses it.
 *
 * `project_stacks` has a foreign key to `stacks` without cascade, so the join
 * rows must go first — otherwise the delete fails and the stack becomes
 * impossible to remove. The UI confirms how many projects are affected.
 */
export async function deleteStack(
  stackId: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const { error: detachError } = await admin.supabase
    .from("project_stacks")
    .delete()
    .eq("stack_id", stackId);

  if (detachError) {
    return {
      success: false,
      error: "Gagal melepaskan stack dari proyek yang memakainya",
    };
  }

  const { error } = await admin.supabase
    .from("stacks")
    .delete()
    .eq("id", stackId);

  if (error) {
    return { success: false, error: "Gagal menghapus stack" };
  }

  revalidateStackViews();
  return { success: true, data: null };
}
