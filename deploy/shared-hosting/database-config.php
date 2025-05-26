<?php
/**
 * Simple Database Config Updater
 * Help user configure database with their cPanel settings
 */

if ($_POST) {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? '';
    $db_user = $_POST['db_user'] ?? '';
    $db_pass = $_POST['db_pass'] ?? '';
    
    // Test connection
    try {
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
        
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
        
        // Update api.php with correct database config
        $api_content = file_get_contents('api.php');
        $new_config = "\$db_config = [
    'host' => '$db_host',
    'dbname' => '$db_name',
    'username' => '$db_user', 
    'password' => '$db_pass'
];";
        
        $pattern = '/\$db_config = \[[^}]+\];/s';
        $api_content = preg_replace($pattern, $new_config, $api_content);
        file_put_contents('api.php', $api_content);
        
        echo json_encode([
            'success' => true,
            'message' => 'Database setup completed!',
            'login_info' => [
                'url' => 'https://crm.vuaseeding.top',
                'email' => 'admin@crm.com',
                'password' => 'admin123'
            ]
        ]);
        exit;
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>CRM Database Configuration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; }
        button:hover { background: #005a87; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007cba; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        small { color: #666; font-size: 12px; }
    </style>
</head>
<body>

<div class="container">
    <h1>🗄️ CRM Database Configuration</h1>
    
    <div class="warning">
        <h3>📋 Trước khi điền form:</h3>
        <ol>
            <li>Đăng nhập <strong>cPanel</strong></li>
            <li>Vào <strong>"MySQL Databases"</strong></li>
            <li>Tạo database với tên: <code>crm</code></li>
            <li>Tạo user với username/password</li>
            <li>Add user to database với "All Privileges"</li>
        </ol>
    </div>
    
    <div class="info">
        <h3>ℹ️ Thông tin database từ cPanel:</h3>
        <p>Sau khi tạo trong cPanel, bạn sẽ thấy thông tin như:</p>
        <ul>
            <li><strong>Database:</strong> yourusername_crm</li>
            <li><strong>User:</strong> yourusername_crmuser</li>
            <li><strong>Host:</strong> localhost</li>
        </ul>
    </div>
    
    <form method="post" id="configForm">
        <div class="form-group">
            <label>Database Host:</label>
            <input type="text" name="db_host" value="localhost" required>
            <small>Thường là "localhost" trên shared hosting</small>
        </div>
        
        <div class="form-group">
            <label>Database Name:</label>
            <input type="text" name="db_name" placeholder="yourusername_crm" required>
            <small>Tên database đầy đủ từ cPanel (có prefix username)</small>
        </div>
        
        <div class="form-group">
            <label>Database Username:</label>
            <input type="text" name="db_user" placeholder="yourusername_crmuser" required>
            <small>Username đầy đủ từ cPanel (có prefix username)</small>
        </div>
        
        <div class="form-group">
            <label>Database Password:</label>
            <input type="password" name="db_pass" required>
            <small>Mật khẩu bạn đã đặt khi tạo user</small>
        </div>
        
        <button type="submit">🚀 Setup CRM Database</button>
    </form>
</div>

<script>
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Database setup thành công!\n\nĐăng nhập CRM:\n' + 
                  'URL: ' + data.login_info.url + '\n' +
                  'Email: ' + data.login_info.email + '\n' + 
                  'Password: ' + data.login_info.password);
            window.location.href = 'index.html';
        } else {
            alert('❌ Lỗi: ' + data.error + '\n\nKiểm tra lại thông tin database từ cPanel.');
        }
    })
    .catch(error => {
        alert('❌ Lỗi kết nối: ' + error);
    });
});
</script>

</body>
</html>