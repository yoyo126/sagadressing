<?php
/* ============================================================
   Les accès au CRM — affichage
   ============================================================
   Inséré par le script de construction à la place de la liste
   d'utilisateurs de la maquette, dans l'onglet Utilisateurs des
   Paramètres. Les actions sont traitées par comptes_actions.php,
   avant que la page ne commence à s'écrire.
   ============================================================ */

$moi = saga_utilisateur();
$administre = ($moi['role'] === 'admin');
$comptes = $administre ? saga_comptes_tous() : [saga_compte($moi['id'])];
$message = saga_message_comptes();
$jeton = saga_jeton();

function saga_derniere_visite($iso)
{
    return $iso ? date('d/m/Y à H\hi', strtotime($iso)) : 'jamais';
}
?>

<?php if ($message): ?>
  <div class="alert-bar" style="margin-bottom:16px;
       <?= $message['genre'] === 'err'
            ? 'background:#F7E7E4; border-color:#E4C4BE; color:#8E3327;'
            : 'background:#E3F0E7; border-color:#BEDCC9; color:#2F6349;' ?>">
    <span><?= e($message['texte']) ?></span>
  </div>
<?php endif; ?>

<div class="panel-head">
  <h2><?= $administre ? 'Accès au CRM' : 'Mon accès' ?></h2>
  <?php if ($administre): ?>
    <span class="chip neutral"><?= count($comptes) ?> compte<?= count($comptes) > 1 ? 's' : '' ?></span>
  <?php endif; ?>
</div>

<p class="card-note" style="max-width:760px; margin-bottom:18px;">
  <?php if ($administre): ?>
    Ces comptes sont ceux qui peuvent réellement se connecter. Tant que l'envoi d'emails
    n'est pas raccordé, c'est vous qui choisissez le mot de passe initial et le transmettez
    de vive voix : il n'est enregistré nulle part en clair, et ne pourra jamais être relu —
    seulement remplacé.
  <?php else: ?>
    Vous pouvez changer votre mot de passe ici. Choisissez-en un que vous n'utilisez
    nulle part ailleurs.
  <?php endif; ?>
</p>

<div class="table-scroll">
<table>
  <thead>
    <tr>
      <th>Personne</th>
      <th>Rôle</th>
      <th>Dernière connexion</th>
      <th style="text-align:right;">Actions</th>
    </tr>
  </thead>
  <tbody>
  <?php foreach ($comptes as $c): ?>
    <tr>
      <td>
        <div class="name-cell">
          <span class="tag-avatar"><?= e(mb_strtoupper(mb_substr($c['prenom'], 0, 1) . mb_substr($c['nom'], 0, 1))) ?></span>
          <span>
            <span class="name-main"><?= e(trim($c['prenom'] . ' ' . $c['nom'])) ?></span>
            <span class="name-sub"><?= e($c['email']) ?></span>
          </span>
        </div>
        <?php if ($c['proprietaire']): ?>
          <span class="chip neutral" style="margin-top:6px;">propriétaire</span>
        <?php endif; ?>
        <?php if (!$c['actif']): ?>
          <span class="chip warn" style="margin-top:6px;">désactivé</span>
        <?php endif; ?>
      </td>

      <td>
        <?php if ($c['proprietaire'] || !$administre): ?>
          <span class="muted"><?= e(explode(' — ', SAGA_ROLES_COMPTES[$c['role']])[0]) ?></span>
        <?php else: ?>
          <form method="post" style="display:inline;">
            <input type="hidden" name="module" value="comptes">
            <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
            <input type="hidden" name="action" value="role">
            <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
            <select class="form-select" name="role" onchange="this.form.submit()" style="min-width:150px;">
              <?php foreach (SAGA_ROLES_COMPTES as $cle => $libelle): ?>
                <option value="<?= e($cle) ?>"<?= $c['role'] === $cle ? ' selected' : '' ?>>
                  <?= e(explode(' — ', $libelle)[0]) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </form>
        <?php endif; ?>
      </td>

      <td class="muted"><?= e(saga_derniere_visite($c['derniere_connexion'])) ?></td>

      <td style="text-align:right; white-space:nowrap;">
        <button class="btn btn-ghost btn-sm"
                onclick="sagaBasculerMdp(<?= (int) $c['id'] ?>)">Mot de passe</button>
        <?php if ($administre && !$c['proprietaire'] && (int) $c['id'] !== (int) $moi['id']): ?>
          <form method="post" style="display:inline;">
            <input type="hidden" name="module" value="comptes">
            <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
            <input type="hidden" name="action" value="<?= $c['actif'] ? 'desactiver' : 'activer' ?>">
            <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
            <button class="btn btn-ghost btn-sm"><?= $c['actif'] ? 'Désactiver' : 'Réactiver' ?></button>
          </form>
          <form method="post" style="display:inline;"
                onsubmit="return confirm('Supprimer définitivement l\'accès de <?= e(str_replace("'", "\\'", $c['prenom'])) ?> ?');">
            <input type="hidden" name="module" value="comptes">
            <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
            <input type="hidden" name="action" value="supprimer">
            <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
            <button class="btn btn-ghost btn-sm" style="color:var(--critical);">Supprimer</button>
          </form>
        <?php endif; ?>
      </td>
    </tr>

    <tr id="mdp-<?= (int) $c['id'] ?>" style="display:none;">
      <td colspan="4" style="background:var(--surface-alt);">
        <form method="post" class="form-grid" style="max-width:520px;">
          <input type="hidden" name="module" value="comptes">
          <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
          <input type="hidden" name="action" value="mot_de_passe">
          <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
          <div class="form-field" style="flex-direction:row; gap:12px;">
            <div style="flex:1;">
              <label class="form-label">Nouveau mot de passe</label>
              <input class="form-input" type="password" name="mdp" required autocomplete="new-password">
            </div>
            <div style="flex:1;">
              <label class="form-label">Répéter</label>
              <input class="form-input" type="password" name="mdp2" required autocomplete="new-password">
            </div>
          </div>
          <span class="card-note">
            12 caractères au minimum, mêlant au moins trois familles parmi minuscules,
            majuscules, chiffres et symboles.
          </span>
          <div>
            <button class="btn btn-secondary btn-sm">Remplacer le mot de passe</button>
            <button type="button" class="btn btn-ghost btn-sm"
                    onclick="sagaBasculerMdp(<?= (int) $c['id'] ?>)">Annuler</button>
          </div>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
