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
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.75));
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
