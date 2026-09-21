import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  POST_STATUSES,
  postCategoryLabel,
  postStatusBadgeClasses,
  postStatusLabel,
  type PostStatus,
} from "@/lib/postStatus";
import PublishDraftButton from "./PublishDraftButton";

export const metadata = {
  title: "Artikel Saya — Mataram Dev",
  description: "Artikel dan draf yang kamu tulis untuk komunitas Mataram Dev.",
};

interface MyPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  status: string;
  category: string | null;
  published_date: string | null;
  created_at: string;
}

interface MyPostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyPostsPage({ searchParams }: MyPostsPageProps) {
  const params = await searchParams;
  const created =
    params.created === "published" || params.created === "draft"
      ? params.created
      : null;

  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: PostStatus | "all" =
    requested === "all" ||
    (requested && POST_STATUSES.includes(requested as PostStatus))
      ? (requested as PostStatus | "all")
      : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, image_url, status, category, published_date, created_at"
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil artikel Anda: ${error.message}`);
  }

  const posts = (data || []) as unknown as MyPostRow[];

  const counts = { all: posts.length, draft: 0, published: 0 };
  for (const post of posts) {
    if (POST_STATUSES.includes(post.status as PostStatus)) {
      counts[post.status as PostStatus] += 1;
    }
  }

  const visible =
    activeFilter === "all"
      ? posts
      : posts.filter((post) => post.status === activeFilter);

  const tabs: { key: PostStatus | "all"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "draft", label: "Draf" },
    { key: "published", label: "Terbit" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Artikel Saya
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Artikel yang sudah terbit dan draf yang belum selesai.
          </p>
        </div>
        <Link
          href="/artikel/baru"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Tulis Artikel
        </Link>
      </div>

      {created && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {created === "published"
              ? "Artikel berhasil diterbitkan!"
              : "Draf tersimpan!"}
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {created === "published"
              ? "Artikel kamu sudah tampil di halaman Artikel komunitas."
              : "Draf ini hanya terlihat oleh kamu. Terbitkan kapan saja lewat tombol Terbitkan di bawah."}
          </p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Kamu belum menulis artikel apa pun.
          </p>
          <Link
            href="/artikel/baru"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Tulis Artikel Pertama
          </Link>
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/artikel-saya?status=${tab.key}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === tab.key
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs ${
                    activeFilter === tab.key
                      ? "text-blue-100"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </Link>
            ))}
          </nav>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                {activeFilter === "all"
                  ? "Belum ada artikel."
                  : `Tidak ada artikel berstatus "${postStatusLabel(activeFilter)}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((post) => {
                const isPublished = post.status === "published";

                return (
                  <div
                    key={post.id}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {post.image_url ? (
                      <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:block dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl sm:flex dark:bg-zinc-800">
                        📝
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPublished ? (
                          <Link
                            href={`/artikel/${post.slug}`}
                            className="truncate text-sm font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
                          >
                            {post.title}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {post.title}
                          </span>
                        )}
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${postStatusBadgeClasses(post.status)}`}
                        >
                          {postStatusLabel(post.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {post.category && `${postCategoryLabel(post.category)} • `}
                        {isPublished && post.published_date
                          ? `Terbit ${formatDate(post.published_date)}`
                          : `Dibuat ${formatDate(post.created_at)}`}
                      </p>

                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isPublished ? (
                        <Link
                          href={`/artikel/${post.slug}`}
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Lihat
                        </Link>
                      ) : (
                        <PublishDraftButton postId={post.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
