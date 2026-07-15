<?php

require_once __DIR__ . '/../../inc/lib/auth_guard.php';
require_once __DIR__ . '/../../inc/db_config.php';

$memberId = currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, nazev, filtr_json FROM ulozene_filtry WHERE clen_id = ? ORDER BY id DESC');
    $stmt->bind_param('i', $memberId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    foreach ($rows as &$row) {
        $row['filtr'] = json_decode($row['filtr_json']);
        unset($row['filtr_json']);
    }
    sendJson($rows);
}

if ($method === 'POST') {
    $data = readJsonBody();
    $name = trim($data['nazev'] ?? '');
    $filter = $data['filtr'] ?? null;
    if ($name === '' || !is_array($filter)) {
        sendError('Zadejte název a filtr k uložení.', 400);
    }
    $filterJson = json_encode($filter);
    $stmt = $conn->prepare('INSERT INTO ulozene_filtry (clen_id, nazev, filtr_json) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $memberId, $name, $filterJson);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se uložit filtr.', 500);
    }
    sendJson(['id' => $stmt->insert_id], 201);
}

if ($method === 'DELETE') {
    $data = readJsonBody();
    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id filtru.', 400);
    }
    $stmt = $conn->prepare('DELETE FROM ulozene_filtry WHERE id = ? AND clen_id = ?');
    $stmt->bind_param('ii', $id, $memberId);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se smazat filtr.', 500);
    }
    sendJson(['message' => 'Filtr smazán.']);
}

sendError('Metoda není povolena.', 405);
