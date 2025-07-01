import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  id: string;
  name: string;
  client: string;
  progress: number;
  dueDate: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  team: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
  className?: string;
}

export const ProjectCard = ({
  name,
  client,
  progress,
  dueDate,
  status,
  team,
  className,
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{client}</p>
          </div>
          <Badge className={cn("rounded-full capitalize", getStatusColor(status))}>
            {status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              {team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="border-2 border-white h-8 w-8">
                  {member.image ? (
                    <AvatarImage src={member.image} alt={member.name} />
                  ) : (
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
              {team.length > 3 && (
                <Avatar className="border-2 border-white h-8 w-8">
                  <AvatarFallback>+{team.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Due: <span className="font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;