"use client";

import { useState, useTransition } from "react";
import { deleteFaq, moveFaqItem, updateFaq } from "@/lib/actions/faq";

interface FaqRowProps {
  id: string;
  question: string;
  answer: string;
  position: number;
  total: number;
}

export default function FaqRow({
  id,
  question,
  answer,
  position,
  total,
}: FaqRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(question);
  const [draftAnswer, setDraftAnswer] = useState(answer);
  const [error, setError] = useState<string | null>(null);

  const isFirst = position === 0;
  const isLast = position === total - 1;

  const run = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan");
      }
    });
  };

  const save = () => {
    run(async () => {
      const result = await updateFaq(id, draftQuestion, draftAnswer);
      if (result.success) {
        setIsEditing(false);
      }
      return result;
    });
  };

  const cancelEdit = () => {
    setDraftQuestion(question);
    setDraftAnswer(answer);
    setIsEditing(false);
    setError(null);
  };

  const remove = () => {
    if (!confirm(`Hapus FAQ "${question}"?`)) return;
    run(() => deleteFaq(id));
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={() => run(() => moveFaqItem(id, "up"))}
            disabled={isPending || isFirst}
            aria-label="Naikkan urutan"
            className="rounded border border-zinc-200 px-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ▲
          </button>
          <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            {position + 1}
          </span>
          <button
            onClick={() => run(() => moveFaqItem(id, "down"))}
            disabled={isPending || isLast}
            aria-label="Turunkan urutan"
            className="rounded border border-zinc-200 px-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ▼
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                disabled={isPending}
                minLength={5}
                maxLength={300}
                autoFocus
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <textarea
                value={draftAnswer}
                onChange={(event) => setDraftAnswer(event.target.value)}
                disabled={isPending}
                rows={4}
                minLength={5}
                maxLength={5000}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {question}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                {answer}
              </p>
            </>
          )}
        </div>

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
                onClick={cancelEdit}
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
              Ubah
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
