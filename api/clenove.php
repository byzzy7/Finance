<?php

require_once __DIR__ . '/lib/auth_guard.php';
require_once __DIR__ . '/db_config.php';

currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query('SELECT id, uzivatelske_jmeno, jmeno, barva FROM clenove_rodiny ORDER BY jmeno');
    $rows = array_map(function (array $row): array {
        $row['id'] = (int) $row['id'];
        return $row;
    }, $result->fetch_all(MYSQLI_ASSOC));
    sendJson($rows);
}

if ($method === 'POST') {
    $data = readJsonBody();
    $username = trim($data['uzivatelske_jmeno'] ?? '');
    $password = (string) ($data['heslo'] ?? '');
    $name = trim($data['jmeno'] ?? '');
    $color = trim($data['barva'] ?? '') ?: '#7c5cff';

    if ($username === '' || $password === '' || $name === '') {
        sendError('Vyplňte jméno, uživatelské jméno a heslo.', 400);
    }
    if (strlen($password) < 6) {
        sendError('Heslo musí mít alespoň 6 znaků.', 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('INSERT INTO clenove_rodiny (uzivatelske_jmeno, heslo_hash, jmeno, barva) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $username, $hash, $name, $color);

    if (!$stmt->execute()) {
        if ($conn->errno === 1062) {
            sendError('Toto uživatelské jméno už existuje.', 409);
        }
        sendError('Nepodařilo se vytvořit člena.', 500);
    }

    sendJson(['id' => $stmt->insert_id, 'uzivatelske_jmeno' => $username, 'jmeno' => $name, 'barva' => $color], 201);
}

sendError('Metoda není povolena.', 405);
