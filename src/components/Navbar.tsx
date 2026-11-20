import Link from "next/link";
import { SITE } from "@/lib/config";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-nav">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Navegació principal">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logo} alt="araCaldes" className="h-10 w-auto" />
          <span className="hidden text-sm text-nav sm:inline">Trobades obertes</span>
        </Link>
        <ul className="flex items-center gap-1 text-[15px] text-nav sm:gap-4">
          <li><Link href="/" className="rounded px-2 py-1 hover:text-tinta">Properes</Link></li>
          <li><Link href="/historial" className="rounded px-2 py-1 hover:text-tinta">Historial</Link></li>
          <li className="hidden sm:block">
            <a href={SITE.webPrincipal} className="rounded px-2 py-1 hover:text-tinta">aracaldes.cat ↗</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
