<?php

require_once __DIR__ . '/../../../inc/lib/auth_guard.php';
require_once __DIR__ . '/../../../inc/db_config.php';

$memberId = currentMemberId();

$conn = getDbConnection();
$stmt = $conn->prepare('SELECT id, uzivatelske_jmeno, jmeno, barva FROM clenove_rodiny WHERE id = ?');
$stmt->bind_param('i', $memberId);
$stmt->execute();
$member = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$member) {
    sendError('Člen nenalezen.', 404);
}

sendJson($member);
