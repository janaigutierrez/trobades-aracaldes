import Link from "next/link";
import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-peu text-sm text-gris">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} araCaldes · Caldes de Montbui</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><a href={SITE.webPrincipal} className="hover:text-white">aracaldes.cat</a></li>
          <li><a href={SITE.conferencies} className="hover:text-white">Conferències divulgatives</a></li>
          <li><Link href="/privadesa" className="hover:text-white">Privadesa</Link></li>
          <li><Link href="/admin" className="hover:text-white">Accés organització</Link></li>
        </ul>
      </div>
    </footer>
  );
}
