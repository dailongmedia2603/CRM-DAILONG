import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';

const LoginPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div 
          className="p-12 flex-col justify-center items-center hidden md:flex"
          style={{
            backgroundImage: "url('https://i.postimg.cc/GmVcvK76/Logo-Dai-Long-Media-dark.jpg')",
            backgroundColor: '#002c47',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '12rem' // Tương đương với class w-48
          }}
        >
          {/* Logo giờ là hình nền của khung này */}
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Đăng nhập CRM Vua Seeding</h2>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            view="sign_in"
            showLinks={false}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;