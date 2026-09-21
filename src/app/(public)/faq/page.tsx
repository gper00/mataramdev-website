import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sortFaqRows } from "@/lib/faq";

export const metadata = {
  title: "FAQ — Mataram Dev",
  description:
    "Pertanyaan yang sering ditanyakan seputar komunitas Mataram Dev.",
};

interface FaqRowData {
  id: string;
  question: string;
  answer: string;
  order: number | null;
}

export default async function FaqPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, order");

  if (error) {
    throw new Error(`Gagal mengambil data FAQ: ${error.message}`);
  }

  const faqItems = sortFaqRows((data || []) as unknown as FaqRowData[]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pertanyaan Umum
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Hal-hal yang paling sering ditanyakan soal komunitas. Kalau
          pertanyaanmu belum ada di sini, tanya langsung di forum komunitas.
        </p>
      </header>

      {faqItems.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Belum ada FAQ yang dipublikasikan. Nantikan ya!
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {faqItems.map((item, index) => (
            <li key={item.id}>
              <details className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-5 text-left [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180 dark:text-zinc-500"
                  >
                    ▾
                  </span>
                </summary>
                <div className="border-t border-zinc-100 px-5 py-4 pl-[3.25rem] dark:border-zinc-800">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.answer}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
        Masih ada pertanyaan?{" "}
        <Link
          href="/event"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Datang ke event terdekat
        </Link>{" "}
        dan tanyakan langsung ke pengurus.
      </p>
    </div>
  );
}
