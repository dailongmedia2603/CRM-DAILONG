import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Calendar, Link as LinkIcon, DollarSign, CheckCircle } from "lucide-react";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

export const ProjectDetailsDialog = ({ open, onOpenChange, project }: ProjectDetailsDialogProps) => {
  if (!project) return null;

  const statusTextMap: { [key: string]: string } = {
    planning: "Pending",
    "in-progress": "Đang chạy",
    completed: "Hoàn thành",
    overdue: "Quá hạn",
  };

  const statusColorMap: { [key: string]: string } = {
    planning: "bg-amber-100 text-amber-800 border-amber-200",
    "in-progress": "bg-cyan-100 text-cyan-800 border-cyan-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

  const totalPaid = (project.payments || []).filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const debt = project.contract_value - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.name}</DialogTitle>
          <DialogDescription>
            Chi tiết dự án cho {project.client_name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            <DetailItem icon={<User className="h-4 w-4" />} label="Client" value={project.client_name} />
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Thời gian" value={`${formatDate(project.start_date)} - ${formatDate(project.end_date)}`} />
            <DetailItem icon={<LinkIcon className="h-4 w-4" />} label="Link dự án" value={<a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem link</a>} />
            <DetailItem icon={<Badge className="h-4 w-4" />} label="Trạng thái" value={<Badge variant="outline" className={cn("capitalize", statusColorMap[project.status])}>{statusTextMap[project.status] || project.status}</Badge>} />
          </div>
          <div className="space-y-4 border-t pt-4">
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Giá trị HĐ" value={formatCurrency(project.contract_value)} />
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Đã thanh toán" value={<span className="text-green-600">{formatCurrency(totalPaid)}</span>} />
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Công nợ" value={<span className="text-red-600">{formatCurrency(debt)}</span>} />
          </div>
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold">Tiến độ thanh toán</h4>
            <div className="space-y-3">
              {(project.payments || []).map((payment, index) => (
                <div key={index} className="p-3 rounded-lg border bg-gray-50 text-sm">
                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-2">
                      <span>Đợt {index + 1}: {formatCurrency(payment.amount)}</span>
                      <CheckCircle className={cn("h-4 w-4", payment.paid ? "text-green-500" : "text-gray-300")} />
                    </div>
                  </div>
                  {payment.personnel && payment.personnel.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Nhân sự:</strong> {payment.personnel.map(p => p.name).join(', ')}
                    </div>
                  )}
                  {payment.note && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      <strong>Ghi chú:</strong> {payment.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold">Nhân sự</h4>
            <div className="flex flex-col gap-1 text-sm">
              {(project.team || []).map((member, index) => (
                <div key={index}>{member.role}: {member.name}</div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};