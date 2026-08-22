<?php
/* ============================================================
   Actions sur les comptes
   ============================================================
   Appelé par entete.php, donc avant que la page n'écrive quoi que ce
   soit : c'est ce qui permet de rediriger après un enregistrement, et
   donc d'éviter qu'un rafraîchissement ne rejoue l'action.

   L'affichage, lui, est dans comptes_bloc.php — à l'intérieur de
   l'onglet Utilisateurs des Paramètres. Un seul endroit pour gérer les
   accès : deux, c'était en chercher un.
   ============================================================ */

const SAGA_ROLES_COMPTES = [
    'admin'   => 'Administratrice — accès complet, gère les comptes',
    'gestion' => 'Gestion — saisit et modifie, ne gère pas les comptes',
    'lecture' => 'Consultation — regarde sans rien modifier',
];

function saga_compte($id)
{
    $st = saga_db()->prepare('SELECT * FROM utilisateurs WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch();
}

function saga_comptes_tous()
{
    return saga_db()->query(
        'SELECT * FROM utilisateurs ORDER BY proprietaire DESC, prenom, nom')->fetchAll();
}

/* Message à afficher au prochain affichage de la page */
function saga_message_comptes($texte = null, $genre = 'ok')
{
    saga_session_demarrer();
    if ($texte !== null) {
        $_SESSION['message_comptes'] = ['texte' => $texte, 'genre' => $genre];
        return null;
    }
    if (empty($_SESSION['message_comptes'])) {
        return null;
    }
    $m = $_SESSION['message_comptes'];
    unset($_SESSION['message_comptes']);
    return $m;
}

/* Traite un envoi de formulaire de comptes, puis redirige. Ne fait rien
   si la page n'a pas été appelée pour ça. */
function saga_traiter_comptes()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST'
        || (string) filter_input(INPUT_POST, 'module') !== 'comptes') {
        return;
    }

    $moi = saga_utilisateur();
    if (!$moi) {
        return;
    }
    $administre = ($moi['role'] === 'admin');

    $action = (string) filter_input(INPUT_POST, 'action');
    $cible  = (int) filter_input(INPUT_POST, 'id');
    $db = saga_db();
    $erreur = '';
    $succes = '';

    if (!saga_verifier_jeton(filter_input(INPUT_POST, 'jeton'))) {
        $erreur = 'Formulaire expiré. Recommencez.';

    } elseif ($action === 'mot_de_passe') {
        // Sans droits d'administration, on ne change que le sien
        if (!$administre) {
            $cible = (int) $moi['id'];
        }
        $c = saga_compte($cible);
        $mdp  = (string) filter_input(INPUT_POST, 'mdp');
        $mdp2 = (string) filter_input(INPUT_POST, 'mdp2');

        if (!$c) {
            $erreur = 'Ce compte n\'existe pas.';
        } elseif ($mdp !== $mdp2) {
            $erreur = 'Les deux mots de passe ne sont pas identiques.';
        } else {
            $erreur = saga_verifier_mdp($mdp, $c['email'], $c['prenom'] . ' ' . $c['nom']);
            if ($erreur === '') {
                $st = $db->prepare('UPDATE utilisateurs SET mdp_hash = ? WHERE id = ?');
                $st->execute([password_hash($mdp, PASSWORD_DEFAULT), $cible]);
                $succes = (int) $cible === (int) $moi['id']
                    ? 'Votre mot de passe est remplacé.'
                    : 'Mot de passe de ' . $c['prenom'] . ' remplacé. Transmettez-le-lui de vive voix.';
            }
        }

    } elseif (!$administre) {
        $erreur = 'Seul un compte administrateur peut gérer les accès.';

    } elseif ($action === 'creer') {
        $prenom = trim((string) filter_input(INPUT_POST, 'prenom'));
        $nom    = trim((string) filter_input(INPUT_POST, 'nom'));
        $email  = trim(mb_strtolower((string) filter_input(INPUT_POST, 'email')));
        $role   = (string) filter_input(INPUT_POST, 'role');
        $mdp    = (string) filter_input(INPUT_POST, 'mdp');
        $mdp2   = (string) filter_input(INPUT_POST, 'mdp2');

        if ($prenom === '' || $nom === '') {
            $erreur = 'Indiquez le prénom et le nom.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $erreur = 'Cette adresse email n\'est pas valide.';
        } elseif (!isset(SAGA_ROLES_COMPTES[$role])) {
            $erreur = 'Rôle inconnu.';
        } elseif ($mdp !== $mdp2) {
            $erreur = 'Les deux mots de passe ne sont pas identiques.';
        } else {
            $erreur = saga_verifier_mdp($mdp, $email, $prenom . ' ' . $nom);
        }

        if ($erreur === '') {
            $st = $db->prepare('SELECT COUNT(*) FROM utilisateurs WHERE email = ?');
            $st->execute([$email]);
            if ((int) $st->fetchColumn() > 0) {
                $erreur = 'Un compte existe déjà avec cette adresse.';
            } else {
                $st = $db->prepare(
                    'INSERT INTO utilisateurs (email, mdp_hash, prenom, nom, role, proprietaire, actif, cree_le)
                     VALUES (?, ?, ?, ?, ?, 0, 1, ?)');
                $st->execute([$email, password_hash($mdp, PASSWORD_DEFAULT),
                              $prenom, $nom, $role, date('Y-m-d H:i:s')]);
                $succes = 'Accès créé pour ' . $prenom . ' ' . $nom . '. Transmettez-lui son mot de '
                        . 'passe de vive voix : il n\'est écrit nulle part et ne peut pas être relu.';
            }
        }

    } elseif ($action === 'role') {
        $c = saga_compte($cible);
        $role = (string) filter_input(INPUT_POST, 'role');
        if (!$c) {
            $erreur = 'Ce compte n\'existe pas.';
        } elseif ($c['proprietaire']) {
            $erreur = 'Le compte propriétaire reste administrateur : sans lui, plus personne '
                    . 'ne pourrait gérer les accès.';
        } elseif (!isset(SAGA_ROLES_COMPTES[$role])) {
            $erreur = 'Rôle inconnu.';
        } else {
            $st = $db->prepare('UPDATE utilisateurs SET role = ? WHERE id = ?');
            $st->execute([$role, $cible]);
            $succes = 'Rôle de ' . $c['prenom'] . ' modifié.';
        }

    } elseif ($action === 'activer' || $action === 'desactiver') {
        $c = saga_compte($cible);
        $actif = $action === 'activer' ? 1 : 0;
        if (!$c) {
            $erreur = 'Ce compte n\'existe pas.';
        } elseif ($c['proprietaire'] && !$actif) {
            $erreur = 'Le compte propriétaire ne peut pas être désactivé.';
        } elseif ((int) $c['id'] === (int) $moi['id'] && !$actif) {
            $erreur = 'Vous ne pouvez pas vous désactiver vous-même.';
        } else {
            $st = $db->prepare('UPDATE utilisateurs SET actif = ? WHERE id = ?');
            $st->execute([$actif, $cible]);
            $succes = $c['prenom'] . ($actif ? ' peut de nouveau se connecter.'
                                             : ' ne peut plus se connecter.');
        }

    } elseif ($action === 'supprimer') {
        $c = saga_compte($cible);
        if (!$c) {
            $erreur = 'Ce compte n\'existe pas.';
        } elseif ($c['proprietaire']) {
            $erreur = 'Le compte propriétaire ne peut pas être supprimé.';
        } elseif ((int) $c['id'] === (int) $moi['id']) {
            $erreur = 'Vous ne pouvez pas supprimer votre propre compte.';
        } else {
            $st = $db->prepare('DELETE FROM utilisateurs WHERE id = ?');
            $st->execute([$cible]);
            $succes = 'Accès de ' . $c['prenom'] . ' ' . $c['nom'] . ' supprimé.';
        }
    }

    saga_message_comptes($erreur !== '' ? $erreur : $succes, $erreur !== '' ? 'err' : 'ok');

    /* Redirection après enregistrement : sans elle, rafraîchir la page
       rejouerait l'action — créer deux fois le même compte, par exemple. */
    header('Location: parametres.php?onglet=utilisateurs');
    exit;
}
