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

  let html = '';
  html += '<div class="brand"><div class="brand-mark serif">S</div><div class="brand-word">' +
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
  html += '<div class="sidebar-foot"><div class="user-chip"><div class="user-avatar">SG</div>' +
          '<div class="user-meta"><div class="user-name">Sarah</div><div class="user-role">Gérante</div></div></div></div>';

  root.innerHTML = html;
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

function sagaSave(key, value) {
  try {
    localStorage.setItem(SAGA_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    // Quota dépassé : le plus souvent à cause des vignettes trop lourdes
    alert("Impossible d'enregistrer : l'espace du navigateur est plein.\n\nSupprimez quelques vignettes ou réinitialisez les données de test dans Paramètres.");
    return false;
  }
}

function sagaReset() {
  Object.keys(localStorage)
    .filter(function (k) { return k.indexOf(SAGA_PREFIX) === 0; })
    .forEach(function (k) { localStorage.removeItem(k); });
}

/* Réduit une image avant stockage : sans ça, quelques photos suffisent
   à saturer l'espace disponible du navigateur. */
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

var SAGA_LIVES_DEFAUT = [
  {
    id: 'l-20260729', date: '2026-07-29', titre: 'Live du 29 juillet',
    categorie: 'Sacs & accessoires', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-30' },
    articles: [
      { id: 'a1',  libelle: 'Sac cabas cuir camel',      lettre: 'M', montant: 240, type: 'vente' },
      { id: 'a2',  libelle: 'Trench beige T38',          lettre: 'M', montant: 180, type: 'vente' },
      { id: 'a3',  libelle: 'Lot 3 foulards soie',       lettre: 'M', montant: 95,  type: 'vente' },
      { id: 'a4',  libelle: 'Escarpins vernis T37',      lettre: 'M', montant: 120, type: 'vente' },
      { id: 'a5',  libelle: 'Robe portefeuille fleurie', lettre: 'M', montant: 845, type: 'vente' },
      { id: 'a6',  libelle: 'Pochette brodée — giveaway',lettre: 'M', montant: 60,  type: 'giveaway' },
      { id: 'a7',  libelle: 'Sac seau daim',             lettre: 'C', montant: 310, type: 'vente' },
      { id: 'a8',  libelle: 'Blazer oversize noir',      lettre: 'C', montant: 150, type: 'vente' },
      { id: 'a9',  libelle: 'Lot bijoux fantaisie',      lettre: 'C', montant: 75,  type: 'vente' },
      { id: 'a10', libelle: 'Manteau laine chiné',       lettre: 'C', montant: 1125,type: 'vente' },
      { id: 'a11', libelle: 'Ceinture cuir tressé',      lettre: 'B', montant: 65,  type: 'vente' },
      { id: 'a12', libelle: 'Bottines chelsea T38',      lettre: 'B', montant: 140, type: 'vente' },
      { id: 'a13', libelle: 'Sac banane matelassé',      lettre: 'B', montant: 1295,type: 'vente' },
      { id: 'a14', libelle: 'Écharpe cachemire — giveaway', lettre: 'B', montant: 40, type: 'giveaway' }
    ],
    paiements: { B: { date: '2026-08-01', mode: 'Virement' } }
  },
  {
    id: 'l-20260727', date: '2026-07-27', titre: 'Live du 27 juillet',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-28' },
    articles: [
      { id: 'b1', libelle: 'Jean droit brut T40',   lettre: 'M', montant: 320, type: 'vente' },
      { id: 'b2', libelle: 'Chemisier soie ivoire', lettre: 'M', montant: 540, type: 'vente' },
      { id: 'b3', libelle: 'Cardigan maille torsadée', lettre: 'F', montant: 480, type: 'vente' },
      { id: 'b4', libelle: 'Jupe plissée midi',     lettre: 'F', montant: 620, type: 'vente' }
    ],
    paiements: { M: { date: '2026-07-30', mode: 'Virement' }, F: { date: '2026-07-30', mode: 'Virement' } }
  },
  {
    id: 'l-20260724', date: '2026-07-24', titre: 'Live du 24 juillet',
    categorie: 'Promo 0 frais Whatnot', fraisPct: 18,
    encaisse: { statut: 'Reçu', date: '2026-07-25' },
    articles: [
      { id: 'c1', libelle: 'Doudoune sans manches',  lettre: 'B', montant: 980,  type: 'vente' },
      { id: 'c2', libelle: 'Lot 5 t-shirts basiques',lettre: 'B', montant: 1130, type: 'vente' },
      { id: 'c3', libelle: 'Sac à dos toile',        lettre: 'C', montant: 760,  type: 'vente' },
      { id: 'c4', libelle: 'Robe longue bohème',     lettre: 'F', montant: 890,  type: 'vente' },
      { id: 'c5', libelle: 'Baskets rétro T39',      lettre: 'T', montant: 1450, type: 'vente' }
    ],
    paiements: { C: { date: '2026-07-28', mode: 'PayPal' }, F: { date: '2026-07-28', mode: 'Virement' } }
  },
  {
    id: 'l-20260720', date: '2026-07-20', titre: 'Live du 20 juillet',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-21' },
    articles: [
      { id: 'd1', libelle: 'Veste en jean brodée', lettre: 'F', montant: 1500, type: 'vente' },
      { id: 'd2', libelle: 'Lot accessoires été',  lettre: 'B', montant: 550,  type: 'vente' }
    ],
    paiements: { F: { date: '2026-07-24', mode: 'Virement' }, B: { date: '2026-07-24', mode: 'Virement' } }
  },
  {
    id: 'l-20260717', date: '2026-07-17', titre: 'Live du 17 juillet',
    categorie: "Robes d'été", fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-18' },
    articles: [
      { id: 'e1', libelle: 'Robe lin écrue',       lettre: 'M', montant: 870,  type: 'vente' },
      { id: 'e2', libelle: 'Robe satin bordeaux',  lettre: 'C', montant: 1120, type: 'vente' },
      { id: 'e3', libelle: 'Combinaison fluide',   lettre: 'B', montant: 880,  type: 'vente' }
    ],
    paiements: { M: { date: '2026-07-22', mode: 'Virement' }, C: { date: '2026-07-22', mode: 'Virement' }, B: { date: '2026-07-22', mode: 'Virement' } }
  },
  {
    id: 'l-20260713', date: '2026-07-13', titre: 'Live du 13 juillet',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-14' },
    articles: [
      { id: 'f1', libelle: 'Blouson cuir vintage', lettre: 'C', montant: 1400, type: 'vente' },
      { id: 'f2', libelle: 'Lot 4 pulls hiver',    lettre: 'M', montant: 920,  type: 'vente' }
    ],
    paiements: { C: { date: '2026-07-17', mode: 'Virement' }, M: { date: '2026-07-17', mode: 'Virement' } }
  }
];

function sagaLives() { return sagaLoad('lives', SAGA_LIVES_DEFAUT); }
function sagaSaveLives(lives) { return sagaSave('lives', lives); }

function sagaLive(id) {
  return sagaLives().filter(function (l) { return l.id === id; })[0] || null;
}

/* Correspondance lettre de dressing → cliente, connue de toutes les pages
   même avant que la liste des clientes ait été ouverte une première fois. */
var SAGA_DRESSINGS_DEFAUT = {
  M: { prenom: 'Fanny',   nom: 'Fanny Moreau',    fiche: 'fanny',   commission: 30, apporteur: 'Nadia R.', apporteurPct: 8 },
  C: { prenom: 'Julie',   nom: 'Julie Renard',    fiche: 'julie',   commission: 30, apporteur: '',         apporteurPct: 0 },
  B: { prenom: 'Camille', nom: 'Camille Bertin',  fiche: 'camille', commission: 25, apporteur: 'Nadia R.', apporteurPct: 8 },
  F: { prenom: 'Marion',  nom: 'Marion Fabre',    fiche: 'marion',  commission: 30, apporteur: 'Karim B.', apporteurPct: 6 },
  P: { prenom: 'Alix',    nom: 'Alix Perrin',     fiche: '',        commission: 30, apporteur: '',         apporteurPct: 0 },
  T: { prenom: 'Nora',    nom: 'Nora Tissot',     fiche: '',        commission: 30, apporteur: 'Karim B.', apporteurPct: 6 },
  D: { prenom: 'Sophie',  nom: 'Sophie Delaunay', fiche: '',        commission: 30, apporteur: '',         apporteurPct: 0 },
  R: { prenom: 'Élise',   nom: 'Élise Rousseau',  fiche: '',        commission: 25, apporteur: 'Nadia R.', apporteurPct: 8 }
};

/* Taux appliqués à une lettre de dressing.
   Priorité à la fiche cliente saisie, puis à la liste, puis au défaut. */
function sagaTauxDressing(lettre) {
  var d = SAGA_DRESSINGS_DEFAUT[lettre] || {};
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  var fiches = sagaLoad('clients_data', {});
  var fiche = Object.keys(fiches).map(function (k) { return fiches[k]; })
    .filter(function (f) { return f.lettre === lettre; })[0];

  function choisir() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== '') return arguments[i];
    }
    return arguments[arguments.length - 1];
  }

  return {
    prenom: choisir(fiche && fiche.prenom, c && c.prenom, d.prenom, 'Dressing ' + lettre),
    commission: choisir(fiche && fiche.commission, c && c.pct, d.commission, 30),
    apporteur: fiche ? (fiche.apporteur || '') : (c ? (c.apporteur || '') : (d.apporteur || '')),
    apporteurPct: fiche ? (fiche.apporteurPct || 0) : (d.apporteurPct || 0)
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

  var fiches = sagaLoad('clients_data', {});
  Object.keys(fiches).forEach(function (k) {
    ajouter(fiches[k].lettre, fiches[k].prenom, fiches[k].nom, k);
  });
  sagaLoad('clientes', []).forEach(function (c) { ajouter(c.lettre, c.prenom, c.nom, c.key); });
  Object.keys(SAGA_DRESSINGS_DEFAUT).forEach(function (l) {
    ajouter(l, SAGA_DRESSINGS_DEFAUT[l].prenom, SAGA_DRESSINGS_DEFAUT[l].nom, SAGA_DRESSINGS_DEFAUT[l].fiche);
  });

  return res.sort(function (a, b) { return a.prenom.localeCompare(b.prenom, 'fr'); });
}

