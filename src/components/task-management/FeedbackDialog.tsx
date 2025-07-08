import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { Feedback } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from 'date-fns/locale';

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
  const [localHistory, setLocalHistory] = useState<Feedback[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setLocalHistory(history);
    }
  }, [history, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [localHistory, open]);

  const handleSend = () => {
    if (newMessage.trim() && currentUser.id) {
      const tempFeedback: Feedback = {
        id: Date.now().toString(), // Temporary unique key for rendering
        user_id: currentUser.id,
        user_name: currentUser.name,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setLocalHistory(prev => [...prev, tempFeedback]); // Optimistic update
      onAddFeedback(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-lg">Feedback cho: {taskName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-6 py-4">
              {localHistory.map(fb => (
                <div key={fb.id} className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>{fb.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{fb.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(fb.timestamp), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                    <div className="mt-1 bg-gray-100 p-3 rounded-lg text-sm w-fit max-w-full">
                      <p className="break-words">{fb.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {localHistory.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có feedback nào.
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-white">
            <div className="relative">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Nhập feedback..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="pr-12 h-10"
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-slate-900 hover:bg-slate-800"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};