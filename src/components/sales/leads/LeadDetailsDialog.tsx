import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Phone, ShoppingBag, Calendar, Check, HelpCircle, BarChart, ScrollText } from "lucide-react";

interface LeadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const DetailItem = ({ icon, label, value, badgeVariant }: { icon: React.ReactNode, label: string, value: React.ReactNode, badgeVariant?: string }) => (
  <div className="flex items-start gap-4">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      {typeof value === 'string' && badgeVariant ? (
        <Badge variant="outline" className={cn("text-sm capitalize", badgeVariant)}>{value}</Badge>
      ) : (
        <div className="font-semibold text-gray-800">{value}</div>
      )}
    </div>
  </div>
);

export const LeadDetailsDialog = ({ open, onOpenChange, lead }: LeadDetailsDialogProps) => {
  if (!lead) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const getPotentialBadge = (potential: Lead['potential']) => {
    switch (potential) {
      case 'tiềm năng': return 'bg-green-100 text-green-800 border-green-200';
      case 'không tiềm năng': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'đang làm việc': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'đang suy nghĩ': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'im ru': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'từ chối': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultBadge = (result: Lead['result']) => {
    switch (result) {
      case 'ký hợp đồng': return 'bg-green-100 text-green-800 border-green-200';
      case 'đang trao đổi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chưa quyết định': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'từ chối': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const latestHistory = lead.lead_history?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
          <DialogDescription>
            Chi tiết Lead #{lead.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
            <div className="space-y-4">
              <DetailItem icon={<User className="h-5 w-5" />} label="Tên Lead" value={lead.name} />
              <DetailItem icon={<Phone className="h-5 w-5" />} label="Số điện thoại" value={lead.phone} />
              <DetailItem icon={<ShoppingBag className="h-5 w-5" />} label="Sản phẩm" value={lead.product} />
            </div>
            <div className="space-y-4">
              <DetailItem icon={<User className="h-5 w-5" />} label="Nhân viên Sale" value={lead.created_by_name} />
              <DetailItem icon={<Calendar className="h-5 w-5" />} label="Ngày tạo" value={formatDate(lead.created_at)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={<BarChart className="h-5 w-5" />} label="Tiềm năng" value={lead.potential} badgeVariant={getPotentialBadge(lead.potential)} />
            <DetailItem icon={<HelpCircle className="h-5 w-5" />} label="Trạng thái" value={lead.status} badgeVariant={getStatusBadge(lead.status)} />
            <DetailItem icon={<Check className="h-5 w-5" />} label="Kết quả" value={lead.result} badgeVariant={getResultBadge(lead.result)} />
          </div>

          {latestHistory && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><ScrollText className="h-5 w-5" /> Lịch sử chăm sóc gần nhất</h4>
              <div className="p-4 bg-muted rounded-lg text-sm prose max-w-none">
                <p><strong>{latestHistory.user_name}</strong> - {formatDate(latestHistory.date)}</p>
                <p>{latestHistory.content}</p>
                {latestHistory.next_follow_up_date && (
                  <p className="text-blue-600"><strong>CS tiếp theo:</strong> {formatDate(latestHistory.next_follow_up_date)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};