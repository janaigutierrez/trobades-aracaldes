import { SITE } from "@/lib/config";

/** Capçalera fotogràfica amb overlay al 50 %, com a aracaldes.cat */
export function Hero({ titol, subtitol, imatge, etiqueta }: {
  titol: string; subtitol?: string; imatge?: string | null; etiqueta?: string;
}) {
  return (
    <section
      className="relative flex min-h-[340px] items-center justify-center bg-cover bg-center px-4 pb-24 pt-14 text-center sm:min-h-[400px]"
      style={{ backgroundImage: `url(${imatge || SITE.fotoPerDefecte})` }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative max-w-3xl">
        {etiqueta && <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/85">{etiqueta}</p>}
        <h1 className="text-3xl text-white sm:text-4xl">{titol}</h1>
        {subtitol && <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{subtitol}</p>}
      </div>
    </section>
  );
}

/** Panell blanc elevat que puja per sobre de la foto (.main-raised) */
export function Panell({ children }: { children: React.ReactNode }) {
  return (
    <main id="contingut" className="relative z-10 mx-auto -mt-16 max-w-6xl px-3 sm:px-6">
      <div className="rounded-t-panell bg-white px-5 py-10 shadow-panell sm:px-12 sm:py-14">{children}</div>
    </main>
  );
}
