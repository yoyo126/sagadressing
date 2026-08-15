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
      { id: 'a6',  libelle: 'Pochette brodée — giveaway',    lettre: 'M', montant: 6, type: 'giveaway' },
      { id: 'a7',  libelle: 'Sac seau daim',             lettre: 'C', montant: 310, type: 'vente' },
      { id: 'a8',  libelle: 'Blazer oversize noir',      lettre: 'C', montant: 150, type: 'vente' },
      { id: 'a9',  libelle: 'Lot bijoux fantaisie',      lettre: 'C', montant: 75,  type: 'vente' },
      { id: 'a10', libelle: 'Manteau laine chiné',       lettre: 'C', montant: 1125,type: 'vente' },
      { id: 'a11', libelle: 'Ceinture cuir tressé',      lettre: 'B', montant: 65,  type: 'vente' },
      { id: 'a12', libelle: 'Bottines chelsea T38',      lettre: 'B', montant: 140, type: 'vente' },
      { id: 'a13', libelle: 'Sac banane matelassé',      lettre: 'B', montant: 1295,type: 'vente' },
      { id: 'a14', libelle: 'Écharpe cachemire — giveaway',  lettre: 'B', montant: 4, type: 'giveaway' }
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
    id: 'l-20260703', date: '2026-07-03', titre: 'Live du 3 juillet',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-07-04' },
    articles: [
      { id: 'g1', libelle: 'Manteau long camel',   lettre: 'M', montant: 640, type: 'vente' },
      { id: 'g2', libelle: 'Lot 6 hauts été',      lettre: 'M', montant: 1000, type: 'vente' },
      { id: 'g3', libelle: 'Sandales cuir T38',    lettre: 'C', montant: 480, type: 'vente' }
    ],
    paiements: {}
  },
  {
    id: 'l-20260625', date: '2026-06-25', titre: 'Live du 25 juin',
    categorie: "Robes d'été", fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-06-26' },
    articles: [
      { id: 'h1', libelle: 'Robe longue imprimée', lettre: 'C', montant: 890, type: 'vente' },
      { id: 'h2', libelle: 'Kimono soie',          lettre: 'C', montant: 560, type: 'vente' },
      { id: 'h3', libelle: 'Chapeau paille',       lettre: 'R', montant: 120, type: 'vente' }
    ],
    paiements: { C: { date: '2026-06-30', mode: 'Virement' }, R: { date: '2026-06-30', mode: 'Virement' } }
  },
  {
    id: 'l-20260619', date: '2026-06-19', titre: 'Live du 19 juin',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-06-20' },
    articles: [
      { id: 'i1', libelle: 'Blouse brodée',        lettre: 'M', montant: 425, type: 'vente' },
      { id: 'i2', libelle: 'Pantalon lin blanc',   lettre: 'M', montant: 680, type: 'vente' },
      { id: 'i3', libelle: 'Sac cabas raphia',     lettre: 'P', montant: 340, type: 'vente' }
    ],
    paiements: { M: { date: '2026-06-24', mode: 'Virement' }, P: { date: '2026-06-24', mode: 'Virement' } }
  },
  {
    id: 'l-20260612', date: '2026-06-12', titre: 'Live du 12 juin',
    categorie: 'Sacs & accessoires', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-06-13' },
    articles: [
      { id: 'j1', libelle: 'Sac bandoulière cuir', lettre: 'B', montant: 980, type: 'vente' },
      { id: 'j2', libelle: 'Lot ceintures',        lettre: 'B', montant: 700, type: 'vente' },
      { id: 'j3', libelle: 'Lunettes vintage',     lettre: 'D', montant: 260, type: 'vente' }
    ],
    paiements: { B: { date: '2026-06-17', mode: 'Virement' }, D: { date: '2026-06-17', mode: 'Virement' } }
  },
  {
    id: 'l-20260608', date: '2026-06-08', titre: 'Live du 8 juin',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-06-09' },
    articles: [
      { id: 'k1', libelle: 'Veste tailleur',       lettre: 'F', montant: 890, type: 'vente' },
      { id: 'k2', libelle: 'Lot 3 jupes',          lettre: 'F', montant: 560, type: 'vente' }
    ],
    paiements: { F: { date: '2026-06-12', mode: 'Virement' } }
  },
  {
    id: 'l-20260522', date: '2026-05-22', titre: 'Live du 22 mai',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-05-23' },
    articles: [
      { id: 'm1', libelle: 'Trench mi-saison',     lettre: 'M', montant: 480, type: 'vente' },
      { id: 'm2', libelle: 'Lot accessoires',      lettre: 'M', montant: 300, type: 'vente' },
      { id: 'm3', libelle: 'Bottines daim',        lettre: 'T', montant: 290, type: 'vente' }
    ],
    paiements: { M: { date: '2026-05-27', mode: 'Virement' }, T: { date: '2026-05-27', mode: 'Virement' } }
  },
  {
    id: 'l-20260424', date: '2026-04-24', titre: 'Live du 24 avril',
    categorie: 'Mix saison', fraisPct: 0,
    encaisse: { statut: 'Reçu', date: '2026-04-25' },
    articles: [
      { id: 'n1', libelle: 'Pull cachemire',       lettre: 'M', montant: 345, type: 'vente' },
      { id: 'n2', libelle: 'Lot 2 robes hiver',    lettre: 'M', montant: 200, type: 'vente' }
    ],
    paiements: { M: { date: '2026-04-29', mode: 'Virement' } }
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

/* Agenda : mêmes événements pour toutes les pages qui l'affichent */
var SAGA_AGENDA_DEFAUT = [
  { id: 'e1', type: 'Live',   date: '2026-08-18', heure: '19:00', titre: 'Julie Renard (C)',      commentaire: 'Mix saison' },
  { id: 'e2', type: 'Récup.', date: '2026-08-17', heure: '',      titre: 'Camille Bertin (B)',    commentaire: '12 caisses à récupérer, dépôt Rungis' },
  { id: 'e3', type: 'Live',   date: '2026-08-20', heure: '20:30', titre: 'Marion Fabre (F)',      commentaire: 'Catégorie sacs & accessoires' },
  { id: 'e4', type: 'Autre',  date: '2026-08-24', heure: '',      titre: 'Réception fournisseur', commentaire: 'Livraison housses + étiquettes' },
  { id: 'e5', type: 'Récup.', date: '2026-08-27', heure: '14:00', titre: 'Nora Tissot (T)',       commentaire: 'Première collecte, 4 caisses estimées' },
  { id: 'e6', type: 'Live',   date: '2026-09-02', heure: '20:00', titre: 'Fanny Moreau (M)',      commentaire: 'Fin de saison été' }
];

function sagaAgenda() { return sagaLoad('agenda', SAGA_AGENDA_DEFAUT); }

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

/* Les montants sont arrêtés au centime dès le calcul.
   Sans cela, les additions en virgule flottante dérivent et un total peut
   tomber sur un demi-centime : le même montant s'arrondissait alors
   différemment selon l'ordre d'addition, et le total affiché ne
   correspondait plus à la somme des lignes affichées. */
/* Plafond contractuel des giveaways déduits, par live */
var SAGA_PLAFOND_GIVEAWAY = 10;

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
  // Une vente hors Whatnot ne supporte pas les frais de la plateforme
  var soumisFrais = arts.filter(function (a) { return a.type === 'vente'; })
                        .reduce(function (s, a) { return s + a.montant; }, 0);
  var horsLive = arts.filter(function (a) { return a.type === 'horslive'; })
                     .reduce(function (s, a) { return s + a.montant; }, 0);
  var base = sagaCentimes(soumisFrais * (1 - (live.fraisPct || 0) / 100) + horsLive);
  var commSaga = sagaCentimes(base * t.commission / 100);
  var commApporteur = t.apporteur ? sagaCentimes(base * t.apporteurPct / 100) : 0;

  /* Giveaways : le montant remonté par Whatnot correspond aux frais de port
     du cadeau — la plateforme n'en connaît pas la valeur, que Saga finance.
     Ce montant est déduit du net de la cliente, plafonné par live. */
  var portGiveaway = Math.min(giveaways, SAGA_PLAFOND_GIVEAWAY);

  var paiement = (live.paiements || {})[lettre] || null;
  return {
    lettre: lettre, prenom: t.prenom, articles: arts,
    ventes: sagaCentimes(ventes), giveaways: sagaCentimes(giveaways), base: base,
    portGiveaway: sagaCentimes(portGiveaway),
    commSaga: commSaga, commApporteur: commApporteur, apporteur: t.apporteur,
    net: sagaCentimes(base - commSaga - commApporteur - portGiveaway),
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

function sagaVentesDirectes() { return sagaLoad('ventes_directes', SAGA_VENTES_DIRECTES_DEFAUT); }
function sagaSaveVentesDirectes(v) { return sagaSave('ventes_directes', v); }

var SAGA_VENTES_DIRECTES_DEFAUT = [
  { id: 'vd1', date: '2026-07-28', lettre: 'F', libelle: 'Sac vendu en main propre',
    montant: 260, frais: 0, mode: 'Remise en main propre', paye: 0 },
  { id: 'vd2', date: '2026-07-22', lettre: 'M', libelle: 'Veste vendue sur Vinted',
    montant: 245, frais: 5, mode: 'Autre plateforme (Vinted, Leboncoin…)', paye: 1, datePaiement: '2026-07-25' },
  { id: 'vd3', date: '2026-07-18', lettre: 'B', libelle: 'Lot de foulards',
    montant: 180, frais: 0, mode: 'Virement direct', paye: 1, datePaiement: '2026-07-20' }
];

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
      lettre: lettre, ventes: d.ventes, giveaways: 0,
      commission: d.commSaga, apporteurMontant: d.commApporteur, frais: d.frais,
      net: d.net, paye: v.paye ? 1 : 0,
      datePaiement: v.datePaiement || '', modePaiement: v.paye ? 'Virement' : '',
      nbArticles: 1
    });
  });

  return res.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
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

