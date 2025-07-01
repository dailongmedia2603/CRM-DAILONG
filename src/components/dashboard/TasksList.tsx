import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee: {
    id: string;
    name: string;
    image?: string;
  };
}

interface TasksListProps {
  tasks: Task[];
  className?: string;
}

export const TasksList = ({ tasks, className }: TasksListProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start p-3 rounded-lg",
                task.completed
                  ? "bg-gray-50"
                  : "bg-white border border-gray-100",
                "hover:shadow-sm transition-all duration-200"
              )}
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                className="mt-1"
              />
              
              <div className="ml-3 flex-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "text-sm font-medium cursor-pointer",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </label>
                
                <div className="flex mt-2 items-center text-xs">
                  <Badge className={cn("rounded-full mr-2", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                  
                  <span
                    className={cn(
                      "mr-2",
                      isOverdue(task.dueDate) && !task.completed
                        ? "text-red-500 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {isOverdue(task.dueDate) && !task.completed ? "Overdue" : "Due"} {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              
              <Avatar className="h-8 w-8">
                {task.assignee.image ? (
                  <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                ) : (
                  <AvatarFallback>
                    {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksList;