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

interface NewAwaitingPaymentProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; client_name: string; contract_value: number; payment1_amount: number }) => void;
}

const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') value = value.toString();
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(value.replace(/[^0-9]/g, "")));
};

const parseCurrency = (value: string): number => {
    return Number(value.replace(/[^0-9]/g, ""));
}

export const NewAwaitingPaymentProjectDialog = ({ open, onOpenChange, onSave }: NewAwaitingPaymentProjectDialogProps) => {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [payment1Amount, setPayment1Amount] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset form on close
      setName("");
      setClientName("");
      setContractValue("");
      setPayment1Amount("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) {
        showError("Vui lòng nhập Tên dự án để dễ dàng nhận biết.");
        return;
    }
    onSave({
      name: name,
      client_name: clientName,
      contract_value: parseCurrency(contractValue),
      payment1_amount: parseCurrency(payment1Amount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm dự án mới chờ thanh toán</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản cho dự án mới. Các trường đều không bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên dự án</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Khách hàng</Label>
            <Input id="client_name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_value">Giá trị hợp đồng</Label>
            <Input id="contract_value" value={formatCurrency(contractValue)} onChange={(e) => setContractValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment1_amount">Thanh toán đợt 1</Label>
            <Input id="payment1_amount" value={formatCurrency(payment1Amount)} onChange={(e) => setPayment1Amount(e.target.value)} />
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