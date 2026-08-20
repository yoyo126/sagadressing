#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Conversion des données de l'ancien CRM vers le nouveau.

Lit un export SQL complet de l'ancienne base (celui de phpMyAdmin, structure et
données, les neuf tables) et produit l'état du nouveau CRM, en JSON, prêt à être
importé. L'ancienne base n'est jamais ouverte : tout se lit dans le fichier.

    python3 serveur/convertir.py export.sql etat.json

Les deux modèles ne sont pas les mêmes :

  · Ancien : un « live » appartient à UNE cliente ; plusieurs lives d'une même
    soirée sont regroupés dans une « session ».
  · Nouveau : un live est la soirée entière, et chaque article porte le code du
    dressing auquel il revient.

La conversion regroupe donc les lives par session, et réunit leurs ventes en
articles d'un seul live. Les montants ne sont pas recalculés : ils découlent
des mêmes articles, avec la même formule — c'est vérifié à la fin, live par
live, contre les totaux enregistrés par l'ancien CRM.

Les codes de dressing demandent une décision : l'ancien les portait par live,
si bien que deux clientes pouvaient utiliser « C » sans se gêner. Le nouveau
les veut uniques. Chaque cliente garde donc son code habituel quand il est
libre, et reçoit sinon un code de deux lettres, signalé dans le compte rendu.
"""

import io
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# ============================================================
#  Lecture de l'export SQL
# ============================================================

def _tuples(txt, depart):
    """Découpe les valeurs d'un INSERT, en respectant les chaînes SQL."""
    i, n = depart, len(txt)
    lignes, courant, valeur, litteral = [], [], '', True
    prof, dans, quote = 0, False, ''
    while i < n:
        c = txt[i]
        if dans:
            if c == '\\':
                suite = txt[i + 1:i + 2]
                valeur += {'n': '\n', 'r': '\r', 't': '\t', '0': '\0'}.get(suite, suite)
                i += 2
                continue
            if c == quote:
                if i + 1 < n and txt[i + 1] == quote:
                    valeur += quote
                    i += 2
                    continue
                dans = False
                i += 1
                continue
            valeur += c
            i += 1
            continue
        if c in "'\"":
            dans, quote, litteral = True, c, False
            i += 1
            continue
        if c == '(':
            prof += 1
            if prof == 1:
                courant, valeur, litteral = [], '', True
            else:
                valeur += c
            i += 1
            continue
        if c == ')':
            prof -= 1
            if prof == 0:
                courant.append(None if litteral and valeur.strip().upper() == 'NULL' else valeur)
                lignes.append(courant)
                valeur, litteral = '', True
            else:
                valeur += c
            i += 1
            continue
        if c == ',' and prof == 1:
            courant.append(None if litteral and valeur.strip().upper() == 'NULL' else valeur)
            valeur, litteral = '', True
            i += 1
            continue
        if c == ';' and prof == 0:
            return lignes, i
        valeur += c
        i += 1
    return lignes, n


def lire_export(chemin):
    src = io.open(chemin, encoding='utf-8', errors='replace').read()
    tables = defaultdict(list)
    for m in re.finditer(r'INSERT INTO `(\w+)`\s*\(([^)]*)\)\s*VALUES', src, re.I):
        cols = [c.strip().strip('`') for c in m.group(2).split(',')]
        vals, _ = _tuples(src, m.end())
        for v in vals:
            propre = [x.strip() if isinstance(x, str) else x for x in v]
            tables[m.group(1)].append(dict(zip(cols, propre)))
    return tables


# ============================================================
#  Petits utilitaires
# ============================================================

def nb(x, defaut=0.0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return defaut


def centimes(x):
    return round(x + 1e-9, 2)


def sans_accent(t):
    t = unicodedata.normalize('NFD', t or '')
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


def slug(t):
    t = sans_accent(t).lower()
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return t or 'cliente'


def texte_sur(t):
    """Même neutralisation que le CRM : ces caractères casseraient l'affichage."""
    if not isinstance(t, str):
        return t
    for avant, apres in (('<', '‹'), ('>', '›'), ('"', '”'), ("'", '’')):
        t = t.replace(avant, apres)
    return t


MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
        'août', 'septembre', 'octobre', 'novembre', 'décembre']


def mois_annee(iso):
    if not iso or len(iso) < 7:
        return ''
    try:
        return MOIS[int(iso[5:7]) - 1] + ' ' + iso[0:4]
    except (ValueError, IndexError):
        return ''


