<?php

require_once __DIR__ . '/../lib/session.php';
require_once __DIR__ . '/../lib/response.php';

initSession();
$_SESSION = [];
session_destroy();

sendJson(['message' => 'Odhlášeno.']);
