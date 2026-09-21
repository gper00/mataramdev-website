import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  PROJECT_STATUSES,
  projectStatusBadgeClasses,
  projectStatusLabel,
  type ProjectStatus,
} from "@/lib/projectStatus";

export const metadata = {
  title: "Proyek Saya — Mataram Dev",
  description: "Status review proyek yang kamu kirim ke komunitas.",
};

interface MyProjectRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  content: string | null;
  status: string;
  created_at: string;
  project_stacks: { stacks: { name: string }[] | null }[] | null;
  project_contributors: { user_id: string }[] | null;
}

interface MyProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyProjectsPage({
  searchParams,
}: MyProjectsPageProps) {
  const params = await searchParams;
  const justSubmitted = params.submitted === "1";

  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: ProjectStatus | "all" =
    requested === "all" ||
    (requested && PROJECT_STATUSES.includes(requested as ProjectStatus))
      ? (requested as ProjectStatus | "all")
      : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Projects this user contributed to (the submitter is added automatically).
  const { data: contributions, error: contributionsError } = await supabase
    .from("project_contributors")
    .select("project_id")
    .eq("user_id", user.id);

  if (contributionsError) {
    throw new Error(
      `Gagal mengambil data proyek Anda: ${contributionsError.message}`
    );
  }

  const projectIds = (contributions || []).map((c) => c.project_id);

  let projects: MyProjectRow[] = [];

  if (projectIds.length > 0) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, name, image_url, content, status, created_at, project_stacks(stacks(name)), project_contributors(user_id)"
      )
      .in("id", projectIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Gagal mengambil data proyek Anda: ${error.message}`);
    }

    projects = (data || []) as unknown as MyProjectRow[];
  }

  const counts = { all: projects.length, pending: 0, approved: 0, rejected: 0 };
  for (const project of projects) {
    if (PROJECT_STATUSES.includes(project.status as ProjectStatus)) {
      counts[project.status as ProjectStatus] += 1;
    }
  }

  const visible =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.status === activeFilter);

  const tabs: { key: ProjectStatus | "all"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Menunggu Review" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Proyek Saya
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Status review proyek yang kamu kirim ke komunitas.
          </p>
        </div>
        <Link
          href="/proyek/baru"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Kirim Proyek
        </Link>
      </div>

      {justSubmitted && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Proyek berhasil dikirim!
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Proyek kamu sedang menunggu review admin. Setelah disetujui, proyek
            akan tampil di halaman Proyek komunitas.
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Kamu belum mengirim proyek apa pun.
          </p>
          <Link
            href="/proyek/baru"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kirim Proyek Pertama
          </Link>
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/proyek-saya?status=${tab.key}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === tab.key
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs ${
                    activeFilter === tab.key
                      ? "text-blue-100"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </Link>
            ))}
          </nav>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-500 dark:text-zinc-400">
                {activeFilter === "all"
                  ? "Belum ada proyek."
                  : `Tidak ada proyek berstatus "${projectStatusLabel(activeFilter)}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((project) => {
                const stackNames =
                  project.project_stacks
                    ?.flatMap((ps) => ps.stacks?.[0]?.name ?? [])
                    .filter(Boolean) || [];

                const contributorCount =
                  project.project_contributors?.length ?? 0;

                const isApproved = project.status === "approved";

                return (
                  <div
                    key={project.id}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {project.image_url ? (
                      <div className="hidden h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:block dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image_url}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-2xl sm:flex dark:bg-zinc-800">
                        🚀
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isApproved ? (
                          <Link
                            href={`/proyek/${project.slug}`}
                            className="truncate text-sm font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
                          >
                            {project.name}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {project.name}
                          </span>
                        )}
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusBadgeClasses(project.status)}`}
                        >
                          {projectStatusLabel(project.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Dikirim {formatDate(project.created_at)}
                        {contributorCount > 0 &&
                          ` • ${contributorCount} contributor`}
                      </p>

                      {stackNames.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
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

                      {project.status === "rejected" && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Proyek ini tidak lolos review, jadi tidak tampil di
                          halaman publik. Hubungi admin untuk tahu alasannya.
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <Link
                          href={`/proyek/${project.slug}`}
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Lihat
                        </Link>
                      ) : (
                        <span
                          className="cursor-not-allowed rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                          title="Belum tampil di halaman publik"
                        >
                          Belum publik
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
