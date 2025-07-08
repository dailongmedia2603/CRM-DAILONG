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
        .select('position_id')
        .eq('id', session.user.id)
        .single();

      if (personnelError || !personnelData || !personnelData.position_id) {
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      // Step 1: Fetch permission IDs for the user's position
      const { data: positionPermsData, error: positionPermsError } = await supabase
        .from('position_permissions')
        .select('permission_id')
        .eq('position_id', personnelData.position_id);

      if (positionPermsError || !positionPermsData) {
        console.error('Error fetching position permissions:', positionPermsError);
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      const permissionIds = positionPermsData.map(p => p.permission_id);

      if (permissionIds.length === 0) {
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      // Step 2: Fetch the names of those permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('name')
        .in('id', permissionIds);

      if (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
        setPermissions(new Set());
      } else {
        const perms = permissionsData.map(p => p.name).filter(Boolean) as string[];
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