-- =====================================================================
-- araCaldes · Plataforma de trobades
-- Model de dades per a Supabase (PostgreSQL)
--
-- Principis:
--   1. El públic (rol anon) només pot LLEGIR trobades publicades.
--      Totes les escriptures (inscripcions i aportacions) passen pel
--      servidor (Next.js), que verifica el captcha i el límit d'enviaments
--      i després insereix amb la service_role. Així ningú pot saltar-se el
--      captcha cridant Supabase directament amb la clau pública.
--   2. Només els usuaris de la taula `admins` poden veure dades personals.
--   3. Minimització: email opcional, nom opcional a les aportacions,
--      sense telèfon ni adreça. Les dades personals s'esborren després
--      de la trobada; els recomptes queden a la taula `trobades`.
-- =====================================================================

-- ---------- Tipus ----------------------------------------------------
create type trobada_tipus   as enum ('xerrada', 'barris');
create type trobada_estat   as enum ('esborrany', 'propera', 'celebrada', 'cancellada');
create type modalitat       as enum ('presencial', 'virtual');
create type aportacio_tipus as enum ('pregunta', 'proposta', 'aportacio');
create type aportacio_estat as enum ('pendent', 'aprovada', 'descartada', 'llegida');

-- ---------- Administradors -----------------------------------------
create table admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nom        text not null,
  created_at timestamptz not null default now()
);

