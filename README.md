# Saga Dressing — CRM

Application de gestion pour l'activité de dépôt-vente Saga Dressing : clientes,
lives Whatnot, apporteurs d'affaires, agenda, rapports et génération de documents.

**Version actuelle : 1.5.0** — l'historique complet est consultable dans
l'application, onglet *Paramètres → Versions*.

## Lancer l'application

Aucune installation, aucune dépendance : ce sont des pages HTML autonomes.

```bash
python3 -m http.server 8080
```

Puis ouvrir <http://localhost:8080/dashboard.html>.

Ouvrir les fichiers directement (double-clic) fonctionne aussi, mais passer par
un petit serveur évite les restrictions du navigateur sur les fichiers locaux.

## Organisation

| Fichier | Rôle |
|---|---|
| `dashboard.html` | Tableau de bord : indicateurs, notes et choses à faire, agenda, recherche globale |
| `clientes.html` / `cliente.html` | Liste et fiche détaillée d'une cliente |
| `lives.html` / `live.html` | Sessions Whatnot, articles, répartition et règlements |
| `apporteurs.html` / `apporteur.html` | Apporteurs d'affaires, commissions et justificatifs |
| `agenda.html` | Calendrier des récupérations, lives et rendez-vous |
| `rapports.html` | Synthèse financière par période, exports CSV et PDF |
| `boutique.html` | Génération du fichier d'annonces à importer dans Whatnot |
| `parametres.html` | Logo et identité, utilisateurs, journal d'activité, versions |
| `nav.js` | Menu, stockage local et **toutes les règles de calcul partagées** |
| `saga-pdf.js` | Générateur de PDF, écrit sans bibliothèque externe |
| `style.css` | Feuille de style unique |

## Modèle de données

Tout est stocké dans le navigateur (`localStorage`), préfixé par `saga_`.
Le principe directeur : **une seule source par donnée**, jamais de copie.

| Clé | Contenu |
|---|---|
| `saga_lives` | Sessions Whatnot : articles rattachés à une lettre de dressing, règlements par cliente |
| `saga_ventes_directes` | Ventes hors Whatnot |
| `saga_clientes` | Annuaire des clientes (identité, taux, vignette) |
| `saga_clients_data` | Fiches détaillées — **identité uniquement** |
| `saga_notes` | Notes et choses à faire, rattachables à une cliente |
| `saga_agenda` | Événements |
| `saga_apporteurs` / `saga_apporteurs_data` | Apporteurs |
| `saga_utilisateurs_crm` | Comptes et droits |
| `saga_journal` | Journal d'activité horodaté |
| `saga_logo` / `saga_logo_ecran` / `saga_identite` | En-tête des documents |

Les ventes d'une cliente ne sont **jamais stockées sur sa fiche** : elles sont
recalculées à la volée par `sagaVentesDuDressing(lettre)` à partir des lives et
des ventes hors live. C'est ce qui garantit qu'un live supprimé disparaît
partout, et qu'un règlement saisi d'un côté est visible de l'autre.

## Génération des PDF

`saga-pdf.js` écrit de vrais fichiers `.pdf` sans aucune dépendance, pour que
l'application reste utilisable hors ligne : polices Helvetica en encodage
WinAnsi, logo inséré en JPEG (filtre `DCTDecode`), pagination automatique.

Le logo est conservé en deux versions : PNG transparent pour l'affichage écran,
JPEG opaque pour les PDF — le format JPEG ne gérant pas la transparence.

## Sauvegarde

*Rapports → Sauvegarder mes données* exporte l'intégralité du contenu en JSON.
Les données vivant dans le navigateur, cet export est la seule sauvegarde :
à faire avant toute manipulation importante.
