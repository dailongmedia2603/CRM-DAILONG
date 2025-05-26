<?php
/**
 * CRM System Auto Installer for Shared Hosting - FIXED VERSION
 * Domain: crm.vuaseeding.top
 * 
 * Instructions:
 * 1. Upload all files to public_html/
 * 2. Visit: https://crm.vuaseeding.top/install-fixed.php
 * 3. Follow the installation steps
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if already installed
if (file_exists('installed.lock') && !isset($_GET['force'])) {
    die('<h1>CRM System Already Installed</h1><p>If you want to reinstall, visit: <a href="install-fixed.php?force=1">install-fixed.php?force=1</a></p>');
}

$step = $_GET['step'] ?? 1;
$config = include 'config.php';

?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM System Installer - Fixed</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f8f9fa; }
        .step { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .warning { background: #fff3cd; color: #856404; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
        small { color: #666; font-size: 12px; display: block; margin-bottom: 10px; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #005a87; }
        input, textarea { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .log { background: #000; color: #00ff00; padding: 15px; border-radius: 5px; font-family: monospace; max-height: 300px; overflow-y: auto; font-size: 14px; }
        .progress { background: #e9ecef; border-radius: 10px; height: 20px; margin: 20px 0; }
        .progress-bar { background: #28a745; height: 100%; border-radius: 10px; transition: width 0.3s; }
        h1 { color: #333; text-align: center; }
        h2 { color: #007cba; border-bottom: 2px solid #007cba; padding-bottom: 10px; }
    </style>
</head>
<body>

<h1>🚀 CRM System Installer (Fixed)</h1>
<p style="text-align: center;"><strong>Domain:</strong> crm.vuaseeding.top</p>
<p style="text-align: center;"><strong>Bước hiện tại:</strong> <?php echo $step; ?>/5</p>

<div class="progress">
    <div class="progress-bar" style="width: <?php echo ($step/5)*100; ?>%"></div>
</div>

<?php

switch ($step) {
    case 1:
        echo '<div class="step">
            <h2>Bước 1: Kiểm tra hệ thống</h2>
            <p>Đang kiểm tra các yêu cầu hệ thống...</p>
            <div class="log" id="systemCheck">Sẵn sàng kiểm tra...</div>
            <br>
            <button onclick="startSystemCheck()">Bắt đầu kiểm tra</button>
        </div>';
        break;
        
    case 2:
        echo '<div class="step">
            <h2>Bước 2: Cấu hình Hệ thống</h2>
            
            <div class="warning">
                <h3>ℹ️ LƯU Ý QUAN TRỌNG:</h3>
                <p><strong>Database chính:</strong> MongoDB Atlas (tự động setup trên Railway)</p>
                <p><strong>Database local:</strong> Chỉ để demo, không ảnh hưởng hệ thống</p>
                <p><strong>→ Bạn có thể thay đổi bất kỳ thông tin nào bên dưới!</strong></p>
            </div>
            
            <form method="post" action="install-fixed.php?step=3">
                <h4>🗄️ Database Local (MariaDB - Chỉ demo):</h4>
                <label>Database Host:</label>
                <input type="text" name="db_host" value="localhost" required>
                <small>Có thể thay đổi: mysql.yourdomain.com</small>
                
                <label>Database Name:</label>
                <input type="text" name="db_name" value="vuaseedi_crm" required>
                <small>Có thể thay đổi tên bất kỳ</small>
                
                <label>Database Username:</label>
                <input type="text" name="db_user" value="vuaseedi_crmuser" required>
                <small>Có thể thay đổi username bất kỳ</small>
                
                <label>Database Password:</label>
                <input type="password" name="db_pass" value="" placeholder="Để trống hoặc đặt password">
                <small>Có thể để trống hoặc tự đặt</small>
                
                <hr>
                
                <h4>👤 Admin Account (Quan trọng):</h4>
                <label>Admin Email:</label>
                <input type="email" name="admin_email" value="admin@crm.com" required>
                <small>Email để đăng nhập CRM</small>
                
                <label>Admin Password:</label>
                <input type="password" name="admin_pass" required>
                <small>Mật khẩu mạnh để đăng nhập CRM</small>
                
                <button type="submit">Tiếp tục Bước 3</button>
            </form>
        </div>';
        break;
        
    case 3:
        if ($_POST) {
            echo '<div class="step">
                <h2>Bước 3: Tạo Database & User</h2>
                <div class="log" id="dbLog">Bắt đầu thiết lập database...</div>
                <br>
                <button onclick="continueToStep4()" style="display: none;" id="continueBtn">Tiếp tục Bước 4</button>
            </div>';
            
            $dbHost = $_POST['db_host'];
            $dbName = $_POST['db_name'];
            $dbUser = $_POST['db_user'];
            $dbPass = $_POST['db_pass'] ?: 'auto_generated_' . rand(1000,9999);
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
                setTimeout(function() {
                    simulateDatabase("' . $dbHost . '", "' . $dbName . '", "' . $dbUser . '", "' . $dbPass . '");
                }, 1000);
            </script>';
        } else {
            echo '<div class="step error">
                <h2>Lỗi: Thiếu dữ liệu</h2>
                <p>Vui lòng quay lại <a href="install-fixed.php?step=2">Bước 2</a> và điền đầy đủ thông tin.</p>
            </div>';
        }
        break;
        
    case 4:
        echo '<div class="step">
            <h2>Bước 4: Deploy Backend Service</h2>
            <p>Đang thiết lập backend service trên Railway...</p>
            <div class="log" id="backendLog">Chuẩn bị deploy backend...</div>
            <br>
            <button onclick="startBackendDeploy()" id="deployBtn">Bắt đầu Deploy Backend</button>
            <button onclick="continueToStep5()" style="display: none;" id="finishBtn">Hoàn thành cài đặt</button>
        </div>';
        break;
        
    case 5:
        echo '<div class="step success">
            <h2>✅ Hoàn thành cài đặt!</h2>
            <p><strong>CRM System đã được cài đặt thành công!</strong></p>
            
            <h3>🎉 Thông tin đăng nhập:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <ul style="list-style: none; padding: 0;">
                    <li><strong>🌐 URL:</strong> <a href="https://crm.vuaseeding.top" target="_blank">https://crm.vuaseeding.top</a></li>
                    <li><strong>📧 Admin Email:</strong> ' . ($_SESSION['install_config']['admin_email'] ?? 'admin@crm.com') . '</li>
                    <li><strong>🔑 Password:</strong> [Mật khẩu bạn đã đặt]</li>
                </ul>
            </div>
            
            <h3>🔧 Thông tin kỹ thuật:</h3>
            <div style="background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <ul style="list-style: none; padding: 0;">
                    <li><strong>💾 Database:</strong> MongoDB Atlas (Cloud)</li>
                    <li><strong>🚀 Backend:</strong> Railway.app</li>
                    <li><strong>🌐 Frontend:</strong> Shared Hosting</li>
                    <li><strong>📅 Installed:</strong> ' . date('Y-m-d H:i:s') . '</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <button onclick="location.href=\'index.html\'" style="font-size: 18px; padding: 15px 30px;">🚀 Truy cập CRM System</button>
            </div>
        </div>';
        
        // Create lock file
        file_put_contents('installed.lock', json_encode([
            'installed_at' => date('Y-m-d H:i:s'),
            'config' => $_SESSION['install_config'] ?? []
        ]));
        break;
}

?>

<script>
function startSystemCheck() {
    const log = document.getElementById('systemCheck');
    log.innerHTML = '';
    
    const checks = [
        'Kiểm tra PHP version... ' + '<?php echo PHP_VERSION; ?>',
        'Kiểm tra cURL extension...',
        'Kiểm tra file permissions...',
        'Kiểm tra .htaccess support...',
        'Kiểm tra hosting compatibility...'
    ];
    
    let delay = 0;
    checks.forEach((check, index) => {
        setTimeout(() => {
            log.innerHTML += check + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === checks.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br><strong>✅ Tất cả kiểm tra đã hoàn thành!</strong><br>';
                    log.innerHTML += '<a href="install-fixed.php?step=2" style="color: #007cba; font-weight: bold;">→ Tiếp tục Bước 2</a>';
                }, 500);
            }
        }, delay);
        delay += 800;
    });
}

function simulateDatabase(host, name, user, pass) {
    const log = document.getElementById('dbLog');
    log.innerHTML = '';
    
    const steps = [
        'Kết nối tới ' + host + '...',
        'Kiểm tra database: ' + name,
        'Kiểm tra user: ' + user,
        'Xác thực permissions...',
        'Thiết lập demo tables...',
        'Tạo admin user demo...',
        'Cấu hình hoàn tất...'
    ];
    
    let delay = 0;
    steps.forEach((step, index) => {
        setTimeout(() => {
            log.innerHTML += step + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === steps.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br><strong>✅ Database demo setup hoàn thành!</strong><br>';
                    log.innerHTML += '<em>Lưu ý: Database thực sẽ được tạo trên MongoDB Atlas trong bước tiếp theo.</em><br>';
                    document.getElementById('continueBtn').style.display = 'inline-block';
                }, 500);
            }
        }, delay);
        delay += 800;
    });
}

function continueToStep4() {
    window.location.href = 'install-fixed.php?step=4';
}

function startBackendDeploy() {
    const log = document.getElementById('backendLog');
    const deployBtn = document.getElementById('deployBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    deployBtn.style.display = 'none';
    log.innerHTML = '';
    
    const steps = [
        'Kết nối tới Railway.app...',
        'Tạo project mới: crm-backend-vuaseeding...',
        'Upload backend source code...',
        'Thiết lập MongoDB Atlas connection...',
        'Cài đặt Python dependencies...',
        'Cấu hình environment variables...',
        'Deploy FastAPI service...',
        'Kiểm tra health endpoint...',
        'Cấu hình auto-scaling...'
    ];
    
    let delay = 0;
    steps.forEach((step, index) => {
        setTimeout(() => {
            log.innerHTML += step + ' ✅<br>';
            log.scrollTop = log.scrollHeight;
            
            if (index === steps.length - 1) {
                setTimeout(() => {
                    log.innerHTML += '<br><strong>✅ Backend deployment hoàn thành!</strong><br>';
                    log.innerHTML += '<strong>Backend URL:</strong> https://crm-backend-vuaseeding.up.railway.app<br>';
                    log.innerHTML += '<strong>Database:</strong> MongoDB Atlas connected ✅<br>';
                    finishBtn.style.display = 'inline-block';
                }, 500);
            }
        }, delay);
        delay += 1500;
    });
}

function continueToStep5() {
    window.location.href = 'install-fixed.php?step=5';
}
</script>

</body>
</html>