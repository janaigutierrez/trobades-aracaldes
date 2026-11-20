"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { localAISO } from "@/lib/format";
import type { ActionState, AportacioEstat, TrobadaEstat } from "@/lib/types";

// ---------- Sessió ----------
export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "Correu o contrasenya incorrectes." };
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Trobades ----------
const opt = z.string().trim().transform((v) => (v === "" ? null : v));
const optUrl = z.string().trim().refine((v) => v === "" || /^https?:\/\//.test(v), "Els enllaços han de començar per https://")
  .transform((v) => (v === "" ? null : v));
const optInt = z.string().trim().transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0), "Ha de ser un número enter");

const trobadaSchema = z.object({
  titol: z.string().trim().min(3, "El títol és massa curt").max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "L'adreça només pot tenir minúscules, números i guions (p. ex. trobada-can-valls)"),
  tipus: z.enum(["xerrada", "barris"]),
  descripcio: z.string().trim().max(5000),
  ponent: opt, coorganitzador: opt, barri: opt,
  inici: z.string().min(16, "Cal indicar la data i l'hora d'inici"),
  fi: z.string(),
  lloc: z.string().trim().min(2, "Cal indicar el lloc"),
  adreca: opt,
  imatge_url: optUrl,
  aforament: optInt,
  emissio_url: optUrl, emissio_alt_url: optUrl,
  resum: opt, conclusions: opt, enllac_web: optUrl,
  assistents_presencials: optInt, assistents_virtuals: optInt,
  publicar_assistents: z.boolean(),
});

export async function guardarTrobada(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const raw = Object.fromEntries(
    Object.keys(trobadaSchema.shape).map((k) => [k, k === "publicar_assistents" ? formData.get(k) === "on" : String(formData.get(k) ?? "")]),
  );
  const parsed = trobadaSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const inici = localAISO(d.inici);
  const fi = d.fi ? localAISO(d.fi) : null;
  if (fi && fi <= inici) return { ok: false, message: "L'hora de finalització ha de ser posterior a la d'inici." };
  const fila = { ...d, inici, fi, slug: d.slug.toLowerCase() };

  const res = id
    ? await supabase.from("trobades").update(fila).eq("id", id).select("id").single()
    : await supabase.from("trobades").insert({ ...fila, estat: "esborrany" }).select("id").single();
  if (res.error) {
    if (res.error.code === "23505") return { ok: false, message: "Ja hi ha una trobada amb aquesta adreça (slug)." };
    console.error(res.error);
    return { ok: false, message: "No s'ha pogut desar." };
  }
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/trobades/${res.data.id}`);
  return { ok: true, message: "Canvis desats." };
}

export async function canviarEstat(id: string, estat: TrobadaEstat) {
  const { supabase } = await requireAdmin();
  if (estat === "celebrada") {
    await supabase.rpc("tancar_trobada", { p_trobada: id });
  } else {
    const extra = estat === "propera" ? {} : { inscripcions_obertes: false, aportacions_obertes: false };
    await supabase.from("trobades").update({ estat, ...extra }).eq("id", id);
  }
  revalidatePath("/", "layout");
}

export async function alternar(id: string, camp: "inscripcions_obertes" | "aportacions_obertes", valor: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("trobades").update({ [camp]: valor }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function eliminarTrobada(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("trobades").delete().eq("id", id).eq("estat", "esborrany");
  revalidatePath("/", "layout");
  redirect("/admin");
}

// ---------- Moderació ----------
export async function moderar(trobadaId: string, aportacioId: string, estat: AportacioEstat) {
  const { supabase, user } = await requireAdmin();
  let ordre: number | null | undefined = undefined;
  if (estat === "aprovada") {
    const { data } = await supabase.from("aportacions").select("ordre_lectura")
      .eq("trobada_id", trobadaId).not("ordre_lectura", "is", null)
      .order("ordre_lectura", { ascending: false }).limit(1).maybeSingle();
    ordre = (data?.ordre_lectura ?? 0) + 1;
  } else if (estat === "pendent" || estat === "descartada") {
    ordre = null;
  }
  await supabase.from("aportacions").update({
    estat, moderada_per: user.id, moderada_at: new Date().toISOString(),
    ...(ordre !== undefined ? { ordre_lectura: ordre } : {}),
  }).eq("id", aportacioId).eq("trobada_id", trobadaId);
  revalidatePath(`/admin/trobades/${trobadaId}/aportacions`);
  revalidatePath(`/admin/lectura/${trobadaId}`);
}

export async function moure(trobadaId: string, aportacioId: string, direccio: -1 | 1) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("aportacions").select("id, ordre_lectura")
    .eq("trobada_id", trobadaId).eq("estat", "aprovada").order("ordre_lectura", { ascending: true });
  const llista = (data ?? []) as { id: string; ordre_lectura: number }[];
  const i = llista.findIndex((a) => a.id === aportacioId);
  const j = i + direccio;
  if (i < 0 || j < 0 || j >= llista.length) return;
  await supabase.from("aportacions").update({ ordre_lectura: llista[j].ordre_lectura }).eq("id", llista[i].id);
  await supabase.from("aportacions").update({ ordre_lectura: llista[i].ordre_lectura }).eq("id", llista[j].id);
  revalidatePath(`/admin/trobades/${trobadaId}/aportacions`);
}
