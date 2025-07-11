import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
}

export const TaskCard = ({ task, onViewDetails }: TaskCardProps) => {
  const getStatusBadge = (status: Task['status']) => {
    if (status === 'Hoàn thành') return 'bg-green-100 text-green-800';
    if (status === 'Đang làm') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full" onClick={() => onViewDetails(task)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium truncate">{task.name}</CardTitle>
          <Badge variant="outline" className={cn("capitalize", getStatusBadge(task.status))}>
            {task.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">Giao cho: {task.assignee.name}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="font-medium">{format(new Date(task.deadline), "dd/MM/yyyy HH:mm")}</p>
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