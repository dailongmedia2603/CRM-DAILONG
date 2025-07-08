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
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [priority, setPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setLinks(task.links && task.links.length > 0 ? task.links : ['']);
      setAssigneeId(task.assignee.id);
      const taskDeadline = new Date(task.deadline);
      setDeadline(taskDeadline);
      setHour(format(taskDeadline, 'HH'));
      setMinute(format(taskDeadline, 'mm'));
      setPriority(task.priority);
    } else {
      setName('');
      setDescription('');
      setLinks(['']);
      setAssigneeId('');
      setDeadline(undefined);
      setHour('00');
      setMinute('00');
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
    if (!name || !assigneeId || !deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc: Tên công việc, Người nhận, Deadline.");
      return;
    }
    
    const finalDeadline = new Date(deadline);
    finalDeadline.setHours(parseInt(hour, 10));
    finalDeadline.setMinutes(parseInt(minute, 10));
    finalDeadline.setSeconds(0);
    finalDeadline.setMilliseconds(0);

    const dataToSave: any = {
      name,
      description,
      links: links.filter(link => link.trim() !== ''),
      assignee_id: assigneeId,
      deadline: finalDeadline.toISOString(),
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