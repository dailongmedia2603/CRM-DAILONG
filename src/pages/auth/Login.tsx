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
        <div className="bg-blue-600 text-white p-12 flex-col justify-center items-start hidden md:flex">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-bold text-2xl">A</span>
            </div>
            <span className="text-3xl font-bold">Agency CRM</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Your place to work.</h1>
          <p className="text-2xl font-light text-blue-100">Plan. Create. Control.</p>
          <div className="mt-8 w-full">
            <img src="https://i.imgur.com/sC22T6A.png" alt="Kanban board illustration" className="w-full h-auto" />
          </div>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In to Agency CRM</h2>
          <p className="text-gray-500 mb-8">Enter your details below.</p>
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