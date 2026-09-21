import Link from "next/link";
import PostForm from "@/components/PostForm";

export const metadata = {
  title: "Tulis Artikel — Mataram Dev",
  description: "Tulis artikel untuk dibagikan ke komunitas Mataram Dev.",
};

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/artikel-saya"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Artikel Saya
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Tulis Artikel
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Bagikan tutorial, tips, atau cerita kamu. Simpan sebagai draf dulu kalau
        belum selesai — draf hanya terlihat oleh kamu.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <PostForm />
      </div>
    </div>
  );
}
