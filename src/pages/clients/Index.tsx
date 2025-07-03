import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import ClientCard from "@/components/clients/ClientCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search } from "lucide-react";
import { clientsData as initialClients, Client } from "@/data/clients";
import { getClients, setClients } from "@/utils/storage";
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
import { showSuccess } from "@/utils/toast";

const ClientsPage = () => {
  const [clients, setClientsState] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load clients from localStorage on initial render
  useEffect(() => {
    const storedClients = getClients();
    if (storedClients && storedClients.length > 0) {
      setClientsState(storedClients);
    } else {
      // If no clients in storage, use initial data and save it
      setClientsState(initialClients);
      setClients(initialClients);
    }
  }, []);

  // Filter clients based on search term and status filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- Handlers ---
  const handleOpenAddDialog = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleOpenDetailsDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleOpenDeleteAlert = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteAlertOpen(true);
  };

  const handleSaveClient = (clientToSave: Client) => {
    let updatedClients;
    if (clients.some(c => c.id === clientToSave.id)) {
      // Update existing client
      updatedClients = clients.map(c => c.id === clientToSave.id ? clientToSave : c);
      showSuccess("Client đã được cập nhật thành công!");
    } else {
      // Add new client
      updatedClients = [...clients, clientToSave];
      showSuccess("Client mới đã được thêm thành công!");
    }
    setClientsState(updatedClients);
    setClients(updatedClients); // Persist to localStorage
  };

  const handleDeleteConfirm = () => {
    if (!selectedClient) return;
    const updatedClients = clients.filter(c => c.id !== selectedClient.id);
    setClientsState(updatedClients);
    setClients(updatedClients); // Persist to localStorage
    setIsDeleteAlertOpen(false);
    setSelectedClient(null);
    showSuccess("Client đã được xóa.");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships
            </p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard 
              key={client.id} 
              {...client} 
              onEdit={handleOpenEditDialog}
              onDelete={handleOpenDeleteAlert}
              onViewDetails={handleOpenDetailsDialog}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No clients found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ClientFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveClient}
        client={selectedClient}
      />
      <ClientDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        client={selectedClient}
      />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn client
              "{selectedClient?.name}" khỏi hệ thống.
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