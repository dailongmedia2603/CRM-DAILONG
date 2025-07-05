import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    workLink: '',
    internName: '',
    priority: 'Bình thường' as InternTask['priority'],
    commentCount: 0,
    postCount: 0,
  });
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (task) {
      const taskDeadline = new Date(task.deadline);
      setFormData({
        title: task.title,
        description: task.description,
        workLink: task.workLink,
        internName: task.internName,
        priority: task.priority,
        commentCount: task.commentCount,
        postCount: task.postCount,
      });
      setDeadline(taskDeadline);
      setHour(format(taskDeadline, 'HH'));
      setMinute(format(taskDeadline, 'mm'));
    } else {
      setFormData({
        title: '',
        description: '',
        workLink: '',
        internName: '',
        priority: 'Bình thường',
        commentCount: 0,
        postCount: 0,
      });
      setDeadline(new Date());
      setHour('00');
      setMinute('00');
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<string>>, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    if (value > max) {
        value = max;
    }
    setter(value.toString().padStart(2, '0'));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.internName || !deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    const finalDeadline = new Date(deadline);
    finalDeadline.setHours(parseInt(hour, 10));
    finalDeadline.setMinutes(parseInt(minute, 10));
    finalDeadline.setSeconds(0);
    finalDeadline.setMilliseconds(0);

    onSave({
      ...formData,
      deadline: finalDeadline.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Chỉnh sửa công việc" : "Giao việc mới"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Nhập tiêu đề công việc..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả chi tiết công việc..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workLink">Link làm việc</Label>
            <Input id="workLink" name="workLink" value={formData.workLink} onChange={handleChange} placeholder="https://docs.google.com/... hoặc https://trello.com" />
          </div>
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
            <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus /></PopoverContent>
                </Popover>
                <Input
                    type="number"
                    value={hour}
                    onChange={handleTimeChange(setHour, 23)}
                    className="w-16 text-center"
                />
                <span>:</span>
                <Input
                    type="number"
                    value={minute}
                    onChange={handleTimeChange(setMinute, 59)}
                    className="w-16 text-center"
                />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commentCount">Số lượng Comment</Label>
              <Input id="commentCount" name="commentCount" type="number" value={formData.commentCount} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postCount">Số lượng Post</Label>
              <Input id="postCount" name="postCount" type="number" value={formData.postCount} onChange={handleChange} />
            </div>
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