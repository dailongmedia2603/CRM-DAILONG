-- Bật Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép mọi người dùng (kể cả ẩn danh) có thể đọc và ghi dữ liệu.
-- Đây là cấu hình phù hợp cho giai đoạn phát triển.
CREATE POLICY "Allow public access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);