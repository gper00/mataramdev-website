"use client";

import { useEffect } from "react";

export default function AdminStacksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminStacks]", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
      <p className="text-lg font-semibold text-red-800 dark:text-red-200">
        Gagal memuat daftar stack
      </p>
      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
        Terjadi kesalahan saat menghubungi server. Silakan coba lagi.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-red-500 dark:text-red-500">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
