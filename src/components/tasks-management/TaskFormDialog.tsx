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
import { Personnel } from "@/data/personnel";
import { Task } from "@/data/tasks";

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
      setDescription(task.description);
      setLinks(task.links.length > 0 ? task.links : ['']);
      setAssigneeId(task.assignee.id);
      setDeadline(new Date(task.deadline));
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

  const handleSubmit = () => {
    if (!name || !assigneeId || !deadline) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc: Tên công việc, Người nhận, Deadline.");
      return;
    }
    const assignee = personnel.find(p => p.id === assigneeId);
    if (!assignee) {
        showError("Người nhận không hợp lệ.");
        return;
    }

    onSave({
      name,
      description,
      links: links.filter(link => link.trim() !== ''),
      assignee: { id: assignee.id, name: assignee.name },
      deadline: deadline.toISOString(),
      priority,
    });
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
                    {deadline ? format(deadline, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus /></PopoverContent>
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