import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { dataCurta } from "@/lib/format";
import type { Inscripcio } from "@/lib/types";
import { TrobadaTabs } from "../../../components";

export default async function Inscripcions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: t }, { data }] = await Promise.all([
    supabase.from("trobades").select("titol, aforament").eq("id", id).maybeSingle(),
    supabase.from("inscripcions").select("*").eq("trobada_id", id).order("created_at"),
  ]);
  if (!t) notFound();
  const llista = (data ?? []) as Inscripcio[];
  const pres = llista.filter((i) => i.modalitat === "presencial").length;

  return (
    <>
      <Link href="/admin" className="text-sm text-tinta-suau hover:text-tinta">← Totes les trobades</Link>
      <h1 className="mt-2 text-2xl">{t.titol}</h1>
      <TrobadaTabs id={id} actiu="inscripcions" />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-tinta-suau">
          <strong className="text-tinta">{pres}</strong> presencials{t.aforament ? ` de ${t.aforament}` : ""} ·{" "}
          <strong className="text-tinta">{llista.length - pres}</strong> en línia
        </p>
        <a href={`/api/admin/trobades/${id}/csv`} className="btn-secundari">Exportar CSV</a>
      </div>
      <div className="mt-4 overflow-x-auto rounded-panell bg-white shadow">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-tinta/10 text-xs uppercase text-tinta-suau">
            <tr><th className="p-4">Nom</th><th className="p-4">Correu</th><th className="p-4">Modalitat</th><th className="p-4">Data</th></tr>
          </thead>
          <tbody>
            {llista.map((i) => (
              <tr key={i.id} className="border-b border-tinta/5 last:border-0">
                <td className="p-4">{i.nom}</td>
                <td className="p-4 text-tinta-suau">{i.email ?? "—"}</td>
                <td className="p-4">{i.modalitat === "presencial" ? "Presencial" : "En línia"}</td>
                <td className="p-4 whitespace-nowrap text-tinta-suau">{dataCurta(i.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {llista.length === 0 && <p className="p-6 text-tinta-suau">Encara no hi ha cap inscripció.</p>}
      </div>
      <p className="mt-4 text-xs text-tinta-suau">Dades personals: no les comparteixis fora de l&apos;organització. S&apos;esborren automàticament després de la trobada.</p>
    </>
  );
}
