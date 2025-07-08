import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Search, Trash2, CalendarIcon, Eye, Edit, Play, CheckCircle, MessageSquare, List, ArrowLeft, AlertTriangle, Clock, ChevronDown } from "lucide-react";
import { TaskStatsCard } from "@/components/task-management/TaskStatsCard";
import { TaskFormDialog } from "@/components/task-management/TaskFormDialog";
import { FeedbackDialog } from "@/components/task-management/FeedbackDialog";
import { DescriptionDialog } from "@/components/task-management/DescriptionDialog";
import { Task, Feedback, Personnel } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { format, startOfDay, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const TasksManagementPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [dialogs, setDialogs] = useState({ form: false, feedback: false, description: false, delete: false });
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const currentUser = useMemo(() => {
    if (personnel.length > 0) {
      return { id: personnel[0].id, name: personnel[0].name };
    }
    return { id: '', name: '' };
  }, [personnel]);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, personnelRes] = await Promise.all([
      supabase.from("tasks").select("*, assigner:personnel!tasks_assigner_id_fkey(*), assignee:personnel!tasks_assignee_id_fkey(*), feedback(*)"),
      supabase.from("personnel").select("*"),
    ]);

    if (tasksRes.error) {
      showError("Lỗi khi tải dữ liệu công việc.");
      console.error(tasksRes.error);
    } else {
      const tasksWithFeedback = tasksRes.data.map(task => ({
        ...task,
        feedbackHistory: task.feedback || [],
      }));
      setTasks(tasksWithFeedback as any[]);
    }

    if (personnelRes.error) {
      showError("Lỗi khi tải dữ liệu nhân sự.");
      console.error(personnelRes.error);
    } else {
      setPersonnel(personnelRes.data as Personnel[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (dateFilter) filtered = filtered.filter(task => isSameDay(new Date(task.created_at), dateFilter));
    if (searchTerm) filtered = filtered.filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') filtered = filtered.filter(task => task.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(task => task.priority === priorityFilter);
    filtered = filtered.filter(task => showCompleted ? task.status === 'Hoàn thành' : task.status !== 'Hoàn thành');
    return filtered;
  }, [tasks, dateFilter, searchTerm, statusFilter, priorityFilter, showCompleted]);

  const stats = useMemo(() => {
    const relevantTasks = dateFilter ? tasks.filter(task => isSameDay(new Date(task.created_at), dateFilter)) : tasks;
    return {
      total: relevantTasks.length,
      todo: relevantTasks.filter(t => t.status === 'Chưa làm').length,
      completed: relevantTasks.filter(t => t.status === 'Hoàn thành').length,
      high: relevantTasks.filter(t => t.priority === 'Cao').length,
      medium: relevantTasks.filter(t => t.priority === 'Trung bình').length,
      low: relevantTasks.filter(t => t.priority === 'Thấp').length,
    };
  }, [tasks, dateFilter]);

  const handleStatClick = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') {
      setStatusFilter(value);
      setPriorityFilter('all');
      setShowCompleted(value === 'Hoàn thành');
    } else {
      setPriorityFilter(value);
      setStatusFilter('all');
    }
  };

  const openDialog = (name: keyof typeof dialogs, task?: Task) => {
    setActiveTask(task || null);
    setDialogs(prev => ({ ...prev, [name]: true }));
  };
  const closeDialog = (name: keyof typeof dialogs) => setDialogs(prev => ({ ...prev, [name]: false }));

  const handleSaveTask = async (data: any) => {
    const { id, ...taskData } = data;
    if (activeTask) {
      const { error } = await supabase.from('tasks').update(taskData).eq('id', activeTask.id);
      if (error) {
        console.error("Update Error:", error);
        showError("Lỗi khi cập nhật công việc.");
      } else {
        showSuccess("Cập nhật công việc thành công!");
      }
    } else {
      if (!taskData.assigner_id) {
        showError("Không thể tạo công việc: thiếu người giao việc.");
        return;
      }
      const { error } = await supabase.from('tasks').insert([taskData]);
      if (error) {
        console.error("Insert Error:", error);
        showError("Lỗi khi thêm công việc mới.");
      } else {
        showSuccess("Thêm công việc mới thành công!");
      }
    }
    fetchData();
    closeDialog('form');
  };

  const handleDelete = async (task: Task) => {
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) showError("Lỗi khi xóa công việc.");
    else showSuccess("Đã xóa công việc.");
    fetchData();
    closeDialog('delete');
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase.from('tasks').delete().in('id', selectedTasks);
    if (error) showError("Lỗi khi xóa hàng loạt.");
    else showSuccess(`Đã xóa ${selectedTasks.length} công việc.`);
    fetchData();
    setSelectedTasks([]);
  };

  const handleActionClick = async (task: Task) => {
    const newStatus = task.status === 'Chưa làm' ? 'Đang làm' : 'Hoàn thành';
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    if (error) showError("Lỗi khi cập nhật trạng thái.");
    else showSuccess(`Đã ${newStatus === 'Đang làm' ? 'bắt đầu' : 'hoàn thành'} công việc.`);
    fetchData();
  };

  const handleAddFeedback = async (message: string) => {
    if (!activeTask) return;
    const newFeedback = { task_id: activeTask.id, user_id: currentUser.id, user_name: currentUser.name, message };
    const { error } = await supabase.from('feedback').insert([newFeedback]);
    if (error) showError("Lỗi khi gửi feedback.");
    else fetchData();
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    if (priority === 'Cao') return 'bg-red-100 text-red-800';
    if (priority === 'Trung bình') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Quản lý Công việc</h1><p className="text-muted-foreground">Quản lý công việc nội bộ của agency.</p></div>
          <Popover><PopoverTrigger asChild><Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" />{dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Chọn ngày"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} /></PopoverContent></Popover>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <TaskStatsCard title="Tổng Task" value={stats.total.toString()} subtitle="Tất cả công việc" icon={List} iconBgColor="bg-blue-500" onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }} isActive={statusFilter === 'all' && priorityFilter === 'all'} />
          <TaskStatsCard title="Chưa làm" value={stats.todo.toString()} subtitle="Công việc cần bắt đầu" icon={Play} iconBgColor="bg-cyan-500" onClick={() => handleStatClick('status', 'Chưa làm')} isActive={statusFilter === 'Chưa làm'} />
          <TaskStatsCard title="Hoàn thành" value={stats.completed.toString()} subtitle="Công việc đã xong" icon={CheckCircle} iconBgColor="bg-green-500" onClick={() => handleStatClick('status', 'Hoàn thành')} isActive={statusFilter === 'Hoàn thành'} />
          <TaskStatsCard title="Ưu tiên Cao" value={stats.high.toString()} subtitle="Cần làm ngay" icon={AlertTriangle} iconBgColor="bg-red-500" onClick={() => handleStatClick('priority', 'Cao')} isActive={priorityFilter === 'Cao'} />
          <TaskStatsCard title="Ưu tiên TB" value={stats.medium.toString()} subtitle="Theo kế hoạch" icon={Clock} iconBgColor="bg-amber-500" onClick={() => handleStatClick('priority', 'Trung bình')} isActive={priorityFilter === 'Trung bình'} />
          <TaskStatsCard title="Ưu tiên Thấp" value={stats.low.toString()} subtitle="Làm sau" icon={ChevronDown} iconBgColor="bg-gray-500" onClick={() => handleStatClick('priority', 'Thấp')} isActive={priorityFilter === 'Thấp'} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem><SelectItem value="Chưa làm">Chưa làm</SelectItem><SelectItem value="Đang làm">Đang làm</SelectItem><SelectItem value="Hoàn thành">Hoàn thành</SelectItem></SelectContent></Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Ưu tiên" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả ưu tiên</SelectItem><SelectItem value="Cao">Cao</SelectItem><SelectItem value="Trung bình">Trung bình</SelectItem><SelectItem value="Thấp">Thấp</SelectItem></SelectContent></Select>
            {selectedTasks.length > 0 && <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" />Xóa ({selectedTasks.length})</Button>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCompleted(!showCompleted)}>{showCompleted ? <><ArrowLeft className="mr-2 h-4 w-4" />Trở về</> : <><List className="mr-2 h-4 w-4" />CV Hoàn thành</>}</Button>
            <Button onClick={() => openDialog('form')} disabled={loading || !currentUser.id}><PlusCircle className="mr-2 h-4 w-4" />Thêm công việc</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow><TableHead className="w-12"><Checkbox /></TableHead><TableHead>Tên công việc</TableHead><TableHead>Mô tả</TableHead><TableHead>Deadline</TableHead><TableHead>Ưu tiên</TableHead><TableHead>Feedback</TableHead><TableHead>Trạng thái</TableHead><TableHead>Action</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={9} className="text-center">Đang tải...</TableCell></TableRow> :
              filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{task.name}</TableCell>
                  <TableCell><Button variant="outline" size="sm" onClick={() => openDialog('description', task)}>Chi tiết</Button></TableCell>
                  <TableCell>{format(new Date(task.deadline), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell><Badge variant="outline" className={cn(getPriorityBadge(task.priority))}>{task.priority}</Badge></TableCell>
                  <TableCell><Button variant="outline" size="sm" onClick={() => openDialog('feedback', task)} className={cn({ "text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700 font-bold": task.feedbackHistory.length > 0 })}><MessageSquare className="mr-2 h-4 w-4" />{task.feedbackHistory.length}</Button></TableCell>
                  <TableCell><Badge variant={task.status === 'Hoàn thành' ? 'default' : 'secondary'} className={cn({'bg-green-500': task.status === 'Hoàn thành'})}>{task.status}</Badge></TableCell>
                  <TableCell>{task.status !== 'Hoàn thành' && (<Button size="sm" onClick={() => handleActionClick(task)} className={cn(task.status === 'Chưa làm' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white')}>{task.status === 'Chưa làm' ? <><Play className="mr-2 h-4 w-4" />Bắt đầu</> : <><CheckCircle className="mr-2 h-4 w-4" />Hoàn thành</>}</Button>)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog('description', task)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openDialog('form', task)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openDialog('delete', task)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskFormDialog open={dialogs.form} onOpenChange={() => closeDialog('form')} onSave={handleSaveTask} task={activeTask} personnel={personnel} currentUser={currentUser} />
      {activeTask && <FeedbackDialog open={dialogs.feedback} onOpenChange={() => closeDialog('feedback')} taskName={activeTask.name} history={activeTask.feedbackHistory} onAddFeedback={handleAddFeedback} />}
      {activeTask && <DescriptionDialog open={dialogs.description} onOpenChange={() => closeDialog('description')} title={activeTask.name} description={activeTask.description} />}
      {activeTask && <AlertDialog open={dialogs.delete} onOpenChange={() => closeDialog('delete')}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle><AlertDialogDescription>Hành động này sẽ xóa vĩnh viễn công việc "{activeTask.name}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(activeTask)}>Xóa</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
    </MainLayout>
  );
};

export default TasksManagementPage;