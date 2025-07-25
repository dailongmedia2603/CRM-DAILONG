import { createContext, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  session: Session | null | undefined; // Allow undefined during initial load
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

const fetchSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: session, isLoading: loading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity, // Dữ liệu session sẽ được coi là mới mãi mãi
    gcTime: Infinity,    // và không bị dọn dẹp khỏi cache
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Khi trạng thái đăng nhập thay đổi (đăng nhập/đăng xuất),
      // cập nhật trực tiếp dữ liệu trong cache của React Query.
      queryClient.setQueryData(['session'], session);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};