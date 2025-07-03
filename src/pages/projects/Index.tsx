import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Archive,
  Trash2,
  FileArchive,
  List,
  LayoutGrid,
  Folder,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatsCard } from "@/components/projects/ProjectStatsCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";

// --- DATA TYPES ---
interface TeamMember {
  id: string;
  name: string;
  image?: string;
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
  debt: number;
  archived: boolean;
}

// --- SAMPLE DATA ---
const personnelData: TeamMember[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "Diana" },
];

const projectsData: Project[] = [
  { id: "1", name: "Website Redesign", client: "ABC Corp", progress: 75, createdAt: "2024-05-10", dueDate: "2024-08-15", status: "in-progress", team: [personnelData[0], personnelData[1]], contractValue: 12000, debt: 3000, archived: false },
  { id: "2", name: "Marketing Campaign", client: "XYZ Inc", progress: 45, createdAt: "2024-06-01", dueDate: "2024-07-30", status: "in-progress", team: [personnelData[2]], contractValue: 8500, debt: 8500, archived: false },
  { id: "3", name: "Mobile App Dev", client: "Tech Innovators", progress: 100, createdAt: "2024-02-15", dueDate: "2024-06-20", status: "completed", team: [personnelData[0], personnelData[3]], contractValue: 35000, debt: 0, archived: false },
  { id: "4", name: "Brand Identity", client: "Global Co", progress: 10, createdAt: "2024-07-01", dueDate: "2024-09-10", status: "planning", team: [personnelData[1]], contractValue: 15000, debt: 15000, archived: false },
  { id: "5", name: "SEO Optimization", client: "Digital World", progress: 90, createdAt: "2024-04-01", dueDate: "2024-06-30", status: "overdue", team: [personnelData[3]], contractValue: 5000, debt: 1000, archived: false },
  { id: "6", name: "Old Archived Project", client: "Past Inc", progress: 100, createdAt: "2023-01-20", dueDate: "2023-05-30", status: "completed", team: [personnelData[0]], contractValue: 10000, debt: 0, archived: true },
];

const ProjectsPage = () => {
  // --- STATE MANAGEMENT ---
  const [projects, setProjects] = useState<Project[]>(projectsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [personnelFilter, setPersonnelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- FILTERING LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter by archived status
      if (project.archived !== showArchived) return false;

      // Filter by search term (client or name)
      if (searchTerm && !`${project.client} ${project.name}`.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by personnel
      if (personnelFilter !== "all" && !project.team.some(member => member.id === personnelFilter)) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      
      // TODO: Implement time filter logic here

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
  const handleSelectAll = (checked: boolean) => {
    setSelectedProjects(checked ? filteredProjects.map((p) => p.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedProjects(
      checked ? [...selectedProjects, id] : selectedProjects.filter((pId) => pId !== id)
    );
  };

  const handleBulkDelete = () => {
    setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
    setSelectedProjects([]);
  };

  const handleBulkArchive = () => {
    setProjects(projects.map(p => selectedProjects.includes(p.id) ? { ...p, archived: true } : p));
    setSelectedProjects([]);
  };
  
  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(prev => prev === status ? "all" : status);
  };

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 1. Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Dự án</h1>
            <p className="text-muted-foreground">
              Theo dõi, quản lý và phân tích tất cả các dự án của bạn.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Thời gian
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Tabs defaultValue="month">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="month">Tháng</TabsTrigger>
                  <TabsTrigger value="quarter">Quý</TabsTrigger>
                  <TabsTrigger value="year">Năm</TabsTrigger>
                </TabsList>
                <TabsContent value="month" className="space-y-4 pt-4">
                   <Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select>
                   <Select><SelectTrigger><SelectValue placeholder="Chọn tháng" /></SelectTrigger><SelectContent><SelectItem value="7">Tháng 7</SelectItem></SelectContent></Select>
                </TabsContent>
                <TabsContent value="quarter" className="space-y-4 pt-4">
                   <Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select>
                   <Select><SelectTrigger><SelectValue placeholder="Chọn quý" /></SelectTrigger><SelectContent><SelectItem value="q3">Quý 3</SelectItem></SelectContent></Select>
                </TabsContent>
                <TabsContent value="year" className="space-y-4 pt-4">
                   <Select><SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>

        {/* 2. Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <ProjectStatsCard title="Tổng dự án" value={stats.total} icon={Folder} onClick={() => handleStatusFilterClick("all")} isActive={statusFilter === "all"} variant="default" />
          <ProjectStatsCard title="Đang chạy" value={stats.inProgress} icon={Clock} onClick={() => handleStatusFilterClick("in-progress")} isActive={statusFilter === "in-progress"} variant="primary" />
          <ProjectStatsCard title="Hoàn thành" value={stats.completed} icon={CheckCircle} onClick={() => handleStatusFilterClick("completed")} isActive={statusFilter === "completed"} variant="success" />
          <ProjectStatsCard title="Pending" value={stats.planning} icon={AlertTriangle} onClick={() => handleStatusFilterClick("planning")} isActive={statusFilter === "planning"} variant="warning" />
          <ProjectStatsCard title="Quá hạn" value={stats.overdue} icon={XCircle} onClick={() => handleStatusFilterClick("overdue")} isActive={statusFilter === "overdue"} variant="danger" />
        </div>

        {/* 3. Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm dự án..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={personnelFilter} onValueChange={setPersonnelFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Nhân sự" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân sự</SelectItem>
                {personnelData.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tiến độ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tiến độ</SelectItem>
                <SelectItem value="planning">Pending</SelectItem>
                <SelectItem value="in-progress">Đang chạy</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {showArchived ? "Dự án hoạt động" : "Dự án lưu trữ"}
            </Button>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedProjects.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="destructive">Thao tác hàng loạt ({selectedProjects.length})</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBulkArchive}><Archive className="mr-2 h-4 w-4" /> Lưu trữ</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm dự án
            </Button>
          </div>
        </div>

        {/* 4. Project List */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><Checkbox checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Tên dự án</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Giá trị HĐ</TableHead>
                <TableHead>Công nợ</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => (
                <TableRow key={project.id}>
                  <TableCell><Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={(checked) => handleSelectRow(project.id, !!checked)} /></TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell className="font-medium"><a href="#" className="hover:underline">{project.name}</a></TableCell>
                  <TableCell>{formatDate(project.createdAt)} - {formatDate(project.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.team.map(member => (
                        <Avatar key={member.id} className="border-2 border-white h-8 w-8">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(project.contractValue)}</TableCell>
                  <TableCell className={cn(project.debt > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(project.debt)}</TableCell>
                  <TableCell><Progress value={project.progress} className="w-full" /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Sửa</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <ProjectFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSave={(data) => console.log(data)} />
    </MainLayout>
  );
};

export default ProjectsPage;