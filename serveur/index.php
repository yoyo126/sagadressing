<?php
/* ============================================================
   Page d'accueil — réservée aux comptes connectés
   ============================================================
   Provisoire : elle atteste que la connexion fonctionne. Elle sera
   remplacée par le tableau de bord quand l'application sera déposée.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';
saga_exiger_connexion();

$u = saga_utilisateur();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Saga Dressing — CRM</title>
<style>
  body { font-family:system-ui,-apple-system,"Segoe UI",sans-serif; background:#F7F3ED; color:#1C1712;
         margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .boite { width:100%; max-width:520px; background:#fff; border:1px solid #E8DFD1;
           border-radius:16px; padding:30px; }
  .marque { font-family:Georgia,serif; font-size:1.5rem; }
  .marque span { display:block; font-size:.62rem; letter-spacing:.36em; text-transform:uppercase;
                 color:#5B5347; }
  .ok { background:#E3F0E7; border:1px solid #BEDCC9; color:#2F6349; padding:14px 16px;
        border-radius:10px; font-size:.95rem; line-height:1.6; margin:22px 0 18px; }
  p { color:#5B5347; font-size:.9rem; line-height:1.6; margin:0 0 14px; }
  a.bouton { display:inline-block; margin-top:8px; padding:10px 16px; border-radius:9px;
             background:#F2EBE0; color:#1C1712; text-decoration:none; font-size:.9rem; }
</style>
</head>
<body>
<div class="boite">
  <div class="marque">Saga<span>Dressing</span></div>

  <div class="ok">
    <strong>Connexion réussie.</strong><br>
    Vous êtes identifiée comme <strong><?= e(trim($u['prenom'] . ' ' . $u['nom'])) ?></strong>
    (<?= e($u['email']) ?>), rôle <?= e($u['role']) ?>.
  </div>

  <p>
    Le serveur fonctionne : base connectée, session ouverte, page protégée.
    L'application elle-même sera déposée ici à l'étape suivante — cette page
    disparaîtra alors au profit du tableau de bord.
  </p>

  <a class="bouton" href="logout.php">Se déconnecter</a>
</div>
</body>
</html>