-- Funció auxiliar per a les polítiques RLS.
-- security definer: pot consultar `admins` encara que el rol no hi tingui accés.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------- Trobades -----------------------------------------------
create table trobades (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tipus                 trobada_tipus not null,
  estat                 trobada_estat not null default 'esborrany',

  titol                 text not null check (char_length(titol) between 3 and 140),
  descripcio            text not null default '',
  ponent                text,                 -- xerrades
  coorganitzador        text,                 -- entitat coorganitzadora (caràcter no partidista)
  barri                 text,                 -- trobades de barris

  inici                 timestamptz not null,
  fi                    timestamptz,
  lloc                  text not null,        -- p. ex. «Cases dels Mestres»
  adreca                text,
  imatge_url            text,                 -- foto de capçalera; null = foto per defecte
  aforament             int check (aforament is null or aforament > 0),

  inscripcions_obertes  boolean not null default false,
  aportacions_obertes   boolean not null default false,

  emissio_url           text,                 -- YouTube Live o equivalent
  emissio_alt_url       text,                 -- enllaç alternatiu (contingència)

  -- Historial (s'omple en tancar la trobada)
  resum                 text,
  conclusions           text,
  enllac_web            text,                 -- article complet a aracaldes.cat
  assistents_presencials int,
  assistents_virtuals    int,
  publicar_assistents   boolean not null default false,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  check (fi is null or fi > inici),
  -- No es poden obrir inscripcions ni aportacions en una trobada que no és «propera»
  check (estat = 'propera' or (not inscripcions_obertes and not aportacions_obertes))
);

create index trobades_estat_inici_idx on trobades (estat, inici);

-- ---------- Inscripcions -------------------------------------------
create table inscripcions (
  id            uuid primary key default gen_random_uuid(),
  trobada_id    uuid not null references trobades (id) on delete cascade,
  nom           text not null check (char_length(nom) between 2 and 80),
  email         text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  modalitat     modalitat not null,
  consentiment  boolean not null check (consentiment),   -- ha de ser true
  created_at    timestamptz not null default now()
);

create index inscripcions_trobada_idx on inscripcions (trobada_id);
-- Evita inscripcions duplicades amb el mateix email a la mateixa trobada
create unique index inscripcions_email_unic
  on inscripcions (trobada_id, lower(email)) where email is not null;

-- ---------- Aportacions --------------------------------------------
create table aportacions (
  id             uuid primary key default gen_random_uuid(),
  trobada_id     uuid not null references trobades (id) on delete cascade,
  tipus          aportacio_tipus not null default 'pregunta',
  text           text not null check (char_length(text) between 5 and 1000),
  nom            text check (nom is null or char_length(nom) between 2 and 80),  -- opcional
  consentiment   boolean not null check (consentiment),
  estat          aportacio_estat not null default 'pendent',
  ordre_lectura  int,                         -- ordre al «mode lectura»
  moderada_per   uuid references admins (user_id) on delete set null,
  moderada_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index aportacions_trobada_estat_idx on aportacions (trobada_id, estat);

-- ---------- updated_at automàtic -----------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trobades_updated_at
  before update on trobades
  for each row execute function set_updated_at();

-- ---------- Comprovacions en inserir (defensa en profunditat) -------
-- Encara que les escriptures passin pel servidor, la BD rebutja
-- inscripcions o aportacions a trobades tancades o plenes.
create or replace function check_inscripcio()
returns trigger language plpgsql as $$
declare
  t trobades%rowtype;
  ocupades int;
begin
  select * into t from trobades where id = new.trobada_id for share;
  if not t.inscripcions_obertes then
    raise exception 'Les inscripcions d''aquesta trobada estan tancades';
  end if;
  if new.modalitat = 'presencial' and t.aforament is not null then
    select count(*) into ocupades from inscripcions
      where trobada_id = new.trobada_id and modalitat = 'presencial';
    if ocupades >= t.aforament then
      raise exception 'Aforament complet';
    end if;
  end if;
  return new;
end;
$$;

create trigger inscripcions_check
  before insert on inscripcions
  for each row execute function check_inscripcio();

create or replace function check_aportacio()
returns trigger language plpgsql as $$
begin
  if not exists (select 1 from trobades where id = new.trobada_id and aportacions_obertes) then
    raise exception 'Les aportacions d''aquesta trobada estan tancades';
  end if;
  return new;
end;
$$;

create trigger aportacions_check
  before insert on aportacions
  for each row execute function check_aportacio();

-- ---------- Funcions públiques -------------------------------------
-- Places disponibles: el públic veu el recompte, mai les dades.
create or replace function places_disponibles(p_trobada uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select case when t.aforament is null then null
              else greatest(t.aforament - count(i.id), 0)::int end
  from trobades t
  left join inscripcions i on i.trobada_id = t.id and i.modalitat = 'presencial'
  where t.id = p_trobada and t.estat <> 'esborrany'
  group by t.id;
$$;

-- Aportacions seleccionades per al «mode lectura» (només admins).
create or replace function aportacions_per_llegir(p_trobada uuid)
returns table (id uuid, tipus aportacio_tipus, text text, nom text, ordre_lectura int)
language sql
stable
security invoker
as $$
  select a.id, a.tipus, a.text, a.nom, a.ordre_lectura
  from aportacions a
  where a.trobada_id = p_trobada and a.estat = 'aprovada'
  order by a.ordre_lectura nulls last, a.created_at;
$$;

-- ---------- Tancar trobada i protecció de dades ---------------------
-- Desa els recomptes a l'historial i marca la trobada com a celebrada.
create or replace function tancar_trobada(p_trobada uuid)
returns void
language plpgsql
security invoker
as $$
begin
  if not is_admin() then
    raise exception 'Només administradors';
  end if;
  update trobades t set
    estat = 'celebrada',
    inscripcions_obertes = false,
    aportacions_obertes = false,
    assistents_presencials = (select count(*) from inscripcions where trobada_id = t.id and modalitat = 'presencial'),
    assistents_virtuals    = (select count(*) from inscripcions where trobada_id = t.id and modalitat = 'virtual')
  where t.id = p_trobada;
end;
$$;

-- Esborra dades personals de trobades celebrades o cancel·lades fa més de N dies.
-- Programar amb pg_cron un cop decidit el termini de conservació (decisió del president):
--   select cron.schedule('purga-dades', '0 4 * * *', $$select purgar_dades_personals(30)$$);
create or replace function purgar_dades_personals(p_dies int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  delete from inscripcions i using trobades t
    where i.trobada_id = t.id
      and t.estat in ('celebrada', 'cancellada')
      and coalesce(t.fi, t.inici) < now() - make_interval(days => p_dies);
  get diagnostics n = row_count;
  -- Les aportacions es conserven anonimitzades (sense nom) per a l'historial
  update aportacions a set nom = null
    from trobades t
    where a.trobada_id = t.id
      and t.estat in ('celebrada', 'cancellada')
      and coalesce(t.fi, t.inici) < now() - make_interval(days => p_dies)
      and a.nom is not null;
  return n;
end;
$$;

-- ---------- Row Level Security -------------------------------------
alter table admins       enable row level security;
alter table trobades     enable row level security;
alter table inscripcions enable row level security;
alter table aportacions  enable row level security;

-- admins: cada admin pot veure la llista d'admins
create policy admins_select on admins
  for select to authenticated using (is_admin());

-- trobades: el públic veu les publicades; els admins ho gestionen tot
create policy trobades_public_select on trobades
  for select to anon, authenticated using (estat <> 'esborrany');
create policy trobades_admin_all on trobades
  for all to authenticated using (is_admin()) with check (is_admin());

-- inscripcions i aportacions: CAP política per a anon.
-- Les insercions públiques arriben pel servidor amb la service_role
-- (que se salta RLS) després de verificar el captcha.
create policy inscripcions_admin_all on inscripcions
  for all to authenticated using (is_admin()) with check (is_admin());
create policy aportacions_admin_all on aportacions
  for all to authenticated using (is_admin()) with check (is_admin());

-- Permisos de funcions
revoke execute on function tancar_trobada(uuid)        from public, anon;
revoke execute on function purgar_dades_personals(int) from public, anon, authenticated;
revoke execute on function aportacions_per_llegir(uuid) from public, anon;
grant  execute on function places_disponibles(uuid)    to anon, authenticated;
grant  execute on function tancar_trobada(uuid)        to authenticated;
grant  execute on function aportacions_per_llegir(uuid) to authenticated;
