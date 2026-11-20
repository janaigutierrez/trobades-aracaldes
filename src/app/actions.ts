"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { verificarCaptcha } from "@/lib/turnstile";
import { limitar } from "@/lib/ratelimit";
import type { ActionState } from "@/lib/types";

async function getIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
}

const inscripcioSchema = z.object({
  trobada_id: z.string().uuid(),
  slug: z.string(),
  nom: z.string().trim().min(2, "Escriu el teu nom (mínim 2 caràcters).").max(80),
  email: z.union([z.literal(""), z.string().trim().email("L'adreça electrònica no és vàlida.").max(200)]),
  modalitat: z.enum(["presencial", "virtual"], { message: "Tria com hi participaràs." }),
  consentiment: z.literal("on", { message: "Cal que acceptis la informació de privadesa." }),
  web: z.literal("", { message: "No s'ha pogut enviar el formulari." }), // camp parany anti-bots (ha d'arribar buit)
});

export async function inscriure(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = inscripcioSchema.safeParse({
    trobada_id: formData.get("trobada_id"),
    slug: formData.get("slug"),
    nom: formData.get("nom"),
    email: formData.get("email") ?? "",
    modalitat: formData.get("modalitat"),
    consentiment: formData.get("consentiment"),
    web: formData.get("web") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ip = await getIp();
  if (!limitar(`ins:${ip}`, 5)) return { ok: false, message: "Massa intents. Torna-ho a provar d'aquí a uns minuts." };
  if (!(await verificarCaptcha(formData.get("cf-turnstile-response"), ip)))
    return { ok: false, message: "No hem pogut verificar que no ets un robot. Torna-ho a provar." };

  const { trobada_id, nom, email, modalitat, slug } = parsed.data;
  const { error } = await createServiceClient().from("inscripcions").insert({
    trobada_id, nom, email: email || null, modalitat, consentiment: true,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, message: "Aquesta adreça ja està inscrita a la trobada." };
    if (error.message.includes("Aforament complet")) return { ok: false, message: "Ho sentim, l'aforament presencial és complet. Encara t'hi pots apuntar en línia." };
    if (error.message.includes("tancades")) return { ok: false, message: "Les inscripcions d'aquesta trobada estan tancades." };
    console.error("inscriure", error);
    return { ok: false, message: "No s'ha pogut desar la inscripció. Torna-ho a provar." };
  }
  revalidatePath(`/trobades/${slug}`);
  return {
    ok: true,
    message: modalitat === "presencial"
      ? `Gràcies, ${nom}! T'hi esperem.`
      : `Gràcies, ${nom}! El dia de la trobada trobaràs l'emissió en aquesta mateixa pàgina.`,
  };
}

const aportacioSchema = z.object({
  trobada_id: z.string().uuid(),
  tipus: z.enum(["pregunta", "proposta", "aportacio"]),
  text: z.string().trim().min(5, "El text és massa curt.").max(1000, "Màxim 1.000 caràcters."),
  nom: z.string().trim().max(80),
  consentiment: z.literal("on", { message: "Cal que acceptis la informació de privadesa." }),
  web: z.literal("", { message: "No s'ha pogut enviar el formulari." }),
});

export async function aportar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = aportacioSchema.safeParse({
    trobada_id: formData.get("trobada_id"),
    tipus: formData.get("tipus"),
    text: formData.get("text"),
    nom: formData.get("nom") ?? "",
    consentiment: formData.get("consentiment"),
    web: formData.get("web") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ip = await getIp();
  if (!limitar(`apo:${ip}`, 5)) return { ok: false, message: "Massa enviaments seguits. Torna-ho a provar d'aquí a uns minuts." };
  if (!(await verificarCaptcha(formData.get("cf-turnstile-response"), ip)))
    return { ok: false, message: "No hem pogut verificar que no ets un robot. Torna-ho a provar." };

  const { trobada_id, tipus, text, nom } = parsed.data;
  const { error } = await createServiceClient().from("aportacions").insert({
    trobada_id, tipus, text, nom: nom.length >= 2 ? nom : null, consentiment: true,
  });
  if (error) {
    if (error.message.includes("tancades")) return { ok: false, message: "Ja no s'accepten aportacions per a aquesta trobada." };
    console.error("aportar", error);
    return { ok: false, message: "No s'ha pogut enviar. Torna-ho a provar." };
  }
  return { ok: true, message: "Rebut! L'organització revisarà la teva aportació abans de llegir-la." };
}
