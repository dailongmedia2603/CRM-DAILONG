import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showError } from "@/utils/toast";

interface WeeklyReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (report: { status: string; issues: string; requests: string }) => void;
  projectName: string;
}

export const WeeklyReportFormDialog = ({
  open,
  onOpenChange,
  onSave,
  projectName,
}: WeeklyReportFormDialogProps) => {
  const [status, setStatus] = useState("");
  const [issues, setIssues] = useState("");
  const [requests, setRequests] = useState("");

  useEffect(() => {
    if (open) {
      setStatus("");
      setIssues("");
      setRequests("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!status.trim()) {
      showError("Vui lòng nhập tình trạng dự án.");
      return;
    }
    onSave({ status, issues, requests });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Báo cáo tuần: {projectName}</DialogTitle>
          <DialogDescription>
            Cập nhật tiến độ, các vấn đề và mong muốn cho tuần này.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Tình trạng</Label>
            <Textarea
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Cập nhật tình trạng chung của dự án..."
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issues">Vấn đề</Label>
            <Textarea
              id="issues"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="Các vấn đề gặp phải (nếu có)..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requests">Mong muốn</Label>
            <Textarea
              id="requests"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="Các mong muốn hoặc đề xuất cho tuần tới..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu báo cáo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};