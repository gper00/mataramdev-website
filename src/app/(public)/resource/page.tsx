import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  isResourceCategory,
  resourceCategoryBadgeClasses,
  resourceCategoryLabel,
  resourceIcon,
} from "@/lib/resourceCategory";

export const metadata = {
  title: "Resource Gratis — Mataram Dev",
  description:
    "Kumpulan cheatsheet, template, dan materi belajar gratis dari komunitas Mataram Dev.",
};

interface ResourceListRow {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  download_count: number | null;
}

interface ResourceCenterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResourceCenterPage({
  searchParams,
}: ResourceCenterPageProps) {
  const params = await searchParams;
  const categoryParam =
    typeof params.kategori === "string" ? params.kategori : undefined;
  const activeCategory = isResourceCategory(categoryParam)
    ? categoryParam
    : null;

  const supabase = await createClient();

  const query = supabase
    .from("free_resources")
    .select("id, name, icon, category, download_count")
    .order("created_at", { ascending: false });

  const { data, error } = activeCategory
    ? await query.eq("category", activeCategory)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data resource: ${error.message}`);
  }

  const resources = (data || []) as unknown as ResourceListRow[];

  const filters: { label: string; value: string | null }[] = [
    { label: "Semua", value: null },
    ...RESOURCE_CATEGORIES.map((category) => ({
      label: RESOURCE_CATEGORY_LABELS[category],
      value: category as string,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resource Gratis
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Cheatsheet, template, dan materi belajar yang dibagikan gratis oleh
          anggota komunitas. Unduh langsung tanpa perlu daftar akun.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeCategory === filter.value;

          return (
            <Link
              key={filter.label}
              href={
                filter.value
                  ? `/resource?kategori=${filter.value}`
                  : "/resource"
              }
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

      {resources.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {activeCategory
              ? `Belum ada resource kategori "${resourceCategoryLabel(activeCategory)}".`
              : "Belum ada resource yang dibagikan. Nantikan ya!"}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <li key={resource.id}>
              <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl dark:bg-zinc-800">
                    {resourceIcon(resource.category, resource.icon)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {resource.name}
                    </h2>
                    <span
                      className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resourceCategoryBadgeClasses(resource.category)}`}
                    >
                      {resourceCategoryLabel(resource.category)}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {resource.download_count ?? 0} unduhan
                  </span>
                  <a
                    href={`/resource/${resource.id}/download`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Unduh
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
