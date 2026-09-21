"use client";

import { useActionState, useRef, useState } from "react";
import { createResource } from "@/lib/actions/resources";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_ICONS,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/resourceCategory";
import { RESOURCE_MAX_FILE_MB } from "@/lib/storage";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

const MAX_BYTES = RESOURCE_MAX_FILE_MB * 1024 * 1024;

interface SelectedFile {
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ResourceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  // The wrapper (not an effect) clears the form after a successful upload, so
  // the next entry starts blank.
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult<null>, formData: FormData) => {
      const result = await createResource(
        { success: false, error: "" },
        formData
      );

      if (result.success) {
        formRef.current?.reset();
        setSelectedFile(null);
      }

      return result;
    },
    initialState
  );

  const isOversized = (selectedFile?.size ?? 0) > MAX_BYTES;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Resource berhasil diunggah dan langsung tampil di halaman publik.
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nama Resource <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={150}
              placeholder="Contoh: Cheatsheet Git untuk Pemula"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue="doc"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {RESOURCE_CATEGORY_ICONS[category]}{" "}
                  {RESOURCE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="icon"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Ikon (opsional)
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              maxLength={16}
              placeholder="📘"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tempel satu emoji. Kalau dikosongkan, ikon kategori yang dipakai.
            </p>
          </div>

          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              File <span className="text-red-500">*</span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              onChange={(event) => {
                const file = event.target.files?.[0];
                setSelectedFile(
                  file ? { name: file.name, size: file.size } : null
                );
              }}
              className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
            />
            {selectedFile ? (
              <p
                className={`mt-1 text-xs ${
                  isOversized
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Terpilih: {selectedFile.name} (
                {formatFileSize(selectedFile.size)})
                {isOversized &&
                  ` — melebihi batas ${RESOURCE_MAX_FILE_MB}MB, pilih file lain.`}
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                PDF, ZIP, gambar, atau file lain. Maksimal{" "}
                {RESOURCE_MAX_FILE_MB}MB.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            disabled={pending || isOversized}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Mengunggah..." : "+ Unggah Resource"}
          </button>
        </div>
      </form>
    </div>
  );
}
