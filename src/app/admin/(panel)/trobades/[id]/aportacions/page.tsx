import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { dataCurta } from "@/lib/format";
import { APORTACIO_ESTAT_LABEL, APORTACIO_LABEL, type Aportacio, type AportacioEstat } from "@/lib/types";
import { moderar, moure } from "../../../../actions";
import { TrobadaTabs } from "../../../components";

const ORDRE: AportacioEstat[] = ["pendent", "aprovada", "llegida", "descartada"];

export default async function Aportacions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: t }, { data }] = await Promise.all([
    supabase.from("trobades").select("titol").eq("id", id).maybeSingle(),
    supabase.from("aportacions").select("*").eq("trobada_id", id).order("ordre_lectura", { ascending: true, nullsFirst: false }).order("created_at"),
  ]);
  if (!t) notFound();
  const totes = (data ?? []) as Aportacio[];

  return (
    <>
      <Link href="/admin" className="text-sm text-tinta-suau hover:text-tinta">← Totes les trobades</Link>
      <h1 className="mt-2 text-2xl">{t.titol}</h1>
      <TrobadaTabs id={id} actiu="aportacions" />
      <div className="mt-6 flex justify-end">
        <Link href={`/admin/lectura/${id}`} className="btn-fosc">Obrir mode lectura ↗</Link>
      </div>

      {ORDRE.map((estat) => {
        const grup = totes.filter((a) => a.estat === estat);
        return (
          <section key={estat} className="mt-8" aria-labelledby={`h-${estat}`}>
            <h2 id={`h-${estat}`} className="text-lg">{APORTACIO_ESTAT_LABEL[estat]} <span className="font-sans text-sm font-normal text-tinta-suau">({grup.length})</span></h2>
            {grup.length === 0 ? <p className="mt-2 text-sm text-tinta-suau">Cap.</p> : (
              <ul className="mt-3 space-y-3">
                {grup.map((a, idx) => (
                  <li key={a.id} className={`rounded-panell bg-white p-5 shadow ${estat === "descartada" ? "opacity-60" : ""}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-tinta-suau">
                      <span className="etiqueta">{estat === "aprovada" ? `#${idx + 1} · ` : ""}{APORTACIO_LABEL[a.tipus]}</span>
                      <span>{a.nom ?? "Anònim"} · {dataCurta(a.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-tinta">{a.text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {estat !== "aprovada" && estat !== "llegida" && (
                        <form action={moderar.bind(null, id, a.id, "aprovada")}><button className="btn-primari !px-3 !py-1.5 !text-xs">Seleccionar per llegir</button></form>
                      )}
                      {estat === "aprovada" && (
                        <>
                          <form action={moure.bind(null, id, a.id, -1)}><button className="btn-secundari !px-3 !py-1.5 !text-xs" aria-label="Pujar">↑</button></form>
                          <form action={moure.bind(null, id, a.id, 1)}><button className="btn-secundari !px-3 !py-1.5 !text-xs" aria-label="Baixar">↓</button></form>
                          <form action={moderar.bind(null, id, a.id, "llegida")}><button className="btn-secundari !px-3 !py-1.5 !text-xs">Marcar llegida</button></form>
                        </>
                      )}
                      {estat !== "descartada" && (
                        <form action={moderar.bind(null, id, a.id, "descartada")}><button className="btn-secundari !px-3 !py-1.5 !text-xs">Descartar</button></form>
                      )}
                      {estat !== "pendent" && (
                        <form action={moderar.bind(null, id, a.id, "pendent")}><button className="btn-secundari !px-3 !py-1.5 !text-xs">Tornar a pendent</button></form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
