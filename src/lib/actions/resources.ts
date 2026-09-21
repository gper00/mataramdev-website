"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resourceSchema } from "@/lib/validations/resource";
import {
  RESOURCE_BUCKET,
  RESOURCE_MAX_FILE_MB,
  storagePathFromPublicUrl,
} from "@/lib/storage";
import type { ActionResult } from "@/types";

/** Resources show up in the admin list and in the public download center. */
function revalidateResourceViews() {
  revalidatePath("/admin/resource");
  revalidatePath("/resource");
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
    return { error: "Hanya admin yang bisa mengelola resource" };
  }

  return { supabase };
}

/** Keeps the stored object name readable instead of trusting the raw filename. */
function safeFileName(originalName: string): string {
  const cleaned = originalName
    .toLowerCase()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned.length > 0 ? cleaned : "file";
}

export async function createResource(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = resourceSchema.safeParse({
    name: formData.get("name") ?? "",
    icon: formData.get("icon") ?? undefined,
    category: formData.get("category"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Pilih file yang mau diunggah" };
  }

  const maxBytes = RESOURCE_MAX_FILE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      error: `Ukuran file maksimal ${RESOURCE_MAX_FILE_MB}MB`,
    };
  }

  const filePath = `files/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}-${safeFileName(file.name)}`;

  const { error: uploadError } = await admin.supabase.storage
    .from(RESOURCE_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    return { success: false, error: "Gagal mengunggah file" };
  }

  const {
    data: { publicUrl },
  } = admin.supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(filePath);

  const { error } = await admin.supabase.from("free_resources").insert({
    name: validated.data.name,
    file_url: publicUrl,
    icon: validated.data.icon || null,
    category: validated.data.category,
    download_count: 0,
  });

  if (error) {
    // Roll the upload back, otherwise the bucket collects files with no row
    // pointing at them and nothing can reach them again.
    const { error: cleanupError } = await admin.supabase.storage
      .from(RESOURCE_BUCKET)
      .remove([filePath]);

    if (cleanupError) {
      console.error(
        "[createResource] insert failed and upload rollback failed:",
        cleanupError
      );
    }

    return { success: false, error: "Gagal menyimpan resource" };
  }

  revalidateResourceViews();
  return { success: true, data: null };
}

/**
 * Deletes a resource and the file behind it.
 *
 * The row goes first: it is the source of truth, and a storage failure must not
 * leave a listed resource that cannot be removed from the UI.
 */
export async function deleteResource(
  resourceId: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const { data: row, error: readError } = await admin.supabase
    .from("free_resources")
    .select("file_url")
    .eq("id", resourceId)
    .maybeSingle();

  if (readError) {
    return { success: false, error: "Gagal membaca data resource" };
  }

  const { error } = await admin.supabase
    .from("free_resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    return { success: false, error: "Gagal menghapus resource" };
  }

  const path = row?.file_url
    ? storagePathFromPublicUrl(row.file_url, RESOURCE_BUCKET)
    : null;

  if (path) {
    const { error: removeError } = await admin.supabase.storage
      .from(RESOURCE_BUCKET)
      .remove([path]);

    if (removeError) {
      console.error(
        "[deleteResource] row deleted but the stored file could not be removed:",
        removeError
      );
    }
  }

  revalidateResourceViews();
  return { success: true, data: null };
}
