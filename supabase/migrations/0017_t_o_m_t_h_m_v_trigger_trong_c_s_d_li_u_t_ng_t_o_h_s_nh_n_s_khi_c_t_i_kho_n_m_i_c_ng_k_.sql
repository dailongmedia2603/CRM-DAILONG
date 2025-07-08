-- Function to create a new personnel profile from auth user data
CREATE OR REPLACE FUNCTION public.handle_new_personnel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.personnel (id, email, name, position, role, status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'position',
    (new.raw_user_meta_data ->> 'role')::text,
    (new.raw_user_meta_data ->> 'status')::text
  );
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_create_personnel ON auth.users;
CREATE TRIGGER on_auth_user_created_create_personnel
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_personnel();