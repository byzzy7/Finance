<?php

require_once __DIR__ . '/lib/auth_guard.php';
require_once __DIR__ . '/db_config.php';

currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query('SELECT id, nazev, ikona, barva, mesicni_limit, poradi FROM kategorie ORDER BY poradi, nazev');
    $rows = array_map(function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['mesicni_limit'] = $row['mesicni_limit'] !== null ? (float) $row['mesicni_limit'] : null;
        $row['poradi'] = (int) $row['poradi'];
        return $row;
    }, $result->fetch_all(MYSQLI_ASSOC));
    sendJson($rows);
}

if ($method === 'POST' || $method === 'PUT') {
    $data = readJsonBody();
    $name = trim($data['nazev'] ?? '');
    if ($name === '') {
        sendError('Zadejte název kategorie.', 400);
    }
    $icon = trim($data['ikona'] ?? '') ?: '📦';
    $color = trim($data['barva'] ?? '') ?: '#94a3b8';
    $limit = isset($data['mesicni_limit']) && $data['mesicni_limit'] !== '' && $data['mesicni_limit'] !== null
        ? (float) $data['mesicni_limit']
        : null;
    $order = (int) ($data['poradi'] ?? 0);

    if ($method === 'POST') {
        $stmt = $conn->prepare('INSERT INTO kategorie (nazev, ikona, barva, mesicni_limit, poradi) VALUES (?, ?, ?, ?, ?)');
        $stmt->bind_param('sssdi', $name, $icon, $color, $limit, $order);
        if (!$stmt->execute()) {
            sendError('Nepodařilo se vytvořit kategorii.', 500);
        }
        sendJson(['id' => $stmt->insert_id], 201);
    }

    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id kategorie.', 400);
    }
    $stmt = $conn->prepare('UPDATE kategorie SET nazev = ?, ikona = ?, barva = ?, mesicni_limit = ?, poradi = ? WHERE id = ?');
    $stmt->bind_param('sssdii', $name, $icon, $color, $limit, $order, $id);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se upravit kategorii.', 500);
    }
    sendJson(['message' => 'Kategorie upravena.']);
}

if ($method === 'DELETE') {
    $data = readJsonBody();
    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id kategorie.', 400);
    }
    $stmt = $conn->prepare('DELETE FROM kategorie WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        sendError('Kategorii nelze smazat, obsahuje transakce.', 409);
    }
    sendJson(['message' => 'Kategorie smazána.']);
}

sendError('Metoda není povolena.', 405);
