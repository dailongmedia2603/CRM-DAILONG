import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, MoreHorizontal, Users, UserCheck, UserX } from "lucide-react";
import { Personnel, Position } from "@/types";
import { PersonnelFormDialog } from "@/components/hr/PersonnelFormDialog";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionConfigTab } from '@/components/hr/PositionConfigTab';
import { PermissionsTab } from '@/components/hr/PermissionsTab';
import { supabase } from "@/integrations/supabase/client";
import { Can } from "@/components/auth/Can";

const HRStatsCard = ({ icon, title, value, subtitle, iconBgColor }: { icon: React.ElementType, title: string, value: string, subtitle: string, iconBgColor: string }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const HRPage = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [personnelToEdit, setPersonnelToEdit] = useState<Personnel | null>(null);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);

  const fetchPersonnel = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("personnel").select("*");
    if (error) showError("Lỗi khi tải dữ liệu nhân sự.");
    else setPersonnel(data as Personnel[]);
    setLoading(false);
  };

  const fetchPositions = async () => {
    const { data, error } = await supabase.from("positions").select("*");
    if (error) showError("Lỗi khi tải dữ liệu vị trí.");
    else setPositions(data as Position[]);
  };

  useEffect(() => {
    fetchPersonnel();
    fetchPositions();
  }, []);

  const handlePositionsChange = async (newPositions: string[]) => {
    const { error: deleteError } = await supabase.from('positions').delete().neq('name', 'dummy_value_to_delete_all');
    if (deleteError) {
      showError("Lỗi khi xóa vị trí cũ.");
      return;
    }
    const { error: insertError } = await supabase.from('positions').insert(newPositions.map(name => ({ name })));
    if (insertError) {
      showError("Lỗi khi lưu vị trí mới.");
      return;
    }
    fetchPositions();
  };

  const filteredPersonnel = useMemo(() =>
    personnel.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.position.toLowerCase().includes(searchTerm.toLowerCase())
    ), [personnel, searchTerm]);

  const stats = useMemo(() => ({
    total: personnel.length,
    active: personnel.filter(p => p.status === 'active').length,
    inactive: personnel.filter(p => p.status === 'inactive').length,
  }), [personnel]);

  const handleOpenAddDialog = () => {
    setPersonnelToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (p: Personnel) => {
    setPersonnelToEdit(p);
    setIsFormOpen(true);
  };

  const handleOpenDeleteAlert = (p: Personnel) => {
    setPersonnelToDelete(p);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!personnelToDelete) return;
    const { error } = await supabase.from('personnel').delete().eq('id', personnelToDelete.id);
    if (error) showError("Lỗi khi xóa nhân sự.");
    else showSuccess("Đã xóa nhân sự.");
    fetchPersonnel();
    setIsDeleteAlertOpen(false);
    setPersonnelToDelete(null);
  };

  const getRoleBadge = (role: Personnel['role']) => {
    switch (role) {
      case 'BOD': return "bg-red-100 text-red-800";
      case 'Quản lý': return "bg-purple-100 text-purple-800";
      case 'Nhân viên': return "bg-blue-100 text-blue-800";
      case 'Thực tập': return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Nhân sự</h1>
          <p className="text-muted-foreground">Xem, thêm, sửa, và xóa thông tin nhân sự.</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Danh sách nhân sự</TabsTrigger>
            <TabsTrigger value="config">Cấu hình vị trí</TabsTrigger>
            <Can I="permissions.view"><TabsTrigger value="permissions">Phân quyền</TabsTrigger></Can>
          </TabsList>
          <TabsContent value="list" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <HRStatsCard icon={Users} title="Tổng số Nhân sự" value={stats.total.toString()} subtitle="Tổng số nhân viên" iconBgColor="bg-blue-500" />
              <HRStatsCard icon={UserCheck} title="Đang hoạt động" value={stats.active.toString()} subtitle="Nhân viên đang làm việc" iconBgColor="bg-green-500" />
              <HRStatsCard icon={UserX} title="Ngừng hoạt động" value={stats.inactive.toString()} subtitle="Nhân viên đã nghỉ" iconBgColor="bg-gray-500" />
            </div>

            <div className="flex justify-between items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm theo tên, email, vị trí..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Can I="hr.create">
                <Button onClick={handleOpenAddDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm Nhân sự
                </Button>
              </Can>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Cấp bậc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow> :
                  filteredPersonnel.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar><AvatarImage src={p.avatar} /><AvatarFallback>{p.name.charAt(0)}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm text-muted-foreground">{p.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.position}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("capitalize", getRoleBadge(p.role))}>{p.role}</Badge></TableCell>
                      <TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'} className={cn("capitalize", p.status === 'active' ? 'bg-green-500' : '')}>{p.status === 'active' ? 'Hoạt động' : 'Ngừng'}</Badge></TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <Can I="hr.edit"><DropdownMenuItem onClick={() => handleOpenEditDialog(p)}>Sửa</DropdownMenuItem></Can>
                            <Can I="hr.delete"><DropdownMenuItem onClick={() => handleOpenDeleteAlert(p)} className="text-red-500">Xóa</DropdownMenuItem></Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="config" className="mt-6">
            <PositionConfigTab positions={positions.map(p => p.name)} onPositionsChange={handlePositionsChange} />
          </TabsContent>
          <Can I="permissions.view">
            <TabsContent value="permissions" className="mt-6">
              <PermissionsTab />
            </TabsContent>
          </Can>
        </Tabs>
      </div>

      <PersonnelFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={fetchPersonnel}
        personnel={personnelToEdit}
        positions={positions}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Nhân sự "{personnelToDelete?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default HRPage;