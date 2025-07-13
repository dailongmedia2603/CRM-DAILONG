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
        .select('role, position_id')
        .eq('id', session.user.id)
        .single();

      if (personnelError || !personnelData) {
        console.error('Error fetching personnel data:', personnelError);
        setPermissions(new Set());
        setLoading(false);
        return;
      }

      // Special case for BOD and Manager roles - grant all permissions
      if (personnelData.role === 'BOD' || personnelData.role === 'Quản lý') {
        const { data: allPermissions, error: allPermissionsError } = await supabase
          .from('permissions')
          .select('name');
        
        if (allPermissionsError) {
          console.error('Error fetching all permissions for admin:', allPermissionsError);
          setPermissions(new Set());
        } else {
          const perms = allPermissions.map(p => p.name).filter(Boolean) as string[];
          setPermissions(new Set(perms));
        }
        setLoading(false);
        return;
      }

      // Existing logic for other roles based on position
      if (!personnelData.position_id) {
        setPermissions(new Set());
        setLoading(false);
        return;
      }

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
      {children}
    </AbilityContext.Provider>
  );
};