<?php
/* ============================================================
   Pièces jointes d'une cliente — dépôt et retrait
   ============================================================
   Un dossier de cliente ne tient pas qu'en chiffres : il y a le contrat
   signé qu'elle renvoie scanné, la photo d'une pièce abîmée, un relevé.
   Ces documents-là étaient jusqu'ici impossibles à ranger dans le CRM.

   Ils ne vont pas dans /uploads, qui est public : ils atterrissent dans
   /fichiers, fermé par son .htaccess, et ne se relisent qu'au travers de
   fichier.php, session ouverte. Le CRM, lui, ne garde que la fiche du
   document (nom d'origine, taille, date) dans son état.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function saga_fichier_erreur($code, $message)
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/* Les formats qu'on accepte de ranger. La liste est volontairement courte :
   ce qu'une cliente envoie tient toujours dans un PDF, une image, une pièce
   de bureautique ou un texte. */
function saga_fichier_formats()
{
    return [
        'pdf'  => 'application/pdf',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'gif'  => 'image/gif',
        'heic' => 'image/heic',
        'doc'  => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls'  => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv'  => 'text/csv',
        'txt'  => 'text/plain',
    ];
}

/* Le nom rangé sur le disque est fabriqué par nous, jamais repris du
   navigateur : c'est ce qui rend impossible de remonter dans l'arborescence
   ou de se glisser sous un autre nom. */
function saga_fichier_nom_valide($nom)
{
    return (bool) preg_match('/^[0-9]{8}_[0-9]{6}_[0-9a-f]{12}\.[a-z0-9]{1,5}$/', (string) $nom);
}

saga_session_demarrer();
$moi = saga_utilisateur();
if (!$moi) {
    saga_fichier_erreur(403, 'Session expirée. Rechargez la page.');
}
if ($moi['role'] === 'lecture' || $moi['role'] === 'comptable') {
    saga_fichier_erreur(403, 'Votre compte est en consultation seule.');
}
if (!saga_verifier_jeton(isset($_SERVER['HTTP_X_SAGA_JETON']) ? $_SERVER['HTTP_X_SAGA_JETON'] : '')) {
    saga_fichier_erreur(403, 'Session expirée. Rechargez la page.');
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    saga_fichier_erreur(405, 'Méthode non autorisée.');
}

$dossier = __DIR__ . '/fichiers';
$action = isset($_POST['action']) ? $_POST['action'] : 'deposer';

/* ---------- Retrait ---------- */
if ($action === 'supprimer') {
    $nom = isset($_POST['fichier']) ? $_POST['fichier'] : '';
    if (!saga_fichier_nom_valide($nom)) {
        saga_fichier_erreur(400, 'Fichier inconnu.');
    }
    $chemin = $dossier . '/' . $nom;
    if (is_file($chemin) && !@unlink($chemin)) {
        saga_fichier_erreur(500, 'Le document n’a pas pu être supprimé du serveur.');
    }
    /* Un fichier déjà absent n'est pas une erreur : le but — qu'il ne soit
       plus là — est atteint, et la fiche peut être retirée de l'état. */
    echo json_encode(['supprime' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ---------- Dépôt ---------- */
if (empty($_FILES['fichier'])) {
    saga_fichier_erreur(400, 'Aucun fichier reçu.');
}

$f = $_FILES['fichier'];
if ($f['error'] !== UPLOAD_ERR_OK) {
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
        saga_fichier_erreur(400, 'Document trop lourd — le serveur limite les envois à '
            . ini_get('upload_max_filesize') . '.');
    }
    saga_fichier_erreur(400, 'Échec de l’envoi (code ' . $f['error'] . ').');
}
if ($f['size'] <= 0) {
    saga_fichier_erreur(400, 'Ce fichier est vide.');
}
if ($f['size'] > 20 * 1024 * 1024) {
    saga_fichier_erreur(400, 'Document trop lourd (20 Mo maximum).');
}

$formats = saga_fichier_formats();
$nomOrigine = (string) $f['name'];
$ext = strtolower(pathinfo($nomOrigine, PATHINFO_EXTENSION));
if (!isset($formats[$ext])) {
    saga_fichier_erreur(400, 'Format non accepté (' . ($ext === '' ? 'sans extension' : '.' . $ext) . '). '
        . 'PDF, images, Word, Excel, CSV ou texte.');
}
/* Une image doit vraiment en être une : c'est le seul cas où le contenu se
   vérifie sans ouvrir le fichier, et c'est aussi le plus fréquent. */
if (strpos($formats[$ext], 'image/') === 0 && $ext !== 'heic') {
    if (@getimagesize($f['tmp_name']) === false) {
        saga_fichier_erreur(400, 'Ce fichier annonce une image, mais n’en est pas une.');
    }
}

if (!is_dir($dossier) && !@mkdir($dossier, 0755, true)) {
    saga_fichier_erreur(500, 'Dossier des pièces jointes introuvable sur le serveur.');
}

try {
    $alea = bin2hex(random_bytes(6));
} catch (Exception $e) {
    $alea = substr(md5(uniqid('', true)), 0, 12);
}
$nom = date('Ymd_His') . '_' . $alea . '.' . $ext;

if (!move_uploaded_file($f['tmp_name'], $dossier . '/' . $nom)) {
    saga_fichier_erreur(500, 'Impossible d’enregistrer le document.');
}
@chmod($dossier . '/' . $nom, 0644);

/* Le nom d'origine est rendu tel quel au CRM, qui l'affichera : il est donc
   nettoyé de tout ce qui pourrait passer pour du balisage. */
$affiche = preg_replace('/[\x00-\x1F<>"\\\\\/]+/u', ' ', $nomOrigine);
$affiche = trim(preg_replace('/\s+/u', ' ', $affiche));
if ($affiche === '') {
    $affiche = 'document.' . $ext;
}
if (function_exists('mb_substr')) {
    $affiche = mb_substr($affiche, 0, 120, 'UTF-8');
}

echo json_encode([
    'fichier' => $nom,
    'nom'     => $affiche,
    'taille'  => (int) $f['size'],
    'type'    => $formats[$ext],
], JSON_UNESCAPED_UNICODE);
