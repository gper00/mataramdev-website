"use client";

import { useState, useTransition } from "react";
import { deleteResource } from "@/lib/actions/resources";
import {
  resourceCategoryBadgeClasses,
  resourceCategoryLabel,
  resourceIcon,
} from "@/lib/resourceCategory";

interface ResourceRowProps {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  downloadCount: number;
  createdAt: string;
}

export default function ResourceRow({
  id,
  name,
  category,
  icon,
  downloadCount,
  createdAt,
}: ResourceRowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    const confirmed = confirm(
      `Hapus resource "${name}"? File-nya juga dihapus dari storage dan tidak bisa dipakai lagi.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteResource(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
          {resourceIcon(category, icon)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {name}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resourceCategoryBadgeClasses(category)}`}
            >
              {resourceCategoryLabel(category)}
            </span>
            <span>{downloadCount} unduhan</span>
            <span>•</span>
            <span>{createdAt}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`/resource/${id}/download`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Unduh
          </a>
          <button
            onClick={remove}
            disabled={isPending}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isPending ? "..." : "Hapus"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
