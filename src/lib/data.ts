import "server-only";
import { createClient } from "./supabase/server";
import type { Trobada } from "./types";

// Lectures públiques: client amb clau pública, RLS amaga els esborranys.

export async function getProperes(): Promise<Trobada[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trobades").select("*").eq("estat", "propera").order("inici", { ascending: true });
  if (error) throw error;
  return data as Trobada[];
}

export async function getHistorial(): Promise<Trobada[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trobades").select("*").eq("estat", "celebrada").order("inici", { ascending: false });
  if (error) throw error;
  return data as Trobada[];
}

export async function getTrobada(slug: string): Promise<Trobada | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trobades").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Trobada | null;
}

export async function getPlaces(id: string): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("places_disponibles", { p_trobada: id });
  return (data as number | null) ?? null;
}
