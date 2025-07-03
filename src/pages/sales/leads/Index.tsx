import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { 
  Eye,
  PenLine,
  PlusCircle,
  Search,
  Trash2,
  History,
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  X,
  FileCheck,
  Archive,
  RotateCcw,
  Calendar as CalendarIcon,
  ChevronDown
} from "lucide-react";
import { LeadStatsCard } from "@/components/sales/leads/LeadStatsCard";
import { LeadHistoryDialog } from "@/components/sales/leads/LeadHistoryDialog";
import { LeadFormDialog } from "@/components/sales/leads/LeadFormDialog";
import { showSuccess, showError } from "@/utils/toast";
import { getLeads, setLeads } from "@/utils/storage";
import { cn } from "@/lib/utils";
import { format, startOfDay, isEqual } from "date-fns";
import { vi } from 'date-fns/locale';

// Định nghĩa kiểu dữ liệu
interface Lead {
  id: string;
  name: string;
  phone: string;
  product: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  potential: "tiềm năng" | "không tiềm năng" | "chưa xác định";
  status: "đang làm việc" | "đang suy nghĩ" | "im ru" | "từ chối";
  result: "ký hợp đồng" | "chưa quyết định" | "từ chối" | "đang trao đổi";
  archived: boolean;
  history: LeadHistory[];
  nextFollowUpDate?: string;
}

interface LeadHistory {
  id: string;
  date: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  type: "note" | "call" | "email" | "meeting";
  nextFollowUpDate?: string;
  nextFollowUpContent?: string;
}

interface SalesPerson {
  id: string;
  name: string;
}

