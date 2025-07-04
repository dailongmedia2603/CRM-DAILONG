import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { Feedback } from "@/data/tasks";
import { formatDistanceToNow } from "date-fns";
import { vi } from 'date-fns/locale';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  history: Feedback[];
  onAddFeedback: (message: string) => void;
}

export const FeedbackDialog = ({ open, onOpenChange, taskName, history, onAddFeedback }: FeedbackDialogProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onAddFeedback(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Feedback cho: {taskName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4 border rounded-md">
            <div className="space-y-4">
              {history.map(fb => (
                <div key={fb.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{fb.userName.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{fb.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(fb.timestamp), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded-lg text-sm">{fb.message}</div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-muted-foreground">Chưa có feedback nào.</p>}
            </div>
          </ScrollArea>
          <div className="mt-4 flex gap-2">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nhập feedback..." onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};