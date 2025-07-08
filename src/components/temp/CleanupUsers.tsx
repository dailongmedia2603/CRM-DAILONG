import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export const CleanupUsers = () => {
  useEffect(() => {
    const cleanup = async () => {
      const { data, error } = await supabase.functions.invoke('cleanup-auth-users');
      if (error) {
        showError(`Lỗi khi dọn dẹp: ${error.message}`);
      } else {
        showSuccess(data.message || "Quá trình dọn dẹp hoàn tất.");
      }
    };
    
    // We add a confirmation to prevent accidental runs in the future.
    // In a real scenario, this would be triggered by a button in an admin panel.
    if (confirm("Bạn có muốn chạy chức năng dọn dẹp tài khoản người dùng không? Hành động này không thể hoàn tác.")) {
        cleanup();
    }

  }, []);

  return null; // This component renders nothing.
};