import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface TaskStatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const TaskStatsCard = ({ title, value, icon: Icon, onClick, className, isActive }: TaskStatsCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isActive ? "ring-2 ring-blue-500 shadow-md" : "shadow-sm",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  );
};