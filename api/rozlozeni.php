<?php

require_once __DIR__ . '/lib/auth_guard.php';
require_once __DIR__ . '/db_config.php';

$memberId = currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT rozlozeni_json FROM rozlozeni_dashboardu WHERE clen_id = ?');
    $stmt->bind_param('i', $memberId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    sendJson($row ? json_decode($row['rozlozeni_json']) : null);
}

if ($method === 'POST' || $method === 'PUT') {
    $data = readJsonBody();
    $layout = $data['rozlozeni'] ?? null;
    if (!is_array($layout)) {
        sendError('Chybí rozložení k uložení.', 400);
    }
    $layoutJson = json_encode($layout);
    $stmt = $conn->prepare(
        'INSERT INTO rozlozeni_dashboardu (clen_id, rozlozeni_json) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE rozlozeni_json = VALUES(rozlozeni_json)'
    );
    $stmt->bind_param('is', $memberId, $layoutJson);
    $stmt->execute();
    sendJson(['message' => 'Rozložení uloženo.']);
}

sendError('Metoda není povolena.', 405);
