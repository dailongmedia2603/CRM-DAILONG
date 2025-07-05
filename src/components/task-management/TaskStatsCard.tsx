import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp } from "lucide-react";

interface TaskStatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const TaskStatsCard = ({ title, value, subtitle, icon: Icon, iconBgColor, onClick, className, isActive }: TaskStatsCardProps) => {
  return (
    <Card
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        isActive && "ring-2 ring-blue-500",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center">
        <div className={cn("p-3 rounded-lg mr-4", iconBgColor)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-green-500" />
      </CardContent>
    </Card>
  );
};