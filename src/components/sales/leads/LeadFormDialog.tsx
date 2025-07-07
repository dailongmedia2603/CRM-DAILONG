import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { showError } from "@/utils/toast";
import { Personnel } from "@/types";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leadData: any) => void;
  salesPersons: Personnel[];
  lead?: any;
}

export const LeadFormDialog = ({
  open,
  onOpenChange,
  onSave,
  salesPersons,
  lead,
}: LeadFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    product: "",
    created_by_id: "",
    created_by_name: "",
    potential: "chưa xác định",
    status: "đang làm việc",
    result: "chưa quyết định",
  });

  const salesOnly = useMemo(() => 
    salesPersons.filter(p => p.position.toLowerCase() === 'sale'), 
    [salesPersons]
  );

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || "",
        phone: lead.phone || "",
        product: lead.product || "",
        created_by_id: lead.created_by_id || "",
        created_by_name: lead.created_by_name || "",
        potential: lead.potential || "chưa xác định",
        status: lead.status || "đang làm việc",
        result: lead.result || "chưa quyết định",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        product: "",
        created_by_id: "",
        created_by_name: "",
        potential: "chưa xác định",
        status: "đang làm việc",
        result: "chưa quyết định",
      });
    }
  }, [lead, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "created_by_id") {
      const selectedPerson = salesOnly.find((person) => person.id === value);
      if (selectedPerson) {
        setFormData((prev) => ({ 
          ...prev, 
          created_by_id: selectedPerson.id,
          created_by_name: selectedPerson.name 
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.product.trim() || !formData.created_by_id) {
      showError("Vui lòng điền đầy đủ các trường có dấu *.");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lead ? "Sửa thông tin lead" : "Thêm lead mới"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên lead <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên lead" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product">Sản phẩm <span className="text-red-500">*</span></Label>
            <Input id="product" name="product" value={formData.product} onChange={handleInputChange} placeholder="Nhập sản phẩm quan tâm" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salesPerson">Nhân viên sale <span className="text-red-500">*</span></Label>
            <Select value={formData.created_by_id} onValueChange={(value) => handleSelectChange("created_by_id", value)}>
              <SelectTrigger><SelectValue placeholder="Chọn nhân viên sale" /></SelectTrigger>
              <SelectContent>
                {salesOnly.map((person) => (<SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="potential">Tiềm năng</Label>
              <Select value={formData.potential} onValueChange={(value) => handleSelectChange("potential", value)}>
                <SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiềm năng">Tiềm năng</SelectItem>
                  <SelectItem value="không tiềm năng">Không tiềm năng</SelectItem>
                  <SelectItem value="chưa xác định">Chưa xác định</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái chăm sóc</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="đang làm việc">Đang làm việc</SelectItem>
                  <SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem>
                  <SelectItem value="im ru">Im ru</SelectItem>
                  <SelectItem value="từ chối">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">Kết quả bán hàng</Label>
              <Select value={formData.result} onValueChange={(value) => handleSelectChange("result", value)}>
                <SelectTrigger><SelectValue placeholder="Chọn kết quả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ký hợp đồng">Ký hợp đồng</SelectItem>
                  <SelectItem value="chưa quyết định">Chưa quyết định</SelectItem>
                  <SelectItem value="từ chối">Từ chối</SelectItem>
                  <SelectItem value="đang trao đổi">Đang trao đổi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">{lead ? "Lưu thay đổi" : "Thêm Lead"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};