import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PlusCircle,
  Search,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  Pen,
  Trash2,
  ExternalLink,
  Archive,
  RotateCcw,
  List,
} from "lucide-react";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
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
import { showSuccess, showError } from "@/utils/toast";
import { Client } from "@/data/clients";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const ClientStatsCard = ({ icon, title, value, subtitle, iconBgColor, onClick, isActive }: { icon: React.ElementType, title: string, value: string, subtitle: string, iconBgColor: string, onClick?: () => void, isActive?: boolean }) => {
  const Icon = icon;
  return (
    <Card 
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        isActive && "ring-2 ring-blue-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardContent>
    </Card>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth'>('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*");
    if (error) {
      showError("Lỗi khi tải dữ liệu khách hàng.");
      console.error(error);
    } else {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => clients.filter((client) => {
    if (!!client.archived !== showArchived) return false;
    
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;

    if (dateFilter === 'thisMonth') {
      if (!client.creationDate) return false;
      const now = new Date();
      const creationDate = new Date(client.creationDate);
      if (creationDate.getMonth() !== now.getMonth() || creationDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    return matchesSearch && matchesStatus;
  }), [clients, searchTerm, statusFilter, showArchived, dateFilter]);

  const stats = useMemo(() => {
    const activeClients = clients.filter(c => !c.archived);
    const totalValue = activeClients.reduce((sum, client) => sum + (Number(client.contractValue) || 0), 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const clientsThisMonth = activeClients.filter(c => {
      if (!c.creationDate) return false;
      const creationDate = new Date(c.creationDate);
      return creationDate.getMonth() === currentMonth && creationDate.getFullYear() === currentYear;
    });

    const valueThisMonth = clientsThisMonth.reduce((sum, client) => sum + (Number(client.contractValue) || 0), 0);

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    
    return {
      totalClients: activeClients.length,
      totalContractValue: formatCurrency(totalValue),
      clientsThisMonth: clientsThisMonth.length,
      valueThisMonth: formatCurrency(valueThisMonth),
    };
  }, [clients]);

  const handleOpenAddDialog = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleOpenDeleteAlert = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteAlertOpen(true);
  };

  const handleSaveClient = async (clientToSave: Omit<Client, 'id' | 'profiles'>) => {
    if (clientToEdit) {
      const { error } = await supabase.from('clients').update(clientToSave).eq('id', clientToEdit.id);
      if (error) showError("Lỗi khi cập nhật client.");
      else showSuccess("Client đã được cập nhật!");
    } else {
      const { error } = await supabase.from('clients').insert([clientToSave]);
      if (error) showError("Lỗi khi thêm client mới.");
      else showSuccess("Client mới đã được thêm!");
    }
    fetchClients();
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    const { error } = await supabase.from('clients').delete().eq('id', clientToDelete.id);
    if (error) showError("Lỗi khi xóa client.");
    else showSuccess("Client đã được xóa.");
    fetchClients();
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
  };

  const handleBulkArchive = async () => {
    const { error } = await supabase.from('clients').update({ archived: true }).in('id', selectedClients);
    if (error) showError("Lỗi khi lưu trữ clients.");
    else showSuccess(`${selectedClients.length} client đã được lưu trữ.`);
    fetchClients();
    setSelectedClients([]);
  };

  const handleBulkRestore = async () => {
    const { error } = await supabase.from('clients').update({ archived: false }).in('id', selectedClients);
    if (error) showError("Lỗi khi khôi phục clients.");
    else showSuccess(`${selectedClients.length} client đã được khôi phục.`);
    fetchClients();
    setSelectedClients([]);
  };

  const handleBulkDeleteConfirm = async () => {
    const { error } = await supabase.from('clients').delete().in('id', selectedClients);
    if (error) showError("Lỗi khi xóa clients.");
    else showSuccess(`${selectedClients.length} client đã được xóa vĩnh viễn.`);
    fetchClients();
    setSelectedClients([]);
    setIsBulkDeleteAlertOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedClients(checked ? filteredClients.map(c => c.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedClients(
      checked ? [...selectedClients, id] : selectedClients.filter(cId => cId !== id)
    );
  };
  
  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('vi-VN');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Client</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách khách hàng đã ký hợp đồng
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ClientStatsCard icon={FileText} title="Tổng Client" value={stats.totalClients.toString()} subtitle="Tổng khách hàng" iconBgColor="bg-blue-500" onClick={() => setDateFilter('all')} isActive={dateFilter === 'all'} />
          <ClientStatsCard icon={DollarSign} title="Giá trị hợp đồng" value={stats.totalContractValue} subtitle="Tổng giá trị" iconBgColor="bg-green-500" />
          <ClientStatsCard icon={Calendar} title="Client trong tháng" value={stats.clientsThisMonth.toString()} subtitle="Tháng này" iconBgColor="bg-purple-500" onClick={() => setDateFilter('thisMonth')} isActive={dateFilter === 'thisMonth'} />
          <ClientStatsCard icon={FileText} title="Giá trị HĐ tháng" value={stats.valueThisMonth} subtitle="Tháng này" iconBgColor="bg-orange-500" />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm client..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {showArchived ? "Client hoạt động" : "Client lưu trữ"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {selectedClients.length > 0 && (
              <>
                {showArchived ? (
                  <Button variant="outline" onClick={handleBulkRestore}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Khôi phục ({selectedClients.length})
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleBulkArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Lưu trữ ({selectedClients.length})
                  </Button>
                )}
                <Button variant="destructive" onClick={() => setIsBulkDeleteAlertOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa ({selectedClients.length})
                </Button>
              </>
            )}
            <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm Client
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><Checkbox checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>Tên Client</TableHead>
                <TableHead>Người liên hệ</TableHead>
                <TableHead>Giá trị hợp đồng</TableHead>
                <TableHead>Link hợp đồng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell><Checkbox checked={selectedClients.includes(client.id)} onCheckedChange={(checked) => handleSelectRow(client.id, !!checked)} /></TableCell>
                    <TableCell>
                      <Link to={`/clients/${client.id}`} className="flex items-center hover:underline">
                        <Avatar className="h-8 w-8 mr-3 bg-blue-100 text-blue-600">
                          <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{formatCurrency(client.contractValue)}</TableCell>
                    <TableCell>
                      <a href={client.contractLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Xem hợp đồng
                      </a>
                    </TableCell>
                    <TableCell>{formatDate(client.creationDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/clients/${client.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(client)}><Pen className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(client)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <ClientFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveClient}
        client={clientToEdit}
      />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Client "{clientToDelete?.name}" sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn {selectedClients.length} client đã chọn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ClientsPage;