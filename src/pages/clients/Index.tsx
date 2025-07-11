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
import { Client, Project } from "@/types";
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth'>('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from("clients").select("*"),
      supabase.from("projects").select("client_id, contract_value")
    ]);

    if (clientsRes.error) {
      showError("Lỗi khi tải dữ liệu khách hàng.");
      console.error(clientsRes.error);
    } else {
      setClients(clientsRes.data as Client[]);
    }

    if (projectsRes.error) {
      showError("Lỗi khi tải dữ liệu dự án.");
      console.error(projectsRes.error);
    } else {
      setProjects(projectsRes.data as Project[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clientContractValues = useMemo(() => {
    const valueMap = new Map<string, number>();
    projects.forEach(project => {
      if (project.client_id) {
        const currentTotal = valueMap.get(project.client_id) || 0;
        valueMap.set(project.client_id, currentTotal + (project.contract_value || 0));
      }
    });
    return valueMap;
  }, [projects]);

  const creators = useMemo(() => {
    const creatorSet = new Set<string>();
    clients.forEach(client => {
      if (client.created_by) {
        creatorSet.add(client.created_by);
      }
    });
    return Array.from(creatorSet);
  }, [clients]);

  const filteredClients = useMemo(() => clients.filter((client) => {
    if (!!client.archived !== showArchived) return false;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      client.contact_person.toLowerCase().includes(lowerCaseSearchTerm) ||
      (client.industry && client.industry.toLowerCase().includes(lowerCaseSearchTerm));
    
    const matchesCreator = creatorFilter === "all" || client.created_by === creatorFilter;

    if (dateFilter === 'thisMonth') {
      if (!client.creation_date) return false;
      const now = new Date();
      const creationDate = new Date(client.creation_date);
      if (creationDate.getMonth() !== now.getMonth() || creationDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    return matchesSearch && matchesCreator;
  }), [clients, searchTerm, creatorFilter, showArchived, dateFilter]);

  const stats = useMemo(() => {
    const activeClients = clients.filter(c => !c.archived);
    const totalValue = Array.from(clientContractValues.values()).reduce((sum, value) => sum + value, 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const clientsThisMonth = activeClients.filter(c => {
      if (!c.creation_date) return false;
      const creationDate = new Date(c.creation_date);
      return creationDate.getMonth() === currentMonth && creationDate.getFullYear() === currentYear;
    });

    const valueThisMonth = clientsThisMonth.reduce((sum, client) => sum + (clientContractValues.get(client.id) || 0), 0);

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    
    return {
      totalClients: activeClients.length,
      totalContractValue: formatCurrency(totalValue),
      clientsThisMonth: clientsThisMonth.length,
      valueThisMonth: formatCurrency(valueThisMonth),
    };
  }, [clients, clientContractValues]);

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

  const handleSaveClient = async (clientToSave: Omit<Client, 'id' | 'profiles' | 'folders'>) => {
    if (clientToEdit) {
      const { error } = await supabase.from('clients').update(clientToSave).eq('id', clientToEdit.id);
      if (error) showError("Lỗi khi cập nhật client.");
      else showSuccess("Client đã được cập nhật!");
    } else {
      const { error } = await supabase.from('clients').insert([clientToSave]);
      if (error) showError("Lỗi khi thêm client mới.");
      else showSuccess("Client mới đã được thêm!");
    }
    fetchData();
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    const { error } = await supabase.from('clients').delete().eq('id', clientToDelete.id);
    if (error) showError("Lỗi khi xóa client.");
    else showSuccess("Client đã được xóa.");
    fetchData();
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
  };

  const handleBulkArchive = async () => {
    const { error } = await supabase.from('clients').update({ archived: true }).in('id', selectedClients);
    if (error) showError("Lỗi khi lưu trữ clients.");
    else showSuccess(`${selectedClients.length} client đã được lưu trữ.`);
    fetchData();
    setSelectedClients([]);
  };

  const handleBulkRestore = async () => {
    const { error } = await supabase.from('clients').update({ archived: false }).in('id', selectedClients);
    if (error) showError("Lỗi khi khôi phục clients.");
    else showSuccess(`${selectedClients.length} client đã được khôi phục.`);
    fetchData();
    setSelectedClients([]);
  };

  const handleBulkDeleteConfirm = async () => {
    const { error } = await supabase.from('clients').delete().in('id', selectedClients);
    if (error) showError("Lỗi khi xóa clients.");
    else showSuccess(`${selectedClients.length} client đã được xóa vĩnh viễn.`);
    fetchData();
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

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm client..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={creatorFilter} onValueChange={setCreatorFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tất cả người tạo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người tạo</SelectItem>
                {creators.map((creator) => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)} className="w-full md:w-auto">
              {showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {showArchived ? "Client hoạt động" : "Client lưu trữ"}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {selectedClients.length > 0 && (
                <>
                  {showArchived ? (
                    <Button variant="outline" size="sm" onClick={handleBulkRestore}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Khôi phục ({selectedClients.length})
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      Lưu trữ ({selectedClients.length})
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteAlertOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa ({selectedClients.length})
                  </Button>
                </>
              )}
            </div>
            <Button onClick={handleOpenAddDialog} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm Client
            </Button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><Checkbox checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead>Tên Client</TableHead>
                  <TableHead>Người liên hệ</TableHead>
                  <TableHead>Giá trị hợp đồng</TableHead>
                  <TableHead>Ngành</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center">Đang tải...</TableCell></TableRow>
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
                      <TableCell>{client.contact_person}</TableCell>
                      <TableCell>{formatCurrency(clientContractValues.get(client.id) || 0)}</TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell>{client.created_by}</TableCell>
                      <TableCell>{formatDate(client.creation_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100" asChild>
                            <Link to={`/clients/${client.id}`}><Eye className="h-4 w-4 text-blue-600" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100" onClick={() => handleOpenEditDialog(client)}>
                            <Pen className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleOpenDeleteAlert(client)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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