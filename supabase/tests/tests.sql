\set ON_ERROR_STOP 0
\echo '--- 1. anon veu trobades publicades'
set role anon; select slug, estat from trobades order by inici; reset role;
\echo '--- 2. anon NO veu inscripcions ni aportacions'
set role anon; select count(*) as inscripcions_visibles from inscripcions; select count(*) as aportacions_visibles from aportacions; reset role;
\echo '--- 3. anon NO pot inserir (ha de fallar)'
set role anon; insert into inscripcions (trobada_id, nom, modalitat, consentiment) select id,'Hacker','presencial',true from trobades limit 1; reset role;
\echo '--- 4. anon no veu esborranys'
insert into trobades (slug,tipus,titol,inici,lloc) values ('esborrany-x','xerrada','Esborrany secret',now(),'X');
set role anon; select count(*) as esborranys_visibles from trobades where slug='esborrany-x'; reset role;
\echo '--- 5. servidor (service_role) insereix a trobada oberta: OK'
set role service_role; insert into inscripcions (trobada_id, nom, modalitat, consentiment) select id,'Persona Demo 5','virtual',true from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 6. trobada tancada: ha de fallar'
set role service_role; insert into inscripcions (trobada_id, nom, modalitat, consentiment) select id,'X','presencial',true from trobades where slug='trobada-barris-demo-passada'; reset role;
\echo '--- 7. sense consentiment: ha de fallar'
set role service_role; insert into inscripcions (trobada_id, nom, modalitat, consentiment) select id,'X Y','virtual',false from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 8. email duplicat: ha de fallar'
set role service_role; insert into inscripcions (trobada_id, nom, email, modalitat, consentiment) select id,'Dup','DEMO1@example.com','virtual',true from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 9. aforament complet: ha de fallar'
update trobades set aforament=2 where slug='trobada-barris-can-valls';
set role service_role; insert into inscripcions (trobada_id, nom, modalitat, consentiment) select id,'Tercer','presencial',true from trobades where slug='trobada-barris-can-valls'; reset role;
update trobades set aforament=60 where slug='trobada-barris-can-valls';
\echo '--- 10. places disponibles (anon)'
set role anon; select places_disponibles(id) from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 11. usuari autenticat NO admin no veu inscripcions'
insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set role authenticated; select count(*) as inscripcions_no_admin from inscripcions; reset role;
\echo '--- 12. admin veu inscripcions i mode lectura'
insert into admins values ('11111111-1111-1111-1111-111111111111','Janai');
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set role authenticated; select count(*) as inscripcions_admin from inscripcions; select ordre_lectura, left(text,40) from aportacions_per_llegir((select id from trobades where slug='trobada-barris-can-valls')); reset role;
\echo '--- 13. no admin no pot tancar trobada (ha de fallar)'
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set role authenticated; select tancar_trobada(id) from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 14. anon no pot tancar trobada (ha de fallar)'
set role anon; select tancar_trobada(id) from trobades where slug='trobada-barris-can-valls'; reset role;
\echo '--- 15. admin tanca trobada: recomptes a l historial'
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set role authenticated; select tancar_trobada(id) from trobades where slug='trobada-barris-can-valls'; reset role;
select estat, inscripcions_obertes, assistents_presencials, assistents_virtuals from trobades where slug='trobada-barris-can-valls';
\echo '--- 16. purga de dades (trobada fa 40 dies)'
update trobades set inici=now()-interval '40 days', fi=now()-interval '40 days'+interval '1 hour' where slug='trobada-barris-can-valls';
select purgar_dades_personals(30) as inscripcions_esborrades;
select count(*) filter (where nom is not null) as aportacions_amb_nom, count(*) as aportacions from aportacions;
select assistents_presencials, assistents_virtuals from trobades where slug='trobada-barris-can-valls';
\echo '--- 17. no es pot obrir inscripcions en trobada celebrada (ha de fallar)'
update trobades set inscripcions_obertes=true where slug='trobada-barris-demo-passada';
