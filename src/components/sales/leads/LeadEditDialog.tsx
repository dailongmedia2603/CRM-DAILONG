import { useState, useEffect } from "react";
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

interface Lead {
  id: string;
  name: string;
  phone: string;
  product: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  potential: "tiềm năng" | "không tiềm năng" | "chưa xác định";
  status: "đang làm việc" | "đang suy nghĩ" | "im ru" | "từ chối";
  result: "ký hợp đồng" | "chưa quyết định" | "từ chối" | "đang trao đổi";
  archived: boolean;
  history: any[];
}

interface SalesPerson {
  id: string;
  name: string;
}

interface LeadEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  salesPersons: SalesPerson[];
  onSaveLead: (updatedLead: Lead) => void;
}

export const LeadEditDialog = ({
  open,
  onOpenChange,
  lead,
  salesPersons,
  onSaveLead,
}: LeadEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});

  // Populate form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead]);

  if (!lead) return null;

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn nhân viên sale
  const handleSelectSalesPerson = (salesPersonId: string) => {
    const selectedPerson = salesPersons.find((person) => person.id === salesPersonId);
    
    if (selectedPerson) {
      setFormData((prev) => ({
        ...prev,
        createdBy: {
          id: selectedPerson.id,
          name: selectedPerson.name,
        },
      }));
    }
  };

  // Xử lý submit form
  const handleSubmit = () => {
    // Kiểm tra thông tin bắt buộc
    if (!formData.name?.trim()) {
      showError("Vui lòng nhập tên lead");
      return;
    }

    if (!formData.phone?.trim()) {
      showError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!formData.product?.trim()) {
      showError("Vui lòng nhập sản phẩm quan tâm");
      return;
    }

    if (!formData.createdBy?.id) {
      showError("Vui lòng chọn nhân viên sale");
      return;
    }

    // Truyền dữ liệu cập nhật lên component cha
    onSaveLead(formData as Lead);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Lead</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên lead <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Nhập tên lead"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Nhập số điện thoại"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Input
              id="product"
              name="product"
              value={formData.product || ""}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Nhập sản phẩm quan tâm"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salesPerson" className="text-right">
              Nhân viên sale <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.createdBy?.id || ""}
              onValueChange={handleSelectSalesPerson}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn nhân viên sale" />
              </SelectTrigger>
              <SelectContent>
                {salesPersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="potential" className="text-right">
              Tiềm năng
            </Label>
            <Select
              value={formData.potential || "chưa xác định"}
              onValueChange={(value) => handleSelectChange("potential", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn mức độ tiềm năng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiềm năng">Tiềm năng</SelectItem>
                <SelectItem value="không tiềm năng">Không tiềm năng</SelectItem>
                <SelectItem value="chưa xác định">Chưa xác định</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Trạng thái chăm sóc
            </Label>
            <Select
              value={formData.status || "đang suy nghĩ"}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn trạng thái chăm sóc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="đang làm việc">Đang làm việc</SelectItem>
                <SelectItem value="đang suy nghĩ">Đang suy nghĩ</SelectItem>
                <SelectItem value="im ru">Im ru</SelectItem>
                <SelectItem value="từ chối">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="result" className="text-right">
              Kết quả bán hàng
            </Label>
            <Select
              value={formData.result || "chưa quyết định"}
              onValueChange={(value) => handleSelectChange("result", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn kết quả bán hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ký hợp đồng">Ký hợp đồng</SelectItem>
                <SelectItem value="chưa quyết định">Chưa quyết định</SelectItem>
                <SelectItem value="từ chối">Từ chối</SelectItem>
                <SelectItem value="đang trao đổi">Đang trao đổi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu Thay Đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditDialog;