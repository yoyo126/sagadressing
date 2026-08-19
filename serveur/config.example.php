<?php
/* ============================================================
   Accès à la base — modèle à recopier
   ============================================================
   Sur le serveur, copiez ce fichier sous le nom `config.php` et
   complétez les deux valeurs manquantes avec les identifiants que
   IONOS a générés en créant la base.

   `config.php` ne doit JAMAIS être publié ni versionné : il donne
   accès à toutes les données. Le .htaccess du dossier en interdit
   déjà la lecture par le web, mais la règle reste la même.
   ============================================================ */

return [
    // Fournis par IONOS, déjà connus
    'db_host' => 'db5021230781.hosting-data.io',
    'db_nom'  => 'dbs16031522',

    // À compléter — visibles dans la fiche de la base, chez IONOS
    'db_user' => '',   // du type dbo1234567
    'db_pass' => '',

    /* Nom affiché dans les pages et les documents. */
    'site_nom' => 'Saga Dressing',
];
