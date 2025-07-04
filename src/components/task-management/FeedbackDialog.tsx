import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { Feedback } from "@/data/tasks";
import { formatDistanceToNow } from "date-fns";
import { vi } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  history: Feedback[];
  onAddFeedback: (message: string) => void;
  currentUser: { id: string; name: string };
}

export const FeedbackDialog = ({ open, onOpenChange, taskName, history, onAddFeedback, currentUser }: FeedbackDialogProps) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
      }, 100);
    }
  }, [history, open]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onAddFeedback(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Trao đổi về: {taskName}</DialogTitle>
          <DialogDescription>Lịch sử trao đổi và feedback cho công việc.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-6 py-6">
              {history.length > 0 ? (
                history.map(fb => {
                  const isCurrentUser = fb.userId === currentUser.id;
                  return (
                    <div key={fb.id} className={cn("flex items-start gap-3", isCurrentUser && "flex-row-reverse")}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{fb.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={cn("flex flex-col max-w-[75%]", isCurrentUser ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "p-3 rounded-lg",
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          )}
                        >
                          <p className="text-sm">{fb.message}</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 px-1">
                          <span>{fb.userName}</span> &middot; <span>{formatDistanceToNow(new Date(fb.timestamp), { addSuffix: true, locale: vi })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-16">
                  <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="font-medium">Chưa có feedback nào.</p>
                  <p className="text-sm">Hãy là người đầu tiên gửi tin nhắn!</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};