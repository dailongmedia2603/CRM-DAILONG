<?php
/**
 * CRM System Diagnostic Tool
 * Complete analysis for hosting support
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>CRM System Diagnostic Report</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 10px; max-width: 1000px; margin: 0 auto; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        h2 { color: #007cba; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .status { font-weight: bold; }
    </style>
</head>
<body>

<div class='container'>
<h1>🔍 CRM System Diagnostic Report</h1>
<p><strong>Domain:</strong> crm.vuaseeding.top</p>
<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
<hr>";

// 1. PHP Environment Check
echo "<div class='section'>
<h2>1. PHP Environment</h2>";

$php_ok = true;

echo "<strong>PHP Version:</strong> " . PHP_VERSION;
if (version_compare(PHP_VERSION, '7.4', '>=')) {
    echo " <span class='success'>✅ OK</span><br>";
} else {
    echo " <span class='error'>❌ Too old (need 7.4+)</span><br>";
    $php_ok = false;
}

echo "<strong>Required Extensions:</strong><br>";
$required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($required_extensions as $ext) {
    echo "- $ext: ";
    if (extension_loaded($ext)) {
        echo "<span class='success'>✅ Available</span><br>";
    } else {
        echo "<span class='error'>❌ Missing</span><br>";
        $php_ok = false;
    }
}

echo "<strong>File Permissions:</strong><br>";
$files_to_check = ['api.php', '.htaccess', 'index.html'];
foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        $perms = substr(sprintf('%o', fileperms($file)), -4);
        echo "- $file: $perms ";
        if (is_readable($file)) {
            echo "<span class='success'>✅ Readable</span><br>";
        } else {
            echo "<span class='error'>❌ Not readable</span><br>";
        }
    } else {
        echo "- $file: <span class='error'>❌ Not found</span><br>";
    }
}

echo "</div>";

// 2. Web Server Check
echo "<div class='section'>
<h2>2. Web Server Configuration</h2>";

echo "<strong>Server Software:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "<br>";
echo "<strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "<br>";

echo "<strong>.htaccess Support:</strong> ";
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    if (in_array('mod_rewrite', $modules)) {
        echo "<span class='success'>✅ mod_rewrite enabled</span><br>";
    } else {
        echo "<span class='error'>❌ mod_rewrite disabled</span><br>";
    }
} else {
    echo "<span class='warning'>⚠️ Cannot detect (likely enabled on shared hosting)</span><br>";
}

echo "</div>";

// 3. Database Connection Test
echo "<div class='section'>
<h2>3. Database Connection Test</h2>";

$db_configs = [
    [
        'name' => 'Config from cPanel info',
        'host' => 'localhost',
        'dbname' => 'oaigixrw_crm',
        'username' => 'oaigixrw_usercrm',
        'password' => 'TEST_PASSWORD' // User needs to update this
    ]
];

foreach ($db_configs as $config) {
    echo "<strong>Testing: {$config['name']}</strong><br>";
    echo "- Host: {$config['host']}<br>";
    echo "- Database: {$config['dbname']}<br>";
    echo "- Username: {$config['username']}<br>";
    echo "- Password: " . (strlen($config['password']) > 0 ? str_repeat('*', strlen($config['password'])) : 'EMPTY') . "<br>";
    
    try {
        $pdo = new PDO("mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4", 
                       $config['username'], $config['password']);
        echo "<span class='success'>✅ Connection successful</span><br>";
        
        // Test tables
        $tables = ['users', 'customers', 'interactions'];
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
                $count = $stmt->fetchColumn();
                echo "- Table '$table': $count records <span class='success'>✅</span><br>";
            } catch (PDOException $e) {
                echo "- Table '$table': <span class='error'>❌ " . $e->getMessage() . "</span><br>";
            }
        }
        
        // Check admin user
        try {
            $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE email = ?");
            $stmt->execute(['admin@crm.com']);
            $admin = $stmt->fetch();
            if ($admin) {
                echo "- Admin user: <span class='success'>✅ Found (ID: {$admin['id']}, Role: {$admin['role']})</span><br>";
            } else {
                echo "- Admin user: <span class='error'>❌ Not found</span><br>";
            }
        } catch (PDOException $e) {
            echo "- Admin user check: <span class='error'>❌ " . $e->getMessage() . "</span><br>";
        }
        
    } catch (PDOException $e) {
        echo "<span class='error'>❌ Connection failed: " . $e->getMessage() . "</span><br>";
    }
    echo "<br>";
}

echo "</div>";

// 4. API Endpoint Tests
echo "<div class='section'>
<h2>4. API Endpoint Tests</h2>";

$base_url = 'https://crm.vuaseeding.top';
$endpoints = [
    '/api/health' => 'Health check',
    '/api.php' => 'Direct API access'
];

foreach ($endpoints as $endpoint => $description) {
    echo "<strong>Testing: $description</strong><br>";
    echo "URL: $base_url$endpoint<br>";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $base_url . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $http_code ";
    if ($http_code === 200) {
        echo "<span class='success'>✅ OK</span><br>";
        echo "Response: <pre>" . htmlspecialchars(substr($response, 0, 200)) . "...</pre>";
    } else {
        echo "<span class='error'>❌ Failed</span><br>";
        if ($error) {
            echo "cURL Error: <span class='error'>$error</span><br>";
        }
        echo "Response: <pre>" . htmlspecialchars($response) . "</pre>";
    }
    echo "<br>";
}

echo "</div>";

// 5. File Content Check
echo "<div class='section'>
<h2>5. Configuration Files Check</h2>";

$config_files = [
    'api.php' => 'Backend API',
    '.htaccess' => 'Apache configuration'
];

foreach ($config_files as $file => $description) {
    echo "<strong>$description ($file):</strong><br>";
    if (file_exists($file)) {
        echo "<span class='success'>✅ File exists</span><br>";
        $content = file_get_contents($file);
        
        if ($file === 'api.php') {
            // Check database config in api.php
            if (preg_match('/\$db_config\s*=\s*\[(.*?)\];/s', $content, $matches)) {
                echo "Database config found in api.php:<br>";
                echo "<pre>" . htmlspecialchars($matches[0]) . "</pre>";
            } else {
                echo "<span class='error'>❌ No database config found in api.php</span><br>";
            }
        }
        
        if ($file === '.htaccess') {
            if (strpos($content, 'RewriteRule ^api/') !== false) {
                echo "<span class='success'>✅ API rewrite rules found</span><br>";
            } else {
                echo "<span class='error'>❌ API rewrite rules missing</span><br>";
            }
        }
    } else {
        echo "<span class='error'>❌ File not found</span><br>";
    }
    echo "<br>";
}

echo "</div>";

// 6. Recommendations
echo "<div class='section'>
<h2>6. Recommendations for Hosting Support</h2>";

echo "<strong>Issues found that need hosting support:</strong><br>";

if (!$php_ok) {
    echo "❌ PHP configuration issues - need to enable missing extensions<br>";
}

echo "<br><strong>Steps for hosting support to check:</strong><br>";
echo "1. Verify PHP 7.4+ with PDO, PDO_MySQL extensions enabled<br>";
echo "2. Verify mod_rewrite is enabled for .htaccess<br>";
echo "3. Check if MySQL/MariaDB is accessible from web scripts<br>";
echo "4. Verify file permissions allow PHP execution<br>";
echo "5. Check error logs for any blocked requests<br>";

echo "<br><strong>Database credentials to verify:</strong><br>";
echo "- Host: localhost<br>";
echo "- Database: oaigixrw_crm<br>";
echo "- Username: oaigixrw_usercrm<br>";
echo "- Password: [USER NEEDS TO PROVIDE]<br>";

echo "</div>";

echo "<div class='section'>
<h2>7. Next Steps</h2>";
echo "<strong>For user:</strong><br>";
echo "1. Save this report<br>";
echo "2. Contact hosting support with this report<br>";
echo "3. Ask them to check the issues mentioned above<br>";
echo "4. Provide your actual database password for testing<br>";
echo "<br>";
echo "<strong>For hosting support:</strong><br>";
echo "1. Verify all PHP extensions are enabled<br>";
echo "2. Test database connection with provided credentials<br>";
echo "3. Check Apache mod_rewrite configuration<br>";
echo "4. Review server error logs for any blocked requests<br>";
echo "</div>";

echo "</div>
</body>
</html>";
?>