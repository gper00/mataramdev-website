"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/actions/events";

interface DeleteEventButtonProps {
  eventId: string;
}

export default function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Yakin ingin menghapus event ini?")) return;

    startTransition(async () => {
      await deleteEvent(eventId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      {isPending ? "..." : "Hapus"}
    </button>
  );
}
