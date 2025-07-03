import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/data/tasks";
import { Personnel } from "@/data/personnel";
import { showError } from '@/utils/toast';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'feedback' | 'completed'> & { id?: string }) => void;
  task?: Task | null;
  personnel: Personnel[];
}

export const TaskFormDialog = ({ open, onOpenChange, onSave, task, personnel }: TaskFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    priority: 'Bình thường' as Task['priority'],
    deadline: '',
    status: 'Chưa làm' as Task['status'],
    assigneeId: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        details: task.details,
        priority: task.priority,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        status: task.status,
        assigneeId: task.assigneeId || '',
      });
    } else {
      setFormData({
        name: '',
        details: '',
        priority: 'Bình thường',
        deadline: '',
        status: 'Chưa làm',
        assigneeId: '',
      });
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      showError('Vui lòng nhập tên công việc.');
      return;
    }
    onSave({
      id: task?.id,
      name: formData.name,
      details: formData.details,
      priority: formData.priority,
      deadline: formData.deadline || null,
      status: formData.status,
      assigneeId: formData.assigneeId || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Sửa Công việc' : 'Thêm Công việc mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên công việc</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Nội dung chi tiết</Label>
            <Textarea id="details" name="details" value={formData.details} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Ưu tiên</Label>
              <Select name="priority" value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gấp">Gấp</SelectItem>
                  <SelectItem value="Bình thường">Bình thường</SelectItem>
                  <SelectItem value="Thấp">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chưa làm">Chưa làm</SelectItem>
                  <SelectItem value="Đang làm">Đang làm</SelectItem>
                  <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Người thực hiện</Label>
              <Select name="assigneeId" value={formData.assigneeId} onValueChange={(v) => handleSelectChange('assigneeId', v)}>
                <SelectTrigger><SelectValue placeholder="Chọn người thực hiện" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Chưa giao</SelectItem>
                  {personnel.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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