import { Hero, Panell } from "@/components/Hero";
import { TrobadaCard } from "@/components/TrobadaCard";
import { getHistorial } from "@/lib/data";

export const metadata = { title: "Historial" };

export default async function Historial() {
  const trobades = await getHistorial();
  return (
    <>
      <Hero etiqueta="Historial" titol="Trobades celebrades" subtitol="Què hem parlat, quanta gent hi ha participat i quines propostes n'han sortit." />
      <Panell>
        {trobades.length === 0
          ? <p className="text-center text-tinta-suau">Encara no hi ha cap trobada celebrada.</p>
          : <div className="divide-y divide-tinta/10">{trobades.map((t) => <TrobadaCard key={t.id} t={t} />)}</div>}
      </Panell>
    </>
  );
}
