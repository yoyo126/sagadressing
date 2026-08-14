/* ============================================================
   Générateur de PDF — Saga Dressing
   Écrit un vrai fichier .pdf téléchargeable, sans aucune
   bibliothèque externe : l'application reste utilisable hors ligne.
   Polices Helvetica (base 14, encodage WinAnsi) et logo JPEG
   inséré tel quel (filtre DCTDecode).
   ============================================================ */

/* --- Encodage WinAnsi : les accents français sortent correctement --- */
var SAGA_WINANSI = {
  '€': 128, '‘': 145, '’': 146, '“': 147, '”': 148,
  '•': 149, '–': 150, '—': 151, '…': 133, '‹': 139, '›': 155,
  '„': 132, '†': 134, '‡': 135, '‰': 137, '™': 153,
  // Signes absents de WinAnsi : repliés sur leur équivalent ASCII
  '\u2212': 45, '\u2011': 45, '\u2248': 126, '\u2264': 60, '\u2265': 62,
  '\u00A0': 32, '\u202F': 32, '\u2009': 32
};

function sagaPdfEncode(texte) {
  var out = '';
  for (var i = 0; i < texte.length; i++) {
    var ch = texte[i];
    var code = SAGA_WINANSI[ch];
    if (code === undefined) {
      code = ch.charCodeAt(0);
      if (code > 255) code = 63;            // caractère non représentable → « ? »
    }
    // Échappement des caractères réservés d'une chaîne PDF
    if (code === 40 || code === 41 || code === 92) out += '\\';
    out += String.fromCharCode(code);
  }
  return out;
}

/* --- Largeurs des glyphes Helvetica, pour couper et centrer le texte --- */
var SAGA_HELV_W = [
  278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,
  278,278,278,278,278,278,278,278,278,278,278,278,
  278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,
  556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,
  1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,
  667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,
  333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,
  556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,350
];

function sagaLargeurTexte(texte, taille, gras) {
  var total = 0;
  for (var i = 0; i < texte.length; i++) {
    var c = texte.charCodeAt(i);
    var w = (c < 256 && SAGA_HELV_W[c] !== undefined) ? SAGA_HELV_W[c] : 556;
    total += w;
  }
  // Helvetica-Bold est sensiblement plus large que la romaine
  return total / 1000 * taille * (gras ? 1.06 : 1);
}

function sagaCouper(texte, largeurMax, taille, gras) {
  var mots = String(texte).split(/\s+/);
  var lignes = [];
  var courante = '';
  mots.forEach(function (mot) {
    var essai = courante ? courante + ' ' + mot : mot;
    if (sagaLargeurTexte(essai, taille, gras) <= largeurMax || !courante) courante = essai;
    else { lignes.push(courante); courante = mot; }
  });
  if (courante) lignes.push(courante);
  return lignes;
}

/* --- Décodage d'une image JPEG en data URL : octets + dimensions --- */
function sagaJpegInfo(dataUrl) {
  if (!dataUrl || dataUrl.indexOf('data:image/jpeg') !== 0) return null;
  var binaire = atob(dataUrl.split(',')[1]);
  var largeur = 0, hauteur = 0;
  for (var i = 2; i < binaire.length - 9;) {
    if (binaire.charCodeAt(i) !== 0xFF) { i++; continue; }
    var marqueur = binaire.charCodeAt(i + 1);
    var taille = (binaire.charCodeAt(i + 2) << 8) + binaire.charCodeAt(i + 3);
    // SOF0..SOF15 hors marqueurs de restart : y lire les dimensions
    if (marqueur >= 0xC0 && marqueur <= 0xCF && marqueur !== 0xC4 && marqueur !== 0xC8 && marqueur !== 0xCC) {
      hauteur = (binaire.charCodeAt(i + 5) << 8) + binaire.charCodeAt(i + 6);
      largeur = (binaire.charCodeAt(i + 7) << 8) + binaire.charCodeAt(i + 8);
      break;
    }
    i += 2 + taille;
  }
  if (!largeur || !hauteur) return null;
  return { data: binaire, largeur: largeur, hauteur: hauteur };
}

