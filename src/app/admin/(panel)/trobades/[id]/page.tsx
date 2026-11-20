import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ESTAT_LABEL, type Trobada } from "@/lib/types";
import { alternar, canviarEstat, eliminarTrobada } from "../../../actions";
import { TrobadaForm } from "../../TrobadaForm";
import { EstatBadge, TrobadaTabs } from "../../components";

export default async function EditarTrobada({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("trobades").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const t = data as Trobada;

  return (
    <>
      <Link href="/admin" className="text-sm text-tinta-suau hover:text-tinta">← Totes les trobades</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl">{t.titol}</h1>
        <EstatBadge estat={t.estat} label={ESTAT_LABEL[t.estat]} />
      </div>
      <TrobadaTabs id={t.id} actiu="fitxa" />

      <section className="mt-6 rounded-panell bg-white p-6 shadow" aria-labelledby="h-estat">
        <h2 id="h-estat" className="text-lg">Estat i participació</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {t.estat === "esborrany" && (
            <form action={canviarEstat.bind(null, t.id, "propera")}><button className="btn-primari">Publicar</button></form>
          )}
          {t.estat === "propera" && (
            <>
              <form action={alternar.bind(null, t.id, "inscripcions_obertes", !t.inscripcions_obertes)}>
                <button className={t.inscripcions_obertes ? "btn-secundari" : "btn-primari"}>
                  {t.inscripcions_obertes ? "Tancar inscripcions" : "Obrir inscripcions"}
                </button>
              </form>
              <form action={alternar.bind(null, t.id, "aportacions_obertes", !t.aportacions_obertes)}>
                <button className={t.aportacions_obertes ? "btn-secundari" : "btn-primari"}>
                  {t.aportacions_obertes ? "Tancar aportacions" : "Obrir aportacions"}
                </button>
              </form>
              <Link href={`/admin/lectura/${t.id}`} className="btn-fosc">Mode lectura ↗</Link>
              <form action={canviarEstat.bind(null, t.id, "celebrada")}><button className="btn-secundari">Marcar com a celebrada</button></form>
              <form action={canviarEstat.bind(null, t.id, "cancellada")}><button className="btn-secundari text-[#8a2626]">Cancel·lar</button></form>
              <form action={canviarEstat.bind(null, t.id, "esborrany")}><button className="btn-secundari">Despublicar</button></form>
            </>
          )}
          {(t.estat === "celebrada" || t.estat === "cancellada") && (
            <form action={canviarEstat.bind(null, t.id, "propera")}><button className="btn-secundari">Tornar a «propera»</button></form>
          )}
          {t.estat === "esborrany" && (
            <form action={eliminarTrobada.bind(null, t.id)}><button className="btn-secundari text-[#8a2626]">Eliminar esborrany</button></form>
          )}
          {t.estat !== "esborrany" && (
            <Link href={`/trobades/${t.slug}`} className="btn-secundari">Veure la pàgina pública ↗</Link>
          )}
        </div>
        <p className="mt-4 text-xs text-tinta-suau">
          En marcar-la com a celebrada es tanquen inscripcions i aportacions i es desa el nombre d&apos;assistents a l&apos;historial.
        </p>
      </section>

      <div className="mt-8"><TrobadaForm t={t} /></div>
    </>
  );
}
