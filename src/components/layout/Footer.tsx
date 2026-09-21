import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Mataram<span className="text-blue-600 dark:text-blue-400">Dev</span>
            </Link>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Platform komunitas developer & designer Kota Mataram, NTB.
            </p>
          </div>

          {/* Komunitas */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Komunitas
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Event", href: "/event" },
                { label: "Proyek", href: "/proyek" },
                { label: "Artikel", href: "/artikel" },
                { label: "Anggota", href: "/anggota" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Resources
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/resource"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Resource Gratis
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Lainnya
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Mataram Dev. Dibuat dengan ❤️ di Kota Mataram.
          </p>
        </div>
      </div>
    </footer>
  );
}
