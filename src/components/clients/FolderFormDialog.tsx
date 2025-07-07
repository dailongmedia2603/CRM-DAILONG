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
import { ProfileFolder } from "@/types";

interface FolderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  folder?: ProfileFolder | null;
}

export const FolderFormDialog = ({ open, onOpenChange, onSave, folder }: FolderFormDialogProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (folder) setName(folder.name);
    else setName("");
  }, [folder, open]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{folder ? "Đổi tên thư mục" : "Tạo thư mục mới"}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="folder-name">Tên thư mục</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hợp đồng, Thanh toán..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};