"use client";

import { useActionState } from "react";
import { toggleRsvp } from "@/lib/actions/rsvp";

interface RSVPButtonProps {
  eventId: string;
  initialJoined: boolean;
  initialCount: number;
}

export default function RSVPButton({
  eventId,
  initialJoined,
  initialCount,
}: RSVPButtonProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { joined: boolean; count: number } | null, _formData: FormData) => {
      const result = await toggleRsvp(eventId);
      if (result.success) {
        return result.data;
      }
      // On error, keep previous state
      return _prev ?? { joined: initialJoined, count: initialCount };
    },
    { joined: initialJoined, count: initialCount }
  );

  const isGoing = state?.joined ?? initialJoined;
  const count = state?.count ?? initialCount;

  return (
    <div className="flex items-center gap-4">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
            isGoing
              ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isPending
            ? "Memproses..."
            : isGoing
              ? "Batalkan"
              : "Ikut Event"}
        </button>
      </form>

      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {count === 0
          ? "Belum ada yang daftar"
          : `${count} orang sudah daftar`}
      </span>
    </div>
  );
}
