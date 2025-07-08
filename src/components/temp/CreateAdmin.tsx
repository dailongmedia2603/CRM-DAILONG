import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export const CreateAdmin = () => {
  useEffect(() => {
    const createAdminUser = async () => {
      // This function will run only once when the component is mounted.
      const { data, error } = await supabase.functions.invoke('create-personnel-user', {
        body: { 
          email: 'huulong@dailongmedia.com', 
          password: 'dailongmedia@123',
          name: 'Huu Long (Admin)',
          position: 'Administrator',
          role: 'BOD',
          status: 'active',
        },
      });

      if (error || (data && data.error)) {
        // Check if the error is because the user already exists
        if (error?.message.includes('User already registered') || (data && data.error?.includes('User already registered'))) {
          showSuccess("Tài khoản admin đã tồn tại.");
        } else {
          showError("Lỗi khi tạo tài khoản admin: " + (error?.message || data.error));
        }
      } else {
        showSuccess("Tài khoản admin huulong@dailongmedia.com đã được tạo thành công!");
      }
    };

    createAdminUser();
  }, []);

  return null; // This component does not render anything visible
};