import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TaskStatsCard } from "@/components/tasks/TaskStatsCard";
import { TaskDetailsDialog } from "@/components/tasks/TaskDetailsDialog";
import { FeedbackDialog } from "@/components/tasks/FeedbackDialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Task, tasksData as initialTasks, FeedbackMessage } from "@/data/tasks";
import { Personnel, personnelData as initialPersonnel } from "@/data/personnel";
import { getTasks, setTasks } from "@/utils/storage";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, Calendar, Zap, PlusCircle, Search, LayoutGrid, CheckCircle, Trash2, Eye, Edit, MessageSquare } from "lucide-react";

const TasksPage = () => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [personnel] = useState<Personnel[]>(initialPersonnel); // Assuming personnel data is static for now
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    const storedTasks = getTasks();
    setTasksState(storedTasks ?? initialTasks);
  }, []);

  const handleSetTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    setTasks(newTasks);
  };

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return {
      urgent: tasks.filter(t => t.priority === 'Gấp' && !t.completed).length,
      todo: tasks.filter(t => t.status === 'Chưa làm' && !t.completed).length,
      inProgress: tasks.filter(t => t.status === 'Đang làm' && !t.completed).length,
      dueToday: tasks.filter(t => t.deadline && new Date(t.deadline).setHours(0, 0, 0, 0) === today && !t.completed).length,
      overdue: tasks.filter(t => t.deadline && new Date(t.deadline).getTime() < today && !t.completed).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    const today = new Date().setHours(0, 0, 0, 0);

    if (activeFilter) {
      switch (activeFilter) {
        case 'urgent': filtered = filtered.filter(t => t.priority === 'Gấp'); break;
        case 'todo': filtered = filtered.filter(t => t.status === 'Chưa làm'); break;
        case 'inProgress': filtered = filtered.filter(t => t.status === 'Đang làm'); break;
        case 'dueToday': filtered = filtered.filter(t => t.deadline && new Date(t.deadline).setHours(0, 0, 0, 0) === today); break;
        case 'overdue': filtered = filtered.filter(t => t.deadline && new Date(t.deadline).getTime() < today && !t.completed); break;
      }
    }

    if (showCompleted) {
      filtered = filtered.filter(t => t.status === 'Hoàn thành');
    } else {
      filtered = filtered.filter(t => t.status !== 'Hoàn thành');
    }

    if (searchTerm) {
      filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [tasks, searchTerm, activeFilter, showCompleted]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(prev => (prev === filter ? null : filter));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? filteredTasks.map(t => t.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedTasks(prev => checked ? [...prev, id] : prev.filter(taskId => taskId !== id));
  };

  const openDialog = (dialogSetter: (open: boolean) => void, task: Task | null = null) => {
    setCurrentTask(task);
    dialogSetter(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'feedback' | 'completed'> & { id?: string }) => {
    let newTasks;
    if (taskData.id) {
      newTasks = tasks.map(t => t.id === taskData.id ? { ...t, ...taskData, deadline: taskData.deadline || null } : t);
      showSuccess("Công việc đã được cập nhật.");
    } else {
      const newTask: Task = {
        ...taskData,
        id: `TASK-${Date.now()}`,
        createdAt: new Date().toISOString(),
        feedback: [],
        completed: taskData.status === 'Hoàn thành',
        deadline: taskData.deadline || null,
      };
      newTasks = [...tasks, newTask];
      showSuccess("Đã thêm công việc mới.");
    }
    handleSetTasks(newTasks);
  };

  const handleDelete = () => {
    const idsToDelete = currentTask ? [currentTask.id] : selectedTasks;
    const newTasks = tasks.filter(t => !idsToDelete.includes(t.id));
    handleSetTasks(newTasks);
    showSuccess(`Đã xóa ${idsToDelete.length} công việc.`);
    setSelectedTasks([]);
    setDeleteAlertOpen(false);
    setCurrentTask(null);
  };

  const handleAddFeedback = (message: string) => {
    if (!currentTask) return;
    const newFeedback: FeedbackMessage = {
      id: `f-${Date.now()}`,
      userId: 'user-1', // Mock current user
      userName: 'Quản Trị Viên',
      message,
      timestamp: new Date().toISOString(),
      version: `v${currentTask.feedback.length + 1}`,
    };
    const newTasks = tasks.map(t => t.id === currentTask.id ? { ...t, feedback: [...t.feedback, newFeedback] } : t);
    handleSetTasks(newTasks);
    setCurrentTask(newTasks.find(t => t.id === currentTask.id) || null);
  };

  const handleAssigneeChange = (taskId: string, assigneeId: string) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, assigneeId } : t);
    handleSetTasks(newTasks);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, status, completed: status === 'Hoàn thành' } : t);
    handleSetTasks(newTasks);
  };

  const priorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Gấp': return 'bg-red-100 text-red-600 border-red-200';
      case 'Bình thường': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Thấp': return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Công việc</h1>
          <p className="text-muted-foreground">Quản lý các công việc nội bộ giữa các bộ phận</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <TaskStatsCard title="Gấp" value={stats.urgent} description="Ưu tiên cao" icon={Clock} color="red" onClick={() => handleFilterClick('urgent')} isActive={activeFilter === 'urgent'} />
          <TaskStatsCard title="Chưa làm" value={stats.todo} description="Chờ xử lý" icon={AlertTriangle} color="yellow" onClick={() => handleFilterClick('todo')} isActive={activeFilter === 'todo'} />
          <TaskStatsCard title="Đang làm" value={stats.inProgress} description="Đang thực hiện" icon={Zap} color="blue" onClick={() => handleFilterClick('inProgress')} isActive={activeFilter === 'inProgress'} />
          <TaskStatsCard title="Đến deadline" value={stats.dueToday} description="Hôm nay" icon={Calendar} color="orange" onClick={() => handleFilterClick('dueToday')} isActive={activeFilter === 'dueToday'} />
          <TaskStatsCard title="Trễ deadline" value={stats.overdue} description="Quá hạn" icon={Zap} color="purple" onClick={() => handleFilterClick('overdue')} isActive={activeFilter === 'overdue'} />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm công việc..." className="border-none focus-visible:ring-0" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                {selectedTasks.length > 0 ? (
                  <Button variant="destructive" size="sm" onClick={() => setDeleteAlertOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Xóa ({selectedTasks.length})</Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm"><LayoutGrid className="mr-2 h-4 w-4" /> Kanban</Button>
                    <Button variant={showCompleted ? "secondary" : "outline"} size="sm" onClick={() => setShowCompleted(!showCompleted)}><CheckCircle className="mr-2 h-4 w-4" /> {showCompleted ? 'Xem chưa hoàn thành' : 'Đã hoàn thành'}</Button>
                  </>
                )}
                <Button size="sm" onClick={() => openDialog(setFormOpen)}><PlusCircle className="mr-2 h-4 w-4" /> Thêm công việc</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><Checkbox checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length} onCheckedChange={handleSelectAll} /></TableHead>
                <TableHead>Tên công việc</TableHead>
                <TableHead>Nội dung chi tiết</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thực hiện</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell><Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={(checked) => handleSelectRow(task.id, !!checked)} /></TableCell>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{task.details}</TableCell>
                  <TableCell><Badge variant="outline" className={priorityBadge(task.priority)}>{task.priority}</Badge></TableCell>
                  <TableCell>{task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openDialog(setFeedbackOpen, task)}>
                      Feedback <Badge variant="destructive">{task.feedback.length}</Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(value: Task['status']) => handleStatusChange(task.id, value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chưa làm">Chưa làm</SelectItem>
                        <SelectItem value="Đang làm">Đang làm</SelectItem>
                        <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={task.assigneeId || ''} onValueChange={(value) => handleAssigneeChange(task.id, value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Chưa giao</SelectItem>
                        {personnel.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(setDetailsOpen, task)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDialog(setFormOpen, task)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openDialog(setDeleteAlertOpen, task)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} task={currentTask} personnel={personnel} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} taskName={currentTask?.name || ''} feedback={currentTask?.feedback || []} onAddFeedback={handleAddFeedback} currentUserId="user-1" />
      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} onSave={handleSaveTask} task={currentTask} personnel={personnel} />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Công việc đã chọn sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentTask(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TasksPage;