import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProjects } from "@/hooks/useProjects";
import { useIsMobile } from "@/hooks/use-mobile";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Eye, Edit, Trash2, Archive, RotateCcw, FileCheck, Briefcase } from "lucide-react";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog";
import { AcceptanceDialog } from "@/components/projects/AcceptanceDialog";
import { ProjectStatsCard } from "@/components/projects/ProjectStatsCard";
import { ProjectCardMobile } from "@/components/projects/ProjectCardMobile";
import { cn } from "@/lib/utils";

const ProjectsPage = () => {
  const { projects, clients, isLoading, invalidateProjects } = useProjects();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const [dialogs, setDialogs] = useState({
    form: false,
    details: false,
    delete: false,
    acceptance: false,
  });
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const isArchivedMatch = project.archived === showArchived;
      const searchMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      const clientMatch = clientFilter === 'all' || project.client_id === clientFilter;
      return isArchivedMatch && searchMatch && statusMatch && clientMatch;
    });
  }, [projects, searchTerm, statusFilter, clientFilter, showArchived]);

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => !p.archived);
    return {
      total: activeProjects.length,
      planning: activeProjects.filter(p => p.status === 'planning').length,
      inProgress: activeProjects.filter(p => p.status === 'in-progress').length,
      completed: activeProjects.filter(p => p.status === 'completed').length,
      overdue: activeProjects.filter(p => p.status === 'overdue').length,
    };
  }, [projects]);

  const openDialog = (name: keyof typeof dialogs, project?: Project | null) => {
    setActiveProject(project || null);
    setDialogs(prev => ({ ...prev, [name]: true }));
  };

  const closeDialog = (name: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [name]: false }));
    setActiveProject(null);
  };

  const handleSaveProject = async (formData: any) => {
    if (activeProject) {
      const { error } = await supabase.from('projects').update(formData).eq('id', activeProject.id);
      if (error) showError("Lỗi khi cập nhật dự án.");
      else showSuccess("Đã cập nhật dự án.");
    } else {
      const { error } = await supabase.from('projects').insert([formData]);
      if (error) showError("Lỗi khi tạo dự án.");
      else showSuccess("Đã tạo dự án mới.");
    }
    invalidateProjects();
    closeDialog('form');
  };

  const handleDeleteConfirm = async () => {
    if (!activeProject) return;
    const { error } = await supabase.from('projects').delete().eq('id', activeProject.id);
    if (error) showError("Lỗi khi xóa dự án.");
    else showSuccess("Đã xóa dự án.");
    invalidateProjects();
    closeDialog('delete');
  };

  const handleArchiveToggle = async (project: Project) => {
    const { error } = await supabase.from('projects').update({ archived: !project.archived }).eq('id', project.id);
    if (error) showError("Lỗi khi cập nhật trạng thái lưu trữ.");
    else showSuccess(`Đã ${project.archived ? 'khôi phục' : 'lưu trữ'} dự án.`);
    invalidateProjects();
  };

  const handleConfirmAcceptance = async (link: string) => {
    if (!activeProject) return;
    const { error } = await supabase.from('projects').update({ acceptance_link: link, status: 'completed' }).eq('id', activeProject.id);
    if (error) {
      showError("Lỗi khi gửi nghiệm thu.");
    } else {
      showSuccess("Đã gửi nghiệm thu thành công.");
      supabase.functions.invoke('send-acceptance-notification', {
        body: {
          projectName: activeProject.name,
          clientName: activeProject.client_name,
          acceptanceLink: link,
        },
      });
      invalidateProjects();
    }
    closeDialog('acceptance');
  };

  const statusTextMap: { [key: string]: string } = {
    planning: "Pending",
    "in-progress": "Đang chạy",
    completed: "Hoàn thành",
    overdue: "Quá hạn",
  };

  const statusColorMap: { [key: string]: string } = {
    planning: "bg-amber-100 text-amber-800 border-amber-200",
    "in-progress": "bg-cyan-100 text-cyan-800 border-cyan-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Dự án</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả các dự án của bạn.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ProjectStatsCard title="Tất cả" value={stats.total} description="Dự án đang hoạt động" icon={Briefcase} onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} iconBgColor="bg-gray-500" />
          <ProjectStatsCard title="Pending" value={stats.planning} description="Dự án đang lên kế hoạch" icon={Briefcase} onClick={() => setStatusFilter('planning')} isActive={statusFilter === 'planning'} iconBgColor="bg-amber-500" />
          <ProjectStatsCard title="Đang chạy" value={stats.inProgress} description="Dự án đang triển khai" icon={Briefcase} onClick={() => setStatusFilter('in-progress')} isActive={statusFilter === 'in-progress'} iconBgColor="bg-cyan-500" />
          <ProjectStatsCard title="Hoàn thành" value={stats.completed} description="Dự án đã hoàn tất" icon={Briefcase} onClick={() => setStatusFilter('completed')} isActive={statusFilter === 'completed'} iconBgColor="bg-green-500" />
          <ProjectStatsCard title="Quá hạn" value={stats.overdue} description="Dự án trễ deadline" icon={Briefcase} onClick={() => setStatusFilter('overdue')} isActive={statusFilter === 'overdue'} iconBgColor="bg-red-500" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative flex-grow w-full"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm dự án..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <Select value={clientFilter} onValueChange={setClientFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Lọc theo client" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả client</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Lọc theo trạng thái" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem><SelectItem value="planning">Pending</SelectItem><SelectItem value="in-progress">Đang chạy</SelectItem><SelectItem value="completed">Hoàn thành</SelectItem><SelectItem value="overdue">Quá hạn</SelectItem></SelectContent></Select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>{showArchived ? 'Dự án hoạt động' : 'Dự án lưu trữ'}</Button>
            <Button onClick={() => openDialog('form')}><PlusCircle className="mr-2 h-4 w-4" />Thêm dự án</Button>
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {isLoading ? <p>Đang tải...</p> : filteredProjects.map(project => (
              <ProjectCardMobile key={project.id} project={project} onViewDetails={(p) => openDialog('details', p)} />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="w-[150px]">Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow> :
                filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {(project.team || []).slice(0, 3).map(member => (
                          <Avatar key={member.id} className="border-2 border-white h-8 w-8">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.team || []).length > 3 && <Avatar className="border-2 border-white h-8 w-8"><AvatarFallback>+{(project.team || []).length - 3}</AvatarFallback></Avatar>}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(project.end_date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell><Progress value={project.progress} className="w-full" /></TableCell>
                    <TableCell><Badge variant="outline" className={cn("capitalize", statusColorMap[project.status])}>{statusTextMap[project.status] || project.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openDialog('details', project)}><Eye className="mr-2 h-4 w-4" />Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('form', project)}><Edit className="mr-2 h-4 w-4" />Sửa</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveToggle(project)}>{project.archived ? <RotateCcw className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{project.archived ? 'Khôi phục' : 'Lưu trữ'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('acceptance', project)}><FileCheck className="mr-2 h-4 w-4" />Nghiệm thu</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('delete', project)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <ProjectFormDialog open={dialogs.form} onOpenChange={() => closeDialog('form')} onSave={handleSaveProject} project={activeProject} clients={clients} />
      <ProjectDetailsDialog open={dialogs.details} onOpenChange={() => closeDialog('details')} project={activeProject} onUpdate={invalidateProjects} />
      <AcceptanceDialog open={dialogs.acceptance} onOpenChange={() => closeDialog('acceptance')} onConfirm={handleConfirmAcceptance} />
      <AlertDialog open={dialogs.delete} onOpenChange={() => closeDialog('delete')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Dự án "{activeProject?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
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

export default ProjectsPage;