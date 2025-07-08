UPDATE public.personnel
SET 
  role = 'BOD',
  role_id = (SELECT id FROM public.roles WHERE name = 'BOD')
WHERE email = 'huulong@dailongmedia.com';