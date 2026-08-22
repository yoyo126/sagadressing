#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Construction de la version serveur du CRM.

L'application n'existe qu'une fois, en pages `.html` à la racine du dépôt.
Ce script en dérive les pages `.php` protégées par la connexion, sans jamais
modifier la source : une seule version à maintenir, deux façons de la servir.

Ce que chaque page reçoit :
  · une ligne en tête qui exige la connexion et charge l'état du CRM ;
  · l'état lui-même, écrit dans la page, que l'application lit au démarrage ;
  · server-sync.js, chargé juste après nav.js, qui renvoie au serveur ce qui
    est enregistré ;
  · les liens entre pages réécrits de .html en .php.

Usage :  python3 serveur/construire.py
Sortie :  serveur/build/  — le dossier à téléverser dans /CRM
"""

import io
import os
import re
import shutil

RACINE  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVEUR = os.path.join(RACINE, 'serveur')
SORTIE  = os.path.join(SERVEUR, 'build')

# Pages de l'application. `login.html` est exclue : la connexion est assurée
# par login.php, qui vérifie réellement le mot de passe.
PAGES = ['dashboard', 'clientes', 'cliente', 'lives', 'live',
         'apporteurs', 'apporteur', 'agenda', 'rapports',
         'boutique', 'parametres']

# Fichiers du serveur à déposer tels quels
FICHIERS_SERVEUR = ['.htaccess', 'db.php', 'lib_auth.php', 'entete.php',
                    'api.php', 'login.php', 'logout.php', 'server-sync.js',
                    'schema.sql', 'verifier.php', 'config.example.php',
                    'importer.php', 'sauvegarde.php',
                    'comptes_actions.php', 'comptes_bloc.php']

# Fichiers de l'application à déposer tels quels
FICHIERS_APP = ['style.css', 'nav.js', 'saga-pdf.js']

PRELUDE = "<?php require __DIR__ . '/entete.php'; ?>\n"


def rediriger_liens(texte):
    """Réécrit les liens entre pages, de .html vers .php.

    À appliquer aussi aux fichiers JavaScript : nav.js construit le menu
    latéral, et ses liens sont restés en .html — les pages existaient bien,
    mais sous un autre nom, et tout le menu tombait sur « Not Found »."""
    for nom in PAGES:
        texte = re.sub(r'\b' + nom + r'\.html\b', nom + '.php', texte)
    # La connexion est celle du serveur
    texte = re.sub(r'\blogin\.html\b', 'login.php', texte)
    texte = re.sub(r'\bindex\.html\b', 'index.php', texte)
    return texte


def remplacer_onglet_utilisateurs(html):
    """Substitue la gestion réelle des accès à la liste de la maquette.

    La maquette organise des rôles sans connexion derrière ; sur le serveur,
    c'est la table `utilisateurs` qui fait foi. Plutôt que deux endroits — une
    page à part, et un onglet qui n'en est pas une —, l'onglet devient le seul.
    """
    if 'id="tab-users"' not in html:
        return html

    debut = html.index('<div class="tab-panel" id="tab-users"')
    ouverture = html.index('>', debut) + 1

    # Fin du panneau : on suit l'imbrication des <div> jusqu'à sa fermeture
    profondeur, i = 1, ouverture
    while profondeur > 0:
        suivant_ouvre = html.find('<div', i)
        suivant_ferme = html.find('</div>', i)
        if suivant_ferme == -1:
            raise ValueError('panneau tab-users non refermé')
        if suivant_ouvre != -1 and suivant_ouvre < suivant_ferme:
            profondeur += 1
            i = suivant_ouvre + 4
        else:
            profondeur -= 1
            i = suivant_ferme + 6

    return (html[:ouverture]
            + "\n<?php require __DIR__ . '/comptes_bloc.php'; ?>\n"
            + html[i - 6:])


def convertir(html):
    """Transforme une page de l'application en page servie par PHP."""

    # 1. Les liens entre pages pointent désormais vers les .php
    html = rediriger_liens(html)

    # 2. L'état du CRM est écrit dans la page, avant tout script
    if '</head>' not in html:
        raise ValueError('page sans </head>')
    html = html.replace('</head>', "<?= saga_script_etat() ?>\n</head>", 1)

    # 3. L'onglet Utilisateurs montre les vrais accès, pas la liste de la maquette
    html = remplacer_onglet_utilisateurs(html)

    # 4. La synchronisation se greffe juste après nav.js
    if '<script src="nav.js"></script>' not in html:
        raise ValueError('page sans nav.js')
    html = html.replace(
        '<script src="nav.js"></script>',
        '<script src="nav.js"></script>\n<script src="server-sync.js"></script>',
        1)

    return PRELUDE + html


def construire():
    if os.path.isdir(SORTIE):
        shutil.rmtree(SORTIE)
    os.makedirs(SORTIE)

    produits = []

    for nom in PAGES:
        source = os.path.join(RACINE, nom + '.html')
        if not os.path.isfile(source):
            raise SystemExit('Page introuvable : ' + source)
        html = io.open(source, encoding='utf-8').read()
        io.open(os.path.join(SORTIE, nom + '.php'), 'w', encoding='utf-8').write(convertir(html))
        produits.append(nom + '.php')

    # La racine ouvre le tableau de bord ; la connexion est exigée par lui
    io.open(os.path.join(SORTIE, 'index.php'), 'w', encoding='utf-8').write(
        "<?php\n"
        "/* La racine du site ouvre le tableau de bord. */\n"
        "header('Location: dashboard.php');\n"
        "exit;\n")
    produits.append('index.php')

    for f in FICHIERS_SERVEUR:
        shutil.copy2(os.path.join(SERVEUR, f), os.path.join(SORTIE, f))
        produits.append(f)

    for f in FICHIERS_APP:
        contenu = io.open(os.path.join(RACINE, f), encoding='utf-8').read()
        if f.endswith('.js'):
            contenu = rediriger_liens(contenu)
        io.open(os.path.join(SORTIE, f), 'w', encoding='utf-8').write(contenu)
        produits.append(f)

    print('Construit dans %s :' % os.path.relpath(SORTIE, RACINE))
    for f in sorted(produits):
        taille = os.path.getsize(os.path.join(SORTIE, f))
        print('   %-24s %6.1f Ko' % (f, taille / 1024))
    print('\n%d fichiers. À déposer dans /CRM.' % len(produits))
    print('Rappel : config.php n\'est pas produit ici — il reste sur le serveur.')


if __name__ == '__main__':
    construire()
