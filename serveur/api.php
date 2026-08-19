<?php
/* ============================================================
   Lecture et écriture de l'état du CRM
   ============================================================
   Deux opérations seulement : lire l'état complet, l'enregistrer.

   L'enregistrement porte le numéro de version d'où il part. S'il ne
   correspond plus à celui de la base, c'est que quelqu'un d'autre a
   écrit entre-temps : la demande est refusée et l'état courant est
   renvoyé, plutôt que d'écraser en silence le travail de l'autre.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function saga_json($donnees, $code = 200)
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

saga_session_demarrer();
$u = saga_utilisateur();
if (!$u) {
    saga_json(['erreur' => 'non_connecte'], 401);
}

$action = (string) filter_input(INPUT_GET, 'action');
$db = saga_db();

/* ---------- Lire ---------- */
if ($action === 'lire') {
    $ligne = $db->query('SELECT contenu, version FROM etat WHERE id = 1')->fetch();
    if (!$ligne) {
        // Première ouverture après installation : l'état n'existe pas encore
        $st = $db->prepare('INSERT INTO etat (id, contenu, version, maj_le) VALUES (1, ?, 0, ?)');
        $st->execute(['{}', date('Y-m-d H:i:s')]);
        $ligne = ['contenu' => '{}', 'version' => 0];
    }
    saga_json([
        'version' => (int) $ligne['version'],
        'etat'    => json_decode($ligne['contenu'], true),
    ]);
}

/* ---------- Écrire ---------- */
if ($action === 'ecrire') {
    if ($u['role'] === 'lecture') {
        saga_json(['erreur' => 'lecture_seule',
                   'message' => 'Votre compte est en consultation seule.'], 403);
    }

    $brut = file_get_contents('php://input');
    $demande = json_decode($brut, true);

    /* Le jeton accompagne la requête : une page d'un autre site ne peut pas
       le connaître, elle ne peut donc pas écrire à votre place. L'envoi de
       dernière chance, au moment de fermer l'onglet, ne peut pas poser
       d'en-tête : il le place alors dans le corps. */
    $jeton = isset($_SERVER['HTTP_X_SAGA_JETON']) ? $_SERVER['HTTP_X_SAGA_JETON'] : '';
    if ($jeton === '' && is_array($demande) && isset($demande['jeton'])) {
        $jeton = (string) $demande['jeton'];
    }
    if (!saga_verifier_jeton($jeton)) {
        saga_json(['erreur' => 'jeton_invalide',
                   'message' => 'Session expirée. Rechargez la page.'], 403);
    }

    if (!is_array($demande) || !array_key_exists('etat', $demande)
        || !array_key_exists('version', $demande)) {
        saga_json(['erreur' => 'requete_invalide'], 400);
    }

    $contenu = json_encode($demande['etat'], JSON_UNESCAPED_UNICODE);
    if ($contenu === false) {
        saga_json(['erreur' => 'etat_illisible'], 400);
    }

    $db->beginTransaction();
    try {
        // Verrou de ligne : deux enregistrements simultanés sont mis en file
        $st = $db->prepare('SELECT contenu, version FROM etat WHERE id = 1 FOR UPDATE');
        $st->execute();
        $courant = $st->fetch();

        if (!$courant) {
            $st = $db->prepare('INSERT INTO etat (id, contenu, version, maj_le) VALUES (1, ?, 0, ?)');
            $st->execute(['{}', date('Y-m-d H:i:s')]);
            $courant = ['contenu' => '{}', 'version' => 0];
        }

        if ((int) $demande['version'] !== (int) $courant['version']) {
            $db->rollBack();
            saga_json([
                'erreur'  => 'conflit',
                'message' => 'Ces données ont été modifiées ailleurs entre-temps.',
                'version' => (int) $courant['version'],
                'etat'    => json_decode($courant['contenu'], true),
            ], 409);
        }

        $version = (int) $courant['version'] + 1;
        $maintenant = date('Y-m-d H:i:s');

        // La version qu'on remplace est archivée avant d'être écrasée
        $st = $db->prepare(
            'INSERT INTO etat_historique (version, contenu, maj_le, maj_par) VALUES (?, ?, ?, ?)'
        );
        $st->execute([(int) $courant['version'], $courant['contenu'], $maintenant, $u['id']]);

        $st = $db->prepare('UPDATE etat SET contenu = ?, version = ?, maj_le = ?, maj_par = ? WHERE id = 1');
        $st->execute([$contenu, $version, $maintenant, $u['id']]);

        /* L'historique n'a pas vocation à grossir sans fin : on garde les
           200 dernières versions, soit largement de quoi revenir en arrière. */
        $db->exec(
            'DELETE FROM etat_historique WHERE id NOT IN ('
            . 'SELECT id FROM (SELECT id FROM etat_historique ORDER BY id DESC LIMIT 200) t)'
        );

        $db->commit();
        saga_json(['version' => $version, 'octets' => strlen($contenu)]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log('Saga — écriture de l\'état impossible : ' . $e->getMessage());
        saga_json(['erreur' => 'enregistrement_impossible',
                   'message' => 'Le serveur n\'a pas pu enregistrer.'], 500);
    }
}

saga_json(['erreur' => 'action_inconnue'], 400);
