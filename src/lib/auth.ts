import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Comprovació real d'autorització (Data Access Layer).
 * El proxy només fa una comprovació optimista; aquí es verifica
 * l'usuari amb Supabase i que sigui a la taula `admins`.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admins").select("nom").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=no-admin");
  return { supabase, user, nom: admin.nom as string };
}
