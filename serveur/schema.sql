-- ============================================================
--  Saga Dressing — structure de la base
--  Exécuté une seule fois par install.php. Toutes les créations
--  sont conditionnelles : relancer le script ne détruit rien.
-- ============================================================

-- Comptes autorisés à ouvrir le CRM.
CREATE TABLE IF NOT EXISTS utilisateurs (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email               VARCHAR(190) NOT NULL,
  mdp_hash            VARCHAR(255) NOT NULL,
  prenom              VARCHAR(80)  NOT NULL DEFAULT '',
  nom                 VARCHAR(80)  NOT NULL DEFAULT '',
  role                ENUM('admin','gestion','lecture') NOT NULL DEFAULT 'gestion',
  proprietaire        TINYINT(1)   NOT NULL DEFAULT 0,
  actif               TINYINT(1)   NOT NULL DEFAULT 1,
  cree_le             DATETIME     NOT NULL,
  derniere_connexion  DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  L'état du CRM, en un seul enregistrement.
--  L'application est née dans le navigateur : toutes ses données
--  tiennent dans un objet unique. Plutôt que d'éclater cet objet en
--  quinze tables — et de réécrire tous les calculs déjà éprouvés —
--  on le conserve tel quel, versionné. La base garde ainsi son rôle :
--  une seule source, partagée entre les appareils, sauvegardable.
--
--  `version` sert de verrou : un enregistrement n'est accepté que
--  s'il part de la version courante. Deux personnes qui modifient en
--  même temps ne s'écrasent donc pas en silence — la seconde est
--  prévenue et relit avant d'écrire.
-- ============================================================
CREATE TABLE IF NOT EXISTS etat (
  id          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  contenu     LONGTEXT      NOT NULL,
  version     INT UNSIGNED  NOT NULL DEFAULT 0,
  maj_le      DATETIME      NOT NULL,
  maj_par     INT UNSIGNED  NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chaque version précédente est conservée : c'est le filet de sécurité
-- en cas de fausse manœuvre, et la trace de qui a modifié quoi.
CREATE TABLE IF NOT EXISTS etat_historique (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  version   INT UNSIGNED NOT NULL,
  contenu   LONGTEXT     NOT NULL,
  maj_le    DATETIME     NOT NULL,
  maj_par   INT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY k_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tentatives de connexion, pour ralentir qui essaierait des mots de passe.
CREATE TABLE IF NOT EXISTS connexions (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip       VARCHAR(45)  NOT NULL,
  email    VARCHAR(190) NOT NULL,
  reussie  TINYINT(1)   NOT NULL,
  quand    DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY k_ip_quand (ip, quand),
  KEY k_email_quand (email, quand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réglages du serveur, dont le drapeau qui interdit de réinstaller.
CREATE TABLE IF NOT EXISTS reglages (
  cle     VARCHAR(64) NOT NULL,
  valeur  TEXT        NOT NULL,
  PRIMARY KEY (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
