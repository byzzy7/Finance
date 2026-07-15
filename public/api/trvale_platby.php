<?php

require_once __DIR__ . '/../../inc/lib/auth_guard.php';
require_once __DIR__ . '/../../inc/db_config.php';

$memberId = currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = 'SELECT p.id, p.clen_id, p.kategorie_id, p.typ, p.popis, p.castka, p.perioda, p.dalsi_datum, p.aktivni,
                   k.nazev AS kategorie_nazev, k.ikona AS kategorie_ikona, k.barva AS kategorie_barva,
                   c.jmeno AS clen_jmeno, c.barva AS clen_barva
            FROM trvale_platby p
            JOIN kategorie k ON k.id = p.kategorie_id
            JOIN clenove_rodiny c ON c.id = p.clen_id
            ORDER BY p.dalsi_datum ASC, p.id DESC';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        sendError('Databázová chyba (SELECT): ' . $conn->error, 500);
    }
    $stmt->execute();
    $rows = array_map(function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['clen_id'] = (int) $row['clen_id'];
        $row['kategorie_id'] = (int) $row['kategorie_id'];
        $row['aktivni'] = (bool) $row['aktivni'];
        return $row;
    }, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    sendJson($rows);
}

if ($method === 'POST' || $method === 'PUT') {
    $data = readJsonBody();
    $typ = trim($data['typ'] ?? '');
    $popis = trim($data['popis'] ?? '');
    $kategorieId = (int) ($data['kategorie_id'] ?? 0);
    $castka = isset($data['castka']) ? (float) $data['castka'] : 0;
    $perioda = trim($data['perioda'] ?? '');
    $dalsiDatum = trim($data['dalsi_datum'] ?? '');
    $aktivni = !empty($data['aktivni']) ? 1 : 0;

    if (
        !in_array($typ, ['prijem', 'vydaj'], true) || $popis === '' || $kategorieId <= 0 || $castka <= 0
        || !in_array($perioda, ['tydne', 'mesicne', 'rocne'], true) || $dalsiDatum === ''
    ) {
        sendError('Vyplňte typ, popis, kategorii, kladnou částku, periodu a datum.', 400);
    }

    if ($method === 'POST') {
        $stmt = $conn->prepare(
            'INSERT INTO trvale_platby (clen_id, kategorie_id, typ, popis, castka, perioda, dalsi_datum, aktivni)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        if ($stmt === false) {
            sendError('Databázová chyba (INSERT): ' . $conn->error, 500);
        }
        $stmt->bind_param('iissdssi', $memberId, $kategorieId, $typ, $popis, $castka, $perioda, $dalsiDatum, $aktivni);
        if (!$stmt->execute()) {
            sendError('Nepodařilo se uložit trvalou platbu — zkontrolujte, zda kategorie existuje.', 400);
        }
        sendJson(['id' => $stmt->insert_id], 201);
    }

    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id trvalé platby.', 400);
    }
    $stmt = $conn->prepare(
        'UPDATE trvale_platby SET kategorie_id = ?, typ = ?, popis = ?, castka = ?, perioda = ?, dalsi_datum = ?, aktivni = ? WHERE id = ?'
    );
    if ($stmt === false) {
        sendError('Databázová chyba (UPDATE): ' . $conn->error, 500);
    }
    $stmt->bind_param('issdssii', $kategorieId, $typ, $popis, $castka, $perioda, $dalsiDatum, $aktivni, $id);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se upravit trvalou platbu — zkontrolujte, zda kategorie existuje.', 400);
    }
    sendJson(['message' => 'Trvalá platba upravena.']);
}

if ($method === 'DELETE') {
    $data = readJsonBody();
    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id trvalé platby.', 400);
    }
    $stmt = $conn->prepare('DELETE FROM trvale_platby WHERE id = ?');
    if ($stmt === false) {
        sendError('Databázová chyba (DELETE): ' . $conn->error, 500);
    }
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se smazat trvalou platbu.', 500);
    }
    sendJson(['message' => 'Trvalá platba smazána.']);
}

sendError('Metoda není povolena.', 405);
