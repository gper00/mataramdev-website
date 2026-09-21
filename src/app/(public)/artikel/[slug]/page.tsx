import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { postCategoryLabel } from "@/lib/postStatus";
import Markdown from "@/components/Markdown";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, users(fullname, username, image_url, bio)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    throw new Error(`Gagal mengambil detail artikel: ${error.message}`);
  }

  if (!post) {
    notFound();
  }

  // Supabase returns a to-one join as an array.
  const author = (
    post.users as
      | { fullname: string | null; username: string | null; image_url: string | null; bio: string | null }[]
      | null
  )?.[0];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/artikel"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Kembali ke artikel
      </Link>

      {post.category && (
        <div className="mt-6">
          <Link
            href={`/artikel?kategori=${post.category}`}
            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            {postCategoryLabel(post.category)}
          </Link>
        </div>
      )}

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {post.title}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        {author?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.image_url}
            alt={author.fullname || author.username || "Penulis"}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {(author?.fullname || author?.username || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {author?.fullname || author?.username || "Anonim"}
          </p>
          {post.published_date && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(post.published_date)}
            </p>
          )}
        </div>
      </div>

      {post.image_url && (
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-8 border-l-4 border-zinc-300 pl-4 text-lg text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {post.excerpt}
        </p>
      )}

      {post.content ? (
        <Markdown className="mt-8">{post.content}</Markdown>
      ) : (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">
          Artikel ini belum punya isi.
        </p>
      )}
    </article>
  );
}
