import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError } from "@/utils/toast";
import { AwaitingPaymentProject } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewAwaitingPaymentProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<AwaitingPaymentProject>) => void;
  project?: AwaitingPaymentProject | null;
}

const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') value = value.toString();
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(value.replace(/[^0-9]/g, "")));
};

const parseCurrency = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, ""));
}

export const NewAwaitingPaymentProjectDialog = ({ open, onOpenChange, onSave, project }: NewAwaitingPaymentProjectDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    contract_value: "",
    payment1_amount: "",
    status: 'Đang làm hợp đồng' as AwaitingPaymentProject['status'],
  });

  const isEditing = !!project;

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          name: project.name || "",
          client_name: project.client_name || "",
          contract_value: project.contract_value?.toString() || "",
          payment1_amount: project.payment1_amount?.toString() || "",
          status: project.status || 'Đang làm hợp đồng',
        });
      } else {
        setFormData({
          name: "",
          client_name: "",
          contract_value: "",
          payment1_amount: "",
          status: 'Đang làm hợp đồng',
        });
      }
    }
  }, [project, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: AwaitingPaymentProject['status']) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
        showError("Vui lòng nhập Tên dự án để dễ dàng nhận biết.");
        return;
    }
    onSave({
      id: project?.id,
      name: formData.name,
      client_name: formData.client_name,
      contract_value: parseCurrency(formData.contract_value),
      payment1_amount: parseCurrency(formData.payment1_amount),
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa dự án' : 'Thêm dự án mới chờ thanh toán'}</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản cho dự án mới. Các trường đều không bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên dự án</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Khách hàng</Label>
            <Input id="client_name" name="client_name" value={formData.client_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_value">Giá trị hợp đồng</Label>
            <Input id="contract_value" name="contract_value" value={formatCurrency(formData.contract_value)} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment1_amount">Thanh toán đợt 1</Label>
            <Input id="payment1_amount" name="payment1_amount" value={formatCurrency(formData.payment1_amount)} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={formData.status} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Đang làm hợp đồng">Đang làm hợp đồng</SelectItem>
                <SelectItem value="Chờ ký & thanh toán">Chờ ký & thanh toán</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};