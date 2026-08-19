<?php
/* ============================================================
   Page de connexion
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';

saga_session_demarrer();

/* Déjà connectée : inutile de redemander */
if (saga_utilisateur()) {
    header('Location: dashboard.php');
    exit;
}

$erreur = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!saga_verifier_jeton(filter_input(INPUT_POST, 'jeton'))) {
        $erreur = 'Formulaire expiré. Recommencez.';
    } else {
        $r = saga_connecter(
            (string) filter_input(INPUT_POST, 'email'),
            (string) filter_input(INPUT_POST, 'mdp')
        );
        if ($r['ok']) {
            /* On ne renvoie que vers une page de ce site : une adresse fournie
               dans l'URL pourrait sinon expédier ailleurs après connexion. */
            $vers = (string) filter_input(INPUT_GET, 'vers');
            $vers = preg_match('#^/[A-Za-z0-9_\-./?=&]*$#', $vers) && strpos($vers, '//') !== 0
                  ? $vers : 'dashboard.php';
            header('Location: ' . $vers);
            exit;
        }
        $erreur = $r['message'];
    }
}

$jeton = saga_jeton();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Connexion — Saga Dressing</title>
<link rel="stylesheet" href="style.css">
<style>
  body { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
  .connexion { width:100%; max-width:400px; background:var(--surface,#fff);
               border:1px solid var(--line,#E8DFD1); border-radius:16px; padding:30px; }
  .marque { font-family:Georgia,serif; font-size:1.5rem; letter-spacing:.02em; margin:0 0 2px; }
  .marque span { display:block; font-family:inherit; font-size:.62rem; letter-spacing:.36em;
                 text-transform:uppercase; color:var(--ink-muted,#5B5347); }
  h1 { font-size:1.05rem; margin:24px 0 4px; }
  .sous { color:var(--ink-muted,#5B5347); font-size:.88rem; margin:0 0 20px; }
  label { display:block; font-size:.74rem; letter-spacing:.04em; text-transform:uppercase;
          color:var(--ink-muted,#5B5347); margin:14px 0 6px; }
  input { width:100%; padding:11px 12px; border:1px solid var(--line,#E8DFD1); border-radius:9px;
          font-size:.98rem; font-family:inherit; }
  button { margin-top:20px; width:100%; padding:12px; border:0; border-radius:9px;
           background:var(--brand-strong,#8C5E23); color:#fff; font-weight:600;
           font-size:.98rem; font-family:inherit; cursor:pointer; }
  .alerte { background:#F7E7E4; border:1px solid #E4C4BE; color:#A6392E;
            padding:11px 13px; border-radius:9px; font-size:.88rem; margin-bottom:14px; }
</style>
</head>
<body>
<div class="connexion">
  <div class="marque">Saga<span>Dressing</span></div>

  <h1>Connexion</h1>
  <p class="sous">Accès réservé aux comptes autorisés.</p>

  <?php if ($erreur !== ''): ?>
    <div class="alerte"><?= e($erreur) ?></div>
  <?php endif; ?>

  <form method="post" autocomplete="on">
    <input type="hidden" name="jeton" value="<?= e($jeton) ?>">

    <label for="email">Adresse email</label>
    <input id="email" name="email" type="email" required autofocus autocomplete="username">

    <label for="mdp">Mot de passe</label>
    <input id="mdp" name="mdp" type="password" required autocomplete="current-password">

    <button type="submit">Se connecter</button>
  </form>
</div>
</body>
</html>
