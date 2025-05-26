# 🚀 CRM System - Hướng Dẫn Cài Đặt Chi Tiết

## Domain: crm.vuaseeding.top

### 📋 Tổng Quan
CRM System này bao gồm:
- **Frontend**: React app (chạy trên shared hosting)
- **Backend**: FastAPI (chạy trên Railway miễn phí)
- **Database**: MongoDB Atlas (miễn phí)

---

## 🔧 BƯỚC 1: Chuẩn Bị

### 1.1 Tạo tài khoản cần thiết:
1. **Railway**: https://railway.app (miễn phí)
2. **MongoDB Atlas**: https://cloud.mongodb.com (miễn phí)

### 1.2 Thông tin hosting hiện tại:
- ✅ **Shared hosting**: cPanel 126.0
- ✅ **Apache**: 2.4.63  
- ✅ **MariaDB**: 10.6.21
- ✅ **Domain**: crm.vuaseeding.top

---

## 🚀 BƯỚC 2: Deploy Backend (Railway)

### 2.1 Tạo MongoDB Database:
1. Truy cập: https://cloud.mongodb.com
2. Tạo tài khoản/đăng nhập
3. **Create New Project** → Tên: "CRM System"
4. **Build Database** → Chọn **M0 Sandbox** (miễn phí)
5. **Region**: Singapore (gần VN nhất)
6. **Cluster Name**: "crm-cluster"
7. **Database Access**:
   - Username: `crmuser`
   - Password: `[TỰ TẠO MẬT KHẨU MẠNH]`
8. **Network Access**: Add IP `0.0.0.0/0` (cho phép tất cả)
9. **Copy Connection String**: 
   ```
   mongodb+srv://crmuser:[PASSWORD]@crm-cluster.xxxxx.mongodb.net/crm_system
   ```

### 2.2 Deploy Backend lên Railway:
1. Truy cập: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Upload folder `/app/deploy/backend-railway/` lên GitHub
4. **Environment Variables**:
   ```
   MONGO_URL=mongodb+srv://crmuser:[PASSWORD]@crm-cluster.xxxxx.mongodb.net/crm_system
   JWT_SECRET=your-super-secret-key-change-this-in-production
   PORT=8000
   ```
5. **Domain Settings**: 
   - Railway sẽ tự tạo domain: `crm-backend-vuaseeding.up.railway.app`
   - Copy URL này để dùng ở bước tiếp theo

---

## 📁 BƯỚC 3: Chuẩn Bị Files Upload

### 3.1 Build Frontend:
```bash
cd /app/deploy/shared-hosting/
chmod +x build-frontend.sh
./build-frontend.sh
```

### 3.2 Cập nhật Backend URL:
1. Mở file `api-proxy.php`
2. Thay đổi dòng:
   ```php
   $BACKEND_URL = 'https://crm-backend-vuaseeding.up.railway.app';
   ```
   Với URL thực tế từ Railway

---

## 🌐 BƯỚC 4: Upload Files lên Shared Hosting

### 4.1 Files cần upload lên `public_html/`:
```
public_html/
├── index.html           (từ build/)
├── static/              (từ build/static/)
├── .htaccess            (từ shared-hosting/)
├── api-proxy.php        (từ shared-hosting/)
├── config.php           (từ shared-hosting/)
├── install.php          (từ shared-hosting/)
└── uploads/             (tạo folder mới)
```

### 4.2 Cách upload:
1. **Via cPanel File Manager**:
   - Đăng nhập cPanel
   - **File Manager** → **public_html**
   - **Upload** tất cả files

2. **Via FTP**:
   - Dùng FileZilla/WinSCP
   - Upload toàn bộ folder

---

## ⚙️ BƯỚC 5: Chạy Installation Wizard

### 5.1 Truy cập:
```
https://crm.vuaseeding.top/install.php
```

### 5.2 Làm theo từng bước:
1. **Bước 1**: Kiểm tra hệ thống → Click "Bắt đầu kiểm tra"
2. **Bước 2**: Cấu hình Database:
   - Database Host: `localhost`
   - Database Name: `vuaseedi_crm`
   - Username: `vuaseedi_crmuser`  
   - Password: [Để trống - sẽ tự tạo]
   - Admin Email: `admin@crm.com`
   - Admin Password: [Đặt mật khẩu mạnh]

3. **Bước 3**: Tạo Database → Tự động
4. **Bước 4**: Deploy Backend → Tự động  
5. **Bước 5**: Hoàn thành!

---

## 🎉 BƯỚC 6: Truy Cập CRM System

### 6.1 URL đăng nhập:
```
https://crm.vuaseeding.top
```

### 6.2 Thông tin đăng nhập:
- **Email**: `admin@crm.com`
- **Password**: [Mật khẩu bạn đã đặt ở bước 5.2]

---

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"Backend service unavailable"**:
   - Kiểm tra Railway backend có chạy không
   - Kiểm tra URL trong `api-proxy.php`

2. **"Database connection failed"**:
   - Kiểm tra MongoDB Atlas connection string
   - Kiểm tra IP whitelist

3. **"404 Not Found"**:
   - Kiểm tra `.htaccess` có upload đúng không
   - Kiểm tra Apache mod_rewrite có enable

4. **CORS errors**:
   - Kiểm tra headers trong `api-proxy.php`

### Logs để debug:
- **Railway logs**: https://railway.app → Project → Deployments
- **Shared hosting logs**: cPanel → Error Logs

---

## 📱 Features Có Sẵn

✅ **Authentication**: Đăng nhập/đăng ký với JWT
✅ **Customer Management**: CRUD khách hàng đầy đủ  
✅ **User Management**: Quản lý team sales
✅ **Interaction Tracking**: Ghi lại cuộc gọi, email, meeting
✅ **Analytics Dashboard**: Biểu đồ, thống kê doanh thu
✅ **Task Management**: Tạo và theo dõi công việc
✅ **Role-based Access**: Admin, Sales, Manager, etc.

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs Railway và cPanel
2. Verify tất cả environment variables
3. Test backend endpoint trực tiếp: `https://your-backend.up.railway.app/api/health`
4. Kiểm tra file permissions trên shared hosting

**🎯 Sau khi hoàn thành, bạn sẽ có CRM system hoàn chỉnh chạy trên domain riêng!**