var SAGA_NOTES_DEFAUT = [
  { id: 'n1', type: 'todo', lettre: 'M', texte: "Rendre à Fanny les 3 pièces d'hiver mises de côté.", date: '2026-08-10', done: false },
  { id: 'n2', type: 'note', lettre: 'M', texte: 'Préfère les lives le mardi soir. Ne veut pas vendre les pièces Sézane sous 25 €.', date: '2026-07-18', done: false },
  { id: 'n3', type: 'todo', lettre: 'C', texte: 'Relancer Julie pour la signature de son contrat.', date: '2026-08-12', done: false },
  { id: 'n4', type: 'todo', lettre: '',  texte: 'Commander des housses et des étiquettes.', date: '2026-08-13', done: false },
  { id: 'n5', type: 'todo', lettre: 'B', texte: 'Récupérer le dressing de Camille (12 caisses).', date: '2026-08-05', done: true },
  { id: 'n6', type: 'note', lettre: '',  texte: 'Whatnot passe en promo 0 frais du 20 au 25 août.', date: '2026-08-11', done: false }
];

function sagaNotes() { return sagaLoad('notes', SAGA_NOTES_DEFAUT); }
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

var SAGA_UTILISATEURS_DEFAUT = [
  { id: 1, prenom: 'Sarah', nom: 'Danino', email: 'sarah@sagadressing.fr',
    role: 'admin', statut: 'actif', creele: '2026-01-12', proprietaire: true }
];

