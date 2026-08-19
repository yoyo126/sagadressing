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

## Ce qui manque encore

- Le convertisseur des données de l'ancien CRM
- La sauvegarde automatique de la base (Tâches cron d'IONOS)
- La gestion des comptes dans les Paramètres, encore adossée à une liste
  locale et non aux vrais comptes de la table `utilisateurs`
