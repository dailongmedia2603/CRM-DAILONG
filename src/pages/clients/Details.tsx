import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, DollarSign, Briefcase, FileText } from "lucide-react";
import { Client, Project } from "@/data/clients";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ProfileList } from "@/components/clients/ProfileList";
import { showSuccess } from "@/utils/toast";
import { getClients, setClients, getProjects } from "@/utils/storage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const InfoField = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="font-medium">{value || "Chưa có"}</p>
  </div>
);

const ClientDetailsPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);

  useEffect(() => {
    const allClients = getClients() || [];
    const currentClient = allClients.find((c: Client) => c.id === clientId);
    
    if (currentClient) {
      setClient(currentClient);
      const allProjects = getProjects() || [];
      const projectsForClient = allProjects.filter(
        (p: Project) => p.client === currentClient.companyName
      );
      setClientProjects(projectsForClient);
    } else {
      navigate("/clients");
    }
  }, [clientId, navigate]);

  const handleUpdateClient = (updatedClient: Client) => {
    const allClients = getClients() || [];
    const clientExists = allClients.some((c: Client) => c.id === updatedClient.id);

    let updatedClients;
    if (clientExists) {
        updatedClients = allClients.map((c: Client) =>
            c.id === updatedClient.id ? updatedClient : c
        );
    } else {
        updatedClients = [...allClients, updatedClient];
    }
    
    setClients(updatedClients);
    setClient(updatedClient);
  };

  const handleSaveClientForm = (clientToSave: Client) => {
    handleUpdateClient(clientToSave);
    showSuccess("Thông tin client đã được cập nhật!");
  };

  const projectStats = useMemo(() => {
    const totalValue = clientProjects.reduce((sum, p) => sum + Number(p.contractValue || 0), 0);
    return {
      count: clientProjects.length,
      totalValue: totalValue,
    };
  }, [clientProjects]);

  if (!client) {
    return <MainLayout><div>Loading...</div></MainLayout>;
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate("/clients")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết Client</h1>
          <p className="text-muted-foreground">Thông tin chi tiết và quản lý client</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Client Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 text-3xl">
                  <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </CardContent>
              <CardContent className="space-y-4">
                <InfoField label="Tên Client" value={client.name} />
                <InfoField label="Người liên hệ" value={client.contactPerson} />
                <InfoField label="Email" value={client.email} />
                <InfoField label="Mail nhận hoá đơn" value={client.invoiceEmail || "Chưa có"} />
                <InfoField label="Giá trị hợp đồng" value={formatCurrency(client.contractValue)} />
                <InfoField label="Phân loại" value={client.classification || "Chưa có"} />
                <InfoField label="Nguồn" value={client.source || "Chưa có"} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">
                  <FileText className="mr-2 h-4 w-4" /> Tổng quan
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Briefcase className="mr-2 h-4 w-4" /> Dự án ({projectStats.count})
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <FileText className="mr-2 h-4 w-4" /> Hồ sơ ({client.profiles?.length || 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Giá trị hợp đồng</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-700" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">{formatCurrency(projectStats.totalValue)}</div>
                        <p className="text-xs text-green-700">Tổng giá trị từ các dự án</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                       <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Dự án</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-700" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{projectStats.count}</div>
                        <p className="text-xs text-blue-700">Tổng số dự án</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Dự án gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {clientProjects.length > 0 ? (
                        <div className="space-y-4">
                          {clientProjects.slice(0, 5).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                              <div>
                                <Link to={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>
                                <p className="text-sm text-muted-foreground">Hạn chót: {new Date(project.dueDate).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <Badge variant="outline" className={cn({"bg-cyan-100 text-cyan-800 border-cyan-200": project.status === "in-progress", "bg-green-100 text-green-800 border-green-200": project.status === "completed", "bg-amber-100 text-amber-800 border-amber-200": project.status === "planning", "bg-red-100 text-red-800 border-red-200": project.status === "overdue"})}>
                                {project.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48">
                          <Briefcase className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Chưa có dự án nào</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="projects" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách dự án</CardTitle>
                  </CardHeader>
                  <CardContent>
                      {clientProjects.length > 0 ? (
                        <div className="space-y-4">
                          {clientProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                              <div>
                                <Link to={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>
                                <p className="text-sm text-muted-foreground">Hạn chót: {new Date(project.dueDate).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <Badge variant="outline" className={cn({"bg-cyan-100 text-cyan-800 border-cyan-200": project.status === "in-progress", "bg-green-100 text-green-800 border-green-200": project.status === "completed", "bg-amber-100 text-amber-800 border-amber-200": project.status === "planning", "bg-red-100 text-red-800 border-red-200": project.status === "overdue"})}>
                                {project.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48">
                          <Briefcase className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">Chưa có dự án nào</p>
                        </div>
                      )}
                    </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="profile" className="mt-4">
                <ProfileList client={client} onUpdateClient={handleUpdateClient} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <ClientFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveClientForm}
        client={client}
      />
    </MainLayout>
  );
};

export default ClientDetailsPage;