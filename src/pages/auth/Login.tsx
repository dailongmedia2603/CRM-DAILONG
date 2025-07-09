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
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel */}
        <div 
          className="hidden md:flex flex-col justify-center items-center p-12 text-white text-center"
          style={{
            background: 'linear-gradient(to right, #4facfe, #00f2fe)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <img src="https://i.postimg.cc/HxThpPbk/logo-vua-Seeding.png" alt="Vua Seeding Logo" className="w-auto h-auto max-w-sm" />
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center items-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng trở lại</h2>
            <p className="text-gray-500 mb-8">Đăng nhập để tiếp tục</p>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-bold" htmlFor="password">
                    Mật khẩu
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                    Quên mật khẩu?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

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
      </div>
    </div>
  );
};

export default LoginPage;