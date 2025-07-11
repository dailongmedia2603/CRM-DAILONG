import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
}

export const LeadCard = ({ lead, onViewDetails }: LeadCardProps) => {
  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'đang làm việc': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'đang suy nghĩ': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'im ru': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'từ chối': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full" onClick={() => onViewDetails(lead)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{lead.name}</CardTitle>
          <Badge variant="outline" className={cn("capitalize", getStatusBadge(lead.status))}>
            {lead.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">{lead.product}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Sale</p>
            <p className="font-medium">{lead.created_by_name}</p>
          </div>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewDetails(lead); }}>
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};