<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$BACKEND_URL = 'https://crm-backend-vuaseeding.up.railway.app'; // Sẽ được cập nhật sau
$endpoint = $_GET['endpoint'] ?? '';

// Build full URL
$url = $BACKEND_URL . '/api/' . $endpoint;

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = $name . ': ' . $value;
    }
}

// Get request body for POST/PUT requests
$data = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $data = file_get_contents('php://input');
}

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false,
]);

// Add query parameters
if (!empty($_SERVER['QUERY_STRING'])) {
    $separator = strpos($url, '?') !== false ? '&' : '?';
    curl_setopt($ch, CURLOPT_URL, $url . $separator . $_SERVER['QUERY_STRING']);
}

// Add request body
if ($data) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Handle errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Backend service unavailable: ' . $error]);
    exit();
}

// Set response code
http_response_code($httpCode);

// Return response
echo $response;
?>