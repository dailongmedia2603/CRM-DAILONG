import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Calendar, Link as LinkIcon, FileText } from "lucide-react";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export const TaskDetailsDialog = ({ open, onOpenChange, task }: TaskDetailsDialogProps) => {
  if (!task) return null;

  const getStatusBadge = (status: Task['status']) => {
    if (status === 'Hoàn thành') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Đang làm') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    if (priority === 'Cao') return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 'Trung bình') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.name}</DialogTitle>
          <DialogDescription>
            Chi tiết công việc #{task.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
            <div className="space-y-4">
              <DetailItem icon={<User className="h-4 w-4" />} label="Người giao" value={task.assigner.name} />
              <DetailItem icon={<User className="h-4 w-4" />} label="Người nhận" value={task.assignee.name} />
            </div>
            <div className="space-y-4">
               <DetailItem 
                icon={<Calendar className="h-4 w-4" />} 
                label="Deadline" 
                value={format(new Date(task.deadline), "dd/MM/yyyy")} 
              />
              <DetailItem 
                icon={<Calendar className="h-4 w-4" />} 
                label="Ngày tạo" 
                value={format(new Date(task.created_at), "dd/MM/yyyy")} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div>
                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                <Badge className={cn("text-sm", getStatusBadge(task.status))}>{task.status}</Badge>
             </div>
             <div>
                <p className="text-sm text-muted-foreground mb-1">Ưu tiên</p>
                <Badge className={cn("text-sm", getPriorityBadge(task.priority))}>{task.priority}</Badge>
             </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Mô tả chi tiết</h4>
            <div className="p-4 bg-muted rounded-lg text-sm prose max-w-none">
              <p>{task.description || "Không có mô tả."}</p>
            </div>
          </div>

          {task.links && task.links.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Links tham khảo</h4>
              <ul className="space-y-2 list-disc pl-5">
                {task.links.map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};