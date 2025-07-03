import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TaskStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: 'red' | 'yellow' | 'blue' | 'orange' | 'purple';
  onClick: () => void;
}

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
  },
};

export const TaskStatsCard = ({ title, value, description, icon: Icon, color, onClick }: TaskStatsCardProps) => {
  const classes = colorClasses[color];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border flex items-start justify-between cursor-pointer transition-all hover:shadow-md',
        classes.bg,
        classes.border
      )}
      onClick={onClick}
    >
      <div>
        <p className={cn('text-sm font-medium', classes.iconText)}>{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex flex-col items-end">
        <div className={cn('p-2 rounded-full', classes.iconBg)}>
          <Icon className={cn('h-5 w-5', classes.iconText)} />
        </div>
        <p className={cn('text-xs font-semibold mt-auto uppercase', classes.iconText)}>
          CLICK TO FILTER
        </p>
      </div>
    </div>
  );
};