/* ============================================================
   Document : page A4, coordonnées en points, origine en haut à gauche
   ============================================================ */
function SagaPdf(options) {
  options = options || {};
  this.largeur = 595.28;              // A4
  this.hauteur = 841.89;
  this.marge = 48;
  this.titreDoc = options.titre || 'Document';
  this.pages = [];
  this.image = sagaJpegInfo(options.logo);
  this.enTete = options.enTete || null;   // { nom, sousTitre }
  this.nouvellePage();
}

SagaPdf.prototype.nouvellePage = function () {
  this.flux = [];
  this.pages.push(this.flux);
  this.y = this.marge;
  if (this.pages.length === 1) this.dessinerEnTete();
  else this.y = this.marge + 16;
  return this;
};

SagaPdf.prototype.placeDispo = function (hauteurNecessaire) {
  if (this.y + hauteurNecessaire > this.hauteur - this.marge - 24) this.nouvellePage();
};

/* --- Primitives --- */
SagaPdf.prototype.texte = function (txt, x, y, opts) {
  opts = opts || {};
  var taille = opts.taille || 10;
  var police = opts.gras ? '/F2' : '/F1';
  var c = opts.couleur || [0.14, 0.12, 0.10];
  if (opts.aligne === 'droite') x -= sagaLargeurTexte(txt, taille, opts.gras);
  else if (opts.aligne === 'centre') x -= sagaLargeurTexte(txt, taille, opts.gras) / 2;
  this.flux.push(
    'BT ' + c[0].toFixed(3) + ' ' + c[1].toFixed(3) + ' ' + c[2].toFixed(3) + ' rg ' +
    police + ' ' + taille + ' Tf 1 0 0 1 ' + x.toFixed(2) + ' ' +
    (this.hauteur - y).toFixed(2) + ' Tm (' + sagaPdfEncode(String(txt)) + ') Tj ET'
  );
  return this;
};

SagaPdf.prototype.ligne = function (x1, y1, x2, y2, couleur, epaisseur) {
  var c = couleur || [0.91, 0.87, 0.81];
  this.flux.push(
    c[0].toFixed(3) + ' ' + c[1].toFixed(3) + ' ' + c[2].toFixed(3) + ' RG ' +
    (epaisseur || 0.7) + ' w ' + x1.toFixed(2) + ' ' + (this.hauteur - y1).toFixed(2) + ' m ' +
    x2.toFixed(2) + ' ' + (this.hauteur - y2).toFixed(2) + ' l S'
  );
  return this;
};

SagaPdf.prototype.rectangle = function (x, y, l, h, couleur) {
  var c = couleur || [0.98, 0.96, 0.93];
  this.flux.push(
    c[0].toFixed(3) + ' ' + c[1].toFixed(3) + ' ' + c[2].toFixed(3) + ' rg ' +
    x.toFixed(2) + ' ' + (this.hauteur - y - h).toFixed(2) + ' ' +
    l.toFixed(2) + ' ' + h.toFixed(2) + ' re f'
  );
  return this;
};

/* --- En-tête : logo à gauche, identité à droite --- */
SagaPdf.prototype.dessinerEnTete = function () {
  var hautLogo = 0;
  if (this.image) {
    var maxH = 46, maxL = 150;
    var ratio = Math.min(maxL / this.image.largeur, maxH / this.image.hauteur);
    var l = this.image.largeur * ratio, h = this.image.hauteur * ratio;
    this.flux.push('q ' + l.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' +
      this.marge + ' ' + (this.hauteur - this.marge - h).toFixed(2) + ' cm /Im1 Do Q');
    hautLogo = h;
  } else {
    // Sans logo, le nom de la marque tient lieu d'en-tête
    this.texte('SAGA DRESSING', this.marge, this.marge + 16, { taille: 15, gras: true, couleur: [0.55, 0.37, 0.17] });
    hautLogo = 22;
  }

  if (this.enTete) {
    var y = this.marge + 10;
    var droite = this.largeur - this.marge;
    (this.enTete.lignes || []).forEach(function (l, i) {
      this.texte(l, droite, y + i * 12, { taille: i === 0 ? 9.5 : 8.5, gras: i === 0, aligne: 'droite', couleur: [0.45, 0.41, 0.32] });
    }, this);
  }

  this.y = this.marge + Math.max(hautLogo, 40) + 16;
  this.ligne(this.marge, this.y, this.largeur - this.marge, this.y, [0.78, 0.66, 0.48], 1.4);
  this.y += 26;
};

