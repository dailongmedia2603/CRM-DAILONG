# 🚀 CRM System - Hướng Dẫn Cài Đặt Nhanh

## ⚡ CHO NGƯỜI KHÔNG BIẾT CODE

### 🎯 Mục tiêu:
Deploy CRM System lên domain: **crm.vuaseeding.top**

---

## 📋 BƯỚC 1: TẢI VỀ CÁC FILE CẦN THIẾT

Tất cả file cần thiết đã được chuẩn bị sẵn trong folder:
```
/app/deploy/shared-hosting/
```

**Danh sách file bạn cần upload:**
- ✅ `index.html` - Trang chủ CRM
- ✅ `static/` - Folder chứa CSS, JS, images
- ✅ `.htaccess` - Cấu hình Apache
- ✅ `api-proxy.php` - Kết nối API backend
- ✅ `config.php` - Cấu hình hệ thống
- ✅ `install.php` - **File cài đặt tự động**

---

## 🌐 BƯỚC 2: UPLOAD LÊN HOSTING

### 2.1 Qua cPanel File Manager:
1. Đăng nhập cPanel hosting của bạn
2. Mở **File Manager**
3. Vào folder **public_html**
4. **Upload** tất cả file từ `/app/deploy/shared-hosting/`
5. **Extract** nếu upload dạng ZIP

### 2.2 Qua FTP (nếu bạn biết dùng):
- Host: hosting IP của bạn
- Username: cPanel username
- Password: cPanel password  
- Upload vào folder `public_html/`

---

## ⚙️ BƯỚC 3: CHẠY CÀI ĐẶT TỰ ĐỘNG

### 3.1 Truy cập URL cài đặt:
```
https://crm.vuaseeding.top/install.php
```

### 3.2 Làm theo 5 bước tự động:

**🔧 Bước 1: Kiểm tra hệ thống**
- Click "Bắt đầu kiểm tra"
- Đợi kiểm tra xong → Click "Tiếp tục Bước 2"

**💾 Bước 2: Cấu hình Database**
- Database Host: `localhost` ✅
- Database Name: `vuaseedi_crm` ✅
- Username: `vuaseedi_crmuser` ✅ 
- Password: (để trống - tự tạo) ✅
- Admin Email: `admin@crm.com` (hoặc email bạn muốn)
- Admin Password: **ĐẶT MẬT KHẨU MẠNH**
- Click "Tiếp tục"

**🗄️ Bước 3: Tạo Database**
- Hệ thống tự động tạo database
- Đợi hoàn thành → Click "Tiếp tục Bước 4"

**🚀 Bước 4: Deploy Backend**  
- Click "Deploy Backend"
- Hệ thống tự động setup backend service
- Đợi hoàn thành → Click "Hoàn thành cài đặt"

**✅ Bước 5: Hoàn thành!**
- Nhận thông tin đăng nhập
- Click "Truy cập CRM System"

---

## 🎉 BƯỚC 4: SỬ DỤNG CRM

### 4.1 Đăng nhập:
```
URL: https://crm.vuaseeding.top
Email: admin@crm.com (hoặc email bạn đã đặt)
Password: [mật khẩu bạn đã đặt ở bước 3.2]
```

### 4.2 Tính năng có sẵn:
✅ **Quản lý khách hàng** - Thêm, sửa, xóa khách hàng
✅ **Quản lý người dùng** - Team sales, phân quyền
✅ **Theo dõi tương tác** - Gọi điện, email, meeting  
✅ **Dashboard analytics** - Biểu đồ, báo cáo
✅ **Quản lý công việc** - Task, deadline, comment
✅ **Quản lý dự án** - Client, contract, documents

---

## 🆘 KHẮC PHỤC SỰ CỐ

### ❌ Lỗi "Không truy cập được install.php":
- Kiểm tra file có upload đúng chưa
- Kiểm tra domain đã point về hosting chưa

### ❌ Lỗi "Database connection failed":  
- Kiểm tra cPanel có MariaDB/MySQL không
- Thử đổi Database Host thành IP hosting

### ❌ Lỗi "Backend service unavailable":
- Đợi 2-3 phút để backend deploy xong
- Refresh lại trang và thử lại

### ❌ Trang trắng hoặc lỗi 500:
- Kiểm tra file `.htaccess` có upload chưa
- Kiểm tra PHP version >= 7.4

---

## 📞 YÊU CẦU HỖ TRỢ

Nếu vẫn gặp vấn đề, cung cấp thông tin:
1. **Screenshot** lỗi cụ thể
2. **URL** bạn đang truy cập
3. **Bước nào** bị lỗi trong quá trình cài đặt
4. **Error logs** từ cPanel (nếu có)

---

## 🎯 KẾT QUẢ CUỐI CÙNG

Sau khi hoàn thành, bạn sẽ có:
- ✅ **CRM System** chạy trên domain riêng
- ✅ **Tài khoản admin** để quản lý
- ✅ **Database** lưu trữ dữ liệu  
- ✅ **Backend API** xử lý logic
- ✅ **Giao diện đẹp** responsive mobile

**🎉 Chúc mừng! CRM System của bạn đã sẵn sàng sử dụng!**