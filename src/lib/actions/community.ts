"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  communitySettingsSchema,
  type CommunitySettingsInput,
} from "@/lib/validations/community";
import type { ActionResult } from "@/types";

export async function updateCommunitySettings(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Hanya admin yang bisa mengakses" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    keywords: (formData.get("keywords") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    mapsLocation: (formData.get("mapsLocation") as string) || undefined,
  };

  const validated = communitySettingsSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Parse keywords from comma-separated string
  const keywords = validated.data.keywords
    ? validated.data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : null;

  // Upsert: always maintain a single row
  const { data: existing } = await supabase
    .from("community_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("community_settings")
      .update({
        name: validated.data.name,
        description: validated.data.description || null,
        keywords,
        address: validated.data.address || null,
        maps_location: validated.data.mapsLocation || null,
      })
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: "Gagal memperbarui pengaturan" };
    }
  } else {
    const { error } = await supabase.from("community_settings").insert({
      name: validated.data.name,
      description: validated.data.description || null,
      keywords,
      address: validated.data.address || null,
      maps_location: validated.data.mapsLocation || null,
    });

    if (error) {
      return { success: false, error: "Gagal membuat pengaturan" };
    }
  }

  revalidatePath("/admin/pengaturan");
  revalidatePath("/");
  return { success: true, data: null };
}
