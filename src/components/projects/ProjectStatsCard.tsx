import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp } from "lucide-react";

interface ProjectStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
  iconBgColor?: string;
  className?: string;
}

export const ProjectStatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  onClick,
  isActive,
  iconBgColor = "bg-gray-500",
  className,
}: ProjectStatsCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md bg-white",
        isActive && "ring-2 ring-blue-500 shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn("p-2 md:p-3 rounded-lg mr-2 md:mr-4", iconBgColor)}>
              <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-xl md:text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
      </CardContent>
    </Card>
  );
};