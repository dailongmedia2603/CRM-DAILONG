import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  action: string;
  target: string;
  targetType: "client" | "project" | "lead" | "task";
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

export const RecentActivity = ({ activities, className }: RecentActivityProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return '👤';
      case 'project':
        return '📂';
      case 'lead':
        return '🔍';
      case 'task':
        return '✓';
      default:
        return '•';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <Avatar className="h-9 w-9">
                {activity.user.image ? (
                  <AvatarImage src={activity.user.image} alt={activity.user.name} />
                ) : (
                  <AvatarFallback>
                    {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="ml-3">
                <div className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  <span>{activity.action}</span>{' '}
                  <span className="font-medium">
                    {getTargetTypeIcon(activity.targetType)} {activity.target}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;