/* --- Blocs de contenu --- */
SagaPdf.prototype.titre = function (txt) {
  this.placeDispo(30);
  this.texte(txt, this.marge, this.y + 14, { taille: 17, gras: true });
  this.y += 24;
  return this;
};

SagaPdf.prototype.sousTitre = function (txt) {
  this.placeDispo(20);
  sagaCouper(txt, this.largeur - 2 * this.marge, 9.5).forEach(function (l) {
    this.texte(l, this.marge, this.y + 10, { taille: 9.5, couleur: [0.45, 0.41, 0.32] });
    this.y += 13;
  }, this);
  this.y += 8;
  return this;
};

SagaPdf.prototype.section = function (txt) {
  this.placeDispo(40);
  this.y += 10;
  this.texte(txt, this.marge, this.y + 10, { taille: 11.5, gras: true });
  this.y += 15;
  this.ligne(this.marge, this.y, this.largeur - this.marge, this.y);
  this.y += 12;
  return this;
};

SagaPdf.prototype.paragraphe = function (txt, opts) {
  opts = opts || {};
  var taille = opts.taille || 9.5;
  this.placeDispo(16);
  sagaCouper(txt, this.largeur - 2 * this.marge, taille, opts.gras).forEach(function (l) {
    this.placeDispo(14);
    this.texte(l, this.marge, this.y + taille, { taille: taille, gras: opts.gras, couleur: opts.couleur });
    this.y += taille + 4;
  }, this);
  this.y += 6;
  return this;
};

/* colonnes : [{ titre, cle, largeur, aligne }] */
SagaPdf.prototype.tableau = function (colonnes, lignes, total) {
  var dispo = this.largeur - 2 * this.marge;
  var somme = colonnes.reduce(function (s, c) { return s + c.largeur; }, 0);
  var x0 = this.marge;

  function positions() {
    var xs = [], x = x0;
    colonnes.forEach(function (c) { xs.push(x); x += c.largeur / somme * dispo; });
    xs.push(x);
    return xs;
  }
  var xs = positions();

  var dessinerEntete = function () {
    this.placeDispo(26);
    colonnes.forEach(function (c, i) {
      var x = c.aligne === 'droite' ? xs[i + 1] - 6 : xs[i] + 2;
      this.texte(c.titre.toUpperCase(), x, this.y + 8,
        { taille: 7.5, gras: true, aligne: c.aligne === 'droite' ? 'droite' : null, couleur: [0.45, 0.41, 0.32] });
    }, this);
    this.y += 13;
    this.ligne(this.marge, this.y, this.largeur - this.marge, this.y);
    this.y += 4;
  }.bind(this);

  dessinerEntete();

  lignes.forEach(function (ligne) {
    // Hauteur de la ligne : la colonne la plus haute décide
    var blocs = colonnes.map(function (c, i) {
      var largeurCol = xs[i + 1] - xs[i] - 8;
      return sagaCouper(String(ligne[c.cle] === undefined ? '' : ligne[c.cle]), largeurCol, 9);
    });
    var hauteur = Math.max.apply(null, blocs.map(function (b) { return b.length; })) * 12 + 5;

    if (this.y + hauteur > this.hauteur - this.marge - 24) { this.nouvellePage(); dessinerEntete(); }

    blocs.forEach(function (lignesTexte, i) {
      var c = colonnes[i];
      var x = c.aligne === 'droite' ? xs[i + 1] - 6 : xs[i] + 2;
      lignesTexte.forEach(function (t, j) {
        this.texte(t, x, this.y + 9 + j * 12,
          { taille: 9, aligne: c.aligne === 'droite' ? 'droite' : null, couleur: c.discret ? [0.45, 0.41, 0.32] : null });
      }, this);
    }, this);

    this.y += hauteur;
    this.ligne(this.marge, this.y, this.largeur - this.marge, this.y, [0.94, 0.91, 0.85], 0.5);
    this.y += 3;
  }, this);

  if (total) {
    this.placeDispo(24);
    this.ligne(this.marge, this.y, this.largeur - this.marge, this.y, [0.14, 0.12, 0.10], 1.1);
    this.y += 4;
    colonnes.forEach(function (c, i) {
      if (total[c.cle] === undefined) return;
      var x = c.aligne === 'droite' ? xs[i + 1] - 6 : xs[i] + 2;
      this.texte(String(total[c.cle]), x, this.y + 10,
        { taille: 9.5, gras: true, aligne: c.aligne === 'droite' ? 'droite' : null });
    }, this);
    this.y += 18;
  }
  this.y += 8;
  return this;
};

