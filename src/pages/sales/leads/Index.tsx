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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Eye,
  Filter,
  PenLine,
  PlusCircle,
  Search,
  Trash2,
  History,
  MessageSquare,
  User,
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  X,
  FileCheck,
  Archive
} from "lucide-react";
import { LeadStatsCard } from "@/components/sales/leads/LeadStatsCard";
import { LeadHistoryDialog } from "@/components/sales/leads/LeadHistoryDialog";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

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
}

interface SalesPerson {
  id: string;
  name: string;
}

const LeadsPage = () => {
  // State cho dữ liệu và lọc
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  
  // State cho việc lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [salesFilter, setSalesFilter] = useState("all");
  const [potentialFilter, setPotentialFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [archivedFilter, setArchivedFilter] = useState("active"); // 'active', 'archived', 'all'

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

  // Dữ liệu mẫu cho leads
  const sampleLeads: Lead[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "0901234567",
      product: "Website bán hàng",
      createdBy: {
        id: "1",
        name: "Trần Thị B"
      },
      createdAt: "2025-06-28T08:30:00",
      potential: "tiềm năng",
      status: "đang làm việc",
      result: "đang trao đổi",
      archived: false,
      history: [
        {
          id: "h1",
          date: "2025-06-28T08:30:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Đã liên hệ lần đầu, khách hàng quan tâm đến dịch vụ website bán hàng",
          type: "call"
        },
        {
          id: "h2",
          date: "2025-06-29T10:15:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Đã gửi email báo giá cho khách hàng",
          type: "email"
        }
      ]
    },
    {
      id: "2",
      name: "Lê Thị C",
      phone: "0912345678",
      product: "App di động",
      createdBy: {
        id: "2",
        name: "Phạm Văn D"
      },
      createdAt: "2025-06-25T14:45:00",
      potential: "tiềm năng",
      status: "đang suy nghĩ",
      result: "chưa quyết định",
      archived: false,
      history: [
        {
          id: "h3",
          date: "2025-06-25T14:45:00",
          user: {
            id: "2",
            name: "Phạm Văn D"
          },
          content: "Đã tư vấn qua điện thoại về dịch vụ phát triển app di động",
          type: "call"
        }
      ]
    },
    {
      id: "3",
      name: "Đỗ Văn E",
      phone: "0978123456",
      product: "Thiết kế logo",
      createdBy: {
        id: "1",
        name: "Trần Thị B"
      },
      createdAt: "2025-06-20T09:00:00",
      potential: "không tiềm năng",
      status: "từ chối",
      result: "từ chối",
      archived: false,
      history: [
        {
          id: "h4",
          date: "2025-06-20T09:00:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Đã liên hệ lần đầu, khách hàng quan tâm đến dịch vụ thiết kế logo",
          type: "call"
        },
        {
          id: "h5",
          date: "2025-06-21T11:30:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Khách hàng từ chối vì giá cao hơn đối thủ cạnh tranh",
          type: "call"
        }
      ]
    },
    {
      id: "4",
      name: "Hoàng Thị F",
      phone: "0965432109",
      product: "Website giới thiệu công ty",
      createdBy: {
        id: "2",
        name: "Phạm Văn D"
      },
      createdAt: "2025-06-18T16:20:00",
      potential: "tiềm năng",
      status: "im ru",
      result: "chưa quyết định",
      archived: false,
      history: [
        {
          id: "h6",
          date: "2025-06-18T16:20:00",
          user: {
            id: "2",
            name: "Phạm Văn D"
          },
          content: "Đã gặp trực tiếp và tư vấn về dịch vụ thiết kế website giới thiệu công ty",
          type: "meeting"
        },
        {
          id: "h7",
          date: "2025-06-19T09:45:00",
          user: {
            id: "2",
            name: "Phạm Văn D"
          },
          content: "Đã gửi email báo giá, khách hàng chưa phản hồi",
          type: "email"
        }
      ]
    },
    {
      id: "5",
      name: "Trần Văn G",
      phone: "0943210987",
      product: "Dịch vụ SEO",
      createdBy: {
        id: "1",
        name: "Trần Thị B"
      },
      createdAt: "2025-06-15T10:10:00",
      potential: "tiềm năng",
      status: "đang làm việc",
      result: "ký hợp đồng",
      archived: false,
      history: [
        {
          id: "h8",
          date: "2025-06-15T10:10:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Đã liên hệ lần đầu, khách hàng quan tâm đến dịch vụ SEO",
          type: "call"
        },
        {
          id: "h9",
          date: "2025-06-16T14:30:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Đã gửi hợp đồng cho khách hàng",
          type: "email"
        },
        {
          id: "h10",
          date: "2025-06-17T09:00:00",
          user: {
            id: "1",
            name: "Trần Thị B"
          },
          content: "Khách hàng đã ký hợp đồng và thanh toán đợt 1",
          type: "meeting"
        }
      ]
    },
    {
      id: "6",
      name: "Phạm Thị H",
      phone: "0932109876",
      product: "Landing Page",
      createdBy: {
        id: "2",
        name: "Phạm Văn D"
      },
      createdAt: "2025-06-10T11:05:00",
      potential: "chưa xác định",
      status: "đang suy nghĩ",
      result: "chưa quyết định",
      archived: true,
      history: [
        {
          id: "h11",
          date: "2025-06-10T11:05:00",
          user: {
            id: "2",
            name: "Phạm Văn D"
          },
          content: "Đã liên hệ lần đầu, khách hàng hỏi về dịch vụ thiết kế landing page",
          type: "call"
        }
      ]
    }
  ];

  // Dữ liệu mẫu cho nhân viên sale
  const sampleSalesPersons: SalesPerson[] = [
    {
      id: "1",
      name: "Trần Thị B"
    },
    {
      id: "2",
      name: "Phạm Văn D"
    },
    {
      id: "3",
      name: "Nguyễn Văn X"
    }
  ];

  // Khởi tạo dữ liệu
  useEffect(() => {
    // Trong thực tế, dữ liệu sẽ được lấy từ API
    setLeads(sampleLeads);
    setSalesPersons(sampleSalesPersons);
  }, []);

  // Cập nhật danh sách đã lọc khi các bộ lọc thay đổi
  useEffect(() => {
    let filtered = [...leads];
    
    // Lọc theo nhân viên sale
    if (salesFilter !== "all") {
      filtered = filtered.filter(lead => lead.createdBy.id === salesFilter);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Lọc theo tiềm năng
    if (potentialFilter !== "all") {
      filtered = filtered.filter(lead => lead.potential === potentialFilter);
    }
    
    // Lọc theo trạng thái chăm sóc
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Lọc theo kết quả bán hàng
    if (resultFilter !== "all") {
      filtered = filtered.filter(lead => lead.result === resultFilter);
    }
    
    // Lọc theo trạng thái lưu trữ
    if (archivedFilter === "active") {
      filtered = filtered.filter(lead => !lead.archived);
    } else if (archivedFilter === "archived") {
      filtered = filtered.filter(lead => lead.archived);
    }
    
    setFilteredLeads(filtered);
    
    // Cập nhật thống kê
    updateStats(filtered);
  }, [leads, searchTerm, salesFilter, potentialFilter, statusFilter, resultFilter, archivedFilter]);

  // Hàm cập nhật thống kê
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

  // Xử lý chọn tất cả
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Xử lý chọn từng lead
  const handleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  // Xử lý lưu trữ hàng loạt
  const handleBulkArchive = () => {
    if (selectedLeads.length === 0) {
      showError("Vui lòng chọn ít nhất một lead để lưu trữ");
      return;
    }
    
    // Trong thực tế, sẽ gọi API để cập nhật trạng thái lưu trữ
    const updatedLeads = leads.map(lead => {
      if (selectedLeads.includes(lead.id)) {
        return { ...lead, archived: true };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setSelectAll(false);
    showSuccess(`Đã lưu trữ ${selectedLeads.length} lead`);
  };

  // Xử lý xóa hàng loạt
  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) {
      showError("Vui lòng chọn ít nhất một lead để xóa");
      return;
    }
    
    // Trong thực tế, sẽ gọi API để xóa
    const updatedLeads = leads.filter(lead => !selectedLeads.includes(lead.id));
    setLeads(updatedLeads);
    setSelectedLeads([]);
    setSelectAll(false);
    showSuccess(`Đã xóa ${selectedLeads.length} lead`);
  };

  // Xử lý mở dialog lịch sử chăm sóc
  const handleOpenHistory = (lead: Lead) => {
    setSelectedLeadHistory(lead.history);
    setSelectedLeadName(lead.name);
    setHistoryDialogOpen(true);
  };

  // Xử lý lọc theo widget thống kê
  const handleFilterByStats = (type: string) => {
    switch (type) {
      case "contractValue":
        setResultFilter("ký hợp đồng");
        break;
      case "potentialLeads":
        setPotentialFilter("tiềm năng");
        break;
      case "thinking":
        setStatusFilter("đang suy nghĩ");
        break;
      case "working":
        setStatusFilter("đang làm việc");
        break;
      case "silent":
        setStatusFilter("im ru");
        break;
      case "rejected":
        setStatusFilter("từ chối");
        break;
      default:
        // Reset all filters
        setResultFilter("all");
        setPotentialFilter("all");
        setStatusFilter("all");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Lead</h1>
            <p className="text-muted-foreground">
              Quản lý và theo dõi các lead tiềm năng
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo nhân sự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân sự</SelectItem>
                {salesPersons.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Widget thống kê */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          <LeadStatsCard 
            title="Tổng Lead" 
            value={stats.totalLeads.toString()}
            icon={Users}
            onClick={() => handleFilterByStats("total")}
          />
          <LeadStatsCard 
            title="Giá trị hợp đồng" 
            value={stats.contractValue.toString()}
            icon={FileCheck}
            variant="success"
            onClick={() => handleFilterByStats("contractValue")}
          />
          <LeadStatsCard 
            title="Lead tiềm năng" 
            value={stats.potentialLeads.toString()}
            icon={Briefcase}
            variant="primary"
            onClick={() => handleFilterByStats("potentialLeads")}
          />
          <LeadStatsCard 
            title="Đang suy nghĩ" 
            value={stats.thinking.toString()}
            icon={AlertCircle}
            variant="warning"
            onClick={() => handleFilterByStats("thinking")}
          />
          <LeadStatsCard 
            title="Đang làm việc" 
            value={stats.working.toString()}
            icon={Clock}
            variant="info"
            onClick={() => handleFilterByStats("working")}
          />
          <LeadStatsCard 
            title="Im ru" 
            value={stats.silent.toString()}
            icon={X}
            variant="secondary"
            onClick={() => handleFilterByStats("silent")}
          />
          <LeadStatsCard 
            title="Từ chối" 
            value={stats.rejected.toString()}
            icon={X}
            variant="destructive"
            onClick={() => handleFilterByStats("rejected")}
          />
        </div>
        
        {/* Thanh công cụ */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, sản phẩm..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={potentialFilter} onValueChange={setPotentialFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tiềm năng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tiềm năng</SelectItem>
              <SelectItem value="tiềm năng">Tiềm năng</SelectItem>
              <SelectItem value="không tiềm năng">Không tiềm năng</SelectItem>
              <SelectItem value="chưa xác định">Chưa xác định</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái chăm sóc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="đang làm việc">Đang làm việc</SelectItem>
              <SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem>
              <SelectItem value="im ru">Im ru</SelectItem>
              <SelectItem value="từ chối">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kết quả bán hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kết quả</SelectItem>
              <SelectItem value="ký hợp đồng">Ký hợp đồng</SelectItem>
              <SelectItem value="chưa quyết định">Chưa quyết định</SelectItem>
              <SelectItem value="từ chối">Từ chối</SelectItem>
              <SelectItem value="đang trao đổi">Đang trao đổi</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={archivedFilter} onValueChange={setArchivedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
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
                <Button 
                  variant="outline" 
                  onClick={handleBulkArchive}
                  className="flex items-center"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Lưu trữ ({selectedLeads.length})
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedLeads.length})
                </Button>
              </>
            )}
          </div>
          
          <Button className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm Lead
          </Button>
        </div>
        
        {/* Danh sách Lead */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Chọn tất cả"
                      />
                    </TableHead>
                    <TableHead>Tên Lead</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Lịch sử chăm sóc</TableHead>
                    <TableHead>Sale tạo</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Tiềm năng</TableHead>
                    <TableHead>Trạng thái chăm sóc</TableHead>
                    <TableHead>Kết quả bán hàng</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center h-24">
                        Không tìm thấy lead nào phù hợp
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => handleSelectLead(lead.id)}
                            aria-label={`Chọn lead ${lead.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.product}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenHistory(lead)}
                            className="flex items-center"
                          >
                            <History className="h-4 w-4 mr-1" />
                            Lịch sử
                          </Button>
                        </TableCell>
                        <TableCell>{lead.createdBy.name}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "capitalize",
                            lead.potential === "tiềm năng" ? "bg-green-100 text-green-800" :
                            lead.potential === "không tiềm năng" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {lead.potential}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "capitalize",
                            lead.status === "đang làm việc" ? "bg-blue-100 text-blue-800" :
                            lead.status === "đang suy nghĩ" ? "bg-amber-100 text-amber-800" :
                            lead.status === "im ru" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                          )}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "capitalize",
                            lead.result === "ký hợp đồng" ? "bg-green-100 text-green-800" :
                            lead.result === "đang trao đổi" ? "bg-blue-100 text-blue-800" :
                            lead.result === "chưa quyết định" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          )}>
                            {lead.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xem chi tiết</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <PenLine className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chỉnh sửa</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xóa</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
      
      {/* Dialog Lịch sử chăm sóc */}
      <LeadHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        leadName={selectedLeadName}
        history={selectedLeadHistory}
      />
    </MainLayout>
  );
};

export default LeadsPage;