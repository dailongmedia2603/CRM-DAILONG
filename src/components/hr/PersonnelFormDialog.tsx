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
import { Personnel, Position } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

interface PersonnelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  personnel?: Personnel | null;
  positions: Position[];
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
    position_id: "",
    role: "Nhân viên" as Personnel['role'],
    status: "active" as Personnel['status'],
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!personnel;

  useEffect(() => {
    if (personnel) {
      setFormData({
        name: personnel.name,
        email: personnel.email,
        position_id: personnel.position_id || "",
        role: personnel.role,
        status: personnel.status,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        position_id: "",
        role: "Nhân viên",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const selectedPosition = positions.find(p => p.id === formData.position_id);
    if (!selectedPosition) {
        showError("Vui lòng chọn một vị trí hợp lệ.");
        setIsLoading(false);
        return;
    }

    if (isEditing && personnel) {
      const { error } = await supabase
        .from('personnel')
        .update({
          name: formData.name,
          position: selectedPosition.name,
          position_id: formData.position_id,
          role: formData.role,
          status: formData.status,
        })
        .eq('id', personnel.id);

      if (error) {
        showError("Lỗi khi cập nhật nhân sự: " + error.message);
      } else {
        showSuccess("Cập nhật thông tin thành công!");
        onSave();
      }
    } else {
      if (!formData.password) {
        showError("Vui lòng nhập mật khẩu cho người dùng mới.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-personnel-user', {
        body: { 
          email: formData.email, 
          password: formData.password,
          name: formData.name,
          position: selectedPosition.name, // Pass the name
          position_id: formData.position_id, // Pass the ID
          role: formData.role,
          status: formData.status,
        },
      });

      if (error || (data && data.error)) {
        showError("Lỗi khi tạo tài khoản: " + (error?.message || data.error));
      } else {
        showSuccess("Thêm nhân sự mới thành công!");
        onSave();
      }
    }

    setIsLoading(false);
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
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isEditing} />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="position_id">Vị trí</Label>
              <Select value={formData.position_id} onValueChange={(value) => handleSelectChange("position_id", value)}>
                <SelectTrigger><SelectValue placeholder="Chọn vị trí" /></SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
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
            <Button type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};