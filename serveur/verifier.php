<?php
/* ============================================================
   Page de diagnostic — à ouvrir après le premier dépôt des fichiers
   ============================================================
   Elle ne modifie rien. Elle regarde l'installation et dit, point par
   point, ce qui va et ce qui manque — pour éviter dix allers-retours
   à chercher pourquoi une page reste blanche.

   À supprimer une fois l'installation terminée : elle décrit
   l'installation, ce qui n'a pas à rester lisible publiquement.
   ============================================================ */

$controles = [];

function ctrl($libelle, $etat, $detail = '')
{
    global $controles;
    // $etat : 'ok' | 'alerte' | 'echec'
    $controles[] = ['libelle' => $libelle, 'etat' => $etat, 'detail' => $detail];
}

function texte($v)
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* ---------- PHP ---------- */
$versionOk = version_compare(PHP_VERSION, '8.0', '>=');
ctrl('Version de PHP', $versionOk ? 'ok' : 'echec', PHP_VERSION);

foreach (['pdo_mysql' => 'Accès à MySQL',
          'mbstring'  => 'Textes accentués',
          'json'      => 'Lecture et écriture JSON',
          'session'   => 'Sessions'] as $ext => $role) {
    ctrl($role . ' (' . $ext . ')', extension_loaded($ext) ? 'ok' : 'echec',
         extension_loaded($ext) ? 'présent' : 'extension absente');
}

/* ---------- Fichiers attendus ---------- */
$attendus = ['db.php', 'lib_auth.php', 'login.php', 'logout.php', 'schema.sql', '.htaccess'];
$manquants = [];
foreach ($attendus as $f) {
    if (!is_file(__DIR__ . '/' . $f)) {
        $manquants[] = $f;
    }
}
ctrl('Fichiers du socle', $manquants ? 'echec' : 'ok',
     $manquants ? 'manque : ' . implode(', ', $manquants) : count($attendus) . ' fichiers présents');

/* Le .htaccess est-il vraiment pris en compte ? Le serveur doit refuser
   les fichiers cachés : on interroge notre propre site pour le savoir. */
ctrl('Fichier .htaccess déposé', is_file(__DIR__ . '/.htaccess') ? 'ok' : 'alerte',
     is_file(__DIR__ . '/.htaccess')
       ? 'présent — attention, il est invisible par défaut dans FileZilla'
       : 'absent : HTTPS non forcé et config.php lisible par le web');

/* ---------- Configuration ---------- */
$configPresente = is_file(__DIR__ . '/config.php');
ctrl('Fichier config.php', $configPresente ? 'ok' : 'echec',
     $configPresente ? 'présent' : 'à créer en recopiant config.example.php');

$config = $configPresente ? require __DIR__ . '/config.php' : [];
if (!is_array($config)) {
    $config = [];
}

if ($configPresente) {
    $vides = [];
    foreach (['db_host' => 'hôte', 'db_nom' => 'nom de la base',
              'db_user' => 'utilisateur', 'db_pass' => 'mot de passe'] as $cle => $libelle) {
        if (empty($config[$cle])) {
            $vides[] = $libelle;
        }
    }
    ctrl('Identifiants de la base', $vides ? 'echec' : 'ok',
         $vides ? 'à compléter : ' . implode(', ', $vides) : 'les quatre valeurs sont renseignées');
}

/* ---------- Base de données ---------- */
$pdo = null;
if ($configPresente && empty($vides)) {
    try {
        $pdo = new PDO(
            'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_nom'] . ';charset=utf8mb4',
            $config['db_user'], $config['db_pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 8]
        );
        ctrl('Connexion à la base', 'ok', 'établie');
    } catch (PDOException $e) {
        // Le message brut peut contenir l'utilisateur : on n'en garde que la nature
        $motif = 'refusée';
        if (strpos($e->getMessage(), 'Access denied') !== false) {
            $motif = 'identifiants refusés — vérifiez utilisateur et mot de passe';
        } elseif (strpos($e->getMessage(), 'Unknown database') !== false) {
            $motif = 'base introuvable — vérifiez le nom (dbsXXXXXXXX)';
        } elseif (stripos($e->getMessage(), 'resolve') !== false
               || stripos($e->getMessage(), 'connect') !== false) {
            $motif = 'serveur injoignable — vérifiez l\'hôte';
        }
        ctrl('Connexion à la base', 'echec', $motif);
    }
}

if ($pdo) {
    $attenduesTables = ['utilisateurs', 'etat', 'etat_historique', 'connexions', 'reglages'];
    $presentes = [];
    foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) {
        $presentes[] = $t;
    }
    $absentes = array_diff($attenduesTables, $presentes);
    ctrl('Tables du CRM', $absentes ? 'alerte' : 'ok',
         $absentes ? 'pas encore créées — c\'est install.php qui s\'en charge'
                   : count($attenduesTables) . ' tables en place');

    if (!$absentes) {
        $nb = (int) $pdo->query('SELECT COUNT(*) FROM utilisateurs')->fetchColumn();
        ctrl('Compte administrateur', $nb ? 'ok' : 'alerte',
             $nb ? $nb . ' compte(s) — l\'installation est faite'
                 : 'aucun compte : ouvrez install.php');
    }
}