function sagaUtilisateurs() { return sagaLoad('utilisateurs', SAGA_UTILISATEURS_DEFAUT); }
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
var SAGA_VERSION = '1.7.2';

var SAGA_VERSIONS = [
  { version: '1.7.2', date: '2026-08-14', titre: 'Appellation « Giveaway » rétablie', points: [
    'Le terme « Giveaway » revient partout : colonne, indicateurs, décompte et libellés'
  ]},
  { version: '1.7.1', date: '2026-08-14', titre: 'Ajustements', points: [
    'Giveaways : le montant importé de Whatnot correspond aux frais de port, plafonné à 10 € par live',
    'Notes : le type choisi est respecté et la vue bascule pour montrer ce qui vient d\'être créé',
    'Boutique : aucune cliente cochée d\'office',
    'Téléphones affichés et enregistrés par paires de chiffres partout'
  ]},
  { version: '1.7.0', date: '2026-08-14', titre: 'Giveaways, agenda et lecture des chiffres', points: [
    'Giveaways : Saga finance le cadeau, seuls les frais de port sont refacturés (10 € max par live)',
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

/* ============ Aperçu d'un PDF avant enregistrement ============
   Le document s'affiche dans une fenêtre : on le relit, puis on décide
   de l'enregistrer ou non. */
function sagaApercuPdf(pdf, nomFichier, titre) {
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
