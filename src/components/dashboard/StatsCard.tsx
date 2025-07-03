import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
            
            {trend && trendValue && (
              <div className="flex items-center">
                <span
                  className={cn(
                    "text-sm font-semibold flex items-center",
                    trend === "up" && "text-emerald-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-gray-600"
                  )}
                >
                  {trend === "up" && (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {trend === "down" && (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {trendValue}
                </span>
                {description && (
                  <span className="text-sm text-gray-500 ml-2">
                    {description}
                  </span>
                )}
              </div>
            )}
            
            {!trend && description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          
          {Icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;