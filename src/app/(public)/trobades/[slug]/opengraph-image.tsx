import { createClient } from "@supabase/supabase-js";
import { ogImage, OG_SIZE } from "@/lib/og";
import { dataLlarga, hora } from "@/lib/format";
import { TIPUS_LABEL, type Trobada } from "@/lib/types";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Trobada oberta d'araCaldes";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Lectura pública sense cookies: RLS només deixa veure trobades publicades
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data } = await supabase.from("trobades").select("*").eq("slug", slug).maybeSingle();
  const t = data as Trobada | null;
  if (!t) return ogImage({ etiqueta: "araCaldes", titol: "Trobades obertes" });

  const data_ = dataLlarga(t.inici);
  return ogImage({
    etiqueta: `${TIPUS_LABEL[t.tipus]}${t.barri ? ` · ${t.barri}` : ""}${t.estat === "celebrada" ? " · Resum" : ""}`,
    titol: t.titol,
    linia: `${data_.charAt(0).toUpperCase()}${data_.slice(1)} · ${hora(t.inici)} h · ${t.lloc}`,
    imatge: t.imatge_url,
  });
}
