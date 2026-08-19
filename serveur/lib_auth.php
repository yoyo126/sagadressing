<?php
/* ============================================================
   Connexion, session et politique de mot de passe
   ============================================================ */

require_once __DIR__ . '/db.php';

/* Durée d'inactivité au-delà de laquelle la session est fermée. */
const SAGA_SESSION_DUREE = 8 * 3600;

/* Blocage progressif : au-delà de ce nombre d'échecs sur la fenêtre,
   les tentatives suivantes sont refusées, bonnes ou mauvaises. */
const SAGA_ESSAIS_MAX    = 5;
const SAGA_ESSAIS_FENETRE = 15 * 60;

/* Politique de mot de passe — les mêmes règles que dans l'application. */
const SAGA_MDP_LONGUEUR_MIN = 12;
const SAGA_MDP_FAMILLES_MIN = 3;

function saga_session_demarrer()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = saga_est_https();
    session_set_cookie_params([
        'lifetime' => 0,          // le cookie meurt avec le navigateur
        'path'     => '/',
        'httponly' => true,       // illisible par un script de la page
        'secure'   => $https,     // jamais envoyé en clair une fois le HTTPS en place
        'samesite' => 'Lax',      // pas envoyé depuis un autre site
    ]);
    session_name('saga_session');
    session_start();

    // Session dormante trop longtemps : on la ferme plutôt que de la prolonger
    if (isset($_SESSION['vu_le']) && time() - $_SESSION['vu_le'] > SAGA_SESSION_DUREE) {
        saga_deconnecter();
    }
    $_SESSION['vu_le'] = time();
}

function saga_est_https()
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    // Derrière le répartiteur de charge IONOS, seule cette en-tête dit la vérité
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        return true;
    }
    return false;
}

function saga_ip()
{
    return isset($_SERVER['REMOTE_ADDR']) ? substr($_SERVER['REMOTE_ADDR'], 0, 45) : '';
}

/* ============ Compte connecté ============ */

function saga_utilisateur()
{
    saga_session_demarrer();
    if (empty($_SESSION['uid'])) {
        return null;
    }
    static $u = null;
    if ($u === null) {
        $st = saga_db()->prepare(
            'SELECT id, email, prenom, nom, role, proprietaire, actif FROM utilisateurs WHERE id = ?'
        );
        $st->execute([$_SESSION['uid']]);
        $u = $st->fetch();
        // Compte supprimé ou désactivé entre-temps : la session ne vaut plus rien
        if (!$u || !$u['actif']) {
            saga_deconnecter();
            return null;
        }
    }
    return $u;
}

function saga_exiger_connexion()
{
    if (saga_utilisateur()) {
        return;
    }
    if (saga_requete_json()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['erreur' => 'non_connecte']);
        exit;
    }
    $vers = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    header('Location: login.php?vers=' . urlencode($vers));
    exit;
}

function saga_requete_json()
{
    return isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
}

