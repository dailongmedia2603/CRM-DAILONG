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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/data/clients";
import { PlusCircle, X } from "lucide-react";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: any) => void;
  project?: any;
  clients: Client[];
}

export const ProjectFormDialog = ({
  open,
  onOpenChange,
  onSave,
  project,
  clients,
}: ProjectFormDialogProps) => {
  const [payments, setPayments] = useState<string[]>([""]);

  useEffect(() => {
    if (project && project.payments) {
      setPayments(project.payments.map((p: any) => p.amount.toString()));
    } else if (project && project.payment) {
      setPayments([project.payment.toString()]);
    } else {
      setPayments([""]);
    }
  }, [project, open]);

  const handleAddPayment = () => {
    setPayments([...payments, ""]);
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  const handlePaymentChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const newPayments = [...payments];
    newPayments[index] = numericValue;
    setPayments(newPayments);
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Collect payments
    const paymentData = payments.map(p => ({ amount: Number(p || 0) }));
    
    // Remove individual payment fields from form data and add the array
    Object.keys(data).forEach(key => {
      if (key.startsWith('payment-')) {
        delete data[key];
      }
    });
    
    data.payments = paymentData;
    
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{project ? "Sửa dự án" : "Thêm dự án mới"}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết của dự án vào form bên dưới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Other fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">Client</Label>
              <Select name="client" defaultValue={project?.client}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn client" /></SelectTrigger>
                <SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={client.companyName}>{client.name} ({client.companyName})</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên dự án</Label>
              <Input id="name" name="name" defaultValue={project?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">Link</Label>
              <Input id="link" name="link" type="url" defaultValue={project?.link} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contractValue" className="text-right">Giá trị HĐ</Label>
              <Input id="contractValue" name="contractValue" type="number" defaultValue={project?.contractValue} className="col-span-3" />
            </div>
            
            {/* Dynamic Payment Fields */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Thanh toán</Label>
              <div className="col-span-3 space-y-2">
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label htmlFor={`payment-${index}`} className="min-w-[50px]">Đợt {index + 1}</Label>
                    <Input
                      id={`payment-${index}`}
                      name={`payment-${index}`}
                      value={formatCurrency(payment)}
                      onChange={(e) => handlePaymentChange(index, e.target.value)}
                      className="flex-1"
                      placeholder="Nhập số tiền"
                    />
                    {payments.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePayment(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddPayment}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Thêm đợt thanh toán
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="debt" className="text-right">Công nợ</Label>
              <Input id="debt" name="debt" type="number" defaultValue={project?.debt} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Tiến độ</Label>
              <Select name="status" defaultValue={project?.status}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Pending</SelectItem>
                  <SelectItem value="in-progress">Đang chạy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Hạn chót</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={project?.dueDate} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">Lưu dự án</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};