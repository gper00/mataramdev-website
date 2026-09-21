"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavProps {
  pendingCount: number;
}

export default function AdminNav({ pendingCount }: AdminNavProps) {
  const pathname = usePathname();

  const items = [
    { label: "Event", href: "/admin/event" },
    { label: "Moderasi Proyek", href: "/admin/proyek", badge: pendingCount },
    { label: "Stack", href: "/admin/stack" },
    { label: "Resource", href: "/admin/resource" },
    { label: "FAQ", href: "/admin/faq" },
    { label: "Pengaturan", href: "/admin/pengaturan" },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {item.label}
              {item.badge ? (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
