<?php
/* ============================================================
   Comptes du CRM
   ============================================================
   Les vrais accès, ceux de la table `utilisateurs` — à ne pas
   confondre avec l'onglet « Utilisateurs » des Paramètres, qui
   n'organise pour l'instant que des rôles sans connexion derrière.

   Les administrateurs gèrent tous les comptes ; chacun peut changer
   le sien. Le mot de passe d'un nouveau compte est choisi ici faute
   d'envoi d'email : il devra être transmis de vive voix, et remplacé
   par son destinataire à la première connexion.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';
saga_exiger_connexion();

$moi = saga_utilisateur();

/* Les administrateurs gèrent tous les comptes ; les autres n'ont accès qu'au
   leur, pour changer leur mot de passe. Leur refuser la page entière
   reviendrait à les obliger à demander à quelqu'un d'autre. */
$administre = ($moi['role'] === 'admin');

$db = saga_db();
$erreur = '';
$succes = '';

const SAGA_ROLES = [
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) filter_input(INPUT_POST, 'action');
    $cible  = (int) filter_input(INPUT_POST, 'id');

    if (!saga_verifier_jeton(filter_input(INPUT_POST, 'jeton'))) {
        $erreur = 'Formulaire expiré. Rechargez la page.';

    } elseif ($action === 'mot_de_passe') {
        // Sans droits d'administration, on ne change que son propre mot de passe
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
                $succes = 'Mot de passe de ' . $c['prenom'] . ' remplacé.';
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
        } elseif (!isset(SAGA_ROLES[$role])) {
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
                $succes = 'Compte créé pour ' . $prenom . ' ' . $nom . '. Transmettez-lui son mot de '
                        . 'passe de vive voix — il n\'est écrit nulle part et ne peut pas être relu.';
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
        } elseif (!isset(SAGA_ROLES[$role])) {
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
            $succes = $c['prenom'] . ($actif ? ' peut de nouveau se connecter.' : ' ne peut plus se connecter.');
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
            $succes = 'Compte de ' . $c['prenom'] . ' ' . $c['nom'] . ' supprimé.';
        }
    }
}

$comptes = $administre
    ? $db->query('SELECT * FROM utilisateurs ORDER BY proprietaire DESC, prenom, nom')->fetchAll()
    : [saga_compte($moi['id'])];
$jeton = saga_jeton();

