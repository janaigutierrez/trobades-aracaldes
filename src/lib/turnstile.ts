import "server-only";
import { IS_DEMO } from "./config";

/** Verifica el captcha de Cloudflare Turnstile. Sense clau configurada (local), no verifica. */
export async function verificarCaptcha(token: FormDataEntryValue | null, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Sense clau: només s'accepta en local o en mode demo (dades fictícies).
    // En producció real, sense clau es rebutja tot (falla tancat).
    return IS_DEMO || process.env.NODE_ENV !== "production";
  }
  if (typeof token !== "string" || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
