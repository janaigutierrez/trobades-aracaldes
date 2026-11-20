import type { Metadata } from "next";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-slab/700.css";
import "./globals.css";
import { IS_DEMO, SITE } from "@/lib/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "araCaldes · Trobades obertes", locale: "ca_ES", type: "website" },
  title: { default: SITE.titol, template: `%s · ${SITE.nom}` },
  description: "Trobades obertes amb la ciutadania de Caldes de Montbui: inscripcions, participació i historial.",
  robots: IS_DEMO ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca">
      <body className="min-h-screen">
        {IS_DEMO && (
          <div className="bg-peu py-1.5 text-center text-xs font-medium uppercase tracking-widest text-white">
            Versió demo · dades fictícies
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
