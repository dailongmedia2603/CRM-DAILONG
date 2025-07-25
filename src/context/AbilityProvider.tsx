import { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';

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

const fetchPermissions = async (session: Session | null | undefined): Promise<Set<string>> => {
  if (!session?.user) {
    return new Set<string>();
  }

  const { data: personnelData, error: personnelError } = await supabase
    .from('personnel')
    .select('role, position_id')
    .eq('id', session.user.id)
    .single();

  if (personnelError || !personnelData) {
    console.error('Error fetching personnel data for permissions:', personnelError);
    return new Set<string>();
  }

  if (personnelData.role === 'BOD' || personnelData.role === 'Quản lý') {
    const { data: allPermissions, error: allPermissionsError } = await supabase
      .from('permissions')
      .select('name');
    
    if (allPermissionsError) {
      console.error('Error fetching all permissions for admin:', allPermissionsError);
      return new Set<string>();
    }
    const perms = allPermissions.map(p => p.name).filter(Boolean) as string[];
    return new Set(perms);
  }

  if (!personnelData.position_id) {
    return new Set<string>();
  }

  const { data: positionPermsData, error: positionPermsError } = await supabase
    .from('position_permissions')
    .select('permission_id')
    .eq('position_id', personnelData.position_id);

  if (positionPermsError || !positionPermsData) {
    console.error('Error fetching position permissions:', positionPermsError);
    return new Set<string>();
  }

  const permissionIds = positionPermsData.map(p => p.permission_id);
  if (permissionIds.length === 0) {
    return new Set<string>();
  }

  const { data: permissionsData, error: permissionsError } = await supabase
    .from('permissions')
    .select('name')
    .in('id', permissionIds);

  if (permissionsError) {
    console.error('Error fetching permissions:', permissionsError);
    return new Set<string>();
  }
  
  const perms = permissionsData.map(p => p.name).filter(Boolean) as string[];
  return new Set(perms);
};

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
  const { session, loading: authLoading } = useAuth();

  const { data: permissions, isLoading: abilityLoading } = useQuery({
    queryKey: ['permissions', session?.user?.id],
    queryFn: () => fetchPermissions(session),
    enabled: !authLoading, // Chỉ chạy khi đã xác thực xong
    staleTime: 1000 * 60 * 5, // Cache quyền trong 5 phút
  });

  const can = (permission: string) => {
    return permissions?.has(permission) ?? false;
  };

  return (
    <AbilityContext.Provider value={{ permissions: permissions || new Set(), can, loading: abilityLoading }}>
      {children}
    </AbilityContext.Provider>
  );
};