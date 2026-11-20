import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Hero, Panell } from "@/components/Hero";
import { FormAportacio, FormInscripcio } from "@/components/Formularis";
import { getPlaces, getTrobada } from "@/lib/data";
import { dataLlarga, hora, youtubeEmbed } from "@/lib/format";
import { TIPUS_LABEL } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTrobada((await params).slug);
  if (!t) return {};
  const description = `${dataLlarga(t.inici)}, ${hora(t.inici)} h · ${t.lloc}. ${t.descripcio}`.slice(0, 200);
  return {
    title: t.titol,
    description,
    alternates: { canonical: `/trobades/${t.slug}` },
    openGraph: { title: t.titol, description, url: `/trobades/${t.slug}`, siteName: "araCaldes · Trobades obertes", locale: "ca_ES", type: "website" },
    twitter: { card: "summary_large_image", title: t.titol, description },
  };
}

function Dada({ titol, children }: { titol: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="etiqueta">{titol}</dt>
      <dd className="mt-1 text-tinta">{children}</dd>
    </div>
  );
}

export default async function TrobadaPage({ params }: Props) {
  const t = await getTrobada((await params).slug);
  if (!t) notFound();
  const places = t.estat === "propera" ? await getPlaces(t.id) : null;
  const embed = t.emissio_url ? youtubeEmbed(t.emissio_url) : null;
  const celebrada = t.estat === "celebrada";

  return (
    <>
      <Hero
        etiqueta={`${TIPUS_LABEL[t.tipus]}${t.barri ? ` · ${t.barri}` : ""}`}
        titol={t.titol}
        subtitol={`${dataLlarga(t.inici)} · ${hora(t.inici)} h`}
        imatge={t.imatge_url}
      />
      <Panell>
        {t.estat === "cancellada" && (
          <p className="mb-8 rounded-petit bg-corall-clar p-4 font-medium text-[#8a2626]">Aquesta trobada s&apos;ha cancel·lat.</p>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="text-2xl">{celebrada ? "De què vam parlar" : "Sobre la trobada"}</h2>
            <p className="mt-4 whitespace-pre-line text-tinta-suau">{celebrada && t.resum ? t.resum : t.descripcio}</p>

            {celebrada && t.conclusions && (
              <section className="mt-10">
                <h2 className="text-2xl">Conclusions i propostes</h2>
                <p className="mt-4 whitespace-pre-line border-l-4 border-corall pl-5 text-tinta">{t.conclusions}</p>
              </section>
            )}
            {celebrada && t.enllac_web && (
              <a href={t.enllac_web} className="btn-secundari mt-8">Llegeix la crònica a aracaldes.cat ↗</a>
            )}
          </div>

          <aside className="h-fit rounded-panell bg-fons/50 p-6">
            <dl className="space-y-4">
              <Dada titol="Quan"><span className="first-letter:uppercase">{dataLlarga(t.inici)}</span>, {hora(t.inici)} h{t.fi ? ` – ${hora(t.fi)} h` : ""}</Dada>
              <Dada titol="On">{t.lloc}{t.adreca && <span className="block text-sm text-tinta-suau">{t.adreca}</span>}</Dada>
              {t.ponent && <Dada titol="A càrrec de">{t.ponent}</Dada>}
              {t.coorganitzador && <Dada titol="Coorganitza">{t.coorganitzador}</Dada>}
              {celebrada && t.publicar_assistents && (
                <Dada titol="Participació">
                  {t.assistents_presencials ?? 0} persones presencials{(t.assistents_virtuals ?? 0) > 0 ? ` · ${t.assistents_virtuals} en línia` : ""}
                </Dada>
              )}
            </dl>
            {t.tipus === "xerrada" && (
              <p className="mt-6 border-t border-tinta/10 pt-4 text-xs text-tinta-suau">
                Xerrada de caràcter divulgatiu i no partidista. Les opinions expressades són de les persones ponents.
              </p>
            )}
          </aside>
        </div>

        {t.estat === "propera" && (
          <>
            {t.inscripcions_obertes && (
              <section id="inscripcio" className="mt-14 border-t border-tinta/10 pt-10" aria-labelledby="h-ins">
                <h2 id="h-ins" className="text-2xl">Inscripció</h2>
                <p className="mt-2 text-tinta-suau">L&apos;entrada és lliure. Inscriure&apos;s ens ajuda a preparar l&apos;espai.</p>
                <div className="mt-6 max-w-2xl">
                  <FormInscripcio trobadaId={t.id} slug={t.slug} places={places} permetPresencial={places === null || places > 0} />
                </div>
              </section>
            )}

            {(embed || t.emissio_alt_url) && (
              <section id="directe" className="mt-14 border-t border-tinta/10 pt-10" aria-labelledby="h-dir">
                <h2 id="h-dir" className="text-2xl">En directe</h2>
                {embed && (
                  <div className="mt-6 aspect-video overflow-hidden rounded-petit bg-black shadow-imatge">
                    <iframe src={embed} title={`Emissió en directe: ${t.titol}`} className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                )}
                {t.emissio_alt_url && (
                  <p className="mt-3 text-sm text-tinta-suau">
                    No es veu el vídeo? <a href={t.emissio_alt_url} className="text-corall-fort underline">Obre l&apos;emissió en una altra finestra</a>.
                  </p>
                )}
              </section>
            )}

            {t.aportacions_obertes && (
              <section id="participa" className="mt-14 border-t border-tinta/10 pt-10" aria-labelledby="h-apo">
                <h2 id="h-apo" className="text-2xl">Envia la teva pregunta o proposta</h2>
                <p className="mt-2 text-tinta-suau">Tant si véns com si la segueixes en línia. L&apos;organització les revisa i en llegeix una selecció durant el torn de participació.</p>
                <div className="mt-6 max-w-2xl"><FormAportacio trobadaId={t.id} /></div>
              </section>
            )}
          </>
        )}
      </Panell>
    </>
  );
}