const LeadsPage = () => {
  // State cho dữ liệu và lọc
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  
  // State cho việc lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [salesFilter, setSalesFilter] = useState("all");
  const [potentialFilter, setPotentialFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("active");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [specificDateFilter, setSpecificDateFilter] = useState<Date | undefined>();

  // State cho widget thống kê
  const [stats, setStats] = useState({
    totalLeads: 0,
    contractValue: 0,
    potentialLeads: 0,
    thinking: 0,
    working: 0,
    silent: 0,
    rejected: 0
  });

  // State cho chọn nhiều lead
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // State cho dialog lịch sử chăm sóc
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLeadHistory, setSelectedLeadHistory] = useState<LeadHistory[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  // State cho dialog thêm/sửa lead
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // State cho dialog xóa
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  // Dữ liệu mẫu cho leads
  const sampleLeads: Lead[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      product: "Website bán hàng",
      createdBy: { id: "1", name: "Trần Thị B" },
      createdAt: "2025-06-28T08:30:00",
      potential: "tiềm năng",
      status: "đang làm việc",
      result: "đang trao đổi",
      archived: false,
      history: [],
      nextFollowUpDate: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Lê Thị C",
      phone: "0912345678",
      product: "App di động",
      createdBy: { id: "2", name: "Phạm Văn D" },
      createdAt: "2025-06-25T14:45:00",
      potential: "tiềm năng",
      status: "đang suy nghĩ",
      result: "chưa quyết định",
      archived: false,
      history: [],
      nextFollowUpDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
      id: "3",
      name: "Đỗ Văn E",
      phone: "0978123456",
      product: "Thiết kế logo",
      createdBy: { id: "1", name: "Trần Thị B" },
      createdAt: "2025-06-20T09:00:00",
      potential: "không tiềm năng",
      status: "từ chối",
      result: "từ chối",
      archived: false,
      history: [],
    },
  ];

  // Dữ liệu mẫu cho nhân viên sale
  const sampleSalesPersons: SalesPerson[] = [
    { id: "1", name: "Trần Thị B" },
    { id: "2", name: "Phạm Văn D" },
    { id: "3", name: "Nguyễn Văn X" },
  ];

  // Khởi tạo dữ liệu
  useEffect(() => {
    const storedLeads = getLeads();
    if (storedLeads && storedLeads.length > 0) {
      setLeadsState(storedLeads);
    } else {
      setLeadsState(sampleLeads);
      setLeads(sampleLeads);
    }
    setSalesPersons(sampleSalesPersons);
  }, []);

  // Cập nhật danh sách đã lọc khi các bộ lọc thay đổi
  useEffect(() => {
    let filtered = [...leads];
    
    if (salesFilter !== "all") filtered = filtered.filter(lead => lead.createdBy.id === salesFilter);
    if (searchTerm) filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (potentialFilter !== "all") filtered = filtered.filter(lead => lead.potential === potentialFilter);
    if (statusFilter !== "all") filtered = filtered.filter(lead => lead.status === statusFilter);
    if (resultFilter !== "all") filtered = filtered.filter(lead => lead.result === resultFilter);
    if (archivedFilter === "active") filtered = filtered.filter(lead => !lead.archived);
    else if (archivedFilter === "archived") filtered = filtered.filter(lead => lead.archived);

    // Lọc theo ngày chăm sóc
    if (followUpFilter !== "all" || specificDateFilter) {
      const today = startOfDay(new Date());
      filtered = filtered.filter(lead => {
        if (!lead.nextFollowUpDate) return false;
        const followUpDate = startOfDay(new Date(lead.nextFollowUpDate));
        if (specificDateFilter) {
          return isEqual(followUpDate, startOfDay(specificDateFilter));
        }
        if (followUpFilter === 'today') return isEqual(followUpDate, today);
        if (followUpFilter === 'overdue') return followUpDate < today;
        return false;
      });
    }
    
    setFilteredLeads(filtered);
    updateStats(filtered);
  }, [leads, searchTerm, salesFilter, potentialFilter, statusFilter, resultFilter, archivedFilter, followUpFilter, specificDateFilter]);

  const updateStats = (filteredData: Lead[]) => {
    setStats({
      totalLeads: filteredData.length,
      contractValue: filteredData.filter(lead => lead.result === "ký hợp đồng").length,
      potentialLeads: filteredData.filter(lead => lead.potential === "tiềm năng").length,
      thinking: filteredData.filter(lead => lead.status === "đang suy nghĩ").length,
      working: filteredData.filter(lead => lead.status === "đang làm việc").length,
      silent: filteredData.filter(lead => lead.status === "im ru").length,
      rejected: filteredData.filter(lead => lead.status === "từ chối").length
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedLeads(!selectAll ? filteredLeads.map(lead => lead.id) : []);
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads(selectedLeads.includes(id) ? selectedLeads.filter(leadId => leadId !== id) : [...selectedLeads, id]);
  };

  const handleBulkArchive = () => {
    if (selectedLeads.length === 0) return showError("Vui lòng chọn lead");
    const updatedLeads = leads.map(lead => selectedLeads.includes(lead.id) ? { ...lead, archived: true } : lead);
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setSelectAll(false);
    showSuccess(`Đã lưu trữ ${selectedLeads.length} lead`);
  };

  const handleBulkRestore = () => {
    if (selectedLeads.length === 0) return showError("Vui lòng chọn lead");
    const updatedLeads = leads.map(lead => selectedLeads.includes(lead.id) ? { ...lead, archived: false } : lead);
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setSelectAll(false);
    showSuccess(`Đã khôi phục ${selectedLeads.length} lead`);
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) return showError("Vui lòng chọn lead");
    const updatedLeads = leads.filter(lead => !selectedLeads.includes(lead.id));
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setSelectAll(false);
    showSuccess(`Đã xóa ${selectedLeads.length} lead`);
  };

  const handleOpenHistory = (lead: Lead) => {
    setSelectedLeadHistory(lead.history);
    setSelectedLeadName(lead.name);
    setSelectedLeadId(lead.id);
    setHistoryDialogOpen(true);
  };

  const handleAddHistory = (leadId: string, newHistoryData: { content: string; type: LeadHistory['type']; nextFollowUpDate?: string; nextFollowUpContent?: string; }) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const newHistoryEntry: LeadHistory = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          user: { id: "1", name: "Trần Thị B" }, // Giả định user
          ...newHistoryData,
        };
        return {
          ...lead,
          history: [...lead.history, newHistoryEntry],
          nextFollowUpDate: newHistoryData.nextFollowUpDate || lead.nextFollowUpDate,
        };
      }
      return lead;
    });
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    if (leadId === selectedLeadId) {
      const updatedLead = updatedLeads.find(l => l.id === leadId);
      if (updatedLead) setSelectedLeadHistory(updatedLead.history);
    }
  };

  const handleOpenAddDialog = () => {
    setLeadToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (lead: Lead) => {
    setLeadToEdit(lead);
    setFormDialogOpen(true);
  };

  const handleOpenDeleteAlert = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!leadToDelete) return;
    const updatedLeads = leads.filter(l => l.id !== leadToDelete.id);
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setDeleteAlertOpen(false);
    setLeadToDelete(null);
    showSuccess("Đã xóa lead thành công.");
  };

  const handleSaveLead = (leadData: any) => {
    let updatedLeads;
    if (leadToEdit) {
      updatedLeads = leads.map(l => l.id === leadToEdit.id ? { ...l, ...leadData } : l);
      showSuccess("Đã cập nhật lead thành công.");
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
        history: [],
        archived: false,
        ...leadData
      };
      updatedLeads = [...leads, newLead];
      showSuccess("Đã thêm lead mới thành công.");
    }
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setFormDialogOpen(false);
    setLeadToEdit(null);
  };

  const handleFilterByStats = (type: string) => {
    setResultFilter("all");
    setPotentialFilter("all");
    setStatusFilter("all");
    switch (type) {
      case "contractValue": setResultFilter("ký hợp đồng"); break;
      case "potentialLeads": setPotentialFilter("tiềm năng"); break;
      case "thinking": setStatusFilter("đang suy nghĩ"); break;
      case "working": setStatusFilter("đang làm việc"); break;
      case "silent": setStatusFilter("im ru"); break;
      case "rejected": setStatusFilter("từ chối"); break;
    }
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const handleFollowUpFilterChange = (value: string) => {
    setSpecificDateFilter(undefined);
    setFollowUpFilter(value);
  };

  const handleSpecificDateSelect = (date?: Date) => {
    setFollowUpFilter("all");
    setSpecificDateFilter(date);
  };

  const isArchivedView = archivedFilter === "archived";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Lead</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi các lead tiềm năng</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          <LeadStatsCard title="Tổng Lead" value={stats.totalLeads.toString()} icon={Users} onClick={() => handleFilterByStats("total")} />
          <LeadStatsCard title="Giá trị hợp đồng" value={stats.contractValue.toString()} icon={FileCheck} variant="success" onClick={() => handleFilterByStats("contractValue")} />
          <LeadStatsCard title="Lead tiềm năng" value={stats.potentialLeads.toString()} icon={Briefcase} variant="primary" onClick={() => handleFilterByStats("potentialLeads")} />
          <LeadStatsCard title="Đang suy nghĩ" value={stats.thinking.toString()} icon={AlertCircle} variant="warning" onClick={() => handleFilterByStats("thinking")} />
          <LeadStatsCard title="Đang làm việc" value={stats.working.toString()} icon={Clock} variant="info" onClick={() => handleFilterByStats("working")} />
          <LeadStatsCard title="Im ru" value={stats.silent.toString()} icon={X} variant="secondary" onClick={() => handleFilterByStats("silent")} />
          <LeadStatsCard title="Từ chối" value={stats.rejected.toString()} icon={X} variant="destructive" onClick={() => handleFilterByStats("rejected")} />
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={potentialFilter} onValueChange={setPotentialFilter}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tiềm năng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tiềm năng</SelectItem>
              <SelectItem value="tiềm năng">Tiềm năng</SelectItem>
              <SelectItem value="không tiềm năng">Không tiềm năng</SelectItem>
              <SelectItem value="chưa xác định">Chưa xác định</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Trạng thái chăm sóc" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="đang làm việc">Đang làm việc</SelectItem>
              <SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem>
              <SelectItem value="im ru">Im ru</SelectItem>
              <SelectItem value="từ chối">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Cần chăm sóc <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleFollowUpFilterChange('all')}>Tất cả</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFollowUpFilterChange('today')}>Hôm nay</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFollowUpFilterChange('overdue')}>Quá hạn</DropdownMenuItem>
              <DropdownMenuSeparator />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">Chọn ngày</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={specificDateFilter} onSelect={handleSpecificDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={archivedFilter} onValueChange={setArchivedFilter}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="archived">Đã lưu trữ</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {selectedLeads.length > 0 && (
              <>
                {isArchivedView ? (
                  <Button variant="outline" onClick={handleBulkRestore}><RotateCcw className="h-4 w-4 mr-2" />Khôi phục ({selectedLeads.length})</Button>
                ) : (
                  <Button variant="outline" onClick={handleBulkArchive}><Archive className="h-4 w-4 mr-2" />Lưu trữ ({selectedLeads.length})</Button>
                )}
                <Button variant="destructive" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-2" />Xóa ({selectedLeads.length})</Button>
              </>
            )}
          </div>
          <Button onClick={handleOpenAddDialog}><PlusCircle className="h-4 w-4 mr-2" />Thêm Lead</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-2"><CardTitle>Danh sách Lead</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><Checkbox checked={selectAll} onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>Tên Lead</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Lịch sử</TableHead>
                    <TableHead>Sale tạo</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Ngày CS tiếp</TableHead>
                    <TableHead>Tiềm năng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Kết quả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={12} className="text-center h-24">Không tìm thấy lead nào</TableCell></TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell><Checkbox checked={selectedLeads.includes(lead.id)} onCheckedChange={() => handleSelectLead(lead.id)} /></TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.product}</TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => handleOpenHistory(lead)}><History className="h-4 w-4 mr-1" />({lead.history.length})</Button></TableCell>
                        <TableCell>{lead.createdBy.name}</TableCell>
                        <TableCell>{formatDateDisplay(lead.createdAt)}</TableCell>
                        <TableCell>{formatDateDisplay(lead.nextFollowUpDate)}</TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.potential === "tiềm năng" ? "bg-green-100 text-green-800" : lead.potential === "không tiềm năng" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800")}>{lead.potential}</Badge></TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.status === "đang làm việc" ? "bg-blue-100 text-blue-800" : lead.status === "đang suy nghĩ" ? "bg-amber-100 text-amber-800" : lead.status === "im ru" ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800")}>{lead.status}</Badge></TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.result === "ký hợp đồng" ? "bg-green-100 text-green-800" : lead.result === "đang trao đổi" ? "bg-blue-100 text-blue-800" : lead.result === "chưa quyết định" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800")}>{lead.result}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenHistory(lead)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger><TooltipContent><p>Xem lịch sử</p></TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(lead)}>
                                    <PenLine className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger><TooltipContent><p>Sửa</p></TooltipContent></Tooltip></TooltipProvider>
                            <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(lead)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TooltipTrigger><TooltipContent><p>Xóa</p></TooltipContent></Tooltip></TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <LeadHistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} leadName={selectedLeadName} leadId={selectedLeadId} history={selectedLeadHistory} onAddHistory={handleAddHistory} />
      
      <LeadFormDialog 
        open={formDialogOpen} 
        onOpenChange={setFormDialogOpen} 
        onSave={handleSaveLead} 
        salesPersons={salesPersons}
        lead={leadToEdit}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Lead "{leadToDelete?.name}" sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
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

export default LeadsPage;