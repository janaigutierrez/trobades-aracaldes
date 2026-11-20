import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administració", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { nom } = await requireAdmin();
  return (
    <div className="min-h-screen bg-fons">
      <header className="bg-white shadow-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="araCaldes" className="h-9" />
            <span className="text-sm font-medium text-nav">Administració de trobades</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-nav">
            <Link href="/" className="hidden hover:text-tinta sm:inline">Veure la web ↗</Link>
            <span className="hidden sm:inline">{nom}</span>
            <form action={logout}><button className="hover:text-tinta">Sortir</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
