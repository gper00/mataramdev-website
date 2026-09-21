import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  PROJECT_STATUSES,
  projectStatusBadgeClasses,
  projectStatusLabel,
  type ProjectStatus,
} from "@/lib/projectStatus";
import ModerationButtons from "./ModerationButtons";

export const metadata = {
  title: "Moderasi Proyek — Admin",
};

interface ModerationRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  content: string | null;
  status: string;
  created_at: string;
  project_stacks: { stacks: { name: string }[] | null }[] | null;
  project_contributors:
    | { users: { fullname: string | null; username: string | null }[] | null }[]
    | null;
}

interface AdminProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const params = await searchParams;
  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: ProjectStatus | "all" =
    requested === "all" || (requested && PROJECT_STATUSES.includes(requested as ProjectStatus))
      ? (requested as ProjectStatus | "all")
      : "pending";

  const supabase = await createClient();

  // Counts per status — same table, only the two columns we need.
  const { data: statusRows, error: countError } = await supabase
    .from("projects")
    .select("id, status");

  if (countError) {
    throw new Error(`Gagal mengambil data proyek: ${countError.message}`);
  }

  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  for (const row of statusRows || []) {
    counts.all += 1;
    if (PROJECT_STATUSES.includes(row.status as ProjectStatus)) {
      counts[row.status as ProjectStatus] += 1;
    }
  }

  let query = supabase
    .from("projects")
    .select(
      "id, slug, name, image_url, content, status, created_at, project_stacks(stacks(name)), project_contributors(users(fullname, username))"
    )
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  const projects = (data || []) as unknown as ModerationRow[];

  const tabs: { key: ProjectStatus | "all"; label: string }[] = [
    { key: "pending", label: "Menunggu Review" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
    { key: "all", label: "Semua" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Moderasi Proyek
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {counts.pending > 0
            ? `${counts.pending} proyek menunggu review.`
            : "Tidak ada proyek yang menunggu review."}
        </p>
      </div>

      {/* Status filter */}
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/proyek?status=${tab.key}`}
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

      {projects.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            {activeFilter === "pending"
              ? "Tidak ada proyek yang menunggu review."
              : activeFilter === "all"
                ? "Belum ada proyek yang disubmit."
                : `Belum ada proyek berstatus "${projectStatusLabel(activeFilter)}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const stackNames =
              project.project_stacks
                ?.flatMap((ps) => ps.stacks?.[0]?.name ?? [])
                .filter(Boolean) || [];

            const contributors =
              project.project_contributors
                ?.flatMap((pc) => pc.users?.[0] ?? [])
                .filter(Boolean) || [];

            const submitter =
              contributors[0]?.fullname ||
              (contributors[0]?.username
                ? `@${contributors[0].username}`
                : "Tidak diketahui");

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
                    <Link
                      href={`/proyek/${project.slug}`}
                      className="truncate text-sm font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
                    >
                      {project.name}
                    </Link>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusBadgeClasses(project.status)}`}
                    >
                      {projectStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Dikirim oleh {submitter} • {formatDate(project.created_at)}
                    {contributors.length > 0 &&
                      ` • ${contributors.length} contributor`}
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
                </div>

                <div className="shrink-0">
                  <ModerationButtons
                    projectId={project.id}
                    status={project.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
