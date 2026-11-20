import Link from "next/link";
import type { TrobadaEstat } from "@/lib/types";

const COLORS: Record<TrobadaEstat, string> = {
  esborrany: "bg-gray-100 text-gray-700",
  propera: "bg-emerald-50 text-emerald-800",
  celebrada: "bg-sky-50 text-sky-800",
  cancellada: "bg-corall-clar text-[#8a2626]",
};

export function EstatBadge({ estat, label }: { estat: TrobadaEstat; label: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[estat]}`}>{label}</span>;
}

export function TrobadaTabs({ id, actiu }: { id: string; actiu: "fitxa" | "inscripcions" | "aportacions" }) {
  const tabs = [
    { k: "fitxa", href: `/admin/trobades/${id}`, label: "Fitxa i estat" },
    { k: "inscripcions", href: `/admin/trobades/${id}/inscripcions`, label: "Inscripcions" },
    { k: "aportacions", href: `/admin/trobades/${id}/aportacions`, label: "Aportacions" },
  ];
  return (
    <nav className="mt-4 flex gap-1 border-b border-tinta/15 text-sm" aria-label="Seccions de la trobada">
      {tabs.map((t) => (
        <Link key={t.k} href={t.href} aria-current={actiu === t.k ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-2 ${actiu === t.k ? "border-corall-fort font-medium text-tinta" : "border-transparent text-tinta-suau hover:text-tinta"}`}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
