import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  isPostCategory,
  postCategoryLabel,
} from "@/lib/postStatus";

export const metadata = {
  title: "Artikel — Mataram Dev",
  description:
    "Tutorial, tips, dan cerita dari developer & designer komunitas Mataram.",
};

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published_date: string | null;
  users: { fullname: string | null; username: string | null }[] | null;
}

interface ArticleListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticleListPage({
  searchParams,
}: ArticleListPageProps) {
  const params = await searchParams;
  const categoryParam =
    typeof params.kategori === "string" ? params.kategori : undefined;
  const activeCategory = isPostCategory(categoryParam) ? categoryParam : null;

  const supabase = await createClient();

  const query = supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, image_url, category, published_date, users(fullname, username)"
    )
    .eq("status", "published")
    .order("published_date", { ascending: false, nullsFirst: false });

  const { data, error } = activeCategory
    ? await query.eq("category", activeCategory)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data artikel: ${error.message}`);
  }

  const posts = (data || []) as unknown as PostRow[];

  const filters: { label: string; value: string | null }[] = [
    { label: "Semua", value: null },
    ...POST_CATEGORIES.map((category) => ({
      label: POST_CATEGORY_LABELS[category],
      value: category as string,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Artikel
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Tutorial, tips, dan cerita dari developer &amp; designer Mataram.
          </p>
        </div>
        <Link
          href="/artikel/baru"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Tulis Artikel
        </Link>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeCategory === filter.value;

          return (
            <Link
              key={filter.label}
              href={filter.value ? `/artikel?kategori=${filter.value}` : "/artikel"}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {activeCategory
              ? `Belum ada artikel kategori "${postCategoryLabel(activeCategory)}".`
              : "Belum ada artikel yang terbit. Nantikan ya!"}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const author = post.users?.[0];

            return (
              <li key={post.id}>
                <Link
                  href={`/artikel/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
                >
                  {post.image_url ? (
                    <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-zinc-100 text-3xl dark:bg-zinc-800">
                      📝
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    {post.category && (
                      <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {postCategoryLabel(post.category)}
                      </span>
                    )}

                    <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {post.excerpt}
                      </p>
                    )}

                    <p className="mt-auto pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {author?.fullname || author?.username || "Anonim"}
                      {post.published_date &&
                        ` • ${formatDate(post.published_date)}`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
