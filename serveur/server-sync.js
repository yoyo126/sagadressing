/* ============================================================
   Synchronisation avec le serveur
   ============================================================
   L'application a été écrite pour le stockage du navigateur : quatre-vingt-dix
   endroits lisent `sagaLoad` et `sagaSave`, de façon immédiate. Plutôt que de
   les réécrire un par un en attente réseau — et de risquer d'en oublier —, on
   garde ce fonctionnement et on déplace la source de vérité :

     · au chargement, la page reçoit l'état complet du serveur, déjà inscrit
       dans le HTML : l'application le lit comme avant, sans attendre ;
     · à chaque enregistrement, l'état est renvoyé au serveur, en différé de
       quelques instants pour ne pas envoyer dix fois de suite ;
     · le serveur refuse un enregistrement parti d'une version périmée, ce qui
       signale qu'un autre poste a modifié entre-temps.

   Une action qui change de page aussitôt après avoir enregistré — supprimer,
   importer un live — doit attendre que l'envoi soit parvenu au serveur : sans
   cela, la page suivante recharge un état où la modification n'existe pas.
   C'est le rôle de sagaNaviguer() et sagaRecharger(), redéfinies ici.

   Ce fichier se charge juste après nav.js, dont il enveloppe les fonctions.
   ============================================================ */

