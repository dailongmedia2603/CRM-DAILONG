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

const FORM_DATA_KEY = 'folderFormData';

export const FolderFormDialog = ({ open, onOpenChange, onSave, folder }: FolderFormDialogProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      const savedName = sessionStorage.getItem(FORM_DATA_KEY);
      if (savedName) {
        setName(savedName);
      } else {
        const initialName = folder ? folder.name : "";
        setName(initialName);
        sessionStorage.setItem(FORM_DATA_KEY, initialName);
      }
    }
  }, [folder, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    sessionStorage.setItem(FORM_DATA_KEY, e.target.value);
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
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
            onChange={handleNameChange}
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