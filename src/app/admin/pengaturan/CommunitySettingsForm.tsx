"use client";

import { useActionState } from "react";
import { updateCommunitySettings } from "@/lib/actions/community";
import type { ActionResult } from "@/types";

interface CommunitySettingsFormProps {
  initialData: {
    name: string;
    description: string;
    keywords: string;
    address: string;
    mapsLocation: string;
  };
}

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function CommunitySettingsForm({
  initialData,
}: CommunitySettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCommunitySettings,
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
          Pengaturan berhasil disimpan!
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nama Komunitas
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData.name}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData.description}
            placeholder="Tentang komunitas ini..."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Keywords (SEO)
          </label>
          <input
            id="keywords"
            name="keywords"
            type="text"
            defaultValue={initialData.keywords}
            placeholder="developer, mataram, ntb, komunitas"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pisahkan dengan koma.
          </p>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Alamat
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={initialData.address}
            placeholder="Kota Mataram, NTB"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="mapsLocation"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Lokasi Google Maps (URL embed)
          </label>
          <input
            id="mapsLocation"
            name="mapsLocation"
            type="url"
            defaultValue={initialData.mapsLocation}
            placeholder="https://www.google.com/maps/embed?..."
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            {pending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
