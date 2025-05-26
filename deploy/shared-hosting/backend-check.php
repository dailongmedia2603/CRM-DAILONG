<?php
/**
 * CRM Backend Setup Helper
 * Check and setup backend connections
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test backend connection
function testBackend() {
    $backend_url = 'https://crm-backend-vuaseeding.up.railway.app/api/health';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $backend_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => $http_code === 200,
        'http_code' => $http_code,
        'response' => $response,
        'error' => $error
    ];
}

// Create admin user
function createAdminUser() {
    $backend_url = 'https://crm-backend-vuaseeding.up.railway.app/api/auth/register';
    
    $admin_data = [
        'email' => 'admin@crm.com',
        'password' => 'admin123456', // Default password
        'full_name' => 'Administrator',
        'role' => 'admin'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $backend_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($admin_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => in_array($http_code, [200, 201]),
        'http_code' => $http_code,
        'response' => $response,
        'error' => $error
    ];
}

// Main execution
$action = $_GET['action'] ?? 'test';

switch ($action) {
    case 'test':
        $result = testBackend();
        echo json_encode([
            'action' => 'test_backend',
            'result' => $result,
            'message' => $result['success'] ? 'Backend is working!' : 'Backend not ready'
        ]);
        break;
        
    case 'setup':
        // Test first
        $test_result = testBackend();
        if (!$test_result['success']) {
            echo json_encode([
                'action' => 'setup',
                'success' => false,
                'message' => 'Backend not available. Please wait and try again.',
                'backend_test' => $test_result
            ]);
            break;
        }
        
        // Create admin user
        $admin_result = createAdminUser();
        echo json_encode([
            'action' => 'setup',
            'success' => true,
            'backend_test' => $test_result,
            'admin_creation' => $admin_result,
            'message' => 'Setup completed. You can now login with: admin@crm.com / admin123456'
        ]);
        break;
        
    default:
        echo json_encode([
            'error' => 'Invalid action',
            'available_actions' => ['test', 'setup']
        ]);
        break;
}
?>