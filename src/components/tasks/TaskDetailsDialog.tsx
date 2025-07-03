import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/data/tasks";
import { Personnel } from "@/data/personnel";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  personnel: Personnel[];
}

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <div className="font-medium">{children}</div>
  </div>
);

export const TaskDetailsDialog = ({ open, onOpenChange, task, personnel }: TaskDetailsDialogProps) => {
  if (!task) return null;

  const assignee = personnel.find(p => p.id === task.assigneeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết Công việc</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <h3 className="text-lg font-semibold">{task.name}</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className={task.priority === 'Gấp' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}>{task.priority}</Badge>
            <Badge variant="secondary">{task.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Deadline">{task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}</DetailItem>
            <DetailItem label="Trạng thái">{task.status}</DetailItem>
            <DetailItem label="Người thực hiện">{assignee?.name || 'Chưa giao'}</DetailItem>
            <DetailItem label="Ưu tiên">{task.priority}</DetailItem>
            <DetailItem label="Ngày tạo">{new Date(task.createdAt).toLocaleString('vi-VN')}</DetailItem>
          </div>
          <DetailItem label="Nội dung chi tiết">
            <p className="p-3 bg-muted rounded-md">{task.details}</p>
          </DetailItem>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};