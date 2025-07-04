import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError } from "@/utils/toast";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reportLink: string) => void;
}

export const ReportDialog = ({ open, onOpenChange, onSubmit }: ReportDialogProps) => {
  const [link, setLink] = useState('');

  const handleSubmit = () => {
    if (!link.trim()) {
      showError("Vui lòng nhập link báo cáo.");
      return;
    }
    onSubmit(link);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nộp Báo cáo Hoàn thành</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="report-link">Link báo cáo</Label>
          <Input id="report-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dán link báo cáo của bạn vào đây" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Hoàn thành</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};