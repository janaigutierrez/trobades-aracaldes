"use client";

import { useActionState, useState } from "react";
import { guardarTrobada } from "../actions";
import { isoALocal } from "@/lib/format";
import type { Trobada } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/·/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function Camp({ label, ajuda, children }: { label: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="label">
      {label}
      {children}
      {ajuda && <span className="mt-1 block text-xs font-normal text-tinta-suau">{ajuda}</span>}
    </label>
  );
}

export function TrobadaForm({ t }: { t?: Trobada }) {
  const [state, action, pending] = useActionState(guardarTrobada, null);
  const [tipus, setTipus] = useState(t?.tipus ?? "barris");
  const [slug, setSlug] = useState(t?.slug ?? "");
  const [slugTocat, setSlugTocat] = useState(!!t);

  return (
    <form action={action} className="space-y-8">
      {t && <input type="hidden" name="id" value={t.id} />}

      <fieldset className="rounded-panell bg-white p-6 shadow">
        <legend className="px-2 font-slab text-lg font-bold">Informació bàsica</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Camp label="Títol">
              <input name="titol" required defaultValue={t?.titol} className="camp"
                onChange={(e) => { if (!slugTocat) setSlug(slugify(e.target.value)); }} />
            </Camp>
          </div>
          <Camp label="Adreça de la pàgina (slug)" ajuda={`La pàgina serà /trobades/${slug || "…"}`}>
            <input name="slug" required value={slug} className="camp font-mono text-sm"
              onChange={(e) => { setSlug(e.target.value); setSlugTocat(true); }} />
          </Camp>
          <Camp label="Tipus">
            <select name="tipus" value={tipus} onChange={(e) => setTipus(e.target.value as "xerrada" | "barris")} className="camp">
              <option value="barris">Trobada de barris</option>
              <option value="xerrada">Xerrada divulgativa</option>
            </select>
          </Camp>
          {tipus === "barris" ? (
            <Camp label="Barri o urbanització"><input name="barri" defaultValue={t?.barri ?? ""} className="camp" /></Camp>
          ) : (
            <>
              <Camp label="Ponent"><input name="ponent" defaultValue={t?.ponent ?? ""} className="camp" /></Camp>
              <Camp label="Entitat coorganitzadora" ajuda="Recomanat per a les xerrades divulgatives">
                <input name="coorganitzador" defaultValue={t?.coorganitzador ?? ""} className="camp" />
              </Camp>
            </>
          )}
          <div className="sm:col-span-2">
            <Camp label="Descripció"><textarea name="descripcio" rows={5} defaultValue={t?.descripcio} className="camp" /></Camp>
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-panell bg-white p-6 shadow">
        <legend className="px-2 font-slab text-lg font-bold">Quan i on</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Camp label="Inici (hora de Caldes)"><input type="datetime-local" name="inici" required defaultValue={isoALocal(t?.inici)} className="camp" /></Camp>
          <Camp label="Final (opcional)"><input type="datetime-local" name="fi" defaultValue={isoALocal(t?.fi)} className="camp" /></Camp>
          <Camp label="Lloc"><input name="lloc" required defaultValue={t?.lloc} placeholder="Cases dels Mestres" className="camp" /></Camp>
          <Camp label="Adreça (opcional)"><input name="adreca" defaultValue={t?.adreca ?? ""} className="camp" /></Camp>
          <Camp label="Aforament presencial" ajuda="Buit = sense límit"><input type="number" min={1} name="aforament" defaultValue={t?.aforament ?? ""} className="camp" /></Camp>
          <Camp label="Foto de capçalera (URL)" ajuda="Buit = foto per defecte d'araCaldes"><input name="imatge_url" defaultValue={t?.imatge_url ?? ""} className="camp" /></Camp>
        </div>
      </fieldset>

      <fieldset className="rounded-panell bg-white p-6 shadow">
        <legend className="px-2 font-slab text-lg font-bold">Emissió en directe</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Camp label="Enllaç de YouTube" ajuda="Enllaç del directe (youtube.com/live/… o youtu.be/…)"><input name="emissio_url" defaultValue={t?.emissio_url ?? ""} className="camp" /></Camp>
          <Camp label="Enllaç alternatiu" ajuda="Contingència si el vídeo incrustat falla"><input name="emissio_alt_url" defaultValue={t?.emissio_alt_url ?? ""} className="camp" /></Camp>
        </div>
      </fieldset>

      <fieldset className="rounded-panell bg-white p-6 shadow">
        <legend className="px-2 font-slab text-lg font-bold">Historial (després de la trobada)</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Camp label="Resum dels temes tractats"><textarea name="resum" rows={4} defaultValue={t?.resum ?? ""} className="camp" /></Camp></div>
          <div className="sm:col-span-2"><Camp label="Conclusions i propostes" ajuda="Una per línia"><textarea name="conclusions" rows={4} defaultValue={t?.conclusions ?? ""} className="camp" /></Camp></div>
          <Camp label="Enllaç a la crònica d'aracaldes.cat"><input name="enllac_web" defaultValue={t?.enllac_web ?? ""} className="camp" /></Camp>
          <div />
          <Camp label="Assistents presencials" ajuda="S'omple sol en tancar la trobada"><input type="number" min={0} name="assistents_presencials" defaultValue={t?.assistents_presencials ?? ""} className="camp" /></Camp>
          <Camp label="Assistents en línia"><input type="number" min={0} name="assistents_virtuals" defaultValue={t?.assistents_virtuals ?? ""} className="camp" /></Camp>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" name="publicar_assistents" defaultChecked={t?.publicar_assistents} className="h-4 w-4 accent-corall-fort" />
            Publicar el nombre d&apos;assistents a l&apos;historial
          </label>
        </div>
      </fieldset>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-tinta/10 bg-fons/95 py-4 backdrop-blur">
        <button className="btn-primari" disabled={pending}>{pending ? "Desant…" : t ? "Desar canvis" : "Crear trobada"}</button>
        {state && <p role="status" className={`text-sm ${state.ok ? "text-emerald-800" : "text-[#8a2626]"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
