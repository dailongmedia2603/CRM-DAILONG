import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InternTask } from "@/data/internTasks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Calendar, Link as LinkIcon, FileText, Hash, BarChart, MessageSquare, CheckSquare, AlertTriangle } from "lucide-react";

interface InternTaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: InternTask | null;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

export const InternTaskDetailsDialog = ({ open, onOpenChange, task }: InternTaskDetailsDialogProps) => {
  if (!task) return null;

  const getPriorityBadge = (priority: InternTask['priority']) => {
    switch (priority) {
      case 'Cao': return 'bg-red-100 text-red-800 border-red-200';
      case 'Bình thường': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Thấp': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return '';
    }
  };

  const getStatusBadge = (status: InternTask['commentStatus']) => {
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hoàn thành': return 'bg-green-100 text-green-800 border-green-200';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>Chi tiết công việc #{task.id}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4 rounded-lg border p-4">
            <DetailItem icon={<FileText className="h-5 w-5" />} label="Mô tả" value={<p className="text-sm">{task.description}</p>} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DetailItem icon={<User className="h-5 w-5" />} label="Thực tập sinh" value={task.internName} />
              <DetailItem icon={<Calendar className="h-5 w-5" />} label="Deadline" value={format(new Date(task.deadline), "dd/MM/yyyy")} />
              <DetailItem icon={<MessageSquare className="h-5 w-5" />} label="Số lượng Comment" value={<Badge variant="secondary">{task.commentCount}</Badge>} />
              <DetailItem icon={<CheckSquare className="h-5 w-5" />} label="Số lượng Post" value={<Badge variant="secondary">{task.postCount}</Badge>} />
            </div>
            <div className="space-y-4">
              <DetailItem icon={<AlertTriangle className="h-5 w-5" />} label="Ưu tiên" value={<Badge className={cn(getPriorityBadge(task.priority))}>{task.priority}</Badge>} />
              <DetailItem icon={<MessageSquare className="h-5 w-5" />} label="Trạng thái Comment" value={<Badge className={cn(getStatusBadge(task.commentStatus))}>{task.commentStatus}</Badge>} />
              <DetailItem icon={<CheckSquare className="h-5 w-5" />} label="Trạng thái Post" value={<Badge className={cn(getStatusBadge(task.postStatus))}>{task.postStatus}</Badge>} />
              <DetailItem icon={<LinkIcon className="h-5 w-5" />} label="Link làm việc" value={<a href={task.workLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem link</a>} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};