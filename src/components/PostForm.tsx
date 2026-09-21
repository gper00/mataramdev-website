"use client";

import { useActionState, useState } from "react";
import { createPost } from "@/lib/actions/posts";
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  type PostCategory,
} from "@/lib/postStatus";

interface FormState {
  success: boolean;
  error: string | null;
}

const CATEGORY_HINTS: Record<PostCategory, string> = {
  tutorial: "Panduan langkah demi langkah",
  tips: "Tips singkat dan praktik harian",
  event: "Catatan atau pengumuman kegiatan",
  story: "Cerita dan pengalaman pribadi",
};

export default function PostForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createPost({ success: false, error: "" }, formData);
      return {
        success: result.success,
        error: result.success ? null : result.error,
      };
    },
    { success: false, error: null }
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={200}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Contoh: Mulai Kontribusi ke Open Source"
        />
      </div>

      {/* Category */}
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
          defaultValue="tutorial"
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {POST_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {POST_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {CATEGORY_HINTS.tutorial} · {CATEGORY_HINTS.tips} ·{" "}
          {CATEGORY_HINTS.event} · {CATEGORY_HINTS.story}
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Ringkasan
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          maxLength={300}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Satu atau dua kalimat yang muncul di daftar artikel."
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Maksimal 300 karakter.
        </p>
      </div>

      {/* Cover */}
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Gambar Cover
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Format: JPEG, PNG, WebP, atau GIF. Maksimal 5MB.
        </p>
        {imagePreview && (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="h-40 w-auto rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Isi Artikel <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={18}
          minLength={50}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder={"## Subjudul\n\nTulis artikelmu di sini...\n\n```js\nconsole.log(\"halo\");\n```"}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Mendukung Markdown: heading (`##`), **bold**, *italic*, `code`,
          blok kode, list, link, tabel, dan kutipan. Minimal 50 karakter.
        </p>
      </div>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          name="status"
          value="published"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Publish"}
        </button>
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={isPending}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Simpan sebagai Draf
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Artikel yang di-publish langsung tampil di halaman Artikel.
        </p>
      </div>
    </form>
  );
}
