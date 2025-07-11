import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardMobileProps {
  project: Project;
  onViewDetails: (project: Project) => void;
}

export const ProjectCardMobile = ({ project, onViewDetails }: ProjectCardMobileProps) => {
  const statusTextMap: { [key: string]: string } = {
    planning: "Pending",
    "in-progress": "Đang chạy",
    completed: "Hoàn thành",
    overdue: "Quá hạn",
  };

  const statusColorMap: { [key: string]: string } = {
    planning: "bg-amber-100 text-amber-800 border-amber-200",
    "in-progress": "bg-cyan-100 text-cyan-800 border-cyan-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card className="w-full" onClick={() => onViewDetails(project)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{project.name}</CardTitle>
          <Badge variant="outline" className={cn("capitalize", statusColorMap[project.status])}>
            {statusTextMap[project.status] || project.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground pt-1">{project.client_name}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="font-medium">{new Date(project.end_date).toLocaleDateString('vi-VN')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewDetails(project); }}>
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};