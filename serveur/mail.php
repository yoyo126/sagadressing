<?php
/* ============================================================
   Envoi d'emails
   ============================================================
   Le CRM a deux courriers à expédier, tous deux techniques : inviter un
   compte, et réinitialiser un mot de passe oublié. Personne n'y répond.

   Les réglages visibles — adresse expéditrice, serveur, port, identifiant —
   vivent dans l'état du CRM, avec le reste. Les secrets, non : l'état est
   écrit en clair dans chaque page et part dans chaque sauvegarde
   téléchargée. Un mot de passe de boîte s'y retrouverait lisible par
   n'importe quel compte, même en lecture seule. Ils sont donc rangés ici,
   dans la table `reglages`, d'où ils ne ressortent jamais vers le
   navigateur — et `sauvegarde.php` les écarte de ses copies.

   Pas de bibliothèque externe : l'hébergement est un simple espace PHP, et
   installer Composer pour trois cents lignes n'en vaut pas la peine.
   ============================================================ */

require_once __DIR__ . '/db.php';

/* Clés de `reglages` qui portent un secret. sauvegarde.php lit cette liste
   pour les exclure : une seule source, pas deux à tenir à jour. */
function saga_mail_cles_secretes()
{
    return ['mail_smtp_mdp', 'mail_api_cle'];
}

function saga_mail_secret_lire($cle)
{
    $st = saga_db()->prepare('SELECT valeur FROM reglages WHERE cle = ?');
    $st->execute([$cle]);
    $v = $st->fetchColumn();
    return $v === false ? '' : (string) $v;
}

function saga_mail_secret_ecrire($cle, $valeur)
{
    $db = saga_db();
    if ($valeur === '') {
        $st = $db->prepare('DELETE FROM reglages WHERE cle = ?');
        return $st->execute([$cle]);
    }
    $st = $db->prepare(
        'INSERT INTO reglages (cle, valeur) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)'
    );
    return $st->execute([$cle, $valeur]);
}

/* ============================================================
   Client SMTP minimal
   ============================================================
   Deux façons de chiffrer, selon le port : en 465 la connexion est chiffrée
   d'emblée (SSL implicite), en 587 elle s'ouvre en clair puis bascule par
   STARTTLS. Se tromper donne une attente sans fin plutôt qu'une erreur
   claire : le port décide donc du mode par défaut.
   ============================================================ */

class SagaSmtpErreur extends Exception {}

class SagaSmtp
{
    private $flux;
    private $journal = [];

