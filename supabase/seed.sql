-- =====================================================================
-- Dades de DEMO — totes inventades. No contenen cap dada personal real.
-- =====================================================================

insert into trobades (slug, tipus, estat, titol, descripcio, barri, inici, fi, lloc, adreca,
                      aforament, inscripcions_obertes, aportacions_obertes, emissio_url)
values
  ('trobada-barris-can-valls', 'barris', 'propera',
   'Trobada de barris: Can Valls',
   'Volem escoltar els veïns i veïnes de Can Valls: mobilitat, serveis, manteniment i el futur de la urbanització. Una trobada oberta per construir junts el pla de futur per a Caldes.',
   'Can Valls', now() + interval '21 days', now() + interval '21 days 90 minutes',
   'Local social de Can Valls', 'Adreça de demostració',
   60, true, true, null),

  ('xerrada-finances-municipals', 'xerrada', 'propera',
   'Xerrada: Les finances municipals, explicades',
   'D''on surten els diners de l''Ajuntament i com es decideix en què es gasten? Una xerrada divulgativa per entendre el pressupost municipal.',
   null, now() + interval '45 days', now() + interval '45 days 90 minutes',
   'Cases dels Mestres', null,
   80, true, true, null);

update trobades set ponent = 'Ponent de demostració', coorganitzador = 'Entitat coorganitzadora (demo)'
 where slug = 'xerrada-finances-municipals';

-- Trobada passada per a l'historial
insert into trobades (slug, tipus, estat, titol, descripcio, barri, inici, fi, lloc,
                      resum, conclusions, assistents_presencials, assistents_virtuals, publicar_assistents)
values
  ('trobada-barris-demo-passada', 'barris', 'celebrada',
   'Trobada de barris: exemple de trobada celebrada',
   'Trobada d''exemple per mostrar com es veu l''historial.',
   'Barri de demostració', now() - interval '30 days', now() - interval '30 days' + interval '90 minutes',
   'Espai de demostració',
   'Els veïns van posar sobre la taula la mobilitat, la neteja dels espais públics i la falta de punts de trobada.',
   '1. Estudiar un aparcament dissuasori a la zona alta.' || chr(10) ||
   '2. Demanar un calendari públic de manteniment de carrers.' || chr(10) ||
   '3. Fer una segona trobada d''aquí a tres mesos.',
   34, 12, true);

-- Inscripcions i aportacions de prova a Can Valls
insert into inscripcions (trobada_id, nom, email, modalitat, consentiment)
select id, n, e, m::modalitat, true
from trobades,
     (values ('Persona Demo 1', 'demo1@example.com', 'presencial'),
             ('Persona Demo 2', null,                'presencial'),
             ('Persona Demo 3', 'demo3@example.com', 'virtual')) v(n, e, m)
where slug = 'trobada-barris-can-valls';

insert into aportacions (trobada_id, tipus, text, nom, consentiment, estat, ordre_lectura)
select id, t::aportacio_tipus, txt, n, true, e::aportacio_estat, o
from trobades,
     (values ('pregunta',  'Quan està previst arreglar el ferm del carrer principal?', 'Persona Demo 1', 'aprovada', 1),
             ('proposta',  'Proposo un bus llançadora els caps de setmana fins al centre.', null, 'aprovada', 2),
             ('pregunta',  'Hi haurà enllumenat nou a la zona del parc?', 'Persona Demo 4', 'pendent', null),
             ('aportacio', 'Missatge de prova descartat per la moderació.', null, 'descartada', null)) v(t, txt, n, e, o)
where slug = 'trobada-barris-can-valls';
