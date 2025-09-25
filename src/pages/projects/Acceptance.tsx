import { useState, useMemo, useEffect } from "react";
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
import { Project, Personnel, AcceptanceHistory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import { ProjectDetailsDialog } from "@/components/projects/ProjectDetailsDialog";
import { AcceptanceHistoryDialog } from "@/components/projects/AcceptanceHistoryDialog";
import { ExternalLink, History, Search, Edit, Trash2 } from "lucide-react";

const AcceptancePage = () => {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

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
    const { error } = await supabase.from('acceptance_history').insert([{
      project_id: activeProject.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      content,
    }]);

    if (error) showError("Lỗi khi thêm lịch sử.");
    else {
      showSuccess("Đã thêm lịch sử.");
      fetchData();
      // Keep dialog open, just refetch data
      const updatedProject = projects.find(p => p.id === activeProject.id);
      if (updatedProject) {
        const { data } = await supabase.from('acceptance_history').select('*').eq('project_id', activeProject.id);
        updatedProject.acceptance_history = data || [];
        setActiveProject(updatedProject);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nghiệm Thu Dự án</h1>
          <p className="text-muted-foreground">Theo dõi quá trình nghiệm thu và thanh toán cho các dự án đã hoàn thành.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Danh sách dự án cần nghiệm thu ({filteredProjects.length})</CardTitle>
            <div className="relative w-full md:max-w-xs mt-2 md:mt-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm dự án..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Link nghiệm thu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lịch sử</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Đang tải...</TableCell></TableRow>
                ) : filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Button variant="link" className="p-0 h-auto font-medium" onClick={() => openDialog('details', project)}>
                        {project.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <a href={project.acceptance_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" /> Xem
                      </a>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={project.acceptance_status || 'Làm BBNT'}
                        onValueChange={(value) => handleStatusChange(project.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Làm BBNT">Làm BBNT</SelectItem>
                          <SelectItem value="Đã gởi">Đã gởi</SelectItem>
                          <SelectItem value="Chờ nhận tiền">Chờ nhận tiền</SelectItem>
                          <SelectItem value="Đã nhận tiền">Đã nhận tiền</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openDialog('history', project)}>
                        <History className="mr-2 h-4 w-4" /> Lịch sử ({project.acceptance_history?.length || 0})
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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