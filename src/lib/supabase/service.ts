import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client amb la service_role. Se salta RLS: NOMÉS per a les insercions públiques
 * (inscripcions i aportacions) després de validar captcha i límit d'enviaments.
 * Mai s'ha d'importar des d'un component de client.
 */
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
