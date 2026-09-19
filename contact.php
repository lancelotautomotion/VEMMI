<?php
/**
 * Traitement du formulaire de contact de vemmi.net
 * Répond en JSON : le front (contact.html) consomme res.ok + le corps.
 */

declare(strict_types=1);

const DESTINATAIRE   = 'vemmisas@gmail.com';
const EXPEDITEUR     = 'no-reply@vemmi.net';   // doit rester une adresse du domaine
const LONGUEUR_MAX   = 5000;

header('Content-Type: application/json; charset=utf-8');

function repondre(int $code, string $message) {
    http_response_code($code);
    echo json_encode(['ok' => $code === 200, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Neutralise l'injection d'en-têtes : aucun CR/LF ne doit atteindre les headers. */
function ligne_sure(string $valeur): string {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valeur));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    repondre(405, 'Méthode non autorisée.');
}

// Piège à robots : champ masqué que seul un script remplit.
if (!empty($_POST['site_web'] ?? '')) {
    repondre(200, 'Message envoyé.');   // succès simulé, rien n'est expédié
}

$nom     = ligne_sure((string) ($_POST['nom'] ?? ''));
$societe = ligne_sure((string) ($_POST['societe'] ?? ''));
$email   = ligne_sure((string) ($_POST['email'] ?? ''));
$tel     = ligne_sure((string) ($_POST['tel'] ?? ''));
$sujet   = ligne_sure((string) ($_POST['sujet'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($nom === '' || $email === '' || $sujet === '' || $message === '') {
    repondre(422, 'Merci de remplir les champs obligatoires.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    repondre(422, 'Adresse e-mail invalide.');
}
if (mb_strlen($message) > LONGUEUR_MAX) {
    repondre(422, 'Message trop long.');
}
if (empty($_POST['consentement'] ?? '')) {
    repondre(422, 'Merci d’accepter le traitement de vos données.');
}

$corps = "Nouvelle demande depuis vemmi.net\n"
       . str_repeat('-', 40) . "\n\n"
       . "Nom       : {$nom}\n"
       . "Société   : " . ($societe !== '' ? $societe : '—') . "\n"
       . "E-mail    : {$email}\n"
       . "Téléphone : " . ($tel !== '' ? $tel : '—') . "\n"
       . "Sujet     : {$sujet}\n\n"
       . "Message :\n{$message}\n\n"
       . str_repeat('-', 40) . "\n"
       . 'Reçu le ' . date('d/m/Y à H:i') . "\n";

$entetes = [
    'From: VEMMI – site web <' . EXPEDITEUR . '>',
    'Reply-To: ' . $nom . ' <' . $email . '>',   // répondre depuis Gmail écrit au visiteur
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$objet = '[vemmi.net] ' . $sujet . ' — ' . $nom;

$envoye = mail(
    DESTINATAIRE,
    '=?UTF-8?B?' . base64_encode($objet) . '?=',
    $corps,
    implode("\r\n", $entetes),
    '-f' . EXPEDITEUR
);

if (!$envoye) {
    repondre(500, 'L’envoi a échoué. Merci de nous joindre par téléphone.');
}

repondre(200, 'Message envoyé.');
