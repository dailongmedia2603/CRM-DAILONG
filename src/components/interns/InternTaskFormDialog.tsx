import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { showError } from "@/utils/toast";
import { InternTask } from "@/data/internTasks";
import { Personnel } from "@/data/personnel";

interface InternTaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: any) => void;
  task?: InternTask | null;
  interns: Personnel[];
}

export const InternTaskFormDialog = ({ open, onOpenChange, onSave, task, interns }: InternTaskFormDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    internName: '',
    deadline: new Date(),
    priority: 'Bình thường' as InternTask['priority'],
    fileLink: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        internName: task.internName,
        deadline: new Date(task.deadline),
        priority: task.priority,
        fileLink: task.fileLink,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        internName: '',
        deadline: new Date(),
        priority: 'Bình thường',
        fileLink: '',
      });
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.internName || !formData.deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    onSave({
      ...formData,
      deadline: format(formData.deadline, 'yyyy-MM-dd'),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Chỉnh sửa công việc" : "Giao việc mới"}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết cho công việc của thực tập sinh.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên công việc</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internName">Thực tập sinh</Label>
              <Select value={formData.internName} onValueChange={(value) => handleSelectChange('internName', value)}>
                <SelectTrigger><SelectValue placeholder="Chọn thực tập sinh" /></SelectTrigger>
                <SelectContent>
                  {interns.map(intern => (
                    <SelectItem key={intern.id} value={intern.name}>{intern.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.deadline} onSelect={(date) => setFormData(prev => ({...prev, deadline: date || new Date()}))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Ưu tiên</Label>
            <Select value={formData.priority} onValueChange={(value: InternTask['priority']) => handleSelectChange('priority', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cao">Cao</SelectItem>
                <SelectItem value="Bình thường">Bình thường</SelectItem>
                <SelectItem value="Thấp">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="fileLink">Link File</Label>
            <Input id="fileLink" name="fileLink" value={formData.fileLink} onChange={handleChange} />
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