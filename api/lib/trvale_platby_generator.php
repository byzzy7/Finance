<?php

function pridejObdobiPlatby(DateTime $datum, string $perioda, int $puvodniDen): DateTime
{
    if ($perioda === 'tydne') {
        return (clone $datum)->modify('+1 week');
    }

    $rok = (int) $datum->format('Y');
    $mesic = (int) $datum->format('n');

    if ($perioda === 'rocne') {
        $rok++;
    } else {
        $mesic++;
        if ($mesic > 12) {
            $mesic = 1;
            $rok++;
        }
    }

    // Zachovává původní den v měsíci (např. 31.) napříč obdobími místo trvalého
    // posunu — v kratším měsíci se ořízne na jeho poslední den, ale příští
    // období se opět počítá od původního dne, ne od ořízlého.
    $dnyVMesici = (int) (new DateTime())->setDate($rok, $mesic, 1)->format('t');
    $den = min($puvodniDen, $dnyVMesici);

    return (new DateTime())->setDate($rok, $mesic, $den)->setTime(0, 0);
}

function generateDueTransakce(mysqli $conn): void
{
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
        $puvodniDen = (int) $dalsiDatum->format('j');
        $dnes = new DateTime('today');
        $clenId = (int) $platba['clen_id'];
        $kategorieId = (int) $platba['kategorie_id'];
        $castka = (float) $platba['castka'];

        while ($dalsiDatum <= $dnes) {
            $datum = $dalsiDatum->format('Y-m-d');
            $insert->bind_param('iissds', $clenId, $kategorieId, $platba['typ'], $platba['popis'], $castka, $datum);
            $insert->execute();
            $dalsiDatum = pridejObdobiPlatby($dalsiDatum, $platba['perioda'], $puvodniDen);
        }

        $noveDatum = $dalsiDatum->format('Y-m-d');
        $updateDalsiDatum->bind_param('si', $noveDatum, $platba['id']);
        $updateDalsiDatum->execute();
    }
}
