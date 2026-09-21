import { createClient } from "@/lib/supabase/server";
import { sortFaqRows } from "@/lib/faq";
import FaqForm from "./FaqForm";
import FaqRow from "./FaqRow";

export const metadata = {
  title: "FAQ — Admin",
};

interface FaqRowData {
  id: string;
  question: string;
  answer: string;
  order: number | null;
}

export default async function AdminFaqPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, order");

  if (error) {
    throw new Error(`Gagal mengambil data FAQ: ${error.message}`);
  }

  // Same canonical order the public page and the move action use, so the
  // numbers next to the arrows match what visitors actually see.
  const faqItems = sortFaqRows((data || []) as unknown as FaqRowData[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          FAQ
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {faqItems.length === 0
            ? "Belum ada FAQ. Tambahkan pertanyaan pertama lewat form di bawah."
            : `${faqItems.length} pertanyaan, tampil berurutan di halaman publik /faq.`}
        </p>
      </div>

      <FaqForm />

      {faqItems.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Urutan bisa diatur dengan tombol ▲ ▼ di setiap baris setelah ada
            lebih dari satu pertanyaan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <FaqRow
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              position={index}
              total={faqItems.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
