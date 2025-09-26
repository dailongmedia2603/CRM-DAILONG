import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { User, Calendar, Link as LinkIcon, DollarSign, CheckCircle, Edit, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onUpdate: () => void;
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

export const ProjectDetailsDialog = ({ open, onOpenChange, project, onUpdate }: ProjectDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableProject, setEditableProject] = useState<Project | null>(null);

  useEffect(() => {
    setEditableProject(project ? { ...project } : null);
    setIsEditing(false);
  }, [project]);

  if (!project || !editableProject) return null;

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

  const totalPaid = (editableProject.payments || []).filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const debt = editableProject.contract_value - totalPaid;

  const handleContractValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditableProject(prev => prev ? { ...prev, contract_value: value === '' ? 0 : parseInt(value, 10) } : null);
  };

  const handlePaymentStatusChange = (index: number, checked: boolean) => {
    setEditableProject(prev => {
      if (!prev) return null;
      const newPayments = JSON.parse(JSON.stringify(prev.payments || []));
      newPayments[index].paid = checked;
      return { ...prev, payments: newPayments };
    });
  };

  const handleCancel = () => {
    setEditableProject(project ? { ...project } : null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editableProject) return;

    const { error } = await supabase
      .from('projects')
      .update({
        contract_value: editableProject.contract_value,
        payments: editableProject.payments,
      })
      .eq('id', editableProject.id);

    if (error) {
      showError("Lỗi khi cập nhật dự án. " + error.message);
    } else {
      showSuccess("Đã cập nhật dự án thành công.");
      setIsEditing(false);
      onUpdate();
    }
  };

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
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">Tài chính</h4>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" /> Hủy
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" /> Lưu
                        </Button>
                    </div>
                )}
            </div>
            
            <DetailItem 
              icon={<DollarSign className="h-4 w-4" />} 
              label="Giá trị HĐ" 
              value={
                isEditing ? (
                  <Input 
                    type="number" 
                    value={editableProject.contract_value} 
                    onChange={handleContractValueChange}
                    className="h-8"
                  />
                ) : (
                  formatCurrency(project.contract_value)
                )
              } 
            />
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Đã thanh toán" value={<span className="text-green-600">{formatCurrency(totalPaid)}</span>} />
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Công nợ" value={<span className="text-red-600">{formatCurrency(debt)}</span>} />
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold">Tiến độ thanh toán</h4>
            <div className="space-y-3">
              {(editableProject.payments || []).map((payment, index) => (
                <div key={index} className="p-3 rounded-lg border bg-gray-50 text-sm">
                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-2">
                      <span>Đợt {index + 1}: {formatCurrency(payment.amount)}</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <label htmlFor={`paid-${index}`} className="text-sm">Đã TT</label>
                        <Checkbox
                          id={`paid-${index}`}
                          checked={payment.paid}
                          onCheckedChange={(checked) => handlePaymentStatusChange(index, !!checked)}
                        />
                      </div>
                    ) : (
                      <CheckCircle className={cn("h-4 w-4", payment.paid ? "text-green-500" : "text-gray-300")} />
                    )}
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