import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import {
  eventStatusBadgeClasses,
  eventStatusLabel,
} from "@/lib/eventStatus";
import RSVPButton from "./RSVPButton";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(`Gagal mengambil data event: ${error.message}`);
  }

  if (!event) {
    notFound();
  }

  // Fetch RSVP data
  const [
    { count: rsvpCount },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from("event_rsvp")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("status", "going"),
    supabase.auth.getUser(),
  ]);

  // Check if current user has RSVP'd
  let userRsvpStatus: "going" | "cancelled" | null = null;
  if (user) {
    const { data: rsvp } = await supabase
      .from("event_rsvp")
      .select("status")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();
    userRsvpStatus = rsvp?.status ?? null;
  }

  const canRsvp = event.status === "upcoming" || event.status === "ongoing";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/event"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Kembali ke daftar event
      </Link>

      {event.image_url && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mt-8">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${eventStatusBadgeClasses(
            event.status,
          )}`}
        >
          {eventStatusLabel(event.status)}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {event.title}
      </h1>

      {event.excerpt && (
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {event.excerpt}
        </p>
      )}

      <dl className="mt-8 grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">
            Waktu
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
            {event.start_time
              ? formatDateTime(event.start_time)
              : "Belum ditentukan"}
            {event.end_time && ` — ${formatDateTime(event.end_time)}`}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">
            Lokasi
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
            {event.location_name || "Belum ditentukan"}
            {event.location_url && (
              <>
                {" "}
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Lihat peta
                </a>
              </>
            )}
          </dd>
        </div>
      </dl>

      {canRsvp && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Daftar Event
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {event.status === "upcoming"
              ? "Daftar sekarang untuk ikut event ini."
              : "Event sedang berlangsung. Anda masih bisa mendaftar."}
          </p>
          <div className="mt-4">
            <RSVPButton
              eventId={event.id}
              initialJoined={userRsvpStatus === "going"}
              initialCount={rsvpCount ?? 0}
            />
          </div>
        </div>
      )}

      {event.description && (
        <div className="mt-8 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {event.description}
        </div>
      )}
    </article>
  );
}
