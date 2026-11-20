export type TrobadaTipus = "xerrada" | "barris";
export type TrobadaEstat = "esborrany" | "propera" | "celebrada" | "cancellada";
export type Modalitat = "presencial" | "virtual";
export type AportacioTipus = "pregunta" | "proposta" | "aportacio";
export type AportacioEstat = "pendent" | "aprovada" | "descartada" | "llegida";

export type Trobada = {
  id: string;
  slug: string;
  tipus: TrobadaTipus;
  estat: TrobadaEstat;
  titol: string;
  descripcio: string;
  ponent: string | null;
  coorganitzador: string | null;
  barri: string | null;
  inici: string;
  fi: string | null;
  lloc: string;
  adreca: string | null;
  imatge_url: string | null;
  aforament: number | null;
  inscripcions_obertes: boolean;
  aportacions_obertes: boolean;
  emissio_url: string | null;
  emissio_alt_url: string | null;
  resum: string | null;
  conclusions: string | null;
  enllac_web: string | null;
  assistents_presencials: number | null;
  assistents_virtuals: number | null;
  publicar_assistents: boolean;
  created_at: string;
  updated_at: string;
};

export type Inscripcio = {
  id: string;
  trobada_id: string;
  nom: string;
  email: string | null;
  modalitat: Modalitat;
  created_at: string;
};

export type Aportacio = {
  id: string;
  trobada_id: string;
  tipus: AportacioTipus;
  text: string;
  nom: string | null;
  estat: AportacioEstat;
  ordre_lectura: number | null;
  created_at: string;
};

export type ActionState = { ok: boolean; message: string } | null;

export const TIPUS_LABEL: Record<TrobadaTipus, string> = {
  xerrada: "Xerrada divulgativa",
  barris: "Trobada de barris",
};
export const ESTAT_LABEL: Record<TrobadaEstat, string> = {
  esborrany: "Esborrany",
  propera: "Propera",
  celebrada: "Celebrada",
  cancellada: "Cancel·lada",
};
export const APORTACIO_LABEL: Record<AportacioTipus, string> = {
  pregunta: "Pregunta",
  proposta: "Proposta",
  aportacio: "Aportació",
};
export const APORTACIO_ESTAT_LABEL: Record<AportacioEstat, string> = {
  pendent: "Pendent",
  aprovada: "Per llegir",
  descartada: "Descartada",
  llegida: "Llegida",
};
