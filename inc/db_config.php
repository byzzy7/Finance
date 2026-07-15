<?php

function getDbConnection(): mysqli
{
    $configFile = __DIR__ . '/config.local.php';
    if (!file_exists($configFile)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['error' => 'Chybí inc/config.local.php — zkopíruj config.example.php a vyplň údaje k databázi.']);
        exit();
    }

    $config = require $configFile;

    $conn = mysqli_init();
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn->real_connect($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name']);

    if ($conn->connect_error) {
        error_log('Connection failed: ' . $conn->connect_error);
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['error' => 'Chyba připojení k databázi.']);
        exit();
    }

    $conn->set_charset('utf8mb4');

    return $conn;
}
