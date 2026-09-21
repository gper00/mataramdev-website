"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { faqSchema } from "@/lib/validations/faq";
import { faqOrderUpdates, moveFaqRow, sortFaqRows } from "@/lib/faq";
import type { FaqOrderUpdate } from "@/lib/faq";
import type { ActionResult } from "@/types";

/** FAQ shows up in the admin list and on the public FAQ page. */
function revalidateFaqViews() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AdminContext = { supabase: SupabaseClient } | { error: string };

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
    return { error: "Hanya admin yang bisa mengelola FAQ" };
  }

  return { supabase };
}

/** Persists the renumbering computed by `faqOrderUpdates` / `moveFaqRow`. */
async function persistFaqOrder(
  supabase: SupabaseClient,
  updates: FaqOrderUpdate[]
): Promise<string | null> {
  if (updates.length === 0) return null;

  const results = await Promise.all(
    updates.map((update) =>
      supabase.from("faq").update({ order: update.order }).eq("id", update.id)
    )
  );

  if (results.some((result) => result.error)) {
    return "Gagal menyimpan urutan FAQ";
  }

  return null;
}

/** Reads every FAQ and closes any gaps or duplicates in its numbering. */
async function normalizeFaqOrder(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase.from("faq").select("id, order");

  if (error) {
    return "Gagal membaca urutan FAQ";
  }

  return persistFaqOrder(supabase, faqOrderUpdates(sortFaqRows(data || [])));
}

export async function createFaq(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = faqSchema.safeParse({
    question: formData.get("question") ?? "",
    answer: formData.get("answer") ?? "",
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  // Insert with no number, then renumber: a row without `order` sorts last, so
  // a new entry lands at the end of the list instead of on top of it.
  const { error } = await admin.supabase.from("faq").insert({
    question: validated.data.question,
    answer: validated.data.answer,
    order: null,
  });

  if (error) {
    return { success: false, error: "Gagal menyimpan FAQ" };
  }

  const orderError = await normalizeFaqOrder(admin.supabase);
  if (orderError) {
    // The row itself is saved; only its position is unsure.
    return { success: false, error: orderError };
  }

  revalidateFaqViews();
  return { success: true, data: null };
}

export async function updateFaq(
  faqId: string,
  question: string,
  answer: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = faqSchema.safeParse({ question, answer });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  // `order` is intentionally left alone — editing text must not move the entry.
  const { error } = await admin.supabase
    .from("faq")
    .update({
      question: validated.data.question,
      answer: validated.data.answer,
    })
    .eq("id", faqId);

  if (error) {
    return { success: false, error: "Gagal memperbarui FAQ" };
  }

  revalidateFaqViews();
  return { success: true, data: null };
}

export async function deleteFaq(faqId: string): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const { error } = await admin.supabase.from("faq").delete().eq("id", faqId);

  if (error) {
    return { success: false, error: "Gagal menghapus FAQ" };
  }

  // Close the gap so the numbers stay 0, 1, 2, … after a delete.
  const orderError = await normalizeFaqOrder(admin.supabase);
  if (orderError) {
    return { success: false, error: orderError };
  }

  revalidateFaqViews();
  return { success: true, data: null };
}

export async function moveFaqItem(
  faqId: string,
  direction: "up" | "down"
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  // The list is small, so it is read whole and renumbered from scratch — that
  // keeps `order` free of gaps and duplicates no matter how it got that way.
  const { data, error } = await admin.supabase.from("faq").select("id, order");

  if (error) {
    return { success: false, error: "Gagal membaca urutan FAQ" };
  }

  const moved = moveFaqRow(data || [], faqId, direction);

  if (!moved) {
    return { success: false, error: "FAQ tidak ditemukan" };
  }

  const orderError = await persistFaqOrder(admin.supabase, moved.updates);
  if (orderError) {
    return { success: false, error: orderError };
  }

  revalidateFaqViews();
  return { success: true, data: null };
}
