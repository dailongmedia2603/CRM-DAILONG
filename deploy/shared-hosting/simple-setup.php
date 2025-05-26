<?php
/**
 * Simple Database Test & Setup
 */

// Your actual database config from cPanel
$db_config = [
    'host' => 'localhost',
    'dbname' => 'oaigixrw_crm',
    'username' => 'oaigixrw_usercrm',
    'password' => 'YOUR_PASSWORD_HERE'  // Thay bằng password thực
];

if ($_POST && isset($_POST['password'])) {
    $db_config['password'] = $_POST['password'];
    
    try {
        // Test connection
        $pdo = new PDO("mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4", 
                       $db_config['username'], $db_config['password']);
        
        // Create tables
        $tables = [
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
        
        foreach ($tables as $sql) {
            $pdo->exec($sql);
        }
        
        // Create admin user
        $admin_id = uniqid('admin_', true);
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute(['admin@crm.com']);
        
        if (!$stmt->fetch()) {
            $stmt = $pdo->prepare("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$admin_id, 'admin@crm.com', $admin_password, 'Administrator', 'admin']);
        }
        
        // Update api.php
        $api_content = file_get_contents('api.php');
        $old_config = "/\\\$db_config = \[.*?\];/s";
        $new_config = "\$db_config = [
    'host' => 'localhost',
    'dbname' => 'oaigixrw_crm',
    'username' => 'oaigixrw_usercrm',
    'password' => '{$db_config['password']}'
];";
        
        $api_content = preg_replace($old_config, $new_config, $api_content);
        file_put_contents('api.php', $api_content);
        
        echo "<h1>✅ SUCCESS!</h1>";
        echo "<p><strong>Database setup completed!</strong></p>";
        echo "<p><strong>Login Info:</strong></p>";
        echo "<ul>";
        echo "<li>URL: <a href='https://crm.vuaseeding.top'>https://crm.vuaseeding.top</a></li>";
        echo "<li>Email: admin@crm.com</li>";
        echo "<li>Password: admin123</li>";
        echo "</ul>";
        echo "<p><a href='index.html' style='background:#007cba;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>🚀 Truy cập CRM</a></p>";
        exit;
        
    } catch (PDOException $e) {
        echo "<h1>❌ ERROR</h1>";
        echo "<p>Database connection failed: " . $e->getMessage() . "</p>";
        echo "<p>Kiểm tra lại password database.</p>";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CRM Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 100px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #007cba; text-align: center; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007cba; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; margin: 10px 0; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; }
        button:hover { background: #005a87; }
    </style>
</head>
<body>

<div class="container">
    <h1>🗄️ CRM Database Setup</h1>
    
    <div class="info">
        <p><strong>Database đã tạo thành công:</strong></p>
        <ul>
            <li><strong>Host:</strong> localhost</li>
            <li><strong>Database:</strong> oaigixrw_crm</li>
            <li><strong>Username:</strong> oaigixrw_usercrm</li>
        </ul>
        <p>Chỉ cần nhập <strong>password</strong> database bạn đã đặt:</p>
    </div>
    
    <form method="post">
        <input type="password" name="password" placeholder="Nhập password database" required>
        <button type="submit">🚀 Setup CRM Database</button>
    </form>
</div>

</body>
</html>