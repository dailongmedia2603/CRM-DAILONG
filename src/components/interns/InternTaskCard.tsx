import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InternTask } from "@/types";
import { Eye, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

interface InternTaskCardProps {
  task: InternTask;
  onViewDetails: (task: InternTask) => void;
}

export const InternTaskCard = ({ task, onViewDetails }: InternTaskCardProps) => {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Hoàn thành';
  const displayStatus = isOverdue ? 'Quá hạn' : task.status;

  const getStatusBadgeStyle = (status: InternTask['status'], isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-800';
    switch (status) {
      case 'Đang làm': return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full" onClick={() => onViewDetails(task)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium truncate">{task.title}</CardTitle>
          <Badge variant="outline" className={cn("capitalize whitespace-nowrap", getStatusBadgeStyle(task.status, isOverdue))}>
            {displayStatus}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">{task.intern_name}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className={cn("font-medium", isOverdue && "text-red-600 flex items-center")}>
              {isOverdue && <AlertCircle className="h-4 w-4 mr-1" />}
              {format(new Date(task.deadline), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewDetails(task); }}>
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};