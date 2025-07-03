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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Archive,
  Trash2,
  List,
  Folder,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatsCard } from "@/components/projects/ProjectStatsCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { getProjects, setProjects, getClients } from "@/utils/storage";
import { Client } from "@/data/clients";
import { showSuccess } from "@/utils/toast";

// --- DATA TYPES ---
interface TeamMember {
  id: string;
  name: string;
  image?: string;
}

interface Payment {
  amount: number;
  paid: boolean;
}

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  createdAt: string;
  dueDate: string;
  status: "planning" | "in-progress" | "completed" | "overdue";
  team: TeamMember[];
  contractValue: number;
  payments: Payment[];
  link: string;
  archived: boolean;
}

// --- SAMPLE DATA ---
const personnelData: TeamMember[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "Diana" },
];

const initialProjects: Project[] = [
  { id: "1", name: "Website Redesign", client: "ABC Corporation", progress: 75, createdAt: "2024-05-10", dueDate: "2024-08-15", status: "in-progress", team: [personnelData[0], personnelData[1]], contractValue: 120000000, payments: [{amount: 50000000, paid: true}, {amount: 40000000, paid: false}], link: "https://www.figma.com/", archived: false },
  { id: "2", name: "Marketing Campaign", client: "XYZ Industries", progress: 45, createdAt: "2024-06-01", dueDate: "2024-07-30", status: "in-progress", team: [personnelData[2]], contractValue: 85000000, payments: [{amount: 40000000, paid: false}], link: "https://www.figma.com/", archived: false },
  { id: "3", name: "Mobile App Dev", client: "Tech Innovators", progress: 100, createdAt: "2024-02-15", dueDate: "2024-06-20", status: "completed", team: [personnelData[0], personnelData[3]], contractValue: 350000000, payments: [{amount: 200000000, paid: true}, {amount: 150000000, paid: true}], link: "https://www.figma.com/", archived: false },
];

