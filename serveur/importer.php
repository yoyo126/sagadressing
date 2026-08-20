<?php
/* ============================================================
   Import des données converties depuis l'ancien CRM
   ============================================================
   Reçoit le fichier JSON produit par convertir.py et l'installe comme
   état du CRM. L'état remplacé est archivé, comme n'importe quelle
   modification : rien n'est perdu, on peut revenir en arrière.

   À supprimer du serveur une fois la reprise faite.
   ============================================================ */

require_once __DIR__ . '/lib_auth.php';
saga_exiger_connexion();

$moi = saga_utilisateur();
if ($moi['role'] !== 'admin') {
    saga_erreur_fatale('Réservé à l\'administrateur',
        'Seul un compte administrateur peut importer des données.');
}

$db = saga_db();
$ligne = $db->query('SELECT contenu, version FROM etat WHERE id = 1')->fetch();
$actuel = $ligne ? json_decode($ligne['contenu'], true) : [];
if (!is_array($actuel)) {
    $actuel = [];
}
$versionActuelle = $ligne ? (int) $ligne['version'] : 0;

/* Ce que contient l'état en place, pour savoir si l'on écrase quelque chose */
function saga_resume($etat)
{
    $r = [];
    foreach (['clientes' => 'cliente', 'lives' => 'live', 'ventes_directes' => 'vente hors live',
              'apporteurs' => 'apporteur', 'agenda' => 'rendez-vous', 'notes' => 'note'] as $cle => $mot) {
        $n = isset($etat[$cle]) && is_array($etat[$cle]) ? count($etat[$cle]) : 0;
        if ($n) {
            $r[] = $n . ' ' . $mot . ($n > 1 ? 's' : '');
        }
    }
    return $r;
}

