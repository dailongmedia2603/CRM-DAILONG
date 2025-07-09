import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Position, Permission } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const translationMap: { [key: string]: string } = {
  // Modules
  clients: "Khách hàng",
  dashboard: "Bảng điều khiển",
  hr: "Nhân sự",
  intern_tasks: "Việc Thực tập sinh",
  leads: "Bán hàng (Leads)",
  permissions: "Phân quyền",
  projects: "Dự án",
  reports: "Báo cáo & Phân tích",

  // Actions
  create: "Tạo mới",
  delete: "Xóa",
  edit: "Chỉnh sửa",
  view: "Xem",
  manage: "Quản lý",
};

const translate = (key: string) => translationMap[key] || key.charAt(0).toUpperCase() + key.slice(1);

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
  const [positions, setPositions] = useState<Position[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  const [positionPermissions, setPositionPermissions] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [positionsRes, permissionsRes] = await Promise.all([
        supabase.from('positions').select('*'),
        supabase.from('permissions').select('*').order('name'),
      ]);

      if (positionsRes.error) showError('Lỗi khi tải danh sách vị trí.');
      else setPositions(positionsRes.data);

      if (permissionsRes.error) showError('Lỗi khi tải danh sách quyền.');
      else setPermissions(permissionsRes.data);
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedPositionId) {
        setPositionPermissions(new Set());
        return;
    };

    const fetchPositionPermissions = async () => {
      const { data, error } = await supabase
        .from('position_permissions')
        .select('permission_id')
        .eq('position_id', selectedPositionId);

      if (error) {
        showError('Lỗi khi tải quyền của vị trí.');
        setPositionPermissions(new Set());
      } else {
        setPositionPermissions(new Set(data.map(p => p.permission_id)));
      }
    };
    fetchPositionPermissions();
  }, [selectedPositionId]);

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    const newPermissions = new Set(positionPermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setPositionPermissions(newPermissions);
  };

  const handleSelectAllModule = (perms: Permission[], checked: boolean) => {
    const newPermissions = new Set(positionPermissions);
    perms.forEach(perm => {
      if (checked) {
        newPermissions.add(perm.id);
      } else {
        newPermissions.delete(perm.id);
      }
    });
    setPositionPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedPositionId) {
      showError('Vui lòng chọn một vị trí để cập nhật.');
      return;
    }
    setIsSaving(true);

    const { error: deleteError } = await supabase
      .from('position_permissions')
      .delete()
      .eq('position_id', selectedPositionId);

    if (deleteError) {
      showError('Lỗi khi xóa quyền cũ: ' + deleteError.message);
      setIsSaving(false);
      return;
    }

    const newPermissionsToInsert = Array.from(positionPermissions).map(permissionId => ({
      position_id: selectedPositionId,
      permission_id: permissionId,
    }));

    if (newPermissionsToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from('position_permissions')
            .insert(newPermissionsToInsert);

        if (insertError) {
            showError('Lỗi khi cập nhật quyền mới: ' + insertError.message);
            setIsSaving(false);
            return;
        }
    }

    showSuccess('Đã cập nhật quyền cho vị trí thành công!');
    setIsSaving(false);
  };

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Phân quyền theo Vị trí</CardTitle>
        <CardDescription>Chọn một vị trí và cấp các quyền hạn tương ứng. Các thay đổi sẽ được áp dụng cho tất cả nhân sự thuộc vị trí đó.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-grow">
            <Label>Chọn vị trí cần phân quyền</Label>
            <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
              <SelectTrigger className="w-full sm:w-[280px] mt-1">
                <SelectValue placeholder="Chọn một vị trí..." />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPositionId && !isLoading && (
            <Button onClick={handleSavePermissions} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-20" /></div>
                  <div className="flex items-center space-x-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-20" /></div>
                  <div className="flex items-center space-x-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-20" /></div>
                  <div className="flex items-center space-x-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-20" /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedPositionId && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {Object.entries(groupedPermissions).map(([module, perms]) => {
              const allModulePermsChecked = perms.every(p => positionPermissions.has(p.id));
              const someModulePermsChecked = perms.some(p => positionPermissions.has(p.id)) && !allModulePermsChecked;

              return (
                <Card key={module} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{translate(module)}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-all-${module}`}
                          checked={allModulePermsChecked ? true : someModulePermsChecked ? 'indeterminate' : false}
                          onCheckedChange={(checked) => handleSelectAllModule(perms, !!checked)}
                        />
                        <Label htmlFor={`select-all-${module}`} className="text-sm font-normal">Tất cả</Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {perms.map(perm => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={positionPermissions.has(perm.id)}
                          onCheckedChange={(checked) => handlePermissionChange(perm.id, !!checked)}
                        />
                        <Label
                          htmlFor={`perm-${perm.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {translate(perm.name.split('.')[1])}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};