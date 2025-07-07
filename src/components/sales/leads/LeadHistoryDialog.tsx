import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Phone, Mail, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';
import { LeadHistory } from "@/types";

interface LeadHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadId: string;
  history: LeadHistory[];
  onAddHistory: (leadId: string, newHistoryData: Partial<LeadHistory>) => void;
}

export const LeadHistoryDialog = ({
  open,
  onOpenChange,
  leadName,
  leadId,
  history,
  onAddHistory,
}: LeadHistoryDialogProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [nextFollowUpContent, setNextFollowUpContent] = useState("");
  const [type, setType] = useState<"note" | "call" | "email" | "meeting">("note");
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>();
  
  const sortedHistory = [...(history || [])].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

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

  const handleAddHistory = () => {
    if (!content.trim()) {
      return;
    }

    onAddHistory(leadId, {
      content: content.trim(),
      type,
      next_follow_up_date: nextFollowUpDate ? nextFollowUpDate.toISOString() : undefined,
      next_follow_up_content: nextFollowUpContent.trim(),
      user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Mock user id, replace with actual user id
      user_name: "Current User" // Mock user name, replace with actual user name
    });
    showSuccess("Đã thêm lịch sử chăm sóc mới");
    
    setContent("");
    setNextFollowUpContent("");
    setType("note");
    setNextFollowUpDate(undefined);
    setIsAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lịch sử chăm sóc: {leadName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-2">
          <Button 
            variant={isAdding ? "outline" : "default"} 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Hủy" : "Thêm mới"}
          </Button>
        </div>

        {isAdding && (
          <div className="space-y-4 border rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Loại hoạt động</div>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Ghi chú</SelectItem>
                  <SelectItem value="call">Cuộc gọi</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Cuộc họp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Nội dung chăm sóc</div>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung chăm sóc..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">Nội dung chăm sóc tiếp theo</div>
              <Textarea 
                value={nextFollowUpContent} 
                onChange={(e) => setNextFollowUpContent(e.target.value)}
                placeholder="Nhập nội dung cho lần chăm sóc tiếp theo..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">Ngày chăm sóc tiếp theo</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextFollowUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextFollowUpDate ? format(nextFollowUpDate, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextFollowUpDate}
                    onSelect={setNextFollowUpDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button onClick={handleAddHistory} disabled={!content.trim()}>
              Lưu lịch sử
            </Button>
          </div>
        )}

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
                        {item.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 w-[1px] bg-border mt-2"></div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>{item.user_name}</span>
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
                    {item.next_follow_up_date && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        Chăm sóc tiếp theo: {formatDate(item.next_follow_up_date)}
                      </div>
                    )}
                    {item.next_follow_up_content && (
                      <div className="text-xs text-gray-500 mt-1 pl-4 border-l-2 border-gray-300">
                        <strong>Nội dung:</strong> {item.next_follow_up_content}
                      </div>
                    )}
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