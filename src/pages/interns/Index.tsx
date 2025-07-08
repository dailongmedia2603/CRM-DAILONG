import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, List, Clock, CheckCircle, AlertTriangle, Eye, ExternalLink, TrendingUp, Edit, Trash2, Play, Calendar as CalendarIcon } from 'lucide-react';
import { InternTask, Personnel } from '@/types';
import { InternTaskFormDialog } from '@/components/interns/InternTaskFormDialog';
import { InternTaskDetailsDialog } from '@/components/interns/InternTaskDetailsDialog';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { startOfToday, startOfWeek, endOfWeek, subDays, isSameDay, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StatCard = ({ icon, title, value, subtitle, iconBgColor }: { icon: React.ElementType, title: string, value: number, subtitle: string, iconBgColor: string }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: startOfToday(), to: startOfToday() });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<InternTask | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<InternTask | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, personnelRes] = await Promise.all([
      supabase.from("intern_tasks").select("*").order('deadline', { ascending: true }),
      supabase.from("personnel").select("*"),
    ]);

    if (tasksRes.error) showError("Lỗi khi tải dữ liệu công việc.");
    else {
      const today = startOfToday();
      const updatedTasks = tasksRes.data.map(task => {
        if (new Date(task.deadline) < today && task.status !== 'Hoàn thành') {
          return { ...task, status: 'Quá hạn' };
        }
        return task;
      });
      setTasks(updatedTasks as InternTask[]);
    }

    if (personnelRes.error) showError("Lỗi khi tải dữ liệu nhân sự.");
    else setPersonnel(personnelRes.data as Personnel[]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const interns = useMemo(() => personnel.filter(p => p.role === 'Thực tập'), [personnel]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.intern_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIntern = internFilter === 'all' || task.intern_name === internFilter;

      const taskDate = new Date(task.created_at);
      const matchesDate = dateRange?.from ? 
        (task.status !== 'Hoàn thành' || (task.status === 'Hoàn thành' && isSameDay(taskDate, dateRange.from))) &&
        taskDate >= dateRange.from && taskDate <= (dateRange.to || dateRange.from)
        : true;

      return matchesSearch && matchesIntern && matchesDate;
    });
  }, [tasks, searchTerm, internFilter, dateRange]);

  const stats = useMemo(() => ({
    total: filteredTasks.length,
    inProgress: filteredTasks.filter(t => t.status === 'Đang làm').length,
    completed: filteredTasks.filter(t => t.status === 'Hoàn thành').length,
    overdue: filteredTasks.filter(t => t.status === 'Quá hạn').length,
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
    const dataToSave = { ...taskData, assigner_name: "Admin" }; // Mock user
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
    if (newStatus === 'Đang làm') updateData.started_at = new Date().toISOString();
    else if (newStatus === 'Hoàn thành') updateData.completed_at = new Date().toISOString();

    const { error } = await supabase.from('intern_tasks').update(updateData).eq('id', task.id);
    if (error) showError("Lỗi khi cập nhật trạng thái.");
    else {
      showSuccess("Đã cập nhật trạng thái công việc.");
      fetchData();
    }
  };

  const getStatusBadge = (status: InternTask['status']) => {
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      case 'Quá hạn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
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
          <StatCard icon={List} title="Tổng số việc" value={stats.total} subtitle="Tất cả công việc" iconBgColor="bg-blue-500" />
          <StatCard icon={Clock} title="Đang thực hiện" value={stats.inProgress} subtitle="Công việc đang chạy" iconBgColor="bg-cyan-500" />
          <StatCard icon={CheckCircle} title="Hoàn thành" value={stats.completed} subtitle="Công việc đã xong" iconBgColor="bg-green-500" />
          <StatCard icon={AlertTriangle} title="Quá hạn" value={stats.overdue} subtitle="Công việc trễ deadline" iconBgColor="bg-red-500" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Tìm kiếm công việc hoặc thực tập sinh..." className="pl-10 py-6 text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={internFilter} onValueChange={setInternFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Lọc theo thực tập sinh" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thực tập sinh</SelectItem>
              {interns.map(intern => <SelectItem key={intern.id} value={intern.name}>{intern.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "dd/MM/y")} - ${format(dateRange.to, "dd/MM/y")}` : format(dateRange.from, "dd/MM/y")) : <span>Chọn ngày...</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar locale={vi} mode="range" selected={dateRange} onSelect={handleDateSelect} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[30%]">CÔNG VIỆC</TableHead>
                <TableHead>NGƯỜI GIAO</TableHead>
                <TableHead>THỰC TẬP SINH</TableHead>
                <TableHead>DEADLINE</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead>HÀNH ĐỘNG</TableHead>
                <TableHead>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow> :
              filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="max-w-xs cursor-pointer" onClick={() => handleOpenDetailsDialog(task)}>
                      <p className="font-medium truncate hover:underline">{task.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{task.assigner_name}</TableCell>
                  <TableCell>{task.intern_name}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell><Badge className={cn("capitalize", getStatusBadge(task.status))}>{task.status}</Badge></TableCell>
                  <TableCell>
                    {task.status === 'Chưa làm' && <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => handleUpdateStatus(task, 'Đang làm')}><Play className="mr-2 h-4 w-4" />Bắt đầu</Button>}
                    {task.status === 'Đang làm' && <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateStatus(task, 'Hoàn thành')}><CheckCircle className="mr-2 h-4 w-4" />Hoàn thành</Button>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDetailsDialog(task)}><Eye className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(task)}><Edit className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(task)}><Trash2 className="h-5 w-5 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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