import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";

export const metadata = {
  title: "Kirim Proyek — Mataram Dev",
  description: "Kirim proyek Anda untuk ditampilkan di showcase komunitas.",
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/proyek"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Kembali ke proyek
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Kirim Proyek
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Tunjukkan proyek yang sudah kamu buat ke komunitas. Proyek akan
        diverifikasi oleh admin sebelum tampil.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ProjectForm />
      </div>
    </div>
  );
}
