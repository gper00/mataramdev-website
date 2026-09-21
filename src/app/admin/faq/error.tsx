"use client";

import { useEffect } from "react";

export default function AdminFaqError({
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
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Gagal memuat daftar FAQ
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        Ada masalah saat mengambil data dari server — ini bukan berarti belum
        ada FAQ. Coba muat ulang sebentar lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
