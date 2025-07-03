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
import { Personnel } from "@/data/personnel";
import { showSuccess, showError } from "@/utils/toast";

interface PersonnelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personnel: Omit<Personnel, 'id' | 'createdAt'> & { id?: string; password?: string }) => void;
  personnel?: Personnel | null;
}

export const PersonnelFormDialog = ({
  open,
  onOpenChange,
  onSave,
  personnel,
}: PersonnelFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    role: "member" as Personnel['role'],
    status: "active" as Personnel['status'],
    password: "",
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
      });
    } else {
      // Reset form for new personnel
      setFormData({
        name: "",
        email: "",
        position: "",
        role: "member",
        status: "active",
        password: "",
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

    const dataToSave: Omit<Personnel, 'id' | 'createdAt'> & { id?: string; password?: string } = {
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
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Để trống nếu không đổi" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí</Label>
              <Input id="position" name="position" value={formData.position} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Quyền hạn</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
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