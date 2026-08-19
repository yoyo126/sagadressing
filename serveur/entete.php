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
saga_exiger_connexion();

$SAGA_UTILISATEUR = saga_utilisateur();

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
