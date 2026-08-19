<?php
/* ============================================================
   Installation — à ouvrir UNE seule fois, puis à supprimer
   ============================================================
   Crée les tables, puis le compte propriétaire. Le mot de passe est
   choisi ici, sur cette page, par la personne qui installe : il n'est
   écrit nulle part dans le code et n'est jamais transmis à personne.
   Seule son empreinte bcrypt est enregistrée.

   Le script se verrouille dès que le compte existe : il refusera de
   se relancer, même si le fichier reste sur le serveur. Supprimez-le
   quand même, c'est plus propre.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

$db = saga_db();

/* --- Les tables d'abord : sans elles, rien ne peut être vérifié --- */
$sql = file_get_contents(__DIR__ . '/schema.sql');
if ($sql === false) {
    saga_erreur_fatale('Fichier manquant', 'Le fichier <code>schema.sql</code> est absent du dossier.');
}
// Les commentaires retirés, chaque instruction est jouée séparément
$sql = preg_replace('/^\s*--.*$/m', '', $sql);
foreach (array_filter(array_map('trim', explode(';', $sql))) as $instruction) {
    $db->exec($instruction);
}

function saga_reglage($cle)
{
    $st = saga_db()->prepare('SELECT valeur FROM reglages WHERE cle = ?');
    $st->execute([$cle]);
    $v = $st->fetchColumn();
    return $v === false ? null : $v;
}

$deja = saga_reglage('installe') === '1'
     || (int) $db->query('SELECT COUNT(*) FROM utilisateurs')->fetchColumn() > 0;

$erreur = '';
$fait   = false;

