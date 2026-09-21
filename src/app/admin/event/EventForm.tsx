"use client";

import { useActionState, useRef, useState } from "react";
import { createEvent, updateEvent } from "@/lib/actions/events";
import type { ActionResult } from "@/types";

interface EventFormData {
  id?: string;
  title: string;
  excerpt: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationUrl: string;
  imageUrl: string;
}

interface EventFormProps {
  initialData?: EventFormData;
}

const defaultData: EventFormData = {
  title: "",
  excerpt: "",
  description: "",
  status: "upcoming",
  startTime: "",
  endTime: "",
  locationName: "",
  locationUrl: "",
  imageUrl: "",
};

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Akan Datang" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function EventForm({ initialData }: EventFormProps) {
  const data = initialData || defaultData;
  const isEdit = !!data.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(data.imageUrl);

  const action = isEdit
    ? (_prev: ActionResult<null>, formData: FormData) =>
        updateEvent(data.id!, _prev, formData)
    : createEvent;

  const [state, formAction, pending] = useActionState(action, initialState);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Judul Event *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={data.title}
            placeholder="Judul event"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Excerpt
          </label>
          <input
            id="excerpt"
            name="excerpt"
            type="text"
            defaultValue={data.excerpt}
            placeholder="Ringkasan singkat event"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Description */}
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
            rows={5}
            defaultValue={data.description}
            placeholder="Deskripsi lengkap event (supports Markdown)"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={data.status}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Waktu Mulai *
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              defaultValue={data.startTime}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Waktu Selesai
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              defaultValue={data.endTime}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="locationName"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nama Lokasi
            </label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              defaultValue={data.locationName}
              placeholder="Contoh: Cafe Kopi Mataram"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label
              htmlFor="locationUrl"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              URL Lokasi (Google Maps)
            </label>
            <input
              id="locationUrl"
              name="locationUrl"
              type="url"
              defaultValue={data.locationUrl}
              placeholder="https://maps.google.com/..."
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Poster Event
          </label>
          <div className="mt-1 flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Pilih Gambar
            </button>
            <input
              ref={fileInputRef}
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {preview && (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <a
            href="/admin/event"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </a>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            {pending
              ? isEdit
                ? "Memperbarui..."
                : "Membuat..."
              : isEdit
                ? "Simpan Perubahan"
                : "Buat Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
