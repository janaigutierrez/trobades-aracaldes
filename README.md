# araCaldes · Plataforma de trobades

Web per gestionar les trobades obertes d'araCaldes (xerrades divulgatives i trobades de barris):
properes trobades, inscripció presencial o en línia, aportacions moderades, emissió en directe,
mode lectura i historial.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (PostgreSQL + Auth) · Vercel.

## Estructura

```
src/app/(public)/        Web pública: /, /trobades/[slug], /historial, /privadesa
src/app/admin/           Panell: login, trobades, inscripcions, aportacions
src/app/admin/lectura/   Mode lectura (pantalla completa per al torn de preguntes)
src/app/actions.ts       Inscripcions i aportacions (captcha + límit + validació)
src/lib/                 Supabase, autenticació, dates (hora de Caldes), tipus
supabase/schema.sql      Taules, regles i RLS
supabase/seed.sql        Dades fictícies per a la demo
supabase/tests/          Proves de seguretat de la BD (Postgres local)
docs/                    Sistema de disseny
```

## Seguretat, en una frase

El públic només **llegeix** trobades publicades. Les inscripcions i aportacions passen pel servidor
(captcha, límit d'enviaments, camp parany i validació) i les desa amb la `service_role`. Les dades
personals només les veuen els usuaris de la taula `admins`. A més, la BD rebutja per si sola
inscripcions a trobades tancades o plenes, sense consentiment o duplicades.

## Posada en marxa

1. **Supabase**: crea un projecte a la **regió UE**. A *SQL Editor* executa `supabase/schema.sql`
   i, per a la demo, `supabase/seed.sql`.
2. **Primer administrador**: a *Authentication → Users → Add user* crea l'usuari (correu i
   contrasenya, amb *Auto Confirm*). Després, a *SQL Editor*:
   ```sql
   insert into admins (user_id, nom)
   select id, 'Janai' from auth.users where email = 'el-teu-correu@exemple.cat';
   ```
3. **Desactiva el registre públic**: *Authentication → Sign In / Providers →* desactiva
   *Allow new users to sign up*. Només entren els usuaris que creïs tu.
4. **Variables d'entorn**: copia `.env.example` a `.env.local` i omple-les.
5. `npm install` i `npm run dev` → http://localhost:3000 (panell: /admin).
6. **Vercel**: importa el repositori, posa les mateixes variables d'entorn i desplega.

## Abans de passar de demo a producció

- [ ] Decisions de la presidència: dades que es recullen, termini de conservació, correus de confirmació.
- [ ] Text de `/privadesa` validat.
- [ ] Turnstile configurat (`TURNSTILE_SECRET_KEY`); sense clau i fora del mode demo, els formularis es rebutgen.
- [ ] Límit d'enviaments persistent (Upstash Redis): l'actual és en memòria per instància.
- [ ] Purga automàtica programada amb `pg_cron` (vegeu `purgar_dades_personals` a `schema.sql`).
- [ ] Pla de Supabase: el gratuït pausa projectes inactius; comprova-ho o programa un ping.
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` i subdomini propi (p. ex. `trobades.aracaldes.cat`).

## Proves

- BD: `bash supabase/tests/run.sh` (necessita Postgres 16 local). 17 proves de RLS i regles.
- Web: `npm run build` (tipus i compilació).
