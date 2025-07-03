import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { Task } from '@/data/tasks';
import { Project } from '@/data/clients';
import { Personnel } from '@/data/personnel';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskViewDialog } from '@/components/tasks/TaskViewDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TasksPageProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  projects: Project[];
  personnel: Personnel[];
}

const TasksPage = ({ tasks, setTasks, projects, personnel }: TasksPageProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Giả sử người dùng hiện tại là người đầu tiên trong danh sách nhân sự
  const currentUser = personnel[0];

  const handleSaveTask = (taskData: any) => {
    let updatedTasks;
    if (taskData.id) {
      updatedTasks = tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
      showSuccess('Công việc đã được cập nhật!');
    } else {
      updatedTasks = [...tasks, { ...taskData, id: `TASK-${Date.now()}` }];
      showSuccess('Công việc mới đã được thêm!');
    }
    setTasks(updatedTasks);
    setIsFormOpen(false);
  };

  const handleOpenForm = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsFormOpen(true);
  };

  const handleOpenView = (task: Task) => {
    setTaskToView(task);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
    showSuccess('Công việc đã được xóa.');
    setIsDeleteOpen(false);
  };

  const handleStatusChange = (task: Task) => {
    let newStatus: Task['status'] = 'Đang làm';
    if (task.status === 'Chưa làm') newStatus = 'Đang làm';
    if (task.status === 'Đang làm') newStatus = 'Hoàn thành';
    
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Gấp': return 'bg-red-500 text-white';
      case 'Cao': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Chưa làm': return <Circle className="h-5 w-5 text-gray-400" />;
      case 'Đang làm': return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case 'Hoàn thành': return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Công việc</h1>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm công việc
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Checkbox /></TableHead>
                <TableHead>Tên công việc</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Người giao</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Dịch vụ liên quan</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell><Button variant="link" size="sm" onClick={() => handleOpenView(task)}>Xem</Button></TableCell>
                  <TableCell>{task.assigner.name}</TableCell>
                  <TableCell>{task.assignee.name}</TableCell>
                  <TableCell>{format(new Date(task.deadline), 'dd/MM/yyyy')}</TableCell>
                  <TableCell><Button variant="outline" size="sm">{task.relatedService.projectName}</Button></TableCell>
                  <TableCell><Badge className={cn(getPriorityBadge(task.priority))}>{task.priority}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{task.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleStatusChange(task)}>
                      {getStatusIcon(task.status)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(task)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(task)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveTask}
        task={taskToEdit}
        projects={projects}
        personnel={personnel}
        currentUser={currentUser}
      />
      {taskToView && (
        <TaskViewDialog
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          taskName={taskToView.name}
          description={taskToView.description}
        />
      )}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Công việc "{taskToDelete?.name}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TasksPage;