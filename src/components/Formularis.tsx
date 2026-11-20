"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { inscriure, aportar } from "@/app/actions";
import { Turnstile } from "./Turnstile";
import type { ActionState } from "@/lib/types";

function Missatge({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role="status" aria-live="polite"
      className={`mt-4 rounded-petit px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-900" : "bg-corall-clar text-[#8a2626]"}`}>
      {state.message}
    </p>
  );
}

/** Camp ocult anti-bots: les persones no el veuen; si arriba ple, és un bot. */
function Parany() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>No omplis aquest camp <input type="text" name="web" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

function Consentiment({ text }: { text: string }) {
  return (
    <label className="mt-4 flex items-start gap-3 text-sm text-tinta-suau">
      <input type="checkbox" name="consentiment" required className="mt-1 h-4 w-4 accent-corall-fort" />
      <span>{text} <Link href="/privadesa" className="underline">Informació de privadesa</Link>.</span>
    </label>
  );
}

export function FormInscripcio({ trobadaId, slug, places, permetPresencial }: {
  trobadaId: string; slug: string; places: number | null; permetPresencial: boolean;
}) {
  const [state, action, pending] = useActionState(inscriure, null);
  if (state?.ok) return <Missatge state={state} />;
  return (
    <form action={action} className="relative">
      <input type="hidden" name="trobada_id" value={trobadaId} />
      <input type="hidden" name="slug" value={slug} />
      <Parany />
      <fieldset>
        <legend className="label">Com hi participaràs?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer items-start gap-3 rounded-petit border border-tinta/20 p-4 has-[:checked]:border-corall-fort has-[:checked]:bg-corall-clar ${!permetPresencial ? "opacity-50" : ""}`}>
            <input type="radio" name="modalitat" value="presencial" required disabled={!permetPresencial} defaultChecked={permetPresencial} className="mt-1 accent-corall-fort" />
            <span><span className="block font-medium">Hi vindré</span>
              <span className="text-sm text-tinta-suau">{places === null ? "Presencialment" : places > 0 ? `Queden ${places} places` : "Aforament complet"}</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-petit border border-tinta/20 p-4 has-[:checked]:border-corall-fort has-[:checked]:bg-corall-clar">
            <input type="radio" name="modalitat" value="virtual" defaultChecked={!permetPresencial} className="mt-1 accent-corall-fort" />
            <span><span className="block font-medium">La seguiré en línia</span>
              <span className="text-sm text-tinta-suau">Emissió en directe en aquesta pàgina</span></span>
          </label>
        </div>
      </fieldset>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="label">Nom
          <input name="nom" required minLength={2} maxLength={80} autoComplete="name" className="camp" />
        </label>
        <label className="label">Correu electrònic <span className="font-normal text-gris">(opcional)</span>
          <input name="email" type="email" maxLength={200} autoComplete="email" className="camp" />
        </label>
      </div>
      <Consentiment text="Accepto que araCaldes tracti aquestes dades només per gestionar l'assistència a aquesta trobada. S'esborraran un cop celebrada." />
      <Turnstile />
      <button type="submit" disabled={pending} className="btn-primari mt-5">{pending ? "Enviant…" : "Confirmar assistència"}</button>
      <Missatge state={state} />
    </form>
  );
}

export function FormAportacio({ trobadaId }: { trobadaId: string }) {
  const [state, action, pending] = useActionState(aportar, null);
  const [n, setN] = useState(0);
  if (state?.ok) return <Missatge state={state} />;
  return (
    <form action={action} className="relative">
      <input type="hidden" name="trobada_id" value={trobadaId} />
      <Parany />
      <label className="label">Tipus
        <select name="tipus" className="camp" defaultValue="pregunta">
          <option value="pregunta">Pregunta</option>
          <option value="proposta">Proposta</option>
          <option value="aportacio">Aportació o comentari</option>
        </select>
      </label>
      <label className="label mt-4">El teu missatge
        <textarea name="text" required minLength={5} maxLength={1000} rows={5} className="camp"
          onChange={(e) => setN(e.target.value.length)} />
        <span className="mt-1 block text-right text-xs text-gris">{n}/1000</span>
      </label>
      <label className="label">Nom <span className="font-normal text-gris">(opcional: si el deixes buit, es llegirà de forma anònima)</span>
        <input name="nom" maxLength={80} autoComplete="name" className="camp" />
      </label>
      <Consentiment text="Accepto que l'organització revisi el missatge i el pugui llegir en públic durant la trobada." />
      <Turnstile />
      <button type="submit" disabled={pending} className="btn-primari mt-5">{pending ? "Enviant…" : "Enviar"}</button>
      <Missatge state={state} />
    </form>
  );
}
