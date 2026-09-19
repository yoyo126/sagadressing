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

/* Deux états sont-ils identiques ? Comparaison de fond, pas de texte : PHP
   écrit « 30.0 » là où le navigateur écrit « 30 », et l'ordre des clés d'un
   objet ne signifie rien. Sans cela, un compte comptable se verrait refuser
   un enregistrement parce qu'un nombre a changé d'écriture, pas de valeur. */
function saga_egal($a, $b)
{
    if ((is_int($a) || is_float($a)) && (is_int($b) || is_float($b))) {
        return abs($a - $b) < 1e-9;
    }
    if (is_object($a) && is_object($b)) {
        $va = get_object_vars($a);
        $vb = get_object_vars($b);
        if (count($va) !== count($vb)) {
            return false;
        }
        foreach ($va as $k => $v) {
            if (!array_key_exists($k, $vb) || !saga_egal($v, $vb[$k])) {
                return false;
            }
        }
        return true;
    }
    if (is_array($a) && is_array($b)) {
        if (count($a) !== count($b)) {
            return false;
        }
        foreach ($a as $i => $v) {
            if (!array_key_exists($i, $b) || !saga_egal($v, $b[$i])) {
                return false;
            }
        }
        return true;
    }
    return $a === $b;
}

/* Les grandes rubriques de l'état qui diffèrent entre deux versions. */
function saga_rubriques_modifiees($avant, $apres)
{
    $a = is_object($avant) ? get_object_vars($avant) : [];
    $b = is_object($apres) ? get_object_vars($apres) : [];
    $modifiees = [];
    foreach (array_unique(array_merge(array_keys($a), array_keys($b))) as $k) {
        $existeA = array_key_exists($k, $a);
        $existeB = array_key_exists($k, $b);
        if ($existeA !== $existeB || ($existeA && !saga_egal($a[$k], $b[$k]))) {
            $modifiees[] = $k;
        }
    }
    return $modifiees;
}

/* Ce qu'un compte comptable a le droit de changer : les factures, et le
   journal qui trace ce geste. Rien d'autre — ni vente, ni règlement, ni
   cliente, ni live. C'est ici que la règle tient : l'écran peut être
   contourné, le serveur non. */
const SAGA_RUBRIQUES_COMPTABLE = ['factures', 'journal'];

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
        'etat'    => json_decode($ligne['contenu']),
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

    /* L'état est relu en objets, jamais en tableaux associatifs. En PHP un
       objet JSON vide devient un tableau vide, que json_encode réécrit « [] » ;
       l'application, elle, y attend « {} », une table à remplir. Elle y rangeait
       une photo de boutique ou un règlement d'apporteur, et la clé nommée posée
       sur un tableau disparaissait à l'enregistrement, sans un mot. */
    $enveloppe = json_decode($brut);
    if (!is_object($enveloppe) || !isset($enveloppe->etat)) {
        saga_json(['erreur' => 'etat_illisible'], 400);
    }
    $contenu = json_encode($enveloppe->etat, JSON_UNESCAPED_UNICODE);
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
                'etat'    => json_decode($courant['contenu']),
            ], 409);
        }

        if ($u['role'] === 'comptable') {
            $touchees = saga_rubriques_modifiees(json_decode($courant['contenu']), $enveloppe->etat);
            $interdites = array_values(array_diff($touchees, SAGA_RUBRIQUES_COMPTABLE));
            if ($interdites) {
                $db->rollBack();
                saga_json([
                    'erreur'  => 'droits_comptable',
                    'message' => 'Un compte comptable ne peut modifier que la facturation.',
                    'refuse'  => $interdites,
                ], 403);
            }
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
