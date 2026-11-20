import { Hero, Panell } from "@/components/Hero";
import { SITE } from "@/lib/config";

export const metadata = { title: "Privadesa" };

export default function Privadesa() {
  return (
    <>
      <Hero titol="Informació de privadesa" />
      <Panell>
        <div className="prosa mx-auto max-w-3xl text-tinta-suau">
          <p className="rounded-petit bg-corall-clar p-4 text-sm text-[#8a2626]">
            <strong>Text provisional de la demo.</strong> S&apos;ha de validar amb la presidència d&apos;araCaldes abans de recollir dades reals.
          </p>
          <h2 className="mt-8 text-xl">Qui és el responsable?</h2>
          <p>araCaldes, partit municipal de Caldes de Montbui. Consulta la <a className="underline" href={SITE.privadesaWeb}>política de privadesa general</a>.</p>
          <h2 className="mt-8 text-xl">Quines dades recollim i per a què?</h2>
          <p><strong>Inscripcions:</strong> nom, modalitat de participació i, si ho vols, correu electrònic. Només per gestionar l&apos;assistència i l&apos;aforament.</p>
          <p><strong>Aportacions:</strong> el text i, si ho vols, el teu nom. L&apos;organització les revisa i les pot llegir en públic durant la trobada.</p>
          <p>No demanem telèfon, adreça ni cap altra dada.</p>
          <h2 className="mt-8 text-xl">Quant de temps les conservem?</h2>
          <p>Les inscripcions s&apos;esborren automàticament uns dies després de la trobada. Només en conservem el nombre total d&apos;assistents. Les aportacions es conserven sense nom.</p>
          <h2 className="mt-8 text-xl">Qui hi té accés?</h2>
          <p>Només les persones de l&apos;organització autoritzades. No es cedeixen a tercers.</p>
          <h2 className="mt-8 text-xl">Els teus drets</h2>
          <p>Pots demanar l&apos;accés, la rectificació o la supressió de les teves dades escrivint a l&apos;adreça de contacte d&apos;araCaldes.</p>
        </div>
      </Panell>
    </>
  );
}
