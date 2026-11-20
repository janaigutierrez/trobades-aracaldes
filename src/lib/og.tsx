import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { SITE } from "./config";

export const OG_SIZE = { width: 1200, height: 630 };

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/RobotoSlab-Bold.woff")),
  readFile(join(process.cwd(), "assets/fonts/Roboto-Medium.woff")),
  readFile(join(process.cwd(), "assets/fonts/Roboto-Regular.woff")),
]);

/**
 * Imatge per compartir (WhatsApp, xarxes): foto de Caldes amb overlay,
 * etiqueta, títol, data i lloc. Mateix llenguatge visual que la web.
 */
export async function ogImage({ etiqueta, titol, linia, imatge }: {
  etiqueta: string; titol: string; linia?: string; imatge?: string | null;
}) {
  const [slab, medium, regular] = await fonts;
  const png = await render({ etiqueta, titol, linia, imatge, slab, medium, regular });
  // JPEG comprimit: WhatsApp no mostra la vista prèvia si la imatge és massa pesada (PNG ≈ 1,5 MB)
  const jpeg = await sharp(png).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

async function render({ etiqueta, titol, linia, imatge, slab, medium, regular }: {
  etiqueta: string; titol: string; linia?: string; imatge?: string | null; slab: Buffer; medium: Buffer; regular: Buffer;
}) {
  const mida = titol.length > 60 ? 54 : titol.length > 38 ? 64 : 76;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Roboto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imatge || SITE.fotoPerDefecte} alt="" width={1200} height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.4) 100%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", background: "white", borderRadius: 6, padding: "10px 18px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SITE.logo} alt="" width={96} height={56} style={{ width: 96, height: 56 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div style={{ display: "flex", fontFamily: "Roboto", fontWeight: 500, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#ffb3b3" }}>{etiqueta}</div>
            <div style={{ display: "flex", fontFamily: "Roboto Slab", fontWeight: 700, fontSize: mida, lineHeight: 1.12, color: "white", marginTop: 18 }}>{titol}</div>
            {linia && <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,.92)", marginTop: 22 }}>{linia}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: 64, height: 6, background: "#e85858", marginRight: 20 }} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: "white" }}>Trobades obertes · araCaldes</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Roboto Slab", data: slab, weight: 700, style: "normal" },
        { name: "Roboto", data: medium, weight: 500, style: "normal" },
        { name: "Roboto", data: regular, weight: 400, style: "normal" },
      ],
    },
  ).arrayBuffer().then((b) => Buffer.from(b));
}
