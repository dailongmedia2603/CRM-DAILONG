<?php
/**
 * CRM Backend API - PHP Version for Shared Hosting
 * Simple backend that works on shared hosting with MySQL/MariaDB
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'vuaseedi_crm',
    'username' => 'vuaseedi_crmuser', 
    'password' => 'crm_password_2025'
];

// JWT Secret
$jwt_secret = 'crm_jwt_secret_2025_vuaseeding';

// Connect to database
try {
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4",
        $db_config['username'],
        $db_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    // Auto-create database if not exists
    try {
        $pdo_root = new PDO("mysql:host={$db_config['host']};charset=utf8mb4", 'root', '');
        $pdo_root->exec("CREATE DATABASE IF NOT EXISTS {$db_config['dbname']}");
        $pdo_root->exec("CREATE USER IF NOT EXISTS '{$db_config['username']}'@'localhost' IDENTIFIED BY '{$db_config['password']}'");
        $pdo_root->exec("GRANT ALL PRIVILEGES ON {$db_config['dbname']}.* TO '{$db_config['username']}'@'localhost'");
        $pdo_root->exec("FLUSH PRIVILEGES");
        
        // Reconnect
        $pdo = new PDO(
            "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4",
            $db_config['username'],
            $db_config['password']
        );
    } catch (PDOException $e2) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
        exit();
    }
}

// Create tables if not exist
$tables_sql = [
    "CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'sales',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
    )",
    "CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        status VARCHAR(50) DEFAULT 'new',
        assigned_sales VARCHAR(36),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36)
    )",
    "CREATE TABLE IF NOT EXISTS interactions (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        outcome TEXT,
        next_action TEXT,
        revenue_potential DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36)
    )"
];

foreach ($tables_sql as $sql) {
    $pdo->exec($sql);
}

// Helper functions
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function createJWT($payload) {
    global $jwt_secret;
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    $payload = json_encode($payload);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $jwt_secret, true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function verifyJWT($token) {
    global $jwt_secret;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $header = base64_decode(strtr($parts[0], '-_', '+/'));
    $payload = base64_decode(strtr($parts[1], '-_', '+/'));
    $signature = base64_decode(strtr($parts[2], '-_', '+/'));
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $jwt_secret, true);
    
    if (!hash_equals($signature, $expectedSignature)) return false;
    
    $payloadData = json_decode($payload, true);
    if ($payloadData['exp'] < time()) return false;
    
    return $payloadData;
}

function getCurrentUser() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    if (!$token) return null;
    
    return verifyJWT($token);
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path); // Remove /api prefix

// Get request body
$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($path) {
        case '/health':
            echo json_encode(['status' => 'healthy', 'timestamp' => date('c')]);
            break;
            
        case '/auth/register':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $full_name = $input['full_name'] ?? '';
            $role = $input['role'] ?? 'sales';
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Email already registered']);
                break;
            }
            
            // Create user
            $user_id = generateUUID();
            $hashed_password = hashPassword($password);
            
            $stmt = $pdo->prepare("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $email, $hashed_password, $full_name, $role]);
            
            $token = createJWT(['sub' => $email, 'user_id' => $user_id]);
            
            echo json_encode([
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user_id,
                    'email' => $email,
                    'full_name' => $full_name,
                    'role' => $role
                ]
            ]);
            break;
            
        case '/auth/login':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user || !verifyPassword($password, $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Incorrect email or password']);
                break;
            }
            
            $token = createJWT(['sub' => $email, 'user_id' => $user['id']]);
            
            echo json_encode([
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ]
            ]);
            break;
            
        case '/users/me':
            $current_user = getCurrentUser();
            if (!$current_user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $stmt = $pdo->prepare("SELECT id, email, full_name, role FROM users WHERE email = ?");
            $stmt->execute([$current_user['sub']]);
            $user = $stmt->fetch();
            
            echo json_encode($user);
            break;
            
        case '/customers':
            $current_user = getCurrentUser();
            if (!$current_user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC");
                echo json_encode($stmt->fetchAll());
            } elseif ($method === 'POST') {
                $customer_id = generateUUID();
                $name = $input['name'] ?? '';
                $email = $input['email'] ?? '';
                $phone = $input['phone'] ?? '';
                $company = $input['company'] ?? '';
                $status = $input['status'] ?? 'new';
                $notes = $input['notes'] ?? '';
                
                $stmt = $pdo->prepare("INSERT INTO customers (id, name, email, phone, company, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$customer_id, $name, $email, $phone, $company, $status, $notes, $current_user['user_id']]);
                
                echo json_encode(['id' => $customer_id, 'message' => 'Customer created successfully']);
            }
            break;
            
        case '/analytics/dashboard':
            $current_user = getCurrentUser();
            if (!$current_user) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $customers_count = $pdo->query("SELECT COUNT(*) as count FROM customers")->fetch()['count'];
            $interactions_count = $pdo->query("SELECT COUNT(*) as count FROM interactions")->fetch()['count'];
            
            echo json_encode([
                'total_customers' => $customers_count,
                'total_interactions' => $interactions_count,
                'revenue' => [
                    'total_revenue' => 250000,
                    'monthly_revenue' => 45000,
                    'revenue_growth' => 12.5
                ],
                'customer_status_distribution' => [
                    ['status' => 'new', 'count' => 15],
                    ['status' => 'contacted', 'count' => 8],
                    ['status' => 'qualified', 'count' => 5]
                ]
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}
?>