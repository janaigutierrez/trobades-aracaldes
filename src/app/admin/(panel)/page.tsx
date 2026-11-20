import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dataCurta } from "@/lib/format";
import { ESTAT_LABEL, TIPUS_LABEL, type Trobada } from "@/lib/types";
import { EstatBadge } from "./components";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [{ data: trobades }, { data: ins }, { data: apo }] = await Promise.all([
    supabase.from("trobades").select("*").order("inici", { ascending: false }),
    supabase.from("inscripcions").select("trobada_id, modalitat"),
    supabase.from("aportacions").select("trobada_id, estat"),
  ]);
  const compta = (id: string) => ({
    pres: ins?.filter((i) => i.trobada_id === id && i.modalitat === "presencial").length ?? 0,
    virt: ins?.filter((i) => i.trobada_id === id && i.modalitat === "virtual").length ?? 0,
    pend: apo?.filter((a) => a.trobada_id === id && a.estat === "pendent").length ?? 0,
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl">Trobades</h1>
        <Link href="/admin/trobades/nova" className="btn-primari">+ Nova trobada</Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-panell bg-white shadow">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-tinta/10 text-xs uppercase text-tinta-suau">
            <tr><th className="p-4">Trobada</th><th className="p-4">Data</th><th className="p-4">Estat</th><th className="p-4">Inscripcions</th><th className="p-4">Aportacions</th></tr>
          </thead>
          <tbody>
            {(trobades as Trobada[] | null)?.map((t) => {
              const c = compta(t.id);
              return (
                <tr key={t.id} className="border-b border-tinta/5 last:border-0 hover:bg-fons/40">
                  <td className="p-4">
                    <Link href={`/admin/trobades/${t.id}`} className="font-medium text-tinta hover:text-corall-fort">{t.titol}</Link>
                    <span className="block text-xs text-tinta-suau">{TIPUS_LABEL[t.tipus]}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{dataCurta(t.inici)}</td>
                  <td className="p-4"><EstatBadge estat={t.estat} label={ESTAT_LABEL[t.estat]} /></td>
                  <td className="p-4"><Link href={`/admin/trobades/${t.id}/inscripcions`} className="hover:underline">{c.pres} pres. · {c.virt} en línia</Link></td>
                  <td className="p-4">
                    <Link href={`/admin/trobades/${t.id}/aportacions`} className="hover:underline">
                      {c.pend > 0 ? <span className="font-medium text-corall-fort">{c.pend} per moderar</span> : "Veure"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!trobades?.length && <p className="p-6 text-tinta-suau">Encara no hi ha cap trobada.</p>}
      </div>
    </>
  );
}
