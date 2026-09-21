"use client";

import { useActionState, useState } from "react";
import { addSocialLink, removeSocialLink } from "@/lib/actions/profile";
import type { ActionResult } from "@/types";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface SocialLinksSectionProps {
  initialLinks: SocialLink[];
}

const PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Website / Portfolio" },
];

const addInitialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function SocialLinksSection({
  initialLinks,
}: SocialLinksSectionProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [addState, addFormAction, addPending] = useActionState(
    addSocialLink,
    addInitialState
  );

  const handleRemove = async (linkId: string) => {
    const result = await removeSocialLink(linkId);
    if (result.success) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Tautan Sosial
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Tambahkan tautan ke profil sosial atau website kamu.
      </p>

      {/* Existing Links */}
      {links.length > 0 && (
        <div className="mt-4 space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
            >
              <div className="min-w-0">
                <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  {link.platform}
                </span>
                <p className="truncate text-sm text-zinc-900 dark:text-zinc-50">
                  {link.url}
                </p>
              </div>
              <button
                onClick={() => handleRemove(link.id)}
                className="ml-4 shrink-0 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Link Form */}
      <form action={addFormAction} className="mt-4 space-y-3">
        {addState.success === false && addState.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {addState.error}
          </div>
        )}

        <div className="flex gap-3">
          <select
            name="platform"
            required
            defaultValue=""
            className="w-40 shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="" disabled>
              Platform
            </option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <input
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={addPending}
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addPending ? "..." : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
}
