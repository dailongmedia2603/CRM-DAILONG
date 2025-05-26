<?php
/**
 * Database Setup Script for CRM System
 * Auto-creates database, user, and admin account
 */

header('Content-Type: application/json');

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'vuaseedi_crm',
    'username' => 'vuaseedi_crmuser',
    'password' => 'crm_password_2025'
];

$responses = [];

try {
    // Step 1: Create database and user
    $responses[] = "Connecting to MySQL server...";
    
    // Try with different possible root configurations
    $root_connections = [
        ['username' => 'root', 'password' => ''],
        ['username' => 'root', 'password' => 'root'],
        ['username' => $db_config['username'], 'password' => $db_config['password']] // If already exists
    ];
    
    $pdo_root = null;
    foreach ($root_connections as $root_config) {
        try {
            $pdo_root = new PDO("mysql:host={$db_config['host']};charset=utf8mb4", 
                               $root_config['username'], $root_config['password']);
            $responses[] = "Connected with user: " . $root_config['username'];
            break;
        } catch (PDOException $e) {
            continue;
        }
    }
    
    if (!$pdo_root) {
        throw new Exception("Cannot connect to MySQL server");
    }
    
    // Create database
    $pdo_root->exec("CREATE DATABASE IF NOT EXISTS {$db_config['dbname']}");
    $responses[] = "Database '{$db_config['dbname']}' created/verified";
    
    // Create user (ignore if exists)
    try {
        $pdo_root->exec("CREATE USER '{$db_config['username']}'@'localhost' IDENTIFIED BY '{$db_config['password']}'");
        $responses[] = "User '{$db_config['username']}' created";
    } catch (PDOException $e) {
        $responses[] = "User '{$db_config['username']}' already exists";
    }
    
    // Grant privileges
    $pdo_root->exec("GRANT ALL PRIVILEGES ON {$db_config['dbname']}.* TO '{$db_config['username']}'@'localhost'");
    $pdo_root->exec("FLUSH PRIVILEGES");
    $responses[] = "Privileges granted";
    
    // Step 2: Connect to new database
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4",
        $db_config['username'],
        $db_config['password']
    );
    $responses[] = "Connected to CRM database";
    
    // Step 3: Create tables
    $tables = [
        "users" => "CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'sales',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )",
        "customers" => "CREATE TABLE IF NOT EXISTS customers (
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
        "interactions" => "CREATE TABLE IF NOT EXISTS interactions (
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
    
    foreach ($tables as $table_name => $sql) {
        $pdo->exec($sql);
        $responses[] = "Table '{$table_name}' created/verified";
    }
    
    // Step 4: Create admin user
    $admin_id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    
    $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
    
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@crm.com']);
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$admin_id, 'admin@crm.com', $admin_password, 'Administrator', 'admin']);
        $responses[] = "Admin user created: admin@crm.com / admin123";
    } else {
        $responses[] = "Admin user already exists: admin@crm.com";
    }
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Database setup completed successfully!',
        'details' => $responses,
        'login_info' => [
            'email' => 'admin@crm.com',
            'password' => 'admin123',
            'url' => 'https://crm.vuaseeding.top'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => $responses
    ]);
}
?>