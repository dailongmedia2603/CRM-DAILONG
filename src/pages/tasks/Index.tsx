import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TaskStatsCard } from "@/components/tasks/TaskStatsCard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Task } from "@/data/tasks";
import { Personnel } from "@/data/personnel";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { format, isToday, isPast } from 'date-fns';
import { AlertTriangle, Clock, Activity, Calendar, Zap, Search, LayoutGrid, Trash2, CheckSquare, Plus, Eye, Edit } from "lucide-react";

interface TasksPageProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  personnel: Personnel[];
}

const TasksPage = ({ tasks, setTasks, personnel }: TasksPageProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      urgent: tasks.filter(t => t.priority === 'Gấp' && t.status !== 'Hoàn thành').length,
      todo: tasks.filter(t => t.status === 'Chưa làm').length,
      inProgress: tasks.filter(t => t.status === 'Đang làm').length,
      dueToday: tasks.filter(t => t.deadline && isToday(new Date(t.deadline)) && t.status !== 'Hoàn thành').length,
      overdue: tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)) && t.status !== 'Hoàn thành').length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => {
      const searchMatch = searchTerm === '' || task.name.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;

      if (filter === 'all') return true;
      if (filter === 'urgent') return task.priority === 'Gấp';
      if (filter === 'todo') return task.status === 'Chưa làm';
      if (filter === 'inProgress') return task.status === 'Đang làm';
      if (filter === 'dueToday') return task.deadline && isToday(new Date(task.deadline));
      if (filter === 'overdue') return task.deadline && isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline)) && task.status !== 'Hoàn thành';
      return true;
    });
  }, [tasks, filter, searchTerm]);

  const handleSaveTask = (taskData: any) => {
    let updatedTasks;
    if (taskToEdit) {
      updatedTasks = tasks.map(t => t.id === taskToEdit.id ? { ...t, ...taskData, id: t.id, completed: t.completed, feedbackCount: t.feedbackCount } : t);
      showSuccess("Công việc đã được cập nhật!");
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        completed: false,
        feedbackCount: 0,
        ...taskData,
      };
      updatedTasks = [...tasks, newTask];
      showSuccess("Công việc mới đã được thêm!");
    }
    setTasks(updatedTasks);
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const handleDeleteSelected = () => {
    const updatedTasks = tasks.filter(t => !selectedTasks.includes(t.id));
    setTasks(updatedTasks);
    setSelectedTasks([]);
    setIsDeleteAlertOpen(false);
    showSuccess(`${selectedTasks.length} công việc đã được xóa.`);
  };

  const handleMarkAsComplete = () => {
    const updatedTasks = tasks.map(t => selectedTasks.includes(t.id) ? { ...t, status: 'Hoàn thành', completed: true } : t);
    setTasks(updatedTasks);
    setSelectedTasks([]);
    showSuccess(`${selectedTasks.length} công việc đã được đánh dấu hoàn thành.`);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? filteredTasks.map(t => t.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedTasks(prev => checked ? [...prev, id] : prev.filter(taskId => taskId !== id));
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    if (priority === 'Gấp') return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 'Bình thường') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: Task['status']) => {
    if (status === 'Đang làm') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'Chưa làm') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'Hoàn thành') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Công việc</h1>
          <p className="text-muted-foreground">Quản lý các công việc nội bộ giữa các bộ phận</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <TaskStatsCard title="Gấp" value={stats.urgent} description="Ưu tiên cao" icon={AlertTriangle} color="red" onClick={() => setFilter('urgent')} />
          <TaskStatsCard title="Chưa làm" value={stats.todo} description="Chờ xử lý" icon={Clock} color="yellow" onClick={() => setFilter('todo')} />
          <TaskStatsCard title="Đang làm" value={stats.inProgress} description="Đang thực hiện" icon={Activity} color="blue" onClick={() => setFilter('inProgress')} />
          <TaskStatsCard title="Đến deadline" value={stats.dueToday} description="Hôm nay" icon={Calendar} color="orange" onClick={() => setFilter('dueToday')} />
          <TaskStatsCard title="Trễ deadline" value={stats.overdue} description="Quá hạn" icon={Zap} color="purple" onClick={() => setFilter('overdue')} />
        </div>

        <div className="bg-white p-4 rounded-lg border flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm công việc..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline"><LayoutGrid className="mr-2 h-4 w-4" /> Kanban</Button>
            {selectedTasks.length > 0 && (
              <>
                <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Xóa ({selectedTasks.length})</Button>
                <Button variant="outline" onClick={handleMarkAsComplete}><CheckSquare className="mr-2 h-4 w-4" /> Đã hoàn thành</Button>
              </>
            )}
          </div>
          <Button onClick={() => { setTaskToEdit(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm công việc
          </Button>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><Checkbox checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>TÊN CÔNG VIỆC</TableHead>
                <TableHead>NỘI DUNG CHI TIẾT</TableHead>
                <TableHead>ƯU TIÊN</TableHead>
                <TableHead>DEADLINE</TableHead>
                <TableHead>FEEDBACK</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead>THỰC HIỆN</TableHead>
                <TableHead>THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell><Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={(checked) => handleSelectRow(task.id, !!checked)} /></TableCell>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{task.description}</TableCell>
                  <TableCell><Badge variant="outline" className={cn(getPriorityBadge(task.priority))}>{task.priority}</Badge></TableCell>
                  <TableCell>{task.deadline ? format(new Date(task.deadline), 'HH:mm dd/MM/yyyy') : 'Không có'}</TableCell>
                  <TableCell><Button variant="outline" size="sm">Feedback {task.feedbackCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{task.feedbackCount}</Badge>}</Button></TableCell>
                  <TableCell><Badge variant="outline" className={cn(getStatusBadge(task.status))}>{task.status}</Badge></TableCell>
                  <TableCell>
                    <Select value={task.assigneeId || ''} onValueChange={(value) => handleSaveTask({ ...task, assigneeId: value })}>
                      <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Chưa giao</SelectItem>
                        {personnel.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setTaskToEdit(task); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedTasks([task.id]); setIsDeleteAlertOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <TaskFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveTask} task={taskToEdit} personnel={personnel} />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này sẽ xóa {selectedTasks.length} công việc đã chọn và không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTasks([])}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TasksPage;