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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { clientsData } from "@/data/clients";

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
  payment: number;
  debt: number;
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

const projectsData: Project[] = [
  { id: "1", name: "Website Redesign", client: "ABC Corporation", progress: 75, createdAt: "2024-05-10", dueDate: "2024-08-15", status: "in-progress", team: [personnelData[0], personnelData[1]], contractValue: 120000000, payment: 90000000, debt: 30000000, link: "https://www.figma.com/", archived: false },
  { id: "2", name: "Marketing Campaign", client: "XYZ Industries", progress: 45, createdAt: "2024-06-01", dueDate: "2024-07-30", status: "in-progress", team: [personnelData[2]], contractValue: 85000000, payment: 0, debt: 85000000, link: "https://www.figma.com/", archived: false },
  { id: "3", name: "Mobile App Dev", client: "Tech Innovators", progress: 100, createdAt: "2024-02-15", dueDate: "2024-06-20", status: "completed", team: [personnelData[0], personnelData[3]], contractValue: 350000000, payment: 350000000, debt: 0, link: "https://www.figma.com/", archived: false },
  { id: "4", name: "Brand Identity", client: "Global Enterprises", progress: 10, createdAt: "2024-07-01", dueDate: "2024-09-10", status: "planning", team: [personnelData[1]], contractValue: 150000000, payment: 15000000, debt: 135000000, link: "https://www.figma.com/", archived: false },
  { id: "5", name: "SEO Optimization", client: "Digital World", progress: 90, createdAt: "2024-04-01", dueDate: "2024-06-30", status: "overdue", team: [personnelData[3]], contractValue: 50000000, payment: 40000000, debt: 10000000, link: "https://www.figma.com/", archived: false },
  { id: "6", name: "Old Archived Project", client: "Past Inc", progress: 100, createdAt: "2023-01-20", dueDate: "2023-05-30", status: "completed", team: [personnelData[0]], contractValue: 100000000, payment: 100000000, debt: 0, link: "https://www.figma.com/", archived: true },
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
            <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Thêm dự án</Button>
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
                <TableHead>Thời gian</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Giá trị HĐ</TableHead>
                <TableHead>Công nợ</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead className="text-right w-[80px] px-2">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => (
                <TableRow key={project.id} className="text-xs">
                  <TableCell className="px-2"><Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={(checked) => handleSelectRow(project.id, !!checked)} /></TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell className="font-medium"><a href="#" className="hover:underline">{project.name}</a></TableCell>
                  <TableCell>{formatDate(project.createdAt)} - {formatDate(project.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.team.map(member => (<Avatar key={member.id} className="border-2 border-white h-6 w-6"><AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback></Avatar>))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(project.contractValue)}</TableCell>
                  <TableCell className={cn(project.debt > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(project.debt)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(project.payment)}</TableCell>
                  <TableCell><a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><ExternalLink className="h-4 w-4" /></a></TableCell>
                  <TableCell><Progress value={project.progress} className="w-full h-2" /></TableCell>
                  <TableCell className="text-right px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
      <ProjectFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSave={(data) => console.log(data)} clients={clientsData} />
    </MainLayout>
  );
};

export default ProjectsPage;