/* Clé de fiche (?c=…) correspondant à une lettre de dressing */
function sagaFicheDressing(lettre) {
  var fiches = sagaLoad('clients_data', {});
  var cle = Object.keys(fiches).filter(function (k) { return fiches[k].lettre === lettre; })[0];
  if (cle) return cle;
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  if (c && c.key) return c.key;
  return (SAGA_DRESSINGS_DEFAUT[lettre] || {}).fiche || '';
}

/* Coordonnées complètes d'une cliente, pour les fiches et les documents */
function sagaInfosCliente(lettre) {
  var d = SAGA_DRESSINGS_DEFAUT[lettre] || {};
  var fiches = sagaLoad('clients_data', {});
  var fiche = Object.keys(fiches).map(function (k) { return fiches[k]; })
    .filter(function (f) { return f.lettre === lettre; })[0];
  var c = sagaLoad('clientes', []).filter(function (x) { return x.lettre === lettre; })[0];
  var t = sagaTauxDressing(lettre);
  return {
    lettre: lettre,
    prenom: t.prenom,
    nom: (fiche && fiche.nom) || (c && c.nom) || d.nom || t.prenom,
    adresse: (fiche && fiche.adresse) || (c && c.adresse) || '',
    tel: (fiche && fiche.tel) || (c && c.tel) || '',
    email: (fiche && fiche.email) || (c && c.email) || '',
    commission: t.commission,
    apporteur: t.apporteur
  };
}

