"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moderar } from "../../actions";
import { APORTACIO_LABEL, type AportacioTipus } from "@/lib/types";

type Item = { id: string; tipus: AportacioTipus; text: string; nom: string | null };

/** Pantalla per llegir les aportacions seleccionades durant el torn de participació. */
export function Lectura({ trobadaId, titol, items }: { trobadaId: string; titol: string; items: Item[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [pending, start] = useTransition();
  const actual = items[Math.min(i, items.length - 1)];

  // Refresca cada 15 s per incorporar les noves aportacions seleccionades
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(t);
  }, [router]);

  const llegida = () => actual && start(async () => {
    await moderar(trobadaId, actual.id, "llegida");
    router.refresh();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(x + 1, items.length - 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  return (
    <div className="flex min-h-screen flex-col bg-peu text-white">
      <header className="flex items-center justify-between px-6 py-4 text-sm text-white/70">
        <Link href={`/admin/trobades/${trobadaId}/aportacions`} className="hover:text-white">← Moderació</Link>
        <span className="truncate px-4">{titol}</span>
        <span>{items.length ? `${Math.min(i, items.length - 1) + 1} / ${items.length}` : "0 / 0"}</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        {actual ? (
          <figure className="max-w-4xl text-center">
            <p className="mb-6 text-sm uppercase tracking-[0.25em] text-corall">{APORTACIO_LABEL[actual.tipus]}</p>
            <blockquote className="font-slab text-3xl leading-snug sm:text-5xl">«{actual.text}»</blockquote>
            <figcaption className="mt-8 text-xl text-white/70">— {actual.nom ?? "Anònim"}</figcaption>
          </figure>
        ) : (
          <p className="text-2xl text-white/60">No hi ha cap aportació seleccionada per llegir.</p>
        )}
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-3 px-6 py-6">
        <button onClick={() => setI((x) => Math.max(x - 1, 0))} disabled={i === 0} className="btn border border-white/30 text-white disabled:opacity-30">← Anterior</button>
        <button onClick={llegida} disabled={!actual || pending} className="btn-primari">{pending ? "…" : "Marcar llegida i passar"}</button>
        <button onClick={() => setI((x) => Math.min(x + 1, items.length - 1))} disabled={i >= items.length - 1} className="btn border border-white/30 text-white disabled:opacity-30">Següent →</button>
      </footer>
    </div>
  );
}
