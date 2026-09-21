import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  eventStatusBadgeClasses,
  eventStatusLabel,
  isEventStatus,
  type EventStatus,
} from "@/lib/eventStatus";

export const metadata = {
  title: "Event — Mataram Dev",
  description:
    "Workshop, sharing session, dan kopdar komunitas developer & designer Mataram.",
};

interface EventListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const STATUS_FILTERS: { label: string; value: EventStatus | null }[] = [
  { label: "Semua", value: null },
  ...EVENT_STATUSES.map((status) => ({
    label: EVENT_STATUS_LABELS[status],
    value: status,
  })),
];

export default async function EventListPage({
  searchParams,
}: EventListPageProps) {
  const params = await searchParams;
  const statusParam =
    typeof params.status === "string" ? params.status : undefined;
  const activeStatus = isEventStatus(statusParam) ? statusParam : null;

  const supabase = await createClient();

  const query = supabase
    .from("events")
    .select(
      "id, slug, title, excerpt, image_url, status, start_time, location_name",
    )
    .order("start_time", { ascending: true, nullsFirst: false });

  const { data: events, error } = activeStatus
    ? await query.eq("status", activeStatus)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data event: ${error.message}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Event Komunitas
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Workshop, sharing session, dan kopdar dari developer &amp; designer
          Mataram.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeStatus === filter.value;

          return (
            <Link
              key={filter.label}
              href={filter.value ? `/event?status=${filter.value}` : "/event"}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {!events || events.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {activeStatus
              ? `Belum ada event dengan status "${eventStatusLabel(activeStatus)}".`
              : "Belum ada event. Pantau terus ya!"}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/event/${event.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
              >
                {event.image_url ? (
                  <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-zinc-100 text-3xl dark:bg-zinc-800">
                    📅
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${eventStatusBadgeClasses(
                      event.status,
                    )}`}
                  >
                    {eventStatusLabel(event.status)}
                  </span>

                  <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                    {event.title}
                  </h2>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {event.start_time
                      ? formatDateTime(event.start_time)
                      : "Waktu belum ditentukan"}
                    {event.location_name && ` • ${event.location_name}`}
                  </p>

                  {event.excerpt && (
                    <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {event.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
