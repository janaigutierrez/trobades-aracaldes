import Link from "next/link";
import { dataLlarga, diaMes, hora } from "@/lib/format";
import { TIPUS_LABEL, type Trobada } from "@/lib/types";
import { SITE } from "@/lib/config";

export function TrobadaCard({ t }: { t: Trobada }) {
  const { dia, mes } = diaMes(t.inici);
  return (
    <article className="grid gap-6 py-8 sm:grid-cols-[260px_1fr] sm:gap-8">
      <Link href={`/trobades/${t.slug}`} className="relative block aspect-[3/2] overflow-hidden rounded-petit shadow-imatge" tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.imatge_url || SITE.fotoPerDefecte} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-petit bg-white px-3 py-1.5 text-center leading-tight shadow">
          <span className="block font-slab text-xl font-bold text-tinta">{dia}</span>
          <span className="block text-xs uppercase text-corall-fort">{mes}</span>
        </span>
      </Link>
      <div>
        <p className="etiqueta">{TIPUS_LABEL[t.tipus]}{t.barri ? ` · ${t.barri}` : ""}</p>
        <h2 className="mt-2 text-2xl">
          <Link href={`/trobades/${t.slug}`} className="hover:text-corall-fort">{t.titol}</Link>
        </h2>
        <p className="mt-2 text-sm text-tinta-suau">
          <span className="first-letter:uppercase">{dataLlarga(t.inici)}</span> · {hora(t.inici)} h · {t.lloc}
        </p>
        <p className="mt-3 line-clamp-3 text-tinta-suau">{t.descripcio}</p>
        <Link href={`/trobades/${t.slug}`} className="mt-4 inline-block font-medium text-corall-fort hover:underline">
          {t.estat === "celebrada" ? "Veure el resum" : t.inscripcions_obertes ? "Inscriu-t'hi" : "Més informació"} →
        </Link>
      </div>
    </article>
  );
}
