import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface LeadStatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "info" | "destructive";
  onClick?: () => void;
  className?: string;
}

export const LeadStatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  onClick,
  className,
}: LeadStatsCardProps) => {
  // Định nghĩa các biến thể màu sắc
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100";
      case "secondary":
        return "border-gray-200 bg-gray-50 hover:bg-gray-100";
      case "success":
        return "border-green-200 bg-green-50 hover:bg-green-100";
      case "warning":
        return "border-amber-200 bg-amber-50 hover:bg-amber-100";
      case "info":
        return "border-cyan-200 bg-cyan-50 hover:bg-cyan-100";
      case "destructive":
        return "border-red-200 bg-red-50 hover:bg-red-100";
      default:
        return "border-slate-200 bg-white hover:bg-slate-50";
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case "primary":
        return "text-blue-600";
      case "secondary":
        return "text-gray-600";
      case "success":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "info":
        return "text-cyan-600";
      case "destructive":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border transition-colors cursor-pointer", 
        getVariantClasses(),
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {description && (
              <p className="text-xs mt-1">{description}</p>
            )}
          </div>
          
          {Icon && (
            <div className={cn("rounded-full p-2", getIconClasses())}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};