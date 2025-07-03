import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/data/tasks';
import { Personnel } from '@/data/personnel';
import { showError } from '@/utils/toast';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: any) => void;
  task?: Task | null;
  personnel: Personnel[];
}

export const TaskFormDialog = ({ open, onOpenChange, onSave, task, personnel }: TaskFormDialogProps) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    priority: 'Bình thường',
    deadline: null,
    assigneeId: null,
    status: 'Chưa làm',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline ? new Date(task.deadline) : null,
        assigneeId: task.assigneeId,
        status: task.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 'Bình thường',
        deadline: null,
        assigneeId: null,
        status: 'Chưa làm',
      });
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev: any) => ({ ...prev, deadline: date }));
  };

  const handleSubmit = () => {
    if (!formData.name) {
      showError('Vui lòng nhập tên công việc.');
      return;
    }
    onSave({
      ...formData,
      deadline: formData.deadline ? formData.deadline.toISOString() : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Chỉnh sửa Công việc' : 'Thêm Công việc mới'}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết cho công việc.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên công việc</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Nội dung chi tiết</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Ưu tiên</Label>
              <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, 'PPP') : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.deadline} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigneeId">Thực hiện</Label>
            <Select value={formData.assigneeId || ''} onValueChange={(value) => handleSelectChange('assigneeId', value)}>
              <SelectTrigger><SelectValue placeholder="Chọn người thực hiện" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Chưa giao</SelectItem>
                {personnel.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};