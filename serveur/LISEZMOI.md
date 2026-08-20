# Serveur — Saga Dressing

Ce dossier contient ce qui tourne sur `crm.sagadressing.fr` (dossier `/CRM`
de l'hébergement IONOS, contrat 111236916). Le reste du dépôt, à la racine,
est l'application elle-même.

## Ce qui est en place

| Fichier | Rôle |
|---|---|
| `config.example.php` | Modèle à recopier en `config.php` sur le serveur |
| `db.php` | Connexion PDO, en mode exceptions |
| `schema.sql` | Structure de la base — créations conditionnelles, ne détruit rien |
| `lib_auth.php` | Sessions, connexion, politique de mot de passe, anti-CSRF |
| `install.php` | Installation en une fois : tables + compte propriétaire |
| `login.php` / `logout.php` | Connexion et déconnexion |
| `.htaccess` | HTTPS obligatoire, fichiers sensibles bloqués, en-têtes de sécurité |

## Installation

1. Déposer le contenu de ce dossier dans `/CRM`.
2. Recopier `config.example.php` en `config.php`, y écrire l'utilisateur et le
   mot de passe MySQL. **Ce fichier ne doit jamais être versionné.**
3. Ouvrir `https://crm.sagadressing.fr/install.php` **une fois** : y choisir
   l'identifiant et le mot de passe du compte propriétaire.
4. Supprimer `install.php` du serveur.

Le script se verrouille de lui-même dès qu'un compte existe : même laissé en
place, il ne peut plus créer de second accès.

## Choix de conception

**L'état du CRM tient dans un seul enregistrement** (table `etat`), versionné.
L'application est née dans le navigateur : toutes ses données forment un objet
unique, et tous les calculs — commissions, giveaways, restes à reverser — sont
déjà écrits et éprouvés autour de cette forme. L'éclater en quinze tables
imposerait de tout réécrire, pour le même résultat.

Le numéro de version sert de verrou : un enregistrement n'est accepté que s'il
part de la version courante. Deux personnes qui modifient en même temps ne
s'écrasent donc pas en silence. Chaque version précédente est conservée dans
`etat_historique` — c'est le filet en cas de fausse manœuvre.

## Construire la version serveur

```bash
python3 serveur/construire.py
```

Le script dérive les pages `.php` des pages `.html` de l'application — une
seule version à maintenir — et rassemble tout dans `serveur/build/`, qui est
le dossier à téléverser dans `/CRM`. Chaque page reçoit trois choses : une
ligne qui exige la connexion, l'état du CRM écrit dans la page, et
`server-sync.js` chargé juste après `nav.js`.

`serveur/build/` n'est pas versionné : il se régénère.

## Comment l'application parle au serveur

L'application lisait le stockage du navigateur de façon immédiate, à quatre-vingt-dix
endroits. Plutôt que de tout réécrire en attente réseau :

1. `entete.php` écrit l'état complet dans la page, dans une balise JSON ;
2. `server-sync.js` la lit, vide le stockage local et le réamorce — le serveur
   fait foi, d'éventuels restes locaux ne peuvent pas ressurgir ;
3. il enveloppe `sagaSave` : chaque enregistrement local programme un envoi,
   différé de 900 ms pour ne pas partir dix fois de suite ;
4. `api.php` refuse un envoi parti d'une version périmée (code 409) : la page
   se recharge alors sur l'état du serveur plutôt que d'écraser celui d'un
   autre poste.

## Reprendre les données de l'ancien CRM

```bash
python3 serveur/convertir.py export.sql etat.json
```

`export.sql` est l'export complet de l'ancienne base, fait depuis phpMyAdmin
(structure et données, les neuf tables — le bouton « Sauvegarder mes données »
de l'ancien CRM, lui, n'en exporte que cinq). Le script ne touche jamais à
l'ancienne base : il lit le fichier.

Il affiche un compte rendu, et surtout **recalcule les 95 anciens lives avec le
moteur du nouveau CRM pour les comparer aux montants enregistrés à l'époque**.
L'écart attendu est nul.

Le fichier produit s'installe ensuite par `importer.php`, sur le serveur.

### Ce que la conversion doit réconcilier

- **Un live n'a pas le même sens.** Ancien : un live appartient à une cliente,
  et une « session » regroupe la soirée. Nouveau : le live est la soirée, et
  chaque article porte le code de son dressing. Les sessions deviennent donc
  les lives, et les anciens lives leurs articles.
- **Les codes de dressing devaient être uniques.** L'ancien les portait par
  live : deux clientes pouvaient utiliser « C » sans se gêner, tant qu'elles
  n'étaient pas dans la même soirée — vérifié, ce n'est jamais arrivé. Chaque
  cliente garde son code habituel quand il est libre, sinon elle en reçoit un
  de deux lettres, listé dans le compte rendu.
- **Le taux de commission est figé sur les lives repris** (`tauxParCode`). Une
  cliente passée de 30 à 20 % verrait sinon ses anciens lives recalculés au
  nouveau taux : 406 € d'écart sur un seul cas réel.
- **Les lignes de type « remboursement »** n'entraient dans aucun calcul de
  l'ancien CRM. Les reprendre comme ventes aurait changé l'historique : elles
  deviennent des notes, et le compte rendu les signale.

## Ce qui manque encore

- La sauvegarde automatique de la base (Tâches cron d'IONOS)
- La gestion des comptes dans les Paramètres, encore adossée à une liste
  locale et non aux vrais comptes de la table `utilisateurs`
