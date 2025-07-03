import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog";
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
import { showSuccess } from "@/utils/toast";
import { getClients, setClients } from "@/utils/storage";
import { clientsData as initialClients, Client } from "@/data/clients";
import { cn } from "@/lib/utils";

const ClientStatsCard = ({ icon, title, value, subtitle, iconBgColor }: { icon: React.ElementType, title: string, value: string, subtitle: string, iconBgColor: string }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
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
  const [clients, setClientsState] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToView, setClientToView] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    const storedClients = getClients();
    if (storedClients && storedClients.length > 0) {
      setClientsState(storedClients);
    } else {
      setClientsState(initialClients);
      setClients(initialClients);
    }
  }, []);

  const filteredClients = useMemo(() => clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [clients, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalValue = clients.reduce((sum, client) => sum + client.contractValue, 0);
    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    return {
      totalClients: clients.length,
      totalContractValue: formatCurrency(totalValue),
      clientsThisMonth: 0, // Placeholder
      valueThisMonth: formatCurrency(0), // Placeholder
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
  
  const handleOpenViewDialog = (client: Client) => {
    setClientToView(client);
    setIsDetailsOpen(true);
  };

  const handleSaveClient = (clientToSave: Client) => {
    let updatedClients;
    if (clients.some(c => c.id === clientToSave.id)) {
      updatedClients = clients.map(c => c.id === clientToSave.id ? clientToSave : c);
      showSuccess("Client đã được cập nhật!");
    } else {
      updatedClients = [...clients, clientToSave];
      showSuccess("Client mới đã được thêm!");
    }
    setClientsState(updatedClients);
    setClients(updatedClients);
  };

  const handleDeleteConfirm = () => {
    if (!clientToDelete) return;
    const updatedClients = clients.filter(c => c.id !== clientToDelete.id);
    setClientsState(updatedClients);
    setClients(updatedClients);
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
    showSuccess("Client đã được xóa.");
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedClients(checked ? filteredClients.map(c => c.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedClients(
      checked ? [...selectedClients, id] : selectedClients.filter(cId => cId !== id)
    );
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

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
          <ClientStatsCard icon={FileText} title="Tổng Client" value={stats.totalClients.toString()} subtitle="Tổng khách hàng" iconBgColor="bg-blue-500" />
          <ClientStatsCard icon={DollarSign} title="Giá trị hợp đồng" value={stats.totalContractValue} subtitle="Tổng giá trị" iconBgColor="bg-green-500" />
          <ClientStatsCard icon={Calendar} title="Client trong tháng" value={stats.clientsThisMonth.toString()} subtitle="Tháng này" iconBgColor="bg-purple-500" />
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
          </div>
          <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Client
          </Button>
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
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell><Checkbox checked={selectedClients.includes(client.id)} onCheckedChange={(checked) => handleSelectRow(client.id, !!checked)} /></TableCell>
                  <TableCell className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3 bg-blue-100 text-blue-600">
                      <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {client.name}
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
                      <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(client)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(client)}><Pen className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(client)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
      <ClientDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        client={clientToView}
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
    </MainLayout>
  );
};

export default ClientsPage;