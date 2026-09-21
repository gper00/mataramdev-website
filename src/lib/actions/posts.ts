"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postSchema, type PostInput } from "@/lib/validations/post";
import { generateUniqueSlug } from "@/lib/utils";
import type { ActionResult } from "@/types";

/**
 * Cover images live in their own bucket to mirror the events/projects layout.
 * The bucket must exist and be public (see docs/RECAP.md deployment checklist).
 */
const POST_IMAGE_BUCKET = "posts";

function revalidatePostPages() {
  // The dashboard route group does not share a URL prefix with the public
  // pages, so each path is revalidated explicitly.
  revalidatePath("/artikel");
  revalidatePath("/artikel-saya");
}

export async function createPost(
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
    title: (formData.get("title") as string) || "",
    excerpt: (formData.get("excerpt") as string) || undefined,
    content: (formData.get("content") as string) || "",
    category: formData.get("category") as PostInput["category"],
    // The submit button carries the status, so one form can both save a draft
    // and publish.
    status: (formData.get("status") as PostInput["status"]) || "draft",
  };

  const validated = postSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const { title, excerpt, content, category, status } = validated.data;

  // Handle cover upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(POST_IMAGE_BUCKET)
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    slug: generateUniqueSlug(title),
    title,
    excerpt: excerpt || null,
    image_url: imageUrl,
    content,
    author_id: user.id,
    status,
    category,
    published_date: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    return { success: false, error: "Gagal menyimpan artikel" };
  }

  revalidatePostPages();
  redirect(`/artikel-saya?created=${status}`);
}

/**
 * Publishes one of the current user's drafts. Ownership is checked here rather
 * than trusted from the page that renders the button.
 */
export async function publishPost(
  postId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_date: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { success: false, error: "Gagal menerbitkan artikel" };
  }

  revalidatePostPages();
  return { success: true, data: null };
}
