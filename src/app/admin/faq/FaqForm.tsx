"use client";

import { useActionState, useRef } from "react";
import { createFaq } from "@/lib/actions/faq";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function FaqForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult<null>, formData: FormData) => {
      const result = await createFaq({ success: false, error: "" }, formData);

      // Leave the filled-in values on screen when it fails — nothing is more
      // annoying than retyping a long answer after a validation error.
      if (result.success) {
        formRef.current?.reset();
      }

      return result;
    },
    initialState
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          FAQ berhasil ditambahkan di urutan paling bawah.
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Pertanyaan <span className="text-red-500">*</span>
          </label>
          <input
            id="question"
            name="question"
            type="text"
            required
            minLength={5}
            maxLength={300}
            placeholder="Contoh: Apakah komunitas ini gratis?"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="answer"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Jawaban <span className="text-red-500">*</span>
          </label>
          <textarea
            id="answer"
            name="answer"
            required
            rows={4}
            minLength={5}
            maxLength={5000}
            placeholder="Jawaban singkat dan jelas."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Teks biasa — tampil apa adanya di halaman FAQ.
          </p>
        </div>

        <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "+ Tambah FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
