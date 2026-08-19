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

## Ce qui manque encore

- `api.php` : lecture et écriture de l'état, avec le verrou de version
- `server-sync.js` : côté navigateur, remplace le stockage local par le serveur
- La transformation des pages `.html` en `.php` protégées par la connexion
- Le convertisseur des données de l'ancien CRM
- La sauvegarde automatique de la base
