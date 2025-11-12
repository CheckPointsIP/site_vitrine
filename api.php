<?php
/**
 * PLAN B CRM - Analytics API
 * Backend PHP simple pour stocker les données analytics
 * Version: 1.0.0
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
define('DATA_DIR', __DIR__ . '/analytics-data');

// Créer le dossier de données s'il n'existe pas
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Router basique
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';

// === ENDPOINTS ===

// POST /api.php - Recevoir les données analytics
if ($method === 'POST' && $path === '/') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['events']) || !is_array($data['events'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data format']);
        exit();
    }

    $events = $data['events'];
    $sessionId = $data['sessionId'] ?? 'unknown';
    $userId = $data['userId'] ?? 'unknown';
    $timestamp = $data['timestamp'] ?? time() * 1000;

    // Sauvegarder chaque événement
    foreach ($events as $event) {
        saveEvent($event);
    }

    // Sauvegarder le batch complet
    $batchDir = DATA_DIR . '/batches';
    if (!is_dir($batchDir)) {
        mkdir($batchDir, 0755, true);
    }

    $batchFilename = "batch_{$timestamp}_{$sessionId}.json";
    $batchPath = $batchDir . '/' . $batchFilename;
    file_put_contents($batchPath, json_encode($data, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'eventsReceived' => count($events),
        'message' => 'Analytics data saved successfully'
    ]);
    exit();
}

// GET /api.php/stats - Récupérer les statistiques
if ($method === 'GET' && $path === '/stats') {
    $stats = getStats();
    echo json_encode($stats);
    exit();
}

// GET /api.php/{type} - Récupérer des données par type
if ($method === 'GET' && preg_match('/^\/([a-z_]+)$/', $path, $matches)) {
    $type = $matches[1];
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $data = getEventsByType($type, $limit, $offset);
    echo json_encode($data);
    exit();
}

// GET /api.php/export - Exporter toutes les données
if ($method === 'GET' && $path === '/export') {
    $allData = getAllData();

    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="analytics-export-' . time() . '.json"');

    echo json_encode($allData, JSON_PRETTY_PRINT);
    exit();
}

// DELETE /api.php/clear - Supprimer toutes les données
if ($method === 'DELETE' && $path === '/clear') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['confirmToken']) || $data['confirmToken'] !== 'DELETE_ALL_ANALYTICS_DATA') {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid confirmation token']);
        exit();
    }

    clearAllData();
    echo json_encode(['success' => true, 'message' => 'All analytics data deleted']);
    exit();
}

// 404
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found']);
exit();

// === FONCTIONS ===

function saveEvent($event) {
    $type = $event['type'] ?? 'unknown';
    $typeDir = DATA_DIR . '/' . $type;

    if (!is_dir($typeDir)) {
        mkdir($typeDir, 0755, true);
    }

    // Créer un fichier par jour
    $timestamp = $event['timestamp'] ?? (time() * 1000);
    $date = date('Y-m-d', $timestamp / 1000);
    $filename = "{$type}_{$date}.jsonl";
    $filePath = $typeDir . '/' . $filename;

    // Ajouter en JSONL (JSON Lines)
    $line = json_encode($event) . "\n";
    file_put_contents($filePath, $line, FILE_APPEND);
}

function getEventsByType($type, $limit = 1000, $offset = 0) {
    $typeDir = DATA_DIR . '/' . $type;

    if (!is_dir($typeDir)) {
        return ['data' => [], 'total' => 0];
    }

    $files = glob($typeDir . '/*.jsonl');
    $allEvents = [];

    foreach ($files as $file) {
        $content = file_get_contents($file);
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            if (empty($line)) continue;

            $event = json_decode($line, true);
            if ($event) {
                $allEvents[] = $event;
            }
        }
    }

    // Trier par timestamp décroissant
    usort($allEvents, function($a, $b) {
        return ($b['timestamp'] ?? 0) - ($a['timestamp'] ?? 0);
    });

    $total = count($allEvents);
    $data = array_slice($allEvents, $offset, $limit);

    return [
        'data' => $data,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ];
}

function getAllData() {
    $types = [
        'pageview', 'click', 'button_click', 'link_click',
        'form_submit', 'scroll_depth', 'time_on_page',
        'tab_switch', 'device_info'
    ];

    $allData = [];

    foreach ($types as $type) {
        $result = getEventsByType($type, 100000);
        $allData[$type] = $result['data'];
    }

    return $allData;
}

function getStats() {
    $allData = getAllData();

    $pageviews = $allData['pageview'] ?? [];
    $clicks = $allData['click'] ?? [];
    $buttonClicks = $allData['button_click'] ?? [];
    $formSubmissions = $allData['form_submit'] ?? [];

    $userIds = array_unique(array_column($pageviews, 'userId'));
    $sessionIds = array_unique(array_column($pageviews, 'sessionId'));

    return [
        'totalPageviews' => count($pageviews),
        'totalClicks' => count($clicks),
        'totalButtonClicks' => count($buttonClicks),
        'totalFormSubmissions' => count($formSubmissions),
        'uniqueUsers' => count($userIds),
        'uniqueSessions' => count($sessionIds),
        'lastUpdated' => time() * 1000
    ];
}

function clearAllData() {
    $dir = DATA_DIR;

    if (!is_dir($dir)) {
        return;
    }

    // Fonction récursive pour supprimer un dossier
    $deleteDir = function($path) use (&$deleteDir) {
        if (!is_dir($path)) {
            return;
        }

        $items = scandir($path);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;

            $itemPath = $path . '/' . $item;

            if (is_dir($itemPath)) {
                $deleteDir($itemPath);
            } else {
                unlink($itemPath);
            }
        }

        rmdir($path);
    };

    $deleteDir($dir);
    mkdir($dir, 0755, true);
}