    public function __construct($hote, $port, $securite, $delai = 15)
    {
        $prefixe = ($securite === 'ssl') ? 'ssl://' : '';
        $contexte = stream_context_create([
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true],
        ]);
        $erreurNum = 0;
        $erreurTexte = '';
        $this->flux = @stream_socket_client(
            $prefixe . $hote . ':' . (int) $port,
            $erreurNum, $erreurTexte, $delai,
            STREAM_CLIENT_CONNECT, $contexte
        );
        if (!$this->flux) {
            throw new SagaSmtpErreur(
                'Connexion à ' . $hote . ':' . $port . ' impossible — '
                . ($erreurTexte !== '' ? $erreurTexte : 'pas de réponse') . '.'
            );
        }
        stream_set_timeout($this->flux, $delai);
        $this->attendre(220);
    }

    private function lireReponse()
    {
        $texte = '';
        while (($ligne = fgets($this->flux, 515)) !== false) {
            $texte .= $ligne;
            // Dernière ligne d'une réponse : « 250 » et non « 250- »
            if (strlen($ligne) < 4 || $ligne[3] !== '-') {
                break;
            }
        }
        if ($texte === '') {
            $info = stream_get_meta_data($this->flux);
            throw new SagaSmtpErreur(!empty($info['timed_out'])
                ? 'Le serveur ne répond plus (délai dépassé). Le port ou le mode de '
                  . 'chiffrement ne correspondent peut-être pas.'
                : 'Le serveur a coupé la connexion.');
        }
        $this->journal[] = trim($texte);
        return $texte;
    }

    private function attendre($codeAttendu)
    {
        $reponse = $this->lireReponse();
        $code = (int) substr($reponse, 0, 3);
        if ($code !== $codeAttendu) {
            throw new SagaSmtpErreur('Le serveur a répondu : ' . trim($reponse));
        }
        return $reponse;
    }

    private function dire($commande, $codeAttendu, $secret = false)
    {
        fwrite($this->flux, $commande . "\r\n");
        $this->journal[] = '> ' . ($secret ? '[valeur masquée]' : $commande);
        return $this->attendre($codeAttendu);
    }

    public function ouvrir($hote, $identifiant, $motDePasse, $starttls)
    {
        $nomLocal = ($hote !== '' ? $hote : 'localhost');
        $this->dire('EHLO ' . $nomLocal, 250);

        if ($starttls) {
            $this->dire('STARTTLS', 220);
            if (!@stream_socket_enable_crypto($this->flux, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new SagaSmtpErreur('Le passage en connexion chiffrée (STARTTLS) a échoué.');
            }
            $this->dire('EHLO ' . $nomLocal, 250);   // à refaire une fois chiffré
        }

        if ($identifiant !== '') {
            /* AUTH LOGIN : le plus largement accepté, IONOS compris. */
            $this->dire('AUTH LOGIN', 334);
            $this->dire(base64_encode($identifiant), 334, true);
            $this->dire(base64_encode($motDePasse), 235, true);
        }
    }

    public function envoyer($de, $a, $entetes, $corps)
    {
        $this->dire('MAIL FROM:<' . $de . '>', 250);
        $this->dire('RCPT TO:<' . $a . '>', 250);
        $this->dire('DATA', 354);

        /* Une ligne réduite à un point signifierait la fin du message : le
           protocole veut qu'on la double. */
        $message = $entetes . "\r\n" . $corps;
        $message = preg_replace('/^\./m', '..', str_replace("\n", "\r\n",
                   str_replace("\r\n", "\n", $message)));

        fwrite($this->flux, $message . "\r\n.\r\n");
        $this->attendre(250);
    }

    public function fermer()
    {
        if ($this->flux) {
            @fwrite($this->flux, "QUIT\r\n");
            @fclose($this->flux);
            $this->flux = null;
        }
    }

    public function journal()
    {
        return $this->journal;
    }
}

/* ============================================================
   Expédition
   ============================================================
   `$reglages` vient de l'état du CRM (mail_config) : méthode, adresse
   expéditrice, nom affiché, adresse de réponse, serveur, port, sécurité,
   identifiant. Le secret, lui, est relu ici.

   Renvoie ['ok' => bool, 'message' => string, 'detail' => string].
   Jamais d'exception : l'appelant affiche le message tel quel.
   ============================================================ */
