import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InternTask } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Calendar, Link as LinkIcon, FileText, Hash, BarChart, MessageSquare, CheckSquare, AlertTriangle, Play, Check, FileWarning } from "lucide-react";

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

  const getStatusBadge = (status: InternTask['status']) => {
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hoàn thành': return 'bg-green-100 text-green-800 border-green-200';
      case 'Quá hạn': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
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
          {task.report_reason && (
            <div className="space-y-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
              <DetailItem icon={<FileWarning className="h-5 w-5 text-yellow-600" />} label="Lý do trễ deadline" value={<p className="text-sm text-yellow-800">{task.report_reason}</p>} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DetailItem icon={<User className="h-5 w-5" />} label="Thực tập sinh" value={task.intern_name} />
              <DetailItem icon={<Calendar className="h-5 w-5" />} label="Deadline" value={formatDate(task.deadline)} />
              <DetailItem icon={<Play className="h-5 w-5" />} label="Thời gian bắt đầu" value={formatDate(task.started_at)} />
              <DetailItem icon={<Check className="h-5 w-5" />} label="Thời gian hoàn thành" value={formatDate(task.completed_at)} />
            </div>
            <div className="space-y-4">
              <DetailItem icon={<AlertTriangle className="h-5 w-5" />} label="Ưu tiên" value={<Badge className={cn(getPriorityBadge(task.priority))}>{task.priority}</Badge>} />
              <DetailItem icon={<Hash className="h-5 w-5" />} label="Trạng thái" value={<Badge className={cn(getStatusBadge(task.status))}>{task.status}</Badge>} />
              <DetailItem icon={<LinkIcon className="h-5 w-5" />} label="Link làm việc" value={<a href={task.work_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem link</a>} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};