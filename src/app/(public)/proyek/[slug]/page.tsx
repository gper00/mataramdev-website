import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch project (only approved)
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, project_stacks(stack_id, stacks(name, id))")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  if (!project) {
    notFound();
  }

  // Fetch contributors with user info
  const { data: contributors } = await supabase
    .from("project_contributors")
    .select("user_id, users(fullname, username, image_url)")
    .eq("project_id", project.id);

  // Extract stacks — Supabase join returns arrays
  const stacks =
    project.project_stacks
      ?.map((ps: { stacks: { name: string; id: string }[] }) => ps.stacks?.[0])
      .filter(Boolean) || [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/proyek"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Kembali ke proyek
      </Link>

      {project.image_url && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image_url}
            alt={project.name}
            className="w-full object-cover"
          />
        </div>
      )}

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {project.name}
      </h1>

      {/* Stacks */}
      {stacks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {stacks.map(
            (stack: { name: string; id: string } | null) =>
              stack && (
                <Link
                  key={stack.id}
                  href={`/proyek?stack=${stack.id}`}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  {stack.name}
                </Link>
              ),
          )}
        </div>
      )}

      {/* Description */}
      {project.content && (
        <div className="mt-8 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {project.content}
        </div>
      )}

      {/* Links */}
      {(project.github_url || project.demo_url) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              📦 Lihat di GitHub
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              🔗 Lihat Demo
            </a>
          )}
        </div>
      )}

      {/* Contributors */}
      {contributors && contributors.length > 0 && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Contributors
          </h2>
          <ul className="mt-4 space-y-3">
            {contributors.map((c: {
              user_id: string;
              users: { fullname?: string | null; username?: string | null; image_url?: string | null }[];
            }) => {
              const user = c.users?.[0];
              return (
                <li key={c.user_id} className="flex items-center gap-3">
                  {user?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image_url}
                      alt={user.fullname || user.username || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {(user?.fullname || user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user?.fullname || "Anonymous"}
                    </p>
                    {user?.username && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