function saga_quand($iso)
{
    if (!$iso) {
        return 'jamais';
    }
    return date('d/m/Y à H\hi', strtotime($iso));
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comptes — Saga Dressing</title>
<link rel="stylesheet" href="style.css">
<style>
  body { padding:28px 18px; display:flex; justify-content:center; }
  .page { width:100%; max-width:820px; }
  .bloc { background:var(--surface,#fff); border:1px solid var(--line,#E8DFD1);
          border-radius:16px; padding:26px; margin-bottom:18px; }
  h1 { font-size:1.3rem; margin:0 0 6px; }
  h2 { font-size:1rem; margin:0 0 14px; }
  table { width:100%; border-collapse:collapse; font-size:.92rem; }
  th { text-align:left; font-size:.72rem; letter-spacing:.05em; text-transform:uppercase;
       color:var(--ink-muted,#5B5347); padding:0 8px 8px 0; font-weight:600; }
  td { padding:11px 8px 11px 0; border-top:1px solid var(--line,#F0E8DA); vertical-align:top; }
  .msg { padding:12px 15px; border-radius:10px; font-size:.92rem; margin-bottom:16px; line-height:1.55; }
  .msg.ok  { background:#E3F0E7; border:1px solid #BEDCC9; color:#2F6349; }
  .msg.err { background:#F7E7E4; border:1px solid #E4C4BE; color:#8E3327; }
  form.enligne { display:inline; }
  .actions { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
  details { margin-top:10px; }
  summary { cursor:pointer; font-size:.86rem; color:var(--brand-strong,#8C5E23); }
  .grille { display:flex; gap:12px; flex-wrap:wrap; }
  .grille > div { flex:1; min-width:180px; }
</style>
</head>
<body>
<div class="page">

  <a class="back-link" href="parametres.php">← Paramètres</a>

  <div class="bloc">
    <h1><?= $administre ? 'Comptes du CRM' : 'Mon compte' ?></h1>
    <p class="card-note" style="margin-bottom:0;">
      <?php if ($administre): ?>
        Les accès réels : ces comptes-là peuvent se connecter. Faute d'envoi d'emails,
        c'est vous qui choisissez le mot de passe initial et le transmettez de vive voix —
        il n'est enregistré nulle part en clair et ne pourra pas être relu, seulement remplacé.
      <?php else: ?>
        Vous pouvez changer votre mot de passe ici. Choisissez-en un que vous n'utilisez
        nulle part ailleurs.
      <?php endif; ?>
    </p>
  </div>

  <?php if ($succes !== ''): ?><div class="msg ok"><?= e($succes) ?></div><?php endif; ?>
  <?php if ($erreur !== ''): ?><div class="msg err"><?= e($erreur) ?></div><?php endif; ?>

  <div class="bloc">
    <h2><?= $administre
            ? count($comptes) . ' compte' . (count($comptes) > 1 ? 's' : '')
            : 'Mon accès' ?></h2>
    <div class="table-scroll">
    <table>
      <thead><tr><th>Personne</th><th>Rôle</th><th>Dernière connexion</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($comptes as $c): ?>
        <tr>
          <td>
            <strong><?= e(trim($c['prenom'] . ' ' . $c['nom'])) ?></strong>
            <?php if ($c['proprietaire']): ?>
              <span class="chip neutral" style="margin-left:6px;">propriétaire</span>
            <?php endif; ?>
            <?php if (!$c['actif']): ?>
              <span class="chip warn" style="margin-left:6px;">désactivé</span>
            <?php endif; ?>
            <div class="muted" style="font-size:.82rem;"><?= e($c['email']) ?></div>
          </td>
          <td>
            <?php if ($c['proprietaire']): ?>
              <span class="muted">Administratrice</span>
            <?php else: ?>
              <form method="post" class="enligne">
                <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
                <input type="hidden" name="action" value="role">
                <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
                <select class="form-select" name="role" onchange="this.form.submit()" style="min-width:150px;">
                  <?php foreach (SAGA_ROLES as $cle => $libelle): ?>
                    <option value="<?= e($cle) ?>"<?= $c['role'] === $cle ? ' selected' : '' ?>>
                      <?= e(explode(' — ', $libelle)[0]) ?></option>
                  <?php endforeach; ?>
                </select>
              </form>
            <?php endif; ?>
          </td>
          <td class="muted"><?= e(saga_quand($c['derniere_connexion'])) ?></td>
          <td>
            <div class="actions">
              <?php if (!$c['proprietaire'] && (int) $c['id'] !== (int) $moi['id']): ?>
                <form method="post" class="enligne">
                  <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
                  <input type="hidden" name="action" value="<?= $c['actif'] ? 'desactiver' : 'activer' ?>">
                  <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
                  <button class="btn btn-ghost btn-sm"><?= $c['actif'] ? 'Désactiver' : 'Réactiver' ?></button>
                </form>
                <form method="post" class="enligne"
                      onsubmit="return confirm('Supprimer définitivement le compte de <?= e(addslashes($c['prenom'])) ?> ?');">
                  <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
                  <input type="hidden" name="action" value="supprimer">
                  <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
                  <button class="btn btn-ghost btn-sm" style="color:var(--critical);">Supprimer</button>
                </form>
              <?php endif; ?>
            </div>

            <details>
              <summary>Changer le mot de passe</summary>
              <form method="post" style="margin-top:10px;">
                <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
                <input type="hidden" name="action" value="mot_de_passe">
                <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
                <div class="grille">
                  <div><input class="form-input" type="password" name="mdp" placeholder="Nouveau mot de passe" required autocomplete="new-password"></div>
                  <div><input class="form-input" type="password" name="mdp2" placeholder="Répéter" required autocomplete="new-password"></div>
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-top:10px;">Remplacer</button>
              </form>
            </details>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    </div>
  </div>

  <?php if ($administre): ?>
  <div class="bloc">
    <h2>Créer un accès</h2>
    <form method="post">
      <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
      <input type="hidden" name="action" value="creer">

      <div class="grille">
        <div>
          <label class="form-label" for="prenom">Prénom</label>
          <input class="form-input" id="prenom" name="prenom" required>
        </div>
        <div>
          <label class="form-label" for="nom">Nom</label>
          <input class="form-input" id="nom" name="nom" required>
        </div>
      </div>

      <div class="form-field" style="margin-top:12px;">
        <label class="form-label" for="email">Adresse email — elle servira d'identifiant</label>
        <input class="form-input" id="email" name="email" type="email" required>
      </div>

      <div class="form-field" style="margin-top:12px;">
        <label class="form-label" for="role">Rôle</label>
        <select class="form-select" id="role" name="role">
          <?php foreach (SAGA_ROLES as $cle => $libelle): ?>
            <option value="<?= e($cle) ?>"<?= $cle === 'gestion' ? ' selected' : '' ?>><?= e($libelle) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="grille" style="margin-top:12px;">
        <div>
          <label class="form-label" for="mdp">Mot de passe initial</label>
          <input class="form-input" id="mdp" name="mdp" type="password" required autocomplete="new-password">
        </div>
        <div>
          <label class="form-label" for="mdp2">Répéter</label>
          <input class="form-input" id="mdp2" name="mdp2" type="password" required autocomplete="new-password">
        </div>
      </div>
      <p class="card-note" style="margin-top:8px;">
        12 caractères au minimum, mêlant au moins trois familles parmi minuscules, majuscules,
        chiffres et symboles. Choisissez-en un au hasard : la personne le remplacera elle-même
        depuis cette page une fois connectée.
      </p>

      <button class="btn btn-primary btn-sm" style="margin-top:14px;">Créer le compte</button>
    </form>
  </div>
  <?php endif; ?>

  <p class="footnote">Saga Dressing — CRM</p>
</div>
</body>
</html>
