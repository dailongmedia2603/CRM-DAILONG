import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthProvider';

const LoginPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email hoặc mật khẩu không chính xác.');
    } else {
      // The AuthProvider will detect the session change and navigate
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ backgroundColor: '#1E2856' }}
    >
      <div className="text-center mb-10">
        <img src="https://i.postimg.cc/yd5pF6wk/logo-vua-Seeding-white.png" alt="Vua Seeding Logo White" className="w-auto h-auto max-w-[250px] mx-auto" />
        <p className="text-white mt-4 text-lg font-light tracking-wider">CRM DAILONG MEDIA - Phần mềm nội bộ</p>
      </div>

      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-[#2a3469] bg-opacity-50 p-8 rounded-xl shadow-2xl">
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 rounded-lg bg-[#1E2856] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-300 text-sm font-bold" htmlFor="password">
                Mật khẩu
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
                Quên mật khẩu?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 rounded-lg bg-[#1E2856] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;