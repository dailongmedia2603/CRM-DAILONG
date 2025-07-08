import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showError } from "@/utils/toast";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}

export const ReportDialog = ({ open, onOpenChange, onSubmit }: ReportDialogProps) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      showError("Vui lòng nhập lý do trễ deadline.");
      return;
    }
    onSubmit(reason);
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo lý do trễ Deadline</DialogTitle>
          <DialogDescription>Vui lòng giải trình lý do không hoàn thành công việc đúng hạn. Báo cáo này sẽ được gửi đến quản lý.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="report-reason">Lý do</Label>
          <Textarea id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do của bạn..." rows={5} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Gửi Báo cáo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};