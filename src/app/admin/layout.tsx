import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role from users table
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Badge for the moderation queue. Non-fatal: a failing count must not take
  // down every admin page, so it degrades to "no badge".
  const { count: pendingCount, error: pendingError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (pendingError) {
    console.error("[AdminLayout] pending project count failed:", pendingError);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminNav pendingCount={pendingCount ?? 0} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
