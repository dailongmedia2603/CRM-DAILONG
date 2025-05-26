<?php
// CRM System Configuration for Shared Hosting
// Domain: crm.vuaseeding.top

return [
    // Backend Service Configuration
    'backend_url' => 'https://crm-backend-vuaseeding.up.railway.app',
    
    // Database Configuration (MariaDB)
    'database' => [
        'host' => 'localhost',
        'name' => 'vuaseedi_crm',  // Sẽ được tạo tự động
        'username' => 'vuaseedi_crmuser',  // Sẽ được tạo tự động
        'password' => '',  // Sẽ được generate tự động
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci'
    ],
    
    // Application Configuration
    'app' => [
        'name' => 'CRM System',
        'domain' => 'crm.vuaseeding.top',
        'timezone' => 'Asia/Ho_Chi_Minh',
        'debug' => false
    ],
    
    // Security Configuration
    'security' => [
        'jwt_secret' => '',  // Sẽ được generate tự động
        'encryption_key' => '',  // Sẽ được generate tự động
        'session_lifetime' => 3600 * 24 * 7  // 7 days
    ],
    
    // File Upload Configuration
    'upload' => [
        'max_size' => 10 * 1024 * 1024,  // 10MB
        'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        'upload_path' => 'uploads/'
    ]
];
?>