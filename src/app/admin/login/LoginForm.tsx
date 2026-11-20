"use client";
import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="label">Correu electrònic<input name="email" type="email" required autoComplete="username" className="camp" /></label>
      <label className="label">Contrasenya<input name="password" type="password" required autoComplete="current-password" className="camp" /></label>
      {state && !state.ok && <p role="alert" className="text-sm text-[#8a2626]">{state.message}</p>}
      <button className="btn-primari w-full" disabled={pending}>{pending ? "Entrant…" : "Entrar"}</button>
    </form>
  );
}