(function () {
  'use strict';

  if (typeof sagaSave !== 'function' || typeof sagaLoad !== 'function') {
    console.error('server-sync.js doit être chargé après nav.js.');
    return;
  }

  var PREFIXE = 'saga_';
  var DELAI_ENVOI = 900;        // ms d'inactivité avant d'envoyer
  var etatVersion = 0;
  var jeton = '';
  var minuteur = null;
  var enAttente = false;        // vrai tant qu'une modification n'est pas partie
  var file = Promise.resolve(); // les envois se suivent, jamais en parallèle

  /* ---------- Contexte fourni par la page ---------- */
  function lireBalise(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent || '{}');
    } catch (e) {
      console.error('Contenu illisible dans #' + id, e);
      return null;
    }
  }

  var contexte = lireBalise('sagaContexte') || {};
  var etatInitial = lireBalise('sagaEtatInitial') || {};
  etatVersion = contexte.version || 0;
  jeton = contexte.jeton || '';

  window.SAGA_UTILISATEUR_SERVEUR = contexte.utilisateur || null;

  /* ---------- Amorçage : le serveur fait foi ---------- */
  /* Le navigateur peut contenir des restes de l'époque où l'application y
     stockait tout. On efface avant d'installer l'état du serveur, sans quoi
     d'anciennes données réapparaîtraient par-dessus les vraies. */
  Object.keys(localStorage)
    .filter(function (k) { return k.indexOf(PREFIXE) === 0; })
    .forEach(function (k) { localStorage.removeItem(k); });

  Object.keys(etatInitial).forEach(function (cle) {
    try {
      localStorage.setItem(PREFIXE + cle, JSON.stringify(etatInitial[cle]));
    } catch (e) {
      console.error('Impossible de garder « ' + cle + ' » en mémoire locale.', e);
    }
  });

  /* ---------- Constitution de l'état à envoyer ---------- */
  function etatComplet() {
    var etat = {};
    Object.keys(localStorage).forEach(function (k) {
      if (k.indexOf(PREFIXE) !== 0) return;
      var cle = k.slice(PREFIXE.length);
      try {
        etat[cle] = JSON.parse(localStorage.getItem(k));
      } catch (e) {
        etat[cle] = localStorage.getItem(k);
      }
    });
    return etat;
  }

  /* ---------- Bandeau d'état, discret ---------- */
  var bandeau = null;

  /* Les styles vivent ici : la feuille de l'application est partagée avec la
     version sans serveur, où ce bandeau n'existe pas. */
  var style = document.createElement('style');
  style.textContent =
    '.saga-sync{position:fixed;right:16px;bottom:16px;z-index:2000;display:none;' +
    'padding:9px 14px;border-radius:9px;font-size:.84rem;font-family:inherit;' +
    'box-shadow:0 4px 16px rgba(28,23,18,.14);background:#F2EBE0;color:#5B5347;' +
    'border:1px solid #E8DFD1;max-width:min(340px,80vw);line-height:1.4}' +
    '.saga-sync[data-genre="ok"]{background:#E3F0E7;border-color:#BEDCC9;color:#2F6349}' +
    '.saga-sync[data-genre="erreur"]{background:#F7E7E4;border-color:#E4C4BE;color:#8E3327}';
  document.head.appendChild(style);

  function afficher(texte, genre) {
    if (!bandeau) {
      bandeau = document.createElement('div');
      bandeau.className = 'saga-sync';
      document.body.appendChild(bandeau);
    }
    bandeau.textContent = texte;
    bandeau.dataset.genre = genre || 'info';
    bandeau.style.display = 'block';
    clearTimeout(afficher._t);
    if (genre === 'ok') {
      afficher._t = setTimeout(function () { bandeau.style.display = 'none'; }, 2200);
    }
  }

  /* ---------- Un envoi ----------
     Renvoie une promesse tenue avec true si le serveur a bien enregistré. */
  function envoiUnique() {
    if (!enAttente) return Promise.resolve(true);

    return fetch('api.php?action=ecrire', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Saga-Jeton': jeton
      },
      body: JSON.stringify({ version: etatVersion, etat: etatComplet() })
    })
    .then(function (r) {
      /* Une erreur PHP renvoie du HTML, pas du JSON : on lit le texte brut et
         on tente de l'interpréter, sinon on le signale comme erreur serveur
         plutôt que de le confondre avec une coupure réseau. */
      return r.text().then(function (t) {
        var corps = null;
        try { corps = JSON.parse(t); } catch (e) { corps = null; }
        return { code: r.status, corps: corps };
      });
    })
    .then(function (r) {
      if (r.code === 200) {
        etatVersion = r.corps.version;
        enAttente = false;
        afficher('Enregistré', 'ok');
        return true;
      }

      if (r.code === 409) {
        /* Un autre poste a écrit entre-temps. On ne tranche pas à sa place :
           l'écran est rechargé sur l'état du serveur, et la personne refait
           sa dernière saisie en connaissance de cause. */
        etatVersion = r.corps.version;
        afficher('Modifié sur un autre appareil — rechargement…', 'erreur');
        setTimeout(function () { window.location.reload(); }, 2500);
        return false;
      }

      if (r.code === 401) {
        afficher('Session expirée — reconnexion…', 'erreur');
        setTimeout(function () { window.location.href = 'login.php'; }, 1500);
        return false;
      }

      if (!r.corps) {
        afficher('Le serveur a répondu une erreur (code ' + r.code + ')', 'erreur');
        return false;
      }
      afficher(r.corps.message || 'Enregistrement refusé', 'erreur');
      return false;
    })
    .catch(function () {
      /* Réseau coupé : la saisie n'est pas perdue, elle est dans le navigateur.
         On le dit clairement plutôt que de laisser croire que c'est enregistré. */
      afficher('Hors ligne — vos modifications ne sont pas encore enregistrées', 'erreur');
      return false;
    });
  }

  /* Les envois s'enchaînent : deux ne partent jamais en même temps, sans quoi
     le second se ferait refuser pour version périmée par le premier. */
  function envoyer() {
    file = file.then(envoiUnique, envoiUnique);
    return file;
  }

  function programmerEnvoi() {
    enAttente = true;
    clearTimeout(minuteur);
    minuteur = setTimeout(envoyer, DELAI_ENVOI);
  }

  /* Envoi immédiat de ce qui attend, sans patienter le délai habituel. */
  function envoyerMaintenant() {
    clearTimeout(minuteur);
    return envoyer();
  }

  /* ---------- Droits du compte ----------
     Le serveur refuse déjà ce qu'un compte n'a pas le droit d'écrire : c'est
     lui qui fait foi. Mais un refus découvert après coup trompe — l'écran
     montrait la modification, puis elle disparaissait. Le navigateur applique
     donc la même règle en amont : ce qui est interdit ne s'enregistre pas, et
     les boutons qui y mènent sont grisés et inactifs. */
  var ROLE = (window.SAGA_UTILISATEUR_SERVEUR && window.SAGA_UTILISATEUR_SERVEUR.role) || 'admin';
  var RESTREINT = ROLE === 'lecture' || ROLE === 'comptable';
  var RUBRIQUES_PERMISES = ROLE === 'comptable' ? ['factures', 'journal'] : [];
  var DEBUT = Date.now();

  var LIBELLES_ROLES = { admin: 'Administratrice', gestion: 'Gestionnaire',
                         comptable: 'Comptable', lecture: 'Consultation' };

  function messageInterdit() {
    return ROLE === 'comptable'
      ? 'Compte comptable : seule la facturation se modifie — rien n’a été enregistré.'
      : 'Compte en consultation : rien n’est modifiable — rien n’a été enregistré.';
  }

  /* ---------- On enveloppe l'enregistrement local ---------- */
  var sauveLocal = window.sagaSave;
  window.sagaSave = function (cle, valeur) {
    if (RESTREINT && RUBRIQUES_PERMISES.indexOf(cle) === -1) {
      // Le journal se tait : il suit une action, il n'en est pas une
      if (cle !== 'journal' && Date.now() - DEBUT > 1500) afficher(messageInterdit(), 'erreur');
      return false;
    }
    var ok = sauveLocal(cle, valeur);
    if (ok !== false) programmerEnvoi();
    return ok;
  };

  /* Ce qu'un compte restreint peut encore toucher : naviguer, filtrer,
     chercher, exporter et imprimer. Le comptable, en plus, note les factures. */
  function actionPermise(el) {
    if (!RESTREINT) return true;
    if (el.closest('.sidebar, .toggle-group, .tabs, .cal-pop, .picker, .search, [data-fermer]')) return true;
    var modale = el.closest('.modale');
    if (ROLE === 'comptable' && modale && modale.querySelector('#sagaFactNum')) return true;
    var action = (el.getAttribute('onclick') || '') + ' ' + (el.textContent || '');
    if (ROLE === 'comptable' && /ouvrirFacture/.test(action)) return true;
    return /imprim|export|pdf|csv|t[ée]l[ée]charg|r[ée]cap|relev[ée]|voirTout|filtrerSur|choisirCliente|appliquerRaccourci|genererCSV|doBackup|doExport/i
      .test(action);
  }

  var CIBLES = 'button, .btn, input[type=checkbox], input[type=radio], input[type=file]';

  if (RESTREINT) {
    document.body.classList.add('saga-restreint');

    // Un clic interdit est arrêté avant d'atteindre son bouton
    document.addEventListener('click', function (e) {
      var el = e.target.closest(CIBLES);
      if (!el || actionPermise(el)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      afficher(messageInterdit().replace(' — rien n’a été enregistré.', '.'), 'erreur');
    }, true);

    // Et il se voit d'avance : grisé, curseur interdit
    var style = document.createElement('style');
    style.textContent =
      'body.saga-restreint .saga-interdit{opacity:.35;cursor:not-allowed;}';
    document.head.appendChild(style);

    var prevu = false;
    function marquer() {
      prevu = false;
      document.querySelectorAll(CIBLES).forEach(function (el) {
        el.classList.toggle('saga-interdit', !actionPermise(el));
      });
    }
    new MutationObserver(function () {
      if (prevu) return;
      prevu = true;
      /* Un minuteur plutôt que requestAnimationFrame : ce dernier est suspendu
         dans un onglet en arrière-plan, et les boutons restaient alors actifs
         d'aspect — bloqués au clic, mais sans rien qui le signale. */
      setTimeout(marquer, 30);
    }).observe(document.body, { childList: true, subtree: true });
    marquer();

  }

  var resetLocal = window.sagaReset;
  window.sagaReset = function () {
    resetLocal();
    programmerEnvoi();
  };

  /* ---------- Changer de page sans rien perdre ----------
     Sans serveur, ces deux fonctions partaient sur-le-champ. Ici, elles
     attendent que l'enregistrement soit arrivé : la page suivante relit
     l'état depuis le serveur, et partir trop tôt revenait à annuler ce que
     l'on venait de faire. En cas d'échec, on ne bouge pas — mieux vaut
     rester sur une page où la saisie existe encore. */
  function partir(vers) {
    if (!enAttente) { vers(); return; }
    afficher('Enregistrement…', 'info');
    envoyerMaintenant().then(function (ok) {
      if (ok) { vers(); return; }
      afficher('Non enregistré : la page reste ouverte pour ne rien perdre.', 'erreur');
    });
  }

  window.sagaNaviguer = function (url) {
    partir(function () { window.location.href = url; });
  };

  window.sagaRecharger = function () {
    partir(function () { window.location.reload(); });
  };

  /* Fermeture de l'onglet : envoi de dernière chance, qui survit à la page. */
  window.addEventListener('beforeunload', function () {
    if (!enAttente) return;
    clearTimeout(minuteur);
    try {
      navigator.sendBeacon('api.php?action=ecrire',
        new Blob([JSON.stringify({ version: etatVersion, etat: etatComplet(), jeton: jeton })],
                 { type: 'application/json' }));
    } catch (err) { /* rien de plus à tenter */ }
  });

  /* ---------- Identité réelle et déconnexion ----------
     Le menu affiche l'utilisateur tiré de la liste locale : sur le serveur,
     c'est la session qui fait foi. On corrige après chaque rendu du menu, et
     on ajoute le lien de déconnexion, qui n'avait pas lieu d'être tant que
     l'application vivait dans un seul navigateur. */
  var rendreMenu = window.renderSagaSidebar;
  if (typeof rendreMenu === 'function') {
    window.renderSagaSidebar = function () {
      var r = rendreMenu.apply(this, arguments);
      corrigerMenu();
      return r;
    };
  }

  function corrigerMenu() {
    var moi = window.SAGA_UTILISATEUR_SERVEUR;
    if (!moi) return;

    var pied = document.querySelector('.sidebar-foot');
    if (!pied) return;

    var nom = pied.querySelector('.user-name');
    if (nom) nom.textContent = (moi.prenom + ' ' + moi.nom).trim() || moi.email;

    // Le rôle du compte connecté, pas celui de la liste locale
    var role = pied.querySelector('.user-role');
    if (role) role.textContent = LIBELLES_ROLES[moi.role] || moi.role;

    // Les Paramètres ne concernent ni la consultation ni la comptabilité
    if (moi.role === 'lecture' || moi.role === 'comptable') {
      document.querySelectorAll('.sidebar a[href*="parametres"]').forEach(function (a) { a.remove(); });
      // Un intitulé de rubrique resté sans lien n'a plus rien à annoncer
      document.querySelectorAll('.sidebar .nav-label').forEach(function (l) {
        var suivant = l.nextElementSibling;
        if (!suivant || suivant.classList.contains('nav-label')) l.remove();
      });
    }

    var avatar = pied.querySelector('.user-avatar');
    if (avatar) {
      avatar.textContent = ((moi.prenom || ' ')[0] + (moi.nom || ' ')[0]).toUpperCase().trim() || '?';
    }

    if (!pied.querySelector('[data-deconnexion]')) {
      var lien = document.createElement('a');
      lien.href = 'logout.php';
      lien.dataset.deconnexion = '1';
      lien.className = 'version-crm';
      lien.textContent = 'Se déconnecter';
      lien.style.marginTop = '6px';
      pied.appendChild(lien);
    }
  }

  /* Certains blocs n'ont de sens qu'avec un serveur — la sauvegarde, par
     exemple. Ils sont masqués dans la version sans serveur, et révélés ici. */
  document.querySelectorAll('[data-serveur-seulement]').forEach(function (el) {
    el.style.display = '';
  });

  window.sagaVersionEtat = function () { return etatVersion; };

  /* Le téléversement d'une photo de boutique s'authentifie comme les
     enregistrements : même session, même jeton. */
  window.sagaJetonServeur = function () { return jeton; };
  window.sagaEnvoyerMaintenant = envoyerMaintenant;
})();