if (!$deja && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $prenom  = trim((string) filter_input(INPUT_POST, 'prenom'));
    $nom     = trim((string) filter_input(INPUT_POST, 'nom'));
    $email   = trim(mb_strtolower((string) filter_input(INPUT_POST, 'email')));
    $mdp     = (string) filter_input(INPUT_POST, 'mdp');
    $mdp2    = (string) filter_input(INPUT_POST, 'mdp2');

    if (!saga_verifier_jeton(filter_input(INPUT_POST, 'jeton'))) {
        $erreur = 'Formulaire expiré. Rechargez la page et recommencez.';
    } elseif ($prenom === '' || $nom === '') {
        $erreur = 'Indiquez votre prénom et votre nom.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreur = 'Cette adresse email n\'est pas valide.';
    } elseif ($mdp !== $mdp2) {
        $erreur = 'Les deux mots de passe ne sont pas identiques.';
    } else {
        $erreur = saga_verifier_mdp($mdp, $email, $prenom . ' ' . $nom);
    }

    if ($erreur === '') {
        $maintenant = date('Y-m-d H:i:s');

        $st = $db->prepare(
            'INSERT INTO utilisateurs (email, mdp_hash, prenom, nom, role, proprietaire, actif, cree_le)
             VALUES (?, ?, ?, ?, \'admin\', 1, 1, ?)'
        );
        $st->execute([$email, password_hash($mdp, PASSWORD_DEFAULT), $prenom, $nom, $maintenant]);

        // L'état de départ : une base vide, prête à recevoir les vraies données
        $st = $db->prepare(
            'INSERT INTO etat (id, contenu, version, maj_le, maj_par) VALUES (1, ?, 0, ?, NULL)
             ON DUPLICATE KEY UPDATE id = id'
        );
        $st->execute(['{}', $maintenant]);

        $st = $db->prepare(
            'INSERT INTO reglages (cle, valeur) VALUES (\'installe\', \'1\')
             ON DUPLICATE KEY UPDATE valeur = \'1\''
        );
        $st->execute();

        $fait = true;
        $deja = true;
    }
}

$jeton = saga_jeton();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Installation — Saga Dressing</title>
<style>
  :root { --fond:#F7F3ED; --carte:#fff; --ligne:#E8DFD1; --encre:#1C1712; --doux:#5B5347;
          --marque:#8C5E23; --rouge:#A6392E; --vert:#3E7D5B; }
  * { box-sizing:border-box; }
  body { font-family:system-ui,-apple-system,"Segoe UI",sans-serif; background:var(--fond); color:var(--encre);
         margin:0; padding:32px 20px; display:flex; justify-content:center; }
  .boite { width:100%; max-width:520px; background:var(--carte); border:1px solid var(--ligne);
           border-radius:16px; padding:30px; }
  h1 { font-size:1.3rem; margin:0 0 6px; }
  .sous { color:var(--doux); font-size:.92rem; line-height:1.55; margin:0 0 22px; }
  label { display:block; font-size:.76rem; letter-spacing:.04em; text-transform:uppercase;
          color:var(--doux); margin:16px 0 6px; }
  input { width:100%; padding:11px 12px; border:1px solid var(--ligne); border-radius:9px;
          font-size:.98rem; font-family:inherit; background:#FDFBF8; color:var(--encre); }
  input:focus { outline:2px solid var(--marque); outline-offset:1px; }
  .duo { display:flex; gap:12px; }
  .duo > div { flex:1; }
  button { margin-top:22px; width:100%; padding:12px; border:0; border-radius:9px;
           background:var(--marque); color:#fff; font-size:.98rem; font-family:inherit;
           font-weight:600; cursor:pointer; }
  .note { font-size:.82rem; color:var(--doux); line-height:1.5; margin-top:8px; }
  .alerte { background:#F7E7E4; border:1px solid #E4C4BE; color:var(--rouge);
            padding:12px 14px; border-radius:9px; font-size:.9rem; margin-bottom:4px; }
  .ok { background:#E3F0E7; border:1px solid #BEDCC9; color:var(--vert);
        padding:14px 16px; border-radius:9px; font-size:.94rem; line-height:1.6; }
  code { background:#F2EBE0; padding:2px 6px; border-radius:4px; font-size:.9em; }
</style>
</head>
<body>
<div class="boite">

<?php if ($fait): ?>
  <h1>Installation terminée</h1>
  <div class="ok">
    Le compte <strong><?= e($email) ?></strong> est créé. Votre mot de passe n'est enregistré
    nulle part en clair — seule son empreinte est conservée, et personne ne peut la relire.
  </div>
  <p class="note" style="margin-top:18px;">
    <strong>Deux choses à faire tout de suite :</strong><br>
    1. Supprimez le fichier <code>install.php</code> du serveur.<br>
    2. Connectez-vous sur <a href="login.php">la page de connexion</a> pour vérifier.
  </p>

<?php elseif ($deja): ?>
  <h1>Déjà installé</h1>
  <p class="sous">
    Un compte existe déjà : ce script ne peut plus rien créer. C'est voulu — sans ce verrou,
    n'importe qui pourrait s'octroyer un accès en ouvrant cette page.
  </p>
  <p class="note">
    Supprimez <code>install.php</code> du serveur, puis passez par
    <a href="login.php">la page de connexion</a>. Mot de passe oublié ? Il faudra le
    réinitialiser depuis la base, cette page ne le permet pas.
  </p>

<?php else: ?>
  <h1>Créer le compte propriétaire</h1>
  <p class="sous">
    Ce compte administre le CRM et pourra inviter les suivants. Choisissez ici votre mot de
    passe : il n'est transmis à personne et n'apparaîtra dans aucun fichier.
  </p>

  <?php if ($erreur !== ''): ?>
    <div class="alerte"><?= e($erreur) ?></div>
  <?php endif; ?>

  <form method="post" autocomplete="off">
    <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
    <div class="duo">
      <div>
        <label for="prenom">Prénom</label>
        <input id="prenom" name="prenom" required value="<?= e(filter_input(INPUT_POST, 'prenom')) ?>">
      </div>
      <div>
        <label for="nom">Nom</label>
        <input id="nom" name="nom" required value="<?= e(filter_input(INPUT_POST, 'nom')) ?>">
      </div>
    </div>

    <label for="email">Adresse email — elle servira d'identifiant</label>
    <input id="email" name="email" type="email" required value="<?= e(filter_input(INPUT_POST, 'email')) ?>">

    <label for="mdp">Mot de passe</label>
    <input id="mdp" name="mdp" type="password" required autocomplete="new-password">
    <p class="note">
      12 caractères au minimum, mélangeant au moins trois familles parmi minuscules,
      majuscules, chiffres et symboles. Ni votre nom, ni votre adresse, ni de suite de touches.
      Une phrase dont vous vous souvenez, avec quelques chiffres, vaut mieux qu'un mot compliqué.
    </p>

    <label for="mdp2">Répétez le mot de passe</label>
    <input id="mdp2" name="mdp2" type="password" required autocomplete="new-password">

    <button type="submit">Créer le compte</button>
  </form>
<?php endif; ?>

</div>
</body>
</html>
