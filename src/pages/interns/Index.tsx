import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, List, Clock, CheckCircle, AlertTriangle, Eye, ExternalLink, TrendingUp, Edit, Trash2, Play, Calendar as CalendarIcon, Archive, RotateCcw, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { InternTask, Personnel } from '@/types';
import { InternTaskFormDialog } from '@/components/interns/InternTaskFormDialog';
import { InternTaskDetailsDialog } from '@/components/interns/InternTaskDetailsDialog';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { startOfToday, startOfWeek, endOfWeek, subDays, differenceInDays } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const StatCard = ({ icon, title, value, subtitle, iconBgColor, onClick, isActive }: { icon: React.ElementType, title: string, value: number, subtitle: string, iconBgColor: string, onClick?: () => void, isActive?: boolean }) => {
  const Icon = icon;
  return (
    <Card 
      className={cn("shadow-sm hover:shadow-md transition-shadow cursor-pointer", isActive && "ring-2 ring-blue-500")}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardContent>
    </Card>
  );
};

const InternsPage = () => {
  const [tasks, setTasks] = useState<InternTask[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [internFilter, setInternFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<InternTask | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<InternTask | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, personnelRes] = await Promise.all([
      supabase.from("intern_tasks").select("*").order('deadline', { ascending: true }),
      supabase.from("personnel").select("*").eq('role', 'Thực tập'),
    ]);

    if (tasksRes.error) {
      showError("Lỗi khi tải dữ liệu công việc.");
    } else {
      setTasks(tasksRes.data as InternTask[]);
    }

    if (personnelRes.error) {
      showError("Lỗi khi tải dữ liệu thực tập sinh.");
    } else {
      setPersonnel(personnelRes.data as Personnel[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const interns = useMemo(() => personnel.filter(p => p.role === 'Thực tập'), [personnel]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!!task.archived !== showArchived) return false;

      const taskDate = new Date(task.deadline);
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        dateMatch = taskDate >= dateRange.from && taskDate <= dateRange.to;
      } else if (dateRange?.from) {
        dateMatch = taskDate >= dateRange.from;
      }

      const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Hoàn thành';
      let statusMatch = true;
      if (statusFilter === 'Quá hạn') {
        statusMatch = isOverdue;
      } else if (statusFilter !== 'all') {
        statusMatch = task.status === statusFilter;
      }

      return (
        (task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.intern_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (internFilter === 'all' || task.intern_name === internFilter) &&
        statusMatch &&
        dateMatch
      );
    });
  }, [tasks, searchTerm, internFilter, statusFilter, dateRange, showArchived]);

  const stats = useMemo(() => ({
    total: filteredTasks.length,
    inProgress: filteredTasks.filter(t => t.status === 'Đang làm').length,
    completed: filteredTasks.filter(t => t.status === 'Hoàn thành').length,
    overdue: filteredTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Hoàn thành').length,
  }), [filteredTasks]);

  const handleOpenAddDialog = () => {
    setActiveTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (task: InternTask) => {
    setActiveTask(task);
    setIsFormOpen(true);
  };

  const handleOpenDetailsDialog = (task: InternTask) => {
    setActiveTask(task);
    setIsDetailsOpen(true);
  };

  const handleOpenDeleteDialog = (task: InternTask) => {
    setTaskToDelete(task);
    setIsDeleteAlertOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    const dataToSave = { ...taskData, assigner_name: "Admin" }; // Mock assigner name
    if (activeTask && activeTask.id) {
      const { error } = await supabase.from('intern_tasks').update(dataToSave).eq('id', activeTask.id);
      if (error) showError("Lỗi khi cập nhật công việc.");
      else showSuccess("Công việc đã được cập nhật!");
    } else {
      const { error } = await supabase.from('intern_tasks').insert([{ ...dataToSave, status: 'Chưa làm' }]);
      if (error) showError("Lỗi khi giao việc mới.");
      else showSuccess("Đã giao việc mới thành công!");
    }
    fetchData();
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    const { error } = await supabase.from('intern_tasks').delete().eq('id', taskToDelete.id);
    if (error) showError("Lỗi khi xóa công việc.");
    else showSuccess("Đã xóa công việc.");
    fetchData();
    setIsDeleteAlertOpen(false);
    setTaskToDelete(null);
  };

  const handleUpdateStatus = async (task: InternTask, newStatus: InternTask['status']) => {
    let updateData: Partial<InternTask> = { status: newStatus };
    if (newStatus === 'Đang làm' && !task.started_at) {
      updateData.started_at = new Date().toISOString();
    } else if (newStatus === 'Hoàn thành') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('intern_tasks').update(updateData).eq('id', task.id);
    if (error) showError("Lỗi khi cập nhật trạng thái.");
    else {
      showSuccess("Đã cập nhật trạng thái công việc.");
      fetchData();
    }
  };

  const handleBulkAction = async (action: 'archive' | 'restore' | 'delete') => {
    if (selectedTasks.length === 0) return;
    if (action === 'delete') {
      const { error } = await supabase.from('intern_tasks').delete().in('id', selectedTasks);
      if (error) showError("Lỗi khi xóa hàng loạt.");
      else showSuccess(`Đã xóa ${selectedTasks.length} công việc.`);
    } else {
      const { error } = await supabase.from('intern_tasks').update({ archived: action === 'archive' }).in('id', selectedTasks);
      if (error) showError(`Lỗi khi ${action === 'archive' ? 'lưu trữ' : 'khôi phục'} công việc.`);
      else showSuccess(`Đã ${action === 'archive' ? 'lưu trữ' : 'khôi phục'} ${selectedTasks.length} công việc.`);
    }
    fetchData();
    setSelectedTasks([]);
  };

  const getStatusBadgeStyle = (status: InternTask['status'], isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-800';
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const setDateFilter = (filter: 'today' | 'yesterday' | 'thisWeek') => {
    const today = new Date();
    if (filter === 'today') {
      setDateRange({ from: startOfToday(), to: startOfToday() });
    } else if (filter === 'yesterday') {
      const yesterday = subDays(today, 1);
      setDateRange({ from: yesterday, to: yesterday });
    } else if (filter === 'thisWeek') {
      setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Giao việc thực tập sinh</h1>
            <p className="text-muted-foreground">Quản lý và theo dõi công việc được giao cho thực tập sinh</p>
          </div>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Giao việc mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={List} title="Tổng số việc" value={stats.total} subtitle="Tất cả công việc" iconBgColor="bg-blue-500" onClick={() => setStatusFilter('all')} isActive={statusFilter === 'all'} />
          <StatCard icon={Clock} title="Đang thực hiện" value={stats.inProgress} subtitle="Công việc đang chạy" iconBgColor="bg-cyan-500" onClick={() => setStatusFilter('Đang làm')} isActive={statusFilter === 'Đang làm'} />
          <StatCard icon={CheckCircle} title="Hoàn thành" value={stats.completed} subtitle="Công việc đã xong" iconBgColor="bg-green-500" onClick={() => setStatusFilter('Hoàn thành')} isActive={statusFilter === 'Hoàn thành'} />
          <StatCard icon={AlertTriangle} title="Quá hạn" value={stats.overdue} subtitle="Công việc trễ deadline" iconBgColor="bg-red-500" onClick={() => setStatusFilter('Quá hạn')} isActive={statusFilter === 'Quá hạn'} />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Tìm kiếm công việc..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <Select value={internFilter} onValueChange={setInternFilter}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Lọc theo thực tập sinh" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả thực tập sinh</SelectItem>{interns.map(intern => <SelectItem key={intern.id} value={intern.name}>{intern.name}</SelectItem>)}</SelectContent></Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setDateFilter('today')}>Hôm nay</Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setDateFilter('yesterday')}>Hôm qua</Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setDateFilter('thisWeek')}>Tuần này</Button>
              </div>
              <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>{showArchived ? <List className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{showArchived ? "Công việc hoạt động" : "Công việc đã lưu trữ"}</Button>
        </div>
        
        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleBulkAction(showArchived ? 'restore' : 'archive')}>
              {showArchived ? <RotateCcw className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {showArchived ? 'Khôi phục' : 'Lưu trữ'} ({selectedTasks.length})
            </Button>
            <Button variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="mr-2 h-4 w-4" />Xóa ({selectedTasks.length})</Button>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => setSelectedTasks(checked ? filteredTasks.map(t => t.id) : [])} /></TableHead>
                <TableHead className="w-[25%]">CÔNG VIỆC</TableHead>
                <TableHead>CMT</TableHead>
                <TableHead>POST</TableHead>
                <TableHead>FILE</TableHead>
                <TableHead>DEADLINE</TableHead>
                <TableHead>NGƯỜI GIAO</TableHead>
                <TableHead>NGƯỜI NHẬN</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead>HÀNH ĐỘNG</TableHead>
                <TableHead>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={11} className="text-center">Đang tải...</TableCell></TableRow> :
              filteredTasks.map(task => {
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Hoàn thành';
                const overdueDays = isOverdue ? differenceInDays(new Date(), new Date(task.deadline)) : 0;
                const completedLate = task.status === 'Hoàn thành' && task.completed_at && (new Date(task.completed_at) > new Date(task.deadline));
                const displayStatus = isOverdue ? 'Quá hạn' : task.status;

                return (
                <TableRow key={task.id} className={cn(completedLate && "bg-red-50")}>
                  <TableCell><Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={(checked) => setSelectedTasks(checked ? [...selectedTasks, task.id] : selectedTasks.filter(id => id !== task.id))} /></TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate cursor-pointer hover:underline" onClick={() => handleOpenDetailsDialog(task)}>{task.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{task.comment_count}</div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">{task.post_count}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <a href={task.work_link} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:text-blue-800 inline-block">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </TableCell>
                  <TableCell className={cn(isOverdue && "text-red-600")}>
                    {new Date(task.deadline).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {isOverdue && (
                      <div className="flex items-center font-bold mt-1 text-xs">
                        <AlertCircleIcon className="h-3 w-3 mr-1" />
                        <span>Trễ {overdueDays} ngày</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{task.assigner_name}</TableCell>
                  <TableCell>{task.intern_name}</TableCell>
                  <TableCell><Badge className={cn("capitalize", getStatusBadgeStyle(task.status, isOverdue))}>{displayStatus}</Badge></TableCell>
                  <TableCell>
                    {task.status !== 'Hoàn thành' && (
                      <Button 
                        size="sm" 
                        className={cn(task.status === 'Chưa làm' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600')}
                        onClick={() => handleUpdateStatus(task, task.status === 'Chưa làm' ? 'Đang làm' : 'Hoàn thành')}
                      >
                        {task.status === 'Chưa làm' ? <><Play className="mr-2 h-4 w-4" />Bắt đầu</> : <><CheckCircle className="mr-2 h-4 w-4" />Hoàn thành</>}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDetailsDialog(task)}><Eye className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(task)}><Edit className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(task)}><Trash2 className="h-5 w-5 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </div>
      <InternTaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTask}
        task={activeTask}
        interns={interns}
      />
      <InternTaskDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={activeTask}
      />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Công việc "{taskToDelete?.title}" sẽ bị xóa vĩnh viễn.
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

export default InternsPage;