import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { FeedbackMessage } from "@/data/tasks";
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  feedback: FeedbackMessage[];
  onAddFeedback: (message: string) => void;
  currentUserId: string; // Assume we know the current user's ID
}

export const FeedbackDialog = ({ open, onOpenChange, taskName, feedback, onAddFeedback, currentUserId }: FeedbackDialogProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      onAddFeedback(newMessage.trim());
      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Feedback: {taskName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Cuộc trò chuyện giữa người giao và người nhận</p>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-4">
            {feedback.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.userId === currentUserId ? "justify-end" : "justify-start"
                )}
              >
                {msg.userId !== currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xs rounded-lg p-3",
                    msg.userId === currentUserId
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-muted rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className={cn("text-xs mt-1", msg.userId === currentUserId ? "text-blue-200" : "text-muted-foreground")}>
                    {msg.userName} • {msg.version} • {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
                {msg.userId === currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 pt-4 border-t">
          <Input
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};