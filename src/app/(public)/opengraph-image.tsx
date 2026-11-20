import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/jpeg";
export const alt = "Trobades obertes d'araCaldes";
export const dynamic = "force-dynamic";

export default function Image() {
  return ogImage({
    etiqueta: "Caldes de Montbui",
    titol: "Trobades obertes",
    linia: "Xerrades divulgatives i trobades de barris. Inscriu-t'hi i participa-hi.",
  });
}
