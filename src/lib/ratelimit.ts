import "server-only";

/**
 * Límit d'enviaments en memòria (per instància del servidor).
 * Suficient per a la demo. En producció, substituir per Upstash Redis o similar,
 * perquè a Vercel cada instància té la seva memòria.
 */
const hits = new Map<string, number[]>();

export function limitar(clau: string, max = 5, finestraMs = 10 * 60 * 1000) {
  const ara = Date.now();
  const recents = (hits.get(clau) ?? []).filter((t) => ara - t < finestraMs);
  if (recents.length >= max) {
    hits.set(clau, recents);
    return false;
  }
  recents.push(ara);
  hits.set(clau, recents);
  return true;
}
