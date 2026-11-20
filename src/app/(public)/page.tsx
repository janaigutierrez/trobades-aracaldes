import Link from "next/link";
import { Hero, Panell } from "@/components/Hero";
import { TrobadaCard } from "@/components/TrobadaCard";
import { getHistorial, getProperes } from "@/lib/data";

export default async function Home() {
  const [properes, historial] = await Promise.all([getProperes(), getHistorial()]);
  return (
    <>
      <Hero
        etiqueta="araCaldes"
        titol="Trobades obertes"
        subtitol="Xerrades divulgatives i trobades de barris per parlar de Caldes amb qui hi viu. Inscriu-t'hi, segueix-les en directe o envia'ns la teva pregunta."
      />
      <Panell>
        <section aria-labelledby="properes">
          <h2 id="properes" className="text-center text-3xl">Properes trobades</h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-corall" aria-hidden />
          {properes.length === 0 ? (
            <p className="mt-10 text-center text-tinta-suau">Ara mateix no hi ha cap trobada programada. Torna-hi aviat!</p>
          ) : (
            <div className="mt-6 divide-y divide-tinta/10">{properes.map((t) => <TrobadaCard key={t.id} t={t} />)}</div>
          )}
        </section>

        {historial.length > 0 && (
          <section aria-labelledby="anteriors" className="mt-14 rounded-panell bg-fons/50 p-6 sm:p-10">
            <h2 id="anteriors" className="text-2xl">Trobades anteriors</h2>
            <ul className="mt-4 space-y-2">
              {historial.slice(0, 3).map((t) => (
                <li key={t.id}><Link href={`/trobades/${t.slug}`} className="text-corall-fort hover:underline">{t.titol}</Link></li>
              ))}
            </ul>
            <Link href="/historial" className="btn-secundari mt-6">Tot l&apos;historial</Link>
          </section>
        )}
      </Panell>
    </>
  );
}
