<?php
/* ============================================================
   Pièces jointes d'une cliente — lecture
   ============================================================
   Le dossier /fichiers est fermé par son .htaccess. Un document ne sort donc
   d'ici que par cette adresse, et seulement pour une session ouverte : même
   en connaissant le nom exact d'un contrat signé, personne ne le lit sans
   compte. Tous les rôles peuvent consulter — y compris la comptable et les
   comptes en consultation, pour qui retrouver un justificatif est le travail
   même.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

saga_session_demarrer();
$moi = saga_utilisateur();
if (!$moi) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Session expirée. Reconnectez-vous au CRM, puis rouvrez le document.";
    exit;
}

$nom = isset($_GET['f']) ? (string) $_GET['f'] : '';
if (!preg_match('/^[0-9]{8}_[0-9]{6}_[0-9a-f]{12}\.[a-z0-9]{1,5}$/', $nom)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Document inconnu.";
    exit;
}

$chemin = __DIR__ . '/fichiers/' . $nom;
if (!is_file($chemin)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Ce document n'est plus sur le serveur.";
    exit;
}

$types = [
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
$ext = strtolower(pathinfo($nom, PATHINFO_EXTENSION));
$type = isset($types[$ext]) ? $types[$ext] : 'application/octet-stream';

/* Le nom d'origine ne sert qu'à l'enregistrement chez la personne : il vient
   du navigateur, on ne garde donc que des caractères sans effet. */
$propose = isset($_GET['n']) ? (string) $_GET['n'] : $nom;
$propose = preg_replace('/[^\p{L}\p{N} ._\-()]+/u', '_', $propose);
$propose = trim($propose) !== '' ? trim($propose) : $nom;

/* Un PDF ou une image s'ouvre dans un onglet ; le reste se télécharge. Dans
   les deux cas le navigateur ne doit pas deviner le type à notre place. */
$dansLOnglet = !isset($_GET['dl'])
    && ($type === 'application/pdf' || strpos($type, 'image/') === 0);

header('Content-Type: ' . $type);
header('X-Content-Type-Options: nosniff');
header('Content-Length: ' . filesize($chemin));
header('Cache-Control: private, max-age=0, no-store');
header('Content-Disposition: ' . ($dansLOnglet ? 'inline' : 'attachment')
    . '; filename="' . str_replace('"', '', $propose) . '"'
    . "; filename*=UTF-8''" . rawurlencode($propose));

readfile($chemin);
