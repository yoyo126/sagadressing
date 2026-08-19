<?php
/* ============================================================
   Connexion à la base
   Un seul point d'entrée pour toute l'application : les requêtes
   passent par PDO en mode « exceptions », si bien qu'une erreur
   s'arrête net au lieu de continuer sur des données fausses.
   ============================================================ */

function saga_config()
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $chemin = __DIR__ . '/config.php';
    if (!is_file($chemin)) {
        saga_erreur_fatale(
            'Configuration absente',
            'Le fichier <code>config.php</code> n\'a pas été trouvé. '
            . 'Recopiez <code>config.example.php</code> sous ce nom et complétez '
            . 'l\'utilisateur et le mot de passe de la base.'
        );
    }

    $config = require $chemin;
    if (!is_array($config)) {
        $config = [];
    }
    // Les clés absentes valent la chaîne vide : un réglage oublié se signale
    // par un message clair, pas par une alerte PHP au milieu de la page.
    foreach (['db_host', 'db_nom', 'db_user', 'db_pass', 'site_nom'] as $cle) {
        if (!isset($config[$cle])) {
            $config[$cle] = '';
        }
    }
    if ($config['db_host'] === '' || $config['db_nom'] === ''
        || $config['db_user'] === '' || $config['db_pass'] === '') {
        saga_erreur_fatale(
            'Configuration incomplète',
            'Une des quatre valeurs d\'accès à la base manque dans <code>config.php</code> : '
            . 'hôte, nom de la base, utilisateur ou mot de passe.'
        );
    }
    return $config;
}

function saga_db()
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $c = saga_config();
    $dsn = 'mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_nom'] . ';charset=utf8mb4';

    try {
        $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Les requêtes préparées sont réellement préparées par MySQL,
            // et non simulées côté PHP : aucune valeur n'est recollée dans le SQL.
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // Le détail de l'erreur reste dans les journaux : l'afficher renseignerait un curieux
        error_log('Saga — connexion base impossible : ' . $e->getMessage());
        saga_erreur_fatale(
            'Base de données injoignable',
            'La connexion a échoué. Vérifiez les identifiants dans <code>config.php</code>.'
        );
    }

    return $pdo;
}

/* Page d'erreur lisible, sans rien révéler de l'installation. */
function saga_erreur_fatale($titre, $message)
{
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>' . htmlspecialchars($titre, ENT_QUOTES, 'UTF-8') . '</title>'
       . '<style>body{font-family:system-ui,-apple-system,sans-serif;background:#F7F3ED;color:#1C1712;'
       . 'display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}'
       . 'div{max-width:520px;background:#fff;border:1px solid #E8DFD1;border-radius:14px;padding:28px}'
       . 'h1{font-size:1.15rem;margin:0 0 10px}p{margin:0;color:#5B5347;line-height:1.55}'
       . 'code{background:#F2EBE0;padding:2px 5px;border-radius:4px;font-size:.9em}</style></head><body><div>'
       . '<h1>' . htmlspecialchars($titre, ENT_QUOTES, 'UTF-8') . '</h1><p>' . $message . '</p>'
       . '</div></body></html>';
    exit;
}
