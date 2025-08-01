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
import { Client, Personnel, Payment } from "@/types";
import { PlusCircle, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import usePersistentState from "@/hooks/usePersistentState";

interface TeamMember {
  role: string;
  id: string;
  name: string;
}

interface ProjectFormData {
  clientId: string;
  name: string;
  link: string;
  contractValue: string;
  status: string;
  startDate: string;
  endDate: string;
  payments: Payment[];
  team: TeamMember[];
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
  const [formData, setFormData] = usePersistentState<ProjectFormData>('projectFormData', {
    clientId: "", name: "", link: "", contractValue: "", status: "in-progress",
    startDate: "", endDate: "", payments: [{ amount: 0, paid: false, note: '', personnel_id: '' }], team: [],
  });
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase.from('personnel').select('*');
      if (error) showError("Lỗi khi tải danh sách nhân sự.");
      else setPersonnelList(data as Personnel[]);
    };
    fetchPersonnel();
  }, []);

  useEffect(() => {
    if (open) {
      if (project) { // Edit mode: always populate from the project prop
        setFormData({
          clientId: project.client_id || "",
          name: project.name || "",
          link: project.link || "",
          contractValue: project.contract_value?.toString() || "",
          status: project.status || "in-progress",
          startDate: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : "",
          endDate: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "",
          payments: project.payments && project.payments.length > 0 ? project.payments : [{ amount: 0, paid: false, note: '', personnel_id: '' }],
          team: project.team || [],
        });
      } else { // Add mode: check if stale data from an edit needs clearing
        const hasDataFromEdit = formData.clientId || formData.name;
        if (hasDataFromEdit) {
          if (formData.clientId) { 
            setFormData({
              clientId: "", name: "", link: "", contractValue: "", status: "in-progress",
              startDate: "", endDate: "", payments: [{ amount: 0, paid: false, note: '', personnel_id: '' }], team: [],
            });
          }
        }
      }
    }
  }, [project, open]);

  const handleAddPayment = () => setFormData(prev => ({ ...prev, payments: [...prev.payments, { amount: 0, paid: false, note: '', personnel_id: '' }] }));
  const handleRemovePayment = (index: number) => setFormData(prev => ({ ...prev, payments: prev.payments.filter((_, i) => i !== index) }));
  
  const handlePaymentFieldChange = (index: number, field: keyof Payment, value: string | number) => {
    const newPayments = [...formData.payments];
    let currentPayment = { ...newPayments[index] };

    if (field === 'amount') {
        const numericValue = Number(String(value).replace(/[^0-9]/g, ""));
        currentPayment.amount = numericValue;
    } else if (field === 'personnel_id') {
        const selectedPerson = personnelList.find(p => p.id === value);
        currentPayment.personnel_id = value as string;
        currentPayment.personnel_name = selectedPerson?.name || '';
    } else if (field === 'note') {
        currentPayment.note = value as string;
    }
    
    newPayments[index] = currentPayment;
    setFormData(prev => ({ ...prev, payments: newPayments }));
  };

  const handleAddTeamMember = () => setFormData(prev => ({ ...prev, team: [...prev.team, { role: '', id: '', name: '' }] }));
  const handleRemoveTeamMember = (index: number) => setFormData(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== index) }));
  const handleTeamChange = (index: number, field: 'role' | 'id', value: string) => {
    const newTeam = [...formData.team];
    if (field === 'role') {
      newTeam[index] = { ...newTeam[index], role: value, id: '', name: '' };
    } else if (field === 'id') {
      const selectedPerson = personnelList.find(p => p.id === value);
      newTeam[index] = { ...newTeam[index], id: value, name: selectedPerson?.name || '' };
    }
    setFormData(prev => ({ ...prev, team: newTeam }));
  };

  const getPersonnelForRole = (role: string) => {
    if (!role) return personnelList;
    return personnelList.filter(p => p.position.toLowerCase().includes(role.toLowerCase()));
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') value = value.toString();
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(value.replace(/[^0-9]/g, "")));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const dataToSave = {
      client_id: formData.clientId,
      client_name: selectedClient?.name,
      name: formData.name,
      link: formData.link,
      contract_value: Number(formData.contractValue.replace(/\./g, '')),
      status: formData.status,
      start_date: formData.startDate,
      end_date: formData.endDate,
      payments: formData.payments,
      team: formData.team,
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
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formData.clientId ? clients.find((c) => c.id === formData.clientId)?.name : "Chọn client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm client..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy client.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem key={client.id} value={client.name} onSelect={() => { setFormData(prev => ({ ...prev, clientId: client.id })); setComboboxOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", formData.clientId === client.id ? "opacity-100" : "opacity-0")} />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên dự án</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input id="link" type="url" value={formData.link} onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_value">Giá trị HĐ</Label>
              <Input id="contract_value" value={formatCurrency(formData.contractValue)} onChange={(e) => setFormData(prev => ({ ...prev, contractValue: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Thời gian</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thanh toán</Label>
              <div className="space-y-3">
                {formData.payments.map((payment, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`payment-amount-${index}`} className="font-semibold">Đợt {index + 1}</Label>
                      {formData.payments.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePayment(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`payment-amount-${index}`} className="text-xs">Số tiền</Label>
                        <Input id={`payment-amount-${index}`} value={formatCurrency(payment.amount)} onChange={(e) => handlePaymentFieldChange(index, 'amount', e.target.value)} placeholder="Nhập số tiền" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`payment-personnel-${index}`} className="text-xs">Nhân sự phụ trách</Label>
                        <Select value={payment.personnel_id || ''} onValueChange={(value) => handlePaymentFieldChange(index, 'personnel_id', value)}>
                          <SelectTrigger><SelectValue placeholder="Chọn nhân sự" /></SelectTrigger>
                          <SelectContent>
                            {personnelList.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`payment-note-${index}`} className="text-xs">Ghi chú</Label>
                      <Input id={`payment-note-${index}`} value={payment.note || ''} onChange={(e) => handlePaymentFieldChange(index, 'note', e.target.value)} placeholder="Thêm ghi chú..." />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddPayment}><PlusCircle className="h-4 w-4 mr-2" />Thêm đợt</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nhân sự</Label>
              <div className="space-y-2">
                {formData.team.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                    <Select value={member.role} onValueChange={(value) => handleTeamChange(index, 'role', value)}>
                      <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Vai trò" /></SelectTrigger>
                      <SelectContent><SelectItem value="Account">Account</SelectItem><SelectItem value="Content">Content</SelectItem><SelectItem value="Seeder">Seeder</SelectItem><SelectItem value="Sale">Sale</SelectItem></SelectContent>
                    </Select>
                    <Select value={member.id} onValueChange={(value) => handleTeamChange(index, 'id', value)}>
                      <SelectTrigger className="flex-1 w-full"><SelectValue placeholder="Chọn nhân sự" /></SelectTrigger>
                      <SelectContent>{getPersonnelForRole(member.role).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTeamMember(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddTeamMember}><PlusCircle className="h-4 w-4 mr-2" />Thêm nhân sự</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Tiến độ</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Pending</SelectItem>
                  <SelectItem value="in-progress">Đang chạy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
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