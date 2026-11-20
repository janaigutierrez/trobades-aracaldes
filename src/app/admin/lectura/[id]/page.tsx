import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { AportacioTipus } from "@/lib/types";
import { Lectura } from "./Lectura";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mode lectura", robots: { index: false } };

export default async function LecturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: t }, { data }] = await Promise.all([
    supabase.from("trobades").select("titol").eq("id", id).maybeSingle(),
    supabase.rpc("aportacions_per_llegir", { p_trobada: id }),
  ]);
  if (!t) notFound();
  const items = (data ?? []) as { id: string; tipus: AportacioTipus; text: string; nom: string | null }[];
  return <Lectura trobadaId={id} titol={t.titol} items={items} />;
}
