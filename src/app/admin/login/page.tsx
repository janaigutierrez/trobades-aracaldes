import { LoginForm } from "./LoginForm";
import { SITE } from "@/lib/config";

export const metadata = { title: "Accés", robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${SITE.fotoPerDefecte})` }}>
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative w-full max-w-sm rounded-panell bg-white p-8 shadow-panell">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SITE.logo} alt="araCaldes" className="mx-auto h-14" />
        <h1 className="mt-4 text-center text-xl">Accés de l&apos;organització</h1>
        {error === "no-admin" && <p className="mt-4 rounded-petit bg-corall-clar p-3 text-sm text-[#8a2626]">Aquest usuari no té permisos d&apos;administració.</p>}
        <LoginForm />
      </div>
    </main>
  );
}
