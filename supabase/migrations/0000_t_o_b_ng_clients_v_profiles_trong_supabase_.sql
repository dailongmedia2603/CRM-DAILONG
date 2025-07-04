-- Tạo bảng clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  status TEXT,
  image TEXT,
  contract_value NUMERIC,
  contract_link TEXT,
  creation_date TIMESTAMPTZ DEFAULT now(),
  company_name TEXT,
  invoice_email TEXT,
  classification TEXT,
  source TEXT,
  archived BOOLEAN DEFAULT false
);

-- Tạo bảng profiles (hồ sơ) liên kết với clients
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  link TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bật Row Level Security (RLS) để bảo mật
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách truy cập (Policies)
-- Ví dụ: Cho phép người dùng đã xác thực thực hiện mọi thao tác
CREATE POLICY "Allow all for authenticated users on clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users on profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');