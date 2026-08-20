const SAGA_NAV_ICONS = {
  grid: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  live: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
  people: '<circle cx="8" cy="9" r="3.2"/><circle cx="17" cy="10" r="2.6"/><path d="M2.5 19c0-3.4 2.8-5.5 5.5-5.5s5.5 2.1 5.5 5.5"/><path d="M14.5 19c0-2.6 1.7-4.3 4-4.3"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="3" y1="10" x2="21" y2="10"/>',
  bars: '<rect x="4" y="10" width="4" height="10" rx="1"/><rect x="10" y="5.5" width="4" height="14.5" rx="1"/><rect x="16" y="13" width="4" height="7" rx="1"/>',
  shop: '<path d="M6 8l1.4-3.5A1.6 1.6 0 0 1 8.9 3.5h6.2a1.6 1.6 0 0 1 1.5 1L18 8"/><rect x="4" y="8" width="16" height="12.5" rx="2"/><path d="M9 12a3 3 0 0 0 6 0"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6l7-3Z"/><polyline points="9,12 11,14 15,10"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>'
};

const SAGA_NAV_ITEMS = [
  { key: 'dashboard',  label: 'Tableau de bord', href: 'dashboard.html',  group: 'Pilotage',     icon: 'grid' },
  { key: 'clientes',   label: 'Clientes',        href: 'clientes.html',   group: 'Pilotage',     icon: 'user' },
  { key: 'lives',      label: 'Lives',           href: 'lives.html',      group: 'Pilotage',     icon: 'live' },
  { key: 'apporteurs', label: 'Apporteurs',      href: 'apporteurs.html', group: 'Pilotage',     icon: 'people' },
  { key: 'agenda',     label: 'Agenda',          href: 'agenda.html',     group: 'Organisation', icon: 'calendar' },
  { key: 'rapports',   label: 'Rapports',        href: 'rapports.html',   group: 'Organisation', icon: 'bars' },
  { key: 'boutique',   label: 'Boutique',        href: 'boutique.html',   group: 'Organisation', icon: 'shop' },
  { key: 'parametres', label: 'Paramètres',      href: 'parametres.html', group: 'Réglages',     icon: 'gear' }
];

function renderSagaSidebar(activeKey) {
  const root = document.getElementById('sidebarRoot');
  if (!root) return;

  const groups = [];
  SAGA_NAV_ITEMS.forEach(item => {
    let g = groups.find(g => g.name === item.group);
    if (!g) { g = { name: item.group, items: [] }; groups.push(g); }
    g.items.push(item);
  });

  // Le logo déposé dans Paramètres remplace la marque partout où elle apparaît
  const logo = sagaLoad('logo_ecran', '') || sagaLoad('logo', '');
  const identite = sagaLoad('identite', {});
  const nomMarque = identite.nom || 'Saga Dressing';

  let html = '';
  html += logo
    ? '<div class="brand brand-logo"><img src="' + logo + '" alt="' + nomMarque + '" /></div>'
    : '<div class="brand"><div class="brand-mark serif">S</div><div class="brand-word">' +
      '<span class="brand-word-main">Saga</span><span class="brand-word-sub">Dressing</span></div></div>';
  html += '<nav class="nav">';
  groups.forEach(g => {
    html += '<div class="nav-label">' + g.name + '</div>';
    g.items.forEach(item => {
      const activeClass = item.key === activeKey ? ' active' : '';
      html += '<a class="nav-item' + activeClass + '" href="' + item.href + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' + SAGA_NAV_ICONS[item.icon] + '</svg>' +
        item.label + '</a>';
    });
  });
  html += '</nav>';
  var moi = sagaUtilisateurCourant();
  html += '<div class="sidebar-foot">' +
    '<div class="user-chip"><div class="user-avatar">' + sagaInitiales(moi) + '</div>' +
      '<div class="user-meta"><div class="user-name">' + sagaNomComplet(moi) + '</div>' +
      '<div class="user-role">' + ((SAGA_ROLES[moi.role] || {}).label || 'Utilisateur') + '</div></div></div>' +
    '<a class="version-crm" href="parametres.html" title="Voir l\'historique des versions">Version ' + SAGA_VERSION + '</a>' +
  '</div>';

  root.innerHTML = html;

  monterBarreMobile(logo, nomMarque);

  // Une fois la page en place, les champs date deviennent de vrais calendriers
  setTimeout(function () { sagaInitCalendriers(); }, 0);
}

/* ============ Navigation sur petit écran ============
   Le menu latéral occupe 252 px : sur un téléphone, il mangeait les deux
   tiers de l'écran. Il devient un tiroir, ouvert depuis une barre fixe. */
