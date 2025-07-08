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
import { Personnel } from "@/types";
import { showSuccess, showError } from "@/utils/toast";

interface PersonnelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personnel: Omit<Personnel, 'id' | 'created_at'> & { id?: string; password?: string }) => void;
  personnel?: Personnel | null;
  positions: string[];
}

export const PersonnelFormDialog = ({
  open,
  onOpenChange,
  onSave,
  personnel,
  positions,
}: PersonnelFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    role: "Nhân viên" as Personnel['role'],
    status: "active" as Personnel['status'],
    password: "",
    avatar: "",
  });

  const isEditing = !!personnel;

  useEffect(() => {
    if (personnel) {
      setFormData({
        name: personnel.name,
        email: personnel.email,
        position: personnel.position,
        role: personnel.role,
        status: personnel.status,
        password: "", // Không hiển thị mật khẩu cũ
        avatar: personnel.avatar || "",
      });
    } else {
      // Reset form for new personnel
      setFormData({
        name: "",
        email: "",
        position: "",
        role: "Nhân viên",
        status: "active",
        password: "",
        avatar: "",
      });
    }
  }, [personnel, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.position) {
      showError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    if (!isEditing && !formData.password) {
      showError("Vui lòng nhập mật khẩu cho người dùng mới.");
      return;
    }

    const dataToSave: Omit<Personnel, 'id' | 'created_at'> & { id?: string; password?: string } = {
      ...formData,
    };
    
    if (personnel) {
      dataToSave.id = personnel.id;
    }
    if (!formData.password) {
      delete dataToSave.password;
    }

    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa Nhân sự" : "Thêm Nhân sự mới"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Cập nhật thông tin chi tiết cho nhân sự." : "Điền thông tin để tạo một tài khoản nhân sự mới."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Tài khoản đăng nhập)</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Link ảnh đại diện</Label>
              <Input id="avatar" name="avatar" value={formData.avatar} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Để trống nếu không đổi" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí</Label>
              <Select value={formData.position} onValueChange={(value) => handleSelectChange("position", value)}>
                <SelectTrigger><SelectValue placeholder="Chọn vị trí" /></SelectTrigger>
                <SelectContent>
                  {positions.map((pos, index) => (
                    <SelectItem key={index} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Cấp bậc</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value as Personnel['role'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOD">BOD</SelectItem>
                    <SelectItem value="Quản lý">Quản lý</SelectItem>
                    <SelectItem value="Nhân viên">Nhân viên</SelectItem>
                    <SelectItem value="Thực tập">Thực tập</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value as Personnel['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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