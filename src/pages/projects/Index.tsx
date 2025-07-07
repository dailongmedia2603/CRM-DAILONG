import { useState, useEffect, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Archive,
  Trash2,
  List,
  Folder,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatsCard } from "@/components/projects/ProjectStatsCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { Client, Project } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [projectsRes, clientsRes] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("clients").select("id, company_name, name"),
    ]);

    if (projectsRes.error) showError("Lỗi khi tải dữ liệu dự án.");
    else setProjects(projectsRes.data as Project[]);

    if (clientsRes.error) showError("Lỗi khi tải dữ liệu khách hàng.");
    else setClients(clientsRes.data as Client[]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusTextMap: { [key: string]: string } = {
    planning: "Pending",
    "in-progress": "Đang chạy",
    completed: "Hoàn thành",
    overdue: "Quá hạn",
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (project.archived !== showArchived) return false;
      if (searchTerm && !`${project.client_name} ${project.name}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (statusFilter !== "all" && project.status !== statusFilter) return false;
      return true;
    });
  }, [projects, searchTerm, statusFilter, showArchived]);

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => !p.archived);
    return {
      total: activeProjects.length,
      inProgress: activeProjects.filter(p => p.status === 'in-progress').length,
      completed: activeProjects.filter(p => p.status === 'completed').length,
      planning: activeProjects.filter(p => p.status === 'planning').length,
      overdue: activeProjects.filter(p => p.status === 'overdue').length,
    };
  }, [projects]);

  const handleOpenAddDialog = () => {
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  const handleOpenDeleteAlert = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteAlertOpen(true);
  };

  const handleSaveProject = async (projectData: any) => {
    const saveData = {
      ...projectData,
      contract_value: Number(projectData.contract_value || 0),
    };

    if (projectToEdit) {
      const { error } = await supabase.from('projects').update(saveData).eq('id', projectToEdit.id);
      if (error) showError("Lỗi khi cập nhật dự án.");
      else showSuccess("Dự án đã được cập nhật!");
    } else {
      const { error } = await supabase.from('projects').insert([saveData]);
      if (error) showError("Lỗi khi thêm dự án mới.");
      else showSuccess("Dự án mới đã được thêm!");
    }
    fetchData();
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
    if (error) showError("Lỗi khi xóa dự án.");
    else showSuccess("Dự án đã được xóa.");
    fetchData();
    setIsDeleteAlertOpen(false);
    setProjectToDelete(null);
  };

  const handleTogglePaymentStatus = async (projectId: string, paymentIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const newPayments = [...project.payments];
    newPayments[paymentIndex].paid = !newPayments[paymentIndex].paid;
    const { error } = await supabase.from('projects').update({ payments: newPayments }).eq('id', projectId);
    if (error) showError("Lỗi khi cập nhật thanh toán.");
    else fetchData();
  };

  const handleSelectAll = (checked: boolean) => setSelectedProjects(checked ? filteredProjects.map((p) => p.id) : []);
  const handleSelectRow = (id: string, checked: boolean) => setSelectedProjects(checked ? [...selectedProjects, id] : selectedProjects.filter((pId) => pId !== id));
  
  const handleBulkArchive = async () => {
    const { error } = await supabase.from('projects').update({ archived: true }).in('id', selectedProjects);
    if (error) showError("Lỗi khi lưu trữ dự án.");
    else {
      showSuccess(`${selectedProjects.length} dự án đã được lưu trữ.`);
      fetchData();
      setSelectedProjects([]);
    }
  };

  const handleBulkRestore = async () => {
    const { error } = await supabase.from('projects').update({ archived: false }).in('id', selectedProjects);
    if (error) showError("Lỗi khi khôi phục dự án.");
    else {
      showSuccess(`${selectedProjects.length} dự án đã được khôi phục.`);
      fetchData();
      setSelectedProjects([]);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const { error } = await supabase.from('projects').delete().in('id', selectedProjects);
    if (error) showError("Lỗi khi xóa dự án.");
    else {
      showSuccess(`${selectedProjects.length} dự án đã được xóa vĩnh viễn.`);
      fetchData();
      setSelectedProjects([]);
    }
    setIsBulkDeleteAlertOpen(false);
  };

  const handleStatusFilterClick = (status: string) => setStatusFilter(prev => prev === status ? "all" : status);

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Dự án</h1>
            <p className="text-muted-foreground">Theo dõi, quản lý và phân tích tất cả các dự án của bạn.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <ProjectStatsCard title="Tổng dự án" value={stats.total} description="Dự án đang hoạt động" icon={Folder} onClick={() => handleStatusFilterClick("all")} isActive={statusFilter === "all"} iconBgColor="bg-blue-500" />
          <ProjectStatsCard title="Đang chạy" value={stats.inProgress} description="Dự án đang triển khai" icon={Clock} onClick={() => handleStatusFilterClick("in-progress")} isActive={statusFilter === "in-progress"} iconBgColor="bg-cyan-500" />
          <ProjectStatsCard title="Hoàn thành" value={stats.completed} description="Dự án đã kết thúc" icon={CheckCircle} onClick={() => handleStatusFilterClick("completed")} isActive={statusFilter === "completed"} iconBgColor="bg-green-500" />
          <ProjectStatsCard title="Pending" value={stats.planning} description="Dự án đang lên kế hoạch" icon={AlertTriangle} onClick={() => handleStatusFilterClick("planning")} isActive={statusFilter === "planning"} iconBgColor="bg-amber-500" />
          <ProjectStatsCard title="Quá hạn" value={stats.overdue} description="Dự án trễ deadline" icon={XCircle} onClick={() => handleStatusFilterClick("overdue")} isActive={statusFilter === "overdue"} iconBgColor="bg-red-500" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            <div className="relative w-full md:w-auto md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm dự án..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tiến độ" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả tiến độ</SelectItem><SelectItem value="planning">Pending</SelectItem><SelectItem value="in-progress">Đang chạy</SelectItem><SelectItem value="completed">Hoàn thành</SelectItem><SelectItem value="overdue">Quá hạn</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>{showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{showArchived ? "Dự án hoạt động" : "Dự án lưu trữ"}</Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedProjects.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="destructive">Thao tác hàng loạt ({selectedProjects.length})</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  {showArchived ? (<DropdownMenuItem onClick={handleBulkRestore}><RotateCcw className="mr-2 h-4 w-4" /> Khôi phục</DropdownMenuItem>) : (<DropdownMenuItem onClick={handleBulkArchive}><Archive className="mr-2 h-4 w-4" /> Lưu trữ</DropdownMenuItem>)}
                  <DropdownMenuItem onClick={() => setIsBulkDeleteAlertOpen(true)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button onClick={handleOpenAddDialog}><PlusCircle className="mr-2 h-4 w-4" /> Thêm dự án</Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] px-2"><Checkbox checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tên dự án</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Nhân sự</TableHead>
                <TableHead>Giá trị HĐ</TableHead>
                <TableHead>Đã thanh toán</TableHead>
                <TableHead>Công nợ</TableHead>
                <TableHead>Tiến độ TT</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead className="text-right w-[80px] px-2">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={12} className="text-center">Đang tải...</TableCell></TableRow> :
              filteredProjects.map(project => {
                const totalPaid = (project.payments || []).filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
                const debt = project.contract_value - totalPaid;
                return (
                <TableRow key={project.id} className="text-xs">
                  <TableCell className="px-2"><Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={(checked) => handleSelectRow(project.id, !!checked)} /></TableCell>
                  <TableCell>{project.client_name}</TableCell>
                  <TableCell className="font-medium"><Link to={`/projects/${project.id}`} className="hover:underline">{project.name}</Link></TableCell>
                  <TableCell>
                    <div>{formatDate(project.start_date)}</div>
                    <div>{formatDate(project.end_date)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(project.team || []).map((member, index) => (
                        <div key={index}>{member.role}: {member.name}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(project.contract_value)}</TableCell>
                  <TableCell className="text-green-600 font-medium">{formatCurrency(totalPaid)}</TableCell>
                  <TableCell className={cn(debt > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(debt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(project.payments || []).map((payment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span>{formatCurrency(payment.amount)}</span>
                          <CheckCircle className={cn("h-4 w-4 cursor-pointer", payment.paid ? "text-green-500" : "text-gray-300 hover:text-gray-400")} onClick={() => handleTogglePaymentStatus(project.id, index)} />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><ExternalLink className="h-4 w-4" /></a></TableCell>
                  <TableCell><Badge variant="outline" className={cn({"bg-cyan-100 text-cyan-800 border-cyan-200": project.status === "in-progress", "bg-green-100 text-green-800 border-green-200": project.status === "completed", "bg-amber-100 text-amber-800 border-amber-200": project.status === "planning", "bg-red-100 text-red-800 border-red-200": project.status === "overdue"})}>{statusTextMap[project.status]}</Badge></TableCell>
                  <TableCell className="text-right px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild><Link to={`/projects/${project.id}`}>Chi tiết</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(project)}>Sửa</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenDeleteAlert(project)} className="text-red-500">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </div>
      <ProjectFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveProject} project={projectToEdit} clients={clients} />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác. Dự án "{projectToDelete?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn {selectedProjects.length} dự án đã chọn.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleBulkDeleteConfirm}>Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ProjectsPage;