function monterBarreMobile(logo, nomMarque) {
  if (document.querySelector('.barre-mobile')) return;

  var barre = document.createElement('header');
  barre.className = 'barre-mobile';
  barre.innerHTML =
    '<button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' +
      '<line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>' +
    '</button>' +
    (logo
      ? '<img class="barre-mobile-logo" src="' + logo + '" alt="' + nomMarque + '" />'
      : '<span class="barre-mobile-nom serif">' + nomMarque + '</span>');
  document.body.insertBefore(barre, document.body.firstChild);

  var voile = document.createElement('div');
  voile.className = 'voile';
  document.body.appendChild(voile);

  var sidebar = document.getElementById('sidebarRoot');

  function basculer(ouvrir) {
    sidebar.classList.toggle('ouvert', ouvrir);
    voile.classList.toggle('actif', ouvrir);
    document.body.classList.toggle('menu-ouvert', ouvrir);
    barre.querySelector('.burger').setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
  }

  barre.querySelector('.burger').addEventListener('click', function () {
    basculer(!sidebar.classList.contains('ouvert'));
  });
  voile.addEventListener('click', function () { basculer(false); });
  sidebar.addEventListener('click', function (e) {
    if (e.target.closest('.nav-item')) basculer(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') basculer(false);
  });
}

/* ============ Persistance locale (maquette) ============
   Les données saisies survivent aux changements de page et aux rechargements.
   Tout est stocké dans le navigateur : rien n'est envoyé nulle part. */

var SAGA_PREFIX = 'saga_';

function sagaLoad(key, fallback) {
  try {
    var raw = localStorage.getItem(SAGA_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

/* ============ Textes saisis rendus inoffensifs ============
   Les tableaux de l'application sont construits en assemblant du HTML à la
   main. Un nom de cliente contenant « < » ou une apostrophe droite s'y
   glisserait donc comme balise ou comme fin d'attribut, et pourrait faire
   exécuter n'importe quoi à la page — sans conséquence tant qu'on est seul sur
   son navigateur, mais c'est exactement ce qui devient dangereux le jour où
   plusieurs comptes partagent les mêmes données.

   Plutôt que de compter sur un échappement rappelé à chaque affichage — il en
   manquerait un tôt ou tard — les quatre caractères en cause sont remplacés
   par leurs équivalents typographiques au moment de l'enregistrement. Ils sont
   visuellement identiques, corrects en français (« l'atelier » devient
   « l’atelier »), et inertes partout : HTML, attributs et PDF. */
var SAGA_CARACTERES_SURS = { '<': '‹', '>': '›', '"': '”', "'": '’' };

function sagaTexteSur(valeur) {
  return String(valeur).replace(/[<>"']/g, function (c) { return SAGA_CARACTERES_SURS[c]; });
}

/* Parcourt une donnée enregistrée et neutralise toutes ses chaînes.
   Les images (data:…base64) n'utilisent aucun de ces caractères. */
function sagaAssainir(valeur) {
  if (typeof valeur === 'string') return sagaTexteSur(valeur);
  if (Array.isArray(valeur)) return valeur.map(sagaAssainir);
  if (valeur && typeof valeur === 'object') {
    var out = {};
    Object.keys(valeur).forEach(function (k) { out[k] = sagaAssainir(valeur[k]); });
    return out;
  }
  return valeur;
}

function sagaSave(key, value) {
  try {
    localStorage.setItem(SAGA_PREFIX + key, JSON.stringify(sagaAssainir(value)));
    return true;
  } catch (e) {
    // Quota dépassé : le plus souvent à cause des vignettes trop lourdes
    alert("Impossible d'enregistrer : l'espace du navigateur est plein.\n\nSupprimez quelques vignettes ou réinitialisez les données de test dans Paramètres.");
    return false;
  }
}

/* Les données saisies avant ce correctif n'ont jamais été neutralisées :
   on les reprend une fois, puis plus jamais. */
function sagaAssainirLexistant() {
  if (localStorage.getItem(SAGA_PREFIX + 'assaini') === '1') return;
  Object.keys(localStorage)
    .filter(function (k) { return k.indexOf(SAGA_PREFIX) === 0; })
    .forEach(function (k) {
      var brut = localStorage.getItem(k);
      if (!brut || brut.indexOf('<') === -1 && brut.indexOf("'") === -1) return;
      try {
        localStorage.setItem(k, JSON.stringify(sagaAssainir(JSON.parse(brut))));
      } catch (e) { /* valeur illisible : laissée telle quelle */ }
    });
  localStorage.setItem(SAGA_PREFIX + 'assaini', '1');
}
sagaAssainirLexistant();

/* ============ Changer de page après un enregistrement ============
   Sans serveur, il n'y a rien à attendre : on part. Avec un serveur,
   server-sync.js redéfinit ces deux fonctions pour laisser à
   l'enregistrement le temps d'arriver — sans quoi la page suivante
   relit un état où la modification n'existe pas encore. */
function sagaNaviguer(url) { window.location.href = url; }
function sagaRecharger() { window.location.reload(); }

function sagaReset() {
  Object.keys(localStorage)
    .filter(function (k) { return k.indexOf(SAGA_PREFIX) === 0; })
    .forEach(function (k) { localStorage.removeItem(k); });
}

/* Rend un texte saisi inoffensif dans du HTML : sans cela, un nom contenant
   « & » ou un chevron casserait l'affichage. */
function sagaEchapper(texte) {
  return String(texte === undefined || texte === null ? '' : texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Réduit une image avant stockage : sans ça, quelques photos suffisent
   à saturer l'espace disponible du navigateur.
   `mime` permet de garder la transparence en PNG pour l'affichage écran,
   là où le PDF exige un JPEG opaque. */
function sagaReadImageFormat(file, maxSize, mime, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      var ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      var ctx = canvas.getContext('2d');
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL(mime, 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function sagaReadImage(file, maxSize, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      var ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      var ctx = canvas.getContext('2d');
      // Le JPEG ne gère pas la transparence : sans fond blanc, un PNG
      // transparent ressortirait sur un aplat noir.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* Téléchargement d'un fichier généré côté navigateur */
function sagaDownload(filename, content, mime) {
  var blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ============ Lives : source unique partagée ============
   Un live contient ses articles, chacun rattaché à une lettre de dressing.
   Tous les totaux (par cliente, par live) sont recalculés à partir de cette
   liste : corriger la lettre d'un article suffit à basculer la vente sur la
   bonne cliente, partout dans l'application. */

function sagaAgenda() { return sagaLoad('agenda', []); }

function sagaLives() { return sagaLoad('lives', []); }
function sagaSaveLives(lives) { return sagaSave('lives', lives); }

function sagaLive(id) {
  return sagaLives().filter(function (l) { return l.id === id; })[0] || null;
}

/* ============ Apporteurs d'affaires ============
   Une seule liste pour toute l'application : la page des apporteurs l'affiche,
   les formulaires clientes y prennent les noms proposés. Sans cela, les
   formulaires proposaient deux apporteurs d'exemple qui n'existaient pas. */
function sagaApporteurs() {
  return sagaLoad('apporteurs', []);
}

/* Taux d'un apporteur, retrouvé par son nom */
function sagaPctApporteur(nom) {
  var a = sagaApporteurs().filter(function (x) { return x.nom === nom; })[0];
  return a ? (a.pct || 0) : 0;
}

/* Remplit une liste déroulante d'apporteurs en conservant le choix courant. */
function sagaRemplirApporteurs(select, valeur, avecTaux) {
  if (!select) return;
  var html = ['<option value="">Aucun</option>'];
  sagaApporteurs().forEach(function (a) {
    html.push('<option value="' + sagaEchapper(a.nom) + '">' + sagaEchapper(a.nom)
      + (avecTaux ? ' (' + (a.pct || 0) + ' %)' : '') + '</option>');
  });
  select.innerHTML = html.join('');
  select.value = valeur || '';
}

/* Fiches clientes détaillées, telles qu'elles ont été saisies. */
function sagaFiches() {
  return sagaLoad('clients_data', {});
}

/* Taux appliqués à un code de dressing.
   Priorité à la fiche cliente saisie, puis à son entrée de liste. */
/* ============ Dressings retirés ============
   Supprimer une cliente qui a déjà vendu ne supprime pas ses ventes : elles
   sont rattachées au code du dressing. Sans mémoire de son taux, le calcul
   retombait sur les 30 % par défaut et réécrivait l'histoire — une cliente à
   25 % voyait sa commission passer de 100 à 120 € après coup.

   On garde donc, à part, ce qu'il faut pour que les montants d'hier restent
   ceux d'hier : nom, taux, apporteur. Ces entrées ne sont pas des clientes —
   elles n'apparaissent nulle part dans les listes — seulement de quoi lire
   correctement un historique. */
function sagaDressingsRetires() { return sagaLoad('dressings_retires', {}); }

function sagaArchiverDressing(code, infos) {
  if (!code) return;
  var registre = sagaDressingsRetires();
  registre[code] = {
    prenom: infos.prenom || ('Dressing ' + code),
    nom: infos.nom || infos.prenom || '',
    commission: infos.commission,
    apporteur: infos.apporteur || '',
    apporteurPct: infos.apporteurPct || 0,
    retireLe: sagaAujourdhui()
  };
  sagaSave('dressings_retires', registre);
}

/* Le code redevient celui d'une cliente vivante : l'archive n'a plus lieu d'être */
function sagaOublierDressingRetire(code) {
  var registre = sagaDressingsRetires();
  if (!code || !registre[code]) return;
  delete registre[code];
  sagaSave('dressings_retires', registre);
}

function sagaTauxDressing(lettre) {
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  var fiches = sagaFiches();
  var fiche = Object.keys(fiches).map(function (k) { return fiches[k]; })
    .filter(function (f) { return f.lettre === lettre; })[0];
  // Cliente supprimée : ses taux d'alors, pour ne pas rejouer ses ventes autrement
  var r = sagaDressingsRetires()[lettre];

  function choisir() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== '') return arguments[i];
    }
    return arguments[arguments.length - 1];
  }

  var source = fiche || c || r || null;
  return {
    prenom: choisir(fiche && fiche.prenom, c && c.prenom, r && r.prenom, 'Dressing ' + lettre),
    commission: choisir(fiche && fiche.commission, c && c.pct, r && r.commission, 30),
    apporteur: source ? (source.apporteur || '') : '',
    apporteurPct: (fiche && fiche.apporteurPct) || (r && r.apporteurPct) || 0,
    retire: !fiche && !c && !!r
  };
}

/* Toutes les clientes connues, quelle que soit la page déjà ouverte :
   fiches détaillées, liste des clientes, puis correspondance par défaut. */
function sagaToutesClientes() {
  var vues = {};
  var res = [];

  function ajouter(lettre, prenom, nom, fiche) {
    if (!lettre || vues[lettre]) return;
    vues[lettre] = true;
    res.push({ lettre: lettre, prenom: prenom || ('Dressing ' + lettre), nom: nom || '', fiche: fiche || '' });
  }

  var fiches = sagaFiches();
  Object.keys(fiches).forEach(function (k) {
    ajouter(fiches[k].lettre, fiches[k].prenom, fiches[k].nom, k);
  });
  sagaLoad('clientes', []).forEach(function (c) { ajouter(c.lettre, c.prenom, c.nom, c.key); });

  return res.sort(function (a, b) { return a.prenom.localeCompare(b.prenom, 'fr'); });
}

/* ============ Codes dressing : doublons assumés ============
   Deux clientes peuvent porter le même code — deux Carole en C, par exemple.
   La création ne l'interdit plus : c'est la génération de la boutique qui le
   refuse, puisque c'est là que le code doit désigner une seule cliente. */

/* Contrairement à sagaToutesClientes(), qui regroupe par code, cette liste
   garde chaque cliente séparément : les doublons y restent visibles. */
function sagaListeClientes() {
  var res = [], vues = {};

  function ajouter(c) {
    if (!c.lettre && !c.prenom) return;
    var id = c.key || ('code:' + c.lettre);
    if (vues[id]) return;
    vues[id] = true;
    c.id = id;
    res.push(c);
  }

  sagaLoad('clientes', []).forEach(function (c) {
    ajouter({ key: c.key || '', prenom: c.prenom, nom: c.nom || c.prenom, lettre: c.lettre,
              statut: c.statut === 'inactive' ? 'inactive' : 'active', vignette: c.vignette || '' });
  });
  var fiches = sagaFiches();
  Object.keys(fiches).forEach(function (k) {
    var f = fiches[k];
    ajouter({ key: k, prenom: f.prenom, nom: f.nom || f.prenom, lettre: f.lettre,
              statut: f.statut === 'Inactive' ? 'inactive' : 'active', vignette: '' });
  });
  return res.sort(function (a, b) {
    return String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr');
  });
}

/* Codes portés par plus d'une cliente : { CODE: [clientes] } */
function sagaCodesEnDoublon(liste) {
  var par = {}, out = {};
  (liste || sagaListeClientes()).forEach(function (c) {
    var code = String(c.lettre || '').toUpperCase();
    if (!code) return;
    (par[code] = par[code] || []).push(c);
  });
  Object.keys(par).forEach(function (code) {
    if (par[code].length > 1) out[code] = par[code];
  });
  return out;
}

/* Autres clientes portant déjà ce code (`sauf` = clé de celle qu'on édite) */
function sagaClientesDuCode(code, sauf) {
  code = String(code || '').toUpperCase();
  return sagaListeClientes().filter(function (c) {
    return String(c.lettre || '').toUpperCase() === code && c.id !== sauf && c.key !== sauf;
  });
}

/* Un code s'écrit partout de la même façon : majuscules, sans espace,
   une à trois lettres. « c a » saisi à la main devient donc « CA ». */
function sagaNormaliserCode(brut) {
  return String(brut || '').toUpperCase().replace(/[^A-ZÀ-Ý]/g, '').slice(0, 3);
}

/* Clé de fiche déduite du prénom et du code */
function sagaCleCliente(prenom, code) {
  var base = String(prenom || 'cliente').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return base + '-' + String(code || '').toLowerCase();
}

/* Création d'une cliente depuis n'importe quelle page. La liste et la fiche
   détaillée sont écrites ensemble : sans la seconde, une cliente créée
   depuis un live n'aurait aucune fiche à ouvrir. */
function sagaCreerCliente(champs) {
  champs = champs || {};
  var prenom = String(champs.prenom || '').trim();
  var code = sagaNormaliserCode(champs.lettre);
  var nomComplet = String(champs.nom || '').trim() || prenom;

  var store = sagaLoad('clientes', []);
  var cle = sagaCleCliente(prenom, code), base = cle, n = 2;
  // Deux clientes de même prénom et de même code auraient sinon la même fiche
  while (store.some(function (c) { return c.key === cle; })) { cle = base + '-' + (n++); }

  var entree = {
    key: cle,
    prenom: prenom,
    nom: nomComplet,
    email: String(champs.email || '').trim(),
    tel: sagaTelephone(champs.tel || ''),
    adresse: String(champs.adresse || '').trim(),
    lettre: code,
    apporteur: champs.apporteur || '',
    pct: parseInt(champs.pct, 10) || 30,
    statut: 'active',
    vignette: champs.vignette || ''
  };
  store.push(entree);
  sagaSave('clientes', store);
  // Le code reprend du service : l'archive du dressing retiré n'a plus d'objet
  sagaOublierDressingRetire(code);

  var fiches = sagaFiches();
  fiches[cle] = {
    prenom: prenom, nom: nomComplet, lettre: code, statut: 'Active',
    tel: entree.tel, email: entree.email, adresse: entree.adresse,
    commission: entree.pct,
    apporteur: entree.apporteur || null,
    apporteurPct: sagaPctApporteur(entree.apporteur),
    depuis: sagaDateLongue(sagaAujourdhui()).replace(/^\d+ /, ''),
    pending: null
  };
  sagaSave('clients_data', fiches);
  sagaTracer('Création cliente', prenom + ' (' + code + ')');
  return entree;
}

/* Changement de code d'une cliente, depuis la liste comme depuis la boutique.
   Les ventes restent rattachées à l'ancien code : elles sont enregistrées par
   code de dressing, pas par fiche. L'appelant en avertit. */
function sagaChangerCodeCliente(cle, nouveauCode) {
  var code = sagaNormaliserCode(nouveauCode);
  if (!cle || !code) return '';

  var store = sagaLoad('clientes', []);
  var entree = store.filter(function (c) { return c.key === cle; })[0];
  var ancien = entree ? entree.lettre : '';
  if (entree) { entree.lettre = code; sagaSave('clientes', store); }

  var fiches = sagaFiches();
  if (fiches[cle]) {
    ancien = ancien || fiches[cle].lettre;
    fiches[cle].lettre = code;
    sagaSave('clients_data', fiches);
  }
  sagaTracer('Changement de code dressing', (entree ? entree.prenom : cle) + ' : ' + ancien + ' → ' + code);
  return ancien;
}

/* Suppression d'une cliente : sa fiche et son entrée de liste disparaissent,
   ainsi que les notes qui lui étaient rattachées si son code n'est plus porté
   par personne. Les ventes, elles, restent attachées au code du dressing —
   c'est leur source, pas la fiche — et l'appelant doit en avertir. */
function sagaSupprimerCliente(cle, options) {
  if (!cle) return null;
  options = options || {};

  var store = sagaLoad('clientes', []);
  var entree = store.filter(function (c) { return c.key === cle; })[0] || null;

  var fiches = sagaFiches();
  var fiche = fiches[cle] || null;
  var code = (entree && entree.lettre) || (fiche && fiche.lettre) || '';
  var nom = (entree && (entree.nom || entree.prenom))
         || (fiche && (fiche.nom || fiche.prenom)) || cle;

  sagaSave('clientes', store.filter(function (c) { return c.key !== cle; }));

  if (fiche) {
    delete fiches[cle];
    sagaSave('clients_data', fiches);
  }

  /* Les notes suivent le code, pas la fiche : on ne les retire que si plus
     aucune cliente ne porte ce code, sinon elles appartiennent à l'autre. */
  var notesRetirees = 0;
  if (code && !sagaClientesDuCode(code).length) {
    var notes = sagaNotes();
    var restantes = notes.filter(function (n) { return n.lettre !== code; });
    notesRetirees = notes.length - restantes.length;
    if (notesRetirees) sagaSaveNotes(restantes);
  }

  /* Les ventes sont rattachées au code, pas à la fiche. Deux issues, et
     l'appelant tranche : les emporter avec la fiche, ou les conserver — et
     dans ce cas mémoriser le taux, sinon leurs montants changeraient. */
  var ventesRetirees = 0;
  if (options.supprimerVentes && code) {
    var lives = sagaLives();
    lives.forEach(function (live) {
      var avant = live.articles.length;
      live.articles = live.articles.filter(function (a) { return a.lettre !== code; });
      ventesRetirees += avant - live.articles.length;
      if (live.paiements) delete live.paiements[code];
    });
    // Un live vidé de tous ses articles n'a plus de raison d'être
    sagaSaveLives(lives.filter(function (live) { return live.articles.length > 0; }));

    var directes = sagaVentesDirectes();
    var restantes = directes.filter(function (v) { return v.lettre !== code; });
    ventesRetirees += directes.length - restantes.length;
    if (restantes.length !== directes.length) sagaSaveVentesDirectes(restantes);

    sagaOublierDressingRetire(code);
  } else if (code && sagaVentesDuDressing(code).length) {
    sagaArchiverDressing(code, {
      prenom: (entree && entree.prenom) || (fiche && fiche.prenom) || '',
      nom: nom,
      commission: (fiche && fiche.commission) || (entree && entree.pct) || 30,
      apporteur: (fiche && fiche.apporteur) || (entree && entree.apporteur) || '',
      apporteurPct: (fiche && fiche.apporteurPct) || 0
    });
  }

  sagaTracer('Suppression cliente', nom + (code ? ' (' + code + ')' : ''),
             options.supprimerVentes ? ventesRetirees + ' vente(s) supprimée(s)'
                                     : 'ventes conservées');
  return { nom: nom, code: code, notesRetirees: notesRetirees, ventesRetirees: ventesRetirees };
}

/* Formulaire minimal de création, ouvrable au milieu d'un autre écran :
   attribuer un article à une cliente encore inconnue ne doit pas obliger à
   quitter le live en cours. Rappelle sagaCreerCliente() puis auCreer(entree). */
function sagaModaleNouvelleCliente(options, auCreer) {
  options = options || {};
  var fond = document.createElement('div');
  fond.className = 'modale';
  fond.innerHTML =
    '<div class="modale-boite" style="width:min(460px,100%);">' +
      '<div class="modale-tete"><strong>Nouvelle cliente</strong>' +
        '<button class="btn btn-ghost btn-sm" data-fermer>Fermer</button></div>' +
      '<div class="modale-corps">' +
        '<p class="card-note" style="margin-bottom:14px;">' +
          (options.detail ? sagaEchapper(options.detail)
                          : 'La fiche complète pourra être complétée ensuite dans Clientes.') + '</p>' +
        '<div class="form-field" style="flex-direction:row; gap:12px;">' +
          '<div style="flex:1;"><label class="form-label" for="sagaNcPrenom">Prénom</label>' +
            '<input class="form-input" id="sagaNcPrenom" placeholder="Ex. Carole" /></div>' +
          '<div style="flex:1;"><label class="form-label" for="sagaNcNom">Nom</label>' +
            '<input class="form-input" id="sagaNcNom" placeholder="Ex. Dupont" /></div>' +
        '</div>' +
        '<div class="form-field" style="flex-direction:row; gap:12px; margin-top:12px;">' +
          '<div style="flex:1;"><label class="form-label" for="sagaNcCode">Code dressing</label>' +
            '<input class="form-input" id="sagaNcCode" maxlength="3" placeholder="C ou CA" ' +
              'value="' + sagaEchapper(options.code || '') + '" /></div>' +
          '<div style="flex:1;"><label class="form-label" for="sagaNcPct">Commission Saga (%)</label>' +
            '<input class="form-input" type="number" id="sagaNcPct" value="30" /></div>' +
        '</div>' +
        '<span class="card-note" id="sagaNcInfo" style="display:block; margin-top:8px;">' +
          'Une à trois lettres. Deux clientes peuvent porter le même code : ' +
          'la boutique le signalera au moment de la génération.</span>' +
        '<div class="form-field" style="margin-top:12px;">' +
          '<label class="form-label" for="sagaNcApporteur">Apporteur</label>' +
          '<select class="form-select" id="sagaNcApporteur"></select></div>' +
        '<div style="display:flex; gap:10px; margin-top:18px;">' +
          '<button class="btn btn-primary btn-sm" data-valider>Créer la cliente</button>' +
          '<button class="btn btn-ghost btn-sm" data-fermer>Annuler</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(fond);
  document.body.classList.add('modale-ouverte');
  sagaRemplirApporteurs(fond.querySelector('#sagaNcApporteur'), '', true);

  function fermer() {
    fond.remove();
    document.body.classList.remove('modale-ouverte');
    document.removeEventListener('keydown', auClavier);
    if (options.auFermer) options.auFermer();
  }
  function auClavier(e) { if (e.key === 'Escape') fermer(); }
  document.addEventListener('keydown', auClavier);

  fond.querySelectorAll('[data-fermer]').forEach(function (b) { b.onclick = fermer; });
  fond.addEventListener('mousedown', function (e) { if (e.target === fond) fermer(); });

  var champCode = fond.querySelector('#sagaNcCode');
  var info = fond.querySelector('#sagaNcInfo');

  // Le doublon est annoncé, pas interdit : c'est la boutique qui tranchera
  function verifierCode() {
    var code = sagaNormaliserCode(champCode.value);
    var autres = code ? sagaClientesDuCode(code) : [];
    if (!autres.length) {
      info.style.color = '';
      info.textContent = 'Une à trois lettres. Deux clientes peuvent porter le même code : '
        + 'la boutique le signalera au moment de la génération.';
      return;
    }
    info.style.color = 'var(--warn, #a8710f)';
    info.textContent = 'Code déjà porté par ' + autres.map(function (c) {
      return c.nom || c.prenom;
    }).join(', ') + ' — à départager avant de générer la boutique.';
  }
  champCode.addEventListener('input', verifierCode);
  verifierCode();

  fond.querySelector('[data-valider]').onclick = function () {
    var prenom = fond.querySelector('#sagaNcPrenom').value.trim();
    var code = sagaNormaliserCode(champCode.value);
    if (!prenom) { fond.querySelector('#sagaNcPrenom').focus(); return; }
    if (!code) { champCode.focus(); return; }
    var nom = fond.querySelector('#sagaNcNom').value.trim();
    var entree = sagaCreerCliente({
      prenom: prenom,
      nom: nom ? prenom + ' ' + nom : prenom,
      lettre: code,
      pct: parseInt(fond.querySelector('#sagaNcPct').value, 10) || 30,
      apporteur: fond.querySelector('#sagaNcApporteur').value
    });
    fond.remove();
    document.body.classList.remove('modale-ouverte');
    document.removeEventListener('keydown', auClavier);
    if (auCreer) auCreer(entree);
  };

  setTimeout(function () { fond.querySelector('#sagaNcPrenom').focus(); }, 0);
}

/* Clé de fiche (?c=…) correspondant à une lettre de dressing */
function sagaFicheDressing(lettre) {
  var fiches = sagaFiches();
  var cle = Object.keys(fiches).filter(function (k) { return fiches[k].lettre === lettre; })[0];
  if (cle) return cle;
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  return (c && c.key) || '';
}

/* Coordonnées complètes d'une cliente, pour les fiches et les documents */
function sagaInfosCliente(lettre) {
  var fiches = sagaFiches();
  var fiche = Object.keys(fiches).map(function (k) { return fiches[k]; })
    .filter(function (f) { return f.lettre === lettre; })[0];
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  var r = sagaDressingsRetires()[lettre];
  var t = sagaTauxDressing(lettre);
  return {
    lettre: lettre,
    prenom: t.prenom,
    nom: (fiche && fiche.nom) || (c && c.nom) || (r && r.nom) || t.prenom,
    adresse: (fiche && fiche.adresse) || (c && c.adresse) || '',
    tel: (fiche && fiche.tel) || (c && c.tel) || '',
    email: (fiche && fiche.email) || (c && c.email) || '',
    commission: t.commission,
    apporteur: t.apporteur
  };
}

/* Les montants sont arrêtés au centime dès le calcul.
   Sans cela, les additions en virgule flottante dérivent et un total peut
   tomber sur un demi-centime : le même montant s'arrondissait alors
   différemment selon l'ordre d'addition, et le total affiché ne
   correspondait plus à la somme des lignes affichées. */
/* Les frais de port des giveaways sont intégralement supportés par la
   cliente, au prorata de ses ventes sur le live — cette répartition est faite
   à l'import (sagaRepartirGiveaways). Il n'y a plus de plafond : la règle des
   10 € par live a été abandonnée le 19/08/2026, le contrat suit. */

function sagaCentimes(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

/* Décompte d'un dressing sur un live, recalculé depuis ses articles.
   base = ventes − frais Whatnot ; net = base − giveaways − commissions */
function sagaDecompte(live, lettre) {
  var arts = live.articles.filter(function (a) { return a.lettre === lettre; });
  var ventes = arts.filter(function (a) { return a.type !== 'giveaway'; })
                   .reduce(function (s, a) { return s + a.montant; }, 0);
  var giveaways = arts.filter(function (a) { return a.type === 'giveaway'; })
                      .reduce(function (s, a) { return s + a.montant; }, 0);
  var t = sagaTauxDressing(lettre);

  /* Taux figé sur le live, s'il en porte un.
     Les lives repris de l'ancien CRM gardent le taux avec lequel ils ont été
     réglés à l'époque : une cliente passée de 30 à 20 % verrait sinon ses
     anciens lives recalculés au nouveau taux, et l'historique cesserait de
     correspondre à ce qui lui a été versé. */
  var pctSaga = (live.tauxParCode && live.tauxParCode[lettre] !== undefined)
    ? live.tauxParCode[lettre] : t.commission;

  // Une vente hors Whatnot ne supporte pas les frais de la plateforme
  var soumisFrais = arts.filter(function (a) { return a.type === 'vente'; })
                        .reduce(function (s, a) { return s + a.montant; }, 0);
  var horsLive = arts.filter(function (a) { return a.type === 'horslive'; })
                     .reduce(function (s, a) { return s + a.montant; }, 0);
  var base = sagaCentimes(soumisFrais * (1 - (live.fraisPct || 0) / 100) + horsLive);
  var commSaga = sagaCentimes(base * pctSaga / 100);
  var commApporteur = t.apporteur ? sagaCentimes(base * t.apporteurPct / 100) : 0;

  /* Giveaways : le montant remonté par Whatnot correspond aux frais de port
     du cadeau — la plateforme n'en connaît pas la valeur, que Saga finance.
     Ces frais sont déduits en totalité du net de la cliente. */
  var portGiveaway = giveaways;

  var paiement = (live.paiements || {})[lettre] || null;
  return {
    lettre: lettre, prenom: t.prenom, articles: arts,
    pctSaga: pctSaga, tauxFige: pctSaga !== t.commission,
    ventes: sagaCentimes(ventes), giveaways: sagaCentimes(giveaways), base: base,
    portGiveaway: sagaCentimes(portGiveaway),
    commSaga: commSaga, commApporteur: commApporteur, apporteur: t.apporteur,
    net: sagaCentimes(base - commSaga - commApporteur - portGiveaway),
    paye: !!paiement, paiement: paiement
  };
}

/* ============ Import d'un export Whatnot ============
   Whatnot → Revenus → Exporter. Le fichier ne contient pas le prix de vente
   affiché mais le montant net réellement versé, frais de plateforme déduits :
   c'est donc sur ce net que se calculent la commission Saga et la part de la
   cliente. Pendant les promotions « 0 frais », le net est plus élevé et tout
   le monde y gagne, sans réglage à faire.

   Le libellé d'une vente ressemble à :
     « Revenus générés par la vente de :  PDD 5€ F ( pas d'annulation, ni
       reprise ) #12 »
   la lettre qui suit le prix de départ étant celle du dressing. Les cadeaux
   apparaissent séparément (« Charged deduction of €3.54 for giveaway order
   … »), sans lettre : leur coût est réparti au prorata des ventes. */

/* Lecteur CSV : les libellés contiennent des virgules et des guillemets,
   un simple découpage sur la virgule ne suffit pas. */
function sagaLireCSV(texte) {
  var lignes = [], ligne = [], champ = '', dansGuillemets = false;
  texte = String(texte).replace(/^﻿/, '');

  function finDeChamp() { ligne.push(champ); champ = ''; }
  function finDeLigne() {
    finDeChamp();
    var vide = ligne.every(function (c) { return c.trim() === ''; });
    if (!vide) lignes.push(ligne);
    ligne = [];
  }

  for (var i = 0; i < texte.length; i++) {
    var c = texte.charAt(i);
    if (dansGuillemets) {
      if (c === '"') {
        if (texte.charAt(i + 1) === '"') { champ += '"'; i++; }
        else dansGuillemets = false;
      } else champ += c;
    } else if (c === '"') {
      dansGuillemets = true;
    } else if (c === ',') {
      finDeChamp();
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte.charAt(i + 1) === '\n') i++;
      finDeLigne();
    } else champ += c;
  }
  if (champ !== '' || ligne.length) finDeLigne();
  return lignes;
}

/* « 9,41 € » (avec espace insécable) → 9.41 ; « -3,54 € » → -3.54 */
function sagaMontantWhatnot(txt) {
  var n = parseFloat(String(txt).replace(/[^0-9,.\-]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

var SAGA_MOIS_COURTS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin',
                        'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

/* « 28 juil. 2026, 23:43:39 » → « 2026-07-28 » */
function sagaDateWhatnot(txt) {
  var m = String(txt).match(/(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{4})/);
  if (!m) return '';
  var mois = m[2].toLowerCase().replace(/\./g, '')
    .replace('fevr', 'févr').replace('aout', 'août').replace('dec', 'déc');
  var i = -1;
  SAGA_MOIS_COURTS.forEach(function (court, k) {
    if (i === -1 && mois.indexOf(court) === 0) i = k;
  });
  if (i === -1) return '';
  return m[3] + '-' + ('0' + (i + 1)).slice(-2) + '-' + ('0' + m[1]).slice(-2);
}

/* Code de dressing dans « PDD 5€ F #12 » ou « PDD 5€ CA #12 » ;
   vide si la vente n'en porte pas. Un code de deux ou trois lettres n'est
   retenu que s'il correspond à une cliente connue : sans cela, un mot collé
   au montant serait pris pour un code. */
function sagaLettreWhatnot(libelle) {
  var m = String(libelle).match(/€\s*([A-Za-zÀ-ÿ]{1,3})(?![A-Za-zÀ-ÿ])/);
  if (!m) return '';
  var code = m[1].toUpperCase();
  if (code.length === 1) return code;
  var connus = {};
  sagaListeClientes().forEach(function (c) {
    if (c.lettre) connus[String(c.lettre).toUpperCase()] = true;
  });
  return connus[code] ? code : code.charAt(0);
}

/* Numéros de commande déjà importés, pour ne pas compter deux fois le même
   live si le fichier est déposé une seconde fois. */
function sagaCommandesImportees() {
  var vues = {};
  sagaLives().forEach(function (live) {
    (live.articles || []).forEach(function (a) {
      if (a.commande) vues[a.commande] = live.titre || live.id;
    });
  });
  return vues;
}

/* Analyse d'un export : ne touche à rien, se contente de dire ce qu'il contient. */
function sagaAnalyserWhatnot(texte) {
  var lignes = sagaLireCSV(texte);
  if (lignes.length < 2) return { erreur: 'Fichier vide ou illisible.' };

  var entetes = lignes[0].map(function (h) { return h.trim().toLowerCase(); });
  function col(nom) { return entetes.indexOf(nom); }
  var iDate = col('date de création'), iMontant = col('montant'),
      iCommande = col('numéro de commande'), iMessage = col('message'),
      iStatut = col('statut'), iType = col('type de transaction');

  if (iMontant === -1 || iMessage === -1) {
    return { erreur: "Ce fichier n'a pas le format d'un export Whatnot : "
      + 'les colonnes « Montant » et « Message » sont introuvables.' };
  }

  var dejaVues = sagaCommandesImportees();
  var ventes = [], giveaways = [], ignorees = [], doublons = [];

  for (var i = 1; i < lignes.length; i++) {
    var r = lignes[i];
    var message = (r[iMessage] || '').trim();
    var ligne = {
      commande: iCommande === -1 ? '' : (r[iCommande] || '').trim(),
      date: sagaDateWhatnot(iDate === -1 ? '' : r[iDate]),
      montant: sagaMontantWhatnot(r[iMontant]),
      message: message
    };
    var statut = iStatut === -1 ? 'completed' : (r[iStatut] || '').trim().toLowerCase();
    var type = iType === -1 ? 'SALES' : (r[iType] || '').trim().toUpperCase();

    if (statut !== 'completed') { ligne.raison = 'statut « ' + statut + ' »'; ignorees.push(ligne); continue; }
    if (type !== 'SALES') { ligne.raison = 'ligne ' + type + ' (virement)'; ignorees.push(ligne); continue; }

    if (ligne.commande && dejaVues[ligne.commande]) {
      ligne.raison = 'déjà importée dans « ' + dejaVues[ligne.commande] + ' »';
      doublons.push(ligne);
      continue;
    }

    if (/giveaway/i.test(message)) {
      ligne.montant = Math.abs(ligne.montant);   // Whatnot le note en négatif
      giveaways.push(ligne);
      continue;
    }

    var m = message.match(/vente de\s*:\s*(.+)$/i);
    if (!m) { ligne.raison = 'libellé non reconnu'; ignorees.push(ligne); continue; }

    ligne.libelle = m[1]
      .replace(/\(\s*pas d['’]annulation[^)]*\)/i, '')
      .replace(/\s+/g, ' ').trim();
    ligne.lettre = sagaLettreWhatnot(ligne.libelle);

    if (ligne.montant <= 0) { ligne.raison = 'montant nul ou négatif'; ignorees.push(ligne); continue; }
    ventes.push(ligne);
  }

  // Regroupement par lettre, la chaîne vide rassemblant les ventes sans lettre
  var groupes = {}, ordre = [];
  ventes.forEach(function (v) {
    if (!groupes[v.lettre]) { groupes[v.lettre] = { lettre: v.lettre, ventes: [], total: 0 }; ordre.push(v.lettre); }
    groupes[v.lettre].ventes.push(v);
    groupes[v.lettre].total = sagaCentimes(groupes[v.lettre].total + v.montant);
  });

  var dates = ventes.map(function (v) { return v.date; }).filter(Boolean).sort();

  return {
    ventes: ventes,
    giveaways: giveaways,
    ignorees: ignorees,
    doublons: doublons,
    parLettre: ordre.sort().map(function (l) { return groupes[l]; }),
    date: dates[0] || sagaAujourdhui(),
    totalVentes: sagaCentimes(ventes.reduce(function (s, v) { return s + v.montant; }, 0)),
    totalGiveaways: sagaCentimes(giveaways.reduce(function (s, g) { return s + g.montant; }, 0))
  };
}

/* Coût des giveaways réparti au prorata des ventes de chaque dressing.
   Le dernier centime va au plus gros vendeur : sans cela, la somme des parts
   ne retombait pas exactement sur le total à répartir. */
function sagaRepartirGiveaways(total, totauxParLettre) {
  var parts = {};
  var lettres = Object.keys(totauxParLettre);
  var somme = lettres.reduce(function (s, l) { return s + totauxParLettre[l]; }, 0);
  if (!total || !lettres.length || somme <= 0) {
    lettres.forEach(function (l) { parts[l] = 0; });
    return parts;
  }

  var cumul = 0, plusGros = lettres[0];
  lettres.forEach(function (l) {
    parts[l] = sagaCentimes(total * totauxParLettre[l] / somme);
    cumul = sagaCentimes(cumul + parts[l]);
    if (totauxParLettre[l] > totauxParLettre[plusGros]) plusGros = l;
  });
  parts[plusGros] = sagaCentimes(parts[plusGros] + (total - cumul));
  return parts;
}

/* Construit le live à partir de l'analyse et des choix faits à l'écran.
   `affectations` associe chaque lettre du fichier à la lettre retenue ;
   `sansLettre` fait de même, commande par commande, pour les ventes qui
   n'en portaient pas. */
function sagaLiveDepuisWhatnot(analyse, options) {
  var affectations = options.affectations || {};
  var sansLettre = options.sansLettre || {};
  var articles = [], totaux = {};

  analyse.ventes.forEach(function (v) {
    var lettre = v.lettre
      ? (affectations[v.lettre] || v.lettre)
      : (sansLettre[v.commande] || '');
    articles.push({
      id: 'a' + (v.commande || articles.length),
      commande: v.commande,
      libelle: v.libelle,
      lettre: lettre,
      montant: sagaCentimes(v.montant),
      type: 'vente'
    });
    totaux[lettre] = sagaCentimes((totaux[lettre] || 0) + v.montant);
  });

  var parts = sagaRepartirGiveaways(analyse.totalGiveaways, totaux);
  Object.keys(parts).forEach(function (lettre) {
    if (!parts[lettre]) return;
    articles.push({
      id: 'g-' + lettre,
      libelle: 'Giveaways du live (' + analyse.giveaways.length + ') — part au prorata des ventes',
      lettre: lettre,
      montant: parts[lettre],
      type: 'giveaway'
    });
  });

  return {
    id: 'l-' + analyse.date.replace(/-/g, '') + '-' + Date.now().toString(36),
    date: analyse.date,
    titre: options.titre || ('Live du ' + sagaDateLongue(analyse.date)),
    categorie: options.categorie || '',
    /* Les montants importés sont déjà nets des frais Whatnot : les déduire
       une seconde fois amputerait la cliente. */
    fraisPct: 0,
    encaisse: { statut: 'En attente', date: '' },
    articles: articles
  };
}

/* Lettres présentes sur un live, dans l'ordre d'apparition */
function sagaLettresDuLive(live) {
  var vues = [];
  live.articles.forEach(function (a) { if (vues.indexOf(a.lettre) === -1) vues.push(a.lettre); });
  return vues;
}

function sagaTotauxLive(live) {
  var t = { ventes: 0, giveaways: 0, base: 0, commSaga: 0, commApporteur: 0, portGiveaway: 0, net: 0, reste: 0, clientes: 0 };
  sagaLettresDuLive(live).forEach(function (lettre) {
    var d = sagaDecompte(live, lettre);
    t.clientes++;
    t.ventes += d.ventes; t.giveaways += d.giveaways; t.base += d.base;
    t.commSaga += d.commSaga; t.commApporteur += d.commApporteur; t.net += d.net;
    t.portGiveaway += d.portGiveaway;
    if (!d.paye) t.reste += d.net;
  });
  ['ventes','giveaways','base','commSaga','commApporteur','portGiveaway','net','reste']
    .forEach(function (k) { t[k] = sagaCentimes(t[k]); });
  return t;
}

/* ============ Date du jour ============
   Le CRM travaille sur la date réelle du poste : toutes les pages
   partagent cette référence, il n'y a plus de date figée en dur. */
function sagaAujourdhui() {
  var d = new Date();
  return d.getFullYear() + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2);
}

var SAGA_JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];

function sagaDateJourLongue(iso) {
  var d = new Date((iso || sagaAujourdhui()) + 'T00:00:00');
  return SAGA_JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + SAGA_MOIS[d.getMonth()] + ' ' + d.getFullYear();
}

// Décalage en jours par rapport à aujourd'hui (négatif = passé)
function sagaDecalageJours(iso) {
  return Math.round((new Date(iso + 'T00:00:00') - new Date(sagaAujourdhui() + 'T00:00:00')) / 86400000);
}

/* ============================================================
   Ventes d'une cliente — source unique
   Les ventes vivaient en double : une copie dans la fiche cliente,
   une autre dans le store des lives. Les deux divergeaient (live
   supprimé encore visible, cliente absente de sa propre fiche…).
   Tout est désormais dérivé de `lives` + `ventes_directes`.
   ============================================================ */

function sagaVentesDirectes() { return sagaLoad('ventes_directes', []); }
function sagaSaveVentesDirectes(v) { return sagaSave('ventes_directes', v); }

/* Décompte d'une vente hors Whatnot : ni frais de plateforme, ni giveaway */
function sagaDecompteDirect(v) {
  var t = sagaTauxDressing(v.lettre);
  var commSaga = sagaCentimes(v.montant * t.commission / 100);
  var commApporteur = v.apporteur ? sagaCentimes(v.montant * t.apporteurPct / 100) : 0;
  var frais = v.frais || 0;
  return {
    ventes: sagaCentimes(v.montant), giveaways: 0, base: sagaCentimes(v.montant),
    commSaga: commSaga, commApporteur: commApporteur, frais: frais,
    net: sagaCentimes(v.montant - commSaga - commApporteur - frais),
    apporteur: v.apporteur ? t.apporteur : ''
  };
}

/* Toutes les ventes d'un dressing, lives et hors live réunis, du plus récent au plus ancien.
   C'est ce que lit la fiche cliente : elle ne conserve plus sa propre copie. */
function sagaVentesDuDressing(lettre) {
  var res = [];

  sagaLives().forEach(function (live) {
    if (sagaLettresDuLive(live).indexOf(lettre) === -1) return;
    var d = sagaDecompte(live, lettre);
    res.push({
      origine: 'live', liveId: live.id, date: live.date, label: live.titre,
      lettre: lettre, ventes: d.ventes, giveaways: d.giveaways,
      portGiveaway: d.portGiveaway,
      commission: d.commSaga, apporteurMontant: d.commApporteur, frais: 0,
      net: d.net, paye: d.paye ? 1 : 0,
      datePaiement: d.paye ? d.paiement.date : '', modePaiement: d.paye ? d.paiement.mode : '',
      nbArticles: d.articles.length
    });
  });

  sagaVentesDirectes().filter(function (v) { return v.lettre === lettre; }).forEach(function (v) {
    var d = sagaDecompteDirect(v);
    res.push({
      origine: 'direct', venteId: v.id, date: v.date, label: v.libelle,
      lettre: lettre, ventes: d.ventes, giveaways: 0, portGiveaway: 0,
      commission: d.commSaga, apporteurMontant: d.commApporteur, frais: d.frais,
      net: d.net, paye: v.paye ? 1 : 0,
      datePaiement: v.datePaiement || '', modePaiement: v.paye ? 'Virement' : '',
      nbArticles: 1
    });
  });

  return res.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
}

function sagaFichesApporteurs() {
  return sagaLoad('apporteurs_data', {});
}

/* Pièces exigées d'un apporteur d'affaires. Définies ici pour que la liste
   et la fiche comptent la même chose : la liste affichait un nombre figé à
   la création, la fiche comptait les documents réellement fournis. */
var SAGA_DOCS_APPORTEUR = [
  { key: 'kbis',     label: 'Extrait Kbis / avis SIRENE',      required: true },
  { key: 'urssaf',   label: 'Attestation de vigilance URSSAF', required: true, renouvelable: true },
  { key: 'identite', label: "Pièce d'identité",                required: true },
  { key: 'rib',      label: 'RIB',                             required: true },
  { key: 'contrat',  label: "Contrat d'apporteur signé",       required: true },
  { key: 'assurance',label: 'Attestation RC professionnelle',  required: false },
  { key: 'das2',     label: 'Déclaration DAS2 (honoraires)',   required: false },
  { key: 'facture',  label: 'Facture de commission',           required: false },
  { key: 'autre',    label: 'Autre document',                  required: false }
];

/* État d'un justificatif : absent, expiré, bientôt expiré, ou à jour. */
function sagaEtatDoc(doc, aujourdhui) {
  if (!doc) return 'missing';
  if (!doc.expire) return 'ok';
  var jours = Math.round(
    (new Date(doc.expire + 'T00:00:00') - new Date((aujourdhui || sagaAujourdhui()) + 'T00:00:00'))
    / 86400000);
  if (jours < 0) return 'expired';
  if (jours <= 30) return 'soon';
  return 'ok';
}

/* Pièces à régulariser : exigées et absentes, ou expirées / bientôt expirées.
   Une seule règle pour la liste et la fiche, qui annonçaient des comptes
   différents pour le même apporteur. */
function sagaDocsARegulariser(fiche, aujourdhui) {
  var fournis = (fiche && fiche.docs) || [];
  return SAGA_DOCS_APPORTEUR
    .filter(function (t) { return t.key !== 'autre'; })
    .filter(function (t) {
      var doc = fournis.filter(function (d) { return d.type === t.key; })[0];
      var etat = sagaEtatDoc(doc, aujourdhui);
      return (t.required && !doc) || etat === 'expired' || etat === 'soon';
    });
}

function sagaDocsManquants(cle) {
  return sagaDocsARegulariser(sagaFichesApporteurs()[cle]).length;
}

/* Totaux d'un dressing, lives et ventes hors live réunis.
   La liste des clientes lisait des champs `ca` / `commission` / `reste`
   enregistrés une fois pour toutes à la création de la fiche : ils ne
   bougeaient plus jamais, et une vente importée n'y apparaissait pas. Tout
   part maintenant des ventes elles-mêmes. */
function sagaTotauxDressing(lettre) {
  var t = { ca: 0, commission: 0, net: 0, reste: 0, nbVentes: 0 };
  sagaVentesDuDressing(lettre).forEach(function (v) {
    t.ca += v.ventes;
    t.commission += v.commission;
    t.net += v.net;
    t.nbVentes++;
    if (!v.paye) t.reste += v.net;
  });
  ['ca', 'commission', 'net', 'reste'].forEach(function (k) { t[k] = sagaCentimes(t[k]); });
  return t;
}

/* ============ Commissions d'apporteur ============
   Dérivées des ventes, jamais recopiées : un apporteur voit exactement ce que
   les lives et les ventes hors live lui ont rapporté. Seuls les règlements
   sont enregistrés, commission par commission. */

/* Nom sous lequel un apporteur est désigné sur les fiches clientes */
function sagaNomApporteur(cle) {
  var entree = sagaApporteurs().filter(function (a) { return a.key === cle; })[0];
  return entree ? entree.nom : '';
}

function sagaPaiementsApporteurs() { return sagaLoad('paiements_apporteurs', {}); }

function sagaCommissionsApporteur(nom) {
  if (!nom) return [];
  var regles = sagaPaiementsApporteurs()[nom] || {};
  var res = [];

  sagaLives().forEach(function (live) {
    sagaLettresDuLive(live).forEach(function (lettre) {
      var d = sagaDecompte(live, lettre);
      if (d.apporteur !== nom || !d.commApporteur) return;
      var cle = live.id + '|' + lettre;
      res.push({
        cle: cle, origine: 'Live', date: live.date, session: live.titre,
        lettre: lettre, cliente: d.prenom, base: d.base, montant: d.commApporteur,
        paye: !!regles[cle], paiement: regles[cle] || null
      });
    });
  });

  sagaVentesDirectes().forEach(function (v) {
    var d = sagaDecompteDirect(v);
    if (d.apporteur !== nom || !d.commApporteur) return;
    var cle = 'direct|' + v.id;
    res.push({
      cle: cle, origine: 'Hors live', date: v.date, session: v.libelle,
      lettre: v.lettre, cliente: sagaTauxDressing(v.lettre).prenom,
      base: d.base, montant: d.commApporteur,
      paye: !!regles[cle], paiement: regles[cle] || null
    });
  });

  return res.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
}

/* Ce qu'un apporteur a touché, ce qu'on lui doit, et qui il a apporté */
function sagaTotauxApporteur(nom) {
  var t = { verse: 0, du: 0, nbDu: 0, total: 0, nb: 0, clientes: [] };

  sagaCommissionsApporteur(nom).forEach(function (c) {
    t.total += c.montant;
    t.nb++;
    if (c.paye) t.verse += c.montant;
    else { t.du += c.montant; t.nbDu++; }
  });

  sagaToutesClientes().forEach(function (c) {
    if (nom && sagaTauxDressing(c.lettre).apporteur === nom) {
      t.clientes.push(c.prenom + ' (' + c.lettre + ')');
    }
  });

  ['verse', 'du', 'total'].forEach(function (k) { t[k] = sagaCentimes(t[k]); });
  return t;
}

function sagaReglerCommissionsApporteur(nom, cles, paiement) {
  var tous = sagaPaiementsApporteurs();
  tous[nom] = tous[nom] || {};
  cles.forEach(function (cle) { tous[nom][cle] = paiement; });
  return sagaSave('paiements_apporteurs', tous);
}

function sagaAnnulerCommissionApporteur(nom, cle) {
  var tous = sagaPaiementsApporteurs();
  if (tous[nom]) delete tous[nom][cle];
  return sagaSave('paiements_apporteurs', tous);
}

/* Marque une vente réglée, quel que soit son support de stockage */
function sagaMarquerPayee(vente, dateIso) {
  if (vente.origine === 'live') {
    var lives = sagaLives();
    var live = lives.filter(function (l) { return l.id === vente.liveId; })[0];
    if (!live) return false;
    live.paiements = live.paiements || {};
    live.paiements[vente.lettre] = { date: dateIso, mode: 'Virement' };
    return sagaSaveLives(lives);
  }
  var ventes = sagaVentesDirectes();
  var v = ventes.filter(function (x) { return x.id === vente.venteId; })[0];
  if (!v) return false;
  v.paye = 1; v.datePaiement = dateIso;
  return sagaSaveVentesDirectes(ventes);
}

function sagaAnnulerPaiement(vente) {
  if (vente.origine === 'live') {
    var lives = sagaLives();
    var live = lives.filter(function (l) { return l.id === vente.liveId; })[0];
    if (!live || !live.paiements) return false;
    delete live.paiements[vente.lettre];
    return sagaSaveLives(lives);
  }
  var ventes = sagaVentesDirectes();
  var v = ventes.filter(function (x) { return x.id === vente.venteId; })[0];
  if (!v) return false;
  v.paye = 0; delete v.datePaiement;
  return sagaSaveVentesDirectes(ventes);
}

/* ============================================================
   Notes et choses à faire — partagées
   Une note peut être rattachée à une cliente (lettre) ou rester
   générale : les deux vues lisent la même liste.
   ============================================================ */

function sagaNotes() { return sagaLoad('notes', []); }
function sagaSaveNotes(n) { return sagaSave('notes', n); }

function sagaAjouterNote(type, texte, lettre) {
  var notes = sagaNotes();
  notes.unshift({
    id: 'n' + Date.now(), type: type, lettre: lettre || '',
    texte: texte, date: sagaAujourdhui(), done: false
  });
  sagaSaveNotes(notes);
  sagaTracer(type === 'todo' ? 'Ajout à faire' : 'Ajout note', texte.slice(0, 60));
  return notes;
}

function sagaBasculerNote(id) {
  var notes = sagaNotes();
  var n = notes.filter(function (x) { return x.id === id; })[0];
  if (n) { n.done = !n.done; sagaSaveNotes(notes); }
  return notes;
}

function sagaSupprimerNote(id) {
  var notes = sagaNotes().filter(function (x) { return x.id !== id; });
  sagaSaveNotes(notes);
  return notes;
}

// Étiquette de la cliente rattachée, pour l'affichage
function sagaEtiquetteNote(note) {
  if (!note.lettre) return '';
  var i = sagaInfosCliente(note.lettre);
  return i.nom + ' (' + note.lettre + ')';
}

var SAGA_MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/* Numéros de téléphone toujours présentés par paires de chiffres.
   Saisis collés, copiés depuis un tableur ou importés, ils s'affichent
   partout de la même façon : 06 12 34 56 78. */
function sagaTelephone(brut) {
  if (!brut) return '';
  var t = String(brut).trim();
  var international = t.indexOf('+') === 0;
  var chiffres = t.replace(/\D/g, '');

  // Format international français : +33 6 12 34 56 78
  if (international && chiffres.indexOf('33') === 0 && chiffres.length === 11) {
    var reste = chiffres.slice(2);
    return '+33 ' + reste[0] + ' ' + reste.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ');
  }
  if (international) return '+' + chiffres.replace(/(\d{2})(?=\d)/g, '$1 ');

  // Numéro français à dix chiffres
  if (chiffres.length === 10) return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ');

  // Longueur inattendue : on rend le numéro tel quel plutôt que de le déformer
  return t;
}

function sagaEUR(n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; }

function sagaDateFR(iso) {
  if (!iso) return '—';
  var p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function sagaDateLongue(iso) {
  if (!iso) return '—';
  var d = new Date(iso + 'T00:00:00');
  return d.getDate() + ' ' + SAGA_MOIS[d.getMonth()] + ' ' + d.getFullYear();
}

/* Ouvre un document imprimable : l'utilisateur choisit « Enregistrer au format PDF »
   dans la boîte d'impression du navigateur. */
function sagaImprimer(titre, corps) {
  var w = window.open('', '_blank');
  if (!w) { alert("Autorisez les fenêtres pop-up pour générer le PDF."); return; }
  w.document.write(
    '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>' + titre + '</title><style>' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#241F1A;' +
    'max-width:820px;margin:32px auto;padding:0 28px;line-height:1.5;}' +
    'h1{font-size:1.5rem;margin:0 0 4px;} h2{font-size:1rem;margin:26px 0 8px;border-bottom:1px solid #E7DFCF;padding-bottom:5px;}' +
    '.sous{color:#726952;font-size:.85rem;margin:0 0 18px;}' +
    'table{width:100%;border-collapse:collapse;font-size:.82rem;margin-bottom:10px;}' +
    'th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #EFE8DA;}' +
    'th{color:#726952;font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;}' +
    'td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;}' +
    'tfoot td{font-weight:700;border-top:2px solid #241F1A;border-bottom:0;}' +
    '.recap{background:#FBF6EE;border:1px solid #E7DFCF;border-radius:8px;padding:12px 14px;margin:10px 0 4px;}' +
    '.recap div{display:flex;justify-content:space-between;padding:3px 0;font-size:.85rem;}' +
    '.recap .total{border-top:1px solid #E7DFCF;margin-top:6px;padding-top:8px;font-weight:700;}' +
    '.pied{margin-top:28px;color:#9C9276;font-size:.72rem;}' +
    '@media print{body{margin:0;} .noprint{display:none;}}' +
    '</style></head><body>' + corps +
    '<p class="pied">Saga Dressing — document généré le ' + sagaDateLongue(new Date().toISOString().slice(0, 10)) + '</p>' +
    '</body></html>'
  );
  w.document.close();
  w.focus();
  setTimeout(function () { w.print(); }, 400);
}

/* ============ Utilisateurs ============
   Les comptes vivent ici pour que toutes les pages sachent qui agit. */
var SAGA_ROLES = {
  admin:   { label: 'Administratrice', detail: 'Tous les droits, y compris la gestion des utilisateurs' },
  gestion: { label: 'Gestionnaire',    detail: 'Gère les clientes, lives, paiements et documents' },
  lecture: { label: 'Lecture seule',   detail: 'Consulte sans rien modifier' }
};

/* Comptes du CRM. Une seule liste, partagée par le menu et les Paramètres :
   il y en avait deux qui s'ignoraient, si bien qu'un compte créé dans les
   réglages n'existait nulle part ailleurs.
   `status` vaut 'active' ou 'invited' ; `owner` marque la propriétaire, qui
   ne peut être ni supprimée ni rétrogradée. */
var SAGA_UTILISATEURS_DEFAUT = [
  { id: 1, prenom: 'Sarah', nom: 'Danino', email: 'sarah@sagadressing.fr', tel: '',
    role: 'admin', perms: null, last: '—', status: 'active', owner: true,
    creele: '' }
];

/* Le CRM démarre avec la seule propriétaire : sans elle, plus personne ne
   pourrait administrer l'application ni inviter les autres comptes. */
function sagaUtilisateurs() {
  return sagaLoad('utilisateurs', SAGA_UTILISATEURS_DEFAUT);
}
function sagaSaveUtilisateurs(u) { return sagaSave('utilisateurs', u); }

function sagaUtilisateurCourant() {
  var id = sagaLoad('utilisateur_courant', null);
  var tous = sagaUtilisateurs();
  return tous.filter(function (u) { return u.id === id; })[0] || tous[0];
}

function sagaNomComplet(u) { return u ? ((u.prenom || '') + ' ' + (u.nom || '')).trim() : '—'; }

function sagaInitiales(u) {
  if (!u) return '?';
  return ((u.prenom || ' ')[0] + (u.nom || ' ')[0]).toUpperCase().trim() || '?';
}

/* ============ Journal d'activité ============
   Trace horodatée de ce qui se passe dans le CRM, par utilisateur.
   Volontairement plafonné pour ne pas saturer le stockage du navigateur. */
var SAGA_JOURNAL_MAX = 500;

function sagaJournal() { return sagaLoad('journal', []); }

function sagaTracer(action, cible, detail) {
  var u = sagaUtilisateurCourant();
  var entrees = sagaJournal();
  entrees.unshift({
    date: new Date().toISOString(),
    utilisateur: sagaNomComplet(u),
    utilisateurId: u ? u.id : null,
    action: action,
    cible: cible || '',
    detail: detail || ''
  });
  if (entrees.length > SAGA_JOURNAL_MAX) entrees = entrees.slice(0, SAGA_JOURNAL_MAX);
  sagaSave('journal', entrees);
}

function sagaHorodatage(iso) {
  var d = new Date(iso);
  return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' +
    d.getFullYear() + ' à ' + ('0' + d.getHours()).slice(-2) + 'h' + ('0' + d.getMinutes()).slice(-2);
}

/* ============ Versions du CRM ============
   Historique des évolutions, consultable depuis Paramètres. */
var SAGA_VERSION = '1.14.1';

var SAGA_VERSIONS = [
  { version: '1.14.1', date: '2026-08-19', titre: 'Les données ont leur onglet', points: [
    'Sauvegarde et remise à zéro étaient rangées au bas de l\'onglet « Envoi des emails », où personne ne pense à les chercher : elles ont désormais leur propre onglet « Données »',
    'Le texte annonçait encore que tout était conservé dans le navigateur — il dit maintenant que les données vivent sur le serveur'
  ]},
  { version: '1.14.0', date: '2026-08-19', titre: 'Sauvegarde automatique', points: [
    'Le serveur enregistre chaque nuit une copie complète — état du CRM, comptes et réglages — conservée trente jours',
    'Les copies sont écrites dans un dossier que le web ne sert pas : une sauvegarde téléchargeable par n\'importe qui serait pire que pas de sauvegarde',
    'Un bouton dans Paramètres → Données permet d\'en télécharger une à tout moment, pour la ranger hors du serveur'
  ]},
  { version: '1.13.1', date: '2026-08-19', titre: 'Les réglages d\'envoi sont enfin enregistrés', points: [
    'Le bouton « Enregistrer » des emails ne faisait que changer son propre libellé : les réglages sont désormais réellement conservés',
    'Les mots de passe de boîte et clés d\'API ne se saisissent plus ici — ils seraient lisibles par tous les comptes ; leur place est dans la configuration du serveur',
    'Le bouton de test annonçait un envoi qui n\'avait jamais lieu ; il dit maintenant que l\'envoi n\'est pas raccordé'
  ]},
  { version: '1.13.0', date: '2026-08-19', titre: 'Supprimer une cliente sans réécrire le passé', points: [
    'Supprimer une cliente qui avait vendu ramenait sa commission au taux par défaut : ses lives passés changeaient de montant. Son taux est désormais mémorisé, les chiffres d\'hier restent ceux d\'hier',
    'La suppression demande ce qu\'il faut faire des ventes : les conserver — l\'historique reste juste et lisible — ou les supprimer avec la fiche',
    'Le décompte annoncé distingue les lives, les ventes hors live et les articles'
  ]},
  { version: '1.12.2', date: '2026-08-19', titre: 'Rien ne se perd en changeant de page', points: [
    'Supprimer une cliente ou un live, importer un live, réinitialiser : ces actions attendent désormais que l\'enregistrement soit parvenu au serveur avant de changer de page',
    'Si l\'enregistrement échoue, la page reste ouverte et le dit, au lieu de partir en laissant la modification derrière elle'
  ]},
  { version: '1.12.1', date: '2026-08-19', titre: 'Supprimer une cliente', points: [
    'Une fiche cliente peut être supprimée depuis son onglet Infos — il fallait jusqu\'ici la laisser en place',
    'L\'avertissement dit combien de ventes sont enregistrées sous son code et rappelle qu\'elles ne disparaissent pas avec la fiche',
    'Les notes qui la concernaient sont retirées avec elle, si son code n\'est plus porté par personne'
  ]},
  { version: '1.12.0', date: '2026-08-19', titre: 'Giveaways : plafond supprimé', points: [
    'Les frais de port des giveaways sont désormais déduits en totalité, sans plafond de 10 €',
    'Ils restent répartis entre les clientes d\'un même live au prorata de leurs ventes',
    'Le contrat de dépôt-vente est mis à jour en conséquence — texte à faire valider'
  ]},
  { version: '1.11.2', date: '2026-08-19', titre: 'Base réellement vide et mentions légales exactes', points: [
    'Derniers restes des données d\'exemple retirés : coordonnées inscrites en dur dans le contrat, fiches ouvertes par défaut sur une cliente inventée',
    'Une fiche ouverte sans référence renvoie vers la liste au lieu d\'afficher une page vide',
    'SIRET corrigé dans le contrat de dépôt-vente et la convention d\'apporteur : 103 429 833'
  ]},
  { version: '1.11.1', date: '2026-08-19', titre: 'Textes saisis rendus inoffensifs', points: [
    'Un nom ou un libellé contenant des chevrons ou des guillemets ne peut plus s\'insérer dans le code de la page',
    'Les apostrophes et guillemets droits deviennent typographiques à l\'enregistrement : même apparence, aucun risque',
    'Les données déjà saisies sont reprises une fois au premier chargement'
  ]},
  { version: '1.11.0', date: '2026-08-19', titre: 'Fin des données d\'exemple', points: [
    'Toutes les clientes, lives, apporteurs, notes, rendez-vous et ventes d\'exemple sont retirés du code',
    'Le jeu de démonstration et son bouton dans les Paramètres disparaissent : l\'application ne connaît plus que vos données',
    'Un seul compte au départ, celui de la propriétaire ; les collègues fictifs sont supprimés',
    'Les bandeaux « maquette — données fictives » sont retirés de toutes les pages'
  ]},
  { version: '1.10.0', date: '2026-08-19', titre: 'Relevés PDF, clientes créées à la volée, codes en double', points: [
    'Relevé PDF d\'une cliente depuis sa fiche : ses lives et ventes hors live, avec le détail des articles et le décompte',
    'Export PDF de la liste des clientes, telle qu\'elle est filtrée à l\'écran',
    'Une cliente peut être créée sans quitter l\'écran : pendant l\'import d\'un live comme au moment d\'attribuer un article',
    'Le code de dressing accepte une à trois lettres : « C » et « CA » distinguent deux clientes',
    'Deux clientes peuvent porter le même code ; c\'est la génération de la boutique qui le refuse, avec de quoi le corriger sur place'
  ]},
  { version: '1.9.0', date: '2026-08-17', titre: 'Tout ce qui peut fonctionner sans serveur, fonctionne', points: [
    'Commissions d\'apporteur calculées depuis les ventes : elles apparaissent sur sa fiche, se règlent et s\'annulent',
    'Une seule liste d\'utilisateurs, partagée par les Paramètres et le reste du CRM',
    'Règlements saisis dans une vraie fenêtre, avec sélecteur de date et mode de paiement',
    'Les anciennes données d\'exemple restées dans un navigateur sont repérées et retirables d\'un clic',
    'Les écrans qui exigent un serveur (connexion, emails, Yousign, iCloud) le disent clairement'
  ]},
  { version: '1.8.0', date: '2026-08-16', titre: 'Import Whatnot réel et démarrage à vide', points: [
    'Le CRM démarre vide : les exemples deviennent un jeu de démonstration, à charger depuis Paramètres',
    'Import d\'un export Whatnot : le fichier est réellement lu, les lettres reconnues, les ventes sans lettre affectées à l\'écran',
    'Les montants importés sont ceux versés par Whatnot, frais déduits : plus de taux de frais à saisir',
    'Le coût des giveaways est réparti entre les clientes du live, au prorata de leurs ventes',
    'Réimporter le même fichier ne crée plus de doublon',
    'Liste des clientes : le chiffre d\'affaires suit les ventes au lieu d\'être figé à la création de la fiche',
    'Justificatifs des apporteurs comptés de la même façon dans la liste et sur la fiche'
  ]},
  { version: '1.7.3', date: '2026-08-14', titre: 'Calendrier remis en proportion', points: [
    'Le calendrier remplit son panneau, avec des cases carrées de taille lisible'
  ]},
  { version: '1.7.2', date: '2026-08-14', titre: 'Appellation « Giveaway » rétablie', points: [
    'Le terme « Giveaway » revient partout : colonne, indicateurs, décompte et libellés'
  ]},
  { version: '1.7.1', date: '2026-08-14', titre: 'Ajustements', points: [
    'Giveaways : le montant importé de Whatnot correspond aux frais de port du cadeau',
    'Notes : le type choisi est respecté et la vue bascule pour montrer ce qui vient d\'être créé',
    'Boutique : aucune cliente cochée d\'office',
    'Téléphones affichés et enregistrés par paires de chiffres partout'
  ]},
  { version: '1.7.0', date: '2026-08-14', titre: 'Giveaways, agenda et lecture des chiffres', points: [
    'Giveaways : Saga finance le cadeau, seuls les frais de port sont refacturés à la cliente',
    'Le reste à reverser se décompose entre lives et hors live, pour être rapproché de la page Lives',
    'Tableau de bord : l\'agenda prend la colonne de droite',
    'Agenda : le formulaire devient une fenêtre, ouverte à la demande',
    'Rapports : chaque barre du graphique ouvre le détail de sa semaine',
    'Version du CRM affichée en bas du menu',
    'Sous-menus défilants et recentrés sur téléphone'
  ]},
  { version: '1.6.0', date: '2026-08-14', titre: 'Calculs vérifiés et usage sur téléphone', points: [
    'Les ventes hors live manquaient au tableau de bord et aux rapports : 685 € non comptés',
    'Le reste à reverser portait sur la période affichée, il porte désormais sur la dette entière',
    'Montants arrêtés au centime dès le calcul, pour que les totaux correspondent aux lignes',
    'Menu escamotable et mise en page repensée pour les téléphones, sur toutes les pages'
  ]},
  { version: '1.5.2', date: '2026-08-14', titre: 'Mise en page et vues par défaut', points: [
    'Tableau de bord et agenda : colonnes équilibrées, calendrier compact',
    'Agenda : seules les clientes retenues sont listées, les autres se cherchent',
    'Clientes : les actives sont affichées par défaut',
    'Lives : les sessions en cours par défaut, recherche par nom ou par date'
  ]},
  { version: '1.5.1', date: '2026-08-14', titre: 'Logo, tableau de bord et mots de passe', points: [
    'Logo du menu affiché en pleine largeur',
    'Panneau « Reste à reverser par cliente » retiré du tableau de bord',
    'Seuil de sécurité imposé sur les mots de passe : 12 caractères, 3 types de caractères, ni mot courant ni suite'
  ]},
  { version: '1.5.0', date: '2026-08-14', titre: 'Source unique des ventes', points: [
    'Les ventes ne sont plus recopiées sur la fiche cliente : lives et ventes hors live sont la seule source',
    'Un live supprimé disparaît partout ; une cliente ajoutée à un live apparaît aussitôt sur sa fiche',
    'Notes et choses à faire partagées, avec vue générale sur le tableau de bord',
    'Création cliente alignée sur celle des apporteurs : prénom, nom, adresse',
    'Mot de passe définissable à la création d\'un utilisateur',
    'Boutique : seules les clientes retenues sont affichées, les autres se trouvent par la recherche',
    'Cartes du tableau de bord adaptées à la largeur disponible',
    'Logo agrandi dans les documents PDF'
  ]},
  { version: '1.4.0', date: '2026-08-14', titre: 'Lisibilité, journal et calendriers', points: [
    'Typographie agrandie sur toute l\'application',
    'Logo repris dans le menu et sur tous les documents',
    'Sélecteurs de date remplacés par un calendrier complet',
    'Journal d\'activité et gestion complète des utilisateurs',
    'Agenda : consultation, modification et suppression d\'un événement',
    'Suppression d\'un live en cas d\'erreur d\'import',
    'Aperçu du PDF avant enregistrement'
  ]},
  { version: '1.3.0', date: '2026-08-14', titre: 'Documents PDF', points: [
    'Générateur de PDF intégré : logo, en-tête et mise en page soignée',
    'Contrats et bons de restitution enregistrés et re-téléchargeables',
    'Rapports reconstruits sur les données réelles des lives',
    'Reversements toujours par virement : seule la date est demandée'
  ]},
  { version: '1.2.0', date: '2026-08-13', titre: 'Lives détaillés', points: [
    'Chaque live porte ses articles, rattachés à une lettre de dressing',
    'Vue filtrée par cliente depuis sa fiche',
    'Articles modifiables : libellé, dressing, montant, type',
    'Récapitulatifs par cliente, par live et tous lives confondus'
  ]},
  { version: '1.1.0', date: '2026-08-13', titre: 'Fiabilisation des boutons', points: [
    'Audit complet : plus aucun bouton sans effet',
    'Annuler restaure et referme réellement les formulaires',
    'Agenda : plusieurs clientes par événement'
  ]},
  { version: '1.0.0', date: '2026-08-12', titre: 'Première maquette', points: [
    'Clientes, lives, apporteurs, agenda, rapports, boutique et paramètres'
  ]}
];

/* ============ Calendrier ============
   Remplace le sélecteur natif, trop petit et illisible : un vrai calendrier
   mensuel s'ouvre sous le champ, avec navigation et raccourci « Aujourd'hui ».
   Le champ reste un input date : la valeur lue par les pages ne change pas. */

function sagaInitCalendriers(racine) {
  (racine || document).querySelectorAll('input[type="date"]:not([data-cal])').forEach(function (input) {
    input.dataset.cal = '1';
    input.readOnly = true;                 // la saisie passe par le calendrier
    input.classList.add('date-input');
    input.addEventListener('click', function (e) {
      e.preventDefault();
      sagaOuvrirCalendrier(input);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sagaOuvrirCalendrier(input); }
    });
  });
}

function sagaFermerCalendrier() {
  var ouvert = document.querySelector('.cal-pop');
  if (ouvert) ouvert.remove();
  document.removeEventListener('mousedown', sagaCalHorsClic, true);
}

function sagaCalHorsClic(e) {
  var pop = document.querySelector('.cal-pop');
  if (pop && !pop.contains(e.target) && !e.target.dataset.cal) sagaFermerCalendrier();
}

function sagaOuvrirCalendrier(input) {
  var dejaOuvert = document.querySelector('.cal-pop');
  sagaFermerCalendrier();
  if (dejaOuvert && dejaOuvert.dataset.pour === input.id) return;

  var pop = document.createElement('div');
  pop.className = 'cal-pop';
  pop.dataset.pour = input.id || '';
  document.body.appendChild(pop);

  var valeur = input.value || sagaAujourdhui();
  var curseur = new Date(valeur + 'T00:00:00');
  var moisAffiche = new Date(curseur.getFullYear(), curseur.getMonth(), 1);

  function dessiner() {
    var annee = moisAffiche.getFullYear(), mois = moisAffiche.getMonth();
    var premier = new Date(annee, mois, 1);
    var decalage = (premier.getDay() + 6) % 7;          // semaine démarrant lundi
    var nbJours = new Date(annee, mois + 1, 0).getDate();
    var nbJoursPrec = new Date(annee, mois, 0).getDate();
    var aujourdhui = sagaAujourdhui();

    var cases = [];
    for (var i = decalage - 1; i >= 0; i--) cases.push({ jour: nbJoursPrec - i, hors: true });
    for (var j = 1; j <= nbJours; j++) cases.push({ jour: j, hors: false });
    while (cases.length % 7 !== 0) cases.push({ jour: cases.length - decalage - nbJours + 1, hors: true });

    pop.innerHTML =
      '<div class="cal-head">' +
        '<button type="button" data-nav="-1" aria-label="Mois précédent">‹</button>' +
        '<div class="cal-mois">' +
          '<select class="cal-select" data-select="mois">' +
            SAGA_MOIS.map(function (m, i) {
              return '<option value="' + i + '"' + (i === mois ? ' selected' : '') + '>' +
                m.charAt(0).toUpperCase() + m.slice(1) + '</option>';
            }).join('') +
          '</select>' +
          '<select class="cal-select" data-select="annee">' +
            (function () {
              var out = '', base = new Date().getFullYear();
              for (var a = base - 8; a <= base + 3; a++) {
                out += '<option value="' + a + '"' + (a === annee ? ' selected' : '') + '>' + a + '</option>';
              }
              return out;
            })() +
          '</select>' +
        '</div>' +
        '<button type="button" data-nav="1" aria-label="Mois suivant">›</button>' +
      '</div>' +
      '<div class="cal-grille">' +
        ['L','M','M','J','V','S','D'].map(function (d) { return '<span class="cal-dow">' + d + '</span>'; }).join('') +
        cases.map(function (c) {
          if (c.hors) return '<span class="cal-jour hors"></span>';
          var iso = annee + '-' + ('0' + (mois + 1)).slice(-2) + '-' + ('0' + c.jour).slice(-2);
          var classes = 'cal-jour';
          if (iso === input.value) classes += ' choisi';
          if (iso === aujourdhui) classes += ' aujourdhui';
          return '<button type="button" class="' + classes + '" data-iso="' + iso + '">' + c.jour + '</button>';
        }).join('') +
      '</div>' +
      '<div class="cal-pied">' +
        '<button type="button" data-aujourdhui>Aujourd\'hui</button>' +
        '<button type="button" data-effacer>Effacer</button>' +
      '</div>';
  }

  function choisir(iso) {
    input.value = iso;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    sagaFermerCalendrier();
  }

  pop.addEventListener('click', function (e) {
    var nav = e.target.closest('[data-nav]');
    if (nav) { moisAffiche.setMonth(moisAffiche.getMonth() + parseInt(nav.dataset.nav, 10)); dessiner(); return; }
    var jour = e.target.closest('[data-iso]');
    if (jour) { choisir(jour.dataset.iso); return; }
    if (e.target.closest('[data-aujourdhui]')) { choisir(sagaAujourdhui()); return; }
    if (e.target.closest('[data-effacer]')) { choisir(''); return; }
  });

  pop.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-select]');
    if (!sel) return;
    if (sel.dataset.select === 'mois') moisAffiche.setMonth(parseInt(sel.value, 10));
    else moisAffiche.setFullYear(parseInt(sel.value, 10));
    dessiner();
  });

  dessiner();

  // Positionnement sous le champ, recalé s'il déborde de l'écran
  var r = input.getBoundingClientRect();
  pop.style.top = (window.scrollY + r.bottom + 6) + 'px';
  var gauche = window.scrollX + r.left;
  pop.style.left = Math.min(gauche, window.scrollX + window.innerWidth - pop.offsetWidth - 12) + 'px';
  if (r.bottom + pop.offsetHeight + 12 > window.innerHeight) {
    pop.style.top = (window.scrollY + r.top - pop.offsetHeight - 6) + 'px';
  }

  setTimeout(function () { document.addEventListener('mousedown', sagaCalHorsClic, true); }, 0);
}

/* ============ Saisie d'un règlement ============
   Une fenêtre plutôt que la boîte du navigateur : le sélecteur de date natif
   s'ouvre sur téléphone, et il n'y a plus de format à respecter à la main.
   Le résultat arrive par `auValider`, la fenêtre étant asynchrone. */
var SAGA_MODES_PAIEMENT = ['Virement', 'Espèces', 'Chèque', 'Remise en main propre', 'Autre'];

function sagaDemanderPaiement(options, auValider) {
  options = options || {};
  var fond = document.createElement('div');
  fond.className = 'modale';
  fond.innerHTML =
    '<div class="modale-boite" style="width:min(420px,100%);">' +
      '<div class="modale-tete"><strong>' + sagaEchapper(options.titre || 'Enregistrer un règlement') + '</strong>' +
        '<button class="btn btn-ghost btn-sm" data-fermer>Fermer</button></div>' +
      '<div class="modale-corps">' +
        (options.detail ? '<p class="card-note" style="margin-bottom:14px;">' + sagaEchapper(options.detail) + '</p>' : '') +
        (options.montant !== undefined
          ? '<div class="calc-recap" style="margin-bottom:16px;"><div class="calc-row calc-total">' +
              '<span>Montant</span><span class="tabular">' + sagaEUR(options.montant) + '</span></div></div>'
          : '') +
        '<div class="form-field"><label class="form-label" for="sagaPaieDate">Date du règlement</label>' +
          '<input class="form-input" type="date" id="sagaPaieDate" value="' +
            (options.date || sagaAujourdhui()) + '" /></div>' +
        '<div class="form-field" style="margin-top:12px;"><label class="form-label" for="sagaPaieMode">Mode</label>' +
          '<select class="form-select" id="sagaPaieMode">' +
            SAGA_MODES_PAIEMENT.map(function (m) {
              return '<option value="' + m + '"' + (m === (options.mode || 'Virement') ? ' selected' : '') + '>' + m + '</option>';
            }).join('') +
          '</select></div>' +
        '<div style="display:flex; gap:10px; margin-top:18px;">' +
          '<button class="btn btn-primary btn-sm" data-valider>' +
            sagaEchapper(options.libelleBouton || 'Enregistrer le règlement') + '</button>' +
          '<button class="btn btn-ghost btn-sm" data-fermer>Annuler</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(fond);
  document.body.classList.add('modale-ouverte');

  function fermer() {
    fond.remove();
    document.body.classList.remove('modale-ouverte');
    document.removeEventListener('keydown', auClavier);
  }
  function auClavier(e) { if (e.key === 'Escape') fermer(); }
  document.addEventListener('keydown', auClavier);

  fond.querySelectorAll('[data-fermer]').forEach(function (b) { b.onclick = fermer; });
  fond.addEventListener('mousedown', function (e) { if (e.target === fond) fermer(); });

  fond.querySelector('[data-valider]').onclick = function () {
    var date = fond.querySelector('#sagaPaieDate').value;
    if (!date) { fond.querySelector('#sagaPaieDate').focus(); return; }
    var mode = fond.querySelector('#sagaPaieMode').value;
    fermer();
    auValider({ date: date, mode: mode });
  };

  setTimeout(function () { fond.querySelector('#sagaPaieDate').focus(); }, 0);
}

/* ============ Aperçu d'un PDF avant enregistrement ============
   Le document s'affiche dans une fenêtre : on le relit, puis on décide
   de l'enregistrer ou non. */
function sagaApercuPdf(pdf, nomFichier, titre) {
  /* Certains appelants passent déjà un nom terminé par .pdf : sans cela
     l'aperçu annonçait « Contrat_v1.pdf.pdf ». */
  nomFichier = String(nomFichier || 'document').replace(/\.pdf$/i, '');
  var fond = document.createElement('div');
  fond.className = 'pdf-modal';
  fond.innerHTML =
    '<div class="pdf-modal-box">' +
      '<div class="pdf-modal-head">' +
        '<div><strong>' + (titre || 'Aperçu du document') + '</strong>' +
          '<div class="muted" style="font-size:.8rem;">' + nomFichier + '.pdf</div></div>' +
        '<div class="pdf-modal-actions">' +
          '<a class="btn btn-ghost btn-sm" data-onglet target="_blank" rel="noopener">Ouvrir dans un onglet</a>' +
          '<button class="btn btn-ghost btn-sm" data-fermer>Fermer</button>' +
          '<button class="btn btn-primary btn-sm" data-enregistrer>Enregistrer le PDF</button>' +
        '</div>' +
      '</div>' +
      '<iframe class="pdf-modal-vue" title="Aperçu"></iframe>' +
    '</div>';
  document.body.appendChild(fond);

  /* Un lien blob: est affiché de façon fiable par le lecteur PDF intégré,
     là où une URL data: est refusée dans une iframe par plusieurs navigateurs. */
  var blob = new Blob([pdf.octets()], { type: 'application/pdf' });
  var url = URL.createObjectURL(blob);
  fond.querySelector('.pdf-modal-vue').src = url;
  fond.querySelector('[data-onglet]').href = url;

  function fermer() {
    fond.remove();
    URL.revokeObjectURL(url);
    document.removeEventListener('keydown', auClavier);
  }
  function auClavier(e) { if (e.key === 'Escape') fermer(); }

  fond.querySelector('[data-fermer]').onclick = fermer;
  fond.querySelector('[data-enregistrer]').onclick = function () {
    pdf.enregistrer(nomFichier);
    fermer();
  };
  fond.addEventListener('mousedown', function (e) { if (e.target === fond) fermer(); });
  document.addEventListener('keydown', auClavier);
}

function renderSpark(el, values) {
  if (!el) return;
  el.innerHTML = '';
  const max = Math.max(...values);
  values.forEach(v => {
    const bar = document.createElement('span');
    bar.style.height = Math.max(10, (v / max) * 100) + '%';
    el.appendChild(bar);
  });
}

function initRowLinks(root) {
  (root || document).querySelectorAll('[data-href]').forEach(row => {
    row.addEventListener('click', () => { window.location.href = row.dataset.href; });
  });
}

function initTabs(root) {
  (root || document).querySelectorAll('.tabs').forEach(tabs => {
    // Sur petit écran la barre défile : on amène l'onglet choisi sous les yeux
    tabs.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        /* On centre l'onglet choisi dans la barre. Le calcul se fait par
           rapport à la barre elle-même : offsetLeft se réfère au premier
           ancêtre positionné, qui n'est pas forcément celui-ci. */
        if (tabs.scrollWidth > tabs.clientWidth) {
          const cadre = tabs.getBoundingClientRect();
          const cible = tab.getBoundingClientRect();
          tabs.scrollTo({
            left: Math.max(0, tabs.scrollLeft + (cible.left - cadre.left) - (cadre.width - cible.width) / 2),
            behavior: 'smooth'
          });
        }
        tabs.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const panelId = tab.dataset.tab;
        const panelGroup = tabs.dataset.panelGroup;
        document.querySelectorAll('.tab-panel[data-panel-group="' + panelGroup + '"]').forEach(p => p.classList.remove('active'));
        document.getElementById(panelId).classList.add('active');
      });
    });
  });
}
