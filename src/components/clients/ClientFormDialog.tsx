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
import { useEffect, useState } from "react";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Partial<Client>) => void;
  client?: Client | null;
}

export const ClientFormDialog = ({
  open,
  onOpenChange,
  onSave,
  client,
}: ClientFormDialogProps) => {
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({ 
        status: "active",
        creationDate: new Date().toISOString().split('T')[0] // Set today's date for new clients
      });
    }
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.email) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    
    const dataToSave: Partial<Client> = { ...formData };
    
    // Chỉ gửi id khi chỉnh sửa, không gửi khi tạo mới
    if (client?.id) {
      dataToSave.id = client.id;
    } else {
      delete dataToSave.id;
    }

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Chỉnh sửa Client" : "Thêm Client mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết của client vào form bên dưới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên Client</Label>
              <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">Người liên hệ</Label>
              <Input id="contactPerson" name="contactPerson" value={formData.contactPerson || ""} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceEmail" className="text-right">Mail hóa đơn</Label>
              <Input id="invoiceEmail" name="invoiceEmail" type="email" value={formData.invoiceEmail || ""} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contractValue" className="text-right">Giá trị HĐ</Label>
              <Input id="contractValue" name="contractValue" type="number" value={formData.contractValue || 0} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classification" className="text-right">Phân loại</Label>
              <Select value={formData.classification} onValueChange={(value) => handleSelectChange("classification", value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn phân loại" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cá nhân">Cá nhân</SelectItem>
                  <SelectItem value="Doanh nghiệp">Doanh nghiệp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">Nguồn</Label>
              <Select value={formData.source} onValueChange={(value) => handleSelectChange("source", value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Chọn nguồn" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Giới thiệu">Giới thiệu</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Sự kiện">Sự kiện</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};