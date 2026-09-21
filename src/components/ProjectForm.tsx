"use client";

import { useActionState, useEffect, useState } from "react";
import { createProject, getStacks } from "@/lib/actions/projects";

interface Stack {
  id: string;
  name: string;
}

interface FormState {
  success: boolean;
  error: string | null;
}

export default function ProjectForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createProject({ success: false, error: "" }, formData);
      return { success: result.success, error: result.success ? null : result.error };
    },
    { success: false, error: null }
  );

  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch stacks on mount
  useEffect(() => {
    getStacks().then((result) => {
      if (result.success) {
        setStacks(result.data);
      }
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const toggleStack = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId)
        ? prev.filter((id) => id !== stackId)
        : [...prev, stackId]
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Error message */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nama Proyek <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={100}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Contoh: Mataram Community Website"
        />
      </div>

      {/* Content / Description */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Deskripsi Proyek
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          maxLength={5000}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Ceritakan tentang proyek Anda..."
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Minimal 3 karakter. Gunakan Markdown untuk formatting.
        </p>
      </div>

      {/* GitHub URL */}
      <div>
        <label
          htmlFor="githubUrl"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          URL GitHub
        </label>
        <input
          type="url"
          id="githubUrl"
          name="githubUrl"
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="https://github.com/username/repo"
        />
      </div>

      {/* Demo URL */}
      <div>
        <label
          htmlFor="demoUrl"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          URL Demo
        </label>
        <input
          type="url"
          id="demoUrl"
          name="demoUrl"
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="https://demo.example.com"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Gambar Proyek
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

      {/* Stack Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Stack Teknologi <span className="text-red-500">*</span>
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Pilih minimal 1 stack yang digunakan dalam proyek.
        </p>
        {stacks.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Memuat stack...
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {stacks.map((stack) => {
              const isSelected = selectedStacks.includes(stack.id);
              return (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => toggleStack(stack.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {stack.name}
                </button>
              );
            })}
          </div>
        )}
        {/* Hidden inputs for form submission */}
        {selectedStacks.map((stackId) => (
          <input key={stackId} type="hidden" name="stackIds" value={stackId} />
        ))}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || selectedStacks.length === 0}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Mengirim..." : "Kirim Proyek"}
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Proyek akan diverifikasi oleh admin sebelum tampil.
        </p>
      </div>
    </form>
  );
}
