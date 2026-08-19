<?php
/* Déconnexion : la session est détruite, pas seulement oubliée. */
require_once __DIR__ . '/lib_auth.php';

saga_deconnecter();
header('Location: login.php');
exit;
