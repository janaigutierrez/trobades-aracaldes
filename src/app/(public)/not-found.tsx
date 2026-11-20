import Link from "next/link";
import { Hero, Panell } from "@/components/Hero";

export default function NotFound() {
  return (
    <>
      <Hero titol="No hem trobat aquesta pàgina" />
      <Panell>
        <p className="text-center"><Link href="/" className="btn-primari">Tornar a les trobades</Link></p>
      </Panell>
    </>
  );
}
