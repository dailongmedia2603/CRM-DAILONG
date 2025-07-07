import { useState } from "react";
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
import { showError } from "@/utils/toast";

interface AcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (link: string) => void;
}

export const AcceptanceDialog = ({ open, onOpenChange, onConfirm }: AcceptanceDialogProps) => {
  const [link, setLink] = useState("");

  const handleConfirm = () => {
    if (!link.trim()) {
      showError("Vui lòng nhập link nghiệm thu.");
      return;
    }
    onConfirm(link);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hoàn thành Dự án</DialogTitle>
          <DialogDescription>Vui lòng nhập link nghiệm thu để hoàn tất dự án.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="acceptance-link">Link nghiệm thu</Label>
          <Input
            id="acceptance-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Dán link vào đây..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleConfirm}>Xác nhận Hoàn thành</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};