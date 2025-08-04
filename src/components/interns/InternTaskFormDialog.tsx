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
import { InternTask, Personnel } from "@/types";

interface InternTaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: any) => void;
  task?: InternTask | null;
  interns: Personnel[];
}

const FORM_DATA_KEY = 'internTaskFormData';

export const InternTaskFormDialog = ({ open, onOpenChange, onSave, task, interns }: InternTaskFormDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_link: '',
    intern_name: '',
    priority: 'Bình thường' as InternTask['priority'],
    comment_count: 0,
    post_count: 0,
    post_scan_count: 0,
  });
  const [deadline, setDeadline] = useState<Date | undefined>();

  useEffect(() => {
    if (open) {
      const savedData = sessionStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData.formData);
        setDeadline(parsedData.deadline ? new Date(parsedData.deadline) : undefined);
      } else if (task) {
        const initialData = {
          title: task.title,
          description: task.description || '',
          work_link: task.work_link || '',
          intern_name: task.intern_name,
          priority: task.priority,
          comment_count: task.comment_count || 0,
          post_count: task.post_count || 0,
          post_scan_count: task.post_scan_count || 0,
        };
        setFormData(initialData);
        setDeadline(task.deadline ? new Date(task.deadline) : undefined);
        sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify({ formData: initialData, deadline: task.deadline }));
      } else {
        const initialData = {
          title: '', description: '', work_link: '', intern_name: '',
          priority: 'Bình thường' as InternTask['priority'],
          comment_count: 0, post_count: 0, post_scan_count: 0,
        };
        setFormData(initialData);
        setDeadline(undefined);
        sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify({ formData: initialData, deadline: undefined }));
      }
    }
  }, [task, open]);

  const updateStateAndSession = (newFormData: Partial<typeof formData>, newDeadline?: Date) => {
    const updatedFormData = { ...formData, ...newFormData };
    const updatedDeadline = newDeadline !== undefined ? newDeadline : deadline;
    setFormData(updatedFormData);
    if (newDeadline !== undefined) setDeadline(newDeadline);
    sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify({ formData: updatedFormData, deadline: updatedDeadline?.toISOString() }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const finalValue = (name === 'comment_count' || name === 'post_count' || name === 'post_scan_count') ? parseInt(value, 10) || 0 : value;
    updateStateAndSession({ [name]: finalValue });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateStateAndSession({ [name]: value });
  };

  const handleDateTimeChange = (newDatePart?: Date, newTimePart?: {hour?: string, minute?: string}) => {
    const newDeadline = deadline ? new Date(deadline) : new Date();
    
    if (newDatePart) {
      newDeadline.setFullYear(newDatePart.getFullYear());
      newDeadline.setMonth(newDatePart.getMonth());
      newDeadline.setDate(newDatePart.getDate());
    }

    if (newTimePart?.hour) newDeadline.setHours(parseInt(newTimePart.hour, 10));
    if (newTimePart?.minute) newDeadline.setMinutes(parseInt(newTimePart.minute, 10));
    
    updateStateAndSession({}, newDeadline);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.intern_name || !deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Thực tập sinh, Deadline.");
      return;
    }
    
    onSave({
      ...formData,
      deadline: deadline.toISOString(),
    });
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
            <Label htmlFor="work_link">Link làm việc</Label>
            <Input id="work_link" name="work_link" value={formData.work_link} onChange={handleChange} placeholder="https://docs.google.com/... hoặc https://trello.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intern_name">Thực tập sinh</Label>
            <Select value={formData.intern_name} onValueChange={(value) => handleSelectChange('intern_name', value)}>
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
                  {deadline ? format(deadline, "dd/MM/yyyy HH:mm") : <span>Chọn ngày & giờ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => handleDateTimeChange(date)}
                  initialFocus
                />
                <div className="p-2 border-t border-border">
                  <div className="flex items-center justify-center gap-2">
                    <Select
                      value={deadline ? format(deadline, 'HH') : '00'}
                      onValueChange={(hour) => handleDateTimeChange(undefined, { hour })}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select
                      value={deadline ? format(deadline, 'mm') : '00'}
                      onValueChange={(minute) => handleDateTimeChange(undefined, { minute })}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comment_count">Số lượng Comment</Label>
              <Input id="comment_count" name="comment_count" type="number" value={formData.comment_count} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post_count">Số lượng Post</Label>
              <Input id="post_count" name="post_count" type="number" value={formData.post_count} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post_scan_count">Số lượng post scan</Label>
              <Input id="post_scan_count" name="post_scan_count" type="number" value={formData.post_scan_count} onChange={handleChange} />
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