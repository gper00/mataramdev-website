import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("community_settings")
    .select("*")
    .limit(1)
    .single();

  const communityName = settings?.name || "Mataram Dev";
  const communityDesc =
    settings?.description ||
    "Platform komunitas developer & designer Kota Mataram, NTB.";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-4 py-24 dark:from-blue-950/20 dark:to-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {communityName}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {communityDesc}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Bergabung Sekarang
            </Link>
            <Link
              href="/event"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Lihat Event
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Event",
              desc: "Temukan event, workshop, dan sharing session terbaru.",
              href: "/event",
              icon: "📅",
            },
            {
              title: "Proyek",
              desc: "Lihat proyek dan karya dari anggota komunitas.",
              href: "/proyek",
              icon: "🚀",
            },
            {
              title: "Artikel",
              desc: "Baca tutorial, tips, dan cerita dari developer lokal.",
              href: "/artikel",
              icon: "✍️",
            },
            {
              title: "Resource Gratis",
              desc: "Download cheatsheet, template, dan resource bermanfaat.",
              href: "/resource",
              icon: "📦",
            },
            {
              title: "Anggota",
              desc: "Kenali developer dan designer di Mataram.",
              href: "/anggota",
              icon: "👥",
            },
            {
              title: "FAQ",
              desc: "Pertanyaan umum seputar komunitas.",
              href: "/faq",
              icon: "❓",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-zinc-200 p-6 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {settings?.address && (
        <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Lokasi Kami
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {settings.address}
            </p>
            {settings.maps_location && (
              <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <iframe
                  src={settings.maps_location}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
