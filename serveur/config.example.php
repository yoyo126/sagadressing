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
    /* Les quatre valeurs sont dans la fiche de la base, chez IONOS.
       Rien n'est pré-rempli ici : ce fichier est versionné, et l'adresse
       d'un serveur de base de données n'a pas à traîner dans un dépôt. */
    'db_host' => '',   // du type dbXXXXXXXXXX.hosting-data.io
    'db_nom'  => '',   // du type dbsXXXXXXXX
    'db_user' => '',   // du type dboXXXXXXXX
    'db_pass' => '',

    /* Nom affiché dans les pages et les documents. */
    'site_nom' => 'Saga Dressing',
];
