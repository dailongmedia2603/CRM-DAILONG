import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NoAccessPage = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-4">Không có quyền truy cập</h1>
        <p className="text-muted-foreground mb-8">
          Tài khoản của bạn không có quyền truy cập vào bất kỳ trang nào. Vui lòng liên hệ quản trị viên.
        </p>
        <Button onClick={handleLogout}>Đăng xuất</Button>
      </div>
    </div>
  );
};

export default NoAccessPage;