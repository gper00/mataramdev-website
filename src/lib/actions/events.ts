"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { generateUniqueSlug } from "@/lib/utils";
import type { ActionResult } from "@/types";

export async function createEvent(
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
    return { success: false, error: "Hanya admin yang bisa membuat event" };
  }

  const raw = {
    title: formData.get("title") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: formData.get("status") as EventInput["status"],
    startTime: formData.get("startTime") as string,
    endTime: (formData.get("endTime") as string) || undefined,
    locationName: (formData.get("locationName") as string) || undefined,
    locationUrl: (formData.get("locationUrl") as string) || undefined,
  };

  const validated = eventSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const slug = generateUniqueSlug(validated.data.title);

  const { error } = await supabase.from("events").insert({
    slug,
    title: validated.data.title,
    excerpt: validated.data.excerpt || null,
    description: validated.data.description || null,
    image_url: imageUrl,
    status: validated.data.status,
    start_time: new Date(validated.data.startTime).toISOString(),
    end_time: validated.data.endTime
      ? new Date(validated.data.endTime).toISOString()
      : null,
    location_name: validated.data.locationName || null,
    location_url: validated.data.locationUrl || null,
    created_by: user.id,
  });

  if (error) {
    return { success: false, error: "Gagal membuat event" };
  }

  redirect("/admin/event");
}

export async function updateEvent(
  eventId: string,
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

  const raw = {
    title: formData.get("title") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: formData.get("status") as EventInput["status"],
    startTime: formData.get("startTime") as string,
    endTime: (formData.get("endTime") as string) || undefined,
    locationName: (formData.get("locationName") as string) || undefined,
    locationUrl: (formData.get("locationUrl") as string) || undefined,
  };

  const validated = eventSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const updateData: Record<string, unknown> = {
    title: validated.data.title,
    excerpt: validated.data.excerpt || null,
    description: validated.data.description || null,
    status: validated.data.status,
    start_time: new Date(validated.data.startTime).toISOString(),
    end_time: validated.data.endTime
      ? new Date(validated.data.endTime).toISOString()
      : null,
    location_name: validated.data.locationName || null,
    location_url: validated.data.locationUrl || null,
  };

  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) {
    return { success: false, error: "Gagal memperbarui event" };
  }

  revalidatePath("/admin/event");
  redirect("/admin/event");
}

export async function deleteEvent(
  eventId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, error: "Gagal menghapus event" };
  }

  revalidatePath("/admin/event");
  return { success: true, data: null };
}
