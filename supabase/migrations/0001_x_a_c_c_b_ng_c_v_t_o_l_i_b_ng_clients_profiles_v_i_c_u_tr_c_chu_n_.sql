-- Xóa các bảng cũ để đảm bảo sạch sẽ
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.clients;

-- Tạo lại bảng clients
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

-- Tạo lại bảng profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  link TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);