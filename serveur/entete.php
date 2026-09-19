<?php
/* ============================================================
   En-tête commun à toutes les pages du CRM
   ============================================================
   Inclus en tête de chaque page par le script de construction.
   Il fait deux choses : refuser l'accès à qui n'est pas connecté,
   et transmettre à la page l'état complet du CRM.

   L'état est écrit directement dans le HTML plutôt que récupéré par
   une requête : l'application le lit de façon synchrone dès son
   démarrage, comme elle lisait le stockage du navigateur. Passer par
   une requête aurait imposé de réécrire chacun des appels.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';
require_once __DIR__ . '/comptes_actions.php';

/* ============ Ces pages ne se mettent pas en cache ============
   Deux raisons, et la seconde est la plus sérieuse.

   Les adresses de nav.js et style.css portent le numéro de version, ce qui
   force leur rechargement. Les pages .php, non : un navigateur gardait donc
   l'ancienne, et ses boutons appelaient des fonctions d'une version révolue —
   ou, comme sur l'écran des emails, restaient grisés sans explication. Trois
   épisodes de « boutons muets » ont eu cette cause.

   Surtout, l'état complet du CRM est écrit dans la page. Une page en cache,
   c'est donc un CRM figé à la veille : des ventes, des paiements et des
   chiffres périmés, sans rien qui le signale. */
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

saga_exiger_connexion();

/* Les Paramètres règlent le CRM lui-même : comptes, envoi d'emails, données.
   Rien à y faire pour qui consulte ou tient la facturation. Le lien est
   retiré du menu, et l'adresse tapée à la main renvoie au tableau de bord. */
$SAGA_ROLE = saga_utilisateur()['role'];
if (in_array($SAGA_ROLE, ['lecture', 'comptable'], true)
    && basename($_SERVER['SCRIPT_NAME']) === 'parametres.php') {
    header('Location: dashboard.php');
    exit;
}

$SAGA_UTILISATEUR = saga_utilisateur();

/* Les formulaires de comptes sont traités ici, avant que la page ne
   s'écrive : c'est ce qui permet de rediriger ensuite, et donc qu'un
   rafraîchissement ne rejoue pas l'action. */
saga_traiter_comptes();

function saga_etat_initial()
{
    $db = saga_db();
    $ligne = $db->query('SELECT contenu, version FROM etat WHERE id = 1')->fetch();
    if (!$ligne) {
        $st = $db->prepare('INSERT INTO etat (id, contenu, version, maj_le) VALUES (1, ?, 0, ?)');
        $st->execute(['{}', date('Y-m-d H:i:s')]);
        $ligne = ['contenu' => '{}', 'version' => 0];
    }
    return $ligne;
}

/* Bloc à insérer dans la page, avant les scripts de l'application. */
function saga_script_etat()
{
    global $SAGA_UTILISATEUR;
    $ligne = saga_etat_initial();

    $charge = [
        'version'     => (int) $ligne['version'],
        'jeton'       => saga_jeton(),
        'utilisateur' => [
            'id'     => (int) $SAGA_UTILISATEUR['id'],
            'prenom' => $SAGA_UTILISATEUR['prenom'],
            'nom'    => $SAGA_UTILISATEUR['nom'],
            'email'  => $SAGA_UTILISATEUR['email'],
            'role'   => $SAGA_UTILISATEUR['role'],
        ],
    ];

    /* Le JSON est écrit dans un script de type non exécutable, puis relu par
       l'application. Reste le cas d'une donnée contenant « </script> » : elle
       refermerait la balise et le reste deviendrait du code. Les chevrons sont
       donc réécrits sous leur forme échappée — ils ne peuvent apparaître que
       dans une chaîne JSON, la transformation est donc toujours valide. */
    $sur  = str_replace(['<', '>'], ['\u003C', '\u003E'], $ligne['contenu']);
    $meta = json_encode($charge, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);

    return '<script type="application/json" id="sagaEtatInitial">' . $sur . '</script>' . "\n"
         . '<script type="application/json" id="sagaContexte">' . $meta . '</script>';
}