/* Décompte d'un dressing sur un live, recalculé depuis ses articles.
   base = ventes − frais Whatnot ; net = base − giveaways − commissions */
function sagaDecompte(live, lettre) {
  var arts = live.articles.filter(function (a) { return a.lettre === lettre; });
  var ventes = arts.filter(function (a) { return a.type !== 'giveaway'; })
                   .reduce(function (s, a) { return s + a.montant; }, 0);
  var giveaways = arts.filter(function (a) { return a.type === 'giveaway'; })
                      .reduce(function (s, a) { return s + a.montant; }, 0);
  var t = sagaTauxDressing(lettre);
  // Une vente hors Whatnot ne supporte pas les frais de la plateforme
  var soumisFrais = arts.filter(function (a) { return a.type === 'vente'; })
                        .reduce(function (s, a) { return s + a.montant; }, 0);
  var horsLive = arts.filter(function (a) { return a.type === 'horslive'; })
                     .reduce(function (s, a) { return s + a.montant; }, 0);
  var base = soumisFrais * (1 - (live.fraisPct || 0) / 100) + horsLive;
  var commSaga = base * t.commission / 100;
  var commApporteur = t.apporteur ? base * t.apporteurPct / 100 : 0;
  var paiement = (live.paiements || {})[lettre] || null;
  return {
    lettre: lettre, prenom: t.prenom, articles: arts,
    ventes: ventes, giveaways: giveaways, base: base,
    commSaga: commSaga, commApporteur: commApporteur, apporteur: t.apporteur,
    net: base - giveaways - commSaga - commApporteur,
    paye: !!paiement, paiement: paiement
  };
}

/* Lettres présentes sur un live, dans l'ordre d'apparition */
function sagaLettresDuLive(live) {
  var vues = [];
  live.articles.forEach(function (a) { if (vues.indexOf(a.lettre) === -1) vues.push(a.lettre); });
  return vues;
}

function sagaTotauxLive(live) {
  var t = { ventes: 0, giveaways: 0, base: 0, commSaga: 0, commApporteur: 0, net: 0, reste: 0, clientes: 0 };
  sagaLettresDuLive(live).forEach(function (lettre) {
    var d = sagaDecompte(live, lettre);
    t.clientes++;
    t.ventes += d.ventes; t.giveaways += d.giveaways; t.base += d.base;
    t.commSaga += d.commSaga; t.commApporteur += d.commApporteur; t.net += d.net;
    if (!d.paye) t.reste += d.net;
  });
  return t;
}

var SAGA_MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

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
    tabs.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
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
