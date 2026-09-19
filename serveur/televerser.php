<?php
/* ============================================================
   Téléversement d'une photo de boutique
   ============================================================
   Whatnot ne sait afficher une image que s'il peut aller la chercher à une
   adresse internet. Une vignette rangée dans le CRM, si soignée soit-elle,
   lui reste invisible : c'est pour cela que la colonne « Image URL » du
   fichier d'annonces partait vide.

   La photo est donc déposée ici, dans /uploads, et l'application ne garde
   que son adresse. C'est exactement ce que faisait l'outil d'origine
   (app_sagadressing/upload.php), qui alimente les annonces depuis des mois ;
   ce fichier en est le portage.

   Deux accès, volontairement dissymétriques :
     · déposer une photo demande une session ouverte ;
     · la lire ne demande rien — Whatnot n'a pas de compte chez vous.
   Le dossier /uploads est donc public en lecture, et son .htaccess y
   interdit l'exécution de tout script.
   ============================================================ */

/* entete.php ne convient pas ici : il redirige vers la page de connexion et
   écrit du HTML. Cette adresse répond en JSON, comme api.php, et suit donc
   le même amorçage. */
require_once __DIR__ . '/lib_auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function saga_photo_erreur($code, $message)
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

saga_session_demarrer();
$moi = saga_utilisateur();
if (!$moi) {
    saga_photo_erreur(403, 'Session expirée. Rechargez la page.');
}
if ($moi['role'] === 'lecture' || $moi['role'] === 'comptable') {
    saga_photo_erreur(403, 'Votre compte est en consultation seule.');
}
if (!saga_verifier_jeton(isset($_SERVER['HTTP_X_SAGA_JETON']) ? $_SERVER['HTTP_X_SAGA_JETON'] : '')) {
    saga_photo_erreur(403, 'Session expirée. Rechargez la page.');
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    saga_photo_erreur(405, 'Méthode non autorisée.');
}
if (empty($_FILES['photo'])) {
    saga_photo_erreur(400, 'Aucun fichier reçu.');
}

$f = $_FILES['photo'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    /* Le cas courant n'est pas une panne mais une photo de téléphone trop
       lourde : le dire, avec la limite réelle du serveur. */
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
        saga_photo_erreur(400, 'Photo trop lourde — le serveur limite les envois à '
            . ini_get('upload_max_filesize') . '.');
    }
    saga_photo_erreur(400, 'Échec du téléversement (code ' . $f['error'] . ').');
}

if ($f['size'] > 12 * 1024 * 1024) {
    saga_photo_erreur(400, 'Photo trop lourde (12 Mo maximum).');
}

/* Le type déclaré par le navigateur ne prouve rien : c'est le contenu réel
   qui décide, et lui seul donne l'extension. */
$info = @getimagesize($f['tmp_name']);
if ($info === false) {
    saga_photo_erreur(400, "Ce fichier n'est pas une image.");
}
$extensions = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];
if (!isset($extensions[$info['mime']])) {
    saga_photo_erreur(400, 'Format non reconnu (' . $info['mime'] . '). '
        . 'Utilisez JPG, PNG, WEBP ou GIF.');
}

$dossier = __DIR__ . '/uploads';
if (!is_dir($dossier) && !@mkdir($dossier, 0755, true)) {
    saga_photo_erreur(500, 'Dossier des photos introuvable sur le serveur.');
}

try {
    $alea = bin2hex(random_bytes(6));
} catch (Exception $e) {
    $alea = uniqid();
}
$nom = date('Ymd_His') . '_' . $alea . '.' . $extensions[$info['mime']];

if (!move_uploaded_file($f['tmp_name'], $dossier . '/' . $nom)) {
    saga_photo_erreur(500, "Impossible d'enregistrer la photo.");
}
@chmod($dossier . '/' . $nom, 0644);

/* L'adresse renvoyée est absolue : elle part telle quelle dans le fichier
   d'annonces, et Whatnot la lit depuis ses propres serveurs. */
$protocole = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    ? 'https' : 'http';
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
if ($base === '.' || $base === '/') {
    $base = '';
}

echo json_encode([
    'url' => $protocole . '://' . $_SERVER['HTTP_HOST'] . $base . '/uploads/' . $nom,
    'nom' => $nom,
], JSON_UNESCAPED_UNICODE);
