import { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronLeft
} from "lucide-react";
import { LeadStatsCard } from "@/components/sales/leads/LeadStatsCard";
import { LeadHistoryDialog } from "@/components/sales/leads/LeadHistoryDialog";
import { LeadFormDialog } from "@/components/sales/leads/LeadFormDialog";
import { showSuccess, showError } from "@/utils/toast";
import { Lead, LeadHistory, Personnel } from "@/types";
import { cn } from "@/lib/utils";
import { format, startOfDay, isEqual } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [salesPersons, setSalesPersons] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [salesFilter, setSalesFilter] = useState("all");
  const [potentialFilter, setPotentialFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("active");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [specificDateFilter, setSpecificDateFilter] = useState<Date | undefined>();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLeadHistory, setSelectedLeadHistory] = useState<LeadHistory[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const salesPersonsOnly = useMemo(() => 
    personnel.filter(p => p.position.toLowerCase() === 'sale'), 
    [personnel]
  );

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, personnelRes] = await Promise.all([
        supabase.from("leads").select("*, lead_history(*)").order('created_at', { ascending: false }),
        supabase.from("personnel").select("*")
    ]);

    if(leadsRes.error) showError("Lỗi khi tải dữ liệu leads.");
    else setLeads(leadsRes.data as any[]);

    if(personnelRes.error) showError("Lỗi khi tải dữ liệu nhân viên.");
    else setPersonnel(personnelRes.data as Personnel[]);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const isArchivedMatch = archivedFilter === 'all' || (archivedFilter === 'active' ? !lead.archived : lead.archived);
      const isSalesMatch = salesFilter === 'all' || lead.created_by_id === salesFilter;
      const isStatusMatch = statusFilter === 'all' || lead.status === statusFilter;
      const isSearchMatch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        lead.product.toLowerCase().includes(searchTerm.toLowerCase());
      
      let isFollowUpMatch = true;
      if (followUpFilter !== 'all' || specificDateFilter) {
        const today = startOfDay(new Date());
        const latestHistory = lead.lead_history?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (!latestHistory || !latestHistory.next_follow_up_date) {
          isFollowUpMatch = false;
        } else {
          const followUpDate = startOfDay(new Date(latestHistory.next_follow_up_date));
          if (specificDateFilter) {
            isFollowUpMatch = isEqual(followUpDate, startOfDay(specificDateFilter));
          } else if (followUpFilter === 'today') {
            isFollowUpMatch = isEqual(followUpDate, today);
          } else if (followUpFilter === 'overdue') {
            isFollowUpMatch = followUpDate < today;
          }
        }
      }

      return isArchivedMatch && isSalesMatch && isStatusMatch && isSearchMatch && isFollowUpMatch;
    });
  }, [leads, searchTerm, salesFilter, statusFilter, archivedFilter, followUpFilter, specificDateFilter]);

  const paginatedLeads = useMemo(() => {
    const { pageIndex, pageSize } = pagination;
    if (pageSize === 0) return filteredLeads;
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, pagination]);

  const pageCount = useMemo(() => {
    if (pagination.pageSize === 0) return 1;
    return Math.ceil(filteredLeads.length / pagination.pageSize);
  }, [filteredLeads, pagination.pageSize]);

  const stats = useMemo(() => ({
    totalLeads: filteredLeads.length,
    contractValue: filteredLeads.filter(lead => lead.result === "ký hợp đồng").length,
    potentialLeads: filteredLeads.filter(lead => lead.potential === "tiềm năng").length,
    thinking: filteredLeads.filter(lead => lead.status === "đang suy nghĩ").length,
    working: filteredLeads.filter(lead => lead.status === "đang làm việc").length,
    silent: filteredLeads.filter(lead => lead.status === "im ru").length,
    rejected: filteredLeads.filter(lead => lead.status === "từ chối").length
  }), [filteredLeads]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedLeads(checked ? filteredLeads.map(lead => lead.id) : []);
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action: 'archive' | 'restore' | 'delete') => {
    if (selectedLeads.length === 0) return showError("Vui lòng chọn ít nhất một lead.");
    
    if (action === 'delete') {
        const { error } = await supabase.from('leads').delete().in('id', selectedLeads);
        if (error) showError("Lỗi khi xóa leads.");
        else showSuccess(`Đã xóa ${selectedLeads.length} lead.`);
    } else {
        const archiveStatus = action === 'archive';
        const { error } = await supabase.from('leads').update({ archived: archiveStatus }).in('id', selectedLeads);
        if (error) showError(`Lỗi khi ${archiveStatus ? 'lưu trữ' : 'khôi phục'} leads.`);
        else showSuccess(`Đã ${archiveStatus ? 'lưu trữ' : 'khôi phục'} ${selectedLeads.length} lead.`);
    }
    
    fetchData();
    setSelectedLeads([]);
    setSelectAll(false);
  };

  const handleOpenHistory = (lead: Lead) => {
    setSelectedLeadHistory(lead.lead_history || []);
    setSelectedLeadName(lead.name);
    setSelectedLeadId(lead.id);
    setHistoryDialogOpen(true);
  };

  const handleAddHistory = async (leadId: string, newHistoryData: any) => {
    const { error } = await supabase.from('lead_history').insert([{ lead_id: leadId, ...newHistoryData }]);
    if (error) {
      showError("Lỗi khi thêm lịch sử chăm sóc.");
      console.error(error);
    }
    else {
        showSuccess("Đã thêm lịch sử chăm sóc.");
        fetchData();
    }
  };

  const handleOpenAddDialog = () => { setLeadToEdit(null); setFormDialogOpen(true); };
  const handleOpenEditDialog = (lead: Lead) => { setLeadToEdit(lead); setFormDialogOpen(true); };
  const handleOpenDeleteAlert = (lead: Lead) => { setLeadToDelete(lead); setDeleteAlertOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    const { error } = await supabase.from('leads').delete().eq('id', leadToDelete.id);
    if (error) showError("Lỗi khi xóa lead.");
    else showSuccess("Đã xóa lead thành công.");
    fetchData();
    setDeleteAlertOpen(false);
    setLeadToDelete(null);
  };

  const handleSaveLead = async (leadData: any) => {
    if (leadToEdit) {
      const { error } = await supabase.from('leads').update(leadData).eq('id', leadToEdit.id);
      if (error) showError("Lỗi khi cập nhật lead.");
      else showSuccess("Đã cập nhật lead thành công.");
    } else {
      const { error } = await supabase.from('leads').insert([leadData]);
      if (error) showError("Lỗi khi thêm lead mới.");
      else showSuccess("Đã thêm lead mới thành công.");
    }
    fetchData();
    setFormDialogOpen(false);
    setLeadToEdit(null);
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Lead</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi các lead tiềm năng</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          <LeadStatsCard title="Tổng Lead" value={stats.totalLeads.toString()} icon={Users} />
          <LeadStatsCard title="Giá trị hợp đồng" value={stats.contractValue.toString()} icon={FileCheck} variant="success" />
          <LeadStatsCard title="Lead tiềm năng" value={stats.potentialLeads.toString()} icon={Briefcase} variant="primary" />
          <LeadStatsCard title="Đang suy nghĩ" value={stats.thinking.toString()} icon={AlertCircle} variant="warning" />
          <LeadStatsCard title="Đang làm việc" value={stats.working.toString()} icon={Clock} variant="info" />
          <LeadStatsCard title="Im ru" value={stats.silent.toString()} icon={X} variant="secondary" />
          <LeadStatsCard title="Từ chối" value={stats.rejected.toString()} icon={X} variant="destructive" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="relative flex-grow"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="flex w-full md:w-auto space-x-4">
            <Select value={salesFilter} onValueChange={setSalesFilter}><SelectTrigger className="w-full"><SelectValue placeholder="Nhân viên sale" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả nhân viên</SelectItem>{salesPersonsOnly.map((person) => (<SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>))}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full"><SelectValue placeholder="Trạng thái chăm sóc" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem><SelectItem value="đang làm việc">Đang làm việc</SelectItem><SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem><SelectItem value="im ru">Im ru</SelectItem><SelectItem value="từ chối">Từ chối</SelectItem></SelectContent></Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
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
            <Button onClick={handleOpenAddDialog} className="whitespace-nowrap"><PlusCircle className="h-4 w-4 mr-2" />Thêm Lead</Button>
          </div>
        </div>
        
        <div className="flex justify-start items-center">
          <div className="flex space-x-2">{selectedLeads.length > 0 && (<><Button variant="outline" onClick={() => handleBulkAction(archivedFilter === 'active' ? 'archive' : 'restore')}><Archive className="h-4 w-4 mr-2" />{archivedFilter === 'active' ? 'Lưu trữ' : 'Khôi phục'} ({selectedLeads.length})</Button><Button variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="h-4 w-4 mr-2" />Xóa ({selectedLeads.length})</Button></>)}</div>
        </div>
        
        <Card>
          <CardHeader className="pb-2"><CardTitle>Danh sách Lead</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead className="w-12"><Checkbox checked={selectAll} onCheckedChange={handleSelectAll} /></TableHead><TableHead>Tên Lead</TableHead><TableHead>SĐT</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Lịch sử</TableHead><TableHead>Sale tạo</TableHead><TableHead>Ngày tạo</TableHead><TableHead>Tiềm năng</TableHead><TableHead>Trạng thái</TableHead><TableHead>Kết quả</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={11} className="text-center h-24">Đang tải...</TableCell></TableRow> :
                  paginatedLeads.length === 0 ? (<TableRow><TableCell colSpan={11} className="text-center h-24">Không tìm thấy lead nào</TableCell></TableRow>) : (
                    paginatedLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell><Checkbox checked={selectedLeads.includes(lead.id)} onCheckedChange={() => handleSelectLead(lead.id)} /></TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.product}</TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => handleOpenHistory(lead)}><History className="h-4 w-4 mr-1" />({lead.lead_history?.length || 0})</Button></TableCell>
                        <TableCell>{lead.created_by_name || 'N/A'}</TableCell>
                        <TableCell>{formatDateDisplay(lead.created_at)}</TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.potential === "tiềm năng" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>{lead.potential}</Badge></TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.status === "đang làm việc" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800")}>{lead.status}</Badge></TableCell>
                        <TableCell><Badge className={cn("capitalize", lead.result === "ký hợp đồng" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800")}>{lead.result}</Badge></TableCell>
                        <TableCell className="text-right"><div className="flex justify-end space-x-1"><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleOpenHistory(lead)}><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Xem lịch sử</p></TooltipContent></Tooltip></TooltipProvider><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(lead)}><PenLine className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Sửa</p></TooltipContent></Tooltip></TooltipProvider><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(lead)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TooltipTrigger><TooltipContent><p>Xóa</p></TooltipContent></Tooltip></TooltipProvider></div></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedLeads.length} của {filteredLeads.length} dòng được chọn.
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Số dòng mỗi trang</p>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => {
                    setPagination(prev => ({ ...prev, pageSize: Number(value) }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pagination.pageSize === 0 ? "Tất cả" : pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[20, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                    <SelectItem value="0">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Trang {pagination.pageIndex + 1} của {pageCount}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                  disabled={pagination.pageIndex >= pageCount - 1}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: pageCount - 1 }))}
                  disabled={pagination.pageIndex >= pageCount - 1}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <LeadHistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} leadName={selectedLeadName} leadId={selectedLeadId} history={selectedLeadHistory} onAddHistory={handleAddHistory} />
      <LeadFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} onSave={handleSaveLead} salesPersons={salesPersons} lead={leadToEdit} />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác. Lead "{leadToDelete?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default LeadsPage;