import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Phone, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadHistory {
  id: string;
  date: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  type: "note" | "call" | "email" | "meeting";
}

interface LeadHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  history: LeadHistory[];
}

export const LeadHistoryDialog = ({
  open,
  onOpenChange,
  leadName,
  history,
}: LeadHistoryDialogProps) => {
  // Sắp xếp lịch sử theo thời gian gần nhất
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Lấy icon theo loại hoạt động
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Lấy màu theo loại hoạt động
  const getActivityColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-600";
      case "email":
        return "bg-purple-100 text-purple-600";
      case "meeting":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lịch sử chăm sóc: {leadName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có lịch sử chăm sóc nào
              </div>
            ) : (
              sortedHistory.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {item.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 w-[1px] bg-border mt-2"></div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>{item.user.name}</span>
                      <span className="text-muted-foreground mx-1">•</span>
                      <div className={cn("flex items-center rounded-full px-2 py-1 text-xs", getActivityColor(item.type))}>
                        {getActivityIcon(item.type)}
                        <span className="ml-1 capitalize">
                          {item.type === "call" ? "Cuộc gọi" : 
                           item.type === "email" ? "Email" : 
                           item.type === "meeting" ? "Cuộc họp" : "Ghi chú"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      {item.content}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};