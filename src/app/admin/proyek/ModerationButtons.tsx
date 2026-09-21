"use client";

import { useState, useTransition } from "react";
import { moderateProject } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/lib/projectStatus";

interface ModerationButtonsProps {
  projectId: string;
  status: string;
}

export default function ModerationButtons({
  projectId,
  status,
}: ModerationButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (next: ProjectStatus, confirmMessage?: string) => {
    if (confirmMessage && !confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await moderateProject(projectId, next);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex shrink-0 items-center gap-2">
        {status !== "approved" && (
          <button
            onClick={() => run("approved")}
            disabled={isPending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "..." : "Setujui"}
          </button>
        )}

        {status !== "rejected" && (
          <button
            onClick={() =>
              run("rejected", "Tolak proyek ini? Publik tidak akan melihatnya.")
            }
            disabled={isPending}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isPending ? "..." : "Tolak"}
          </button>
        )}

        {status !== "pending" && (
          <button
            onClick={() => run("pending")}
            disabled={isPending}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isPending ? "..." : "Kembalikan"}
          </button>
        )}
      </div>

      {error && (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
