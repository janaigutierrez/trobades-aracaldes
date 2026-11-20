import Link from "next/link";
import { TrobadaForm } from "../../TrobadaForm";

export default function Nova() {
  return (
    <>
      <Link href="/admin" className="text-sm text-tinta-suau hover:text-tinta">← Totes les trobades</Link>
      <h1 className="mb-6 mt-2 text-2xl">Nova trobada</h1>
      <p className="mb-6 text-sm text-tinta-suau">Es crea com a <strong>esborrany</strong>: no serà visible fins que la publiquis.</p>
      <TrobadaForm />
    </>
  );
}