/* Encadré de décompte : lignes libellé / montant, dernière en gras */
SagaPdf.prototype.decompte = function (lignes) {
  var h = lignes.length * 15 + 16;
  this.placeDispo(h + 6);
  var l = this.largeur - 2 * this.marge;
  this.rectangle(this.marge, this.y, l, h, [0.984, 0.965, 0.933]);
  this.ligne(this.marge, this.y, this.marge + l, this.y, [0.91, 0.87, 0.81], 0.7);
  this.ligne(this.marge, this.y + h, this.marge + l, this.y + h, [0.91, 0.87, 0.81], 0.7);

  var y = this.y + 8;
  lignes.forEach(function (ligne, i) {
    var dernier = i === lignes.length - 1;
    if (dernier) {
      this.ligne(this.marge + 10, y + 2, this.marge + l - 10, y + 2, [0.85, 0.80, 0.72], 0.6);
      y += 5;
    }
    this.texte(ligne[0], this.marge + 12, y + 9, { taille: dernier ? 10.5 : 9.5, gras: dernier });
    this.texte(ligne[1], this.marge + l - 12, y + 9,
      { taille: dernier ? 10.5 : 9.5, gras: dernier, aligne: 'droite',
        couleur: dernier ? [0.55, 0.37, 0.17] : null });
    y += 15;
  }, this);

  this.y += h + 12;
  return this;
};

