import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AcceptanceHistory } from "@/types";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';

interface AcceptanceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  history: AcceptanceHistory[];
  onAddHistory: (content: string) => void;
}

export const AcceptanceHistoryDialog = ({
  open,
  onOpenChange,
  projectName,
  history,
  onAddHistory,
}: AcceptanceHistoryDialogProps) => {
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newContent.trim()) return;
    onAddHistory(newContent.trim());
    setNewContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lịch sử làm việc: {projectName}</DialogTitle>
          <DialogDescription>Ghi chú và theo dõi quá trình nghiệm thu.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Nhập nội dung lịch sử..."
              rows={3}
            />
            <Button onClick={handleAdd} size="sm">Thêm lịch sử</Button>
          </div>
          <ScrollArea className="h-64 border rounded-md p-2">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="text-sm">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold">{item.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Chưa có lịch sử nào.
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};