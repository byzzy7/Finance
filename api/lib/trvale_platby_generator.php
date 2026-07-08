<?php

function generateDueTransakce(mysqli $conn): void
{
    $intervaly = [
        'tydne' => '+1 week',
        'mesicne' => '+1 month',
        'rocne' => '+1 year',
    ];

    $result = $conn->query(
        "SELECT id, clen_id, kategorie_id, typ, popis, castka, perioda, dalsi_datum
         FROM trvale_platby
         WHERE aktivni = 1 AND dalsi_datum <= CURDATE()"
    );
    if ($result === false) {
        return;
    }

    $insert = $conn->prepare(
        'INSERT INTO transakce (clen_id, kategorie_id, typ, popis, castka, datum) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $updateDalsiDatum = $conn->prepare('UPDATE trvale_platby SET dalsi_datum = ? WHERE id = ?');
    if ($insert === false || $updateDalsiDatum === false) {
        return;
    }

    while ($platba = $result->fetch_assoc()) {
        $dalsiDatum = new DateTime($platba['dalsi_datum']);
        $dnes = new DateTime('today');
        $interval = $intervaly[$platba['perioda']] ?? '+1 month';
        $clenId = (int) $platba['clen_id'];
        $kategorieId = (int) $platba['kategorie_id'];
        $castka = (float) $platba['castka'];

        while ($dalsiDatum <= $dnes) {
            $datum = $dalsiDatum->format('Y-m-d');
            $insert->bind_param('iissds', $clenId, $kategorieId, $platba['typ'], $platba['popis'], $castka, $datum);
            $insert->execute();
            $dalsiDatum->modify($interval);
        }

        $noveDatum = $dalsiDatum->format('Y-m-d');
        $updateDalsiDatum->bind_param('si', $noveDatum, $platba['id']);
        $updateDalsiDatum->execute();
    }
}
