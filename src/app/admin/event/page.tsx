import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  eventStatusBadgeClasses,
  eventStatusLabel,
} from "@/lib/eventStatus";
import DeleteEventButton from "./DeleteEventButton";

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kelola Event
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {events?.length || 0} event terdaftar.
          </p>
        </div>
        <Link
          href="/admin/event/baru"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Buat Event
        </Link>
      </div>

      {(!events || events.length === 0) ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Belum ada event. Yuk buat event pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {event.title}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${eventStatusBadgeClasses(event.status)}`}
                  >
                    {eventStatusLabel(event.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(event.start_time)}
                  {event.location_name && ` • ${event.location_name}`}
                </p>
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/event/${event.id}/edit`}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Edit
                </Link>
                <DeleteEventButton eventId={event.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
