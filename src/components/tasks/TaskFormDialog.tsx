import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { showError } from '@/utils/toast';
import { Task } from '@/data/tasks';
import { Project } from '@/data/projects';
import { Personnel } from '@/data/personnel';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: any) => void;
  task?: Task | null;
  projects: Project[];
  personnel: Personnel[];
  currentUser: Personnel; // Assuming we know the current user
}

export const TaskFormDialog = ({ open, onOpenChange, onSave, task, projects, personnel, currentUser }: TaskFormDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'Gấp' | 'Cao' | 'Bình thường'>('Bình thường');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setRelatedProjectId(task.relatedService.projectId);
      setAssigneeId(task.assignee.id);
      setDeadline(new Date(task.deadline));
      setPriority(task.priority);
    } else {
      setName('');
      setDescription('');
      setRelatedProjectId('');
      setAssigneeId('');
      setDeadline(undefined);
      setPriority('Bình thường');
    }
  }, [task, open]);

  const handleSubmit = () => {
    if (!name || !relatedProjectId || !assigneeId || !deadline) {
      showError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const selectedProject = projects.find(p => p.id === relatedProjectId);
    const selectedAssignee = personnel.find(p => p.id === assigneeId);

    if (!selectedProject || !selectedAssignee) {
      showError('Dự án hoặc người nhận không hợp lệ.');
      return;
    }

    const taskData = {
      id: task?.id,
      name,
      description,
      relatedService: {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
      },
      assigner: currentUser,
      assignee: selectedAssignee,
      deadline: deadline.toISOString(),
      priority,
      status: task?.status || 'Chưa làm',
    };
    onSave(taskData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{task ? 'Sửa công việc' : 'Thêm công việc mới'}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết cho công việc.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow grid grid-cols-3 gap-6 py-4 overflow-y-auto pr-4">
          <div className="col-span-2 space-y-4">
            <div>
              <Label htmlFor="name">Tên công việc</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Mô tả</Label>
              <div className="bg-white">
                <ReactQuill theme="snow" value={description} onChange={setDescription} style={{ height: '300px', marginBottom: '4rem' }} />
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-4">
            <div>
              <Label>Người giao</Label>
              <Input value={currentUser.name} disabled />
            </div>
            <div>
              <Label htmlFor="assignee">Giao cho</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Chọn người nhận" /></SelectTrigger>
                <SelectContent>
                  {personnel.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="relatedService">Dịch vụ liên quan</Label>
              <Select value={relatedProjectId} onValueChange={setRelatedProjectId}>
                <SelectTrigger><SelectValue placeholder="Chọn dự án" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="priority">Ưu tiên</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gấp">Gấp</SelectItem>
                  <SelectItem value="Cao">Cao</SelectItem>
                  <SelectItem value="Bình thường">Bình thường</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};