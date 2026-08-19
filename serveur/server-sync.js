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
  var envoiEnCours = false;
  var envoiDemande = false;
  var enAttente = false;      // vrai tant qu'une modification n'est pas partie

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
    if (genre !== 'erreur') {
      clearTimeout(afficher._t);
      afficher._t = setTimeout(function () { bandeau.style.display = 'none'; }, 2200);
    }
  }

  /* ---------- Envoi ---------- */
  function envoyer() {
    if (envoiEnCours) { envoiDemande = true; return; }
    envoiEnCours = true;

    fetch('api.php?action=ecrire', {
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
      envoiEnCours = false;

      if (r.code === 200) {
        etatVersion = r.corps.version;
        enAttente = false;
        afficher('Enregistré', 'ok');
        if (envoiDemande) { envoiDemande = false; envoyer(); }
        return;
      }

      if (r.code === 409) {
        /* Un autre poste a écrit entre-temps. On ne tranche pas à sa place :
           l'écran est rechargé sur l'état du serveur, et la personne refait
           sa dernière saisie en connaissance de cause. */
        etatVersion = r.corps.version;
        afficher('Modifié sur un autre appareil — rechargement…', 'erreur');
        setTimeout(function () { location.reload(); }, 2500);
        return;
      }

      if (r.code === 401) {
        afficher('Session expirée — reconnexion…', 'erreur');
        setTimeout(function () { location.href = 'login.php'; }, 1500);
        return;
      }

      if (!r.corps) {
        afficher('Le serveur a répondu une erreur (code ' + r.code + ')', 'erreur');
        return;
      }
      afficher(r.corps.message || 'Enregistrement refusé', 'erreur');
    })
    .catch(function () {
      envoiEnCours = false;
      /* Réseau coupé : la saisie n'est pas perdue, elle est dans le navigateur.
         On le dit clairement plutôt que de laisser croire que c'est enregistré. */
      afficher('Hors ligne — vos modifications ne sont pas encore enregistrées', 'erreur');
    });
  }

  function programmerEnvoi() {
    enAttente = true;
    clearTimeout(minuteur);
    minuteur = setTimeout(envoyer, DELAI_ENVOI);
  }

  /* ---------- On enveloppe l'enregistrement local ---------- */
  var sauveLocal = window.sagaSave;
  window.sagaSave = function (cle, valeur) {
    var ok = sauveLocal(cle, valeur);
    if (ok !== false) programmerEnvoi();
    return ok;
  };

  var resetLocal = window.sagaReset;
  window.sagaReset = function () {
    resetLocal();
    programmerEnvoi();
  };

  /* Une fermeture d'onglet ne doit pas emporter une saisie non envoyée. */
  window.addEventListener('beforeunload', function (e) {
    if (enAttente) {
      clearTimeout(minuteur);
      // Envoi de dernière chance, qui survit à la fermeture de la page
      try {
        navigator.sendBeacon('api.php?action=ecrire&beacon=1',
          new Blob([JSON.stringify({ version: etatVersion, etat: etatComplet(), jeton: jeton })],
                   { type: 'application/json' }));
      } catch (err) { /* rien à faire de plus */ }
    }
  });

  /* ---------- Identité réelle et déconnexion ----------
     Le menu affiche l'utilisateur tiré de la liste locale : sur le serveur,
     c'est la session qui fait foi. On corrige après chaque rendu du menu, et
     on ajoute le lien de déconnexion, qui n'avait pas lieu d'être tant que
     l'application vivait dans un seul navigateur. */
  var rendreMenu = window.renderSagaSidebar;
  if (typeof rendreMenu === 'function') {
    window.renderSagaSidebar = function (cle) {
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

    var nomComplet = (moi.prenom + ' ' + moi.nom).trim() || moi.email;
    var nom = pied.querySelector('.user-name');
    if (nom) nom.textContent = nomComplet;

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

  window.sagaVersionEtat = function () { return etatVersion; };
})();