/* --- Assemblage du fichier --- */
SagaPdf.prototype.octets = function () {
  var self = this;
  var objets = [];
  var nbPages = this.pages.length;

  // Pied de page sur chaque page : mention + numérotation
  this.pages.forEach(function (flux, i) {
    var y = self.hauteur - self.marge + 14;
    var sauve = self.flux, sauveY = self.y;
    self.flux = flux;
    self.ligne(self.marge, y - 12, self.largeur - self.marge, y - 12, [0.91, 0.87, 0.81], 0.6);
    self.texte('Saga Dressing', self.marge, y, { taille: 7.5, couleur: [0.61, 0.57, 0.46] });
    self.texte('Page ' + (i + 1) + ' / ' + nbPages, self.largeur - self.marge, y,
      { taille: 7.5, aligne: 'droite', couleur: [0.61, 0.57, 0.46] });
    self.flux = sauve; self.y = sauveY;
  });

  function ajouter(contenu) { objets.push(contenu); return objets.length; }

  var refPolice1 = ajouter('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  var refPolice2 = ajouter('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  var refImage = null;
  if (this.image) {
    refImage = ajouter('<< /Type /XObject /Subtype /Image /Width ' + this.image.largeur +
      ' /Height ' + this.image.hauteur + ' /ColorSpace /DeviceRGB /BitsPerComponent 8' +
      ' /Filter /DCTDecode /Length ' + this.image.data.length + ' >>\nstream\n' + this.image.data + '\nendstream');
  }

  var ressources = '<< /Font << /F1 ' + refPolice1 + ' 0 R /F2 ' + refPolice2 + ' 0 R >>' +
    (refImage ? ' /XObject << /Im1 ' + refImage + ' 0 R >>' : '') + ' >>';

  var refPagesParent = objets.length + 1 + nbPages * 2;   // réservé, rempli plus bas
  var refsPages = [];
  this.pages.forEach(function (flux) {
    var contenu = flux.join('\n');
    var refContenu = ajouter('<< /Length ' + contenu.length + ' >>\nstream\n' + contenu + '\nendstream');
    refsPages.push(ajouter('<< /Type /Page /Parent ' + refPagesParent + ' 0 R /MediaBox [0 0 ' +
      self.largeur.toFixed(2) + ' ' + self.hauteur.toFixed(2) + '] /Resources ' + ressources +
      ' /Contents ' + refContenu + ' 0 R >>'));
  });

  var refPages = ajouter('<< /Type /Pages /Count ' + nbPages + ' /Kids [' +
    refsPages.map(function (r) { return r + ' 0 R'; }).join(' ') + '] >>');
  var refCatalogue = ajouter('<< /Type /Catalog /Pages ' + refPages + ' 0 R >>');
  var refInfo = ajouter('<< /Title (' + sagaPdfEncode(this.titreDoc) + ') /Producer (Saga Dressing CRM) >>');

  // refPagesParent avait été anticipé : vérifié ici, corrigé si besoin
  if (refPages !== refPagesParent) {
    objets = objets.map(function (o) {
      return o.replace('/Parent ' + refPagesParent + ' 0 R', '/Parent ' + refPages + ' 0 R');
    });
  }

  var sortie = '%PDF-1.4\n';
  var positions = [0];
  objets.forEach(function (contenu, i) {
    positions.push(sortie.length);
    sortie += (i + 1) + ' 0 obj\n' + contenu + '\nendobj\n';
  });

  var debutXref = sortie.length;
  sortie += 'xref\n0 ' + (objets.length + 1) + '\n0000000000 65535 f \n';
  for (var i = 1; i <= objets.length; i++) {
    sortie += ('0000000000' + positions[i]).slice(-10) + ' 00000 n \n';
  }
  sortie += 'trailer\n<< /Size ' + (objets.length + 1) + ' /Root ' + refCatalogue +
    ' 0 R /Info ' + refInfo + ' 0 R >>\nstartxref\n' + debutXref + '\n%%EOF';

  var tampon = new Uint8Array(sortie.length);
  for (var j = 0; j < sortie.length; j++) tampon[j] = sortie.charCodeAt(j) & 0xFF;
  return tampon;
};

SagaPdf.prototype.dataUrl = function () {
  var octets = this.octets();
  var binaire = '';
  for (var i = 0; i < octets.length; i++) binaire += String.fromCharCode(octets[i]);
  return 'data:application/pdf;base64,' + btoa(binaire);
};

SagaPdf.prototype.enregistrer = function (nomFichier) {
  var blob = new Blob([this.octets()], { type: 'application/pdf' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = nomFichier.replace(/\.pdf$/i, '') + '.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
};

/* --- Identité de l'entreprise, réglable dans Paramètres --- */
function sagaIdentite() {
  return sagaLoad('identite', {
    nom: 'Saga Dressing',
    adresse: '',
    email: '',
    tel: '',
    siret: ''
  });
}

function sagaLogo() { return sagaLoad('logo', ''); }

/* Crée un document déjà coiffé du logo et des coordonnées */
function sagaNouveauPdf(titre) {
  var id = sagaIdentite();
  var lignes = [id.nom];
  if (id.adresse) lignes.push(id.adresse);
  var contact = [id.tel, id.email].filter(Boolean).join(' · ');
  if (contact) lignes.push(contact);
  if (id.siret) lignes.push('SIRET ' + id.siret);
  return new SagaPdf({ titre: titre, logo: sagaLogo(), enTete: { lignes: lignes } });
}
