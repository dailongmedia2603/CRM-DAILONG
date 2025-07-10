import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1E2856] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <img src="https://i.postimg.cc/t4BcyRxB/logo-vua-Seeding-white.png" alt="Logo" className="mx-auto mb-4 h-16" />
        <h2 className="text-xl text-white/80 mb-8 font-light">CRM DAILONG MEDIA - Phần mềm nội bộ</h2>

        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h3>
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                className="mt-2 h-12 rounded-lg"
                required
              />
            </div>
            <div>
              <Label htmlFor="password"  className="text-sm font-medium text-gray-600">Mật khẩu</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ghi nhớ tôi</Label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3F8CFF] hover:bg-[#3578E0] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center h-12 text-base"
            >
              {loading ? 'Đang xử lý...' : (
                <>
                  Đăng nhập <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;