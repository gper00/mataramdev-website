"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStack } from "@/lib/actions/stacks";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function StackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createStack,
    initialState
  );

  // Clear the input after a successful add so the next entry starts blank.
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Stack berhasil ditambahkan.
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap gap-3">
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nama Stack
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={50}
            placeholder="Contoh: Next.js, Laravel, Figma"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Menambahkan..." : "+ Tambah Stack"}
          </button>
        </div>
      </form>
    </div>
  );
}