const ProjectsPage = () => {
  // --- STATE MANAGEMENT ---
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [clients, setClientsList] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [personnelFilter, setPersonnelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const statusTextMap: { [key: string]: string } = {
    planning: "Pending",
    "in-progress": "Đang chạy",
    completed: "Hoàn thành",
    overdue: "Quá hạn",
  };

  useEffect(() => {
    const storedProjects = getProjects();
    if (storedProjects && storedProjects.length > 0) {
      setProjectsState(storedProjects);
    } else {
      setProjectsState(initialProjects);
      setProjects(initialProjects);
    }

    const storedClients = getClients();
    if (storedClients && storedClients.length > 0) {
      setClientsList(storedClients);
    }
  }, []);

  // --- FILTERING LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (project.archived !== showArchived) return false;
      if (searchTerm && !`${project.client} ${project.name}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (personnelFilter !== "all" && !project.team.some(member => member.id === personnelFilter)) return false;
      if (statusFilter !== "all" && project.status !== statusFilter) return false;
      return true;
    });
  }, [projects, searchTerm, personnelFilter, statusFilter, showArchived]);

  // --- STATISTICS ---
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

  // --- HANDLERS ---
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

  const handleSaveProject = (projectData: any) => {
    let updatedProjects;
    const saveData = {
      ...projectData,
      contractValue: Number(projectData.contractValue || 0),
    };

    if (projectToEdit) {
      updatedProjects = projects.map(p => p.id === projectToEdit.id ? { ...p, ...saveData } : p);
      showSuccess("Dự án đã được cập nhật!");
    } else {
      const newProject: Project = {
        id: new Date().toISOString(),
        ...saveData,
        team: [],
        progress: 0,
        archived: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updatedProjects = [...projects, newProject];
      showSuccess("Dự án mới đã được thêm!");
    }
    setProjectsState(updatedProjects);
    setProjects(updatedProjects);
  };

  const handleDeleteConfirm = () => {
    if (!projectToDelete) return;
    const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjectsState(updatedProjects);
    setProjects(updatedProjects);
    setIsDeleteAlertOpen(false);
    setProjectToDelete(null);
    showSuccess("Dự án đã được xóa.");
  };

  const handleTogglePaymentStatus = (projectId: string, paymentIndex: number) => {
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            const newPayments = [...p.payments];
            newPayments[paymentIndex].paid = !newPayments[paymentIndex].paid;
            return { ...p, payments: newPayments };
        }
        return p;
    });
    setProjectsState(updatedProjects);
    setProjects(updatedProjects);
  };

  const handleSelectAll = (checked: boolean) => setSelectedProjects(checked ? filteredProjects.map((p) => p.id) : []);
  const handleSelectRow = (id: string, checked: boolean) => setSelectedProjects(checked ? [...selectedProjects, id] : selectedProjects.filter((pId) => pId !== id));
  const handleBulkDelete = () => { setProjects(projects.filter(p => !selectedProjects.includes(p.id))); setSelectedProjects([]); };
  const handleBulkArchive = () => { setProjects(projects.map(p => selectedProjects.includes(p.id) ? { ...p, archived: true } : p)); setSelectedProjects([]); };
  const handleStatusFilterClick = (status: string) => setStatusFilter(prev => prev === status ? "all" : status);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Dự án</h1>
            <p className="text-muted-foreground">Theo dõi, quản lý và phân tích tất cả các dự án của bạn.</p>
          </div>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" />Thời gian</Button></PopoverTrigger>
            <PopoverContent className="w-80">
              <Tabs defaultValue="month">
                <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="month">Tháng</TabsTrigger><TabsTrigger value="quarter">Quý</TabsTrigger><TabsTrigger value="year">Năm</TabsTrigger></TabsList>
                <TabsContent value="month" className="space-y-4 pt-4"><Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select><Select><SelectTrigger><SelectValue placeholder="Chọn tháng" /></SelectTrigger><SelectContent><SelectItem value="7">Tháng 7</SelectItem></SelectContent></Select></TabsContent>
                <TabsContent value="quarter" className="space-y-4 pt-4"><Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select><Select><SelectTrigger><SelectValue placeholder="Chọn quý" /></SelectTrigger><SelectContent><SelectItem value="q3">Quý 3</SelectItem></SelectContent></Select></TabsContent>
                <TabsContent value="year" className="space-y-4 pt-4"><Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select></TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <ProjectStatsCard title="Tổng dự án" value={stats.total} description="Dự án đang hoạt động" icon={Folder} onClick={() => handleStatusFilterClick("all")} isActive={statusFilter === "all"} iconBgColor="bg-blue-500" />
          <ProjectStatsCard title="Đang chạy" value={stats.inProgress} description="Dự án đang triển khai" icon={Clock} onClick={() => handleStatusFilterClick("in-progress")} isActive={statusFilter === "in-progress"} iconBgColor="bg-cyan-500" />
          <ProjectStatsCard title="Hoàn thành" value={stats.completed} description="Dự án đã kết thúc" icon={CheckCircle} onClick={() => handleStatusFilterClick("completed")} isActive={statusFilter === "completed"} iconBgColor="bg-green-500" />
          <ProjectStatsCard title="Pending" value={stats.planning} description="Dự án đang lên kế hoạch" icon={AlertTriangle} onClick={() => handleStatusFilterClick("planning")} isActive={statusFilter === "planning"} iconBgColor="bg-amber-500" />
          <ProjectStatsCard title="Quá hạn" value={stats.overdue} description="Dự án trễ deadline" icon={XCircle} onClick={() => handleStatusFilterClick("overdue")} isActive={statusFilter === "overdue"} iconBgColor="bg-red-500" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            <div className="relative w-full md:w-auto md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm dự án..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={personnelFilter} onValueChange={setPersonnelFilter}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Nhân sự" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả nhân sự</SelectItem>{personnelData.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tiến độ" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả tiến độ</SelectItem><SelectItem value="planning">Pending</SelectItem><SelectItem value="in-progress">Đang chạy</SelectItem><SelectItem value="completed">Hoàn thành</SelectItem><SelectItem value="overdue">Quá hạn</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>{showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{showArchived ? "Dự án hoạt động" : "Dự án lưu trữ"}</Button>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedProjects.length > 0 && (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="destructive">Thao tác hàng loạt ({selectedProjects.length})</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={handleBulkArchive}><Archive className="mr-2 h-4 w-4" /> Lưu trữ</DropdownMenuItem><DropdownMenuItem onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem></DropdownMenuContent></DropdownMenu>)}
            <Button onClick={handleOpenAddDialog}><PlusCircle className="mr-2 h-4 w-4" /> Thêm dự án</Button>
          </div>
        </div>

        {/* Project List */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] px-2"><Checkbox checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead className="w-[15%]">Client</TableHead>
                <TableHead className="w-[20%]">Tên dự án</TableHead>
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
              {filteredProjects.map(project => {
                const totalPaid = (project.payments || []).filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
                const debt = project.contractValue - totalPaid;
                return (
                <TableRow key={project.id} className="text-xs">
                  <TableCell className="px-2"><Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={(checked) => handleSelectRow(project.id, !!checked)} /></TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell className="font-medium"><Link to={`/projects/${project.id}`} className="hover:underline">{project.name}</Link></TableCell>
                  <TableCell>{formatCurrency(project.contractValue)}</TableCell>
                  <TableCell className="text-green-600 font-medium">{formatCurrency(totalPaid)}</TableCell>
                  <TableCell className={cn(debt > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(debt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(project.payments || []).map((payment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span>{formatCurrency(payment.amount)}</span>
                          <CheckCircle
                            className={cn(
                              "h-4 w-4 cursor-pointer",
                              payment.paid ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                            )}
                            onClick={() => handleTogglePaymentStatus(project.id, index)}
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell><a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><ExternalLink className="h-4 w-4" /></a></TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        {
                          "bg-cyan-100 text-cyan-800 border-cyan-200": project.status === "in-progress",
                          "bg-green-100 text-green-800 border-green-200": project.status === "completed",
                          "bg-amber-100 text-amber-800 border-amber-200": project.status === "planning",
                          "bg-red-100 text-red-800 border-red-200": project.status === "overdue",
                        }
                      )}
                    >
                      {statusTextMap[project.status]}
                    </Badge>
                  </TableCell>
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
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Dự án "{projectToDelete?.name}" sẽ bị xóa vĩnh viễn.
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

export default ProjectsPage;