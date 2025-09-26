import { useState, useMemo, useEffect, createElement } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, Personnel } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog";
import { AcceptanceHistoryDialog } from "@/components/projects/AcceptanceHistoryDialog";
import { ExternalLink, History, Search, FileSignature, Send, Clock, CheckCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const acceptanceTabStatuses = {
  'Cần làm BBNT': { icon: FileSignature, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconBgColor: 'bg-blue-500' },
  'Chờ xác nhận file': { icon: Send, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconBgColor: 'bg-purple-500' },
  'Đã gởi bản cứng': { icon: Send, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', iconBgColor: 'bg-cyan-500' },
};

const paymentTabStatus = {
  'Đang chờ thanh toán': { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', iconBgColor: 'bg-amber-500' },
};

const allAcceptanceStatuses = {
  ...acceptanceTabStatuses,
  ...paymentTabStatus,
  'Đã nhận tiền': { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', iconBgColor: 'bg-green-500' },
};

const StatusCard = ({ icon, title, value, iconBgColor, onClick, isActive }: { icon: React.ElementType, title: string, value: string, iconBgColor: string, onClick: () => void, isActive: boolean }) => {
  const Icon = icon;
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isActive && `ring-2 ring-blue-500`
      )}
    >
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectAcceptanceTable = ({ projects, openDialog, handleStatusChange }: { projects: Project[], openDialog: (name: 'details' | 'history', project: Project) => void, handleStatusChange: (projectId: string, status: string) => void }) => {
  if (projects.length === 0) {
    return <div className="text-center text-muted-foreground p-8">Không có dự án nào.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên dự án</TableHead>
          <TableHead>Link nghiệm thu</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Lịch sử</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map(project => {
          const statusInfo = allAcceptanceStatuses[(project.acceptance_status || 'Cần làm BBNT') as keyof typeof allAcceptanceStatuses] || allAcceptanceStatuses['Cần làm BBNT'];
          return (
            <TableRow key={project.id}>
              <TableCell>
                <Button variant="link" className="p-0 h-auto font-medium" onClick={() => openDialog('details', project)}>
                  {project.name}
                </Button>
              </TableCell>
              <TableCell>
                <a href={project.acceptance_link || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" /> Xem
                </a>
              </TableCell>
              <TableCell>
                <Select
                  value={project.acceptance_status || 'Cần làm BBNT'}
                  onValueChange={(value) => handleStatusChange(project.id, value)}
                >
                  <SelectTrigger className={cn("w-[200px] border", statusInfo.bgColor, statusInfo.borderColor)}>
                    <SelectValue asChild>
                      <div className={cn("flex items-center gap-2", statusInfo.color)}>
                        {statusInfo.icon && createElement(statusInfo.icon, { className: "h-4 w-4" })}
                        <span>{project.acceptance_status || 'Cần làm BBNT'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(allAcceptanceStatuses).map(([status, { icon, color }]) => (
                      <SelectItem key={status} value={status}>
                        <div className={cn("flex items-center gap-2", color)}>
                          {createElement(icon, { className: "h-4 w-4" })}
                          <span>{status}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog('history', project)}
                  className={cn(
                    project.acceptance_history && project.acceptance_history.length > 0 &&
                    "border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 animate-pulse"
                  )}
                >
                  <History className="mr-2 h-4 w-4" /> Lịch sử ({project.acceptance_history?.length || 0})
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const AcceptancePage = () => {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  const [acceptanceSearchTerm, setAcceptanceSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");

  const [dialogs, setDialogs] = useState({
    details: false,
    history: false,
  });

  const currentUser = useMemo(() => {
    if (session?.user && personnel.length > 0) {
      return personnel.find(p => p.id === session.user.id);
    }
    return null;
  }, [personnel, session]);

  const { acceptanceProjects, paymentProjects } = useMemo(() => {
    const acceptance: Project[] = [];
    const payment: Project[] = [];
    projects.forEach(p => {
      const status = p.acceptance_status || 'Cần làm BBNT';
      if (Object.keys(acceptanceTabStatuses).includes(status)) {
        acceptance.push(p);
      } else if (Object.keys(paymentTabStatus).includes(status)) {
        payment.push(p);
      }
    });
    return { acceptanceProjects: acceptance, paymentProjects: payment };
  }, [projects]);

  const filteredAcceptanceProjects = useMemo(() => {
    return acceptanceProjects.filter(project => {
      const searchMatch = project.name.toLowerCase().includes(acceptanceSearchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || (project.acceptance_status || 'Cần làm BBNT') === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [acceptanceProjects, acceptanceSearchTerm, statusFilter]);

  const filteredPaymentProjects = useMemo(() => {
    return paymentProjects.filter(project => 
      project.name.toLowerCase().includes(paymentSearchTerm.toLowerCase())
    );
  }, [paymentProjects, paymentSearchTerm]);

  const acceptanceStats = useMemo(() => {
    const statusCounts = Object.keys(acceptanceTabStatuses).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<string, number>);

    acceptanceProjects.forEach(project => {
      const status = project.acceptance_status || 'Cần làm BBNT';
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    });
    return statusCounts;
  }, [acceptanceProjects]);

  const fetchData = async () => {
    setIsLoading(true);
    const [projectsRes, personnelRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*, acceptance_history(*)')
        .not('acceptance_link', 'is', null)
        .order('created_at', { ascending: false }),
      supabase.from('personnel').select('*')
    ]);

    if (projectsRes.error) showError("Lỗi khi tải dự án.");
    else setProjects(projectsRes.data as any[]);

    if (personnelRes.error) showError("Lỗi khi tải nhân sự.");
    else setPersonnel(personnelRes.data);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDialog = (name: keyof typeof dialogs, project: Project) => {
    setActiveProject(project);
    setDialogs(prev => ({ ...prev, [name]: true }));
  };

  const closeDialog = (name: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [name]: false }));
    setActiveProject(null);
  };

  const handleStatusChange = async (projectId: string, status: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ acceptance_status: status })
      .eq('id', projectId);
    
    if (error) showError("Lỗi khi cập nhật trạng thái.");
    else {
      showSuccess("Đã cập nhật trạng thái.");
      fetchData();
    }
  };

  const handleAddHistory = async (content: string) => {
    if (!activeProject || !currentUser) return;

    const newHistoryEntry = {
      project_id: activeProject.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      content,
    };

    const { data: newHistory, error } = await supabase
      .from('acceptance_history')
      .insert([newHistoryEntry])
      .select()
      .single();

    if (error) {
      showError("Lỗi khi thêm lịch sử.");
    } else {
      showSuccess("Đã thêm lịch sử.");
      fetchData();
      closeDialog('history');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nghiệm Thu Dự án</h1>
          <p className="text-muted-foreground">Theo dõi quá trình nghiệm thu và thanh toán cho các dự án đã hoàn thành.</p>
        </div>

        <Tabs defaultValue="acceptance" className="space-y-4">
          <TabsList className="inline-flex h-auto rounded-full bg-gray-100 p-1.5">
            <TabsTrigger
              value="acceptance"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <div className="bg-blue-500 rounded p-1">
                <FileSignature className="h-4 w-4 text-white" />
              </div>
              <span>Dự án cần nghiệm thu ({acceptanceProjects.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              <div className="bg-amber-500 rounded p-1">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span>Dự án đang chờ thanh toán ({paymentProjects.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="acceptance">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                  title="Tất cả"
                  value={acceptanceProjects.length.toString()}
                  icon={FileText}
                  iconBgColor="bg-gray-500"
                  onClick={() => setStatusFilter('all')}
                  isActive={statusFilter === 'all'}
                />
                {Object.entries(acceptanceTabStatuses).map(([status, { icon, iconBgColor }]) => (
                  <StatusCard
                    key={status}
                    title={status}
                    value={acceptanceStats[status]?.toString() || '0'}
                    icon={icon}
                    iconBgColor={iconBgColor}
                    onClick={() => setStatusFilter(status)}
                    isActive={statusFilter === status}
                  />
                ))}
              </div>

              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Danh sách dự án ({filteredAcceptanceProjects.length})</CardTitle>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm dự án..."
                        className="pl-8"
                        value={acceptanceSearchTerm}
                        onChange={(e) => setAcceptanceSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Lọc theo trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.keys(acceptanceTabStatuses).map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? <div className="text-center p-8">Đang tải...</div> : <ProjectAcceptanceTable projects={filteredAcceptanceProjects} openDialog={openDialog} handleStatusChange={handleStatusChange} />}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách dự án ({filteredPaymentProjects.length})</CardTitle>
                <div className="relative w-full md:w-64 mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm dự án..."
                    className="pl-8"
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="text-center p-8">Đang tải...</div> : <ProjectAcceptanceTable projects={filteredPaymentProjects} openDialog={openDialog} handleStatusChange={handleStatusChange} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {activeProject && (
        <>
          <ProjectDetailsDialog
            open={dialogs.details}
            onOpenChange={() => closeDialog('details')}
            project={activeProject}
          />
          <AcceptanceHistoryDialog
            open={dialogs.history}
            onOpenChange={() => closeDialog('history')}
            projectName={activeProject.name}
            history={activeProject.acceptance_history || []}
            onAddHistory={handleAddHistory}
          />
        </>
      )}
    </MainLayout>
  );
};

export default AcceptancePage;