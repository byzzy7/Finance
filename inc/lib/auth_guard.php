<?php

require_once __DIR__ . '/session.php';
require_once __DIR__ . '/response.php';

initSession();

function currentMemberId(): int
{
    if (empty($_SESSION['clen_id'])) {
        sendError('Nepřihlášeno.', 401);
    }
    return (int) $_SESSION['clen_id'];
}
