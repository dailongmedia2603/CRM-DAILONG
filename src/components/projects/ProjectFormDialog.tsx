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
import { Client } from "@/types";
import { PlusCircle, X } from "lucide-react";

interface Payment {
  amount: number;
  paid: boolean;
}

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
  // Use individual states for each form field for better control
  const [client, setClient] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [status, setStatus] = useState("planning");
  const [dueDate, setDueDate] = useState("");
  const [payments, setPayments] = useState<Payment[]>([{ amount: 0, paid: false }]);

  useEffect(() => {
    if (project) {
      setClient(project.client || "");
      setName(project.name || "");
      setLink(project.link || "");
      setContractValue(project.contract_value?.toString() || "");
      setStatus(project.status || "planning");
      setDueDate(project.due_date || "");
      setPayments(project.payments || [{ amount: 0, paid: false }]);
    } else {
      // Reset for new project
      setClient("");
      setName("");
      setLink("");
      setContractValue("");
      setStatus("planning");
      setDueDate("");
      setPayments([{ amount: 0, paid: false }]);
    }
  }, [project, open]);

  const handleAddPayment = () => {
    setPayments([...payments, { amount: 0, paid: false }]);
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  const handlePaymentChange = (index: number, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ""));
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], amount: numericValue };
    setPayments(newPayments);
  };

  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return "";
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === client);
    const dataToSave = {
      client_id: client,
      client_name: selectedClient?.name,
      name,
      link,
      contract_value: Number(contractValue),
      status,
      due_date: dueDate,
      payments,
    };
    onSave(dataToSave);
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
            {/* Client Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">Client</Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company_name ? `(${c.company_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Other fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên dự án</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">Link</Label>
              <Input id="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contract_value" className="text-right">Giá trị HĐ</Label>
              <Input id="contract_value" type="number" value={contractValue} onChange={(e) => setContractValue(e.target.value)} className="col-span-3" />
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
                      value={formatCurrency(payment.amount)}
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

            {/* Status and Due Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Tiến độ</Label>
              <Select value={status} onValueChange={setStatus}>
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
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="col-span-3" />
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