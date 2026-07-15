<?php

require_once __DIR__ . '/../../inc/lib/auth_guard.php';
require_once __DIR__ . '/../../inc/db_config.php';
require_once __DIR__ . '/../../inc/lib/trvale_platby_generator.php';

$memberId = currentMemberId();
$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

generateDueTransakce($conn);

if ($method === 'GET') {
    $where = [];
    $params = [];
    $types = '';

    if (!empty($_GET['mesic']) && $_GET['mesic'] !== 'all') {
        $where[] = 't.datum LIKE ?';
        $params[] = $_GET['mesic'] . '%';
        $types .= 's';
    }
    if (!empty($_GET['kategorie_id']) && $_GET['kategorie_id'] !== 'all') {
        $where[] = 't.kategorie_id = ?';
        $params[] = (int) $_GET['kategorie_id'];
        $types .= 'i';
    }
    if (!empty($_GET['clen_id']) && $_GET['clen_id'] !== 'all') {
        $where[] = 't.clen_id = ?';
        $params[] = (int) $_GET['clen_id'];
        $types .= 'i';
    }

    $sql = 'SELECT t.id, t.clen_id, t.kategorie_id, t.typ, t.popis, t.castka, t.datum,
                   k.nazev AS kategorie_nazev, k.ikona AS kategorie_ikona, k.barva AS kategorie_barva,
                   c.jmeno AS clen_jmeno, c.barva AS clen_barva
            FROM transakce t
            JOIN kategorie k ON k.id = t.kategorie_id
            JOIN clenove_rodiny c ON c.id = t.clen_id';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY t.datum DESC, t.id DESC';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        sendError('Databázová chyba (SELECT): ' . $conn->error, 500);
    }
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $rows = array_map(function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['clen_id'] = (int) $row['clen_id'];
        $row['kategorie_id'] = (int) $row['kategorie_id'];
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
    $datum = trim($data['datum'] ?? '');

    if (!in_array($typ, ['prijem', 'vydaj'], true) || $popis === '' || $kategorieId <= 0 || $castka <= 0 || $datum === '') {
        sendError('Vyplňte typ, popis, kategorii, kladnou částku a datum.', 400);
    }

    if ($method === 'POST') {
        $stmt = $conn->prepare('INSERT INTO transakce (clen_id, kategorie_id, typ, popis, castka, datum) VALUES (?, ?, ?, ?, ?, ?)');
        if ($stmt === false) {
            sendError('Databázová chyba (INSERT): ' . $conn->error, 500);
        }
        $stmt->bind_param('iissds', $memberId, $kategorieId, $typ, $popis, $castka, $datum);
        if (!$stmt->execute()) {
            sendError('Nepodařilo se uložit transakci — zkontrolujte, zda kategorie existuje.', 400);
        }
        sendJson(['id' => $stmt->insert_id], 201);
    }

    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id transakce.', 400);
    }
    $stmt = $conn->prepare('UPDATE transakce SET kategorie_id = ?, typ = ?, popis = ?, castka = ?, datum = ? WHERE id = ?');
    if ($stmt === false) {
        sendError('Databázová chyba (UPDATE): ' . $conn->error, 500);
    }
    $stmt->bind_param('issdsi', $kategorieId, $typ, $popis, $castka, $datum, $id);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se upravit transakci — zkontrolujte, zda kategorie existuje.', 400);
    }
    sendJson(['message' => 'Transakce upravena.']);
}

if ($method === 'DELETE') {
    $data = readJsonBody();
    $id = (int) ($data['id'] ?? 0);
    if ($id <= 0) {
        sendError('Chybí id transakce.', 400);
    }
    $stmt = $conn->prepare('DELETE FROM transakce WHERE id = ?');
    if ($stmt === false) {
        sendError('Databázová chyba (DELETE): ' . $conn->error, 500);
    }
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        sendError('Nepodařilo se smazat transakci.', 500);
    }
    sendJson(['message' => 'Transakce smazána.']);
}

sendError('Metoda není povolena.', 405);
