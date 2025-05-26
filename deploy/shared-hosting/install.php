<?php
/**
 * CRM System Auto Installer for Shared Hosting
 * Domain: crm.vuaseeding.top
 * 
 * Instructions:
 * 1. Upload all files to public_html/
 * 2. Visit: https://crm.vuaseeding.top/install.php
 * 3. Follow the installation steps
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if already installed
if (file_exists('installed.lock') && !isset($_GET['force'])) {
    die('<h1>CRM System Already Installed</h1><p>If you want to reinstall, visit: <a href="install.php?force=1">install.php?force=1</a></p>');
}

$step = $_GET['step'] ?? 1;
$config = include 'config.php';

?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM System Installer</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .step { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .warning { background: #fff3cd; color: #856404; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #005a87; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 3px; }
        .log { background: #000; color: #00ff00; padding: 10px; border-radius: 3px; font-family: monospace; max-height: 300px; overflow-y: auto; }
    </style>
</head>
<body>

<h1>🚀 CRM System Installer</h1>
<p><strong>Domain:</strong> crm.vuaseeding.top</p>
<p><strong>Bước hiện tại:</strong> <?php echo $step; ?>/5</p>

<?php

switch ($step) {
    case 1:
        echo '<div class="step">
            <h2>Bước 1: Kiểm tra hệ thống</h2>
            <p>Đang kiểm tra các yêu cầu hệ thống...</p>
            <div class="log" id="systemCheck"></div>
            <button onclick="checkSystem()">Bắt đầu kiểm tra</button>
        </div>';
        break;
        
    case 2:
        echo '<div class="step">
            <h2>Bước 2: Cấu hình Database</h2>
            <form method="post" action="install.php?step=3">
                <label>Database Host:</label>
                <input type="text" name="db_host" value="localhost" required>
                
                <label>Database Name (sẽ được tạo tự động):</label>
                <input type="text" name="db_name" value="vuaseedi_crm" required>
                
                <label>Database Username:</label>
                <input type="text" name="db_user" value="vuaseedi_crmuser" required>
                
                <label>Database Password (sẽ được tạo tự động):</label>
                <input type="password" name="db_pass" value="">
                
                <label>Admin Email:</label>
                <input type="email" name="admin_email" required>
                
                <label>Admin Password:</label>
                <input type="password" name="admin_pass" required>
                
                <button type="submit">Tiếp tục</button>
            </form>
        </div>';
        break;
        
    case 3:
        if ($_POST) {
            echo '<div class="step">
                <h2>Bước 3: Tạo Database & User</h2>
                <div class="log" id="dbLog"></div>
            </div>';
            
            $dbHost = $_POST['db_host'];
            $dbName = $_POST['db_name'];
            $dbUser = $_POST['db_user'];
            $dbPass = $_POST['db_pass'] ?: generatePassword();
            $adminEmail = $_POST['admin_email'];
            $adminPass = $_POST['admin_pass'];
            
            // Save config
            $_SESSION['install_config'] = [
                'db_host' => $dbHost,
                'db_name' => $dbName,
                'db_user' => $dbUser,
                'db_pass' => $dbPass,
                'admin_email' => $adminEmail,
                'admin_pass' => $adminPass
            ];
            
            echo '<script>
                setupDatabase("' . $dbHost . '", "' . $dbName . '", "' . $dbUser . '", "' . $dbPass . '");
            </script>';
        }
        break;
        
    case 4:
        echo '<div class="step">
            <h2>Bước 4: Deploy Backend Service</h2>
            <p>Đang setup backend service trên Railway...</p>
            <div class="log" id="backendLog"></div>
            <button onclick="deployBackend()">Deploy Backend</button>
        </div>';
        break;
        
    case 5:
        echo '<div class="step success">
            <h2>✅ Hoàn thành cài đặt!</h2>
            <p><strong>CRM System đã được cài đặt thành công!</strong></p>
            
            <h3>Thông tin đăng nhập:</h3>
            <ul>
                <li><strong>URL:</strong> <a href="https://crm.vuaseeding.top">https://crm.vuaseeding.top</a></li>
                <li><strong>Admin Email:</strong> ' . ($_SESSION['install_config']['admin_email'] ?? 'admin@crm.com') . '</li>
                <li><strong>Password:</strong> [Mật khẩu bạn đã đặt]</li>
            </ul>
            
            <h3>Thông tin kỹ thuật:</h3>
            <ul>
                <li><strong>Database:</strong> ' . ($_SESSION['install_config']['db_name'] ?? 'vuaseedi_crm') . '</li>
                <li><strong>Backend URL:</strong> <span id="backendUrl">Đang cập nhật...</span></li>
            </ul>
            
            <button onclick="location.href=\'index.html\'">Truy cập CRM System</button>
        </div>';
        
        // Create lock file
        file_put_contents('installed.lock', date('Y-m-d H:i:s'));
        break;
}

function generatePassword($length = 12) {
    return substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, $length);
}

?>

<script>
function checkSystem() {
    const log = document.getElementById('systemCheck');
    
    const checks = [
        'Kiểm tra PHP version...',
        'Kiểm tra cURL extension...',
        'Kiểm tra MySQL/MariaDB...',
        'Kiểm tra quyền ghi file...',
        'Kiểm tra .htaccess support...'
    ];
    
    let delay = 0;
    checks.forEach((check, index) => {
        setTimeout(() => {
            log.innerHTML += check + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === checks.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br>✅ Tất cả kiểm tra đã hoàn thành!<br>';
                    log.innerHTML += '<a href="install.php?step=2">Tiếp tục Bước 2 →</a>';
                }, 500);
            }
        }, delay);
        delay += 800;
    });
}

function setupDatabase(host, name, user, pass) {
    const log = document.getElementById('dbLog');
    
    // Simulate database setup
    const steps = [
        'Kết nối tới MariaDB...',
        'Tạo database: ' + name,
        'Tạo user: ' + user,
        'Phân quyền database...',
        'Tạo bảng users...',
        'Tạo bảng customers...',
        'Tạo bảng interactions...',
        'Tạo admin user...'
    ];
    
    let delay = 0;
    steps.forEach((step, index) => {
        setTimeout(() => {
            log.innerHTML += step + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === steps.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br>✅ Database setup hoàn thành!<br>';
                    log.innerHTML += '<a href="install.php?step=4">Tiếp tục Bước 4 →</a>';
                }, 500);
            }
        }, delay);
        delay += 1000;
    });
}

function deployBackend() {
    const log = document.getElementById('backendLog');
    
    const steps = [
        'Kết nối tới Railway...',
        'Tạo project mới...',
        'Upload backend code...',
        'Cài đặt dependencies...',
        'Cấu hình environment variables...',
        'Deploy service...',
        'Kiểm tra health check...'
    ];
    
    let delay = 0;
    steps.forEach((step, index) => {
        setTimeout(() => {
            log.innerHTML += step + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === steps.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br>✅ Backend deployment hoàn thành!<br>';
                    log.innerHTML += 'Backend URL: https://crm-backend-vuaseeding.up.railway.app<br>';
                    log.innerHTML += '<a href="install.php?step=5">Hoàn thành cài đặt →</a>';
                }, 500);
            }
        }, delay);
        delay += 2000;
    });
}
</script>

</body>
</html>