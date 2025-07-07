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
import { Profile } from "@/types";
import { useEffect, useState } from "react";

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: Partial<Profile>) => void;
  profile?: Profile | null;
}

export const ProfileFormDialog = ({
  open,
  onOpenChange,
  onSave,
  profile,
}: ProfileFormDialogProps) => {
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else {
      // Reset for new profile
      setFormData({
        name: '',
        link: '',
        status: "KH check",
      });
    }
  }, [profile, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: Profile['status']) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.link) {
      alert("Vui lòng điền đầy đủ tên và link hồ sơ.");
      return;
    }
    
    // For new profiles, `id` will be undefined.
    // For existing profiles, `id` will be present.
    // The `onSave` function (handleSaveProfile) will handle the logic.
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{profile ? "Chỉnh sửa Hồ sơ" : "Thêm Hồ sơ mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên hồ sơ</Label>
              <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} placeholder="vd: Hợp đồng, BBNT, DNTT..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link hồ sơ</Label>
              <Input id="link" name="link" value={formData.link || ""} onChange={handleChange} placeholder="Nhập link hồ sơ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KH check">KH check</SelectItem>
                  <SelectItem value="Đã ký">Đã ký</SelectItem>
                  <SelectItem value="Đã Ship">Đã Ship</SelectItem>
                  <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};