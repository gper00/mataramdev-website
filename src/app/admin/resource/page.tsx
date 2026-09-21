import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { RESOURCE_CATEGORIES, resourceCategoryLabel } from "@/lib/resourceCategory";
import ResourceForm from "./ResourceForm";
import ResourceRow from "./ResourceRow";

export const metadata = {
  title: "Resource — Admin",
};

interface ResourceRowData {
  id: string;
  name: string;
  file_url: string;
  icon: string | null;
  category: string;
  download_count: number | null;
  created_at: string;
}

export default async function AdminResourcesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("free_resources")
    .select("id, name, file_url, icon, category, download_count, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data resource: ${error.message}`);
  }

  const resources = (data || []) as unknown as ResourceRowData[];
  const totalDownloads = resources.reduce(
    (sum, resource) => sum + (resource.download_count ?? 0),
    0
  );

  const perCategory = RESOURCE_CATEGORIES.map((category) => ({
    category,
    count: resources.filter((resource) => resource.category === category).length,
  })).filter((entry) => entry.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resource
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {resources.length === 0
            ? "Belum ada resource. Unggah file pertama lewat form di bawah."
            : `${resources.length} resource terunggah, total ${totalDownloads} unduhan${
                perCategory.length > 0
                  ? ` — ${perCategory
                      .map(
                        (entry) =>
                          `${resourceCategoryLabel(entry.category)} ${entry.count}`
                      )
                      .join(", ")}`
                  : ""
              }.`}
        </p>
      </div>

      <ResourceForm />

      {resources.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Resource yang diunggah langsung muncul di halaman publik{" "}
            <span className="font-medium">/resource</span> dan bisa difilter
            berdasarkan kategori.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => (
            <ResourceRow
              key={resource.id}
              id={resource.id}
              name={resource.name}
              category={resource.category}
              icon={resource.icon}
              downloadCount={resource.download_count ?? 0}
              createdAt={formatDate(resource.created_at)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