function saga_deconnecter()
{
    saga_session_demarrer();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* ============ Tentatives de connexion ============ */

function saga_essais_recents($ip, $email)
{
    $depuis = date('Y-m-d H:i:s', time() - SAGA_ESSAIS_FENETRE);
    $st = saga_db()->prepare(
        'SELECT COUNT(*) FROM connexions WHERE reussie = 0 AND quand > ? AND (ip = ? OR email = ?)'
    );
    $st->execute([$depuis, $ip, $email]);
    return (int) $st->fetchColumn();
}

function saga_tracer_connexion($ip, $email, $reussie)
{
    $st = saga_db()->prepare(
        'INSERT INTO connexions (ip, email, reussie, quand) VALUES (?, ?, ?, ?)'
    );
    $st->execute([$ip, substr($email, 0, 190), $reussie ? 1 : 0, date('Y-m-d H:i:s')]);

    // La table n'a pas vocation à grossir indéfiniment
    saga_db()->exec('DELETE FROM connexions WHERE quand < DATE_SUB(NOW(), INTERVAL 30 DAY)');
}

/* Tente une connexion. Renvoie ['ok' => true] ou ['ok' => false, 'message' => …]. */
function saga_connecter($email, $mdp)
{
    saga_session_demarrer();
    $email = trim(mb_strtolower($email));
    $ip    = saga_ip();

    if (saga_essais_recents($ip, $email) >= SAGA_ESSAIS_MAX) {
        return ['ok' => false, 'message' => 'Trop de tentatives. Réessayez dans un quart d\'heure.'];
    }

    $st = saga_db()->prepare('SELECT id, mdp_hash, actif FROM utilisateurs WHERE email = ?');
    $st->execute([$email]);
    $u = $st->fetch();

    /* Le même message et le même temps de calcul, que le compte existe ou non :
       sans cela, la page dirait lesquelles de vos adresses sont enregistrées. */
    $hash = $u ? $u['mdp_hash'] : '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    $bon  = password_verify($mdp, $hash);

    if (!$u || !$bon || !$u['actif']) {
        saga_tracer_connexion($ip, $email, false);
        return ['ok' => false, 'message' => 'Identifiant ou mot de passe incorrect.'];
    }

    // Empreinte à réactualiser si le coût de calcul recommandé a changé
    if (password_needs_rehash($u['mdp_hash'], PASSWORD_DEFAULT)) {
        $maj = saga_db()->prepare('UPDATE utilisateurs SET mdp_hash = ? WHERE id = ?');
        $maj->execute([password_hash($mdp, PASSWORD_DEFAULT), $u['id']]);
    }

    // Nouvel identifiant de session : une session préexistante ne peut pas être réutilisée
    session_regenerate_id(true);
    $_SESSION['uid']   = (int) $u['id'];
    $_SESSION['vu_le'] = time();

    $maj = saga_db()->prepare('UPDATE utilisateurs SET derniere_connexion = ? WHERE id = ?');
    $maj->execute([date('Y-m-d H:i:s'), $u['id']]);

    saga_tracer_connexion($ip, $email, true);
    return ['ok' => true];
}

/* ============ Jeton anti-CSRF ============
   Un formulaire venu d'ailleurs ne peut pas deviner ce jeton : une page
   piégée ne peut donc pas agir en votre nom pendant que vous êtes connectée. */

function saga_jeton()
{
    saga_session_demarrer();
    if (empty($_SESSION['jeton'])) {
        $_SESSION['jeton'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['jeton'];
}

function saga_verifier_jeton($fourni)
{
    saga_session_demarrer();
    return !empty($_SESSION['jeton']) && is_string($fourni)
        && hash_equals($_SESSION['jeton'], $fourni);
}

/* ============ Politique de mot de passe ============
   Renvoie '' si le mot de passe convient, sinon la raison du refus. */

function saga_verifier_mdp($mdp, $email = '', $nom = '')
{
    if (mb_strlen($mdp) < SAGA_MDP_LONGUEUR_MIN) {
        return 'Il faut au moins ' . SAGA_MDP_LONGUEUR_MIN . ' caractères.';
    }

    $familles = 0;
    if (preg_match('/[a-zà-ÿ]/u', $mdp)) $familles++;
    if (preg_match('/[A-ZÀ-Ý]/u', $mdp)) $familles++;
    if (preg_match('/[0-9]/', $mdp))     $familles++;
    if (preg_match('/[^a-zA-Zà-ÿÀ-Ý0-9]/u', $mdp)) $familles++;
    if ($familles < SAGA_MDP_FAMILLES_MIN) {
        return 'Mélangez au moins ' . SAGA_MDP_FAMILLES_MIN
             . ' familles parmi : minuscules, majuscules, chiffres, symboles.';
    }

    $bas = mb_strtolower($mdp);

    // Un mot de passe qui reprend le nom ou l'adresse se devine trop vite
    foreach ([$email, $nom] as $perso) {
        $perso = mb_strtolower(trim((string) $perso));
        foreach (preg_split('/[^a-z0-9]+/u', $perso) as $bout) {
            if (mb_strlen($bout) >= 4 && mb_strpos($bas, $bout) !== false) {
                return 'Il ne doit pas reprendre votre nom ni votre adresse email.';
            }
        }
    }

    $courants = ['motdepasse', 'password', 'azerty', 'qwerty', 'sagadressing', 'bonjour',
                 'soleil', 'admin', '123456', 'abcdef', 'iloveyou', 'dressing'];
    foreach ($courants as $mot) {
        if (mb_strpos($bas, $mot) !== false) {
            return 'Il contient « ' . $mot .' », trop courant pour être sûr.';
        }
    }

    // Suites évidentes et répétitions
    if (preg_match('/(.)\1{3,}/u', $mdp)) {
        return 'Évitez quatre fois le même caractère de suite.';
    }
    foreach (['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'azertyuiop', 'qwertyuiop'] as $suite) {
        for ($i = 0; $i + 4 <= strlen($suite); $i++) {
            if (strpos($bas, substr($suite, $i, 4)) !== false) {
                return 'Évitez les suites de touches ou de chiffres.';
            }
        }
    }

    return '';
}

/* Échappement pour l'affichage — appelé partout où une valeur saisie est écrite. */
function e($texte)
{
    return htmlspecialchars((string) $texte, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
