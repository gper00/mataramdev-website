import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Proyek Komunitas — Mataram Dev",
  description:
    "Lihat proyek dan karya dari developer & designer komunitas Mataram.",
};

interface ProjectListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProjectListPage({
  searchParams,
}: ProjectListPageProps) {
  const params = await searchParams;
  const stackParam =
    typeof params.stack === "string" ? params.stack : undefined;

  const supabase = await createClient();

  // Fetch all stacks (for filter buttons)
  const { data: allStacks } = await supabase
    .from("stacks")
    .select("id, name")
    .order("name");

  // Build project query — only approved projects
  let query = supabase
    .from("projects")
    .select(
      "id, slug, name, image_url, github_url, demo_url, created_at, project_stacks(stack_id, stacks(name))",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Filter by stack if specified
  if (stackParam) {
    query = query.contains("project_stacks.stack_id", [stackParam]);
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  // Fetch contributor counts for all displayed projects
  let contributorCounts: Record<string, number> = {};
  if (projects && projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
    const { data: contribData } = await supabase
      .from("project_contributors")
      .select("project_id")
      .in("project_id", projectIds);

    if (contribData) {
      for (const c of contribData) {
        contributorCounts[c.project_id] =
          (contributorCounts[c.project_id] || 0) + 1;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Proyek Komunitas
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Karya dan proyek dari developer &amp; designer Mataram.
        </p>
      </header>

      {/* Stack filter */}
      {allStacks && allStacks.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/proyek"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !stackParam
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Semua
          </Link>
          {allStacks.map((stack) => (
            <Link
              key={stack.id}
              href={`/proyek?stack=${stack.id}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                stackParam === stack.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {stack.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Project grid */}
      {!projects || projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {stackParam
              ? "Tidak ada proyek dengan stack ini."
              : "Belum ada proyek yang disetujui. Kirim proyek pertama kamu!"}
          </p>
          <Link
            href="/proyek/baru"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kirim Proyek
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            // Extract stack names from the joined data
            const stackNames =
              project.project_stacks
                ?.map((ps: { stacks: { name: string }[] }) => ps.stacks?.[0]?.name)
                .filter(Boolean) || [];

            return (
              <li key={project.id}>
                <Link
                  href={`/proyek/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
                >
                  {project.image_url ? (
                    <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-zinc-100 text-3xl dark:bg-zinc-800">
                      🚀
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                      {project.name}
                    </h2>

                    {/* Stack badges */}
                    {stackNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stackNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {contributorCounts[project.id] && (
                        <span>
                          👥 {contributorCounts[project.id]} contributor
                        </span>
                      )}
                      {project.github_url && (
                        <span>📦 GitHub</span>
                      )}
                      {project.demo_url && (
                        <span>🔗 Demo</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