def date_longue(iso):
    if not iso or len(iso) < 10:
        return ''
    try:
        return '%d %s %s' % (int(iso[8:10]), MOIS[int(iso[5:7]) - 1], iso[0:4])
    except (ValueError, IndexError):
        return ''


# ============================================================
#  Attribution des codes de dressing
# ============================================================

def attribuer_codes(clientes, lives_par_cliente):
    """Un code unique par cliente, en préservant l'habitude quand c'est possible."""
    pris = {}
    codes = {}
    notes = []

    # Les clientes les plus actives choisissent en premier : leur code est celui
    # que Whatnot et les acheteuses connaissent déjà.
    ordre = sorted(clientes,
                   key=lambda c: -len(lives_par_cliente.get(c['id'], [])))

    for c in ordre:
        cid = c['id']
        habituels = Counter()
        for l in lives_par_cliente.get(cid, []):
            code = (l.get('lettre') or '').strip().upper()
            if code:
                habituels[code] += 1

        prenom = sans_accent(c.get('prenom') or '').upper()
        nom = sans_accent(c.get('nom') or '').upper()
        prenom = re.sub(r'[^A-Z]', '', prenom)
        nom = re.sub(r'[^A-Z]', '', nom)

        candidats = [code for code, _ in habituels.most_common()]
        if prenom:
            candidats.append(prenom[0])
            if len(prenom) > 1:
                candidats.append(prenom[0] + prenom[1])
            if nom:
                candidats.append(prenom[0] + nom[0])
                if len(nom) > 1:
                    candidats.append(prenom[0] + nom[0] + nom[1])
        if nom:
            candidats.append(nom[0])

        choisi = None
        for cand in candidats:
            cand = re.sub(r'[^A-Z]', '', cand)[:3]
            if cand and cand not in pris:
                choisi = cand
                break

        if not choisi:  # tout est pris : on ajoute une lettre
            base = (prenom or nom or 'X')[0]
            for suffixe in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
                if base + suffixe not in pris:
                    choisi = base + suffixe
                    break

        pris[choisi] = cid
        codes[cid] = choisi

        prefere = habituels.most_common(1)[0][0] if habituels else ''
        if prefere and prefere != choisi:
            notes.append((c, prefere, choisi))
        elif not prefere:
            notes.append((c, '', choisi))

    return codes, notes


# ============================================================
#  Conversion
# ============================================================

