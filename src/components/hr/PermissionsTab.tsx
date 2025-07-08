import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Role, Permission } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

// Helper to group permissions by module (e.g., 'clients.view' -> 'clients')
const groupPermissions = (permissions: Permission[]) => {
  const grouped: { [key: string]: Permission[] } = {};
  permissions.forEach(p => {
    const module = p.name.split('.')[0];
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(p);
  });
  return grouped;
};

export const PermissionsTab = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all roles and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        supabase.from('roles').select('*'),
        supabase.from('permissions').select('*').order('name'),
      ]);

      if (rolesRes.error) showError('Lỗi khi tải danh sách vai trò.');
      else setRoles(rolesRes.data);

      if (permissionsRes.error) showError('Lỗi khi tải danh sách quyền.');
      else setPermissions(permissionsRes.data);
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Fetch permissions for the selected role
  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchRolePermissions = async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', selectedRoleId);

      if (error) {
        showError('Lỗi khi tải quyền của vai trò.');
        setRolePermissions(new Set());
      } else {
        setRolePermissions(new Set(data.map(p => p.permission_id)));
      }
    };
    fetchRolePermissions();
  }, [selectedRoleId]);

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const newPermissions = new Set(rolePermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setRolePermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) {
      showError('Vui lòng chọn một vai trò để cập nhật.');
      return;
    }
    setIsSaving(true);

    // Delete all existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', selectedRoleId);

    if (deleteError) {
      showError('Lỗi khi xóa quyền cũ: ' + deleteError.message);
      setIsSaving(false);
      return;
    }

    // Insert the new set of permissions
    const newPermissionsToInsert = Array.from(rolePermissions).map(permissionId => ({
      role_id: parseInt(selectedRoleId),
      permission_id: permissionId,
    }));

    if (newPermissionsToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(newPermissionsToInsert);

        if (insertError) {
            showError('Lỗi khi cập nhật quyền mới: ' + insertError.message);
            setIsSaving(false);
            return;
        }
    }

    showSuccess('Đã cập nhật quyền cho vai trò thành công!');
    setIsSaving(false);
  };

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân quyền theo Vị trí</CardTitle>
        <CardDescription>Chọn một vị trí và cấp các quyền hạn tương ứng. Các thay đổi sẽ được áp dụng cho tất cả nhân sự thuộc vị trí đó.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Chọn vị trí cần phân quyền</Label>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Chọn một vị trí..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        )}

        {selectedRoleId && !isLoading && (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module}>
                <h4 className="font-semibold text-lg capitalize mb-3 border-b pb-2">{module}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {perms.map(perm => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={rolePermissions.has(perm.id)}
                        onCheckedChange={(checked) => handlePermissionChange(perm.id, !!checked)}
                      />
                      <label
                        htmlFor={`perm-${perm.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {perm.name.split('.')[1]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4">
                <Button onClick={handleSavePermissions} disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};