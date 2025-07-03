import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TaskStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: "red" | "yellow" | "blue" | "orange" | "purple";
  onClick: () => void;
  isActive: boolean;
}

export const TaskStatsCard = ({ title, value, description, icon: Icon, color, onClick, isActive }: TaskStatsCardProps) => {
  const variants = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      ring: "ring-red-500",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-600",
      ring: "ring-yellow-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      ring: "ring-blue-500",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-600",
      ring: "ring-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
      ring: "ring-purple-500",
    },
  };

  const selectedVariant = variants[color];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        selectedVariant.bg,
        selectedVariant.border,
        isActive && `ring-2 ${selectedVariant.ring}`
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-full", selectedVariant.bg)}>
              <Icon className={cn("h-6 w-6", selectedVariant.text)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <button className={cn("text-xs font-semibold", selectedVariant.text)}>
            CLICK TO FILTER
          </button>
        </div>
      </CardContent>
    </Card>
  );
};