def convertir(T):
    rapport = {'avertissements': [], 'codes': [], 'controle': []}

    clientes_src = T.get('clientes', [])
    lives_src = T.get('lives', [])
    ventes_src = T.get('ventes', [])
    sessions_src = T.get('sessions', [])
    apporteurs_src = T.get('apporteurs', [])
    agenda_src = T.get('agenda', [])

    par_cliente = defaultdict(list)
    for l in lives_src:
        par_cliente[l['cliente_id']].append(l)

    ventes_par_live = defaultdict(list)
    for v in ventes_src:
        ventes_par_live[v['live_id']].append(v)

    codes, notes_codes = attribuer_codes(clientes_src, par_cliente)
    for c, avant, apres in notes_codes:
        rapport['codes'].append({
            'cliente': ((c.get('prenom') or '') + ' ' + (c.get('nom') or '')).strip(),
            'avant': avant, 'apres': apres
        })

    # ---------- Apporteurs ----------
    apporteurs = []
    apporteurs_data = {}
    cle_apporteur = {}
    for a in apporteurs_src:
        prenom = (a.get('prenom') or '').strip()
        nomf = (a.get('nom') or '').strip()
        affiche = (prenom + ' ' + (nomf[:1].upper() + '.' if nomf else '')).strip() or nomf
        cle = slug(prenom + '-' + nomf)
        cle_apporteur[a['id']] = affiche
        apporteurs.append({
            'key': cle, 'prenom': texte_sur(affiche), 'nom': texte_sur((prenom + ' ' + nomf).strip()),
            'initiales': ((prenom[:1] or '?') + (nomf[:1] or '')).upper(),
            'pct': 0, 'clientes': [], 'verse': 0, 'du': 0,
            'docsManquants': 0, 'statut': 'actif'
        })
        apporteurs_data[cle] = {
            'prenom': texte_sur(affiche), 'nom': texte_sur((prenom + ' ' + nomf).strip()),
            'initiales': ((prenom[:1] or '?') + (nomf[:1] or '')).upper(),
            'statut': 'Actif', 'email': texte_sur(a.get('email') or ''),
            'tel': texte_sur(a.get('telephone') or ''),
            'statutJur': '', 'siret': '', 'pct': 0,
            'depuis': mois_annee(a.get('date_creation') or ''),
            'clientes': [], 'docs': []
        }

    # ---------- Clientes ----------
    clientes = []
    clients_data = {}
    notes = []
    cle_par_cliente = {}

    for c in clientes_src:
        cid = c['id']
        code = codes[cid]
        prenom = (c.get('prenom') or '').strip()
        nomf = (c.get('nom') or '').strip()
        complet = (prenom + ' ' + nomf).strip() or ('Cliente ' + str(cid))
        cle = slug(prenom or nomf) + '-' + code.lower()
        cle_par_cliente[cid] = cle

        adresse = ', '.join(x for x in [
            (c.get('adresse') or '').strip(),
            ' '.join(x for x in [(c.get('code_postal') or '').strip(),
                                 (c.get('ville') or '').strip()] if x)
        ] if x)

        apporteur = cle_apporteur.get(c.get('apporteur_id'), '')
        pct = int(nb(c.get('commission_pct'), 30))
        actif = bool(par_cliente.get(cid))

        clientes.append({
            'key': cle, 'prenom': texte_sur(prenom or complet), 'nom': texte_sur(complet),
            'email': texte_sur(c.get('email') or ''), 'tel': texte_sur(c.get('telephone') or ''),
            'adresse': texte_sur(adresse), 'lettre': code,
            'apporteur': texte_sur(apporteur), 'pct': pct,
            'statut': 'active' if actif else 'inactive', 'vignette': ''
        })

        clients_data[cle] = {
            'prenom': texte_sur(prenom or complet), 'nom': texte_sur(complet), 'lettre': code,
            'statut': 'Active' if actif else 'Inactive',
            'tel': texte_sur(c.get('telephone') or ''), 'email': texte_sur(c.get('email') or ''),
            'adresse': texte_sur(adresse), 'commission': pct,
            'apporteur': texte_sur(apporteur) or None, 'apporteurPct': int(nb(c.get('apporteur_pct'))),
            'depuis': mois_annee(c.get('date_creation') or ''), 'pending': None
        }

        # Les notes libres de la fiche deviennent des notes rattachées au code
        libre = (c.get('notes') or '').strip()
        if libre:
            notes.append({
                'id': 'n-cl-' + str(cid), 'type': 'note', 'lettre': code,
                'texte': texte_sur(libre),
                'date': (c.get('date_creation') or '')[:10], 'done': False
            })

    # ---------- Lives ----------
    # Une session de l'ancien modèle = un live du nouveau. Les lives sans
    # session sont antérieurs au regroupement : chacun devient un live à part.
    groupes = defaultdict(list)
    for l in lives_src:
        sid = l.get('session_id')
        groupes[('s', sid) if sid else ('l', l['id'])].append(l)

    sessions = {s['id']: s for s in sessions_src}
    lives = []

    for cle_groupe, membres in groupes.items():
        genre, ident = cle_groupe
        session = sessions.get(ident) if genre == 's' else None

        dates = sorted({(l.get('date_live') or '') for l in membres if l.get('date_live')})
        date = (session.get('date_session') if session and session.get('date_session')
                else (dates[0] if dates else ''))

        titre = (session.get('nom') if session and (session.get('nom') or '').strip()
                 else (membres[0].get('nom') or '').strip())
        if not titre:
            titre = 'Live du ' + (date_longue(date) or date)

        articles = []
        paiements = {}
        taux_par_code = {}
        fraisPct = 0.0

        for l in membres:
            code = codes[l['cliente_id']]
            fraisPct = max(fraisPct, nb(l.get('frais_whatnot_pct')))

            # Le taux appliqué à l'époque est figé sur le live : la fiche d'une
            # cliente peut avoir changé de taux depuis, et l'historique doit
            # rester celui de ce qui lui a été versé.
            taux_par_code[code] = nb(l.get('commission_pct'), 30)

            for v in ventes_par_live.get(l['id'], []):
                genre = (v.get('type') or 'vente').strip().lower()

                if genre not in ('vente', 'giveaway'):
                    # L'ancien CRM connaissait un type « remboursement » que son
                    # propre calcul ignorait : ces lignes existaient sans jamais
                    # peser sur les montants. Les convertir en ventes négatives
                    # changerait l'historique — ce n'est pas ce qui est demandé.
                    # On les met de côté, en note, pour qu'elles ne disparaissent
                    # pas non plus en silence.
                    montant = centimes(nb(v.get('montant')))
                    rapport['avertissements'].append(
                        'Ligne « %s » de %.2f € (%s, commande %s) : ce type n\'était pas '
                        'compté par l\'ancien CRM. Reprise en note, sans effet sur les montants.'
                        % (genre, montant, v.get('date_vente') or '', v.get('num_commande') or '—'))
                    notes.append({
                        'id': 'n-rb-' + str(v['id']), 'type': 'note', 'lettre': code,
                        'texte': texte_sur('Ancien CRM — ligne « %s » de %.2f € : %s (commande %s). '
                                           'Elle n\'entrait dans aucun calcul.'
                                           % (genre, montant,
                                              (v.get('article') or '').strip(),
                                              v.get('num_commande') or '—')),
                        'date': (l.get('date_live') or date or '')[:10], 'done': False
                    })
                    continue

                est_giveaway = genre == 'giveaway'
                articles.append({
                    'id': 'a-' + str(v['id']),
                    'commande': v.get('num_commande') or '',
                    'libelle': texte_sur((v.get('article') or '').strip() or 'Article'),
                    'lettre': code,
                    'montant': centimes(abs(nb(v.get('montant')))) if est_giveaway
                               else centimes(nb(v.get('montant'))),
                    'type': 'giveaway' if est_giveaway else 'vente'
                })

            if l.get('paye') == '1':
                paiements[code] = {
                    'date': (l.get('date_paiement') or date or '')[:10],
                    'mode': (l.get('mode_paiement') or '').strip() or 'Virement'
                }

        if not articles:
            continue

        recu = (session.get('whatnot_recu_date') if session else membres[0].get('whatnot_recu_date'))
        lives.append({
            'id': 'l-' + (date or 'sans-date').replace('-', '') + '-' + str(ident),
            'date': date,
            'titre': texte_sur(titre),
            'categorie': '',
            'fraisPct': fraisPct,
            'encaisse': {'statut': 'Reçu' if recu else 'En attente', 'date': (recu or '')[:10]},
            'articles': articles,
            'paiements': paiements,
            'tauxParCode': taux_par_code
        })

    lives.sort(key=lambda l: l['date'], reverse=True)

    # ---------- Agenda ----------
    correspondance_type = {'live': 'Live', 'recup': 'Récup.', 'récup': 'Récup.',
                           'recuperation': 'Récup.', 'autre': 'Autre'}
    agenda = []
    for e in agenda_src:
        brut = (e.get('type') or 'autre').strip().lower()
        titre = (e.get('titre') or '').strip()
        if not titre and e.get('cliente_id') in cle_par_cliente:
            fiche = clients_data[cle_par_cliente[e['cliente_id']]]
            titre = fiche['nom'] + ' (' + fiche['lettre'] + ')'
        agenda.append({
            'id': 'e-' + str(e['id']),
            'type': correspondance_type.get(brut, 'Autre'),
            'date': (e.get('date_event') or '')[:10],
            'heure': '',
            'titre': texte_sur(titre or 'Rendez-vous'),
            'commentaire': texte_sur((e.get('commentaire') or '').strip())
        })

    # ---------- Journal ----------
    journal = []
    for h in sorted(T.get('historique', []), key=lambda x: x.get('created_at') or '', reverse=True)[:500]:
        journal.append({
            'date': (h.get('created_at') or '').replace(' ', 'T'),
            'utilisateur': texte_sur((h.get('utilisateur') or '').strip() or 'Ancien CRM'),
            'utilisateurId': None,
            'action': texte_sur((h.get('action') or '').strip()),
            'cible': texte_sur((h.get('entite') or '').strip()),
            'detail': texte_sur((h.get('details') or '').strip())
        })

    etat = {
        'clientes': clientes,
        'clients_data': clients_data,
        'lives': lives,
        'ventes_directes': [],
        'apporteurs': apporteurs,
        'apporteurs_data': apporteurs_data,
        'notes': notes,
        'agenda': agenda,
        'journal': journal,
        'paiements_apporteurs': {},
    }

    # ---------- Contrôle : les montants sont-ils inchangés ? ----------
    rapport['controle'] = controler(T, etat, codes)
    return etat, rapport