</div>

<?php if ($administre): ?>
<div style="margin-top:26px; padding-top:20px; border-top:1px solid var(--line);">
  <div class="panel-head"><h2>Créer un accès</h2></div>

  <form method="post" class="form-grid" style="max-width:560px;">
    <input type="hidden" name="module" value="comptes">
    <input type="hidden" name="jeton" value="<?= e($jeton) ?>">
    <input type="hidden" name="action" value="creer">

    <div class="form-field" style="flex-direction:row; gap:12px;">
      <div style="flex:1;">
        <label class="form-label" for="cPrenom">Prénom</label>
        <input class="form-input" id="cPrenom" name="prenom" required>
      </div>
      <div style="flex:1;">
        <label class="form-label" for="cNom">Nom</label>
        <input class="form-input" id="cNom" name="nom" required>
      </div>
    </div>

    <div class="form-field">
      <label class="form-label" for="cEmail">Adresse email</label>
      <input class="form-input" id="cEmail" name="email" type="email" required>
      <span class="card-note">Elle servira d'identifiant de connexion.</span>
    </div>

    <div class="form-field">
      <label class="form-label" for="cRole">Rôle</label>
      <select class="form-select" id="cRole" name="role">
        <?php foreach (SAGA_ROLES_COMPTES as $cle => $libelle): ?>
          <option value="<?= e($cle) ?>"<?= $cle === 'gestion' ? ' selected' : '' ?>><?= e($libelle) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="form-field" style="flex-direction:row; gap:12px;">
      <div style="flex:1;">
        <label class="form-label" for="cMdp">Mot de passe initial</label>
        <input class="form-input" id="cMdp" name="mdp" type="password" required autocomplete="new-password">
      </div>
      <div style="flex:1;">
        <label class="form-label" for="cMdp2">Répéter</label>
        <input class="form-input" id="cMdp2" name="mdp2" type="password" required autocomplete="new-password">
      </div>
    </div>
    <span class="card-note">
      12 caractères au minimum, mêlant au moins trois familles parmi minuscules, majuscules,
      chiffres et symboles. Prenez-en un au hasard : la personne le remplacera elle-même
      depuis cette page une fois connectée.
    </span>

    <div>
      <button class="btn btn-primary btn-sm">Créer l'accès</button>
    </div>
  </form>
</div>
<?php endif; ?>

<script>
  function sagaBasculerMdp(id) {
    var l = document.getElementById('mdp-' + id);
    l.style.display = l.style.display === 'none' ? '' : 'none';
  }

  /* Après un enregistrement, on revient sur cet onglet plutôt que sur le premier */
  if (new URLSearchParams(location.search).get('onglet') === 'utilisateurs') {
    var o = document.querySelector('[data-tab="tab-users"]');
    if (o) o.click();
  }
</script>
