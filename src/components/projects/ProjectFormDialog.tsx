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
import { Client, Personnel } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface Payment {
  amount: number;
  paid: boolean;
}

interface TeamMember {
  role: string;
  id: string;
  name: string;
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
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [status, setStatus] = useState("planning");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payments, setPayments] = useState<Payment[]>([{ amount: 0, paid: false }]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase.from('personnel').select('*');
      if (error) showError("Lỗi khi tải danh sách nhân sự.");
      else setPersonnelList(data as Personnel[]);
    };
    fetchPersonnel();
  }, []);

  useEffect(() => {
    if (project) {
      setClientId(project.client_id || "");
      setName(project.name || "");
      setLink(project.link || "");
      setContractValue(project.contract_value?.toString() || "");
      setStatus(project.status || "planning");
      setStartDate(project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : "");
      setEndDate(project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "");
      setPayments(project.payments || [{ amount: 0, paid: false }]);
      setTeam(project.team || []);
    } else {
      // Reset for new project
      setClientId("");
      setName("");
      setLink("");
      setContractValue("");
      setStatus("planning");
      setStartDate("");
      setEndDate("");
      setPayments([{ amount: 0, paid: false }]);
      setTeam([]);
    }
  }, [project, open]);

  const handleAddPayment = () => setPayments([...payments, { amount: 0, paid: false }]);
  const handleRemovePayment = (index: number) => setPayments(payments.filter((_, i) => i !== index));
  const handlePaymentChange = (index: number, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ""));
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], amount: numericValue };
    setPayments(newPayments);
  };

  const handleAddTeamMember = () => setTeam([...team, { role: '', id: '', name: '' }]);
  const handleRemoveTeamMember = (index: number) => setTeam(team.filter((_, i) => i !== index));
  const handleTeamChange = (index: number, field: 'role' | 'id', value: string) => {
    const newTeam = [...team];
    if (field === 'id') {
      const selectedPerson = personnelList.find(p => p.id === value);
      newTeam[index] = { ...newTeam[index], id: value, name: selectedPerson?.name || '' };
    } else {
      newTeam[index] = { ...newTeam[index], role: value };
    }
    setTeam(newTeam);
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') value = value.toString();
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(value.replace(/[^0-9]/g, "")));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === clientId);
    const dataToSave = {
      client_id: clientId,
      client_name: selectedClient?.name,
      name,
      link,
      contract_value: Number(contractValue.replace(/\./g, '')),
      status,
      start_date: startDate,
      end_date: endDate,
      payments,
      team,
    };
    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? "Sửa dự án" : "Thêm dự án mới"}</DialogTitle>
          <DialogDescription>Điền thông tin chi tiết của dự án vào form bên dưới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn client" /></SelectTrigger>
                <SelectContent>{clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
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
              <Input id="contract_value" value={formatCurrency(contractValue)} onChange={(e) => setContractValue(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Thời gian</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Thanh toán</Label>
              <div className="col-span-3 space-y-2">
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label htmlFor={`payment-${index}`} className="min-w-[50px]">Đợt {index + 1}</Label>
                    <Input id={`payment-${index}`} value={formatCurrency(payment.amount)} onChange={(e) => handlePaymentChange(index, e.target.value)} className="flex-1" placeholder="Nhập số tiền" />
                    {payments.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePayment(index)}><Trash2 className="h-4 w-4" /></Button>)}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddPayment}><PlusCircle className="h-4 w-4 mr-2" />Thêm đợt</Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Nhân sự</Label>
              <div className="col-span-3 space-y-2">
                {team.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={member.role} onValueChange={(value) => handleTeamChange(index, 'role', value)}>
                      <SelectTrigger className="w-[120px]"><SelectValue placeholder="Vai trò" /></SelectTrigger>
                      <SelectContent><SelectItem value="Account">Account</SelectItem><SelectItem value="Content">Content</SelectItem><SelectItem value="Seeder">Seeder</SelectItem><SelectItem value="Sale">Sale</SelectItem></SelectContent>
                    </Select>
                    <Select value={member.id} onValueChange={(value) => handleTeamChange(index, 'id', value)}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn nhân sự" /></SelectTrigger>
                      <SelectContent>{personnelList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTeamMember(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddTeamMember}><PlusCircle className="h-4 w-4 mr-2" />Thêm nhân sự</Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Tiến độ</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent><SelectItem value="planning">Pending</SelectItem><SelectItem value="in-progress">Đang chạy</SelectItem><SelectItem value="completed">Hoàn thành</SelectItem><SelectItem value="overdue">Quá hạn</SelectItem></SelectContent>
              </Select>
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