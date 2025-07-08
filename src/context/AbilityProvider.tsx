import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';

interface AbilityContextType {
  permissions: Set<string>;
  can: (permission: string) => boolean;
  loading: boolean;
}

const AbilityContext = createContext<AbilityContextType>({
  permissions: new Set(),
  can: () => false,
  loading: true,
});

export const useAbility = () => useContext(AbilityContext);

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
  const { session, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user) {
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: personnelData, error: personnelError } = await supabase
        .from('personnel')
        .select('role_id')
        .eq('id', session.user.id)
        .single();

      if (personnelError || !personnelData || !personnelData.role_id) {
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      const { data: rolePermsData, error: rolePermsError } = await supabase
        .from('role_permissions')
        .select('permissions ( name )')
        .eq('role_id', personnelData.role_id);

      if (rolePermsError) {
        console.error('Error fetching permissions:', rolePermsError);
        setPermissions(new Set());
      } else {
        const perms = rolePermsData
          .map(p => (p.permissions as any)?.name) // Safely access the name property
          .filter(Boolean) as string[];
        setPermissions(new Set(perms));
      }
      
      setLoading(false);
    };

    if (!authLoading) {
      fetchPermissions();
    }
  }, [session, authLoading]);

  const can = (permission: string) => {
    return permissions.has(permission);
  };

  return (
    <AbilityContext.Provider value={{ permissions, can, loading }}>
      {!loading && children}
    </AbilityContext.Provider>
  );
};