function saga_mail_envoyer($reglages, $destinataire, $sujet, $texte)
{
    $de = trim((string) (isset($reglages['mailFrom']) ? $reglages['mailFrom'] : ''));
    $nom = trim((string) (isset($reglages['mailName']) ? $reglages['mailName'] : 'Saga Dressing'));
    $reponse = trim((string) (isset($reglages['mailReply']) ? $reglages['mailReply'] : ''));
    $methode = (string) (isset($reglages['mailMethod']) ? $reglages['mailMethod'] : 'smtp');

    if (!filter_var($de, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'message' => "L'adresse expéditrice n'est pas une adresse valide.", 'detail' => ''];
    }
    if (!filter_var($destinataire, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'message' => "L'adresse du destinataire n'est pas valide.", 'detail' => ''];
    }

    /* Un nom affiché contenant un saut de ligne permettrait d'ajouter des
       en-têtes à volonté — un destinataire caché, par exemple. */
    $nom = preg_replace('/[\r\n]+/', ' ', $nom);
    $sujet = preg_replace('/[\r\n]+/', ' ', $sujet);

    $entetes = [];
    $entetes[] = 'From: ' . saga_mail_nom_encode($nom) . ' <' . $de . '>';
    $entetes[] = 'To: <' . $destinataire . '>';
    if (filter_var($reponse, FILTER_VALIDATE_EMAIL)) {
        $entetes[] = 'Reply-To: <' . $reponse . '>';
    }
    $entetes[] = 'Subject: ' . saga_mail_nom_encode($sujet);
    $entetes[] = 'Date: ' . date('r');
    $entetes[] = 'MIME-Version: 1.0';
    $entetes[] = 'Content-Type: text/plain; charset=UTF-8';
    $entetes[] = 'Content-Transfer-Encoding: 8bit';
    $entetes[] = 'Auto-Submitted: auto-generated';   // pas de réponse automatique en retour

    if ($methode === 'php') {
        $sansTo = array_values(array_filter($entetes, function ($h) {
            return stripos($h, 'To: ') !== 0 && stripos($h, 'Subject: ') !== 0;
        }));
        $envoye = @mail($destinataire, $sujet, $texte, implode("\r\n", $sansTo));
        return $envoye
            ? ['ok' => true, 'message' => 'Message confié au serveur.', 'detail' => '']
            : ['ok' => false,
               'message' => "Le serveur a refusé d'envoyer le message. Sur un hébergement "
                          . 'mutualisé, cette fonction est souvent désactivée : passez par la '
                          . 'boîte SMTP.',
               'detail' => ''];
    }

    /* « Service d'envoi dédié » n'est pas raccordé : le dire franchement
       plutôt que de tenter un SMTP sans serveur et rendre une erreur de
       connexion, qui n'expliquerait rien. C'est l'option proposée en
       premier à l'écran, donc la première qu'on rencontre. */
    if ($methode === 'service') {
        return ['ok' => false,
                'message' => "L'envoi par service dédié (Brevo, Postmark…) n'est pas encore "
                           . 'raccordé. Choisissez « Boîte mail technique IONOS (SMTP) » : les '
                           . 'mêmes services fournissent d\'ailleurs un accès SMTP.',
                'detail' => ''];
    }

    $hote = trim((string) (isset($reglages['smtpHost']) ? $reglages['smtpHost'] : ''));
    $port = (int) (isset($reglages['smtpPort']) ? $reglages['smtpPort'] : 465);
    $securite = (string) (isset($reglages['smtpSec']) ? $reglages['smtpSec'] : '');
    $identifiant = trim((string) (isset($reglages['smtpUser']) ? $reglages['smtpUser'] : ''));
    $motDePasse = saga_mail_secret_lire('mail_smtp_mdp');

    if ($hote === '') {
        return ['ok' => false, 'message' => 'Le serveur SMTP n’est pas renseigné.', 'detail' => ''];
    }
    if ($identifiant !== '' && $motDePasse === '') {
        return ['ok' => false,
                'message' => 'Le mot de passe de la boîte n’est pas enregistré. '
                           . 'Saisissez-le puis enregistrez avant de tester.',
                'detail' => ''];
    }

    /* « SSL/TLS » ou « STARTTLS » à l'écran ; le port tranche si l'étiquette
       ne dit rien. 465 chiffre d'emblée, 587 bascule en cours de route. */
    $mode = (stripos($securite, 'start') !== false) ? 'starttls'
          : ((stripos($securite, 'ssl') !== false || stripos($securite, 'tls') !== false) ? 'ssl'
          : ($port === 465 ? 'ssl' : 'starttls'));

    $smtp = null;
    try {
        $smtp = new SagaSmtp($hote, $port, $mode === 'ssl' ? 'ssl' : '');
        $smtp->ouvrir(
            isset($_SERVER['HTTP_HOST']) ? preg_replace('/:.*/', '', $_SERVER['HTTP_HOST']) : 'localhost',
            $identifiant, $motDePasse, $mode === 'starttls'
        );
        $smtp->envoyer($de, $destinataire, implode("\r\n", $entetes), $texte);
        $smtp->fermer();
        return ['ok' => true, 'message' => 'Message accepté par ' . $hote . '.', 'detail' => ''];
    } catch (SagaSmtpErreur $e) {
        $journal = $smtp ? $smtp->journal() : [];
        if ($smtp) {
            $smtp->fermer();
        }
        return ['ok' => false, 'message' => $e->getMessage(),
                'detail' => implode("\n", array_slice($journal, -6))];
    } catch (Exception $e) {
        if ($smtp) {
            $smtp->fermer();
        }
        return ['ok' => false, 'message' => 'Échec inattendu : ' . $e->getMessage(), 'detail' => ''];
    }
}

/* Un nom ou un sujet accentué doit être encodé pour traverser sans dommage */
function saga_mail_nom_encode($texte)
{
    if (preg_match('/^[\x20-\x7E]*$/', $texte)) {
        return $texte;
    }
    return '=?UTF-8?B?' . base64_encode($texte) . '?=';
}
