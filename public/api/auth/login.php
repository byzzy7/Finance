<?php

require_once __DIR__ . '/../../../inc/lib/session.php';
require_once __DIR__ . '/../../../inc/lib/response.php';
require_once __DIR__ . '/../../../inc/db_config.php';

initSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Metoda není povolena.', 405);
}

$data = readJsonBody();
$username = trim($data['uzivatelske_jmeno'] ?? '');
$password = (string) ($data['heslo'] ?? '');

if ($username === '' || $password === '') {
    sendError('Zadejte uživatelské jméno a heslo.', 400);
}

$conn = getDbConnection();
$stmt = $conn->prepare('SELECT id, uzivatelske_jmeno, heslo_hash, jmeno, barva FROM clenove_rodiny WHERE uzivatelske_jmeno = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$member = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$member || !password_verify($password, $member['heslo_hash'])) {
    sendError('Nesprávné jméno nebo heslo.', 401);
}

session_regenerate_id(true);
$_SESSION['clen_id'] = (int) $member['id'];

sendJson([
    'id' => (int) $member['id'],
    'uzivatelske_jmeno' => $member['uzivatelske_jmeno'],
    'jmeno' => $member['jmeno'],
    'barva' => $member['barva'],
]);
