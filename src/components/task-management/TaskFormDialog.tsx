import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { showError } from "@/utils/toast";
import { Personnel, Task } from "@/types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: any) => void;
  task?: Task | null;
  personnel: Personnel[];
  currentUser: { id: string; name: string };
}

export const TaskFormDialog = ({ open, onOpenChange, onSave, task, personnel, currentUser }: TaskFormDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setLinks(task.links && task.links.length > 0 ? task.links : ['']);
      setAssigneeId(task.assignee.id);
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setPriority(task.priority);
    } else {
      setName('');
      setDescription('');
      setLinks(['']);
      setAssigneeId('');
      setDeadline(undefined);
      setPriority('Trung bình');
    }
  }, [task, open]);

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addLinkInput = () => setLinks([...links, '']);
  const removeLinkInput = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    } else {
      setLinks(['']);
    }
  };

  const handleDateTimeChange = (newDatePart?: Date, newTimePart?: {hour?: string, minute?: string}) => {
    const newDeadline = deadline ? new Date(deadline) : new Date();
    
    if (newDatePart) {
      newDeadline.setFullYear(newDatePart.getFullYear());
      newDeadline.setMonth(newDatePart.getMonth());
      newDeadline.setDate(newDatePart.getDate());
    }

    if (newTimePart?.hour) {
      newDeadline.setHours(parseInt(newTimePart.hour, 10));
    }
    if (newTimePart?.minute) {
      newDeadline.setMinutes(parseInt(newTimePart.minute, 10));
    }
    
    setDeadline(newDeadline);
  };

  const handleSubmit = () => {
    if (!name || !assigneeId || !deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc: Tên công việc, Người nhận, Deadline.");
      return;
    }
    
    const dataToSave: any = {
      name,
      description,
      links: links.filter(link => link.trim() !== ''),
      assignee_id: assigneeId,
      deadline: deadline.toISOString(),
      priority,
    };

    if (!task) { // This is a new task
      dataToSave.assigner_id = currentUser.id;
      dataToSave.status = 'Chưa làm';
    }

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Chỉnh sửa Công việc" : "Thêm Công việc mới"}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết cho công việc.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên công việc <span className="text-red-500">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Tích hợp trình soạn thảo văn bản nâng cao tại đây..." />
          </div>
          <div className="space-y-2">
            <Label>Link tài liệu</Label>
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={link} onChange={(e) => handleLinkChange(index, e.target.value)} placeholder="https://..." />
                <Button variant="ghost" size="icon" onClick={() => removeLinkInput(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLinkInput}><PlusCircle className="mr-2 h-4 w-4" />Thêm link</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Người giao</Label>
              <Input value={currentUser.name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Người nhận <span className="text-red-500">*</span></Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Chọn người nhận" /></SelectTrigger>
                <SelectContent>
                  {personnel.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline <span className="text-red-500">*</span></Label>
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
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cao">Cao</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Thấp">Thấp</SelectItem>
                </SelectContent>
              </Select>
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