def controler(T, etat, codes):
    """Recalcule chaque ancien live avec le moteur du nouveau CRM et compare
       aux montants qu'il avait enregistrés. Zéro écart attendu."""
    ventes_par_live = defaultdict(list)
    for v in T.get('ventes', []):
        ventes_par_live[v['live_id']].append(v)

    resultats = {'lives': 0, 'ecarts': [], 'total_reverse': 0.0, 'total_ventes': 0.0}

    for l in T.get('lives', []):
        arts = ventes_par_live.get(l['id'], [])
        brut = sum(nb(a['montant']) for a in arts if (a.get('type') or 'vente') == 'vente')
        give = sum(abs(nb(a['montant'])) for a in arts if a.get('type') == 'giveaway')

        base = brut * (1 - nb(l.get('frais_whatnot_pct')) / 100)
        commis = centimes(base * nb(l.get('commission_pct')) / 100)
        commapp = centimes(base * nb(l.get('apporteur_pct')) / 100)
        net = centimes(base - commis - commapp - give)

        attendu = nb(l.get('montant_reverse'))
        resultats['lives'] += 1
        resultats['total_reverse'] += attendu
        resultats['total_ventes'] += brut
        if abs(net - attendu) > 0.01:
            resultats['ecarts'].append((l['id'], attendu, net))

    # Et côté nouveau : mêmes ventes, mêmes giveaways ?
    ventes_nouveau = sum(a['montant'] for live in etat['lives']
                         for a in live['articles'] if a['type'] != 'giveaway')
    resultats['ventes_nouveau'] = centimes(ventes_nouveau)
    resultats['articles'] = sum(len(live['articles']) for live in etat['lives'])
    return resultats


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit('Usage : python3 convertir.py export.sql etat.json')

    source, sortie = sys.argv[1], sys.argv[2]
    T = lire_export(source)
    etat, rapport = convertir(T)

    io.open(sortie, 'w', encoding='utf-8').write(
        json.dumps(etat, ensure_ascii=False, indent=1))

    c = rapport['controle']
    print('Lu : ' + ', '.join('%d %s' % (len(v), k) for k, v in sorted(T.items())))
    print()
    print('Produit :')
    print('   %-22s %d' % ('clientes', len(etat['clientes'])))
    print('   %-22s %d' % ('lives', len(etat['lives'])))
    print('   %-22s %d' % ('articles', c['articles']))
    print('   %-22s %d' % ('apporteurs', len(etat['apporteurs'])))
    print('   %-22s %d' % ('rendez-vous', len(etat['agenda'])))
    print('   %-22s %d' % ('notes', len(etat['notes'])))
    print('   %-22s %d' % ('journal', len(etat['journal'])))
    print()
    print('Contrôle des montants sur %d anciens lives :' % c['lives'])
    if c['ecarts']:
        print('   ⚠ %d écart(s) :' % len(c['ecarts']))
        for i, attendu, calcule in c['ecarts'][:10]:
            print('      live %s : enregistré %.2f, recalculé %.2f' % (i, attendu, calcule))
    else:
        print('   ✓ aucun écart — le moteur du nouveau CRM retrouve les mêmes montants')
    print('   Ventes : %.2f €   ·   Reversé aux clientes : %.2f €'
          % (c['total_ventes'], c['total_reverse']))
    print('   Ventes reprises dans le nouveau format : %.2f €' % c['ventes_nouveau'])
    if abs(c['ventes_nouveau'] - c['total_ventes']) > 0.01:
        print('   ⚠ écart de reprise : %.2f €' % (c['ventes_nouveau'] - c['total_ventes']))

    if rapport['codes']:
        print()
        print('Codes de dressing attribués :')
        for r in rapport['codes']:
            if r['avant']:
                print('   %-26s %s → %s   (code déjà pris par une autre)'
                      % (r['cliente'][:26], r['avant'], r['apres']))
            else:
                print('   %-26s     → %s   (aucun code auparavant)'
                      % (r['cliente'][:26], r['apres']))

    print()
    print('État écrit dans %s (%.0f Ko)' % (sortie, os.path.getsize(sortie) / 1024))


if __name__ == '__main__':
    main()
