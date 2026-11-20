set -e
export PGDATA=/tmp/pgtest PGPORT=5499 PGHOST=/tmp
BIN=/usr/lib/postgresql/16/bin
rm -rf $PGDATA; mkdir -p $PGDATA; chown postgres $PGDATA
su postgres -c "$BIN/initdb -D $PGDATA -A trust >/dev/null && $BIN/pg_ctl -D $PGDATA -o '-p 5499 -k /tmp' -l /tmp/pg.log start >/dev/null"
P="psql -v ON_ERROR_STOP=1 -q -U postgres -h /tmp -p 5499"
$P -c "create database t"
$P -d t -f supabase/tests/supabase_stub.sql
$P -d t -f supabase/schema.sql
$P -d t -c "grant usage on schema public to anon, authenticated, service_role; grant all on all tables in schema public to anon, authenticated, service_role;"
$P -d t -f supabase/seed.sql
$P -d t -f supabase/tests/tests.sql
su postgres -c "$BIN/pg_ctl -D $PGDATA stop >/dev/null"
