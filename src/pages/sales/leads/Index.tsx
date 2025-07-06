import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { 
  PenLine,
  PlusCircle,
  Search,
  Trash2,
  History,
  Archive,
  RotateCcw,
  MoreHorizontal
} from "lucide-react";
import { LeadHistoryDialog } from "@/components/sales/leads/LeadHistoryDialog";
import { LeadFormDialog } from "@/components/sales/leads/LeadFormDialog";
import { showSuccess, showError } from "@/utils/toast";
import { getLeads, setLeads } from "@/utils/storage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [salesFilter, setSalesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("active");

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLeadHistory, setSelectedLeadHistory] = useState<LeadHistory[]>([]);
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const sampleLeads: Lead[] = [
    { id: "1", name: "Nguyễn Văn A", phone: "0901234567", product: "Website bán hàng", createdBy: { id: "1", name: "Trần Thị B" }, createdAt: "2025-06-28T08:30:00", potential: "tiềm năng", status: "đang làm việc", result: "đang trao đổi", archived: false, history: [], nextFollowUpDate: new Date().toISOString() },
    { id: "2", name: "Lê Thị C", phone: "0912345678", product: "App di động", createdBy: { id: "2", name: "Phạm Văn D" }, createdAt: "2025-06-25T14:45:00", potential: "tiềm năng", status: "đang suy nghĩ", result: "chưa quyết định", archived: false, history: [], nextFollowUpDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
    { id: "3", name: "Đỗ Văn E", phone: "0978123456", product: "Thiết kế logo", createdBy: { id: "1", name: "Trần Thị B" }, createdAt: "2025-06-20T09:00:00", potential: "không tiềm năng", status: "từ chối", result: "từ chối", archived: false, history: [] },
  ];

  const sampleSalesPersons: SalesPerson[] = [
    { id: "1", name: "Trần Thị B" },
    { id: "2", name: "Phạm Văn D" },
    { id: "3", name: "Nguyễn Văn X" },
  ];

  useEffect(() => {
    const storedLeads = getLeads();
    setLeadsState(storedLeads && storedLeads.length > 0 ? storedLeads : sampleLeads);
    setSalesPersons(sampleSalesPersons);
  }, []);

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const isArchivedMatch = archivedFilter === 'all' || (archivedFilter === 'active' ? !lead.archived : lead.archived);
      const isSalesMatch = salesFilter === 'all' || lead.createdBy.id === salesFilter;
      const isStatusMatch = statusFilter === 'all' || lead.status === statusFilter;
      const isSearchMatch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.product.toLowerCase().includes(searchTerm.toLowerCase());
      return isArchivedMatch && isSalesMatch && isStatusMatch && isSearchMatch;
    });
    setFilteredLeads(filtered);
  }, [leads, searchTerm, salesFilter, statusFilter, archivedFilter]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedLeads(checked ? filteredLeads.map(lead => lead.id) : []);
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    setSelectedLeads(checked ? [...selectedLeads, id] : selectedLeads.filter(leadId => leadId !== id));
  };

  const handleBulkAction = (action: 'archive' | 'restore' | 'delete') => {
    if (selectedLeads.length === 0) return showError("Vui lòng chọn ít nhất một lead.");
    let updatedLeads: Lead[] = [];
    let successMessage = "";

    if (action === 'delete') {
      updatedLeads = leads.filter(lead => !selectedLeads.includes(lead.id));
      successMessage = `Đã xóa ${selectedLeads.length} lead.`;
    } else {
      const archiveStatus = action === 'archive';
      updatedLeads = leads.map(lead => selectedLeads.includes(lead.id) ? { ...lead, archived: archiveStatus } : lead);
      successMessage = `Đã ${archiveStatus ? 'lưu trữ' : 'khôi phục'} ${selectedLeads.length} lead.`;
    }
    
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setSelectedLeads([]);
    showSuccess(successMessage);
  };

  const handleOpenHistory = (lead: Lead) => {
    setSelectedLeadHistory(lead.history);
    setSelectedLeadName(lead.name);
    setSelectedLeadId(lead.id);
    setHistoryDialogOpen(true);
  };

  const handleAddHistory = (leadId: string, newHistoryData: any) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const newHistoryEntry: LeadHistory = { id: Date.now().toString(), date: new Date().toISOString(), user: { id: "1", name: "Current User" }, ...newHistoryData };
        return { ...lead, history: [...lead.history, newHistoryEntry], nextFollowUpDate: newHistoryData.nextFollowUpDate || lead.nextFollowUpDate };
      }
      return lead;
    });
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    const updatedLead = updatedLeads.find(l => l.id === leadId);
    if (updatedLead) setSelectedLeadHistory(updatedLead.history);
  };

  const handleOpenAddDialog = () => { setLeadToEdit(null); setFormDialogOpen(true); };
  const handleOpenEditDialog = (lead: Lead) => { setLeadToEdit(lead); setFormDialogOpen(true); };
  const handleOpenDeleteAlert = (lead: Lead) => { setLeadToDelete(lead); setDeleteAlertOpen(true); };

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
      const newLead: Lead = { id: `lead-${Date.now()}`, createdAt: new Date().toISOString(), history: [], archived: false, ...leadData };
      updatedLeads = [...leads, newLead];
      showSuccess("Đã thêm lead mới thành công.");
    }
    setLeadsState(updatedLeads);
    setLeads(updatedLeads);
    setFormDialogOpen(false);
    setLeadToEdit(null);
  };

  const getStatusBadgeClass = (status: Lead['status']) => {
    switch (status) {
      case 'đang làm việc': return 'bg-blue-100 text-blue-800';
      case 'đang suy nghĩ': return 'bg-amber-100 text-amber-800';
      case 'từ chối': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultBadgeClass = (result: Lead['result']) => {
    switch (result) {
      case 'ký hợp đồng': return 'bg-green-100 text-green-800';
      case 'đang trao đổi': return 'bg-blue-100 text-blue-800';
      case 'từ chối': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sale ({filteredLeads.length})</h1>
          <div className="flex items-center gap-2">
            {selectedLeads.length > 0 && (
              <>
                {archivedFilter === 'active' ? (
                  <Button variant="outline" onClick={() => handleBulkAction('archive')}><Archive className="h-4 w-4 mr-2" />Lưu trữ ({selectedLeads.length})</Button>
                ) : (
                  <Button variant="outline" onClick={() => handleBulkAction('restore')}><RotateCcw className="h-4 w-4 mr-2" />Khôi phục ({selectedLeads.length})</Button>
                )}
                <Button variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="h-4 w-4 mr-2" />Xóa ({selectedLeads.length})</Button>
              </>
            )}
            <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <PlusCircle className="h-5 w-5 mr-2" />Thêm Lead
            </Button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Tìm kiếm theo tên, SĐT, sản phẩm..." className="pl-10 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Nhân viên sale" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {salesPersons.map((person) => (<SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Trạng thái chăm sóc" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="đang làm việc">Đang làm việc</SelectItem>
                <SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem>
                <SelectItem value="im ru">Im ru</SelectItem>
                <SelectItem value="từ chối">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
              <Checkbox checked={selectedLeads.includes(lead.id)} onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)} className="h-5 w-5" />
              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <p className="font-semibold text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-500">Sản phẩm</p>
                  <p className="font-medium text-gray-800">{lead.product}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <Badge className={cn("capitalize", getStatusBadgeClass(lead.status))}>{lead.status}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Kết quả</p>
                  <Badge className={cn("capitalize", getResultBadgeClass(lead.result))}>{lead.result}</Badge>
                </div>
                <div className="col-span-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-gray-500" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenHistory(lead)}><History className="mr-2 h-4 w-4" />Xem lịch sử</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEditDialog(lead)}><PenLine className="mr-2 h-4 w-4" />Sửa</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleOpenDeleteAlert(lead)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
              <p>Không tìm thấy lead nào.</p>
            </div>
          )}
        </div>
      </div>
      
      <LeadHistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} leadName={selectedLeadName} leadId={selectedLeadId} history={selectedLeadHistory} onAddHistory={handleAddHistory} />
      <LeadFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} onSave={handleSaveLead} salesPersons={salesPersons} lead={leadToEdit} />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác. Lead "{leadToDelete?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default LeadsPage;