/* ---------- Sécurité ---------- */
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
      || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
ctrl('Connexion sécurisée (HTTPS)', $https ? 'ok' : 'alerte',
     $https ? 'la page est bien servie en HTTPS' : 'page ouverte en HTTP — vérifiez le .htaccess');

$installPresent = is_file(__DIR__ . '/install.php');
$installFait = false;
if ($pdo) {
    try {
        $installFait = (int) $pdo->query('SELECT COUNT(*) FROM utilisateurs')->fetchColumn() > 0;
    } catch (PDOException $e) {
        $installFait = false;
    }
}
if ($installPresent && $installFait) {
    ctrl('Script d\'installation', 'alerte',
         'install.php est encore sur le serveur : à supprimer (il est déjà verrouillé, mais autant l\'ôter)');
} elseif ($installPresent) {
    ctrl('Script d\'installation', 'ok', 'présent, en attente de votre passage');
} else {
    ctrl('Script d\'installation', 'ok', 'supprimé — c\'est bien');
}

if (session_start()) {
    ctrl('Écriture des sessions', 'ok', 'le serveur sait retenir une connexion');
    session_destroy();
} else {
    ctrl('Écriture des sessions', 'echec', 'le serveur ne peut pas ouvrir de session');
}

/* ---------- Bilan ---------- */
$echecs  = 0;
$alertes = 0;
foreach ($controles as $c) {
    if ($c['etat'] === 'echec')  $echecs++;
    if ($c['etat'] === 'alerte') $alertes++;
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Diagnostic — Saga Dressing</title>
<style>
  body { font-family:system-ui,-apple-system,"Segoe UI",sans-serif; background:#F7F3ED; color:#1C1712;
         margin:0; padding:30px 18px; display:flex; justify-content:center; }
  .boite { width:100%; max-width:660px; background:#fff; border:1px solid #E8DFD1;
           border-radius:16px; padding:28px; }
  h1 { font-size:1.25rem; margin:0 0 4px; }
  .sous { color:#5B5347; font-size:.9rem; margin:0 0 22px; line-height:1.5; }
  .bilan { padding:13px 15px; border-radius:10px; font-size:.94rem; margin-bottom:20px; line-height:1.5; }
  .bilan.ok     { background:#E3F0E7; border:1px solid #BEDCC9; color:#2F6349; }
  .bilan.alerte { background:#F6EEDC; border:1px solid #E2D2AE; color:#7A5A18; }
  .bilan.echec  { background:#F7E7E4; border:1px solid #E4C4BE; color:#8E3327; }
  table { width:100%; border-collapse:collapse; font-size:.92rem; }
  td { padding:9px 4px; border-bottom:1px solid #F0E8DA; vertical-align:top; }
  td.p { width:26px; font-size:1rem; }
  td.d { color:#5B5347; text-align:right; font-size:.84rem; }
  .note { margin-top:22px; font-size:.84rem; color:#5B5347; line-height:1.6; }
  code { background:#F2EBE0; padding:2px 5px; border-radius:4px; }
</style>
</head>
<body>
<div class="boite">
  <h1>Diagnostic de l'installation</h1>
  <p class="sous">Cette page ne modifie rien. Elle regarde l'état du serveur et signale ce qui manque.</p>

  <?php if ($echecs): ?>
    <div class="bilan echec"><strong><?= $echecs ?> point(s) bloquant(s).</strong>
      Tant qu'ils ne sont pas réglés, le CRM ne peut pas fonctionner.</div>
  <?php elseif ($alertes): ?>
    <div class="bilan alerte"><strong>L'essentiel fonctionne</strong>, mais <?= $alertes ?> point(s)
      demandent votre attention.</div>
  <?php else: ?>
    <div class="bilan ok"><strong>Tout est en ordre.</strong> Vous pouvez supprimer cette page.</div>
  <?php endif; ?>

  <table>
    <?php foreach ($controles as $c): ?>
      <tr>
        <td class="p"><?= $c['etat'] === 'ok' ? '✅' : ($c['etat'] === 'alerte' ? '⚠️' : '❌') ?></td>
        <td><?= texte($c['libelle']) ?></td>
        <td class="d"><?= texte($c['detail']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>

  <p class="note">
    <strong>Une fois l'installation terminée</strong>, supprimez <code>verifier.php</code> et
    <code>install.php</code> du serveur : ils décrivent l'installation, ce qui n'a pas à rester
    lisible par n'importe qui.
  </p>
</div>
</body>
</html>
