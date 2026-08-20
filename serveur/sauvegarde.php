<?php
/* ============================================================
   Sauvegarde de la base
   ============================================================
   Trois façons de l'appeler :

     · en ligne de commande (tâche cron d'IONOS) — aucune clé requise,
       personne d'autre que le serveur ne peut lancer un script ainsi ;
     · par une adresse, pour les hébergements dont le cron ne sait
       qu'appeler une URL : il faut alors la clé définie dans config.php ;
     · depuis les Paramètres, connectée : le fichier est téléchargé.

   Ce qui est sauvegardé : l'état complet du CRM, les comptes et les
   réglages. Pas l'historique des versions — c'en est déjà un.

   Les fichiers sont écrits dans `sauvegardes/`, que le serveur web ne
   sert pas : une sauvegarde téléchargeable par n'importe qui serait
   pire que pas de sauvegarde du tout.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

const SAGA_RETENTION_JOURS = 30;

$dossier = __DIR__ . '/sauvegardes';
$enLigneDeCommande = (php_sapi_name() === 'cli');

/* ---------- Qui a le droit ---------- */
$telechargement = false;

if (!$enLigneDeCommande) {
    $cle = (string) filter_input(INPUT_GET, 'cle');
    $config = saga_config();
    $attendue = isset($config['cle_sauvegarde']) ? (string) $config['cle_sauvegarde'] : '';

    if ($cle !== '' && $attendue !== '' && hash_equals($attendue, $cle)) {
        // Appel par la tâche planifiée
    } else {
        saga_session_demarrer();
        $moi = saga_utilisateur();
        if (!$moi || $moi['role'] !== 'admin') {
            http_response_code(403);
            header('Content-Type: text/plain; charset=utf-8');
            echo "Accès refusé.\n";
            exit;
        }
        $telechargement = filter_input(INPUT_GET, 'telecharger') === '1';
    }
}

/* ---------- Le dossier, et sa protection ---------- */
if (!is_dir($dossier)) {
    @mkdir($dossier, 0750, true);
}
if (!is_dir($dossier)) {
    saga_sortie(500, 'Impossible de créer le dossier des sauvegardes.');
}

/* Ceinture et bretelles : le .htaccess du dossier refuse tout, au cas où
   celui de la racine serait un jour remplacé par mégarde. */
$protection = $dossier . '/.htaccess';
if (!is_file($protection)) {
    @file_put_contents($protection, "Require all denied\n");
}

/* ---------- Constitution de la sauvegarde ---------- */
$db = saga_db();
$contenu = ['fait_le' => date('c'), 'version_crm' => 0, 'tables' => []];

$etat = $db->query('SELECT contenu, version, maj_le FROM etat WHERE id = 1')->fetch();
if ($etat) {
    $contenu['version_crm'] = (int) $etat['version'];
    $contenu['tables']['etat'] = [
        'version' => (int) $etat['version'],
        'maj_le'  => $etat['maj_le'],
        'contenu' => json_decode($etat['contenu'], true),
    ];
}

$contenu['tables']['utilisateurs'] =
    $db->query('SELECT id, email, mdp_hash, prenom, nom, role, proprietaire, actif,
                       cree_le, derniere_connexion FROM utilisateurs')->fetchAll();

$contenu['tables']['reglages'] = $db->query('SELECT cle, valeur FROM reglages')->fetchAll();

$json = json_encode($contenu, JSON_UNESCAPED_UNICODE);
$comprime = function_exists('gzencode') ? gzencode($json, 6) : null;
$extension = $comprime === null ? '.json' : '.json.gz';
$donnees = $comprime === null ? $json : $comprime;

/* ---------- Téléchargement immédiat ---------- */
if ($telechargement) {
    $nom = 'saga_sauvegarde_' . date('Y-m-d_His') . $extension;
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $nom . '"');
    header('Content-Length: ' . strlen($donnees));
    echo $donnees;
    exit;
}

/* ---------- Écriture sur le serveur ---------- */
$nom = 'saga_' . date('Y-m-d_His') . $extension;
$chemin = $dossier . '/' . $nom;

if (@file_put_contents($chemin, $donnees) === false) {
    saga_sortie(500, 'Écriture impossible dans ' . basename($dossier) . '.');
}
@chmod($chemin, 0640);

/* ---------- Ménage ---------- */
$limite = time() - SAGA_RETENTION_JOURS * 86400;
$supprimes = 0;
foreach (glob($dossier . '/saga_*.json*') as $vieux) {
    if (filemtime($vieux) < $limite) {
        @unlink($vieux);
        $supprimes++;
    }
}

$restants = count(glob($dossier . '/saga_*.json*'));
$journal = sprintf("%s  %s  %d Ko  · %d fichier(s) conservé(s), %d retiré(s)\n",
    date('Y-m-d H:i:s'), $nom, round(strlen($donnees) / 1024), $restants, $supprimes);
@file_put_contents($dossier . '/journal.txt', $journal, FILE_APPEND);

saga_sortie(200, sprintf('Sauvegarde %s — %d Ko — %d conservée(s), %d retirée(s).',
    $nom, round(strlen($donnees) / 1024), $restants, $supprimes));


function saga_sortie($code, $message)
{
    if (php_sapi_name() === 'cli') {
        fwrite($code === 200 ? STDOUT : STDERR, $message . "\n");
        exit($code === 200 ? 0 : 1);
    }
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    echo $message . "\n";
    exit;
}
