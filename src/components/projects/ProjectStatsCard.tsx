import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProjectStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export const ProjectStatsCard = ({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
  variant = "default",
  className,
}: ProjectStatsCardProps) => {
  const variantClasses = {
    default: "bg-gray-50 border-gray-200 text-gray-800",
    primary: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  const activeClasses = {
    default: "ring-2 ring-gray-500 bg-gray-100",
    primary: "ring-2 ring-blue-500 bg-blue-100",
    success: "ring-2 ring-green-500 bg-green-100",
    warning: "ring-2 ring-amber-500 bg-amber-100",
    danger: "ring-2 ring-red-500 bg-red-100",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all duration-200 cursor-pointer hover:shadow-md",
        variantClasses[variant],
        isActive && activeClasses[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="p-3 rounded-lg bg-white/50">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};