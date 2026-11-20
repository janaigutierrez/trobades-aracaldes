import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Salta al contingut</a>
      <Navbar />
      {children}
      <div className="h-16" />
      <Footer />
    </>
  );
}
