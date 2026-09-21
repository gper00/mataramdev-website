"use client";

import { useState, useTransition } from "react";
import { deleteStack, renameStack } from "@/lib/actions/stacks";

interface StackRowProps {
  id: string;
  name: string;
  usageCount: number;
}

export default function StackRow({ id, name, usageCount }: StackRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (draft.trim() === name) {
      setIsEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await renameStack(id, draft);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    });
  };

  const remove = () => {
    const message =
      usageCount > 0
        ? `Stack "${name}" dipakai oleh ${usageCount} proyek. Menghapusnya akan melepas tag ini dari proyek tersebut. Lanjutkan?`
        : `Hapus stack "${name}"?`;

    if (!confirm(message)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteStack(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
              if (event.key === "Escape") {
                setDraft(name);
                setIsEditing(false);
                setError(null);
              }
            }}
            autoFocus
            maxLength={50}
            disabled={isPending}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {name}
          </span>
        )}

        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {usageCount > 0 ? `${usageCount} proyek` : "belum dipakai"}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={save}
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "..." : "Simpan"}
              </button>
              <button
                onClick={() => {
                  setDraft(name);
                  setIsEditing(false);
                  setError(null);
                }}
                disabled={isPending}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Ganti Nama
            </button>
          )}

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
