<?php
/* ============================================================
   Réglages d'envoi : le secret, et le message de test
   ============================================================
   Trois opérations, réservées à un compte administrateur :

     · `etat`   — le mot de passe est-il enregistré ? (oui/non, jamais sa valeur)
     · `secret` — l'enregistrer, ou l'effacer
     · `test`   — expédier un vrai message, et rendre l'erreur telle quelle

   Le secret entre, ne sort jamais. C'est toute la raison d'être de ce
   fichier : les autres réglages voyagent dans l'état du CRM, lui non.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';
require_once __DIR__ . '/mail.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function saga_mail_json($donnees, $code = 200)
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

saga_session_demarrer();
$moi = saga_utilisateur();
if (!$moi) {
    saga_mail_json(['erreur' => 'non_connecte', 'message' => 'Session expirée. Rechargez la page.'], 401);
}
if ($moi['role'] !== 'admin') {
    saga_mail_json(['erreur' => 'reserve',
                    'message' => 'Seul un compte administrateur peut toucher aux réglages d’envoi.'], 403);
}

$action = (string) filter_input(INPUT_GET, 'action');

/* ---------- Le mot de passe est-il en place ? ---------- */
if ($action === 'etat') {
    saga_mail_json([
        'smtpDefini' => saga_mail_secret_lire('mail_smtp_mdp') !== '',
        'apiDefinie'  => saga_mail_secret_lire('mail_api_cle') !== '',
    ]);
}

/* Les deux actions qui suivent modifient ou expédient : jeton exigé, comme
   pour un enregistrement de données. */
$jeton = isset($_SERVER['HTTP_X_SAGA_JETON']) ? $_SERVER['HTTP_X_SAGA_JETON'] : '';
if (!saga_verifier_jeton($jeton)) {
    saga_mail_json(['erreur' => 'jeton_invalide', 'message' => 'Session expirée. Rechargez la page.'], 403);
}

$corps = json_decode(file_get_contents('php://input'), true);
if (!is_array($corps)) {
    $corps = [];
}

/* ---------- Enregistrer (ou effacer) le secret ---------- */
if ($action === 'secret') {
    $quel = isset($corps['quel']) ? (string) $corps['quel'] : '';
    $cles = ['smtp' => 'mail_smtp_mdp', 'api' => 'mail_api_cle'];
    if (!isset($cles[$quel])) {
        saga_mail_json(['erreur' => 'requete_invalide'], 400);
    }

    $valeur = isset($corps['valeur']) ? (string) $corps['valeur'] : '';
    /* Un mot de passe de boîte n'a pas de saut de ligne ; s'il en portait un,
       il permettrait d'injecter des commandes dans le dialogue SMTP. */
    $valeur = preg_replace('/[\r\n]/', '', $valeur);
    if (strlen($valeur) > 512) {
        saga_mail_json(['erreur' => 'trop_long', 'message' => 'Valeur trop longue.'], 400);
    }

    saga_mail_secret_ecrire($cles[$quel], $valeur);
    saga_mail_json([
        'ok' => true,
        'defini' => $valeur !== '',
        'message' => $valeur === '' ? 'Mot de passe effacé.' : 'Mot de passe enregistré sur le serveur.',
    ]);
}

/* ---------- Message de test ---------- */
if ($action === 'test') {
    $reglages = isset($corps['reglages']) && is_array($corps['reglages']) ? $corps['reglages'] : [];
    $a = isset($corps['destinataire']) ? trim((string) $corps['destinataire']) : '';
    if ($a === '') {
        $a = (string) $moi['email'];
    }

    $r = saga_mail_envoyer(
        $reglages, $a,
        'Saga Dressing — message de test',
        "Ce message confirme que le CRM sait expédier du courrier.\n\n"
        . "Envoyé le " . date('d/m/Y à H:i') . " depuis les réglages d'envoi,\n"
        . "à la demande de " . trim($moi['prenom'] . ' ' . $moi['nom']) . ".\n\n"
        . "Aucune action n'est attendue : personne ne lit les réponses à cette adresse.\n"
    );

    saga_mail_json([
        'ok' => $r['ok'],
        'message' => $r['message'],
        'detail' => $r['detail'],
        'destinataire' => $a,
    ], $r['ok'] ? 200 : 502);
}

saga_mail_json(['erreur' => 'action_inconnue'], 400);