$resumeActuel = saga_resume($actuel);
$erreur = '';
$fait = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!saga_verifier_jeton(filter_input(INPUT_POST, 'jeton'))) {
        $erreur = 'Formulaire expiré. Rechargez la page.';
    } elseif (empty($_FILES['fichier']['tmp_name']) || $_FILES['fichier']['error'] !== UPLOAD_ERR_OK) {
        $erreur = 'Aucun fichier reçu. Vérifiez sa taille — le serveur limite les envois à '
                . ini_get('upload_max_filesize') . '.';
    } elseif ($resumeActuel && !filter_input(INPUT_POST, 'remplacer')) {
        $erreur = 'Le CRM contient déjà des données. Cochez la case pour confirmer le remplacement.';
    } else {
        $brut = file_get_contents($_FILES['fichier']['tmp_name']);
        $nouveau = json_decode($brut, true);

        if (!is_array($nouveau)) {
            $erreur = 'Ce fichier n\'est pas un état lisible : ' . json_last_error_msg() . '.';
        } elseif (!isset($nouveau['clientes']) || !is_array($nouveau['clientes'])) {
            $erreur = 'Ce fichier ne ressemble pas à un état de CRM : il ne contient aucune cliente.';
        } else {
            $contenu = json_encode($nouveau, JSON_UNESCAPED_UNICODE);
            $maintenant = date('Y-m-d H:i:s');

            $db->beginTransaction();
            try {
                if ($ligne) {
                    $st = $db->prepare('INSERT INTO etat_historique (version, contenu, maj_le, maj_par)
                                        VALUES (?, ?, ?, ?)');
                    $st->execute([$versionActuelle, $ligne['contenu'], $maintenant, $moi['id']]);

                    $st = $db->prepare('UPDATE etat SET contenu = ?, version = ?, maj_le = ?, maj_par = ?
                                        WHERE id = 1');
                    $st->execute([$contenu, $versionActuelle + 1, $maintenant, $moi['id']]);
                } else {
                    $st = $db->prepare('INSERT INTO etat (id, contenu, version, maj_le, maj_par)
                                        VALUES (1, ?, 1, ?, ?)');
                    $st->execute([$contenu, $maintenant, $moi['id']]);
                }
                $db->commit();
                $fait = saga_resume($nouveau);
            } catch (PDOException $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                error_log('Saga — import impossible : ' . $e->getMessage());
                $erreur = 'Le serveur n\'a pas pu enregistrer les données.';
            }
        }
    }
}

$jeton = saga_jeton();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reprise des données — Saga Dressing</title>
<style>
  body { font-family:system-ui,-apple-system,"Segoe UI",sans-serif; background:#F7F3ED; color:#1C1712;
         margin:0; padding:30px 18px; display:flex; justify-content:center; }
  .boite { width:100%; max-width:620px; background:#fff; border:1px solid #E8DFD1;
           border-radius:16px; padding:28px; }
  h1 { font-size:1.25rem; margin:0 0 6px; }
  p { color:#5B5347; font-size:.92rem; line-height:1.6; }
  .encadre { padding:13px 15px; border-radius:10px; font-size:.92rem; line-height:1.55; margin:16px 0; }
  .info   { background:#F2EBE0; border:1px solid #E8DFD1; }
  .alerte { background:#F7E7E4; border:1px solid #E4C4BE; color:#8E3327; }
  .ok     { background:#E3F0E7; border:1px solid #BEDCC9; color:#2F6349; }
  input[type=file] { width:100%; padding:11px; border:1px dashed #D8CDB9; border-radius:9px;
                     background:#FDFBF8; font-family:inherit; font-size:.92rem; }
  label.case { display:flex; gap:9px; align-items:flex-start; margin:16px 0; font-size:.9rem;
               color:#5B5347; line-height:1.5; }
  button { margin-top:8px; padding:12px 18px; border:0; border-radius:9px; background:#8C5E23;
           color:#fff; font-weight:600; font-size:.95rem; font-family:inherit; cursor:pointer; }
  a { color:#8C5E23; }
  code { background:#F2EBE0; padding:2px 5px; border-radius:4px; font-size:.9em; }
</style>
</head>
<body>
<div class="boite">
  <h1>Reprise des données de l'ancien CRM</h1>

<?php if ($fait !== null): ?>
  <div class="encadre ok">
    <strong>Données installées.</strong><br>
    Le CRM contient désormais <?= e(implode(', ', $fait)) ?>.
  </div>
  <p>
    Ouvrez le <a href="dashboard.php">tableau de bord</a> et vérifiez les chiffres.
    L'état précédent est conservé : il reste possible de revenir en arrière.
  </p>
  <p><strong>Supprimez maintenant <code>importer.php</code> du serveur.</strong></p>

<?php else: ?>
  <p>
    Déposez ici le fichier <code>etat.json</code> produit par le convertisseur.
    Il contient vos clientes, lives, ventes, apporteurs, rendez-vous et notes,
    repris de l'ancien CRM.
  </p>

  <?php if ($resumeActuel): ?>
    <div class="encadre alerte">
      <strong>Attention :</strong> le CRM contient déjà <?= e(implode(', ', $resumeActuel)) ?>.
      L'import remplacera l'ensemble. La version actuelle sera archivée avant d'être remplacée.
    </div>
  <?php else: ?>
    <div class="encadre info">Le CRM est vide : l'import n'écrasera rien.</div>
  <?php endif; ?>

  <?php if ($erreur !== ''): ?>
    <div class="encadre alerte"><?= e($erreur) ?></div>
  <?php endif; ?>

  <form method="post" enctype="multipart/form-data">
    <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
    <input type="file" name="fichier" accept=".json,application/json" required>

    <?php if ($resumeActuel): ?>
      <label class="case">
        <input type="checkbox" name="remplacer" value="1">
        <span>Je confirme le remplacement des données actuelles.</span>
      </label>
    <?php endif; ?>

    <button type="submit">Installer les données</button>
  </form>
<?php endif; ?>
</div>
</body>
</html>
