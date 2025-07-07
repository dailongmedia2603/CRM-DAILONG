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
import { Profile, ProfileFolder } from "@/types";
import { useEffect, useState } from "react";

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: Partial<Profile>) => void;
  profile?: Profile | null;
  folders: ProfileFolder[];
  defaultFolderId?: string | null;
}

export const ProfileFormDialog = ({
  open,
  onOpenChange,
  onSave,
  profile,
  folders,
  defaultFolderId = null,
}: ProfileFormDialogProps) => {
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else {
      setFormData({
        name: '',
        link: '',
        status: "KH check",
        folder_id: defaultFolderId,
      });
    }
  }, [profile, open, defaultFolderId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'status' | 'folder_id', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value === 'none' ? null : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.link) {
      alert("Vui lòng điền đầy đủ tên và link hồ sơ.");
      return;
    }
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
              <Label htmlFor="folder_id">Thư mục</Label>
              <Select value={formData.folder_id || 'none'} onValueChange={(value) => handleSelectChange('folder_id', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có thư mục</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value as Profile['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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