"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ArticleDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
          Gagal memuat detail artikel
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          Artikel ini mungkin ada, tapi server gagal mengambil datanya. Coba
          lagi sebentar lagi.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Coba Lagi
          </button>
          <Link
            href="/artikel"
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
          >
            Kembali ke daftar artikel
          </Link>
        </div>
      </div>
    </div>
  );
}
