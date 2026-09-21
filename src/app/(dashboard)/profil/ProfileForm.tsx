"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { ActionResult } from "@/types";

interface ProfileFormProps {
  initialData: {
    fullname: string;
    username: string;
    bio: string;
    email: string;
  };
}

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Informasi Profil
      </h2>

      {state.success === false && state.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Profil berhasil diperbarui!
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="fullname"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nama Lengkap
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            required
            defaultValue={initialData.fullname}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Username
          </label>
          <div className="mt-1 flex rounded-lg border border-zinc-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-blue-500">
            <span className="flex items-center pl-3 text-sm text-zinc-500 dark:text-zinc-400">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              defaultValue={initialData.username}
              placeholder="username"
              className="block w-full rounded-r-lg border-0 bg-transparent px-1 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Huruf kecil, angka, dan underscore saja.
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled
            defaultValue={initialData.email}
            className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Email tidak dapat diubah dari sini.
          </p>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={initialData.bio}
            placeholder="Ceritakan sedikit tentang diri kamu..."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
