<?php

require_once __DIR__ . '/../../../inc/lib/session.php';
require_once __DIR__ . '/../../../inc/lib/response.php';

initSession();
$_SESSION = [];
session_destroy();

sendJson(['message' => 'Odhlášeno.']);
